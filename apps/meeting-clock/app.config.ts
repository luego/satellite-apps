import type { ExpoConfig } from 'expo/config';

const googleMobileAdsIosAppId =
  process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || 'ca-app-pub-3940256099942544~1458002511';
const googleMobileAdsAndroidTestAppId = 'ca-app-pub-3940256099942544~3347511713';

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
        // The plugin validates both platform IDs even though this app declares iOS only.
        androidAppId: googleMobileAdsAndroidTestAppId,
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
