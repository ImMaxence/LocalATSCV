import { ActivatedRouteSnapshot, ViewTransitionInfo } from '@angular/router';

function leafPath(snapshot: ActivatedRouteSnapshot): string {
  const segments: string[] = [];
  for (let route: ActivatedRouteSnapshot | null = snapshot; route; route = route.firstChild) {
    segments.push(...route.url.map((segment) => segment.path));
  }
  return segments.join('/');
}

/**
 * Pas d'animation quand seule l'ancre ou un paramètre de requête change
 * (liens « Comment ça marche », changement de version dans l'éditeur).
 */
export function skipSamePageTransitions({ transition, from, to }: ViewTransitionInfo): void {
  if (leafPath(from) === leafPath(to)) transition.skipTransition();
}
