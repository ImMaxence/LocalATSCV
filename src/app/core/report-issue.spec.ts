import { REPO_URL } from './app-info';
import { buildIssueUrl } from './report-issue';

describe('buildIssueUrl', () => {
  const url = new URL(
    buildIssueUrl({
      version: '1.2.3',
      language: 'fr',
      page: '/editor',
      userAgent: 'Mozilla/5.0 (Test) & co',
    }),
  );

  it('pointe vers le formulaire de bug du dépôt', () => {
    expect(`${url.origin}${url.pathname}`).toBe(`${REPO_URL}/issues/new`);
    expect(url.searchParams.get('template')).toBe('bug_report.yml');
  });

  it('pré-remplit le contexte technique en l’encodant correctement', () => {
    expect(url.searchParams.get('version')).toBe('1.2.3');
    expect(url.searchParams.get('language')).toBe('fr');
    expect(url.searchParams.get('page')).toBe('/editor');
    expect(url.searchParams.get('browser')).toBe('Mozilla/5.0 (Test) & co');
  });
});
