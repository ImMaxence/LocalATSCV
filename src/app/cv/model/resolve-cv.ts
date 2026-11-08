import {
  CvLanguage,
  CvSection,
  CvTemplateId,
  CvVersion,
  DEFAULT_LAYOUT,
  DISABILITY_ID,
  DateStyle,
  Entry,
  EntrySection,
  MasterCv,
  Profile,
  SectionItem,
  isEntrySection,
} from './cv.model';

/**
 * CV prêt à afficher : version appliquée, éléments vides retirés, règle EN appliquée.
 * `profile.disability` n'est rempli que si la mention va avec les coordonnées ; placée en fin
 * de CV, elle devient une entrée de la rubrique « Autres informations ».
 */
export interface ResolvedCv {
  language: CvLanguage;
  template: CvTemplateId;
  fonts: MasterCv['fonts'];
  accentColor: string;
  style: MasterCv['style'];
  layout: MasterCv['layout'];
  dateStyle: DateStyle;
  profile: Profile;
  sections: CvSection[];
}

/** Identifiants fixes de la rubrique créée pour la mention placée en fin de CV. */
const DISABILITY_SECTION_ID = `${DISABILITY_ID}-section`;
const DISABILITY_ENTRY_ID = `${DISABILITY_ID}-entry`;

/**
 * Langues où la photo, la date de naissance et la nationalité n'ont pas leur place
 * (usages anglo-saxons, pour limiter les discriminations à l'embauche). Le mode libre lève la règle.
 */
export function hidesPersonalDetails(language: CvLanguage, freeMode = false): boolean {
  return language === 'en' && !freeMode;
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

  const profile = hidesPersonalDetails(cv.language, cv.freeMode)
    ? { ...cv.profile, photoId: null, birthDate: '', nationality: '' }
    : cv.profile;

  const disability = hidden.has(DISABILITY_ID) ? '' : (profile.disability ?? '').trim();
  const placement = profile.disabilityPlacement ?? 'contact';
  if (disability && placement === 'section') appendDisability(sections, disability);

  return {
    language: cv.language,
    template: cv.template,
    fonts: cv.fonts,
    accentColor: cv.accentColor,
    style: cv.style ?? null,
    layout: cv.layout ?? DEFAULT_LAYOUT,
    dateStyle: cv.dateStyle ?? 'month',
    profile: {
      ...profile,
      disability: placement === 'contact' ? disability : '',
      links: profile.links.filter((link) => filled(link.url)),
    },
    sections,
  };
}

/**
 * Mention de handicap en fin de CV : ajoutée à une rubrique « Autres informations » qui garde
 * son titre par défaut, sinon dans une rubrique de ce nom créée pour l'occasion.
 */
function appendDisability(sections: CvSection[], text: string): void {
  const entry: Entry = {
    id: DISABILITY_ENTRY_ID,
    title: text,
    subtitle: '',
    location: '',
    start: '',
    end: '',
    current: false,
    url: '',
    bullets: [],
  };
  const index = sections
    .map((section) => section.kind === 'custom' && !section.title.trim())
    .lastIndexOf(true);
  if (index >= 0) {
    const section = sections[index] as EntrySection;
    sections[index] = { ...section, items: [...section.items, entry] };
  } else {
    sections.push({ id: DISABILITY_SECTION_ID, kind: 'custom', title: '', items: [entry] });
  }
}
