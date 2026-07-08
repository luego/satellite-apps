import { getLocales } from 'expo-localization';

import type { LocaleSource } from '../../application/ports/LocaleSource';

export class ExpoLocaleSource implements LocaleSource {
  getDeviceLanguageCodes(): readonly string[] {
    return getLocales()
      .map((locale) => locale.languageTag ?? locale.languageCode)
      .filter((value): value is string => Boolean(value));
  }
}
