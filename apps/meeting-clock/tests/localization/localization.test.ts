import { describe, expect, it } from 'vitest';

import { dictionaries, resolveLocale, translate } from '../../src/localization';

describe('localization', () => {
  it('resolves automatic Spanish, English, and fallback locales', () => {
    expect(resolveLocale('automatic', ['es-CO'])).toBe('es');
    expect(resolveLocale('automatic', ['en-US'])).toBe('en');
    expect(resolveLocale('automatic', ['fr-FR'])).toBe('en');
  });

  it('lets explicit preferences override the phone language', () => {
    expect(resolveLocale('en', ['es-MX'])).toBe('en');
    expect(resolveLocale('es', ['en-US'])).toBe('es');
  });

  it('keeps English and Spanish translation keys matched', () => {
    expect(Object.keys(dictionaries.es).sort()).toEqual(Object.keys(dictionaries.en).sort());
  });

  it('interpolates values in the selected locale', () => {
    expect(translate('en', 'minutesShort', { count: 15 })).toBe('15 min');
    expect(translate('es', 'minutesShort', { count: 15 })).toBe('15 min');
  });
});
