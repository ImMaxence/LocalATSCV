/** Fragment de texte : gras, lien, ou texte simple. */
export interface MdInline {
  text: string;
  bold?: boolean;
  href?: string;
}

export type MdBlock =
  { type: 'h1' | 'h2' | 'h3' | 'p'; inlines: MdInline[] } | { type: 'ul'; items: MdInline[][] };

const INLINE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseInlineMarkdown(text: string): MdInline[] {
  const inlines: MdInline[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    if (match.index > last) inlines.push({ text: text.slice(last, match.index) });
    inlines.push(match[1] ? { text: match[1], bold: true } : { text: match[2], href: match[3] });
    last = match.index + match[0].length;
  }
  if (last < text.length) inlines.push({ text: text.slice(last) });
  return inlines;
}

/**
 * Sous-ensemble de Markdown suffisant pour les pages légales : titres, paragraphes, listes,
 * gras et liens. Rendu en éléments Angular (pas de HTML injecté). Les commentaires sont ignorés.
 */
export function parseMarkdown(markdown: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  let paragraph: string[] = [];
  let list: MdInline[][] | null = null;
  const flush = () => {
    if (paragraph.length)
      blocks.push({ type: 'p', inlines: parseInlineMarkdown(paragraph.join(' ')) });
    paragraph = [];
    list = null;
  };

  for (const line of markdown.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/)) {
    const trimmed = line.trim();
    const heading = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (!trimmed) flush();
    else if (heading) {
      flush();
      blocks.push({
        type: `h${heading[1].length}` as 'h1',
        inlines: parseInlineMarkdown(heading[2]),
      });
    } else if (/^[-*]\s+/.test(trimmed)) {
      if (paragraph.length) flush();
      if (!list) {
        list = [];
        blocks.push({ type: 'ul', items: list });
      }
      list.push(parseInlineMarkdown(trimmed.replace(/^[-*]\s+/, '')));
    } else {
      list = null;
      paragraph.push(trimmed);
    }
  }
  flush();
  return blocks;
}
