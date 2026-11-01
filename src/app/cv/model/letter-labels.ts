import { CvLanguage } from './cv.model';

/**
 * Textes par défaut de la lettre de motivation, dans la langue du CV : ils s'impriment tant que
 * l'utilisateur n'a pas saisi les siens.
 */
export interface LetterLabels {
  subject: string;
  greeting: string;
  closing: string;
  /** Trame proposée dans l'éditeur : trois paragraphes à remplacer. */
  outline: string;
}

export const LETTER_LABELS: Record<CvLanguage, LetterLabels> = {
  fr: {
    subject: 'Objet :',
    greeting: 'Madame, Monsieur,',
    closing:
      "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
    outline: [
      "[Vous] Ce qui m'attire dans votre entreprise et dans ce poste : un projet, une valeur, un produit précis.",
      "[Moi] Ce que je vous apporte : deux ou trois réalisations en lien avec l'offre, avec un résultat chiffré.",
      '[Nous] Ce que nous pourrions construire ensemble, et ma disponibilité pour un entretien.',
    ].join('\n\n'),
  },
  en: {
    subject: 'Subject:',
    greeting: 'Dear Hiring Manager,',
    closing: 'Kind regards,',
    outline: [
      '[You] What draws me to your company and to this role: a specific project, value or product.',
      '[Me] What I bring: two or three achievements related to the job ad, with a measurable result.',
      '[Us] What we could build together, and my availability for an interview.',
    ].join('\n\n'),
  },
  it: {
    subject: 'Oggetto:',
    greeting: 'Gentile Responsabile della selezione,',
    closing: 'Cordiali saluti,',
    outline: [
      '[Voi] Cosa mi attira della vostra azienda e di questo ruolo: un progetto, un valore, un prodotto preciso.',
      "[Io] Cosa vi porto: due o tre risultati legati all'annuncio, con un dato misurabile.",
      '[Noi] Cosa potremmo costruire insieme e la mia disponibilità per un colloquio.',
    ].join('\n\n'),
  },
  es: {
    subject: 'Asunto:',
    greeting: 'Estimado/a responsable de selección:',
    closing: 'Atentamente,',
    outline: [
      '[Vosotros] Lo que me atrae de vuestra empresa y de este puesto: un proyecto, un valor, un producto concreto.',
      '[Yo] Lo que aporto: dos o tres logros relacionados con la oferta, con un resultado medible.',
      '[Nosotros] Lo que podríamos construir juntos y mi disponibilidad para una entrevista.',
    ].join('\n\n'),
  },
  de: {
    subject: 'Betreff:',
    greeting: 'Sehr geehrte Damen und Herren,',
    closing: 'Mit freundlichen Grüßen',
    outline: [
      '[Sie] Was mich an Ihrem Unternehmen und dieser Stelle reizt: ein konkretes Projekt, ein Wert, ein Produkt.',
      '[Ich] Was ich mitbringe: zwei oder drei Erfolge passend zur Anzeige, mit einem messbaren Ergebnis.',
      '[Wir] Was wir gemeinsam erreichen könnten, und meine Verfügbarkeit für ein Gespräch.',
    ].join('\n\n'),
  },
};

/** « Lyon, le 1 novembre 2026 » (date du jour si `iso` est vide), selon les usages de chaque langue. */
export function letterDateLine(place: string, iso: string, language: CvLanguage): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const date = match
    ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
    : new Date();
  const formatted = new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: match ? 'UTC' : undefined,
  }).format(date);
  if (!place.trim()) return formatted;
  return language === 'fr' ? `${place.trim()}, le ${formatted}` : `${place.trim()}, ${formatted}`;
}
