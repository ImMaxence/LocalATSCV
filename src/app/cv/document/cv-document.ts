import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { fontStack } from '../model/cv-fonts';
import { ResolvedCv } from '../model/resolve-cv';
import { CvAurora } from './templates/aurora/cv-aurora';
import { CvClassic } from './templates/classic/cv-classic';
import { CvElegant } from './templates/elegant/cv-elegant';
import { CvImpact } from './templates/impact/cv-impact';
import { CvMinimal } from './templates/minimal/cv-minimal';
import { CvModern } from './templates/modern/cv-modern';
import { CvPulse } from './templates/pulse/cv-pulse';
import { CvSidebar } from './templates/sidebar/cv-sidebar';
import { CvSignature } from './templates/signature/cv-signature';
import { CvTech } from './templates/tech/cv-tech';

/** Largeur et hauteur d'une page A4 à 96 ppp. */
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

/** Rend le CV avec le modèle choisi. Utilisé par l'aperçu, les vignettes et l'export PDF. */
@Component({
  selector: 'app-cv-document',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CvSignature,
    CvAurora,
    CvPulse,
    CvClassic,
    CvImpact,
    CvModern,
    CvElegant,
    CvTech,
    CvMinimal,
    CvSidebar,
  ],
  host: {
    class: 'block',
    '[style.--cv-heading-font]': 'headingFont()',
    '[style.--cv-body-font]': 'bodyFont()',
  },
  template: `
    @switch (cv().template) {
      @case ('signature') {
        <app-cv-signature [cv]="cv()" [photoUrl]="photoUrl()" />
      }
      @case ('aurora') {
        <app-cv-aurora [cv]="cv()" [photoUrl]="photoUrl()" />
      }
      @case ('pulse') {
        <app-cv-pulse [cv]="cv()" [photoUrl]="photoUrl()" />
      }
      @case ('impact') {
        <app-cv-impact [cv]="cv()" [photoUrl]="photoUrl()" />
      }
      @case ('modern') {
        <app-cv-modern [cv]="cv()" [photoUrl]="photoUrl()" />
      }
      @case ('elegant') {
        <app-cv-elegant [cv]="cv()" [photoUrl]="photoUrl()" />
      }
      @case ('tech') {
        <app-cv-tech [cv]="cv()" [photoUrl]="photoUrl()" />
      }
      @case ('minimal') {
        <app-cv-minimal [cv]="cv()" [photoUrl]="photoUrl()" />
      }
      @case ('sidebar') {
        <app-cv-sidebar [cv]="cv()" [photoUrl]="photoUrl()" />
      }
      @default {
        <app-cv-classic [cv]="cv()" [photoUrl]="photoUrl()" />
      }
    }
  `,
})
export class CvDocument {
  readonly cv = input.required<ResolvedCv>();
  readonly photoUrl = input<string | null>(null);

  /** Polices choisies par l'utilisateur ; sinon chaque modèle garde les siennes. */
  protected readonly headingFont = computed(() => fontStack(this.cv().fonts?.heading ?? null));
  protected readonly bodyFont = computed(() => fontStack(this.cv().fonts?.body ?? null));
}
