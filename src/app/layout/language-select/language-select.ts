import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageService } from '../../core/i18n/language.service';
import { LANGUAGE_INFO, UI_LANGUAGES, UiLanguage } from '../../core/i18n/languages';
import { Icon } from '../../shared/icon/icon';

/** Comparaison sans casse ni accents : « francais » trouve « Français ». */
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();

/** Intl.DisplayNames nomme mieux le chinois par son écriture que par son pays. */
const DISPLAY_CODES: Partial<Record<UiLanguage, string>> = { 'zh-CN': 'zh-Hans', 'zh-TW': 'zh-Hant' };

function displayNames(locale: string): Intl.DisplayNames | null {
  try {
    return new Intl.DisplayNames([locale], { type: 'language' });
  } catch {
    return null;
  }
}

/**
 * Sélecteur de langue : chaque langue est écrite dans sa propre langue, avec son nom dans la
 * langue affichée en complément. Le champ de recherche (combobox ARIA) filtre par nom natif,
 * nom traduit, nom anglais ou code ; flèches et Entrée choisissent sans souris.
 */
@Component({
  selector: 'app-language-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon, CdkOverlayOrigin, CdkConnectedOverlay],
  template: `
    <ng-container *transloco="let t">
      <button
        #trigger
        #origin="cdkOverlayOrigin"
        cdkOverlayOrigin
        type="button"
        class="group flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface ps-2 pe-1.5 text-xs font-semibold text-ink transition-[color,border-color,box-shadow] hover:border-ink/25 aria-expanded:border-accent aria-expanded:ring-2 aria-expanded:ring-accent/20"
        aria-haspopup="listbox"
        [attr.aria-expanded]="open()"
        (click)="toggle()"
      >
        <!-- Nom lu = libellé masqué + texte visible : il contient ce qu'on voit (WCAG 2.5.3). -->
        <span class="sr-only">{{ t('lang.label') }} :</span>
        <app-icon
          class="size-4 text-muted transition-colors group-hover:text-ink group-aria-expanded:text-accent"
          name="globe"
        />
        <span class="hidden max-w-28 truncate md:inline" [attr.lang]="language.current()">
          {{ info[language.current()].name }}
        </span>
        <span class="font-mono text-[11px] uppercase md:hidden">{{ language.current() }}</span>
        <app-icon
          class="size-3.5 text-muted transition-transform group-aria-expanded:rotate-180"
          name="chevronDown"
          [strokeWidth]="2"
        />
      </button>

      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="origin"
        [cdkConnectedOverlayOpen]="open()"
        [cdkConnectedOverlayPositions]="positions"
        [cdkConnectedOverlayPush]="true"
        (attach)="focusSearch()"
        (detach)="open.set(false)"
        (overlayOutsideClick)="onOutsideClick($event)"
        (overlayKeydown)="onOverlayKeydown($event)"
      >
        <div
          class="menu-in flex max-h-[min(30rem,calc(100dvh-6rem))] w-72 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xl shadow-black/10"
        >
          <div class="border-b border-line p-2">
            <label class="relative block">
              <span class="sr-only">{{ t('lang.search') }}</span>
              <app-icon
                class="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                name="search"
              />
              <input
                #search
                type="text"
                role="combobox"
                class="h-9 w-full rounded-xl border border-line bg-paper ps-9 pe-3 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20"
                autocomplete="off"
                spellcheck="false"
                aria-autocomplete="list"
                aria-expanded="true"
                [attr.aria-controls]="listId"
                [attr.aria-activedescendant]="activeId()"
                [placeholder]="t('lang.search')"
                [value]="query()"
                (input)="setQuery($event)"
                (keydown)="onSearchKeydown($event)"
              />
            </label>
          </div>

          <ul
            role="listbox"
            class="overflow-y-auto overscroll-contain p-1.5"
            [id]="listId"
            [attr.aria-label]="t('lang.label')"
          >
            @for (option of filtered(); track option.lang; let i = $index) {
              <li
                role="option"
                class="flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-ink"
                [class.bg-surface-2]="i === active()"
                [id]="optionId(option.lang)"
                [attr.aria-selected]="option.lang === language.current()"
                (mousemove)="active.set(i)"
                (click)="select(option.lang)"
              >
                <span
                  class="grid h-6 min-w-11 place-items-center rounded-md border px-1 font-mono text-[10px] font-semibold uppercase"
                  [class]="
                    option.lang === language.current()
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-line text-muted'
                  "
                >
                  {{ option.lang }}
                </span>
                <span class="min-w-0 flex-1">
                  <span
                    class="block truncate"
                    [class.font-semibold]="option.lang === language.current()"
                    [attr.lang]="option.lang"
                    >{{ option.name }}</span
                  >
                  @if (option.translated) {
                    <span class="block truncate text-xs text-muted">{{ option.translated }}</span>
                  }
                </span>
                @if (option.lang === language.current()) {
                  <app-icon class="size-4 text-accent" name="check" [strokeWidth]="2.5" />
                }
              </li>
            } @empty {
              <li class="px-2.5 py-6 text-center text-sm text-muted">{{ t('lang.noResult') }}</li>
            }
          </ul>
        </div>
      </ng-template>
    </ng-container>
  `,
})
export class LanguageSelect {
  protected readonly language = inject(LanguageService);
  protected readonly info = LANGUAGE_INFO;
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly search = viewChild<ElementRef<HTMLInputElement>>('search');

  protected readonly open = signal(false);
  protected readonly query = signal('');
  /** Position de l'option active dans la liste filtrée (aria-activedescendant). */
  protected readonly active = signal(0);
  protected readonly listId = 'language-listbox';

  /** Toutes les langues, avec leur nom dans la langue affichée quand il diffère du nom natif. */
  private readonly options = computed(() => {
    const current = this.language.current();
    const local = displayNames(current);
    const english = displayNames('en');
    return UI_LANGUAGES.map((lang) => {
      const code = DISPLAY_CODES[lang] ?? lang;
      const name = LANGUAGE_INFO[lang].name;
      const localName = local?.of(code) ?? '';
      const translated =
        localName && normalize(localName) !== normalize(name)
          ? localName.charAt(0).toLocaleUpperCase(current) + localName.slice(1)
          : '';
      const haystack = normalize([lang, name, localName, english?.of(code) ?? ''].join(' '));
      return { lang, name, translated, haystack };
    });
  });

  protected readonly filtered = computed(() => {
    const terms = normalize(this.query()).split(/\s+/).filter(Boolean);
    return this.options().filter((option) => terms.every((term) => option.haystack.includes(term)));
  });

  protected readonly activeId = computed(() => {
    const option = this.filtered()[this.active()];
    return option ? this.optionId(option.lang) : null;
  });

  protected readonly positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ];

  protected optionId(lang: UiLanguage): string {
    return `language-option-${lang}`;
  }

  protected toggle(): void {
    if (this.open()) return this.close();
    this.query.set('');
    this.active.set(Math.max(0, this.filtered().findIndex((o) => o.lang === this.language.current())));
    this.open.set(true);
  }

  protected focusSearch(): void {
    afterNextRender(
      () => {
        this.search()?.nativeElement.focus();
        this.scrollActiveIntoView();
      },
      { injector: this.injector },
    );
  }

  protected setQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.active.set(0);
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    const count = this.filtered().length;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!count) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      this.active.update((index) => (index + step + count) % count);
      this.scrollActiveIntoView();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = this.filtered()[this.active()];
      if (option) this.select(option.lang);
    }
  }

  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    } else if (event.key === 'Tab') {
      this.close(false);
    }
  }

  /** Un clic sur le bouton est déjà géré par toggle() : sans ce garde, le menu se rouvrirait. */
  protected onOutsideClick(event: MouseEvent): void {
    if (!this.trigger().nativeElement.contains(event.target as Node)) this.close(false);
  }

  protected select(lang: UiLanguage): void {
    this.close();
    void this.language.choose(lang);
  }

  private close(restoreFocus = true): void {
    this.open.set(false);
    if (restoreFocus) this.trigger().nativeElement.focus();
  }

  private scrollActiveIntoView(): void {
    afterNextRender(
      () => {
        const id = this.activeId();
        if (id) this.document.getElementById(id)?.scrollIntoView({ block: 'nearest' });
      },
      { injector: this.injector },
    );
  }
}
