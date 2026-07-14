import type { ExpoConfig } from 'expo/config';

const enableTestAds = process.env.EXPO_PUBLIC_ENABLE_TEST_ADS !== 'false';
const googleMobileAdsIosAppId = enableTestAds
  ? 'ca-app-pub-3940256099942544~1458002511'
  : process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID;

const config: ExpoConfig = {
  name: 'MeetingClock',
  slug: 'meeting-clock',
  version: '1.0.0',
  platforms: ['ios'],
  orientation: 'default',
  icon: './assets/images/icon.png',
  scheme: 'meetingclock',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.luegodev.meetingclock',
    icon: './assets/expo.icon',
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-asset',
    'expo-localization',
    'expo-sqlite',
    [
      'expo-audio',
      {
        microphonePermission: false,
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        iosAppId: googleMobileAdsIosAppId,
        optimizeInitialization: true,
        optimizeAdLoading: true,
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#101820',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
