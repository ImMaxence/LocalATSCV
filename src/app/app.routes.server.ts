import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Pages publiques pré-générées en HTML au build (SSG) : leur contenu est lisible par les moteurs
 * de recherche et les robots des IA, qui n'exécutent souvent pas JavaScript. L'éditeur, qui ne
 * travaille que sur des données locales, reste rendu dans le navigateur.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'analyze', renderMode: RenderMode.Prerender },
  { path: 'changelog', renderMode: RenderMode.Prerender },
  { path: 'legal/notice', renderMode: RenderMode.Prerender },
  { path: 'legal/terms', renderMode: RenderMode.Prerender },
  { path: 'legal/privacy', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
