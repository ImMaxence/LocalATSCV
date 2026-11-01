import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface RichPart {
  text: string;
  bold: boolean;
}

/** `Migration vers **Angular**` → « Angular » en gras. Un `**` orphelin reste du texte normal. */
export function parseRichText(text: string): RichPart[] {
  const pieces = text.split('**');
  const closed = pieces.length % 2 === 1;
  return pieces
    .map((piece, index) => ({
      text: piece,
      bold: index % 2 === 1 && (closed || index < pieces.length - 1),
    }))
    .map((part, index) =>
      !closed && index === pieces.length - 1 && index % 2 === 1
        ? { text: `**${part.text}`, bold: false }
        : part,
    )
    .filter((part) => part.text.length > 0);
}

/** Texte d'une puce avec mots en gras : du vrai texte balisé, rien ne change pour un ATS. */
@Component({
  selector: 'app-cv-rich',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `@for (part of parts(); track $index) {
    @if (part.bold) {
      <strong class="cv-strong">{{ part.text }}</strong>
    } @else {
      <ng-container>{{ part.text }}</ng-container>
    }
  }`,
})
export class RichText {
  readonly text = input.required<string>();
  protected readonly parts = computed(() => parseRichText(this.text()));
}
