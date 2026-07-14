import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { AdBannerPlacement } from '../../shared/config/ads';
import { adsConfig, canLoadNativeAdsSdk } from '../../shared/config/ads';
import { useMeetingClock } from '../hooks/useMeetingClock';
import { colors, radii, spacing, typography } from '../theme/colors';

type GoogleMobileAdsModule = typeof import('react-native-google-mobile-ads');

interface AdBannerSlotProps {
  placement: AdBannerPlacement;
}

export function AdBannerSlot({ placement }: AdBannerSlotProps) {
  const { canShowAds, t } = useMeetingClock();
  const [googleMobileAds, setGoogleMobileAds] = useState<GoogleMobileAdsModule | null>(null);
  const [adFailed, setAdFailed] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!canLoadNativeAdsSdk()) {
      return () => {
        mounted = false;
      };
    }

    import('react-native-google-mobile-ads')
      .then((module) => {
        if (mounted) {
          setGoogleMobileAds(module);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  if (!canShowAds) {
    return null;
  }

  if (!canLoadNativeAdsSdk() || !googleMobileAds || adFailed) {
    return (
      <View style={[styles.container, styles.placeholder]}>
        <Text style={styles.label}>{t('adsMockLabel')}</Text>
        <Text style={styles.body}>{t('adsMockBody')}</Text>
      </View>
    );
  }

  const { BannerAd, BannerAdSize, TestIds } = googleMobileAds;
  const unitId = adsConfig.enableTestAds
    ? TestIds.ADAPTIVE_BANNER
    : adsConfig.bannerUnitIds[placement];

  if (!unitId) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={() => setAdFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
  },
  placeholder: {
    backgroundColor: colors.surfaceLow,
    borderColor: colors.divider,
    borderRadius: radii.xl,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.gutter,
  },
  label: {
    color: colors.ink,
    ...typography.labelLg,
  },
  body: {
    color: colors.muted,
    ...typography.labelSm,
    textAlign: 'center',
  },
});
