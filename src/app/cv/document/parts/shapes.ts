import { ShapeKind, StyleShape } from '../../model/cv-style';
import { BLOBS } from './blobs';

/** Tracé d'une forme dans un carré de 100 × 100, plein (`fill`) ou au trait (`stroke`). */
export interface ShapeGeometry {
  d: string;
  mode: 'fill' | 'stroke';
  strokeWidth?: number;
  transform?: string;
}

const dots = Array.from({ length: 25 }, (_, i) => {
  const x = 10 + (i % 5) * 20;
  const y = 10 + Math.floor(i / 5) * 20;
  return `M${x + 4} ${y}a4 4 0 1 1-8 0 4 4 0 1 1 8 0Z`;
}).join(' ');

/**
 * Formes décoratives de la toile du studio. Ce sont des dessins vectoriels sans texte :
 * positionnées en absolu derrière le contenu, elles ne changent rien à la lecture par un ATS.
 */
export const SHAPES: Record<ShapeKind, ShapeGeometry> = {
  circle: { d: 'M50 0a50 50 0 1 1 0 100 50 50 0 1 1 0-100Z', mode: 'fill' },
  blob: { d: BLOBS[0], mode: 'fill', transform: 'translate(50 50) scale(.64)' },
  square: {
    d: 'M10 0h80a10 10 0 0 1 10 10v80a10 10 0 0 1-10 10H10A10 10 0 0 1 0 90V10A10 10 0 0 1 10 0Z',
    mode: 'fill',
  },
  triangle: { d: 'M50 6 97 92H3Z', mode: 'fill' },
  ring: { d: 'M50 6a44 44 0 1 1 0 88 44 44 0 1 1 0-88Z', mode: 'stroke', strokeWidth: 10 },
  wave: {
    d: 'M0 28q12.5-14 25 0t25 0 25 0 25 0 M0 50q12.5-14 25 0t25 0 25 0 25 0 M0 72q12.5-14 25 0t25 0 25 0 25 0',
    mode: 'stroke',
    strokeWidth: 5,
  },
  stripes: {
    d: 'M-10 20 20-10 M-10 50 50-10 M-10 80 80-10 M-10 110 110-10 M20 110 110 20 M50 110 110 50 M80 110 110 80',
    mode: 'stroke',
    strokeWidth: 7,
  },
  dots: { d: dots, mode: 'fill' },
};

/** Couleur d'une forme : nommée (accent, accent clair, texte) ou libre, avec son intensité. */
export function shapeColor(shape: Pick<StyleShape, 'color' | 'alpha'>): string {
  const base =
    shape.color === 'accent'
      ? 'var(--cv-accent)'
      : shape.color === 'soft'
        ? 'color-mix(in srgb, var(--cv-accent) 18%, var(--cv-paper, #fff))'
        : shape.color === 'ink'
          ? 'var(--cv-ink, #1f2937)'
          : shape.color;
  return shape.alpha >= 100 ? base : `color-mix(in srgb, ${base} ${shape.alpha}%, transparent)`;
}
