import { detectInitialLanguage } from './language.service';

describe('detectInitialLanguage', () => {
  it('garde la langue mémorisée si elle est prise en charge', () => {
    expect(detectInitialLanguage('en', ['fr-FR'])).toBe('en');
  });

  it('ignore une langue mémorisée inconnue', () => {
    expect(detectInitialLanguage('xx', ['en-US'])).toBe('en');
  });

  it('prend la première langue du navigateur prise en charge', () => {
    expect(detectInitialLanguage(null, ['ja-JP', 'de-DE', 'en-GB'])).toBe('de');
    expect(detectInitialLanguage(null, ['es-419'])).toBe('es');
  });

  it('se rabat sur le français par défaut', () => {
    expect(detectInitialLanguage(null, ['ja-JP', 'pt-BR'])).toBe('fr');
    expect(detectInitialLanguage(null, [])).toBe('fr');
  });
});
