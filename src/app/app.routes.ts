import { Routes } from '@angular/router';
import { languageGuard } from './core/i18n/language.service';
import { DEFAULT_UI_LANGUAGE, UI_LANGUAGES, languageSegment } from './core/i18n/languages';

const legalPage = () => import('./pages/legal/legal-page').then((m) => m.LegalPage);

// Les `title` sont des clés de traduction (voir TranslatedTitleStrategy).
const publicRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
    title: 'pages.home',
  },
  {
    path: 'analyze',
    loadComponent: () => import('./pages/analyze/analyze').then((m) => m.Analyze),
    title: 'pages.analyze',
  },
  {
    path: 'changelog',
    loadComponent: () => import('./pages/changelog/changelog').then((m) => m.Changelog),
    title: 'pages.changelog',
  },
  {
    path: 'legal/notice',
    loadComponent: legalPage,
    title: 'pages.legalNotice',
    data: { doc: 'notice' },
  },
  { path: 'legal/terms', loadComponent: legalPage, title: 'pages.terms', data: { doc: 'terms' } },
  {
    path: 'legal/privacy',
    loadComponent: legalPage,
    title: 'pages.privacy',
    data: { doc: 'privacy' },
  },
  {
    path: 'legal/accessibility',
    loadComponent: legalPage,
    title: 'pages.accessibility',
    data: { doc: 'accessibility' },
  },
  // Adresse inconnue : accueil de la même langue.
  { path: '**', redirectTo: '' },
];

/**
 * Les pages publiques existent dans chaque langue : à la racine en français, sous /en, /pt-br…
 * pour les autres (voir languages.ts). L'éditeur, qui ne travaille que sur des données locales,
 * garde une seule adresse et suit la langue choisie.
 */
export const routes: Routes = [
  {
    path: 'editor',
    loadComponent: () => import('./pages/editor/cv-list/cv-list').then((m) => m.CvList),
    title: 'pages.editor',
  },
  {
    path: 'editor/:id',
    loadComponent: () => import('./pages/editor/cv-editor/cv-editor').then((m) => m.CvEditor),
    title: 'pages.editor',
  },
  ...UI_LANGUAGES.filter((lang) => lang !== DEFAULT_UI_LANGUAGE).map((lang) => ({
    path: languageSegment(lang),
    canActivate: [languageGuard],
    data: { lang },
    children: publicRoutes,
  })),
  {
    path: '',
    canActivate: [languageGuard],
    data: { lang: DEFAULT_UI_LANGUAGE },
    children: publicRoutes,
  },
];
