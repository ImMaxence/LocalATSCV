import { Directive, computed, input } from '@angular/core';
import {
  CoverLetter,
  CvSection,
  Entry,
  Interest,
  SectionKind,
  SkillGroup,
  SpokenLanguage,
  isEntrySection,
} from '../../model/cv.model';
import { CV_LABELS, formatBirthDate, formatDateRange, labelSeparator } from '../../model/cv-labels';
import { ResolvedCv } from '../../model/resolve-cv';
import { languageLevel } from '../../model/language-level';
import { IconName } from '../../../shared/icon/icon';

const stripProtocol = (url: string): string =>
  url
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');

/** Sections placées dans la colonne latérale des modèles à deux colonnes. */
const SIDE_KINDS: readonly SectionKind[] = ['skills', 'languages', 'interests'];

export interface ContactItem {
  kind:
    | 'location'
    | 'email'
    | 'phone'
    | 'license'
    | 'link'
    | 'birthDate'
    | 'nationality'
    | 'disability';
  text: string;
  /** Icône SVG (invisible pour un ATS) : pictogramme, ou logo pour les liens connus. */
  icon: IconName;
}

const CONTACT_ICONS: Record<Exclude<ContactItem['kind'], 'link'>, IconName> = {
  location: 'mapPin',
  email: 'mail',
  phone: 'phone',
  license: 'car',
  birthDate: 'calendar',
  nationality: 'flag',
  disability: 'access',
};

/** Logo affiché devant un lien, selon son adresse. */
export function linkIcon(url: string): IconName {
  if (/linkedin\.com/i.test(url)) return 'linkedin';
  if (/github\.com/i.test(url)) return 'github';
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
  if (/instagram\.com/i.test(url)) return 'instagram';
  return 'globe';
}

/**
 * Données et formatage communs à tous les modèles de CV : chaque modèle ne décrit
 * que sa mise en page. Règle commune : tout ce qui est imprimé est du vrai texte,
 * les décorations (puces, filets, pastilles) sont purement graphiques.
 */
@Directive()
export abstract class CvTemplateBase {
  readonly cv = input.required<ResolvedCv>();
  readonly photoUrl = input<string | null>(null);
  /** Lettre de motivation à afficher à la place des sections (voir CvDocument). */
  readonly letter = input<CoverLetter | null>(null);

  protected readonly labels = computed(() => CV_LABELS[this.cv().language]);
  protected readonly separator = computed(() => labelSeparator(this.cv().language));

  protected readonly fullName = computed(() => {
    const { firstName, lastName } = this.cv().profile;
    return [firstName, lastName]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(' ');
  });

  /** Coordonnées avec leur nature, pour les modèles qui affichent une icône (SVG, donc invisible pour un ATS). */
  protected readonly contactItems = computed((): ContactItem[] => {
    const { profile, language } = this.cv();
    const labels = this.labels();
    const item = (kind: Exclude<ContactItem['kind'], 'link'>, text: string): ContactItem => ({
      kind,
      text,
      icon: CONTACT_ICONS[kind],
    });
    const items: ContactItem[] = [
      item('location', profile.location),
      item('email', profile.email),
      item('phone', profile.phone),
      item('license', profile.drivingLicense ?? ''),
      ...profile.links.map((link): ContactItem => ({
        kind: 'link',
        text: stripProtocol(link.url),
        icon: linkIcon(link.url),
      })),
      item(
        'birthDate',
        profile.birthDate &&
          `${labels.birthDate}${this.separator()}${formatBirthDate(profile.birthDate, language)}`,
      ),
      item(
        'nationality',
        profile.nationality && `${labels.nationality}${this.separator()}${profile.nationality}`,
      ),
      item('disability', profile.disability ?? ''),
    ];
    return items.map((i) => ({ ...i, text: i.text.trim() })).filter((i) => i.text);
  });

  protected readonly contact = computed(() => this.contactItems().map((item) => item.text));

  /** Lien choisi pour le QR code : adresse complète et légende lisible. */
  protected readonly qr = computed(() => {
    const { links, qrLinkId } = this.cv().profile;
    const link = links.find((l) => l.id === qrLinkId && l.url.trim());
    if (!link) return null;
    const url = /^https?:\/\//i.test(link.url.trim())
      ? link.url.trim()
      : `https://${link.url.trim()}`;
    return { url, caption: link.label.trim() || stripProtocol(link.url), icon: linkIcon(link.url) };
  });

  protected readonly summary = computed(() => this.cv().profile.summary.trim());
  protected readonly mainSections = computed(() =>
    this.cv().sections.filter((section) => !SIDE_KINDS.includes(section.kind)),
  );
  protected readonly sideSections = computed(() =>
    this.cv().sections.filter((section) => SIDE_KINDS.includes(section.kind)),
  );

  protected sectionTitle(section: CvSection): string {
    return section.title.trim() || this.labels().sections[section.kind];
  }

  protected entries(section: CvSection): Entry[] {
    return isEntrySection(section) ? section.items : [];
  }

  protected skills(section: CvSection): SkillGroup[] {
    return section.kind === 'skills' ? section.items : [];
  }

  protected languages(section: CvSection): SpokenLanguage[] {
    return section.kind === 'languages' ? section.items : [];
  }

  protected interests(section: CvSection): Interest[] {
    return section.kind === 'interests' ? section.items : [];
  }

  /** « Angular, TypeScript ; RxJS » → ['Angular', 'TypeScript', 'RxJS'] (pour les pastilles). */
  protected keywords(group: SkillGroup): string[] {
    return group.keywords
      .split(/[,;·•|]/)
      .map((keyword) => keyword.trim())
      .filter(Boolean);
  }

  protected dates(entry: Entry): string {
    const { language, dateStyle } = this.cv();
    return formatDateRange(entry.start, entry.end, entry.current, language, dateStyle);
  }

  protected meta(entry: Entry): string {
    return [entry.location, stripProtocol(entry.url)].filter((part) => part.trim()).join(' · ');
  }

  /** « Entreprise, Lieu · lien » */
  protected organization(entry: Entry): string {
    return [entry.subtitle.trim(), this.meta(entry)].filter(Boolean).join(', ');
  }

  protected languageLabel(item: SpokenLanguage): string {
    return item.level.trim() ? `${item.name}${this.separator()}${item.level}` : item.name;
  }

  /** Niveau sur 5 pour une jauge purement graphique (le niveau reste écrit pour les ATS). */
  protected languageLevel(item: SpokenLanguage): number | null {
    return languageLevel(item.level);
  }

  protected readonly levelSteps = [1, 2, 3, 4, 5];

  protected languageLine(items: SpokenLanguage[]): string {
    return items.map((item) => this.languageLabel(item)).join(' · ');
  }

  protected interestLine(items: Interest[]): string {
    return items.map((item) => item.label).join(' · ');
  }
}
