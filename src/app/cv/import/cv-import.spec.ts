import { ExtractedPdf, PdfTextItem } from '../analysis/pdf-text';
import { EntrySection, LanguagesSection, SkillsSection } from '../model/cv.model';
import { findDateRange, importCv, parseEntries } from './cv-import';

const A4 = { width: 595, height: 842 };

/** Une ligne par entrée ; `size` permet de grossir le nom, `x` de placer une colonne. */
function column(
  lines: (string | [string, number])[],
  x: number,
  top = 50,
  step = 16,
): PdfTextItem[] {
  return lines.map((line, i) => {
    const [text, size] = typeof line === 'string' ? [line, 10] : line;
    return { text, x, y: top + i * step, width: text.length * 3.5, height: size };
  });
}

const pdf = (...items: PdfTextItem[][]): ExtractedPdf => ({
  pages: [{ ...A4, items: items.flat() }],
});

describe('findDateRange', () => {
  it('lit les formats courants', () => {
    expect(findDateRange('Mars 2022 – aujourd’hui')).toMatchObject({
      start: '2022-03',
      end: '',
      current: true,
    });
    expect(findDateRange('09/2019 - 02/2022')).toMatchObject({ start: '2019-09', end: '2022-02' });
    expect(findDateRange('Sept. 2019 – Févr. 2022')).toMatchObject({
      start: '2019-09',
      end: '2022-02',
    });
    expect(findDateRange('January 2020 - Present (4 years)')).toMatchObject({
      start: '2020-01',
      current: true,
    });
    expect(findDateRange('2017 - 2019')).toMatchObject({ start: '2017', end: '2019' });
    expect(findDateRange('März 2021 – heute')).toMatchObject({ start: '2021-03', current: true });
  });

  it('ignore un mot qui n’est pas un mois', () => {
    const range = findDateRange('Master Informatique 2017 – 2019')!;
    expect('Master Informatique 2017 – 2019'.slice(0, range.index).trim()).toBe(
      'Master Informatique',
    );
  });
});

describe('parseEntries', () => {
  it('découpe les postes à partir des dates et des puces', () => {
    const entries = parseEntries([
      'Développeuse Angular — Société Exemple',
      'Mars 2022 – aujourd’hui',
      '• Migration de 40 écrans vers Angular',
      '• Déploiement continu pour 3 équipes',
      'Développeuse web',
      'Agence Démo',
      '2019 – 2022',
      '• Développement de 15 sites',
    ]);
    expect(entries.length).toBe(2);
    expect(entries[0]).toMatchObject({
      title: 'Développeuse Angular — Société Exemple',
      start: '2022-03',
      current: true,
    });
    expect(entries[0].bullets.length).toBe(2);
    expect(entries[1]).toMatchObject({
      title: 'Développeuse web',
      subtitle: 'Agence Démo',
      start: '2019',
      end: '2022',
    });
  });

  it('recolle les lignes d’un paragraphe coupé', () => {
    const [entry] = parseEntries([
      'Chargée d’accueil',
      '2020 – 2021',
      'Accueil physique et téléphonique,',
      'gestion des plannings.',
    ]);
    expect(entry.bullets.map((b) => b.text)).toEqual([
      'Accueil physique et téléphonique, gestion des plannings.',
    ]);
  });
});

describe('importCv', () => {
  it('reprend un CV classique à une colonne', () => {
    const { cv, items } = importCv(
      pdf(
        column(
          [
            ['Camille MARTIN', 22],
            'Développeuse Front-end',
            'Lyon · camille.martin@exemple.fr · +33 6 12 34 56 78',
            'Profil',
            'Développeuse front-end avec 5 ans d’expérience.',
            'Expérience professionnelle',
            'Développeuse Angular — Société Exemple',
            'Mars 2022 – aujourd’hui',
            '• Migration de 40 écrans vers Angular',
            'Formation',
            'Master Informatique — Université Exemple',
            '2017 – 2019',
            'Compétences',
            'Front-end : Angular, TypeScript, RxJS',
            'Langues',
            'Anglais : C1 · Français : natif',
          ],
          50,
        ),
      ),
      'cv',
    );
    expect(cv.profile).toMatchObject({
      firstName: 'Camille',
      lastName: 'MARTIN',
      title: 'Développeuse Front-end',
      email: 'camille.martin@exemple.fr',
      phone: '+33 6 12 34 56 78',
      summary: 'Développeuse front-end avec 5 ans d’expérience.',
    });
    expect(cv.language).toBe('fr');
    expect(cv.sections.map((s) => s.kind)).toEqual([
      'experience',
      'education',
      'skills',
      'languages',
    ]);
    expect((cv.sections[2] as SkillsSection).items[0]).toMatchObject({
      label: 'Front-end',
      keywords: 'Angular, TypeScript, RxJS',
    });
    expect((cv.sections[3] as LanguagesSection).items.map((l) => [l.name, l.level])).toEqual([
      ['Anglais', 'C1'],
      ['Français', 'natif'],
    ]);
    expect(items).toBe(5);
  });

  it('reprend un PDF LinkedIn (deux colonnes, entreprise avant le poste)', () => {
    const sidebar = column(
      [
        'Coordonnées',
        'camille.martin@exemple.fr',
        'www.linkedin.com/in/camille-martin (LinkedIn)',
        'Principales compétences',
        'Angular',
        'TypeScript',
        'Docker',
        'Languages',
        'Anglais (Professional Working)',
        'Français (Native or Bilingual)',
      ],
      30,
      60,
      17,
    );
    const main = column(
      [
        ['Camille Martin', 24],
        'Développeuse Front-end chez Société Exemple',
        'Lyon, Auvergne-Rhône-Alpes, France',
        'Résumé',
        'Développeuse passionnée par la qualité.',
        'Expérience',
        'Société Exemple',
        'Développeuse Angular',
        'mars 2022 - Present (2 ans 8 mois)',
        'Lyon, Auvergne-Rhône-Alpes, France',
        'Migration de 40 écrans vers Angular.',
        'Agence Démo',
        '2 ans 6 mois',
        'Développeuse web',
        'septembre 2019 - février 2022 (2 ans 6 mois)',
        'Grenoble, France',
        'Formation',
        'Université Exemple',
        'Master, Informatique · (2017 - 2019)',
        'Page 1 of 1',
      ],
      200,
      50,
      16,
    );
    const { cv, linkedin } = importCv(pdf(sidebar, main), 'cv');
    expect(linkedin).toBe(true);
    expect(cv.profile).toMatchObject({
      firstName: 'Camille',
      lastName: 'Martin',
      title: 'Développeuse Front-end chez Société Exemple',
      location: 'Lyon, Auvergne-Rhône-Alpes, France',
      email: 'camille.martin@exemple.fr',
      summary: 'Développeuse passionnée par la qualité.',
    });
    expect(cv.profile.links[0]).toMatchObject({
      label: 'LinkedIn',
      url: 'www.linkedin.com/in/camille-martin',
    });

    const experience = cv.sections.find((s) => s.kind === 'experience') as EntrySection;
    expect(experience.items.map((e) => [e.title, e.subtitle, e.start, e.end, e.current])).toEqual([
      ['Développeuse Angular', 'Société Exemple', '2022-03', '', true],
      ['Développeuse web', 'Agence Démo', '2019-09', '2022-02', false],
    ]);
    expect(experience.items[0].location).toBe('Lyon, Auvergne-Rhône-Alpes, France');
    expect(experience.items[0].bullets[0].text).toBe('Migration de 40 écrans vers Angular.');

    const education = cv.sections.find((s) => s.kind === 'education') as EntrySection;
    expect(education.items[0]).toMatchObject({
      title: 'Université Exemple',
      subtitle: 'Master, Informatique',
      start: '2017',
      end: '2019',
    });

    const skills = cv.sections.find((s) => s.kind === 'skills') as SkillsSection;
    expect(skills.items[0].keywords).toBe('Angular, TypeScript, Docker');
    const languages = cv.sections.find((s) => s.kind === 'languages') as LanguagesSection;
    expect(languages.items[0]).toMatchObject({ name: 'Anglais', level: 'Professional Working' });
  });
});
