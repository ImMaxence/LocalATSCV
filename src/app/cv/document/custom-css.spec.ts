import { scopeCss } from './custom-css';

const SCOPE = '[data-cv-scope="s1"]';
const PREFIX = ':is(#cv-style-scope,[data-cv-scope="s1"])';

describe('CSS personnalisé', () => {
  it('confine chaque règle au CV', () => {
    const { css, rules } = scopeCss('.cv-name { color: red } h2, h3 { margin: 0 }', SCOPE);
    expect(rules).toBe(2);
    expect(css).toContain(`${PREFIX}{.cv-name { color: red; }}`);
    expect(css).toContain(`${PREFIX}{h2, h3 { margin: 0px; }}`);
  });

  it('garde les règles @media et @supports, confinées elles aussi', () => {
    const { css } = scopeCss('@media print { .cv { color: black } }', SCOPE);
    expect(css).toMatch(
      /^@media print\{:is\(#cv-style-scope,\[data-cv-scope="s1"\]\)\{\.cv \{ color: black; \}\}/,
    );
  });

  it('retire les imports, polices, animations et réglages de page', () => {
    const source = `@import url("https://exemple.org/a.css");
      @font-face { font-family: x; src: url(https://exemple.org/x.woff2) }
      @keyframes spin { to { rotate: 1turn } }
      @page { margin: 0 }
      .cv { color: red }`;
    const { css, rules, removed } = scopeCss(source, SCOPE);
    expect(rules).toBe(1);
    expect(removed).toBe(4);
    expect(css).not.toMatch(/@import|@font-face|@keyframes|@page|exemple\.org/);
  });

  it('neutralise les adresses externes mais garde les images intégrées', () => {
    const image = 'data:image/png;base64,iVBORw0KGgo=';
    const { css, removed } = scopeCss(
      `.a { background: url("https://pisteur.example/p.png") } .b { background-image: url("${image}") }`,
      SCOPE,
    );
    expect(css).not.toContain('pisteur.example');
    expect(css).toContain(image);
    expect(removed).toBe(1);
  });

  it('ne laisse pas une accolade fermante sortir du CV', () => {
    const { css } = scopeCss(
      '.a { color: red } } body { display: none } .b { color: blue }',
      SCOPE,
    );
    expect(css).not.toMatch(/(^|\n)body/);
    for (const line of css.trim().split('\n')) expect(line.startsWith(PREFIX)).toBe(true);
  });

  it('signale ce qui gêne la lecture par un ATS', () => {
    const { warnings } = scopeCss(
      `.a { position: absolute } .b { opacity: 0.5 } .c { text-shadow: 0 0 1px red }
       .d::before { content: "★ " } .e::after { content: ""; position: absolute }
       .cv-shape { transform: scale(2) } .f { position: static }`,
      SCOPE,
    );
    expect(warnings.map((w) => `${w.kind}:${w.selector}:${w.property}`)).toEqual([
      'order:.a:position',
      'order:.b:opacity',
      'shadow:.c:text-shadow',
      'content:.d::before:content',
    ]);
  });

  it('ne produit rien pour un CSS vide', () => {
    expect(scopeCss('  ', SCOPE)).toEqual({ css: '', rules: 0, removed: 0, warnings: [] });
  });
});
