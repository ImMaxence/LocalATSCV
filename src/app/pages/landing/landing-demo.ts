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
      weakReplacement: 'Piloté',
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
      weakReplacement: 'Led',
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
};
