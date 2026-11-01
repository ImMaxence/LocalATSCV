/**
 * Débuts de phrase « faibles » : ils décrivent une responsabilité au lieu d'un résultat.
 * Seul le début d'une ligne ou d'une puce est testé, pour ne pas signaler un intitulé
 * de poste comme « Responsable de projet » au milieu d'une phrase.
 */
const WEAK_OPENERS: Record<'fr' | 'en' | 'it' | 'es' | 'de', string[]> = {
  fr: [
    'en charge de',
    'en charge du',
    'en charge des',
    'chargé de',
    'chargée de',
    'responsable de la',
    'responsable du',
    'responsable des',
    'participation à',
    'participation au',
    'participation aux',
    'participé à',
    'participé au',
    'aide à',
    'aidé à',
    'travail sur',
    'travaillé sur',
    'impliqué dans',
    'impliquée dans',
    'contribution à',
  ],
  en: [
    'responsible for',
    'in charge of',
    'duties included',
    'worked on',
    'helped',
    'assisted',
    'participated in',
    'involved in',
    'tasked with',
    'was responsible',
  ],
  it: [
    'responsabile di',
    'responsabile del',
    'responsabile della',
    'incaricato di',
    'incaricata di',
    'mi sono occupato',
    'mi sono occupata',
    'ho partecipato',
    'partecipazione a',
    'ho aiutato',
    'ho lavorato su',
  ],
  es: [
    'encargado de',
    'encargada de',
    'responsable de la',
    'responsable del',
    'participé en',
    'participación en',
    'ayudé a',
    'trabajé en',
  ],
  de: [
    'zuständig für',
    'verantwortlich für',
    'mitgewirkt',
    'mitarbeit an',
    'beteiligt an',
    'unterstützung bei',
  ],
};

/** Minuscules, sans accents. Garde la même longueur qu'un texte NFC. */
export function normalizeText(text: string): string {
  return text.normalize('NFC').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

const NORMALIZED_OPENERS = Object.values(WEAK_OPENERS)
  .flat()
  .map(normalizeText)
  .sort((a, b) => b.length - a.length);

const LEADING_BULLET = /^[\s•●▪◦‣∙·■□►▸✓✔*–—-]+/;

/** Formulation faible qui ouvre la ligne, telle qu'écrite dans le texte, ou `null`. */
export function findWeakOpener(line: string): string | null {
  const text = line.normalize('NFC').replace(LEADING_BULLET, '');
  const normalized = normalizeText(text);
  const opener = NORMALIZED_OPENERS.find(
    (candidate) =>
      normalized.startsWith(candidate) && !/[a-z]/.test(normalized.charAt(candidate.length)),
  );
  return opener ? text.slice(0, opener.length) : null;
}
