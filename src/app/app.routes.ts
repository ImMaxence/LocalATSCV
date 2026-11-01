import { Routes } from '@angular/router';

const comingSoon = () => import('./pages/coming-soon/coming-soon').then((m) => m.ComingSoon);

// Les `title` sont des clés de traduction (voir TranslatedTitleStrategy).
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
    title: 'pages.home',
  },
  { path: 'editor', loadComponent: comingSoon, title: 'pages.editor' },
  { path: 'analyze', loadComponent: comingSoon, title: 'pages.analyze' },
  { path: 'changelog', loadComponent: comingSoon, title: 'pages.changelog' },
  { path: 'legal/notice', loadComponent: comingSoon, title: 'pages.legalNotice' },
  { path: 'legal/terms', loadComponent: comingSoon, title: 'pages.terms' },
  { path: 'legal/privacy', loadComponent: comingSoon, title: 'pages.privacy' },
  { path: '**', redirectTo: '' },
];
