import { strToU8, zipSync } from 'fflate';
import { DocxReadError, docxLines, importDocx } from './docx';

const NS =
  'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"';

const p = (text: string, options: { style?: string; size?: number; bullet?: boolean } = {}) =>
  `<w:p><w:pPr>${options.style ? `<w:pStyle w:val="${options.style}"/>` : ''}${
    options.bullet ? '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>' : ''
  }</w:pPr><w:r>${options.size ? `<w:rPr><w:sz w:val="${options.size * 2}"/></w:rPr>` : ''}<w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;

const STYLES = `<?xml version="1.0"?><w:styles ${NS}>
  <w:docDefaults><w:rPrDefault><w:rPr><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Titre1"><w:name w:val="heading 1"/><w:pPr><w:outlineLvl w:val="0"/></w:pPr></w:style>
</w:styles>`;

function docx(body: string, header = ''): Uint8Array {
  const files: Record<string, Uint8Array> = {
    'word/document.xml': strToU8(
      `<?xml version="1.0"?><w:document ${NS}><w:body>${body}</w:body></w:document>`,
    ),
    'word/styles.xml': strToU8(STYLES),
  };
  if (header)
    files['word/header1.xml'] = strToU8(`<?xml version="1.0"?><w:hdr ${NS}>${header}</w:hdr>`);
  return zipSync(files);
}

const SAMPLE = docx(
  [
    p('Développeuse Front-end'),
    p('Expérience professionnelle', { style: 'Titre1' }),
    p('Développeuse Angular, Société Exemple, Lyon'),
    p('Mars 2022 – aujourd’hui'),
    p('Migration de 40 écrans vers Angular, chargement réduit de 35 %', { bullet: true }),
    p('Formation', { style: 'Titre1' }),
    // Tableau : lu cellule par cellule
    `<w:tbl><w:tr><w:tc>${p('Master Informatique, Université Exemple')}</w:tc><w:tc>${p('2017 – 2019')}</w:tc></w:tr></w:tbl>`,
    p('Compétences', { style: 'Titre1' }),
    // Zone de texte avec sa version de secours (Fallback) qui ne doit pas être lue deux fois
    `<w:p><w:r><mc:AlternateContent><mc:Choice Requires="wps"><w:drawing><w:txbxContent>${p('Angular, TypeScript, RxJS')}</w:txbxContent></w:drawing></mc:Choice><mc:Fallback><w:pict><w:txbxContent>${p('Angular, TypeScript, RxJS')}</w:txbxContent></w:pict></mc:Fallback></mc:AlternateContent></w:r></w:p>`,
  ].join(''),
  p('Camille Martin', { size: 24 }) + p('camille.martin@exemple.fr · +33 6 12 34 56 78'),
);

describe('docxLines', () => {
  it("lit en-tête, paragraphes, tableaux et zones de texte dans l'ordre", () => {
    const texts = docxLines(SAMPLE).map((line) => line.text);
    expect(texts).toEqual([
      'Camille Martin',
      'camille.martin@exemple.fr · +33 6 12 34 56 78',
      'Développeuse Front-end',
      'Expérience professionnelle',
      'Développeuse Angular, Société Exemple, Lyon',
      'Mars 2022 – aujourd’hui',
      '• Migration de 40 écrans vers Angular, chargement réduit de 35 %',
      'Formation',
      'Master Informatique, Université Exemple',
      '2017 – 2019',
      'Compétences',
      'Angular, TypeScript, RxJS',
    ]);
  });

  it('agrandit les titres de style « heading » pour les reconnaître', () => {
    const lines = docxLines(SAMPLE);
    const heading = lines.find((line) => line.text === 'Formation');
    const body = lines.find((line) => line.text === 'Développeuse Front-end');
    expect(heading!.size).toBeGreaterThan(body!.size);
  });

  it("refuse un fichier qui n'est pas un document Word", () => {
    expect(() => docxLines(zipSync({ 'autre.txt': strToU8('x') }))).toThrow(DocxReadError);
    expect(() => docxLines(strToU8('pas une archive'))).toThrow(DocxReadError);
  });
});

describe('importDocx', () => {
  it('range le contenu dans un nouveau CV', () => {
    const { cv } = importDocx(SAMPLE, 'cv');
    expect(cv.profile.firstName).toBe('Camille');
    expect(cv.profile.lastName).toBe('Martin');
    expect(cv.profile.email).toBe('camille.martin@exemple.fr');
    expect(cv.sections.map((section) => section.kind)).toEqual([
      'experience',
      'education',
      'skills',
    ]);
  });
});
