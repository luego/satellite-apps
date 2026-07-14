import Constants from 'expo-constants';

export type AdBannerPlacement = 'setup' | 'history' | 'settings';

export const GOOGLE_MOBILE_ADS_TEST_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';

export const adsConfig = {
  enableTestAds: process.env.EXPO_PUBLIC_ENABLE_TEST_ADS !== 'false',
  androidAppId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ?? '',
  bannerUnitIds: {
    setup: process.env.EXPO_PUBLIC_ADMOB_SETUP_BANNER_ID ?? '',
    history: process.env.EXPO_PUBLIC_ADMOB_HISTORY_BANNER_ID ?? '',
    settings: process.env.EXPO_PUBLIC_ADMOB_SETTINGS_BANNER_ID ?? '',
  },
  interstitialUnitId: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? '',
} as const;

export function hasAdMobRuntimeConfig() {
  return (
    adsConfig.enableTestAds ||
    Boolean(
      adsConfig.androidAppId &&
        adsConfig.bannerUnitIds.setup &&
        adsConfig.bannerUnitIds.history &&
        adsConfig.bannerUnitIds.settings &&
        adsConfig.interstitialUnitId,
    )
  );
}

export function canLoadNativeAdsSdk() {
  return Constants.appOwnership !== 'expo';
}
