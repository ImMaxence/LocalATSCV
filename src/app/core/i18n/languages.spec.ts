import {
  UI_LANGUAGES,
  indexedLanguages,
  languageFromPath,
  localizedPath,
  matchLanguage,
  publicPage,
} from './languages';

describe('matchLanguage', () => {
  it('reconnaît les codes exacts, sans tenir compte de la casse', () => {
    expect(matchLanguage('pt-BR')).toBe('pt-BR');
    expect(matchLanguage('zh-cn')).toBe('zh-CN');
    expect(matchLanguage('fil')).toBe('fil');
  });

  it('rapproche les variantes régionales', () => {
    expect(matchLanguage('fr-CA')).toBe('fr');
    expect(matchLanguage('es-MX')).toBe('es');
    expect(matchLanguage('pt')).toBe('pt-BR');
    expect(matchLanguage('pt-AO')).toBe('pt-PT');
    expect(matchLanguage('zh')).toBe('zh-CN');
    expect(matchLanguage('zh-HK')).toBe('zh-TW');
    expect(matchLanguage('zh-Hant-TW')).toBe('zh-TW');
    expect(matchLanguage('zh-Hans-SG')).toBe('zh-CN');
  });

  it('accepte les anciens codes encore envoyés par les navigateurs', () => {
    expect(matchLanguage('no')).toBe('nb');
    expect(matchLanguage('nn-NO')).toBe('nb');
    expect(matchLanguage('tl')).toBe('fil');
    expect(matchLanguage('iw')).toBe('he');
    expect(matchLanguage('in-ID')).toBe('id');
  });

  it('ignore les langues non prises en charge', () => {
    expect(matchLanguage('xx')).toBeNull();
    expect(matchLanguage('ca-ES')).toBeNull();
  });
});

describe('adresses des pages publiques', () => {
  it('sert le français à la racine et les autres langues sous un préfixe', () => {
    expect(localizedPath('/', 'fr')).toBe('/');
    expect(localizedPath('/analyze', 'fr')).toBe('/analyze');
    expect(localizedPath('/', 'ja')).toBe('/ja');
    expect(localizedPath('/legal/terms', 'zh-TW')).toBe('/zh-tw/legal/terms');
  });

  it('retrouve la langue et la page depuis une URL', () => {
    expect(languageFromPath('/pt-br/analyze')).toBe('pt-BR');
    expect(languageFromPath('/ja')).toBe('ja');
    expect(languageFromPath('/analyze')).toBeNull();
    expect(languageFromPath('/fr')).toBeNull();
    expect(publicPage('/ja/analyze#robot')).toBe('/analyze');
    expect(publicPage('/ja')).toBe('/');
    expect(publicPage('/?x=1')).toBe('/');
    expect(publicPage('/editor/abc')).toBeNull();
  });

  it('a un préfixe distinct par langue', () => {
    const paths = UI_LANGUAGES.map((lang) => localizedPath('/', lang));
    expect(new Set(paths).size).toBe(UI_LANGUAGES.length);
    for (const lang of UI_LANGUAGES) {
      expect(publicPage(localizedPath('/analyze', lang))).toBe('/analyze');
    }
  });

  it("n'indexe que les pages qui ont un contenu propre dans la langue", () => {
    expect(indexedLanguages('/')).toEqual(UI_LANGUAGES);
    expect(indexedLanguages('/changelog')).toEqual(['en']);
    expect(indexedLanguages('/legal/privacy')).toEqual(['fr', 'en']);
  });
});
