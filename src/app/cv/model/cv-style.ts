import { CvTemplateId, isTemplateId, newId } from './cv.model';
import { CvFontId, isFontId } from './cv-fonts';

/**
 * Style personnel créé dans le studio : soit la toile du studio, composée de blocs (en-tête,
 * titres, expériences…) et de formes décoratives, soit un modèle de la galerie retouché en CSS.
 * Un style ne contient aucune donnée du CV : il se partage tel quel en JSON.
 */
export const STUDIO_BASE = 'studio';
export type StyleBase = typeof STUDIO_BASE | CvTemplateId;

/** Variantes de chaque bloc de la toile du studio, dans l'ordre du panneau. */
export const STYLE_BLOCKS = {
  // Seules des variantes qui obtiennent au moins 90 au contrôle ATS : ni colonne à droite,
  // ni coordonnées à côté du nom (l'analyseur les lit dans le désordre).
  layout: ['single', 'sidebarLeft'],
  header: ['left', 'center', 'band', 'card'],
  headings: ['underline', 'bar', 'pill', 'caps', 'boxed', 'line'],
  entries: ['classic', 'timeline', 'cards', 'datesLeft'],
  skills: ['chips', 'inline', 'grid'],
  languages: ['meter', 'text'],
  photo: ['circle', 'rounded', 'square', 'hidden'],
} as const;
export type StyleBlockKey = keyof typeof STYLE_BLOCKS;
export const STYLE_BLOCK_KEYS = Object.keys(STYLE_BLOCKS) as StyleBlockKey[];
export type StyleBlocks = { [K in StyleBlockKey]: (typeof STYLE_BLOCKS)[K][number] };

export const SHAPE_KINDS = [
  'circle',
  'blob',
  'square',
  'triangle',
  'ring',
  'wave',
  'stripes',
  'dots',
] as const;
export type ShapeKind = (typeof SHAPE_KINDS)[number];

/** Couleurs nommées d'une forme ; toute autre valeur est une couleur `#rrggbb`. */
export const SHAPE_COLORS = ['accent', 'soft', 'ink'] as const;

/**
 * Forme décorative dessinée derrière le texte, sur la première page (sous les blocs à fond
 * plein aussi : bandeau, colonne). Positions et taille en pourcentage de la page A4, pour
 * rester justes quelle que soit l'échelle de l'aperçu.
 */
export interface StyleShape {
  id: string;
  kind: ShapeKind;
  /** Coin haut gauche, en % de la largeur (x) et de la hauteur (y) de la page ; peut déborder. */
  x: number;
  y: number;
  /** Largeur en % de la largeur de la page. */
  size: number;
  rotate: number;
  /** `accent`, `soft`, `ink` ou `#rrggbb`. */
  color: string;
  /** Intensité de 10 à 100 %, appliquée à la couleur (jamais `opacity` : voir cv-template-conventions). */
  alpha: number;
}

export const SHAPE_LIMITS = {
  x: { min: -50, max: 100 },
  y: { min: -50, max: 100 },
  size: { min: 4, max: 120 },
  rotate: { min: -180, max: 180 },
  alpha: { min: 10, max: 100 },
} as const;
export const MAX_SHAPES = 40;
export const MAX_CSS_LENGTH = 50_000;

export interface CvStyleColors {
  /** `null` = couleur d'accent choisie dans l'éditeur du CV. */
  accent: string | null;
  paper: string;
  ink: string;
}

export interface CvStyle {
  id: string;
  name: string;
  base: StyleBase;
  blocks: StyleBlocks;
  colors: CvStyleColors;
  /** `null` = police de la toile (ou du modèle de base). */
  fonts: { heading: CvFontId | null; body: CvFontId | null };
  shapes: StyleShape[];
  /** CSS de l'utilisateur, tel que saisi ; nettoyé et confiné au CV au moment du rendu. */
  css: string;
  createdAt: string;
  updatedAt: string;
}

/** Fonds de page proposés, avec une couleur de texte assortie (contraste AA). */
export const PAPER_PRESETS = [
  { paper: '#ffffff', ink: '#1f2937' },
  { paper: '#fbf7ef', ink: '#2b2620' },
  { paper: '#f3f5f8', ink: '#1e293b' },
  { paper: '#f6efe4', ink: '#3b2f22' },
  { paper: '#eef3ee', ink: '#1f2d24' },
  { paper: '#141b2d', ink: '#e8ecf4' },
] as const;

export const DEFAULT_BLOCKS: StyleBlocks = {
  layout: 'single',
  header: 'left',
  headings: 'underline',
  entries: 'classic',
  skills: 'chips',
  languages: 'meter',
  photo: 'circle',
};

export const STYLE_PRESETS = ['blank', 'band', 'sidebar', 'organic', 'timeline'] as const;
export type StylePreset = (typeof STYLE_PRESETS)[number];

const shape = (
  kind: ShapeKind,
  x: number,
  y: number,
  size: number,
  extra: Partial<StyleShape> = {},
): StyleShape => ({
  id: newId(),
  kind,
  x,
  y,
  size,
  rotate: 0,
  color: 'soft',
  alpha: 100,
  ...extra,
});

/** Points de départ proposés à la création d'un style. */
function presetContent(preset: StylePreset): Pick<CvStyle, 'blocks' | 'shapes'> {
  switch (preset) {
    case 'band':
      return {
        blocks: { ...DEFAULT_BLOCKS, header: 'band', headings: 'caps', skills: 'inline' },
        shapes: [shape('circle', 70, 78, 46)],
      };
    case 'sidebar':
      return {
        blocks: { ...DEFAULT_BLOCKS, layout: 'sidebarLeft', headings: 'bar', photo: 'rounded' },
        shapes: [],
      };
    case 'organic':
      return {
        blocks: { ...DEFAULT_BLOCKS, header: 'center', headings: 'pill', entries: 'cards' },
        shapes: [
          shape('blob', -18, -10, 52),
          shape('blob', 74, 82, 44, { rotate: 120 }),
          shape('dots', 82, 4, 14, { color: 'accent', alpha: 40 }),
        ],
      };
    case 'timeline':
      return {
        blocks: { ...DEFAULT_BLOCKS, header: 'card', headings: 'line', entries: 'timeline' },
        shapes: [shape('stripes', 88, 0, 12, { color: 'accent', alpha: 25 })],
      };
    default:
      return { blocks: { ...DEFAULT_BLOCKS }, shapes: [] };
  }
}

export function createStyle(name: string, preset: StylePreset = 'blank'): CvStyle {
  const timestamp = new Date().toISOString();
  return {
    id: newId(),
    name,
    base: STUDIO_BASE,
    ...presetContent(preset),
    colors: { accent: null, paper: PAPER_PRESETS[0].paper, ink: PAPER_PRESETS[0].ink },
    fonts: { heading: null, body: null },
    css: '',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** Style vide posé sur un modèle de la galerie, pour le retoucher en CSS. */
export function createTemplateStyle(name: string, template: CvTemplateId): CvStyle {
  return { ...createStyle(name), base: template };
}

export function createShape(kind: ShapeKind): StyleShape {
  return shape(kind, 60, 6, 30);
}

export function isStudioStyle(style: CvStyle | null | undefined): style is CvStyle {
  return style?.base === STUDIO_BASE;
}

// --- Lecture sûre (sauvegardes, styles partagés) ---

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const string = (value: unknown): string => (typeof value === 'string' ? value : '');
const HEX = /^#[0-9a-f]{6}$/i;
const hex = (value: unknown, fallback: string): string =>
  HEX.test(string(value)) ? string(value).toLowerCase() : fallback;

function clamp(
  value: unknown,
  { min, max }: { min: number; max: number },
  fallback: number,
): number {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(max, Math.max(min, Math.round(number * 10) / 10))
    : fallback;
}

function normalizeBlocks(raw: unknown): StyleBlocks {
  const blocks = isRecord(raw) ? raw : {};
  const result = { ...DEFAULT_BLOCKS } as Record<StyleBlockKey, string>;
  for (const key of STYLE_BLOCK_KEYS) {
    const options = STYLE_BLOCKS[key] as readonly string[];
    if (options.includes(string(blocks[key]))) result[key] = string(blocks[key]);
  }
  return result as StyleBlocks;
}

function normalizeShape(raw: unknown): StyleShape | null {
  if (!isRecord(raw) || !SHAPE_KINDS.includes(raw['kind'] as ShapeKind)) return null;
  const color = string(raw['color']);
  return {
    id: string(raw['id']) || newId(),
    kind: raw['kind'] as ShapeKind,
    x: clamp(raw['x'], SHAPE_LIMITS.x, 0),
    y: clamp(raw['y'], SHAPE_LIMITS.y, 0),
    size: clamp(raw['size'], SHAPE_LIMITS.size, 30),
    rotate: clamp(raw['rotate'], SHAPE_LIMITS.rotate, 0),
    color: (SHAPE_COLORS as readonly string[]).includes(color) ? color : hex(color, 'soft'),
    alpha: clamp(raw['alpha'], SHAPE_LIMITS.alpha, 100),
  };
}

/** Tout champ manquant ou invalide est remplacé par une valeur sûre ; `null` si ce n'est pas un style. */
export function normalizeStyle(raw: unknown): CvStyle | null {
  if (!isRecord(raw)) return null;
  const base =
    raw['base'] === STUDIO_BASE || isTemplateId(raw['base'])
      ? (raw['base'] as StyleBase)
      : STUDIO_BASE;
  const colors = isRecord(raw['colors']) ? raw['colors'] : {};
  const fonts = isRecord(raw['fonts']) ? raw['fonts'] : {};
  const accent = string(colors['accent']);
  const timestamp = new Date().toISOString();
  return {
    id: string(raw['id']) || newId(),
    name: string(raw['name']).trim().slice(0, 80) || 'Style',
    base,
    blocks: normalizeBlocks(raw['blocks']),
    colors: {
      accent: HEX.test(accent) ? accent.toLowerCase() : null,
      paper: hex(colors['paper'], PAPER_PRESETS[0].paper),
      ink: hex(colors['ink'], PAPER_PRESETS[0].ink),
    },
    fonts: {
      heading: isFontId(fonts['heading']) ? fonts['heading'] : null,
      body: isFontId(fonts['body']) ? fonts['body'] : null,
    },
    shapes: (Array.isArray(raw['shapes']) ? raw['shapes'] : [])
      .map(normalizeShape)
      .filter((item) => item !== null)
      .slice(0, MAX_SHAPES),
    css: string(raw['css']).slice(0, MAX_CSS_LENGTH),
    createdAt: string(raw['createdAt']) || timestamp,
    updatedAt: string(raw['updatedAt']) || timestamp,
  };
}

// --- Partage en JSON ---

/** Incrémenter à chaque changement de structure et adapter `normalizeStyle` aux anciens fichiers. */
export const STYLE_SCHEMA_VERSION = 1;
const APP_ID = 'LocalATSCV';

export type StyleShareErrorCode = 'invalidJson' | 'notAStyle' | 'newerVersion';

export class StyleShareError extends Error {
  constructor(readonly code: StyleShareErrorCode) {
    super(code);
  }
}

/** Code JSON à partager : le style seul, sans identifiant ni dates. */
export function serializeStyle(style: CvStyle): string {
  const { name, base, blocks, colors, fonts, shapes, css } = style;
  return JSON.stringify(
    {
      app: APP_ID,
      type: 'style',
      schemaVersion: STYLE_SCHEMA_VERSION,
      style: {
        name,
        base,
        blocks,
        colors,
        fonts,
        shapes: shapes.map(({ id: _id, ...rest }) => rest),
        css,
      },
    },
    null,
    2,
  );
}

/** Lit un style partagé ; il reçoit toujours un nouvel identifiant pour ne rien écraser. */
export function parseStyleShare(text: string): CvStyle {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new StyleShareError('invalidJson');
  }
  if (
    !isRecord(raw) ||
    raw['app'] !== APP_ID ||
    raw['type'] !== 'style' ||
    !isRecord(raw['style'])
  ) {
    throw new StyleShareError('notAStyle');
  }
  if (typeof raw['schemaVersion'] === 'number' && raw['schemaVersion'] > STYLE_SCHEMA_VERSION) {
    throw new StyleShareError('newerVersion');
  }
  const style = normalizeStyle({ ...raw['style'], id: '', createdAt: '', updatedAt: '' });
  if (!style) throw new StyleShareError('notAStyle');
  return style;
}
