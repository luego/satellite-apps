import type { AdsGateway, InterstitialNaturalBreak } from '../../application/ports/AdsGateway';
import { shouldShowCompletionInterstitial } from '../../domain/services/adFrequencyPolicy';
import type { SettingsRepository } from '../../application/ports/SettingsRepository';
import { adsConfig, canLoadNativeAdsSdk, hasAdMobRuntimeConfig } from '../../shared/config/ads';
import { STORAGE_KEYS } from '../../shared/constants/storageKeys';

const interstitialLoadTimeoutMs = 8000;
type GoogleMobileAdsModule = typeof import('react-native-google-mobile-ads');

export class GoogleMobileAdsGateway implements AdsGateway {
  private initialized = false;

  constructor(private readonly settingsRepository: SettingsRepository) {}

  async initialize(): Promise<void> {
    const googleMobileAds = await getGoogleMobileAdsModule();

    if (this.initialized || !hasAdMobRuntimeConfig() || !googleMobileAds) {
      return;
    }

    const { default: mobileAds, MaxAdContentRating } = googleMobileAds;
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
      testDeviceIdentifiers: adsConfig.enableTestAds ? ['EMULATOR'] : [],
    });
    await mobileAds().initialize();
    this.initialized = true;
  }

  async canShowBanner(isPlus: boolean): Promise<boolean> {
    return !isPlus && hasAdMobRuntimeConfig();
  }

  async showInterstitialAtNaturalBreak({
    completedSessionCount,
    isPlus,
    now,
  }: InterstitialNaturalBreak): Promise<boolean> {
    const googleMobileAds = await getGoogleMobileAdsModule();

    if (!hasAdMobRuntimeConfig() || !googleMobileAds) {
      return false;
    }

    const lastShownIso = await this.settingsRepository.get<string>(
      STORAGE_KEYS.lastInterstitialShownAt,
    );
    const shouldShow = shouldShowCompletionInterstitial({
      completedSessionCount,
      isPlus,
      lastInterstitialShownAt: lastShownIso ? new Date(lastShownIso) : null,
      now,
    });

    if (!shouldShow) {
      return false;
    }

    await this.initialize();
    const { AdEventType, InterstitialAd, TestIds } = googleMobileAds;
    const unitId = adsConfig.enableTestAds ? TestIds.INTERSTITIAL : adsConfig.interstitialUnitId;

    return new Promise((resolve) => {
      const interstitial = InterstitialAd.createForAdRequest(unitId, {
        requestNonPersonalizedAdsOnly: true,
      });
      const cleanupCallbacks: (() => void)[] = [];
      let settled = false;

      const finish = async (shown: boolean) => {
        if (settled) {
          return;
        }

        settled = true;
        cleanupCallbacks.forEach((cleanup) => cleanup());
        clearTimeout(timeout);

        if (shown) {
          await this.settingsRepository.set(STORAGE_KEYS.lastInterstitialShownAt, now.toISOString());
        }

        resolve(shown);
      };

      cleanupCallbacks.push(
        interstitial.addAdEventListener(AdEventType.LOADED, () => {
          interstitial.show().catch(() => {
            finish(false).catch(() => {});
          });
        }),
        interstitial.addAdEventListener(AdEventType.CLOSED, () => {
          finish(true).catch(() => {});
        }),
        interstitial.addAdEventListener(AdEventType.ERROR, () => {
          finish(false).catch(() => {});
        }),
      );

      const timeout = setTimeout(() => {
        finish(false).catch(() => {});
      }, interstitialLoadTimeoutMs);

      interstitial.load();
    });
  }
}

async function getGoogleMobileAdsModule(): Promise<GoogleMobileAdsModule | null> {
  if (!canLoadNativeAdsSdk()) {
    return null;
  }

  try {
    return await import('react-native-google-mobile-ads');
  } catch {
    return null;
  }
}
