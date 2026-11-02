import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageService } from '../../core/i18n/language.service';

/**
 * Saisie d'une date « mois (facultatif) + année », stockée au format `AAAA` ou `AAAA-MM`.
 * Évite `<input type="month">`, absent de Firefox.
 */
@Component({
  selector: 'app-month-year-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective],
  host: { class: 'block' },
  template: `
    <fieldset *transloco="let t" [disabled]="disabled()" class="min-w-0">
      <legend class="field-label">{{ label() }}</legend>
      <div class="flex gap-1.5">
        <select
          class="field-input min-w-0 flex-1 pe-1"
          [attr.aria-label]="label() + ' · ' + t('editor.month')"
          (change)="setMonth($event)"
        >
          <option value="" [selected]="!month()">{{ t('editor.noMonth') }}</option>
          @for (name of monthNames(); track $index) {
            <option [value]="$index + 1" [selected]="month() === $index + 1">{{ name }}</option>
          }
        </select>
        <input
          class="field-input w-[4.75rem] shrink-0"
          inputmode="numeric"
          maxlength="4"
          [placeholder]="t('editor.year')"
          [attr.aria-label]="label() + ' · ' + t('editor.year')"
          [value]="year()"
          (input)="setYear($event)"
        />
      </div>
    </fieldset>
  `,
})
export class MonthYearField {
  readonly label = input.required<string>();
  readonly value = input('');
  readonly disabled = input(false);
  readonly valueChange = output<string>();

  private readonly language = inject(LanguageService);

  protected readonly year = computed(() => this.value().slice(0, 4));
  /** Mois choisi avant l'année : gardé en attente tant que l'année n'est pas saisie. */
  private readonly pendingMonth = signal(0);
  protected readonly month = computed(
    () => Number(this.value().slice(5, 7)) || (this.year() ? 0 : this.pendingMonth()),
  );
  protected readonly monthNames = computed(() => {
    const format = new Intl.DateTimeFormat(this.language.current(), {
      month: 'long',
      timeZone: 'UTC',
    });
    return Array.from({ length: 12 }, (_, i) => format.format(new Date(Date.UTC(2000, i, 1))));
  });

  protected setMonth(event: Event): void {
    const month = Number((event.target as HTMLSelectElement).value);
    this.pendingMonth.set(month);
    this.emit(this.year(), month);
  }

  protected setYear(event: Event): void {
    const year = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4);
    this.emit(year, this.month());
  }

  private emit(year: string, month: number): void {
    if (!year) return this.valueChange.emit('');
    this.valueChange.emit(month ? `${year}-${String(month).padStart(2, '0')}` : year);
  }
}
