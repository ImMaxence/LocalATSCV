import { UiLanguage } from '../../core/i18n/language.service';

/** Morceau de texte de la démo ; `kind` détermine le surlignage appliqué. */
export interface DemoSegment {
  text: string;
  kind?: 'keyword' | 'weak' | 'noise';
}

export interface LandingDemo {
  cv: {
    name: string;
    role: string;
    contact: string;
    experienceTitle: string;
    jobTitle: string;
    jobMeta: string;
    bullets: DemoSegment[][];
    weakLabel: string;
    weakReplacement: string;
    skillsTitle: string;
    skills: string;
  };
  score: {
    value: number;
    label: string;
    keywords: { label: string; found: boolean }[];
  };
  sentBadge: string;
  /** Texte extrait d'un CV deux colonnes avec icônes, tel qu'un ATS le lit. */
  robotText: DemoSegment[];
}

/**
 * Contenu structuré de l'illustration de la landing (CV fictif, score, vue robot).
 * Gardé hors des fichiers de traduction car il mélange texte et surlignage.
 */
export const LANDING_DEMO: Record<UiLanguage, LandingDemo> = {
  fr: {
    cv: {
      name: 'Camille Martin',
      role: 'Développeuse Front-end',
      contact: 'Lyon · camille.martin@exemple.fr',
      experienceTitle: 'Expérience',
      jobTitle: 'Développeuse Angular',
      jobMeta: 'Société Exemple · 2022 – aujourd’hui',
      bullets: [
        [
          { text: 'Migration de 40 écrans vers ' },
          { text: 'Angular', kind: 'keyword' },
          { text: ' et ' },
          { text: 'TypeScript', kind: 'keyword' },
          { text: ', temps de chargement réduit de 35 %' },
        ],
        [
          { text: 'En charge de', kind: 'weak' },
          { text: ' la stratégie de tests de bout en bout' },
        ],
        [
          { text: 'Déploiement continu avec ' },
          { text: 'GitLab CI', kind: 'keyword' },
          { text: ' pour 3 équipes produit' },
        ],
      ],
      weakLabel: 'Phrase faible',
      weakReplacement: '« Piloté »',
      skillsTitle: 'Compétences',
      skills: 'Angular · TypeScript · RxJS · GitLab CI · Accessibilité',
    },
    score: {
      value: 86,
      label: 'Correspondance avec l’annonce',
      keywords: [
        { label: 'Angular', found: true },
        { label: 'TypeScript', found: true },
        { label: 'GitLab CI', found: true },
        { label: 'Docker', found: false },
      ],
    },
    sentBadge: '0 octet envoyé',
    robotText: [
      { text: 'COMPÉTENCES CAMILLE MARTIN ' },
      { text: '� 06 12 34 56 78', kind: 'noise' },
      { text: ' Développeuse Front-end Angular ' },
      { text: '●●●●○', kind: 'noise' },
      { text: ' EXPÉRIENCE ' },
      { text: '� camille.mar', kind: 'noise' },
      { text: ' Développeuse Angular ' },
      { text: 'tin@exemple.fr', kind: 'noise' },
      { text: ' 2022 – aujourd’hui TypeScript ' },
      { text: '●●●○○', kind: 'noise' },
      { text: ' Société Exemple LANGUES Anglais Migration de 40 écrans vers…' },
    ],
  },
  en: {
    cv: {
      name: 'Camille Martin',
      role: 'Front-end Developer',
      contact: 'Lyon · camille.martin@example.com',
      experienceTitle: 'Experience',
      jobTitle: 'Angular Developer',
      jobMeta: 'Example Corp · 2022 – present',
      bullets: [
        [
          { text: 'Migrated 40 screens to ' },
          { text: 'Angular', kind: 'keyword' },
          { text: ' and ' },
          { text: 'TypeScript', kind: 'keyword' },
          { text: ', cutting load time by 35%' },
        ],
        [{ text: 'Responsible for', kind: 'weak' }, { text: ' the end-to-end testing strategy' }],
        [
          { text: 'Continuous delivery with ' },
          { text: 'GitLab CI', kind: 'keyword' },
          { text: ' for 3 product teams' },
        ],
      ],
      weakLabel: 'Weak phrase',
      weakReplacement: '“Led”',
      skillsTitle: 'Skills',
      skills: 'Angular · TypeScript · RxJS · GitLab CI · Accessibility',
    },
    score: {
      value: 86,
      label: 'Match with the job ad',
      keywords: [
        { label: 'Angular', found: true },
        { label: 'TypeScript', found: true },
        { label: 'GitLab CI', found: true },
        { label: 'Docker', found: false },
      ],
    },
    sentBadge: '0 bytes sent',
    robotText: [
      { text: 'SKILLS CAMILLE MARTIN ' },
      { text: '� +33 6 12 34 56 78', kind: 'noise' },
      { text: ' Front-end Developer Angular ' },
      { text: '●●●●○', kind: 'noise' },
      { text: ' EXPERIENCE ' },
      { text: '� camille.mar', kind: 'noise' },
      { text: ' Angular Developer ' },
      { text: 'tin@example.com', kind: 'noise' },
      { text: ' 2022 – present TypeScript ' },
      { text: '●●●○○', kind: 'noise' },
      { text: ' Example Corp LANGUAGES French Migrated 40 screens to…' },
    ],
  },
  it: {
    cv: {
      name: 'Camille Martin',
      role: 'Sviluppatrice Front-end',
      contact: 'Lione · camille.martin@esempio.it',
      experienceTitle: 'Esperienza',
      jobTitle: 'Sviluppatrice Angular',
      jobMeta: 'Società Esempio · 2022 – oggi',
      bullets: [
        [
          { text: 'Migrazione di 40 schermate verso ' },
          { text: 'Angular', kind: 'keyword' },
          { text: ' e ' },
          { text: 'TypeScript', kind: 'keyword' },
          { text: ', tempi di caricamento ridotti del 35%' },
        ],
        [{ text: 'Responsabile di', kind: 'weak' }, { text: ' la strategia di test end-to-end' }],
        [
          { text: 'Rilascio continuo con ' },
          { text: 'GitLab CI', kind: 'keyword' },
          { text: ' per 3 team di prodotto' },
        ],
      ],
      weakLabel: 'Frase debole',
      weakReplacement: '« Guidato »',
      skillsTitle: 'Competenze',
      skills: 'Angular · TypeScript · RxJS · GitLab CI · Accessibilità',
    },
    score: {
      value: 86,
      label: 'Corrispondenza con l’annuncio',
      keywords: [
        { label: 'Angular', found: true },
        { label: 'TypeScript', found: true },
        { label: 'GitLab CI', found: true },
        { label: 'Docker', found: false },
      ],
    },
    sentBadge: '0 byte inviati',
    robotText: [
      { text: 'COMPETENZE CAMILLE MARTIN ' },
      { text: '� +33 6 12 34 56 78', kind: 'noise' },
      { text: ' Sviluppatrice Front-end Angular ' },
      { text: '●●●●○', kind: 'noise' },
      { text: ' ESPERIENZA ' },
      { text: '� camille.mar', kind: 'noise' },
      { text: ' Sviluppatrice Angular ' },
      { text: 'tin@esempio.it', kind: 'noise' },
      { text: ' 2022 – oggi TypeScript ' },
      { text: '●●●○○', kind: 'noise' },
      { text: ' Società Esempio LINGUE Inglese Migrazione di 40 schermate verso…' },
    ],
  },
  es: {
    cv: {
      name: 'Camille Martin',
      role: 'Desarrolladora Front-end',
      contact: 'Lyon · camille.martin@ejemplo.es',
      experienceTitle: 'Experiencia',
      jobTitle: 'Desarrolladora Angular',
      jobMeta: 'Empresa Ejemplo · 2022 – actualidad',
      bullets: [
        [
          { text: 'Migración de 40 pantallas a ' },
          { text: 'Angular', kind: 'keyword' },
          { text: ' y ' },
          { text: 'TypeScript', kind: 'keyword' },
          { text: ', tiempo de carga reducido un 35 %' },
        ],
        [{ text: 'Encargada de', kind: 'weak' }, { text: ' la estrategia de pruebas end-to-end' }],
        [
          { text: 'Despliegue continuo con ' },
          { text: 'GitLab CI', kind: 'keyword' },
          { text: ' para 3 equipos de producto' },
        ],
      ],
      weakLabel: 'Frase débil',
      weakReplacement: '«Lideré»',
      skillsTitle: 'Competencias',
      skills: 'Angular · TypeScript · RxJS · GitLab CI · Accesibilidad',
    },
    score: {
      value: 86,
      label: 'Coincidencia con la oferta',
      keywords: [
        { label: 'Angular', found: true },
        { label: 'TypeScript', found: true },
        { label: 'GitLab CI', found: true },
        { label: 'Docker', found: false },
      ],
    },
    sentBadge: '0 bytes enviados',
    robotText: [
      { text: 'COMPETENCIAS CAMILLE MARTIN ' },
      { text: '� +33 6 12 34 56 78', kind: 'noise' },
      { text: ' Desarrolladora Front-end Angular ' },
      { text: '●●●●○', kind: 'noise' },
      { text: ' EXPERIENCIA ' },
      { text: '� camille.mar', kind: 'noise' },
      { text: ' Desarrolladora Angular ' },
      { text: 'tin@ejemplo.es', kind: 'noise' },
      { text: ' 2022 – actualidad TypeScript ' },
      { text: '●●●○○', kind: 'noise' },
      { text: ' Empresa Ejemplo IDIOMAS Inglés Migración de 40 pantallas a…' },
    ],
  },
  de: {
    cv: {
      name: 'Camille Martin',
      role: 'Front-End-Entwicklerin',
      contact: 'Lyon · camille.martin@beispiel.de',
      experienceTitle: 'Berufserfahrung',
      jobTitle: 'Angular-Entwicklerin',
      jobMeta: 'Beispiel GmbH · 2022 – heute',
      bullets: [
        [
          { text: 'Migration von 40 Ansichten auf ' },
          { text: 'Angular', kind: 'keyword' },
          { text: ' und ' },
          { text: 'TypeScript', kind: 'keyword' },
          { text: ', Ladezeit um 35 % verkürzt' },
        ],
        [{ text: 'Zuständig für', kind: 'weak' }, { text: ' die End-to-End-Teststrategie' }],
        [
          { text: 'Continuous Delivery mit ' },
          { text: 'GitLab CI', kind: 'keyword' },
          { text: ' für 3 Produktteams' },
        ],
      ],
      weakLabel: 'Schwache Formulierung',
      weakReplacement: '„Eingeführt“',
      skillsTitle: 'Kenntnisse',
      skills: 'Angular · TypeScript · RxJS · GitLab CI · Barrierefreiheit',
    },
    score: {
      value: 86,
      label: 'Übereinstimmung mit der Anzeige',
      keywords: [
        { label: 'Angular', found: true },
        { label: 'TypeScript', found: true },
        { label: 'GitLab CI', found: true },
        { label: 'Docker', found: false },
      ],
    },
    sentBadge: '0 Byte gesendet',
    robotText: [
      { text: 'KENNTNISSE CAMILLE MARTIN ' },
      { text: '� +33 6 12 34 56 78', kind: 'noise' },
      { text: ' Front-End-Entwicklerin Angular ' },
      { text: '●●●●○', kind: 'noise' },
      { text: ' BERUFSERFAHRUNG ' },
      { text: '� camille.mar', kind: 'noise' },
      { text: ' Angular-Entwicklerin ' },
      { text: 'tin@beispiel.de', kind: 'noise' },
      { text: ' 2022 – heute TypeScript ' },
      { text: '●●●○○', kind: 'noise' },
      { text: ' Beispiel GmbH SPRACHEN Englisch Migration von 40 Ansichten auf…' },
    ],
  },
};
