import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';
import { readSetting, writeSetting } from '../storage/local-settings';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme';
const THEME_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

function isThemePreference(value: string | null): value is ThemePreference {
  return THEME_PREFERENCES.includes(value as ThemePreference);
}

/**
 * Gère le thème clair / sombre. La préférence est mémorisée dans localStorage ;
 * en mode « système », on suit `prefers-color-scheme` en direct.
 * Le script public/theme-init.js applique la même logique avant le démarrage d'Angular.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media =
    typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
  private readonly systemPrefersDark = signal(this.media?.matches ?? false);

  readonly preference = signal<ThemePreference>(this.readPreference());
  readonly isDark = computed(
    () =>
      this.preference() === 'dark' || (this.preference() === 'system' && this.systemPrefersDark()),
  );

  constructor() {
    this.media?.addEventListener('change', (event) => this.systemPrefersDark.set(event.matches));

    effect(() => {
      const root = this.document.documentElement;
      root.classList.toggle('dark', this.isDark());
      root.style.colorScheme = this.isDark() ? 'dark' : 'light';
    });
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);
    writeSetting(STORAGE_KEY, preference);
  }

  private readPreference(): ThemePreference {
    const stored = readSetting(STORAGE_KEY);
    return isThemePreference(stored) ? stored : 'system';
  }
}
