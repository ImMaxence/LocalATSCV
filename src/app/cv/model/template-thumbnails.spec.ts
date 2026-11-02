import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { CV_TEMPLATES } from './cv.model';
import { templateThumbnailUrl } from './template-thumbnails';

// Les tests tournent depuis la racine du projet (ng test) ; les fichiers de public/ sont
// servis à la racine du site.
const PUBLIC = join(process.cwd(), 'public');

// Les vignettes de la galerie sont des images générées (npm run thumbnails) : un modèle
// ajouté sans les siennes afficherait une case vide.
describe('vignettes des modèles', () => {
  for (const template of CV_TEMPLATES) {
    it(`${template.id} a ses vignettes française et anglaise`, () => {
      for (const language of ['fr', 'en'] as const) {
        const path = join(PUBLIC, templateThumbnailUrl(template.id, language));
        expect(existsSync(path), path).toBe(true);
      }
    });
  }
});
