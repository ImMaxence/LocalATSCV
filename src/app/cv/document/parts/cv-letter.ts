import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CoverLetter } from '../../model/cv.model';
import { LETTER_LABELS, letterDateLine } from '../../model/letter-labels';
import { ResolvedCv } from '../../model/resolve-cv';
import { RichText } from './rich-text';

/**
 * Corps d'une lettre de motivation, placé par chaque modèle sous son propre en-tête (nom,
 * coordonnées, photo) : la lettre reprend ainsi le design du CV. Polices et couleurs sont
 * héritées du modèle ; les champs laissés vides prennent les formules d'usage de la langue du CV.
 */
@Component({
  selector: 'app-cv-letter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText],
  host: { class: 'block' },
  template: `
    @if (letter().recipient.trim()) {
      <p class="recipient">{{ letter().recipient.trim() }}</p>
    }
    <p class="date">{{ dateLine() }}</p>
    @if (letter().subject.trim()) {
      <p class="subject">
        <strong>{{ labels().subject }}</strong> {{ letter().subject.trim() }}
      </p>
    }
    <p class="greeting">{{ letter().greeting.trim() || labels().greeting }}</p>
    @for (paragraph of paragraphs(); track $index) {
      <p class="paragraph"><app-cv-rich [text]="paragraph" /></p>
    }
    <p class="closing">{{ letter().closing.trim() || labels().closing }}</p>
    @if (signature()) {
      <p class="signature">{{ signature() }}</p>
    }
  `,
  styles: `
    :host {
      font-size: 1.04em;
      line-height: calc(1.6 * var(--cv-leading, 1));
    }
    .recipient {
      width: fit-content;
      max-width: 55%;
      margin-left: auto;
      white-space: pre-line;
    }
    .date {
      margin-top: calc(14px * var(--cv-space, 1));
      text-align: right;
    }
    .subject {
      margin-top: calc(26px * var(--cv-space, 1));
    }
    .greeting {
      margin-top: calc(22px * var(--cv-space, 1));
    }
    .paragraph {
      margin-top: calc(12px * var(--cv-space, 1));
      text-align: justify;
      white-space: pre-line;
    }
    .closing {
      margin-top: calc(16px * var(--cv-space, 1));
      white-space: pre-line;
    }
    .signature {
      width: fit-content;
      margin: calc(26px * var(--cv-space, 1)) 0 0 auto;
      font-weight: 700;
    }
  `,
})
export class CvLetter {
  readonly letter = input.required<CoverLetter>();
  readonly cv = input.required<ResolvedCv>();

  protected readonly labels = computed(() => LETTER_LABELS[this.cv().language]);
  protected readonly dateLine = computed(() =>
    letterDateLine(this.letter().place, this.letter().date, this.cv().language),
  );
  protected readonly paragraphs = computed(() =>
    this.letter()
      .body.split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
  );
  protected readonly signature = computed(() => {
    const { firstName, lastName } = this.cv().profile;
    return [firstName, lastName]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(' ');
  });
}
