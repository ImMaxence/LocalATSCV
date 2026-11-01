import { strFromU8, unzipSync } from 'fflate';
import { ImportResult, SourceLine, importLines } from './cv-import';

/** Un fichier Word (.docx) est une archive ZIP de documents XML (Office Open XML). */
export class DocxReadError extends Error {}

interface ParagraphStyle {
  /** Taille en points, 0 si le style n'en fixe pas. */
  size: number;
  heading: boolean;
}

const PAGE_NUMBER = /^(page\s+)?\d+(\s*(\/|sur|of|de|di|von)\s*\d+)?$/i;

/** Lit un CV Word dans le navigateur et le range dans un nouveau CV, comme un PDF importé. */
export function importDocx(data: Uint8Array, fallbackName: string): ImportResult {
  return importLines(docxLines(data), fallbackName);
}

/**
 * Lignes de texte d'un .docx dans l'ordre de lecture : en-têtes de page (souvent le nom et les
 * coordonnées dans les modèles Word), corps du document (paragraphes, tableaux, zones de texte),
 * puis pieds de page. La taille de police sert à reconnaître les titres de sections.
 */
export function docxLines(data: Uint8Array): SourceLine[] {
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(data, {
      filter: (file) => /^word\/(document|styles|header\d*|footer\d*)\.xml$/.test(file.name),
    });
  } catch {
    throw new DocxReadError('unreadable');
  }
  if (!files['word/document.xml']) throw new DocxReadError('notDocx');

  const { styles, defaultSize } = readStyles(files['word/styles.xml']);
  const collector = new Collector(styles, defaultSize);
  const parts = (kind: string) =>
    Object.keys(files)
      .filter((name) => new RegExp(`^word/${kind}\\d*\\.xml$`).test(name))
      .sort();

  for (const name of parts('header')) collector.collect(parse(files[name]).documentElement);
  collector.collect(parse(files['word/document.xml']).documentElement);
  for (const name of parts('footer')) collector.collect(parse(files[name]).documentElement);

  // Un en-tête répété (première page, pages paires…) ne doit apparaître qu'une fois.
  const seen = new Set<string>();
  return collector.lines.filter((line) => {
    const key = `${line.text}|${line.size}`;
    if (seen.has(key) || PAGE_NUMBER.test(line.text)) return false;
    seen.add(key);
    return true;
  });
}

function parse(bytes: Uint8Array): Document {
  const document = new DOMParser().parseFromString(strFromU8(bytes), 'application/xml');
  if (document.getElementsByTagName('parsererror').length) throw new DocxReadError('unreadable');
  return document;
}

/** Attribut `w:val` (ou autre) sans dépendre du préfixe d'espace de noms. */
function attr(element: Element | undefined, name: string): string {
  if (!element) return '';
  for (const attribute of Array.from(element.attributes)) {
    if (attribute.localName === name) return attribute.value;
  }
  return '';
}

const child = (element: Element | undefined, name: string): Element | undefined =>
  element ? Array.from(element.children).find((node) => node.localName === name) : undefined;

/** Taille `w:sz` en demi-points → points. */
const sizeOf = (rPr: Element | undefined): number => Number(attr(child(rPr, 'sz'), 'val')) / 2 || 0;

function readStyles(bytes: Uint8Array | undefined): {
  styles: Map<string, ParagraphStyle>;
  defaultSize: number;
} {
  const styles = new Map<string, ParagraphStyle>();
  if (!bytes) return { styles, defaultSize: 11 };
  const root = parse(bytes).documentElement;
  const defaults = root.getElementsByTagNameNS('*', 'rPrDefault')[0];
  const defaultSize = sizeOf(child(defaults, 'rPr')) || 11;
  for (const style of Array.from(root.getElementsByTagNameNS('*', 'style'))) {
    if (attr(style, 'type') !== 'paragraph') continue;
    const name = attr(child(style, 'name'), 'val').toLowerCase();
    const outline = child(child(style, 'pPr'), 'outlineLvl');
    styles.set(attr(style, 'styleId'), {
      size: sizeOf(child(style, 'rPr')),
      heading: !!outline || /heading|title|titre|überschrift|titolo|título/.test(name),
    });
  }
  return { styles, defaultSize };
}

class Collector {
  readonly lines: SourceLine[] = [];

  constructor(
    private readonly styles: Map<string, ParagraphStyle>,
    private readonly defaultSize: number,
  ) {}

  /** Parcourt les éléments dans l'ordre du document. */
  collect(element: Element): void {
    for (const node of Array.from(element.children)) {
      switch (node.localName) {
        case 'p':
          this.paragraph(node);
          break;
        // Contenu alternatif : la version moderne (Choice) suffit, l'ancienne (Fallback) le répète.
        case 'Fallback':
          break;
        default:
          this.collect(node);
      }
    }
  }

  private paragraph(paragraph: Element): void {
    const pPr = child(paragraph, 'pPr');
    const style = this.styles.get(attr(child(pPr, 'pStyle'), 'val'));
    const boxes: Element[] = [];
    let text = '';
    let size = 0;
    const walk = (element: Element) => {
      for (const node of Array.from(element.children)) {
        switch (node.localName) {
          case 't':
            text += node.textContent ?? '';
            break;
          case 'tab':
            text += ' ';
            break;
          case 'br':
          case 'cr':
            text += '\n';
            break;
          case 'r':
            size = Math.max(size, sizeOf(child(node, 'rPr')));
            walk(node);
            break;
          // Zones de texte : lues après le paragraphe qui les ancre.
          case 'txbxContent':
            boxes.push(node);
            break;
          case 'Fallback':
          case 'pPr':
          case 'delText':
          case 'instrText':
            break;
          default:
            walk(node);
        }
      }
    };
    walk(paragraph);

    const base = size || style?.size || this.defaultSize;
    const lineSize = style?.heading ? Math.max(base, this.defaultSize * 1.35) : base;
    const bullet = child(pPr, 'numPr') ? '• ' : '';
    for (const part of text.split('\n')) {
      const clean = part.replace(/\s+/g, ' ').trim();
      if (clean) this.lines.push({ text: bullet + clean, size: lineSize });
    }
    for (const box of boxes) this.collect(box);
  }
}
