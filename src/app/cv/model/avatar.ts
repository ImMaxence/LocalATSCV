/**
 * Pictogrammes proposés à la place de la photo (voir shared/icon), plus les initiales.
 * Ils ne révèlent ni l'âge, ni l'apparence, ni l'origine : utiles quand une photo n'est pas
 * souhaitée mais qu'un modèle prévoit sa place.
 */
export const AVATAR_ICONS = [
  'user',
  'briefcase',
  'graduation',
  'code',
  'palette',
  'camera',
  'music',
  'heart',
  'leaf',
  'rocket',
  'chefHat',
  'wrench',
  'stethoscope',
  'book',
  'lightbulb',
  'initials',
] as const;
export type AvatarIcon = (typeof AVATAR_ICONS)[number];

export function isAvatarIcon(value: unknown): value is AvatarIcon {
  return (AVATAR_ICONS as readonly unknown[]).includes(value);
}

/** « Camille Martin » → « CM » ; une seule lettre si un seul nom est connu. */
export function initials(firstName: string, lastName: string): string {
  return [firstName, lastName]
    .map((part) => part.trim().replace(/^[^\p{L}\p{N}]+/u, ''))
    .filter(Boolean)
    .map((part) => [...part][0].toLocaleUpperCase())
    .join('')
    .slice(0, 2);
}
