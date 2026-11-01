/**
 * Polices proposées pour les CV, toutes hébergées sur le site (aucun appel à un service tiers).
 * Une police n'influence pas la lecture par un ATS tant que le texte reste du vrai texte :
 * le choix est donc libre. Seules les ligatures sont désactivées dans les modèles.
 */
export const CV_FONTS = [
  { id: 'inter', label: 'Inter', stack: "'Inter Variable', sans-serif", kind: 'sans' },
  { id: 'poppins', label: 'Poppins', stack: "'Poppins', sans-serif", kind: 'sans' },
  {
    id: 'montserrat',
    label: 'Montserrat',
    stack: "'Montserrat Variable', sans-serif",
    kind: 'sans',
  },
  { id: 'dm-sans', label: 'DM Sans', stack: "'DM Sans Variable', sans-serif", kind: 'sans' },
  { id: 'manrope', label: 'Manrope', stack: "'Manrope Variable', sans-serif", kind: 'sans' },
  {
    id: 'space-grotesk',
    label: 'Space Grotesk',
    stack: "'Space Grotesk Variable', sans-serif",
    kind: 'sans',
  },
  { id: 'jost', label: 'Jost', stack: "'Jost Variable', sans-serif", kind: 'sans' },
  {
    id: 'bricolage',
    label: 'Bricolage Grotesque',
    stack: "'Bricolage Grotesque Variable', sans-serif",
    kind: 'sans',
  },
  { id: 'archivo', label: 'Archivo', stack: "'Archivo Variable', sans-serif", kind: 'sans' },
  { id: 'syne', label: 'Syne', stack: "'Syne Variable', sans-serif", kind: 'sans' },
  { id: 'lora', label: 'Lora', stack: "'Lora Variable', serif", kind: 'serif' },
  {
    id: 'playfair',
    label: 'Playfair Display',
    stack: "'Playfair Display Variable', serif",
    kind: 'serif',
  },
  { id: 'fraunces', label: 'Fraunces', stack: "'Fraunces Variable', serif", kind: 'serif' },
  {
    id: 'cormorant',
    label: 'Cormorant Garamond',
    stack: "'Cormorant Garamond Variable', serif",
    kind: 'serif',
  },
  {
    id: 'jetbrains-mono',
    label: 'JetBrains Mono',
    stack: "'JetBrains Mono Variable', monospace",
    kind: 'mono',
  },
] as const;

export type CvFontId = (typeof CV_FONTS)[number]['id'];

export function isFontId(value: unknown): value is CvFontId {
  return CV_FONTS.some((font) => font.id === value);
}

export function fontStack(id: CvFontId | null): string | null {
  return CV_FONTS.find((font) => font.id === id)?.stack ?? null;
}
