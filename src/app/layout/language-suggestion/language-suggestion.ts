import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageService } from '../../core/i18n/language.service';
import { LANGUAGE_INFO } from '../../core/i18n/languages';
import { Icon } from '../../shared/icon/icon';

/**
 * Bandeau rédigé dans la langue du navigateur, quand la page s'affiche dans une autre et que le
 * visiteur n'a encore rien choisi. Aucune redirection automatique : chaque version garde son
 * adresse, pour les visiteurs comme pour les moteurs de recherche.
 */
@Component({
  selector: 'app-language-suggestion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon],
  template: `
    @if (ready() && language.suggestion(); as lang) {
      <div
        *transloco="let t; lang: lang"
        class="border-b border-line bg-accent-soft/60"
        [attr.lang]="lang"
        [attr.dir]="info[lang].rtl ? 'rtl' : 'ltr'"
      >
        <div class="container-page flex items-center gap-3 py-2 text-sm">
          <app-icon class="size-4 text-accent" name="globe" />
          <button
            type="button"
            class="flex-1 text-start font-medium underline-offset-2 hover:underline"
            (click)="language.choose(lang)"
          >
            {{ t('lang.suggestion') }}
          </button>
          <button
            type="button"
            class="icon-btn size-7"
            [attr.aria-label]="t('lang.dismiss')"
            [title]="t('lang.dismiss')"
            (click)="language.dismissSuggestion()"
          >
            <app-icon class="size-4" name="x" />
          </button>
        </div>
      </div>
    }
  `,
})
export class LanguageSuggestion {
  protected readonly language = inject(LanguageService);
  protected readonly info = LANGUAGE_INFO;
  /**
   * Le bandeau dépend du navigateur (langue, choix mémorisé) : absent de la page pré-générée,
   * il n'apparaît qu'après l'hydratation, sinon le DOM du client ne correspondrait plus.
   */
  protected readonly ready = signal(false);

  constructor() {
    afterNextRender(() => this.ready.set(true));
  }
}
