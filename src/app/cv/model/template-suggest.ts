import { CV_TEMPLATES, CvTemplateId } from './cv.model';
import { normalizeText } from '../analysis/weak-phrases';

/**
 * Secteurs reconnus dans une annonce (mots normalisés : minuscules, sans accents) et modèles
 * qui leur conviennent, du plus classique au plus graphique. Heuristique volontairement simple :
 * elle propose, elle n'impose pas.
 */
const SECTORS: { words: string[]; templates: CvTemplateId[] }[] = [
  {
    words: [
      'finance', 'banque', 'bank', 'audit', 'comptab', 'accounting', 'juridique', 'legal', 'avocat',
      'lawyer', 'notaire', 'assurance', 'insurance', 'controle de gestion', 'fiscal', 'tax',
    ],
    templates: ['finance', 'executive', 'academic', 'classic'],
  },
  {
    words: [
      'chercheur', 'researcher', 'doctorat', 'phd', 'these', 'thesis', 'universit', 'laboratoire',
      'laboratory', 'enseignant', 'professeur', 'lecturer', 'publication',
    ],
    templates: ['academic', 'ledger', 'finance', 'elegant'],
  },
  {
    words: [
      'developpeur', 'developer', 'engineer', 'ingenieur', 'devops', 'backend', 'frontend',
      'full stack', 'fullstack', 'software', 'logiciel', 'data', 'cloud', 'sre', 'cybersecurit',
    ],
    templates: ['tech', 'terminal', 'circuit', 'linear'],
  },
  {
    words: [
      'designer', 'graphiste', 'graphic', 'ux', 'ui', 'direction artistique', 'art director',
      'illustrat', 'motion', 'creatif', 'creative', 'brand', 'marque',
    ],
    templates: ['editorial', 'swiss', 'collage', 'riso'],
  },
  {
    words: [
      'marketing', 'communication', 'community', 'social media', 'reseaux sociaux', 'contenu',
      'content', 'evenement', 'event', 'relations presse', 'growth',
    ],
    templates: ['modern', 'horizon', 'sticker', 'pulse'],
  },
  {
    words: [
      'commercial', 'sales', 'vente', 'business developer', 'account', 'retail', 'magasin',
      'store', 'hotel', 'restaurant', 'serveur', 'accueil', 'reception',
    ],
    templates: ['modern', 'soft', 'cards', 'impact'],
  },
  {
    words: [
      'infirmi', 'nurse', 'medecin', 'doctor', 'sante', 'health', 'hopital', 'hospital', 'pharma',
      'clinique', 'clinic', 'aide-soignant', 'care',
    ],
    templates: ['soft', 'cards', 'classic', 'airy'],
  },
  {
    words: [
      'direction', 'director', 'directeur', 'head of', 'chief', 'ceo', 'cfo', 'coo', 'vp',
      'manager', 'management', 'responsable', 'leadership',
    ],
    templates: ['executive', 'prestige', 'finance', 'mono'],
  },
  {
    words: [
      'enfant', 'children', 'ecole', 'school', 'animateur', 'animation', 'creche', 'petite enfance',
      'educat', 'teacher', 'formateur',
    ],
    templates: ['candy', 'sticker', 'soft', 'sorbet'],
  },
  {
    words: [
      'artisan', 'boulang', 'baker', 'patiss', 'cuisin', 'chef', 'menuis', 'ceram', 'fleur',
      'florist', 'bois', 'wood', 'ferme', 'farm', 'agricol',
    ],
    templates: ['kraft', 'botanical', 'linocut', 'postal'],
  },
];

/**
 * Modèles suggérés pour une annonce : jusqu'à quatre identifiants, selon le secteur détecté.
 * Aucune suggestion si l'annonce est vide ou ne parle d'aucun secteur connu.
 */
export function suggestTemplates(adText: string): CvTemplateId[] {
  const text = normalizeText(adText);
  if (text.trim().length < 20) return [];
  const scored = SECTORS.map((sector) => ({
    sector,
    hits: sector.words.filter((word) => text.includes(word)).length,
  }))
    .filter(({ hits }) => hits > 0)
    .sort((a, b) => b.hits - a.hits);
  const ids = new Set<CvTemplateId>();
  for (const { sector } of scored.slice(0, 2)) sector.templates.forEach((id) => ids.add(id));
  return [...ids].filter((id) => CV_TEMPLATES.some((t) => t.id === id)).slice(0, 4);
}
