import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { ThemeService } from './core/theme/theme.service';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';
import { UpdateToast } from './layout/update-toast/update-toast';
import { ToastOutlet } from './shared/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslocoDirective, Header, Footer, UpdateToast, ToastOutlet],
  template: `
    <ng-container *transloco="let t">
      <a
        href="#main"
        class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        {{ t('nav.skipToContent') }}
      </a>
    </ng-container>
    <div class="flex min-h-dvh flex-col">
      <app-header />
      <main id="main" class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
    </div>
    <app-update-toast />
    <app-toast-outlet />
  `,
})
export class App {
  // Instancié dès le démarrage pour appliquer et suivre le thème.
  protected readonly theme = inject(ThemeService);
}
