import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Champ libellé + saisie, piloté par valeur (pas de formulaire réactif : le store est la source). */
@Component({
  selector: 'app-text-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <label class="block">
      <span class="field-label">
        {{ label() }}
        @if (badge()) {
          <span class="ml-1 rounded bg-surface-2 px-1.5 py-px text-[10px] font-semibold">{{
            badge()
          }}</span>
        }
      </span>
      @if (multiline()) {
        <textarea
          class="field-input field-auto min-h-20 resize-y"
          [value]="value()"
          [placeholder]="placeholder()"
          (input)="emit($event)"
        ></textarea>
      } @else {
        <input
          class="field-input"
          [type]="type()"
          [value]="value()"
          [placeholder]="placeholder()"
          [attr.autocomplete]="autocomplete()"
          (input)="emit($event)"
        />
      }
    </label>
  `,
})
export class TextField {
  readonly label = input.required<string>();
  readonly value = input('');
  readonly placeholder = input('');
  readonly type = input<'text' | 'email' | 'tel' | 'url' | 'date'>('text');
  readonly multiline = input(false);
  readonly autocomplete = input<string | null>('off');
  /** Petite mention à côté du libellé (ex. « Masqué en anglais »). */
  readonly badge = input('');

  readonly valueChange = output<string>();

  protected emit(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement | HTMLTextAreaElement).value);
  }
}
