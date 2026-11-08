import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageService } from '../../core/i18n/language.service';
import { Icon } from '../../shared/icon/icon';
import { DisplayMenu } from '../display-menu/display-menu';
import { LanguageSelect } from '../language-select/language-select';
import { MobileNav } from './mobile-nav';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // L'hôte ne crée pas de boîte : le sticky de <header> s'applique à toute la hauteur de la page.
  host: {
    class: 'contents',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscape()',
  },
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslocoDirective,
    Icon,
    LanguageSelect,
    DisplayMenu,
    ThemeToggle,
    MobileNav,
  ],
  template: `
    <header
      *transloco="let t"
      class="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md"
    >
      <div class="container-page flex h-16 items-center gap-3">
        <a
          [routerLink]="language.link('/')"
          class="flex items-center gap-2.5 rounded-lg font-semibold tracking-tight"
          [attr.aria-label]="t('nav.home')"
        >
          <img src="favicon.svg" alt="" width="32" height="32" class="size-8" />
          <span class="hidden text-[15px] sm:inline"
            >Local<span class="text-accent">ATS</span>CV</span
          >
        </a>

        <nav
          class="ms-6 hidden items-center gap-1 text-sm lg:flex"
          [attr.aria-label]="t('nav.main')"
        >
          <a [routerLink]="language.link('/')" fragment="how" class="nav-link">{{ t('nav.how') }}</a>
          <a [routerLink]="language.link('/')" fragment="privacy" class="nav-link">{{ t('nav.privacy') }}</a>
          <a
            [routerLink]="language.link('/analyze')"
            routerLinkActive="text-ink!"
            class="nav-link"
          >
            {{ t('nav.analyze') }}
          </a>
        </nav>

        <div class="ms-auto flex items-center gap-1.5 sm:gap-2">
          <app-language-select />
          <app-display-menu />
          <app-theme-toggle />
          <a routerLink="/editor" class="btn btn-primary hidden py-2! sm:inline-flex">
            {{ t('nav.editor') }}
          </a>
          <button
            type="button"
            class="grid size-8 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:border-ink/25 hover:text-ink aria-expanded:border-accent aria-expanded:text-accent lg:hidden"
            [attr.aria-controls]="menuOpen() ? 'mobile-nav' : null"
            [attr.aria-expanded]="menuOpen()"
            [attr.aria-label]="t('nav.main')"
            [title]="t('nav.main')"
            (click)="menuOpen.set(!menuOpen())"
          >
            <app-icon class="size-4" [name]="menuOpen() ? 'x' : 'menu'" />
          </button>
        </div>
      </div>

      <!-- Navigation sous 1024 px, à part : l'en-tête est dans le bundle initial -->
      @if (menuOpen()) {
        @defer (on immediate) {
          <app-mobile-nav (navigated)="menuOpen.set(false)" />
        }
      }
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
export class Header {
  protected readonly language = inject(LanguageService);

  protected readonly menuOpen = signal(false);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  /** Un clic hors de l'en-tête (barre et panneau) referme le menu. */
  protected onDocumentClick(event: Event): void {
    if (this.menuOpen() && !(event.target as Element).closest('header')) this.menuOpen.set(false);
  }

  protected onEscape(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.host.querySelector<HTMLElement>('[aria-controls]')?.focus();
  }
}
