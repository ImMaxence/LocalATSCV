import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { readSetting, writeSetting } from '../storage/local-settings';

/** Langues de l'interface. La langue de chaque CV est choisie séparément. */
export const UI_LANGUAGES = ['fr', 'en', 'it', 'es', 'de'] as const;
export type UiLanguage = (typeof UI_LANGUAGES)[number];

export const DEFAULT_UI_LANGUAGE: UiLanguage = 'fr';
const STORAGE_KEY = 'lang';

export function isUiLanguage(value: string | null | undefined): value is UiLanguage {
  return UI_LANGUAGES.includes(value as UiLanguage);
}

/** Langue mémorisée si elle existe, sinon la première langue du navigateur que l'on sait afficher. */
export function detectInitialLanguage(
  stored: string | null,
  browserLanguages: readonly string[],
): UiLanguage {
  if (isUiLanguage(stored)) return stored;
  for (const tag of browserLanguages) {
    const base = tag.toLowerCase().split('-')[0];
    if (isUiLanguage(base)) return base;
  }
  return DEFAULT_UI_LANGUAGE;
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);

  readonly current = signal<UiLanguage>(
    detectInitialLanguage(readSetting(STORAGE_KEY), globalThis.navigator?.languages ?? []),
  );

  /** Charge les traductions de la langue initiale avant le premier rendu. */
  async init(): Promise<void> {
    const lang = this.current();
    try {
      await firstValueFrom(this.transloco.load(lang));
    } catch {
      // Traductions injoignables : Transloco affichera les clés, l'app reste utilisable.
    }
    this.apply(lang);
  }

  use(lang: UiLanguage): void {
    this.current.set(lang);
    writeSetting(STORAGE_KEY, lang);
    this.apply(lang);
  }

  private apply(lang: UiLanguage): void {
    this.transloco.setActiveLang(lang);
    this.document.documentElement.lang = lang;
  }
}
