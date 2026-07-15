import Constants from 'expo-constants';

export type AdPlacement = 'setup' | 'history' | 'settings';

export const GOOGLE_MOBILE_ADS_TEST_IOS_APP_ID = 'ca-app-pub-3940256099942544~1458002511';

export const adsConfig = {
  enableTestAds: process.env.EXPO_PUBLIC_ENABLE_TEST_ADS !== 'false',
  iosAppId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ?? '',
  nativeUnitIds: {
    setup: process.env.EXPO_PUBLIC_ADMOB_IOS_SETUP_NATIVE_ID ?? '',
    history: process.env.EXPO_PUBLIC_ADMOB_IOS_HISTORY_NATIVE_ID ?? '',
    settings: process.env.EXPO_PUBLIC_ADMOB_IOS_SETTINGS_NATIVE_ID ?? '',
  },
  interstitialUnitId: process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID ?? '',
} as const;

export function hasAdMobRuntimeConfig() {
  return (
    adsConfig.enableTestAds ||
    Boolean(
      adsConfig.iosAppId &&
        adsConfig.nativeUnitIds.setup &&
        adsConfig.nativeUnitIds.history &&
        adsConfig.nativeUnitIds.settings &&
        adsConfig.interstitialUnitId,
    )
  );
}

export function canLoadNativeAdsSdk() {
  return Constants.appOwnership !== 'expo';
}
