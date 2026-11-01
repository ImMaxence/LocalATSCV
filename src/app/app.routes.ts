import { Routes } from '@angular/router';

const legalPage = () => import('./pages/legal/legal-page').then((m) => m.LegalPage);

// Les `title` sont des clés de traduction (voir TranslatedTitleStrategy).
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
    title: 'pages.home',
  },
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
  { path: '**', redirectTo: '' },
];
