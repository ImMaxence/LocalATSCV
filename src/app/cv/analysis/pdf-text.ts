/** Fragment de texte positionné, en points PDF, origine en haut à gauche de la page. */
export interface PdfTextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PdfPage {
  width: number;
  height: number;
  items: PdfTextItem[];
}

export interface ExtractedPdf {
  pages: PdfPage[];
}

export class PdfReadError extends Error {
  constructor(readonly code: 'encrypted' | 'unreadable') {
    super(code);
  }
}

interface RawTextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

/**
 * Extrait le texte d'un PDF dans le navigateur avec pdf.js (chargé uniquement ici).
 * C'est exactement ce que récupère un ATS : si le texte est absent ou mal ordonné ici,
 * il l'est aussi pour le logiciel du recruteur.
 */
export async function extractPdfText(data: ArrayBuffer): Promise<ExtractedPdf> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

  const task = pdfjs.getDocument({
    data: new Uint8Array(data),
    disableFontFace: true,
    verbosity: 0,
  });
  let document;
  try {
    document = await task.promise;
  } catch (error) {
    const encrypted = (error as { name?: string })?.name === 'PasswordException';
    throw new PdfReadError(encrypted ? 'encrypted' : 'unreadable');
  }

  try {
    const pages: PdfPage[] = [];
    for (let number = 1; number <= document.numPages; number++) {
      const page = await document.getPage(number);
      const { width, height } = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      const items = (content.items as unknown[])
        .filter((item): item is RawTextItem => typeof (item as RawTextItem).str === 'string')
        .filter((item) => item.str.length > 0)
        .map((item) => ({
          text: item.str,
          x: item.transform[4],
          y: height - item.transform[5],
          width: item.width,
          height: Math.abs(item.transform[3]) || item.height,
        }));
      pages.push({ width, height, items });
    }
    return { pages };
  } finally {
    await task.destroy();
  }
}
