import { buildLines } from '../analysis/cv-analyzer';
import { ExtractedPdf, PdfTextItem } from '../analysis/pdf-text';
import { normalizeText } from '../analysis/weak-phrases';
import {
  CvLanguage,
  CvSection,
  Entry,
  EntryKind,
  MasterCv,
  Profile,
  createEmptyCv,
  newId,
} from '../model/cv.model';

export interface ImportResult {
  cv: MasterCv;
  /** Nombre d'éléments repris (entrées, compétences, langues…). */
  items: number;
  linkedin: boolean;
}

type HeadingKind = EntryKind | 'summary' | 'skills' | 'languages' | 'interests' | 'contact';

/** Titres de sections reconnus (minuscules, sans accents), dans les 5 langues. */
const HEADINGS: [HeadingKind, string[]][] = [
  [
    'summary',
    [
      'profil',
      'resume',
      'summary',
      'about',
      'about me',
      'a propos',
      'profile',
      'profilo',
      'sommario',
      'riepilogo',
      'perfil',
      'resumen',
      'sobre mi',
      'extracto',
      'uber mich',
      'zusammenfassung',
      'kurzprofil',
    ],
  ],
  [
    'experience',
    [
      'experience',
      'experiences',
      'experience professionnelle',
      'experiences professionnelles',
      'parcours professionnel',
      'professional experience',
      'work experience',
      'employment history',
      'work history',
      'esperienza',
      'esperienze',
      'esperienza professionale',
      'esperienze professionali',
      'esperienza lavorativa',
      'experiencia',
      'experiencia profesional',
      'experiencia laboral',
      'berufserfahrung',
      'beruflicher werdegang',
      'werdegang',
    ],
  ],
  [
    'education',
    [
      'formation',
      'formations',
      'education',
      'diplomes',
      'etudes',
      'cursus',
      'formazione',
      'istruzione',
      'formacion',
      'educacion',
      'estudios',
      'ausbildung',
      'bildung',
      'bildungsweg',
      'studium',
    ],
  ],
  [
    'skills',
    [
      'competences',
      'competences techniques',
      'skills',
      'technical skills',
      'top skills',
      'principales competences',
      'core skills',
      'competenze',
      'competenze principali',
      'competencias',
      'aptitudes principales',
      'habilidades',
      'kenntnisse',
      'top kenntnisse',
      'kompetenzen',
      'fahigkeiten',
    ],
  ],
  ['languages', ['langues', 'languages', 'lingue', 'idiomas', 'sprachen', 'sprachkenntnisse']],
  [
    'certifications',
    [
      'certifications',
      'certificats',
      'licenses certifications',
      'licences et certifications',
      'certificazioni',
      'certificaciones',
      'zertifikate',
      'zertifizierungen',
      'bescheinigungen',
    ],
  ],
  ['projects', ['projets', 'projects', 'progetti', 'proyectos', 'projekte']],
  [
    'interests',
    [
      'centres d interet',
      'loisirs',
      'interets',
      'interests',
      'hobbies',
      'interessi',
      'intereses',
      'aficiones',
      'hobbys',
      'interessen',
    ],
  ],
  ['contact', ['contact', 'coordonnees', 'contatti', 'contacto', 'kontakt', 'kontaktdaten']],
  [
    'custom',
    [
      'benevolat',
      'volunteering',
      'volunteer experience',
      'honors awards',
      'prix',
      'distinctions',
      'publications',
      'volontariato',
      'voluntariado',
      'ehrenamt',
      'auszeichnungen',
    ],
  ],
];

const MONTHS: Record<string, number> = Object.fromEntries(
  (
    [
      [1, 'janvier janv jan january gennaio gen enero ene januar janner'],
      [2, 'fevrier fevr fev feb february febbraio febrero februar'],
      [3, 'mars mar march marzo marz'],
      [4, 'avril avr apr april aprile abril abr'],
      [5, 'mai may maggio mag mayo'],
      [6, 'juin jun june giugno giu junio juni'],
      [7, 'juillet juil jul july luglio lug julio juli'],
      [8, 'aout aug august agosto ago'],
      [9, 'septembre sept sep september settembre set septiembre'],
      [10, 'octobre oct october ottobre ott octubre oktober okt'],
      [11, 'novembre nov november noviembre'],
      [12, 'decembre dec december dicembre dic diciembre dezember dez'],
    ] as [number, string][]
  ).flatMap(([month, names]) => names.split(' ').map((name) => [name, month])),
);

const DATE_PART = '(?:(\\d{1,2})[/.-])?(?:(?<![\\p{L}])([\\p{L}]{3,9})\\.?\\s+)?((?:19|20)\\d{2})';
const PRESENT =
  '(present|aujourd\\W?hui|actuel(?:lement)?|en cours|now|current|oggi|presente|attuale|actualidad|actual|hoy|heute|aktuell|derzeit)';
const DATE_RANGE = new RegExp(
  `${DATE_PART}(?:\\s*(?:-|–|—|à|a|au|to|until|bis|al)\\s*(?:${DATE_PART}|${PRESENT}))?`,
  'iu',
);
/** Durée entre parenthèses (« (4 ans 10 mois) »), retirée des lignes de dates. */
const DURATION = /\(\s*\d+[^)]*\)/gu;
/** Ligne de durée seule, que LinkedIn écrit sous le nom d'une entreprise. */
const DURATION_LINE =
  /^\d+\s*(ans?|years?|yrs?|mois|months?|anni|mesi|años|meses|jahre?|monate?)\b[\p{L}\d\s]*$/iu;
const BULLET = /^[•●▪◦‣∙·■□►▸✓✔*–—-]\s*/;
const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/;
const PHONE = /(?:\+|00)?\d[\d .\-()/]{7,}\d/g;
const URL = /(?:https?:\/\/)?(?:www\.)?[\w-]+(?:\.[\w-]+)+\/[\w\-./%?=&#]+|(?:https?:\/\/)\S+/gi;
const LOCATION_HINT =
  /\b(france|belgique|suisse|canada|italia|espana|deutschland|remote|teletravail|hybride|paris|lyon|marseille|lille|toulouse|bordeaux|nantes|london|berlin|madrid|milano|roma)\b/i;
const PAGE_FOOTER = /^(page|pagina|seite|pagina)\s+\d+\s+(of|sur|de|di|von)\s+\d+$/i;

const STOPWORDS: Record<CvLanguage, string[]> = {
  fr: ['le', 'la', 'les', 'des', 'et', 'pour', 'dans', 'avec', 'une', 'du', 'sur'],
  en: ['the', 'and', 'for', 'with', 'of', 'in', 'to', 'on', 'my', 'at'],
  it: ['il', 'della', 'per', 'con', 'una', 'nel', 'dei', 'gli', 'delle', 'sono'],
  es: ['el', 'los', 'para', 'con', 'una', 'del', 'las', 'por', 'en', 'como'],
  de: ['der', 'die', 'und', 'für', 'mit', 'von', 'den', 'das', 'im', 'zu'],
};

interface DateRange {
  start: string;
  end: string;
  current: boolean;
  /** Position du texte de la date dans la ligne, pour l'en retirer. */
  index: number;
  length: number;
}

function toDate(month: string | undefined, name: string | undefined, year: string): string {
  const fromName = name ? MONTHS[normalizeText(name).replace(/\.$/, '')] : undefined;
  const value = fromName ?? (month ? Number(month) : undefined);
  return value && value >= 1 && value <= 12 ? `${year}-${String(value).padStart(2, '0')}` : year;
}

export function findDateRange(line: string): DateRange | null {
  const match = DATE_RANGE.exec(line);
  if (!match) return null;
  const [text, m1, n1, y1, m2, n2, y2, present] = match;
  // Un mot qui n'est pas un mois (« depuis 2019 ») ne fait pas partie de la date.
  let index = match.index;
  let length = text.length;
  if (n1 && !MONTHS[normalizeText(n1)] && !m1) {
    const offset = text.indexOf(y1);
    index += offset;
    length -= offset;
  }
  return {
    start: toDate(m1, n1, y1),
    end: y2 ? toDate(m2, n2, y2) : '',
    current: Boolean(present),
    index,
    length,
  };
}

/** Mots qui suffisent à identifier un titre composé (« Diplômes et formations »). */
const HEADING_WORDS: [HeadingKind, string[]][] = [
  [
    'experience',
    [
      'experience',
      'experiences',
      'esperienza',
      'esperienze',
      'experiencia',
      'berufserfahrung',
      'werdegang',
      'parcours',
    ],
  ],
  [
    'education',
    [
      'formation',
      'formations',
      'education',
      'diplome',
      'diplomes',
      'etudes',
      'formazione',
      'istruzione',
      'formacion',
      'educacion',
      'estudios',
      'ausbildung',
      'bildung',
      'studium',
    ],
  ],
  ['skills', ['competences', 'skills', 'competenze', 'competencias', 'kenntnisse', 'kompetenzen']],
  ['languages', ['langues', 'languages', 'lingue', 'idiomas', 'sprachen']],
  [
    'certifications',
    ['certifications', 'certificats', 'certificazioni', 'certificaciones', 'zertifikate'],
  ],
  ['projects', ['projets', 'projects', 'progetti', 'proyectos', 'projekte']],
  [
    'interests',
    [
      'loisirs',
      'interets',
      'interests',
      'hobbies',
      'interessi',
      'intereses',
      'hobbys',
      'interessen',
    ],
  ],
];

/**
 * Titre de section : correspondance exacte avec un titre connu, ou titre composé court
 * contenant un mot-clé, à condition d'avoir l'allure d'un titre (court, en capitales ou plus grand).
 */
function headingKind(text: string, size = 0, bodySize = 0): HeadingKind | null {
  const words = text.trim().split(/\s+/);
  if (words.length > 5 || text.length > 45) return null;
  const key = normalizeText(text)
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!key) return null;
  for (const [kind, candidates] of HEADINGS) {
    if (candidates.some((candidate) => key === candidate || key === `${candidate}s`)) return kind;
  }
  const looksLikeHeading =
    words.length <= 3 ||
    text === text.toLocaleUpperCase() ||
    (bodySize > 0 && size > bodySize * 1.1);
  if (!looksLikeHeading) return null;
  const keyWords = key.split(' ');
  for (const [kind, candidates] of HEADING_WORDS) {
    if (keyWords.some((word) => candidates.includes(word))) return kind;
  }
  return null;
}

interface SourceLine {
  text: string;
  size: number;
}

const chars = (items: PdfTextItem[]) => items.reduce((sum, item) => sum + item.text.length, 0);

/**
 * Gouttière verticale entre deux colonnes : une abscisse qu'aucun fragment de texte ne traverse,
 * avec assez de texte de chaque côté. Un CV à une colonne n'en a pas : ses lignes la traversent.
 */
function findGutter(page: ExtractedPdf['pages'][number]): number | null {
  const items = page.items.filter((item) => item.text.trim().length >= 2);
  const total = chars(items);
  for (let x = page.width * 0.2; x <= page.width * 0.55; x += 2) {
    const crossing = items.filter((item) => item.x < x - 1 && item.x + item.width > x + 1).length;
    if (crossing > Math.max(1, items.length * 0.03)) continue;
    const left = items.filter((item) => item.x + item.width <= x + 1);
    const right = items.filter((item) => item.x >= x - 1);
    if (
      left.length >= 6 &&
      right.length >= 6 &&
      Math.min(chars(left), chars(right)) >= total * 0.12
    ) {
      return x;
    }
  }
  return null;
}

/**
 * Lignes de lecture. Si le PDF a deux colonnes, chacune est lue séparément :
 * la principale (la plus fournie) d'abord, puis la latérale.
 */
function readingLines(pdf: ExtractedPdf): SourceLine[] {
  const main: SourceLine[] = [];
  const side: SourceLine[] = [];
  const toLines = (items: PdfTextItem[], width: number, height: number) =>
    buildLines({ pages: [{ width, height, items }] }).map((line) => ({
      text: line.text,
      size: Math.max(...line.items.map((item) => item.height)),
    }));

  for (const page of pdf.pages) {
    const gutter = findGutter(page);
    if (gutter === null) {
      main.push(...toLines(page.items, page.width, page.height));
      continue;
    }
    const left = page.items.filter((item) => item.x < gutter);
    const right = page.items.filter((item) => item.x >= gutter);
    // Marge de dates alignée ligne à ligne avec le contenu : ce n'est pas une colonne
    // indépendante, la lecture par lignes la garde à côté de l'entrée qu'elle date.
    const rightLines = buildLines({ pages: [{ ...page, items: right }] });
    const leftLines = buildLines({ pages: [{ ...page, items: left }] });
    const aligned = leftLines.filter((line) =>
      rightLines.some((other) => Math.abs(other.y - line.y) <= 1.5),
    ).length;
    if (aligned >= leftLines.length * 0.5) {
      main.push(...toLines(page.items, page.width, page.height));
      continue;
    }
    const [primary, secondary] = chars(right) >= chars(left) ? [right, left] : [left, right];
    main.push(...toLines(primary, page.width, page.height));
    side.push(...toLines(secondary, page.width, page.height));
  }
  return [...main, ...side].filter((line) => line.text && !PAGE_FOOTER.test(line.text.trim()));
}

const isContactLike = (text: string) =>
  EMAIL.test(text) ||
  (text.match(PHONE) ?? []).some((m) => m.replace(/\D/g, '').length >= 9) ||
  /linkedin\.com|https?:\/\/|www\./i.test(text);
/** Lieu : « Lyon, Auvergne-Rhône-Alpes, France », « Grenoble, France », « Remote »… */
const isLocation = (text: string) =>
  text.split(/\s+/).length <= 7 &&
  !/\d{4}/.test(text) &&
  (LOCATION_HINT.test(normalizeText(text)) || (text.match(/,/g)?.length ?? 0) >= 2);
/** Morceau de phrase (ponctuation finale ou ligne longue) : de la description, pas un intitulé. */
const looksLikeSentence = (text: string) =>
  /[,.;:]$/.test(text.trim()) || text.split(/\s+/).length >= 8;

function blankEntry(): Entry {
  return {
    id: newId(),
    title: '',
    subtitle: '',
    location: '',
    start: '',
    end: '',
    current: false,
    url: '',
    bullets: [],
  };
}

/** Découpe les lignes d'une section en entrées (poste, diplôme…) à partir des dates et des puces. */
export function parseEntries(lines: string[]): Entry[] {
  const entries: Entry[] = [];
  let current: Entry | null = null;
  let hasBody = false;
  const begin = (): Entry => {
    const entry = blankEntry();
    entries.push(entry);
    hasBody = false;
    return entry;
  };
  const addText = (entry: Entry, text: string) => {
    const last = entry.bullets.at(-1);
    if (last && hasBody && (/^\p{Ll}/u.test(text) || /[,;:\-–]$/.test(last.text)))
      last.text += ` ${text}`;
    else entry.bullets.push({ id: newId(), text });
    hasBody = true;
  };

  for (const raw of lines) {
    const isBullet = BULLET.test(raw);
    let text = raw.replace(BULLET, '').trim();
    if (!text || (!isBullet && DURATION_LINE.test(text) && text.split(/\s+/).length <= 5)) continue;

    if (isBullet) {
      current ??= begin();
      current.bullets.push({ id: newId(), text });
      hasBody = true;
      continue;
    }

    const date = findDateRange(text);
    if (date) {
      if (!current || current.start || hasBody) current = begin();
      current.start = date.start;
      current.end = date.end;
      current.current = date.current;
      text = (text.slice(0, date.index) + ' ' + text.slice(date.index + date.length))
        .replace(DURATION, '')
        .replace(/\(\s*\)/g, '')
        .replace(/^[\s,·|–—-]+|[\s,·|–—-]+$/g, '')
        .trim();
      if (!text) continue;
    }

    if (!current) {
      current = begin();
      current.title = text;
    } else if (hasBody) {
      const lastText = current.bullets.at(-1)?.text ?? '';
      if (/^\p{Ll}/u.test(text) || /[,;:\-–]$/.test(lastText) || text.split(/\s+/).length >= 8)
        addText(current, text);
      else {
        current = begin();
        current.title = text;
      }
    } else if (!current.title) current.title = text;
    else if (looksLikeSentence(text)) addText(current, text);
    else if (!current.subtitle && !isLocation(text)) current.subtitle = text;
    else if (!current.location && isLocation(text)) current.location = text;
    else addText(current, text);
  }
  return entries.filter((entry) => entry.title || entry.bullets.length);
}

function detectLanguage(text: string): CvLanguage {
  const words = normalizeText(text).split(/[^a-z]+/);
  const scores = (Object.keys(STOPWORDS) as CvLanguage[]).map((lang) => {
    const set = new Set(STOPWORDS[lang].map(normalizeText));
    return [lang, words.filter((word) => set.has(word)).length] as const;
  });
  return scores.sort((a, b) => b[1] - a[1])[0][1] > 0 ? scores[0][0] : 'fr';
}

function splitName(name: string): Pick<Profile, 'firstName' | 'lastName'> {
  const words = name.trim().split(/\s+/);
  if (words.length < 2) return { firstName: name.trim(), lastName: '' };
  const upper = words.filter(
    (word) => word.length > 1 && word === word.toLocaleUpperCase() && /\p{L}/u.test(word),
  );
  if (upper.length && upper.length < words.length) {
    return {
      firstName: words.filter((w) => !upper.includes(w)).join(' '),
      lastName: upper.join(' '),
    };
  }
  return { firstName: words.slice(0, -1).join(' '), lastName: words.at(-1)! };
}

const splitList = (lines: string[]) =>
  lines
    .flatMap((line) => line.replace(BULLET, '').split(/[,;•·|]/))
    .map((item) => item.trim())
    .filter(Boolean);

/**
 * Transforme le texte d'un CV PDF (créé avec n'importe quel outil, ou exporté depuis LinkedIn)
 * en Master CV éditable. L'import est indicatif : l'utilisateur relit chaque section.
 */
export function importCv(pdf: ExtractedPdf, fallbackName: string): ImportResult {
  const lines = readingLines(pdf);
  const fullText = lines.map((line) => line.text).join('\n');
  const linkedin =
    /linkedin\.com\/in\//i.test(fullText) &&
    lines.some((line) =>
      /^(top skills|principales compétences|competenze principali|aptitudes principales|top-kenntnisse)$/i.test(
        line.text.trim(),
      ),
    );

  // 1. Découpage en en-tête + sections
  const blocks: { kind: HeadingKind | 'header'; title: string; lines: string[] }[] = [
    { kind: 'header', title: '', lines: [] },
  ];
  const headerSizes: SourceLine[] = [];
  // Taille de texte la plus courante : un titre de section est plus grand.
  const sizes = lines.map((line) => Math.round(line.size)).sort((a, b) => a - b);
  const bodySize = sizes[Math.floor(sizes.length / 2)] ?? 0;
  for (const line of lines) {
    const kind = headingKind(line.text, line.size, bodySize);
    if (kind) blocks.push({ kind, title: line.text.trim(), lines: [] });
    else {
      blocks.at(-1)!.lines.push(line.text);
      if (blocks.length === 1) headerSizes.push(line);
    }
  }

  // 2. Identité
  const header = headerSizes.filter((line) => !isContactLike(line.text));
  const nameLine = [...header].sort((a, b) => b.size - a.size)[0];
  const rest = header.filter((line) => line !== nameLine);
  const titleLine = rest.find(
    (line) => !isLocation(line.text) && line.text.split(/\s+/).length <= 14,
  );
  const locationLine = rest.find((line) => line !== titleLine && isLocation(line.text));

  const emails = fullText.match(EMAIL);
  const phone = (fullText.match(PHONE) ?? []).find((m) => m.replace(/\D/g, '').length >= 9);
  const urls = [
    ...new Set(
      (fullText.match(URL) ?? []).map((url) => url.replace(/\s*\(.*$/, '').replace(/[.,)]+$/, '')),
    ),
  ].filter((url) => !EMAIL.test(url));

  const language = detectLanguage(fullText);
  const cv = createEmptyCv(nameLine?.text.trim() || fallbackName, language);
  cv.profile = {
    ...cv.profile,
    ...splitName(nameLine?.text ?? ''),
    title: titleLine?.text.trim() ?? '',
    location: locationLine?.text.trim() ?? '',
    email: emails?.[0] ?? '',
    phone: phone?.trim() ?? '',
    links: urls.slice(0, 4).map((url) => ({
      id: newId(),
      label: /linkedin/i.test(url) ? 'LinkedIn' : /github/i.test(url) ? 'GitHub' : '',
      url,
    })),
  };

  // 3. Sections
  const sections: CvSection[] = [];
  const summary: string[] = [];
  for (const block of blocks.slice(1)) {
    const content = block.lines.map((l) => l.trim()).filter(Boolean);
    if (!content.length || block.kind === 'contact') continue;
    switch (block.kind) {
      case 'summary':
        summary.push(content.join(' '));
        break;
      case 'skills': {
        const labelled = content.filter((line) =>
          /^[^:]{2,40}:\s*\S/.test(line.replace(BULLET, '')),
        );
        const loose = content.filter((line) => !labelled.includes(line));
        const items = labelled.map((line) => {
          const [label, ...keywords] = line.replace(BULLET, '').split(':');
          return { id: newId(), label: label.trim(), keywords: keywords.join(':').trim() };
        });
        if (loose.length)
          items.push({ id: newId(), label: '', keywords: splitList(loose).join(', ') });
        sections.push({ id: newId(), kind: 'skills', title: '', items });
        break;
      }
      case 'languages': {
        const items = splitList(content).map((item) => {
          const match = /^(.+?)\s*(?:[:(–—]|\s-\s)\s*(.+?)\)?$/.exec(item);
          return {
            id: newId(),
            name: (match?.[1] ?? item).trim(),
            level: (match?.[2] ?? '').trim(),
          };
        });
        sections.push({ id: newId(), kind: 'languages', title: '', items });
        break;
      }
      case 'interests':
        sections.push({
          id: newId(),
          kind: 'interests',
          title: '',
          items: splitList(content).map((label) => ({ id: newId(), label })),
        });
        break;
      default: {
        const kind = block.kind as EntryKind;
        let items = parseEntries(content);
        // LinkedIn écrit l'entreprise avant l'intitulé du poste.
        if (linkedin && kind === 'experience') {
          items = items.map((entry) =>
            entry.subtitle ? { ...entry, title: entry.subtitle, subtitle: entry.title } : entry,
          );
        }
        sections.push({ id: newId(), kind, title: kind === 'custom' ? block.title : '', items });
      }
    }
  }
  cv.profile.summary = summary.join('\n\n');

  // Ordre habituel : expérience et formation d'abord.
  const order: CvSection['kind'][] = [
    'experience',
    'education',
    'projects',
    'certifications',
    'custom',
    'skills',
    'languages',
    'interests',
  ];
  cv.sections = sections
    .filter((s) => s.items.length)
    .sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));

  const items = cv.sections.reduce((sum, section) => sum + section.items.length, 0);
  return { cv, items, linkedin };
}
