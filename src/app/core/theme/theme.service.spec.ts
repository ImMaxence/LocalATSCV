import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('suit le système par défaut', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.preference()).toBe('system');
  });

  it('applique et mémorise le thème sombre', () => {
    const service = TestBed.inject(ThemeService);
    service.setPreference('dark');
    TestBed.tick();

    expect(service.isDark()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('localatscv.theme')).toBe('dark');
  });

  it('relit la préférence mémorisée', () => {
    localStorage.setItem('localatscv.theme', 'light');
    const service = TestBed.inject(ThemeService);
    TestBed.tick();

    expect(service.preference()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('ignore une valeur mémorisée invalide', () => {
    localStorage.setItem('localatscv.theme', 'violet');
    expect(TestBed.inject(ThemeService).preference()).toBe('system');
  });
});
