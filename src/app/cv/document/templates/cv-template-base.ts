import { Directive, computed, input } from '@angular/core';
import {
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
import { normalizeText } from '../../analysis/weak-phrases';
import { IconName } from '../../../shared/icon/icon';

const stripProtocol = (url: string): string =>
  url
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');

/** Sections placées dans la colonne latérale des modèles à deux colonnes. */
const SIDE_KINDS: readonly SectionKind[] = ['skills', 'languages', 'interests'];

export interface ContactItem {
  kind: 'location' | 'email' | 'phone' | 'link' | 'birthDate' | 'nationality';
  text: string;
}

const CONTACT_ICONS: Record<ContactItem['kind'], IconName> = {
  location: 'mapPin',
  email: 'mail',
  phone: 'phone',
  link: 'link',
  birthDate: 'calendar',
  nationality: 'flag',
};

/** Indices de niveau reconnus dans le texte saisi (CECRL et mots usuels des 5 langues). */
const LEVEL_HINTS: [RegExp, number][] = [
  [/\bc2\b|natif|native|maternelle|mother|madrelingua|nativ|muttersprache|bilingu/, 5],
  [
    /\bc1\b|courant|fluent|fluente|fluido|flie(ss|ß)end|avance|advanced|avanzat|verhandlungssicher/,
    4,
  ],
  [/\bb2\b|professionnel|professional|professionale|profesional|intermediaire.?superieur|upper/, 3],
  [/\bb1\b|intermediaire|intermediate|intermedio|mittel|conversation/, 2.5],
  [/\ba2\b|scolaire|basic|elementaire|elementary|base|grundkenntnisse/, 2],
  [/\ba1\b|debutant|beginner|principiante|anfanger|notions/, 1],
];

/**
 * Données et formatage communs à tous les modèles de CV : chaque modèle ne décrit
 * que sa mise en page. Règle commune : tout ce qui est imprimé est du vrai texte,
 * les décorations (puces, filets, pastilles) sont purement graphiques.
 */
@Directive()
export abstract class CvTemplateBase {
  readonly cv = input.required<ResolvedCv>();
  readonly photoUrl = input<string | null>(null);

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
    const items: ContactItem[] = [
      { kind: 'location', text: profile.location },
      { kind: 'email', text: profile.email },
      { kind: 'phone', text: profile.phone },
      ...profile.links.map((link) => ({ kind: 'link' as const, text: stripProtocol(link.url) })),
      {
        kind: 'birthDate',
        text:
          profile.birthDate &&
          `${labels.birthDate}${this.separator()}${formatBirthDate(profile.birthDate, language)}`,
      },
      {
        kind: 'nationality',
        text:
          profile.nationality && `${labels.nationality}${this.separator()}${profile.nationality}`,
      },
    ];
    return items.map((item) => ({ ...item, text: item.text.trim() })).filter((item) => item.text);
  });

  protected readonly contact = computed(() => this.contactItems().map((item) => item.text));
  protected readonly contactIcons = CONTACT_ICONS;

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
    return formatDateRange(entry.start, entry.end, entry.current, this.cv().language);
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

  /**
   * Niveau sur 5 déduit du texte (« C1 », « courant », « native »…), pour une jauge purement
   * graphique : le niveau reste écrit en toutes lettres pour les ATS. `null` si inconnu.
   */
  protected languageLevel(item: SpokenLanguage): number | null {
    const level = normalizeText(item.level);
    return LEVEL_HINTS.find(([pattern]) => pattern.test(level))?.[1] ?? null;
  }

  protected readonly levelSteps = [1, 2, 3, 4, 5];

  protected languageLine(items: SpokenLanguage[]): string {
    return items.map((item) => this.languageLabel(item)).join(' · ');
  }

  protected interestLine(items: Interest[]): string {
    return items.map((item) => item.label).join(' · ');
  }
}
