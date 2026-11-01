import { parseMarkdown } from './markdown';

describe('parseMarkdown', () => {
  it('lit titres, paragraphes, listes, gras et liens, sans les commentaires', () => {
    const blocks = parseMarkdown(`# Titre

Un paragraphe
sur deux lignes.

<!-- note interne -->

- **Gras** : valeur
- Contact : [écrire](mailto:a@b.fr)

## Sous-titre`);

    expect(blocks.map((b) => b.type)).toEqual(['h1', 'p', 'ul', 'h2']);
    expect(blocks[1]).toEqual({ type: 'p', inlines: [{ text: 'Un paragraphe sur deux lignes.' }] });
    expect(blocks[2]).toEqual({
      type: 'ul',
      items: [
        [{ text: 'Gras', bold: true }, { text: ' : valeur' }],
        [{ text: 'Contact : ' }, { text: 'écrire', href: 'mailto:a@b.fr' }],
      ],
    });
  });
});
