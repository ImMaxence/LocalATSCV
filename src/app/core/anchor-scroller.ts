import { DOCUMENT, ViewportScroller, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

/**
 * Défilement du routeur, avec `scrollIntoView` pour les ancres (/#privacy…).
 *
 * Le défilement par défaut d'Angular vise aussi la position horizontale de la section. Or,
 * pendant une transition de page, le navigateur élargit la page de la largeur de la barre de
 * défilement : la page glissait alors de côté, puis revenait d'un coup à la fin de l'animation.
 * `scrollIntoView` ne défile pas à l'horizontale quand la section est déjà visible en largeur,
 * et respecte `scroll-padding-top` (hauteur de l'en-tête collant). Sans effet au build (pas de fenêtre).
 */
@Injectable()
export class AnchorScroller extends ViewportScroller {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Le décalage sous l'en-tête est géré en CSS (`scroll-padding-top`). */
  setOffset(): void {}

  getScrollPosition(): [number, number] {
    return this.browser ? [window.scrollX, window.scrollY] : [0, 0];
  }

  scrollToPosition(position: [number, number], options?: ScrollOptions): void {
    if (this.browser) window.scrollTo({ ...options, left: position[0], top: position[1] });
  }

  scrollToAnchor(anchor: string, options?: ScrollOptions): void {
    if (!this.browser) return;
    const target =
      this.document.getElementById(anchor) ?? this.document.getElementsByName(anchor).item(0);
    target?.scrollIntoView({ ...options, block: 'start' });
  }

  setHistoryScrollRestoration(scrollRestoration: 'auto' | 'manual'): void {
    if (this.browser) history.scrollRestoration = scrollRestoration;
  }
}
