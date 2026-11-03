import { STYLE_BLOCKS, StyleBlockKey } from '../../cv/model/cv-style';

/** Rectangle d'un croquis : x, y, largeur, hauteur (sur 48 × 34), teinte, arrondi. */
export type SketchRect = readonly [number, number, number, number, SketchTone, number?];
export type SketchTone = 'ink' | 'accent' | 'soft' | 'line' | 'white';

export const SKETCH_FILLS: Record<SketchTone, string> = {
  ink: 'var(--ink)',
  accent: 'var(--accent)',
  soft: 'var(--accent-soft)',
  line: 'var(--line)',
  white: 'var(--accent-ink)',
};

const lines: SketchRect[] = [
  [5, 20, 34, 2, 'line'],
  [5, 25, 28, 2, 'line'],
];
const dot = (x: number, y: number, tone: SketchTone): SketchRect => [x, y, 3.5, 3.5, tone, 1.75];

/**
 * Croquis de chaque variante de bloc, affichés sur les boutons du panneau « Blocs » du studio :
 * on choisit une mise en page en la voyant, sans avoir à lire de description.
 */
export const BLOCK_SKETCHES: {
  [K in StyleBlockKey]: Record<(typeof STYLE_BLOCKS)[K][number], SketchRect[]>;
} = {
  layout: {
    single: [
      [5, 5, 22, 3, 'ink'],
      [5, 10, 14, 2, 'accent'],
      [5, 16, 38, 2, 'line'],
      [5, 21, 38, 2, 'line'],
      [5, 26, 30, 2, 'line'],
    ],
    sidebarLeft: [
      [0, 0, 14, 34, 'soft'],
      [3, 6, 8, 2, 'accent'],
      [3, 11, 8, 2, 'line'],
      [3, 16, 8, 2, 'line'],
      [18, 5, 22, 3, 'ink'],
      [18, 12, 26, 2, 'line'],
      [18, 17, 26, 2, 'line'],
      [18, 22, 20, 2, 'line'],
    ],
  },
  header: {
    left: [
      [17, 6, 22, 4, 'ink'],
      [17, 12, 14, 2, 'accent'],
      [17, 17, 26, 2, 'line'],
      [4, 5, 10, 10, 'soft', 5],
      [5, 25, 38, 2, 'line'],
    ],
    center: [
      [19, 3, 10, 10, 'soft', 5],
      [13, 16, 22, 3, 'ink'],
      [17, 21, 14, 2, 'accent'],
      [10, 26, 28, 2, 'line'],
    ],
    band: [
      [0, 0, 48, 18, 'accent'],
      [5, 5, 20, 4, 'white'],
      [5, 11, 12, 2, 'white'],
      [5, 23, 38, 2, 'line'],
      [5, 28, 30, 2, 'line'],
    ],
    card: [
      [5, 5, 22, 4, 'ink'],
      [5, 11, 14, 2, 'accent'],
      [34, 3, 10, 10, 'soft', 5],
      [4, 18, 40, 11, 'soft', 2],
      [7, 21, 14, 2, 'line'],
      [24, 21, 14, 2, 'line'],
      [7, 25, 18, 2, 'line'],
    ],
  },
  headings: {
    underline: [[5, 9, 16, 3, 'ink'], [5, 14, 38, 1.5, 'accent'], ...lines],
    bar: [[5, 8, 2, 6, 'accent'], [9, 9, 16, 3, 'ink'], ...lines],
    pill: [[5, 8, 20, 6, 'accent', 3], [8, 10, 14, 2, 'white'], ...lines],
    caps: [[5, 9, 22, 2.5, 'accent'], ...lines],
    boxed: [[4, 7, 40, 8, 'soft', 2], [7, 10, 16, 2.5, 'ink'], ...lines],
    line: [[5, 9, 14, 3, 'ink'], [22, 10, 21, 1.5, 'soft'], ...lines],
  },
  entries: {
    classic: [
      [5, 6, 20, 3, 'ink'],
      [34, 6, 9, 2, 'line'],
      [5, 11, 14, 2, 'accent'],
      [8, 16, 32, 1.5, 'line'],
      [8, 20, 28, 1.5, 'line'],
      [5, 26, 20, 3, 'ink'],
      [34, 26, 9, 2, 'line'],
    ],
    timeline: [
      [8, 4, 1.5, 28, 'soft'],
      [6.25, 6, 5, 5, 'accent', 2.5],
      [14, 6, 20, 3, 'ink'],
      [14, 11, 26, 1.5, 'line'],
      [6.25, 19, 5, 5, 'accent', 2.5],
      [14, 19, 20, 3, 'ink'],
      [14, 24, 26, 1.5, 'line'],
    ],
    cards: [
      [4, 3, 40, 13, 'soft', 2],
      [7, 6, 18, 2.5, 'ink'],
      [7, 11, 30, 1.5, 'line'],
      [4, 18, 40, 13, 'soft', 2],
      [7, 21, 18, 2.5, 'ink'],
      [7, 26, 30, 1.5, 'line'],
    ],
    datesLeft: [
      [4, 6, 9, 2, 'accent'],
      [16, 6, 20, 3, 'ink'],
      [16, 11, 26, 1.5, 'line'],
      [16, 15, 22, 1.5, 'line'],
      [4, 21, 9, 2, 'accent'],
      [16, 21, 20, 3, 'ink'],
      [16, 26, 26, 1.5, 'line'],
    ],
  },
  skills: {
    chips: [
      [4, 8, 12, 6, 'soft', 3],
      [18, 8, 14, 6, 'soft', 3],
      [34, 8, 10, 6, 'soft', 3],
      [4, 18, 16, 6, 'soft', 3],
      [22, 18, 12, 6, 'soft', 3],
    ],
    inline: [
      [4, 9, 10, 2.5, 'ink'],
      [16, 9, 26, 2.5, 'line'],
      [4, 17, 10, 2.5, 'ink'],
      [16, 17, 22, 2.5, 'line'],
      [4, 25, 10, 2.5, 'ink'],
      [16, 25, 18, 2.5, 'line'],
    ],
    grid: [
      [4, 7, 14, 2.5, 'ink'],
      [4, 12, 18, 2, 'line'],
      [26, 7, 14, 2.5, 'ink'],
      [26, 12, 18, 2, 'line'],
      [4, 20, 14, 2.5, 'ink'],
      [4, 25, 18, 2, 'line'],
      [26, 20, 14, 2.5, 'ink'],
      [26, 25, 18, 2, 'line'],
    ],
  },
  languages: {
    meter: [
      [4, 9, 14, 2.5, 'ink'],
      dot(26, 8.5, 'accent'),
      dot(31, 8.5, 'accent'),
      dot(36, 8.5, 'accent'),
      dot(41, 8.5, 'line'),
      [4, 20, 14, 2.5, 'ink'],
      dot(26, 19.5, 'accent'),
      dot(31, 19.5, 'accent'),
      dot(36, 19.5, 'line'),
      dot(41, 19.5, 'line'),
    ],
    text: [
      [4, 12, 12, 2.5, 'ink'],
      [17, 12, 27, 2.5, 'line'],
      [4, 18, 12, 2.5, 'ink'],
      [17, 18, 18, 2.5, 'line'],
    ],
  },
  photo: {
    circle: [[14, 7, 20, 20, 'soft', 10]],
    rounded: [[14, 7, 20, 20, 'soft', 5]],
    square: [[14, 7, 20, 20, 'soft']],
    hidden: [[14, 16, 20, 2, 'line']],
  },
};
