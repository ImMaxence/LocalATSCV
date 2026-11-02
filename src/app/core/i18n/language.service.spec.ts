import { browserLanguage, initialLanguage, localizedUrl } from './language.service';

describe('browserLanguage', () => {
  it('prend la première langue du navigateur prise en charge', () => {
    expect(browserLanguage(['xx-XX', 'de-DE', 'en-GB'])).toBe('de');
    expect(browserLanguage(['es-419'])).toBe('es');
    expect(browserLanguage(['ja-JP'])).toBe('ja');
  });

  it('ne trouve rien sans langue prise en charge', () => {
    expect(browserLanguage(['xx-XX'])).toBeNull();
    expect(browserLanguage([])).toBeNull();
  });
});

describe('initialLanguage', () => {
  it("affiche une page publique dans la langue de son URL", () => {
    expect(initialLanguage('/ja/analyze', null, ['de-DE'])).toBe('ja');
    expect(initialLanguage('/', null, ['de-DE'])).toBe('fr');
    expect(initialLanguage('/legal/terms', null, ['en-US'])).toBe('fr');
  });

  it('suit la langue choisie dans le menu, vers laquelle la page sera redirigée', () => {
    expect(initialLanguage('/', 'en', ['fr-FR'])).toBe('en');
    expect(initialLanguage('/ja', 'de', [])).toBe('de');
  });

  it("affiche l'éditeur dans la langue choisie, sinon celle du navigateur", () => {
    expect(initialLanguage('/editor', 'it', ['de-DE'])).toBe('it');
    expect(initialLanguage('/editor/abc', null, ['pt-BR', 'en'])).toBe('pt-BR');
    expect(initialLanguage('/editor', null, ['xx'])).toBe('fr');
  });
});

describe('localizedUrl', () => {
  it("garde la page, les paramètres et l'ancre", () => {
    expect(localizedUrl('/ja/analyze', 'de')).toBe('/de/analyze');
    expect(localizedUrl('/#how', 'pt-BR')).toBe('/pt-br#how');
    expect(localizedUrl('/zh-tw/legal/privacy?x=1', 'fr')).toBe('/legal/privacy?x=1');
  });

  it("ne s'applique pas aux pages de l'éditeur", () => {
    expect(localizedUrl('/editor/abc', 'en')).toBeNull();
  });
});
