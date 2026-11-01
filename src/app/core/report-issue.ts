import { REPO_URL } from './app-info';

export interface IssueContext {
  version: string;
  language: string;
  page: string;
  userAgent: string;
}

/**
 * URL de création d'issue GitHub pré-remplie (formulaire .github/ISSUE_TEMPLATE/bug_report.yml).
 * Les paramètres correspondent aux `id` des champs du formulaire.
 * Seul le contexte technique est transmis : jamais le contenu du CV.
 */
export function buildIssueUrl(context: IssueContext): string {
  const params = new URLSearchParams({
    template: 'bug_report.yml',
    version: context.version,
    language: context.language,
    page: context.page,
    browser: context.userAgent,
  });
  return `${REPO_URL}/issues/new?${params.toString()}`;
}
