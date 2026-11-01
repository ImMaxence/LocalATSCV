import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  CvSection,
  Entry,
  Interest,
  SkillGroup,
  SpokenLanguage,
  isEntrySection,
} from '../model/cv.model';
import { CV_LABELS, formatBirthDate, formatDateRange, labelSeparator } from '../model/cv-labels';
import { ResolvedCv } from '../model/resolve-cv';

/** Largeur et hauteur d'une page A4 à 96 ppp. */
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

const stripProtocol = (url: string): string =>
  url
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');

/**
 * Modèle de CV pensé pour les ATS : une colonne, du vrai texte, des titres de sections standards,
 * aucune information en en-tête ou pied de page, aucune icône à la place du texte.
 * Les couleurs sont fixes : le CV reste une page blanche, quel que soit le thème de l'interface.
 */
@Component({
  selector: 'app-cv-document',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cv-document.html',
  styleUrl: './cv-document.css',
})
export class CvDocument {
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

  protected readonly contact = computed(() => {
    const { profile, language } = this.cv();
    const labels = this.labels();
    return [
      profile.location,
      profile.email,
      profile.phone,
      ...profile.links.map((link) => stripProtocol(link.url)),
      profile.birthDate &&
        `${labels.birthDate}${this.separator()}${formatBirthDate(profile.birthDate, language)}`,
      profile.nationality && `${labels.nationality}${this.separator()}${profile.nationality}`,
    ]
      .map((item) => item.trim())
      .filter(Boolean);
  });

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

  protected dates(entry: Entry): string {
    return formatDateRange(entry.start, entry.end, entry.current, this.cv().language);
  }

  protected meta(entry: Entry): string {
    return [entry.location, stripProtocol(entry.url)].filter((part) => part.trim()).join(' · ');
  }

  protected languageLine(items: SpokenLanguage[]): string {
    return items
      .map((item) =>
        item.level.trim() ? `${item.name}${this.separator()}${item.level}` : item.name,
      )
      .join(' · ');
  }

  protected interestLine(items: Interest[]): string {
    return items.map((item) => item.label).join(' · ');
  }
}
