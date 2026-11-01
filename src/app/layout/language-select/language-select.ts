import { CdkMenu, CdkMenuItemRadio, CdkMenuTrigger } from '@angular/cdk/menu';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageService, UI_LANGUAGES, UiLanguage } from '../../core/i18n/language.service';
import { Icon } from '../../shared/icon/icon';

/** Chaque langue est affichée dans sa propre langue, quel que soit le choix courant. */
const NATIVE_NAMES: Record<UiLanguage, string> = {
  fr: 'Français',
  en: 'English',
  it: 'Italiano',
  es: 'Español',
  de: 'Deutsch',
};

@Component({
  selector: 'app-language-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon, CdkMenuTrigger, CdkMenu, CdkMenuItemRadio],
  template: `
    <ng-container *transloco="let t">
      <button
        type="button"
        class="group flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface pr-2 pl-2.5 text-xs font-semibold text-muted transition-colors hover:border-ink/25 hover:text-ink aria-expanded:border-ink/25 aria-expanded:text-ink"
        [cdkMenuTriggerFor]="menu"
        [cdkMenuPosition]="positions"
        [attr.aria-label]="t('lang.label') + ' : ' + names[language.current()]"
      >
        <app-icon class="size-4" name="globe" />
        <span class="text-ink uppercase">{{ language.current() }}</span>
        <app-icon
          class="size-3.5 transition-transform group-aria-expanded:rotate-180"
          name="chevronDown"
          [strokeWidth]="2"
        />
      </button>

      <ng-template #menu>
        <div
          cdkMenu
          class="menu-in min-w-48 rounded-2xl border border-line bg-surface p-1.5 shadow-xl shadow-black/10"
        >
          <p
            class="px-2.5 pt-1.5 pb-2 text-[11px] font-semibold tracking-wider text-muted uppercase"
          >
            {{ t('lang.label') }}
          </p>
          @for (lang of languages; track lang) {
            <button
              type="button"
              cdkMenuItemRadio
              class="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm text-ink outline-none hover:bg-surface-2 focus-visible:bg-surface-2 aria-checked:font-semibold"
              [cdkMenuItemChecked]="lang === language.current()"
              [attr.lang]="lang"
              (cdkMenuItemTriggered)="language.use(lang)"
            >
              <span
                class="grid h-6 w-8 place-items-center rounded-md border font-mono text-[10px] font-semibold uppercase"
                [class]="
                  lang === language.current()
                    ? 'border-accent text-accent'
                    : 'border-line text-muted'
                "
              >
                {{ lang }}
              </span>
              <span class="flex-1">{{ names[lang] }}</span>
              @if (lang === language.current()) {
                <app-icon class="size-4 text-accent" name="check" [strokeWidth]="2.5" />
              }
            </button>
          }
        </div>
      </ng-template>
    </ng-container>
  `,
})
export class LanguageSelect {
  protected readonly language = inject(LanguageService);
  protected readonly languages = UI_LANGUAGES;
  protected readonly names = NATIVE_NAMES;

  protected readonly positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ];
}
