import { parseChangelog, parseInline } from './changelog-parser';

const SAMPLE = `# Changelog

Toutes les évolutions notables sont listées ici

## [Non publié]

### Ajouté

- Éditeur de CV
- Export avec \`npm run screenshots\`

### Corrigé

- En-tête qui ne restait pas en haut

## [0.1.0] - 2026-11-01

### Ajouté

- Socle de l'application

## [0.0.1] - 2026-10-01

[0.1.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.1.0
`;

describe('parseChangelog', () => {
  const releases = parseChangelog(SAMPLE);

  it('lit les versions dans l’ordre, avec leur date', () => {
    expect(releases.map((r) => r.version)).toEqual([null, '0.1.0']);
    expect(releases[1].date).toBe('2026-11-01');
  });

  it('traite « Non publié » comme une version sans numéro', () => {
    expect(releases[0].version).toBeNull();
    expect(releases[0].date).toBeNull();
  });

  it('classe les entrées par type de changement', () => {
    expect(releases[0].groups.map((g) => g.type)).toEqual(['added', 'fixed']);
    expect(releases[0].groups[0].items.length).toBe(2);
  });

  it('ignore les versions vides et les liens de référence', () => {
    expect(releases.some((r) => r.version === '0.0.1')).toBe(false);
  });
});

describe('parseInline', () => {
  it('isole le code entre accents graves', () => {
    expect(parseInline('Lancer `npm start` puis ouvrir')).toEqual([
      { text: 'Lancer ', code: false },
      { text: 'npm start', code: true },
      { text: ' puis ouvrir', code: false },
    ]);
  });
});
