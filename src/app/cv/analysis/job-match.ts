import { CvSection, Entry, MasterCv, isEntrySection } from '../model/cv.model';
import { ResolvedCv } from '../model/resolve-cv';
import { JOB_TERMS, STOPWORDS } from './job-dictionary';
import { normalizeText } from './weak-phrases';

export interface JobKeyword {
  /** Forme normalisée (minuscules, sans accents), clé de comparaison. */
  key: string;
  /** Forme affichée, telle qu'écrite dans l'annonce ou dans le dictionnaire. */
  label: string;
  weight: number;
  /** Variantes reconnues dans le CV (synonymes du dictionnaire). */
  variants: string[];
}

export interface JobMatch {
  score: number;
  found: JobKeyword[];
  missing: JobKeyword[];
}

const MAX_KEYWORDS = 24;
const TOKEN = /[\p{L}\p{N}][\p{L}\p{N}+#./'’-]*[\p{L}\p{N}+#]|[\p{L}\p{N}]/gu;
const ESCAPE = /[.*+?^${}()|[\]\\/]/g;

const DICTIONARY = JOB_TERMS.map(([label, ...aliases]) => ({
  label,
  variants: [label, ...aliases].map(normalizeText),
}));

function phrasePattern(variant: string): RegExp {
  const escaped = variant.replace(ESCAPE, (char) => '\\' + char);
  // Pluriel simple toléré sur le dernier mot (« compétence » ~ « compétences »).
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?:s|es|x)?(?![\\p{L}\\p{N}])`, 'gu');
}

const countIn = (text: string, variant: string): number =>
  text.match(phrasePattern(variant))?.length ?? 0;

/**
 * Mots-clés d'une annonce : termes du dictionnaire présents (compétences, outils, langues),
 * puis termes propres à l'annonce répétés ou techniques (SAP, ISO 9001, C#…).
 */
export function extractKeywords(adText: string): JobKeyword[] {
  const normalized = normalizeText(adText);
  const keywords = new Map<string, JobKeyword>();
  const covered = new Set<string>();

  for (const term of DICTIONARY) {
    const count = term.variants.reduce((sum, variant) => sum + countIn(normalized, variant), 0);
    if (count === 0) continue;
    keywords.set(term.variants[0], {
      key: term.variants[0],
      label: term.label,
      weight: 3 + Math.min(count, 5),
      variants: term.variants,
    });
    term.variants.forEach((variant) => variant.split(' ').forEach((word) => covered.add(word)));
  }

  const originals = adText.normalize('NFC').match(TOKEN) ?? [];
  const tokens = originals.map(normalizeText);
  const counts = new Map<string, { count: number; label: string; technical: boolean }>();
  const bump = (key: string, label: string, technical: boolean) => {
    const entry = counts.get(key) ?? { count: 0, label, technical: false };
    entry.count++;
    entry.technical ||= technical;
    counts.set(key, entry);
  };
  const useful = (token: string) =>
    token.length >= 3 && !STOPWORDS.has(token) && !/^\d+$/.test(token) && !covered.has(token);

  tokens.forEach((token, i) => {
    if (!useful(token)) return;
    // Sigle, mot à majuscules internes, chiffres ou symboles : terme probablement technique.
    const technical = /[A-Z].*[A-Z]|\d|[#+]/.test(originals[i]) && originals[i].length <= 20;
    bump(token, originals[i], technical);
    const next = tokens[i + 1];
    if (next && useful(next))
      bump(`${token} ${next}`, `${originals[i]} ${originals[i + 1]}`, false);
  });

  for (const [key, { count, label, technical }] of counts) {
    if (keywords.has(key) || (count < 2 && !technical)) continue;
    keywords.set(key, {
      key,
      label,
      weight: count + (technical ? 2 : 0) + (key.includes(' ') ? 1 : 0),
      variants: [key],
    });
  }

  // Un mot seul déjà couvert par une expression aussi fréquente fait doublon.
  const phrases = [...keywords.values()].filter((keyword) => keyword.key.includes(' '));
  for (const keyword of keywords.values()) {
    if (keyword.key.includes(' ')) continue;
    if (
      phrases.some(
        (phrase) => phrase.key.split(' ').includes(keyword.key) && phrase.weight >= keyword.weight,
      )
    ) {
      keywords.delete(keyword.key);
    }
  }

  return [...keywords.values()].sort((a, b) => b.weight - a.weight).slice(0, MAX_KEYWORDS);
}

function entryText(entry: Entry): string {
  return [entry.title, entry.subtitle, entry.location, ...entry.bullets.map((b) => b.text)].join(
    ' ',
  );
}

function sectionText(section: CvSection): string {
  if (isEntrySection(section)) return section.items.map(entryText).join(' ');
  return section.items.map((item) => Object.values(item).join(' ')).join(' ');
}

/** Tout le texte d'un CV, tel qu'un ATS le compare à l'annonce. */
export function cvText(cv: Pick<ResolvedCv, 'profile' | 'sections'>): string {
  const { profile } = cv;
  return [
    profile.title,
    profile.summary,
    ...cv.sections.flatMap((s) => [s.title, sectionText(s)]),
  ].join('\n');
}

export function containsKeyword(text: string, keyword: JobKeyword): boolean {
  const normalized = normalizeText(text);
  return keyword.variants.some((variant) => countIn(normalized, variant) > 0);
}

export function matchCv(
  cv: Pick<ResolvedCv, 'profile' | 'sections'>,
  keywords: JobKeyword[],
): JobMatch {
  const text = cvText(cv);
  const found = keywords.filter((keyword) => containsKeyword(text, keyword));
  const missing = keywords.filter((keyword) => !found.includes(keyword));
  const total = keywords.reduce((sum, keyword) => sum + keyword.weight, 0);
  const matched = found.reduce((sum, keyword) => sum + keyword.weight, 0);
  return { score: total ? Math.round((matched / total) * 100) : 0, found, missing };
}

const TARGETED_KINDS = new Set(['experience', 'projects', 'custom']);

/**
 * Éléments à masquer pour une version ciblée : expériences et puces sans aucun mot-clé
 * de l'annonce. Garde-fous : au moins deux entrées par section et deux puces par entrée.
 */
export function hiddenIdsForJob(cv: MasterCv, keywords: JobKeyword[]): string[] {
  const relevance = (text: string) =>
    keywords.filter((keyword) => containsKeyword(text, keyword)).length;
  const hidden: string[] = [];

  for (const section of cv.sections) {
    if (!isEntrySection(section) || !TARGETED_KINDS.has(section.kind)) continue;
    const scored = section.items.map((entry, index) => ({
      entry,
      index,
      score: relevance(entryText(entry)),
    }));
    const keep = new Set(
      [...scored]
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .filter((item, rank) => item.score > 0 || rank < 2)
        .map((item) => item.entry.id),
    );
    for (const { entry } of scored) {
      if (!keep.has(entry.id)) {
        hidden.push(entry.id);
        continue;
      }
      const bullets = entry.bullets.map((bullet) => ({
        id: bullet.id,
        score: relevance(bullet.text),
      }));
      const relevant = bullets.filter((bullet) => bullet.score > 0).length;
      if (relevant >= 2)
        hidden.push(...bullets.filter((bullet) => bullet.score === 0).map((b) => b.id));
    }
  }
  return hidden;
}

/** Titre court tiré de l'annonce (première ligne utile), pour nommer la version ciblée. */
export function suggestVersionName(adText: string): string {
  const line = adText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.length >= 3 && l.length <= 90 && !/^https?:/i.test(l));
  return (line ?? '').slice(0, 60);
}
