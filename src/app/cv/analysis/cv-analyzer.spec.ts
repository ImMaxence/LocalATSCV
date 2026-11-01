import { analyzeCv, buildLines, readingOrder } from './cv-analyzer';
import { ExtractedPdf, PdfTextItem } from './pdf-text';
import { findWeakOpener } from './weak-phrases';

const A4 = { width: 595, height: 842 };

/** Une ligne de texte par entrée ; `[x, texte]` place plusieurs blocs sur la même ligne. */
function pdfFrom(lines: (string | [number, string][])[]): ExtractedPdf {
  const items: PdfTextItem[] = [];
  lines.forEach((line, index) => {
    const blocks = typeof line === 'string' ? [[50, line] as [number, string]] : line;
    for (const [x, text] of blocks) {
      items.push({ text, x, y: 60 + index * 16, width: text.length * 5, height: 10 });
    }
  });
  return { pages: [{ ...A4, items }] };
}

const GOOD_CV = [
  'Camille Martin',
  'Développeuse Front-end',
  'Lyon · camille.martin@exemple.fr · +33 6 12 34 56 78',
  'Expérience professionnelle',
  [
    [50, 'Développeuse Angular — Société Exemple'],
    [430, 'Mars 2022 – aujourd’hui'],
  ] as [number, string][],
  '• Migration de 40 écrans vers Angular, temps de chargement réduit de 35 %',
  '• Mise en place des tests de bout en bout, 0 régression en 12 mois',
  '• Déploiement continu pour 3 équipes produit',
  'Développeuse web — Agence Démo 2019 – 2022',
  '• Développement de 15 sites pour des clients publics',
  'Formation',
  'Master Informatique — Université Exemple 2017 – 2019',
  'Compétences',
  'Front-end : Angular, TypeScript, RxJS, HTML, CSS',
  ...Array.from(
    { length: 22 },
    (_, i) =>
      `Ligne de contenu ${i + 1} avec plusieurs mots pour atteindre une longueur réaliste de CV complet`,
  ),
];

describe('analyzeCv', () => {
  it('donne 0 à un PDF sans texte (scan ou image)', () => {
    const analysis = analyzeCv({ pages: [{ ...A4, items: [] }] });
    expect(analysis.score).toBe(0);
    expect(analysis.checks.map((c) => [c.id, c.status])).toEqual([['textLayer', 'fail']]);
  });

  it('note très bien un CV textuel, une colonne, bien structuré', () => {
    const analysis = analyzeCv(pdfFrom(GOOD_CV));
    const status = Object.fromEntries(analysis.checks.map((c) => [c.id, c.status]));
    expect(status).toMatchObject({
      textLayer: 'pass',
      columns: 'pass',
      order: 'pass',
      unreadable: 'pass',
      contact: 'pass',
      sections: 'pass',
      quantified: 'pass',
      weakPhrases: 'pass',
      dates: 'pass',
    });
    expect(analysis.score).toBeGreaterThanOrEqual(90);
  });

  it('détecte une mise en page en colonnes', () => {
    const twoColumns = Array.from({ length: 30 }, (_, i): [number, string][] => [
      [40, `Compétence ${i}`],
      [230, `Texte de la colonne principale numéro ${i} assez long`],
    ]);
    const analysis = analyzeCv(pdfFrom([...GOOD_CV.slice(0, 4), ...twoColumns]));
    expect(analysis.checks.find((c) => c.id === 'columns')?.status).toBe('warn');
  });

  it('détecte une colonne latérale dont les lignes ne tombent pas à la même hauteur', () => {
    const items: PdfTextItem[] = [];
    for (let i = 0; i < 20; i++) {
      items.push({
        text: `Contact ou compétence ${i}`,
        x: 30,
        y: 80 + i * 30,
        width: 120,
        height: 10,
      });
      items.push({
        text: `Expérience détaillée de la colonne principale ${i}`,
        x: 230,
        y: 95 + i * 30,
        width: 300,
        height: 10,
      });
    }
    const analysis = analyzeCv({ pages: [{ ...A4, items }] });
    expect(analysis.checks.find((c) => c.id === 'columns')?.status).toBe('warn');
  });

  it('ignore les titres centrés', () => {
    const centered = GOOD_CV.map((line, i) =>
      i % 5 === 0 && typeof line === 'string'
        ? ([[220, line.slice(0, 30)]] as [number, string][])
        : line,
    );
    const analysis = analyzeCv(pdfFrom(centered));
    expect(analysis.checks.find((c) => c.id === 'columns')?.status).toBe('pass');
  });

  it('ne confond pas une date alignée à droite avec une colonne', () => {
    const analysis = analyzeCv(pdfFrom(GOOD_CV));
    expect(analysis.checks.find((c) => c.id === 'columns')?.status).toBe('pass');
  });

  it('repère les pictogrammes et les jauges de niveau', () => {
    const analysis = analyzeCv(pdfFrom([...GOOD_CV, ' Téléphone', 'Anglais ●●●○○']));
    const unreadable = analysis.checks.find((c) => c.id === 'unreadable');
    expect(unreadable?.status).toBe('warn');
    expect(unreadable?.params['count']).toBe(2);
  });

  it('liste les sections standards manquantes', () => {
    const analysis = analyzeCv(pdfFrom(GOOD_CV.filter((line) => line !== 'Formation')));
    const sections = analysis.checks.find((c) => c.id === 'sections');
    expect(sections?.status).toBe('warn');
    expect(sections?.items).toEqual(['education']);
  });

  it('signale les formulations faibles en début de puce', () => {
    const analysis = analyzeCv(
      pdfFrom([...GOOD_CV, '• En charge de la recette', '• Responsible for testing']),
    );
    expect(analysis.checks.find((c) => c.id === 'weakPhrases')?.items).toEqual([
      'En charge de',
      'Responsible for',
    ]);
  });
});

describe('buildLines', () => {
  it('reconstitue les lignes de haut en bas, puis de gauche à droite', () => {
    const lines = buildLines({
      pages: [
        {
          ...A4,
          items: [
            { text: 'droite', x: 300, y: 100, width: 30, height: 10 },
            { text: 'gauche', x: 50, y: 101, width: 30, height: 10 },
            { text: 'haut', x: 50, y: 50, width: 20, height: 10 },
          ],
        },
      ],
    });
    expect(lines.map((line) => line.text)).toEqual(['haut', 'gauche droite']);
  });
});

describe('findWeakOpener', () => {
  it('reconnaît les débuts faibles, accents ou non', () => {
    expect(findWeakOpener('• En charge de la paie')).toBe('En charge de');
    expect(findWeakOpener('Participe a la refonte')).toBe('Participe a');
    expect(findWeakOpener('Zuständig für das Budget')).toBe('Zuständig für');
  });

  it('ignore un intitulé de poste au milieu d’une phrase', () => {
    expect(findWeakOpener('Promu responsable de projet en 2021')).toBeNull();
    expect(findWeakOpener('Helpdesk niveau 2')).toBeNull();
  });
});

describe('readingOrder', () => {
  /** Réécrit les fragments du PDF dans un autre ordre (positions inchangées). */
  const reorder = (pdf: ExtractedPdf, order: (items: PdfTextItem[]) => PdfTextItem[]) => ({
    pages: pdf.pages.map((page) => ({ ...page, items: order(page.items) })),
  });
  const orderCheck = (pdf: ExtractedPdf) => analyzeCv(pdf).checks.find((c) => c.id === 'order');

  it("accepte un fichier écrit dans l'ordre de lecture", () => {
    expect(readingOrder(pdfFrom(GOOD_CV))).toEqual({ displaced: 0, headerLate: false });
    expect(orderCheck(pdfFrom(GOOD_CV))?.status).toBe('pass');
  });

  it('signale un en-tête écrit après le reste du CV', () => {
    const pdf = reorder(pdfFrom(GOOD_CV), (items) => [...items.slice(3), ...items.slice(0, 3)]);
    expect(readingOrder(pdf).headerLate).toBe(true);
    expect(orderCheck(pdf)?.message).toBe('warnHeader');
  });

  it('pénalise des blocs écrits dans le désordre (blocs de texte libres)', () => {
    const pdf = reorder(pdfFrom(GOOD_CV), (items) => {
      const blocks = [0, 6, 12, 18, 24, 30].map((start) => items.slice(start, start + 6));
      return [blocks[3], blocks[0], blocks[5], blocks[1], blocks[4], blocks[2]].flat();
    });
    expect(readingOrder(pdf).displaced).toBeGreaterThan(0.25);
    expect(orderCheck(pdf)?.status).toBe('fail');
  });

  it('accepte une colonne latérale écrite avant la colonne principale', () => {
    const side = Array.from({ length: 12 }, (_, i): PdfTextItem => ({
      text: `Compétence latérale numéro ${i} · Angular`,
      x: 40,
      y: 300 + i * 30,
      width: 150,
      height: 10,
    }));
    const mainColumn = Array.from({ length: 30 }, (_, i): PdfTextItem => ({
      text: `Ligne de la colonne principale numéro ${i}, assez longue pour peser`,
      x: 230,
      y: 60 + i * 24,
      width: 320,
      height: 10,
    }));
    expect(readingOrder({ pages: [{ ...A4, items: [...side, ...mainColumn] }] })).toEqual({
      displaced: 0,
      headerLate: false,
    });
  });
});
