import { normalizeText } from '../analysis/weak-phrases';

/** Indices de niveau reconnus dans le texte saisi (CECRL et mots usuels des 5 langues). */
const LEVEL_HINTS: [RegExp, number][] = [
  [/\bc2\b|natif|native|maternelle|mother|madrelingua|materna|nativ|muttersprache|bilingu/, 5],
  [
    /\bc1\b|courant|fluent|fluente|fluido|flie(ss|ß)end|avance|advanced|avanzat|verhandlungssicher/,
    4,
  ],
  [/\bb2\b|professionnel|professional|professionale|profesional|intermediaire.?superieur|upper/, 3],
  [/\bb1\b|intermediaire|intermediate|intermedio|mittel|conversation/, 2.5],
  [/\ba2\b|scolaire|basic|elementaire|elementary|base|grundkenntnisse/, 2],
  [/\ba1\b|debutant|beginner|principiante|anfanger|notions/, 1],
];

/**
 * Niveau sur 5 déduit du texte saisi (« C1 », « courant », « native »…), utilisé par les
 * jauges des modèles et par l'aperçu dans l'éditeur. `null` si le niveau n'est pas reconnu.
 */
export function languageLevel(level: string): number | null {
  const text = normalizeText(level);
  return LEVEL_HINTS.find(([pattern]) => pattern.test(text))?.[1] ?? null;
}
