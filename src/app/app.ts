import { Dir } from '@angular/cdk/bidi';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageService } from './core/i18n/language.service';
import { ThemeService } from './core/theme/theme.service';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';
import { LanguageSuggestion } from './layout/language-suggestion/language-suggestion';
import { UpdateToast } from './layout/update-toast/update-toast';
import { ToastOutlet } from './shared/toast/toast';

@Component({
  selector: 'app-root',
  imports: [
    Dir,
    RouterOutlet,
    TranslocoDirective,
    Header,
    Footer,
    LanguageSuggestion,
    UpdateToast,
    ToastOutlet,
  ],
  template: `
    <ng-container *transloco="let t">
      <a
        href="#main"
        class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        {{ t('nav.skipToContent') }}
      </a>
    </ng-container>
    <!-- Sens d'écriture transmis aux menus et fenêtres du CDK (arabe, hébreu, persan, ourdou). -->
    <div class="flex min-h-dvh flex-col" [dir]="language.direction()">
      <app-header />
      <app-language-suggestion />
      <!-- Au moins la hauteur de l'écran : quand la page est rendue dans le navigateur (visite
           servie par le service worker), le pied de page reste sous la ligne de flottaison le
           temps que le contenu arrive, au lieu de sauter vers le bas sous les yeux (CLS). -->
      <main id="main" class="min-h-dvh flex-1">
        <router-outlet />
      </main>
      <app-footer />
      <app-update-toast />
      <app-toast-outlet />
    </div>
  `,
})
export class App {
  // Instancié dès le démarrage pour appliquer et suivre le thème.
  protected readonly theme = inject(ThemeService);
  protected readonly language = inject(LanguageService);
}
