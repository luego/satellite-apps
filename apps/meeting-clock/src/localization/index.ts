import { en } from './en';
import { es } from './es';

export type SupportedLocale = 'en' | 'es';
export type LanguagePreference = 'automatic' | SupportedLocale;
export type TranslationKey = keyof typeof en;

export const dictionaries = {
  en,
  es,
} as const;

export function resolveLocale(
  preference: LanguagePreference,
  deviceLanguageCodes: readonly string[],
): SupportedLocale {
  if (preference === 'en' || preference === 'es') {
    return preference;
  }

  const language = deviceLanguageCodes
    .map((code) => code.toLowerCase())
    .find((code) => code.startsWith('es') || code.startsWith('en'));

  return language?.startsWith('es') ? 'es' : 'en';
}

export function translate(
  locale: SupportedLocale,
  key: TranslationKey,
  values: Record<string, string | number> = {},
): string {
  const template: string = dictionaries[locale][key];

  return Object.entries(values).reduce<string>(
    (text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value)),
    template,
  );
}
