import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ResolvedCv } from '../model/resolve-cv';
import { CvClassic } from './templates/classic/cv-classic';
import { CvElegant } from './templates/elegant/cv-elegant';
import { CvImpact } from './templates/impact/cv-impact';
import { CvMinimal } from './templates/minimal/cv-minimal';
import { CvModern } from './templates/modern/cv-modern';
import { CvSidebar } from './templates/sidebar/cv-sidebar';
import { CvTech } from './templates/tech/cv-tech';

/** Largeur et hauteur d'une page A4 à 96 ppp. */
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

/** Rend le CV avec le modèle choisi. Utilisé par l'aperçu, les vignettes et l'export PDF. */
@Component({
  selector: 'app-cv-document',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CvClassic, CvImpact, CvModern, CvElegant, CvTech, CvMinimal, CvSidebar],
  host: { class: 'block' },
  template: `
    @switch (cv().template) {
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
}
