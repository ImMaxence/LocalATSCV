import { CvFontId } from './cv-fonts';

/** Langues dans lesquelles un CV peut être rédigé (titres de sections, dates, règle EN). */
export const CV_LANGUAGES = ['fr', 'en', 'it', 'es', 'de'] as const;
export type CvLanguage = (typeof CV_LANGUAGES)[number];

/** Sections composées d'entrées datées avec des puces (expériences, formations…). */
export const ENTRY_KINDS = [
  'experience',
  'education',
  'projects',
  'certifications',
  'custom',
] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];

export const SECTION_KINDS = [...ENTRY_KINDS, 'skills', 'languages', 'interests'] as const;
export type SectionKind = (typeof SECTION_KINDS)[number];

export interface Bullet {
  id: string;
  text: string;
}

/** Dates au format `AAAA` ou `AAAA-MM`, chaîne vide si inconnue. */
export interface Entry {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  url: string;
  bullets: Bullet[];
}

export interface SkillGroup {
  id: string;
  label: string;
  keywords: string;
}

export interface SpokenLanguage {
  id: string;
  name: string;
  level: string;
}

export interface Interest {
  id: string;
  label: string;
}

interface SectionBase {
  id: string;
  /** Titre personnalisé ; vide = titre par défaut dans la langue du CV. */
  title: string;
}

export interface EntrySection extends SectionBase {
  kind: EntryKind;
  items: Entry[];
}

export interface SkillsSection extends SectionBase {
  kind: 'skills';
  items: SkillGroup[];
}

export interface LanguagesSection extends SectionBase {
  kind: 'languages';
  items: SpokenLanguage[];
}

export interface InterestsSection extends SectionBase {
  kind: 'interests';
  items: Interest[];
}

export type CvSection = EntrySection | SkillsSection | LanguagesSection | InterestsSection;
export type SectionItem = Entry | SkillGroup | SpokenLanguage | Interest;

export interface ProfileLink {
  id: string;
  label: string;
  url: string;
}

export interface Profile {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  /** Format ISO `AAAA-MM-JJ`. */
  birthDate: string;
  nationality: string;
  /** Permis de conduire, en texte libre (« Permis B, véhiculé »). */
  drivingLicense: string;
  summary: string;
  /** Référence vers la table `photos` d'IndexedDB. */
  photoId: string | null;
  /** Lien à afficher en QR code dans les modèles qui le proposent. */
  qrLinkId: string | null;
  links: ProfileLink[];
}

/**
 * Réglages pour faire tenir le CV sur moins de pages : `spacing` réduit les espacements verticaux,
 * `scale` la taille de tout le contenu. 1 = mise en page prévue par le modèle.
 */
export interface CvLayout {
  spacing: number;
  scale: number;
}

export const DEFAULT_LAYOUT: CvLayout = { spacing: 1, scale: 1 };
/** Bornes des réglages : au-delà, le CV devient trop serré ou trop petit pour être lu. */
export const LAYOUT_LIMITS = { spacing: { min: 0.5, max: 1 }, scale: { min: 0.85, max: 1 } };

/** Lettre de motivation, imprimée avec le design du CV. Champs vides = valeurs par défaut. */
export interface CoverLetter {
  /** Destinataire sur plusieurs lignes (entreprise, service, adresse). */
  recipient: string;
  place: string;
  /** Format ISO `AAAA-MM-JJ` ; vide = date du jour. */
  date: string;
  subject: string;
  greeting: string;
  /** Paragraphes séparés par une ligne vide ; `**gras**` accepté. */
  body: string;
  closing: string;
}

export function createLetter(place = ''): CoverLetter {
  return { recipient: '', place, date: '', subject: '', greeting: '', body: '', closing: '' };
}

/** Le Master CV : toutes les données, jamais filtrées. */
export interface MasterCv {
  id: string;
  name: string;
  language: CvLanguage;
  template: CvTemplateId;
  /** Polices choisies ; `null` = police prévue par le modèle. */
  fonts: { heading: CvFontId | null; body: CvFontId | null };
  accentColor: string;
  layout: CvLayout;
  profile: Profile;
  sections: CvSection[];
  /** Lettre de motivation du Master ; une version ciblée peut avoir la sienne. */
  letter: CoverLetter | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Version ciblée d'un Master CV : ne stocke que ce qui est masqué.
 * Un élément ajouté plus tard au Master apparaît donc par défaut dans toutes les versions.
 */
export interface CvVersion {
  id: string;
  masterId: string;
  name: string;
  hiddenIds: string[];
  jobAd: string;
  /** Lettre propre à cette version ; `null` = celle du Master. */
  letter: CoverLetter | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Modèles de mise en page, dans l'ordre de la galerie. Tous impriment du vrai texte ;
 * seuls Signature et Colonnes répartissent le contenu sur deux colonnes, ce que certains
 * ATS lisent dans le désordre. `family` sert au filtre de la galerie.
 */
export const CV_TEMPLATES = [
  { id: 'aurora', ats: 'excellent', family: 'graphic' },
  { id: 'signature', ats: 'good', family: 'graphic' },
  { id: 'bento', ats: 'excellent', family: 'graphic' },
  { id: 'pulse', ats: 'excellent', family: 'graphic' },
  { id: 'memphis', ats: 'excellent', family: 'graphic' },
  { id: 'bauhaus', ats: 'excellent', family: 'graphic' },
  { id: 'brutal', ats: 'excellent', family: 'graphic' },
  { id: 'duotone', ats: 'excellent', family: 'graphic' },
  { id: 'editorial', ats: 'excellent', family: 'graphic' },
  { id: 'prism', ats: 'excellent', family: 'graphic' },
  { id: 'nocturne', ats: 'excellent', family: 'graphic' },
  { id: 'sorbet', ats: 'excellent', family: 'graphic' },
  { id: 'wave', ats: 'excellent', family: 'graphic' },
  { id: 'origami', ats: 'excellent', family: 'graphic' },
  { id: 'hexa', ats: 'excellent', family: 'graphic' },
  { id: 'blueprint', ats: 'excellent', family: 'graphic' },
  { id: 'typo', ats: 'excellent', family: 'graphic' },
  { id: 'swiss', ats: 'excellent', family: 'graphic' },
  { id: 'thread', ats: 'excellent', family: 'graphic' },
  { id: 'ribbon', ats: 'excellent', family: 'graphic' },
  { id: 'zen', ats: 'excellent', family: 'graphic' },
  { id: 'prestige', ats: 'excellent', family: 'graphic' },
  { id: 'impact', ats: 'excellent', family: 'graphic' },
  { id: 'executive', ats: 'excellent', family: 'sober' },
  { id: 'modern', ats: 'excellent', family: 'sober' },
  { id: 'classic', ats: 'excellent', family: 'sober' },
  { id: 'elegant', ats: 'excellent', family: 'sober' },
  { id: 'tech', ats: 'excellent', family: 'sober' },
  { id: 'minimal', ats: 'good', family: 'sober' },
  { id: 'sidebar', ats: 'good', family: 'sober' },
] as const;
export type CvTemplateId = (typeof CV_TEMPLATES)[number]['id'];
export type CvTemplateFamily = (typeof CV_TEMPLATES)[number]['family'];
/** Note de compatibilité ATS d'un modèle, d'après les risques de lecture connus (colonnes, etc.). */
export type AtsCompatibility = 'excellent' | 'good' | 'fair';
export const DEFAULT_TEMPLATE: CvTemplateId = 'classic';

export function isTemplateId(value: unknown): value is CvTemplateId {
  return CV_TEMPLATES.some((template) => template.id === value);
}

/**
 * Couleurs d'accent proposées, rangées par teinte. Toutes assez foncées pour du texte blanc
 * (contraste AA) et lisibles à l'impression en couleur comme en niveaux de gris. Toute autre
 * couleur reste possible avec le sélecteur libre.
 */
export const ACCENT_COLORS = [
  '#11795a',
  '#0f766e',
  '#0369a1',
  '#1d4ed8',
  '#1e3a8a',
  '#4338ca',
  '#6d28d9',
  '#a21caf',
  '#be185d',
  '#9f1239',
  '#b91c1c',
  '#c2410c',
  '#b45309',
  '#a16207',
  '#334155',
  '#18181b',
];

export function isEntryKind(kind: SectionKind): kind is EntryKind {
  return (ENTRY_KINDS as readonly string[]).includes(kind);
}

export function isEntrySection(section: CvSection): section is EntrySection {
  return isEntryKind(section.kind);
}

export const newId = (): string => crypto.randomUUID();
const now = (): string => new Date().toISOString();

export function createBullet(text = ''): Bullet {
  return { id: newId(), text };
}

export function createEntry(): Entry {
  return {
    id: newId(),
    title: '',
    subtitle: '',
    location: '',
    start: '',
    end: '',
    current: false,
    url: '',
    bullets: [createBullet()],
  };
}

export function createItem(kind: SectionKind): SectionItem {
  switch (kind) {
    case 'skills':
      return { id: newId(), label: '', keywords: '' };
    case 'languages':
      return { id: newId(), name: '', level: '' };
    case 'interests':
      return { id: newId(), label: '' };
    default:
      return createEntry();
  }
}

export function createSection(kind: SectionKind): CvSection {
  return { id: newId(), kind, title: '', items: [] } as CvSection;
}

export function createProfile(): Profile {
  return {
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    birthDate: '',
    nationality: '',
    drivingLicense: '',
    summary: '',
    photoId: null,
    qrLinkId: null,
    links: [],
  };
}

export function createEmptyCv(name: string, language: CvLanguage): MasterCv {
  const timestamp = now();
  return {
    id: newId(),
    name,
    language,
    template: 'aurora',
    fonts: { heading: null, body: null },
    accentColor: ACCENT_COLORS[0],
    layout: { ...DEFAULT_LAYOUT },
    profile: createProfile(),
    sections: (['experience', 'education', 'skills', 'languages'] as const).map(createSection),
    letter: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createVersion(masterId: string, name: string): CvVersion {
  const timestamp = now();
  return {
    id: newId(),
    masterId,
    name,
    hiddenIds: [],
    jobAd: '',
    letter: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
