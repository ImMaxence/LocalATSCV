import { CvLanguage } from './cv.model';

/**
 * Textes imprimés liés à une situation de handicap, dans la langue du CV. Chaque pays a ses
 * formulations reconnues par les recruteurs (RQTH en France, categorie protette en Italie,
 * certificado de discapacidad en Espagne, Schwerbehinderung en Allemagne).
 */
export interface DisabilityLabels {
  /** Mentions proposées en un clic, de la plus courte à la plus explicite. */
  suggestions: string[];
  /** Phrase proposée pour la lettre de motivation, positive et sans détail médical. */
  letterSentence: string;
  /** Intitulé neutre d'une interruption de parcours, sans motif à justifier. */
  careerBreak: string;
}

export const DISABILITY_LABELS: Record<CvLanguage, DisabilityLabels> = {
  fr: {
    suggestions: [
      'RQTH',
      'Reconnaissance de la qualité de travailleur handicapé (RQTH)',
      "Bénéficiaire de l'obligation d'emploi (OETH)",
    ],
    letterSentence:
      "Je bénéficie d'une reconnaissance de la qualité de travailleur handicapé (RQTH) : ma candidature peut s'inscrire dans votre politique handicap, et j'en parlerai volontiers avec vous lors d'un entretien.",
    careerBreak: 'Pause professionnelle',
  },
  en: {
    suggestions: ['Disabled applicant', 'Disability Confident applicant'],
    letterSentence:
      'I am a disabled applicant and would be happy to discuss any reasonable adjustments with you at interview.',
    careerBreak: 'Career break',
  },
  it: {
    suggestions: [
      'Categorie protette (L. 68/99)',
      'Iscritto/a alle categorie protette (L. 68/99)',
      'Invalidità civile riconosciuta',
    ],
    letterSentence:
      'Appartengo alle categorie protette (L. 68/99): la mia candidatura può rientrare nel collocamento mirato e ne parlerò volentieri durante un colloquio.',
    careerBreak: 'Pausa professionale',
  },
  es: {
    suggestions: [
      'Certificado de discapacidad',
      'Certificado de discapacidad igual o superior al 33 %',
    ],
    letterSentence:
      'Tengo reconocido un grado de discapacidad igual o superior al 33 %: mi candidatura puede computar en su cuota de reserva y lo comentaré con gusto en una entrevista.',
    careerBreak: 'Pausa profesional',
  },
  de: {
    suggestions: ['Schwerbehinderung (GdB 50)', 'Gleichstellung mit schwerbehinderten Menschen'],
    letterSentence:
      'Ich bin als schwerbehinderter Mensch anerkannt. Gerne spreche ich im Vorstellungsgespräch darüber.',
    careerBreak: 'Berufliche Auszeit',
  },
};
