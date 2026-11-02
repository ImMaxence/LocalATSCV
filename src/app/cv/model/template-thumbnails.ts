import { CvLanguage, CvTemplateId } from './cv.model';

/**
 * Vignettes statiques des modèles (public/templates/<id>.<fr|en>.webp), générées par
 * `npm run thumbnails` avec le CV d'exemple. Les CV en français prennent la vignette française,
 * les autres langues l'anglaise (le CV d'exemple n'existe que dans ces deux langues).
 * Une image coûte bien moins qu'un rendu du modèle : la galerie en affiche des dizaines.
 */
export function templateThumbnailUrl(template: CvTemplateId, language: CvLanguage): string {
  return `templates/${template}.${language === 'fr' ? 'fr' : 'en'}.webp`;
}
