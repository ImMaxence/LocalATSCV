import {
  CvLanguage,
  CvSection,
  CvTemplateId,
  CvVersion,
  Entry,
  MasterCv,
  Profile,
  SectionItem,
  isEntrySection,
} from './cv.model';

/** CV prêt à afficher : version appliquée, éléments vides retirés, règle EN appliquée. */
export interface ResolvedCv {
  language: CvLanguage;
  template: CvTemplateId;
  fonts: MasterCv['fonts'];
  accentColor: string;
  profile: Profile;
  sections: CvSection[];
}

/**
 * Langues où la photo, la date de naissance et la nationalité n'ont pas leur place
 * (usages anglo-saxons, pour limiter les discriminations à l'embauche).
 */
export function hidesPersonalDetails(language: CvLanguage): boolean {
  return language === 'en';
}

const filled = (value: string): boolean => value.trim().length > 0;

function isEmptyItem(item: SectionItem): boolean {
  if ('bullets' in item) {
    const entry = item as Entry;
    return !filled(entry.title) && !filled(entry.subtitle) && entry.bullets.length === 0;
  }
  if ('keywords' in item) return !filled(item.keywords) && !filled(item.label);
  if ('level' in item) return !filled(item.name);
  return !filled(item.label);
}

export function resolveCv(cv: MasterCv, version: CvVersion | null): ResolvedCv {
  const hidden = new Set(version?.hiddenIds ?? []);
  const visible = <T extends { id: string }>(items: T[]): T[] =>
    items.filter((item) => !hidden.has(item.id));

  const sections = visible(cv.sections)
    .map((section): CvSection => {
      if (isEntrySection(section)) {
        const items = visible(section.items).map((entry) => ({
          ...entry,
          bullets: visible(entry.bullets).filter((bullet) => filled(bullet.text)),
        }));
        return { ...section, items: items.filter((item) => !isEmptyItem(item)) };
      }
      const items = visible(section.items as SectionItem[]).filter((item) => !isEmptyItem(item));
      return { ...section, items } as CvSection;
    })
    .filter((section) => section.items.length > 0);

  const profile = hidesPersonalDetails(cv.language)
    ? { ...cv.profile, photoId: null, birthDate: '', nationality: '' }
    : cv.profile;

  return {
    language: cv.language,
    template: cv.template,
    fonts: cv.fonts,
    accentColor: cv.accentColor,
    profile: { ...profile, links: profile.links.filter((link) => filled(link.url)) },
    sections,
  };
}
