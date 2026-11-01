import {
  ACCENT_COLORS,
  CV_LANGUAGES,
  CvLanguage,
  DEFAULT_TEMPLATE,
  CvSection,
  CvVersion,
  Entry,
  MasterCv,
  Profile,
  SECTION_KINDS,
  SectionKind,
  isEntryKind,
  isTemplateId,
  newId,
} from '../model/cv.model';

/**
 * Format du fichier de sauvegarde JSON. Incrémenter BACKUP_SCHEMA_VERSION à chaque
 * changement de structure et adapter les fonctions `normalize*` pour relire les anciens fichiers.
 */
export const BACKUP_SCHEMA_VERSION = 1;
const APP_ID = 'LocalATSCV';

export interface BackupPhoto {
  id: string;
  dataUrl: string;
}

export interface Backup {
  app: typeof APP_ID;
  schemaVersion: number;
  exportedAt: string;
  cvs: MasterCv[];
  versions: CvVersion[];
  photos: BackupPhoto[];
}

export type BackupErrorCode = 'invalidJson' | 'notABackup' | 'newerVersion';

export class BackupError extends Error {
  constructor(readonly code: BackupErrorCode) {
    super(code);
  }
}

export function createBackup(
  cvs: MasterCv[],
  versions: CvVersion[],
  photos: BackupPhoto[],
): Backup {
  return {
    app: APP_ID,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    cvs,
    versions,
    photos,
  };
}

/** Lit un fichier de sauvegarde : tout champ manquant ou invalide est remplacé par une valeur sûre. */
export function parseBackup(text: string): Backup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new BackupError('invalidJson');
  }
  if (!isRecord(raw) || raw['app'] !== APP_ID || typeof raw['schemaVersion'] !== 'number') {
    throw new BackupError('notABackup');
  }
  if (raw['schemaVersion'] > BACKUP_SCHEMA_VERSION) throw new BackupError('newerVersion');

  const cvs = array(raw['cvs'])
    .map(normalizeCv)
    .filter((cv) => cv !== null);
  const cvIds = new Set(cvs.map((cv) => cv.id));
  const versions = array(raw['versions'])
    .map(normalizeVersion)
    .filter((version) => version !== null && cvIds.has(version.masterId)) as CvVersion[];
  const photoIds = new Set(cvs.map((cv) => cv.profile.photoId).filter(Boolean));
  const photos = array(raw['photos'])
    .filter(isRecord)
    .map((photo) => ({ id: string(photo['id']), dataUrl: string(photo['dataUrl']) }))
    .filter((photo) => photoIds.has(photo.id) && photo.dataUrl.startsWith('data:image/'));

  return createBackup(cvs, versions, photos);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const array = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const string = (value: unknown): string => (typeof value === 'string' ? value : '');
const id = (value: unknown): string => string(value) || newId();
const date = (value: unknown): string => string(value) || new Date().toISOString();

function normalizeProfile(raw: unknown): Profile {
  const profile = isRecord(raw) ? raw : {};
  return {
    firstName: string(profile['firstName']),
    lastName: string(profile['lastName']),
    title: string(profile['title']),
    email: string(profile['email']),
    phone: string(profile['phone']),
    location: string(profile['location']),
    birthDate: string(profile['birthDate']),
    nationality: string(profile['nationality']),
    summary: string(profile['summary']),
    photoId: string(profile['photoId']) || null,
    links: array(profile['links'])
      .filter(isRecord)
      .map((link) => ({
        id: id(link['id']),
        label: string(link['label']),
        url: string(link['url']),
      })),
  };
}

function normalizeEntry(raw: Record<string, unknown>): Entry {
  return {
    id: id(raw['id']),
    title: string(raw['title']),
    subtitle: string(raw['subtitle']),
    location: string(raw['location']),
    start: string(raw['start']),
    end: string(raw['end']),
    current: raw['current'] === true,
    url: string(raw['url']),
    bullets: array(raw['bullets'])
      .filter(isRecord)
      .map((bullet) => ({ id: id(bullet['id']), text: string(bullet['text']) })),
  };
}

function normalizeSection(raw: unknown): CvSection | null {
  if (!isRecord(raw) || !SECTION_KINDS.includes(raw['kind'] as SectionKind)) return null;
  const kind = raw['kind'] as SectionKind;
  const items = array(raw['items']).filter(isRecord);
  const base = { id: id(raw['id']), title: string(raw['title']) };

  if (isEntryKind(kind)) return { ...base, kind, items: items.map(normalizeEntry) };
  switch (kind) {
    case 'skills':
      return {
        ...base,
        kind,
        items: items.map((item) => ({
          id: id(item['id']),
          label: string(item['label']),
          keywords: string(item['keywords']),
        })),
      };
    case 'languages':
      return {
        ...base,
        kind,
        items: items.map((item) => ({
          id: id(item['id']),
          name: string(item['name']),
          level: string(item['level']),
        })),
      };
    default:
      return {
        ...base,
        kind: 'interests',
        items: items.map((item) => ({ id: id(item['id']), label: string(item['label']) })),
      };
  }
}

export function normalizeCv(raw: unknown): MasterCv | null {
  if (!isRecord(raw) || !string(raw['id'])) return null;
  const language = CV_LANGUAGES.includes(raw['language'] as CvLanguage)
    ? (raw['language'] as CvLanguage)
    : 'fr';
  return {
    id: string(raw['id']),
    name: string(raw['name']) || 'CV',
    language,
    template: isTemplateId(raw['template']) ? raw['template'] : DEFAULT_TEMPLATE,
    accentColor: /^#[0-9a-f]{6}$/i.test(string(raw['accentColor']))
      ? string(raw['accentColor'])
      : ACCENT_COLORS[0],
    profile: normalizeProfile(raw['profile']),
    sections: array(raw['sections'])
      .map(normalizeSection)
      .filter((section) => section !== null),
    createdAt: date(raw['createdAt']),
    updatedAt: date(raw['updatedAt']),
  };
}

function normalizeVersion(raw: unknown): CvVersion | null {
  if (!isRecord(raw) || !string(raw['id']) || !string(raw['masterId'])) return null;
  return {
    id: string(raw['id']),
    masterId: string(raw['masterId']),
    name: string(raw['name']) || 'Version',
    hiddenIds: array(raw['hiddenIds']).map(string).filter(Boolean),
    jobAd: string(raw['jobAd']),
    createdAt: date(raw['createdAt']),
    updatedAt: date(raw['updatedAt']),
  };
}
