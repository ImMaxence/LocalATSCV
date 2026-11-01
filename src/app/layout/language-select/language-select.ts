import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageService, UI_LANGUAGES, isUiLanguage } from '../../core/i18n/language.service';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-language-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon],
  template: `
    <label
      *transloco="let t"
      class="relative flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface pr-2 pl-2.5 text-muted transition-colors focus-within:text-ink hover:text-ink"
    >
      <app-icon class="size-4" name="globe" />
      <span class="sr-only">{{ t('lang.label') }}</span>
      <select
        class="cursor-pointer appearance-none bg-transparent pr-1 text-xs font-semibold text-ink uppercase outline-none"
        [value]="language.current()"
        (change)="onChange($event)"
      >
        @for (lang of languages; track lang) {
          <option [value]="lang" [selected]="lang === language.current()">
            {{ lang.toUpperCase() }} · {{ t('lang.' + lang) }}
          </option>
        }
      </select>
    </label>
  `,
})
export class LanguageSelect {
  protected readonly language = inject(LanguageService);
  protected readonly languages = UI_LANGUAGES;

  protected onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (isUiLanguage(value)) this.language.use(value);
  }
}
