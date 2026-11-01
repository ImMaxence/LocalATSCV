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
  summary: string;
  /** Référence vers la table `photos` d'IndexedDB. */
  photoId: string | null;
  links: ProfileLink[];
}

/** Le Master CV : toutes les données, jamais filtrées. */
export interface MasterCv {
  id: string;
  name: string;
  language: CvLanguage;
  accentColor: string;
  profile: Profile;
  sections: CvSection[];
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
  createdAt: string;
  updatedAt: string;
}

/** Couleurs sobres, lisibles à l'impression en couleur comme en niveaux de gris. */
export const ACCENT_COLORS = ['#11795a', '#1d4ed8', '#9f1239', '#334155', '#6d28d9', '#b45309'];

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
    summary: '',
    photoId: null,
    links: [],
  };
}

export function createEmptyCv(name: string, language: CvLanguage): MasterCv {
  const timestamp = now();
  return {
    id: newId(),
    name,
    language,
    accentColor: ACCENT_COLORS[0],
    profile: createProfile(),
    sections: (['experience', 'education', 'skills', 'languages'] as const).map(createSection),
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
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
