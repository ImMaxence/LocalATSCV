import { RenderMode, ServerRoute } from '@angular/ssr';
import { PUBLIC_PAGES, UI_LANGUAGES, localizedPath } from './core/i18n/languages';

/**
 * Pages publiques pré-générées en HTML au build (SSG), dans chaque langue : leur contenu est
 * lisible par les moteurs de recherche et les robots des IA, qui n'exécutent souvent pas
 * JavaScript. L'éditeur, qui ne travaille que sur des données locales, reste rendu dans le
 * navigateur.
 */
export const serverRoutes: ServerRoute[] = [
  ...UI_LANGUAGES.flatMap((lang) =>
    PUBLIC_PAGES.map(
      (page): ServerRoute => ({
        path: localizedPath(page, lang).slice(1),
        renderMode: RenderMode.Prerender,
      }),
    ),
  ),
  { path: '**', renderMode: RenderMode.Client },
];
