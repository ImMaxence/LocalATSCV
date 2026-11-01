import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageSelect } from '../language-select/language-select';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // L'hôte ne crée pas de boîte : le sticky de <header> s'applique à toute la hauteur de la page.
  host: { class: 'contents' },
  imports: [RouterLink, RouterLinkActive, TranslocoDirective, LanguageSelect, ThemeToggle],
  template: `
    <header
      *transloco="let t"
      class="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md"
    >
      <div class="container-page flex h-16 items-center gap-3">
        <a
          routerLink="/"
          class="flex items-center gap-2.5 rounded-lg font-semibold tracking-tight"
          [attr.aria-label]="t('nav.home')"
        >
          <img src="favicon.svg" alt="" width="32" height="32" class="size-8" />
          <span class="hidden text-[15px] sm:inline"
            >Local<span class="text-accent">ATS</span>CV</span
          >
        </a>

        <nav
          class="ml-6 hidden items-center gap-1 text-sm lg:flex"
          [attr.aria-label]="t('nav.main')"
        >
          <a routerLink="/" fragment="how" class="nav-link">{{ t('nav.how') }}</a>
          <a routerLink="/" fragment="privacy" class="nav-link">{{ t('nav.privacy') }}</a>
          <a routerLink="/analyze" routerLinkActive="text-ink!" class="nav-link">
            {{ t('nav.analyze') }}
          </a>
        </nav>

        <div class="ml-auto flex items-center gap-2">
          <app-language-select />
          <app-theme-toggle />
          <a routerLink="/editor" class="btn btn-primary hidden py-2! sm:inline-flex">
            {{ t('nav.editor') }}
          </a>
        </div>
      </div>
    </header>
  `,
  styles: `
    .nav-link {
      border-radius: 9999px;
      padding: 0.375rem 0.75rem;
      color: var(--muted);
      transition: color 150ms;
    }
    .nav-link:hover {
      color: var(--ink);
    }
  `,
})
export class Header {}
