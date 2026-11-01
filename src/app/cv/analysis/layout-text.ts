import { ExtractedPdf, PdfPage, PdfTextItem } from './pdf-text';

/**
 * Reconstitue, à partir du CV affiché, les fragments de texte positionnés qu'un PDF imprimé
 * contiendrait : un fragment par mot, avec sa position sur la page A4. Le résultat passe dans
 * le même moteur que l'analyseur de PDF, ce qui permet un contrôle ATS en direct dans l'éditeur.
 *
 * `scale` corrige la réduction appliquée à l'aperçu ; les décorations sans texte (icônes SVG,
 * jauges, filets) sont naturellement ignorées, comme par un ATS.
 */
export function extractLayoutText(
  root: HTMLElement,
  scale: number,
  pageWidth: number,
  pageHeight: number,
): ExtractedPdf {
  const origin = root.getBoundingClientRect();
  const items: (PdfTextItem & { page: number })[] = [];
  const range = document.createRange();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? '';
    for (const match of text.matchAll(/\S+/g)) {
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const top = (rect.top - origin.top) / scale;
      const page = Math.floor(top / pageHeight);
      items.push({
        text: match[0],
        x: (rect.left - origin.left) / scale,
        // Ligne de base approximative : bas de la boîte du mot.
        y: top + rect.height / scale - page * pageHeight,
        width: rect.width / scale,
        height: (rect.height / scale) * 0.8,
        page,
      });
    }
  }
  range.detach();

  const pageCount = Math.max(1, Math.ceil((origin.height / scale - 1) / pageHeight));
  const pages: PdfPage[] = Array.from({ length: pageCount }, () => ({
    width: pageWidth,
    height: pageHeight,
    items: [],
  }));
  for (const { page, ...item } of items) pages[Math.min(page, pageCount - 1)].items.push(item);
  return { pages };
}
