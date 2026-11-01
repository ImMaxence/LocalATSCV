import { CvLanguage, SectionKind } from './cv.model';

/**
 * Libellés imprimés sur le CV, dans la langue du CV (indépendante de la langue de l'interface).
 * Titres de sections standards : ce sont ceux que les ATS savent reconnaître.
 */
export interface CvLabels {
  sections: Record<SectionKind | 'summary', string>;
  present: string;
  birthDate: string;
  nationality: string;
}

export const CV_LABELS: Record<CvLanguage, CvLabels> = {
  fr: {
    sections: {
      summary: 'Profil',
      experience: 'Expérience professionnelle',
      education: 'Formation',
      projects: 'Projets',
      certifications: 'Certifications',
      custom: 'Autres informations',
      skills: 'Compétences',
      languages: 'Langues',
      interests: "Centres d'intérêt",
    },
    present: 'aujourd’hui',
    birthDate: 'Date de naissance',
    nationality: 'Nationalité',
  },
  en: {
    sections: {
      summary: 'Summary',
      experience: 'Professional Experience',
      education: 'Education',
      projects: 'Projects',
      certifications: 'Certifications',
      custom: 'Additional Information',
      skills: 'Skills',
      languages: 'Languages',
      interests: 'Interests',
    },
    present: 'Present',
    birthDate: 'Date of birth',
    nationality: 'Nationality',
  },
  it: {
    sections: {
      summary: 'Profilo',
      experience: 'Esperienza professionale',
      education: 'Formazione',
      projects: 'Progetti',
      certifications: 'Certificazioni',
      custom: 'Altre informazioni',
      skills: 'Competenze',
      languages: 'Lingue',
      interests: 'Interessi',
    },
    present: 'oggi',
    birthDate: 'Data di nascita',
    nationality: 'Nazionalità',
  },
  es: {
    sections: {
      summary: 'Perfil',
      experience: 'Experiencia profesional',
      education: 'Formación',
      projects: 'Proyectos',
      certifications: 'Certificaciones',
      custom: 'Otros datos',
      skills: 'Competencias',
      languages: 'Idiomas',
      interests: 'Intereses',
    },
    present: 'actualidad',
    birthDate: 'Fecha de nacimiento',
    nationality: 'Nacionalidad',
  },
  de: {
    sections: {
      summary: 'Profil',
      experience: 'Berufserfahrung',
      education: 'Ausbildung',
      projects: 'Projekte',
      certifications: 'Zertifikate',
      custom: 'Weitere Angaben',
      skills: 'Kenntnisse',
      languages: 'Sprachen',
      interests: 'Interessen',
    },
    present: 'heute',
    birthDate: 'Geburtsdatum',
    nationality: 'Staatsangehörigkeit',
  },
};

/** Le français met une espace avant les deux-points, pas les autres langues. */
export function labelSeparator(language: CvLanguage): string {
  return language === 'fr' ? ' : ' : ': ';
}

const capitalize = (text: string): string => text.charAt(0).toLocaleUpperCase() + text.slice(1);

/** `2022` → `2022` ; `2022-03` → `Mars 2022` / `Mar 2022` selon la langue. */
export function formatCvDate(value: string, language: CvLanguage): string {
  const match = /^(\d{4})(?:-(\d{2}))?$/.exec(value.trim());
  if (!match) return value.trim();
  const [, year, month] = match;
  if (!month) return year;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  const formatted = new Intl.DateTimeFormat(language, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
  return capitalize(formatted);
}

export function formatDateRange(
  start: string,
  end: string,
  current: boolean,
  language: CvLanguage,
): string {
  const from = formatCvDate(start, language);
  const to = current ? CV_LABELS[language].present : formatCvDate(end, language);
  if (from && to) return from === to ? from : `${from} – ${to}`;
  return from || to;
}

export function formatBirthDate(iso: string, language: CvLanguage): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat(language, { dateStyle: 'long', timeZone: 'UTC' }).format(date);
}
