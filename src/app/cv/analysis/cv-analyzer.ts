import { ExtractedPdf, PdfTextItem } from './pdf-text';
import { findWeakOpener, normalizeText } from './weak-phrases';

export type CheckCategory = 'readability' | 'structure' | 'content';
export type CheckStatus = 'pass' | 'warn' | 'fail';
export type CheckId =
  | 'textLayer'
  | 'columns'
  | 'unreadable'
  | 'contact'
  | 'sections'
  | 'length'
  | 'quantified'
  | 'weakPhrases'
  | 'dates';

export interface CvCheck {
  id: CheckId;
  category: CheckCategory;
  status: CheckStatus;
  points: number;
  max: number;
  /** Clé du message dans `analyze.checks.<id>` (pass, warn, fail ou variante). */
  message: string;
  params: Record<string, string | number>;
  /** Éléments à lister sous le message (sections manquantes, formulations trouvées…). */
  items: string[];
}

export interface CvAnalysis {
  score: number;
  categories: { id: CheckCategory; points: number; max: number }[];
  checks: CvCheck[];
  /** Le texte reconstitué ligne par ligne, tel qu'un ATS le lit. */
  lines: string[];
  stats: { pages: number; words: number; characters: number };
}

/** Titres de sections standards (minuscules, sans accents), dans les 5 langues. */
export const SECTION_HEADINGS: Record<'experience' | 'education' | 'skills', string[]> = {
  experience: [
    'experience',
    'experiences',
    'experience professionnelle',
    'experiences professionnelles',
    'parcours professionnel',
    'professional experience',
    'work experience',
    'employment history',
    'work history',
    'esperienza',
    'esperienze',
    'esperienza professionale',
    'esperienze professionali',
    'esperienza lavorativa',
    'experiencia',
    'experiencia profesional',
    'experiencia laboral',
    'berufserfahrung',
    'beruflicher werdegang',
    'werdegang',
  ],
  education: [
    'formation',
    'formations',
    'education',
    'diplomes',
    'etudes',
    'cursus',
    'formazione',
    'istruzione',
    'formacion',
    'educacion',
    'estudios',
    'ausbildung',
    'bildung',
    'bildungsweg',
    'studium',
  ],
  skills: [
    'competences',
    'competences techniques',
    'skills',
    'technical skills',
    'core skills',
    'competenze',
    'competencias',
    'habilidades',
    'kenntnisse',
    'kompetenzen',
    'fahigkeiten',
  ],
};

export interface Line {
  page: number;
  y: number;
  items: PdfTextItem[];
  text: string;
}

const BULLET = /^[•●▪◦‣∙·■□►▸✓✔*–—-]\s*/;
const YEAR = /\b(19[5-9]\d|20[0-4]\d)\b/g;
const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/;
const PHONE = /(?:\+|00)?\d[\d .\-()/]{7,}\d/g;
/** Zone d'usage privé Unicode : caractères des polices d'icônes. */
const ICON_CHARS = /\p{Co}/gu;
/** Caractère de remplacement « � », produit quand une police n'a pas de correspondance Unicode. */
const REPLACEMENT_CHAR = String.fromCharCode(0xfffd);
const RATING_GLYPHS = /[●○◉◯★☆✦✧◆◇■□]{2,}/g;
const WORD = /\p{L}[\p{L}\p{N}'’-]*/gu;

/**
 * Regroupe les fragments par ligne visuelle (même ordonnée), de haut en bas puis de gauche
 * à droite : c'est ainsi que la plupart des ATS reconstituent le texte d'un PDF.
 */
export function buildLines(pdf: ExtractedPdf): Line[] {
  const lines: Line[] = [];
  pdf.pages.forEach((page, pageIndex) => {
    const items = page.items
      .filter((item) => item.text.trim())
      .sort((a, b) => a.y - b.y || a.x - b.x);
    let current: Line | null = null;
    for (const item of items) {
      const tolerance = Math.max(2, item.height * 0.45);
      if (current && Math.abs(item.y - current.y) <= tolerance) {
        current.items.push(item);
      } else {
        current = { page: pageIndex, y: item.y, items: [item], text: '' };
        lines.push(current);
      }
    }
  });
  for (const line of lines) {
    line.items.sort((a, b) => a.x - b.x);
    line.text = line.items
      .reduce((text, item, index) => {
        const previous = line.items[index - 1];
        const gap = previous ? item.x - (previous.x + previous.width) : 0;
        const space = index > 0 && gap > 1 && !text.endsWith(' ') && !item.text.startsWith(' ');
        return text + (space ? ' ' : '') + item.text;
      }, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return lines;
}

const chars = (items: PdfTextItem[]) => items.reduce((sum, item) => sum + item.text.length, 0);

/**
 * Gouttière verticale entre deux colonnes : une abscisse qu'aucun fragment de texte ne traverse,
 * avec assez de texte de chaque côté. Un CV à une colonne n'en a pas : ses lignes la traversent.
 */
export function findGutter(page: ExtractedPdf['pages'][number]): number | null {
  const items = page.items.filter((item) => item.text.trim().length >= 2);
  const total = chars(items);
  for (let x = page.width * 0.2; x <= page.width * 0.55; x += 2) {
    const crossing = items.filter((item) => item.x < x - 1 && item.x + item.width > x + 1).length;
    if (crossing > Math.max(1, items.length * 0.03)) continue;
    const left = items.filter((item) => item.x + item.width <= x + 1);
    const right = items.filter((item) => item.x >= x - 1);
    if (
      left.length >= 6 &&
      right.length >= 6 &&
      Math.min(chars(left), chars(right)) >= total * 0.12
    ) {
      return x;
    }
  }
  return null;
}

/**
 * Lecture colonne par colonne, comme les ATS récents : si une page a une vraie colonne
 * latérale, la colonne principale (la plus fournie) est lue d'abord, puis la latérale.
 * Une marge de dates alignée ligne à ligne avec le contenu n'est pas une colonne indépendante.
 */
export function readingColumns(pdf: ExtractedPdf): { main: Line[]; side: Line[] } {
  const main: Line[] = [];
  const side: Line[] = [];
  for (const page of pdf.pages) {
    const linesOf = (items: PdfTextItem[]) => buildLines({ pages: [{ ...page, items }] });
    const gutter = findGutter(page);
    if (gutter === null) {
      main.push(...linesOf(page.items));
      continue;
    }
    const left = page.items.filter((item) => item.x < gutter);
    const right = page.items.filter((item) => item.x >= gutter);
    const leftLines = linesOf(left);
    const rightLines = linesOf(right);
    const aligned = leftLines.filter((line) =>
      rightLines.some((other) => Math.abs(other.y - line.y) <= 1.5),
    ).length;
    if (aligned >= leftLines.length * 0.5) {
      main.push(...linesOf(page.items));
      continue;
    }
    const [primary, secondary] =
      chars(right) >= chars(left) ? [rightLines, leftLines] : [leftLines, rightLines];
    main.push(...primary);
    side.push(...secondary);
  }
  return { main, side };
}

/**
 * Colonnes côte à côte : sur une même ligne, deux blocs de texte séparés par un grand blanc,
 * le bloc de droite n'étant pas une simple date alignée à droite.
 */
function countColumnLines(lines: Line[], pdf: ExtractedPdf): number {
  let suspicious = 0;
  for (const line of lines) {
    const pageWidth = pdf.pages[line.page].width;
    for (let i = 1; i < line.items.length; i++) {
      const previous = line.items[i - 1];
      const gap = line.items[i].x - (previous.x + previous.width);
      if (gap < pageWidth * 0.06) continue;
      const left = line.items
        .slice(0, i)
        .map((item) => item.text)
        .join(' ')
        .trim();
      const right = line.items
        .slice(i)
        .map((item) => item.text)
        .join(' ')
        .trim();
      // Une date isolée d'un côté (alignée à droite, ou en marge à gauche) n'est pas une colonne.
      const isDate = (part: string) =>
        part.length <= 32 && /\d{4}|present|aujourd|heute|oggi|actualidad|en cours/i.test(part);
      if (!isDate(left) && !isDate(right) && left.length >= 3 && right.length >= 12) {
        suspicious++;
        break;
      }
    }
  }
  return suspicious;
}

/**
 * Colonnes décalées : des lignes qui commencent contre la marge gauche et d'autres qui
 * commencent au tiers de la page, sur la même hauteur de page. Les lignes centrées
 * (titres, en-têtes) ne comptent pas.
 */
function hasStackedColumns(lines: Line[], pdf: ExtractedPdf): boolean {
  return pdf.pages.some((page, pageIndex) => {
    const left: number[] = [];
    const right: number[] = [];
    for (const line of lines) {
      if (line.page !== pageIndex || line.text.length < 3) continue;
      const first = line.items[0];
      const last = line.items[line.items.length - 1];
      const start = first.x;
      const end = last.x + last.width;
      const centered =
        start > page.width * 0.15 && Math.abs(start - (page.width - end)) < page.width * 0.08;
      if (centered) continue;
      if (start < page.width * 0.25) left.push(line.y);
      else if (start >= page.width * 0.3) right.push(line.y);
    }
    if (left.length < 6 || right.length < 6) return false;
    const overlap =
      Math.min(Math.max(...left), Math.max(...right)) -
      Math.max(Math.min(...left), Math.min(...right));
    return overlap > page.height * 0.3;
  });
}

const check = (
  id: CheckId,
  category: CheckCategory,
  max: number,
  status: CheckStatus,
  points: number,
  message: string = status,
  params: Record<string, string | number> = {},
  items: string[] = [],
): CvCheck => ({ id, category, status, points, max, message, params, items });

export function analyzeCv(pdf: ExtractedPdf): CvAnalysis {
  const lines = buildLines(pdf);
  // Le contenu est évalué colonne par colonne (lecture des ATS récents). La vue « robot » et le
  // contrôle de mise en page gardent la lecture ligne à ligne, la plus pessimiste.
  const { main, side } = readingColumns(pdf);
  const contentLines = [...main, ...side];
  const text = lines.map((line) => line.text).join('\n');
  const characters = text.replace(/\s/g, '').length;
  const words = text.match(WORD)?.length ?? 0;
  const pages = pdf.pages.length;
  const stats = { pages, words, characters };

  // 1. Lisibilité
  const pagesWithText = pdf.pages.filter(
    (page) => page.items.reduce((sum, item) => sum + item.text.trim().length, 0) >= 40,
  ).length;
  if (characters < 200) {
    const textLayer = check('textLayer', 'readability', 20, 'fail', 0);
    return {
      score: 0,
      categories: summarize([textLayer]),
      checks: [textLayer],
      lines: lines.map((line) => line.text),
      stats,
    };
  }
  const checks: CvCheck[] = [
    pagesWithText < pages
      ? check('textLayer', 'readability', 20, 'warn', 10)
      : check('textLayer', 'readability', 20, 'pass', 20),
  ];

  const columnLines = countColumnLines(lines, pdf);
  checks.push(
    (columnLines >= 4 && columnLines / lines.length >= 0.12) || hasStackedColumns(lines, pdf)
      ? check('columns', 'readability', 10, 'warn', 3)
      : check('columns', 'readability', 10, 'pass', 10),
  );

  const unreadable =
    (text.match(ICON_CHARS)?.length ?? 0) +
    (text.split(REPLACEMENT_CHAR).length - 1) +
    (text.match(RATING_GLYPHS)?.length ?? 0);
  checks.push(
    unreadable === 0
      ? check('unreadable', 'readability', 10, 'pass', 10)
      : check(
          'unreadable',
          'readability',
          10,
          unreadable > 5 ? 'fail' : 'warn',
          unreadable > 5 ? 0 : 5,
          unreadable > 5 ? 'fail' : 'warn',
          { count: unreadable },
        ),
  );

  // 2. Structure
  const hasEmail = EMAIL.test(text);
  const hasPhone = (text.match(PHONE) ?? []).some((match) => match.replace(/\D/g, '').length >= 9);
  checks.push(
    hasEmail && hasPhone
      ? check('contact', 'structure', 10, 'pass', 10)
      : hasEmail || hasPhone
        ? check('contact', 'structure', 10, 'warn', 5, hasEmail ? 'warnNoPhone' : 'warnNoEmail')
        : check('contact', 'structure', 10, 'fail', 0),
  );

  const headings = contentLines
    .map((line) =>
      normalizeText(line.text)
        .replace(/[^a-z ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter((heading) => heading.length > 0 && heading.length <= 45);
  const missing = (Object.keys(SECTION_HEADINGS) as (keyof typeof SECTION_HEADINGS)[]).filter(
    (section) =>
      !headings.some((heading) =>
        SECTION_HEADINGS[section].some(
          (candidate) => heading === candidate || heading.startsWith(`${candidate} `),
        ),
      ),
  );
  checks.push(
    missing.length === 0
      ? check('sections', 'structure', 15, 'pass', 15)
      : check(
          'sections',
          'structure',
          15,
          missing.length === 3 ? 'fail' : 'warn',
          (3 - missing.length) * 5,
          missing.length === 3 ? 'fail' : 'warn',
          {},
          missing,
        ),
  );

  const lengthStatus: CheckStatus =
    pages <= 2 && words >= 250 && words <= 1000
      ? 'pass'
      : pages > 3 || words < 120
        ? 'fail'
        : 'warn';
  checks.push(
    check(
      'length',
      'structure',
      10,
      lengthStatus,
      { pass: 10, warn: 5, fail: 0 }[lengthStatus],
      lengthStatus,
      { pages, words },
    ),
  );

  // 3. Contenu
  const bulletLines = contentLines.filter((line) => BULLET.test(line.text));
  const candidates =
    bulletLines.length >= 3
      ? bulletLines
      : contentLines.filter((line) => (line.text.match(WORD)?.length ?? 0) >= 6);
  const quantified = candidates.filter((line) => /\d/.test(line.text.replace(YEAR, ''))).length;
  const percent = candidates.length ? Math.round((quantified / candidates.length) * 100) : 0;
  const quantifiedStatus: CheckStatus = percent >= 30 ? 'pass' : percent >= 10 ? 'warn' : 'fail';
  checks.push(
    check(
      'quantified',
      'content',
      10,
      quantifiedStatus,
      { pass: 10, warn: 5, fail: 0 }[quantifiedStatus],
      quantifiedStatus,
      { percent },
    ),
  );

  const weak = [
    ...new Set(
      contentLines.map((line) => findWeakOpener(line.text)).filter((phrase) => phrase !== null),
    ),
  ];
  checks.push(
    weak.length === 0
      ? check('weakPhrases', 'content', 8, 'pass', 8)
      : check(
          'weakPhrases',
          'content',
          8,
          weak.length > 3 ? 'fail' : 'warn',
          weak.length > 3 ? 0 : 4,
          weak.length > 3 ? 'fail' : 'warn',
          { count: weak.length },
          weak,
        ),
  );

  const years = new Set(text.match(YEAR) ?? []).size;
  checks.push(
    years >= 2
      ? check('dates', 'content', 7, 'pass', 7)
      : check('dates', 'content', 7, years === 1 ? 'warn' : 'fail', years === 1 ? 3 : 0),
  );

  return {
    score: checks.reduce((sum, item) => sum + item.points, 0),
    categories: summarize(checks),
    checks,
    lines: lines.map((line) => line.text),
    stats,
  };
}

const CATEGORY_MAX: Record<CheckCategory, number> = { readability: 40, structure: 35, content: 25 };

function summarize(checks: CvCheck[]): CvAnalysis['categories'] {
  return (Object.keys(CATEGORY_MAX) as CheckCategory[]).map((id) => ({
    id,
    max: CATEGORY_MAX[id],
    points: checks
      .filter((item) => item.category === id)
      .reduce((sum, item) => sum + item.points, 0),
  }));
}
