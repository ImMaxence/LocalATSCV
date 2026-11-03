/**
 * CSS personnalisé d'un style : le navigateur l'analyse (CSSStyleSheet), puis chaque règle est
 * réécrite à partir de sa forme analysée, imbriquée sous le sélecteur propre à un CV. Une
 * accolade mal fermée ne peut donc pas déborder sur l'interface, et un style partagé par un
 * inconnu ne peut ni charger de ressource externe ni modifier autre chose que le CV.
 *
 * Retiré : @import, @font-face, @keyframes, @page et toute adresse `url()` qui n'est pas une
 * image intégrée (`data:image/…`). La CSP du site bloque de toute façon les autres domaines.
 */

/** Risque pour la lecture par un ATS (voir cv-template-conventions). */
export type CssWarningKind = 'order' | 'shadow' | 'content';

export interface CssWarning {
  kind: CssWarningKind;
  selector: string;
  property: string;
}

export interface ScopedCss {
  css: string;
  /** Règles de style retenues. */
  rules: number;
  /** Règles écartées pour sécurité (imports, polices, adresses externes…). */
  removed: number;
  warnings: CssWarning[];
}

const EMPTY: ScopedCss = { css: '', rules: 0, removed: 0, warnings: [] };

/** Propriétés qui sortent le texte du flux : Chrome l'écrit alors plus loin dans le PDF. */
const ORDER_PROPERTIES = [
  'position',
  'opacity',
  'transform',
  'translate',
  'rotate',
  'scale',
  'filter',
  'clip-path',
  'z-index',
];
const NEUTRAL: Record<string, readonly string[]> = {
  position: ['static', ''],
  opacity: ['1', ''],
  'z-index': ['auto', ''],
};

function lint(rule: CSSStyleRule, warnings: CssWarning[]): void {
  const selector = rule.selectorText;
  const pseudo = /::?(before|after|marker)/i.test(selector);
  const style = rule.style;
  const value = (property: string) => style.getPropertyValue(property).trim().toLowerCase();
  const content = value('content');
  // Les décorations sans texte (::before, ::after, formes du studio) se placent librement.
  const decorative = (pseudo && !/["'][^"']+["']/.test(content)) || /cv-shape/.test(selector);
  if (!decorative) {
    for (const property of ORDER_PROPERTIES) {
      const current = value(property);
      if (current && !(NEUTRAL[property] ?? ['none', '']).includes(current)) {
        warnings.push({ kind: 'order', selector, property });
      }
    }
  }
  if (value('text-shadow') && value('text-shadow') !== 'none') {
    warnings.push({ kind: 'shadow', selector, property: 'text-shadow' });
  }
  if (/["'][^"']+["']/.test(content))
    warnings.push({ kind: 'content', selector, property: 'content' });
}

/** Adresses externes neutralisées : seules les images intégrées au CSS sont gardées. */
function stripUrls(css: string): { css: string; count: number } {
  let count = 0;
  const cleaned = css
    .replace(/url\(\s*(["']?)(.*?)\1\s*\)/gi, (match, _quote: string, url: string) => {
      if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml)[;,]/i.test(url.trim())) return match;
      count++;
      return 'none';
    })
    // image-set("…") accepte aussi des adresses sans url() : la déclaration devient invalide.
    .replace(/(-webkit-)?image-set\(/gi, () => {
      count++;
      return 'blocked(';
    });
  return { css: cleaned, count };
}

function scopeRules(rules: CSSRuleList, scope: string, result: ScopedCss): string {
  let css = '';
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      lint(rule, result.warnings);
      for (const nested of Array.from(rule.cssRules ?? [])) {
        if (nested instanceof CSSStyleRule) lint(nested, result.warnings);
      }
      result.rules++;
      css += `${scope}{${rule.cssText}}\n`;
    } else if (rule instanceof CSSMediaRule) {
      css += `@media ${rule.media.mediaText}{${scopeRules(rule.cssRules, scope, result)}}\n`;
    } else if (rule instanceof CSSSupportsRule) {
      css += `@supports ${rule.conditionText}{${scopeRules(rule.cssRules, scope, result)}}\n`;
    } else {
      result.removed++;
    }
  }
  return css;
}

/**
 * Confine `source` aux éléments situés sous `scope`. Le sélecteur `:is(#…, scope)` donne aux
 * règles la priorité d'un identifiant : elles l'emportent sur celles du modèle sans `!important`
 * dans la plupart des cas.
 */
export function scopeCss(source: string, scope: string): ScopedCss {
  if (!source.trim() || typeof CSSStyleSheet === 'undefined') return EMPTY;
  const imports = source.match(/@import\b/gi)?.length ?? 0;
  const sheet = new CSSStyleSheet();
  try {
    sheet.replaceSync(source.replace(/@import\b[^;]*;?/gi, ''));
  } catch {
    return EMPTY;
  }
  const result: ScopedCss = { css: '', rules: 0, removed: imports, warnings: [] };
  const scoped = scopeRules(sheet.cssRules, `:is(#cv-style-scope,${scope})`, result);
  const { css, count } = stripUrls(scoped);
  return { ...result, css, removed: result.removed + count };
}
