import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageService } from '../../core/i18n/language.service';
import { Icon, IconName } from '../../shared/icon/icon';

/** Panneau de navigation sous 1280 px, chargé à la première ouverture (voir Header). */
@Component({
  selector: 'app-mobile-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  imports: [RouterLink, TranslocoDirective, Icon],
  template: `
    <nav
      *transloco="let t"
      id="mobile-nav"
      class="menu-in absolute inset-x-0 top-full border-b border-line bg-paper shadow-xl shadow-black/10 xl:hidden"
      [attr.aria-label]="t('nav.main')"
    >
      <ul class="container-page grid gap-1 py-3 sm:grid-cols-2">
        @for (item of links(); track item.label) {
          <li>
            <a
              class="flex items-center gap-3 rounded-xl px-3 py-3 font-medium transition-colors hover:bg-surface-2"
              [routerLink]="item.link"
              [fragment]="item.fragment"
              (click)="navigated.emit()"
            >
              <app-icon class="size-5 text-accent" [name]="item.icon" />{{ t(item.label) }}
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
})
export class MobileNav {
  private readonly language = inject(LanguageService);
  readonly navigated = output<void>();

  protected readonly links = computed(
    (): { label: string; icon: IconName; link: string; fragment?: string }[] => {
      const home = this.language.link('/');
      return [
        { label: 'editor.list.title', icon: 'file', link: '/editor' },
        { label: 'nav.analyze', icon: 'scan', link: this.language.link('/analyze') },
        { label: 'nav.studio', icon: 'palette', link: '/studio' },
        { label: 'nav.how', icon: 'footprints', link: home, fragment: 'how' },
        { label: 'nav.privacy', icon: 'lock', link: home, fragment: 'privacy' },
      ];
    },
  );
}
