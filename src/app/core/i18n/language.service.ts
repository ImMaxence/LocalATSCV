import { PlatformLocation, isPlatformBrowser } from '@angular/common';
import { DOCUMENT, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { readSetting, writeSetting } from '../storage/local-settings';
import {
  DEFAULT_UI_LANGUAGE,
  LANGUAGE_INFO,
  UiLanguage,
  isUiLanguage,
  languageFromPath,
  localizedPath,
  matchLanguage,
  publicPage,
} from './languages';

const STORAGE_KEY = 'lang';
const SUGGESTION_KEY = 'langSuggestion';

/** Première langue du navigateur que l'interface sait afficher. */
export function browserLanguage(browserLanguages: readonly string[]): UiLanguage | null {
  for (const tag of browserLanguages) {
    const lang = matchLanguage(tag);
    if (lang) return lang;
  }
  return null;
}

/**
 * Langue du premier affichage. Une page publique s'affiche dans la langue de son URL, sauf si
 * le visiteur a déjà choisi une autre langue dans le menu : il y est alors redirigé (voir
 * languageGuard). Les pages de l'application (éditeur) suivent ce choix, sinon la langue du
 * navigateur.
 */
export function initialLanguage(
  path: string,
  stored: UiLanguage | null,
  browserLanguages: readonly string[],
): UiLanguage {
  const urlLanguage = languageFromPath(path);
  if (urlLanguage || publicPage(path)) return stored ?? urlLanguage ?? DEFAULT_UI_LANGUAGE;
  return stored ?? browserLanguage(browserLanguages) ?? DEFAULT_UI_LANGUAGE;
}

/** Même URL dans une autre langue (/ja/analyze#x → /de/analyze#x), ou null hors des pages publiques. */
export function localizedUrl(url: string, lang: UiLanguage): string | null {
  const page = publicPage(url);
  if (!page) return null;
  const suffix = url.match(/[?#].*$/)?.[0] ?? '';
  return localizedPath(page, lang) + suffix;
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  /** Au build (pages pré-générées), seule l'URL compte : Node a aussi un `navigator`. */
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly navigatorLanguage = this.browser
    ? browserLanguage(navigator.languages ?? [])
    : null;

  /** Langue choisie explicitement (menu, liens de langue), mémorisée dans ce navigateur. */
  readonly stored = signal<UiLanguage | null>(this.readStored());
  private readonly suggestionDismissed = signal(
    this.browser && readSetting(SUGGESTION_KEY) === 'off',
  );

  readonly current = signal<UiLanguage>(
    initialLanguage(
      inject(PlatformLocation).pathname,
      this.stored(),
      this.browser ? (navigator.languages ?? []) : [],
    ),
  );
  readonly direction = computed(() => (LANGUAGE_INFO[this.current()].rtl ? 'rtl' : 'ltr'));

  /** Langue du navigateur à proposer quand la page s'affiche dans une autre et que rien n'a été choisi. */
  readonly suggestion = computed(() => {
    const lang = this.navigatorLanguage;
    if (!lang || this.stored() || this.suggestionDismissed()) return null;
    return lang === this.current() ? null : lang;
  });

  /** Charge les traductions de la langue initiale avant le premier rendu. */
  init(): Promise<void> {
    return this.activate(this.current());
  }

  /** Langue imposée par l'URL d'une page publique (voir languageGuard). */
  enter(lang: UiLanguage): Promise<void> {
    return this.activate(lang);
  }

  /** Lien vers une page publique dans la langue affichée. */
  link(page: string): string {
    return localizedPath(page, this.current());
  }

  /** Mémorise un choix explicite : il s'appliquera aussi aux prochaines visites. */
  remember(lang: UiLanguage): void {
    this.stored.set(lang);
    writeSetting(STORAGE_KEY, lang);
  }

  /** Choix dans le menu : une page publique est rouverte à son adresse dans la nouvelle langue. */
  async choose(lang: UiLanguage): Promise<void> {
    this.remember(lang);
    await this.activate(lang);
    const target = localizedUrl(this.router.url, lang);
    if (target && target !== this.router.url) await this.router.navigateByUrl(target);
  }

  dismissSuggestion(): void {
    this.suggestionDismissed.set(true);
    writeSetting(SUGGESTION_KEY, 'off');
  }

  private readStored(): UiLanguage | null {
    if (!this.browser) return null;
    const value = readSetting(STORAGE_KEY);
    return isUiLanguage(value) ? value : null;
  }

  private async activate(lang: UiLanguage): Promise<void> {
    try {
      await firstValueFrom(this.transloco.load(lang));
    } catch {
      // Traductions injoignables : Transloco se rabat sur l'anglais, l'app reste utilisable.
    }
    this.current.set(lang);
    this.transloco.setActiveLang(lang);
    const root = this.document.documentElement;
    root.lang = lang;
    root.dir = this.direction();
  }
}

/**
 * Applique la langue d'un groupe de pages publiques (donnée de route `lang`) avant leur rendu,
 * pré-génération comprise. Au premier chargement seulement, un visiteur qui a déjà choisi une
 * autre langue est redirigé vers la même page dans celle-ci : les robots, sans mémoire, ne le
 * sont jamais.
 */
export const languageGuard: CanActivateFn = (route, state) => {
  const language = inject(LanguageService);
  const router = inject(Router);
  const lang = route.data['lang'] as UiLanguage;
  const stored = language.stored();
  if (!router.navigated && stored && stored !== lang) {
    const target = localizedUrl(state.url, stored);
    if (target) return router.parseUrl(target);
  }
  return language.enter(lang).then(() => true);
};
