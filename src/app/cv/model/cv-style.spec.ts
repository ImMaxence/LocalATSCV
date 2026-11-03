import {
  DEFAULT_BLOCKS,
  MAX_SHAPES,
  STYLE_SCHEMA_VERSION,
  StyleShareError,
  createShape,
  createStyle,
  normalizeStyle,
  parseStyleShare,
  serializeStyle,
} from './cv-style';

const codeOf = (fn: () => unknown): string | undefined => {
  try {
    fn();
  } catch (error) {
    return error instanceof StyleShareError ? error.code : 'other';
  }
  return undefined;
};

describe('styles du studio', () => {
  const style = createStyle('Mon style', 'organic');
  style.css = '.cv-name { color: var(--cv-accent); }';
  style.colors.accent = '#be185d';

  it('relit à l’identique un style partagé, sous un nouvel identifiant', () => {
    const imported = parseStyleShare(serializeStyle(style));
    expect(imported.id).not.toBe(style.id);
    expect(imported.name).toBe('Mon style');
    expect(imported.blocks).toEqual(style.blocks);
    expect(imported.colors).toEqual(style.colors);
    expect(imported.css).toBe(style.css);
    expect(imported.shapes.map(({ id: _id, ...rest }) => rest)).toEqual(
      style.shapes.map(({ id: _id, ...rest }) => rest),
    );
  });

  it('ne partage ni identifiant ni dates', () => {
    const code = serializeStyle(style);
    expect(code).not.toContain(style.id);
    expect(code).not.toContain(style.createdAt);
    expect(JSON.parse(code)).toMatchObject({ app: 'LocalATSCV', type: 'style' });
  });

  it('refuse ce qui n’est pas un style', () => {
    expect(codeOf(() => parseStyleShare('pas du json'))).toBe('invalidJson');
    expect(codeOf(() => parseStyleShare('{"app":"LocalATSCV","cvs":[]}'))).toBe('notAStyle');
    expect(codeOf(() => parseStyleShare('[]'))).toBe('notAStyle');
  });

  it('refuse un style d’une version plus récente', () => {
    const future = {
      ...JSON.parse(serializeStyle(style)),
      schemaVersion: STYLE_SCHEMA_VERSION + 1,
    };
    expect(codeOf(() => parseStyleShare(JSON.stringify(future)))).toBe('newerVersion');
  });

  it('remplace les valeurs invalides par des valeurs sûres', () => {
    const normalized = normalizeStyle({
      base: 'inconnu',
      blocks: { header: 'band', layout: 'diagonale' },
      colors: { accent: 'rouge', paper: '#FFF', ink: '#111111' },
      fonts: { heading: 'comic-sans', body: 'lora' },
      shapes: [
        { kind: 'circle', x: 999, y: -999, size: 0, rotate: 720, color: 'url(x)', alpha: 3 },
        { kind: 'licorne' },
      ],
      css: 42,
    });
    expect(normalized?.base).toBe('studio');
    expect(normalized?.blocks).toEqual({ ...DEFAULT_BLOCKS, header: 'band' });
    expect(normalized?.colors).toEqual({ accent: null, paper: '#ffffff', ink: '#111111' });
    expect(normalized?.fonts).toEqual({ heading: null, body: 'lora' });
    expect(normalized?.shapes).toHaveLength(1);
    expect(normalized?.shapes[0]).toMatchObject({
      x: 100,
      y: -50,
      size: 4,
      rotate: 180,
      color: 'soft',
      alpha: 10,
    });
    expect(normalized?.css).toBe('');
  });

  it('accepte un modèle de la galerie comme base et limite le nombre de formes', () => {
    const shapes = Array.from({ length: MAX_SHAPES + 5 }, () => createShape('dots'));
    const normalized = normalizeStyle({ base: 'aurora', shapes });
    expect(normalized?.base).toBe('aurora');
    expect(normalized?.shapes).toHaveLength(MAX_SHAPES);
  });
});
