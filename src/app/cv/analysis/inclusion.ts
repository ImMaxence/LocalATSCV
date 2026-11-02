import { normalizeText } from './weak-phrases';

/**
 * Motifs médicaux d'une interruption de parcours. Un CV n'a pas à les donner : l'éditeur
 * propose un intitulé neutre (« Pause professionnelle »). Expressions d'arrêt de travail
 * seulement : « hospitalisation » ou « dépression » signaleraient à tort une infirmière ou un
 * psychologue qui décrit son métier.
 */
const HEALTH_PHRASES = [
  // fr
  'arret maladie',
  'arret de travail',
  'conge maladie',
  'conge longue maladie',
  'conge de longue maladie',
  'longue maladie',
  'burn-out',
  'burn out',
  'burnout',
  // en
  'sick leave',
  'medical leave',
  'disability leave',
  // it
  'congedo per malattia',
  'aspettativa per malattia',
  'in malattia',
  // es
  'baja medica',
  'baja por enfermedad',
  'incapacidad temporal',
  // de
  'krankheitsbedingt',
  'krankheitsbedingte',
  'krankheitsbedingter',
  'krankschreibung',
  'krankgeschrieben',
]
  .map(normalizeText)
  .sort((a, b) => b.length - a.length);

const LETTER = /\p{L}/u;

/** Premier motif médical du texte, tel qu'il y est écrit, ou `null`. */
export function findHealthMention(text: string): string | null {
  const source = text.normalize('NFC');
  const normalized = normalizeText(source);
  for (const phrase of HEALTH_PHRASES) {
    let index = normalized.indexOf(phrase);
    while (index >= 0) {
      const before = normalized.charAt(index - 1);
      const after = normalized.charAt(index + phrase.length);
      if (!LETTER.test(before) && !LETTER.test(after)) {
        return source.slice(index, index + phrase.length);
      }
      index = normalized.indexOf(phrase, index + 1);
    }
  }
  return null;
}

/**
 * Formules d'une annonce qui dit accueillir les candidats en situation de handicap, dans les
 * cinq langues de CV : le candidat peut alors choisir de mentionner sa reconnaissance.
 */
const INCLUSIVE_AD = [
  /\brqth\b/,
  /\boeth\b/,
  /handi[- ]?accueillant/,
  /situation de handicap/,
  /travailleurs? handicapes?/,
  /\bhandicap\b/,
  /disability confident/,
  /reasonable adjustments?/,
  /applicants? with (a )?disabilit/,
  /disabled (applicants|candidates|people)/,
  /categorie protette/,
  /\bl\.? ?68\/99\b/,
  /collocamento mirato/,
  /certificado de discapacidad/,
  /personas con discapacidad/,
  /\bdiscapacidad\b/,
  /schwerbehindert/,
  /gleichgestellt/,
  /menschen mit behinderung/,
];

export function mentionsDisabilityInclusion(adText: string): boolean {
  const text = normalizeText(adText);
  return INCLUSIVE_AD.some((pattern) => pattern.test(text));
}
