import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RichText } from '../../parts/rich-text';
import { CvTemplateBase } from '../cv-template-base';

/** Classique : sobre, une colonne, titres soulignés de la couleur d'accent. */
@Component({
  selector: 'app-cv-classic',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText],
  templateUrl: './cv-classic.html',
  styleUrl: './cv-classic.css',
})
export class CvClassic extends CvTemplateBase {}
