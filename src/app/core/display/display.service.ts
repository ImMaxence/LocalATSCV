import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';
import { readSetting, writeSetting } from '../storage/local-settings';

export const TEXT_SIZES = ['normal', 'large', 'xlarge'] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

/** Réglages qui se cochent ou se décochent, chacun posé comme classe sur <html>. */
export const DISPLAY_OPTIONS = ['readableFont', 'spacing', 'contrast', 'reduceMotion'] as const;
export type DisplayOption = (typeof DISPLAY_OPTIONS)[number];

export interface DisplaySettings {
  textSize: TextSize;
  options: DisplayOption[];
}

const STORAGE_KEY = 'display';
const DEFAULT_SETTINGS: DisplaySettings = { textSize: 'normal', options: [] };

/** Classe CSS de chaque réglage (voir styles.css). */
export const DISPLAY_CLASSES: Record<DisplayOption, string> = {
  readableFont: 'a11y-font',
  spacing: 'a11y-spacing',
  contrast: 'a11y-contrast',
  reduceMotion: 'a11y-motion',
};

function parse(raw: string | null): DisplaySettings {
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    if (typeof value !== 'object' || value === null) return DEFAULT_SETTINGS;
    const { textSize, options } = value as Partial<DisplaySettings>;
    return {
      textSize: TEXT_SIZES.includes(textSize as TextSize) ? (textSize as TextSize) : 'normal',
      options: Array.isArray(options)
        ? DISPLAY_OPTIONS.filter((option) => options.includes(option))
        : [],
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Réglages d'affichage pour les personnes malvoyantes, dyslexiques ou sensibles aux animations :
 * taille du texte, police très lisible, espacement, contraste, animations réduites. Ils touchent
 * l'interface seulement, jamais le CV imprimé. Le script public/theme-init.js les applique avant
 * le démarrage d'Angular, pour éviter un saut à l'ouverture de la page.
 */
@Injectable({ providedIn: 'root' })
export class DisplayService {
  private readonly document = inject(DOCUMENT);

  readonly settings = signal<DisplaySettings>(parse(readSetting(STORAGE_KEY)));

  constructor() {
    effect(() => {
      const { textSize, options } = this.settings();
      const root = this.document.documentElement;
      if (textSize === 'normal') root.removeAttribute('data-text-size');
      else root.setAttribute('data-text-size', textSize);
      for (const option of DISPLAY_OPTIONS) {
        root.classList.toggle(DISPLAY_CLASSES[option], options.includes(option));
      }
    });
  }

  has(option: DisplayOption): boolean {
    return this.settings().options.includes(option);
  }

  isDefault(): boolean {
    const { textSize, options } = this.settings();
    return textSize === 'normal' && options.length === 0;
  }

  setTextSize(textSize: TextSize): void {
    this.save({ ...this.settings(), textSize });
  }

  toggle(option: DisplayOption): void {
    const { options } = this.settings();
    this.save({
      ...this.settings(),
      options: options.includes(option)
        ? options.filter((o) => o !== option)
        : DISPLAY_OPTIONS.filter((o) => o === option || options.includes(o)),
    });
  }

  reset(): void {
    this.save(DEFAULT_SETTINGS);
  }

  private save(settings: DisplaySettings): void {
    this.settings.set(settings);
    writeSetting(STORAGE_KEY, JSON.stringify(settings));
  }
}
