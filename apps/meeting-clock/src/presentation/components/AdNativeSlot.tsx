import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { AdPlacement } from '../../shared/config/ads';
import { adsConfig, canLoadNativeAdsSdk } from '../../shared/config/ads';
import { useMeetingClock } from '../hooks/useMeetingClock';
import { colors, radii, spacing, typography } from '../theme/colors';

type GoogleMobileAdsModule = typeof import('react-native-google-mobile-ads');
type NativeAdInstance = Awaited<ReturnType<GoogleMobileAdsModule['NativeAd']['createForAdRequest']>>;

interface AdNativeSlotProps {
  placement: AdPlacement;
}

export function AdNativeSlot({ placement }: AdNativeSlotProps) {
  const { canShowAds, t } = useMeetingClock();
  const [googleMobileAds, setGoogleMobileAds] = useState<GoogleMobileAdsModule | null>(null);
  const [nativeAdState, setNativeAdState] = useState<{
    ad: NativeAdInstance;
    placement: AdPlacement;
  } | null>(null);
  const [failedPlacement, setFailedPlacement] = useState<AdPlacement | null>(null);

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

  useEffect(() => {
    if (!canShowAds || !googleMobileAds || !canLoadNativeAdsSdk()) {
      return undefined;
    }

    const { NativeAd, NativeAdChoicesPlacement, NativeMediaAspectRatio, TestIds } = googleMobileAds;
    const unitId = adsConfig.enableTestAds ? TestIds.NATIVE : adsConfig.nativeUnitIds[placement];
    let activeNativeAd: NativeAdInstance | null = null;
    let mounted = true;

    if (!unitId) {
      return undefined;
    }

    NativeAd.createForAdRequest(unitId, {
      adChoicesPlacement: NativeAdChoicesPlacement.TOP_RIGHT,
      aspectRatio: NativeMediaAspectRatio.LANDSCAPE,
      requestNonPersonalizedAdsOnly: true,
      startVideoMuted: true,
    })
      .then((loadedAd) => {
        activeNativeAd = loadedAd;
        if (mounted) {
          setNativeAdState({ ad: loadedAd, placement });
        } else {
          loadedAd.destroy();
        }
      })
      .catch(() => {
        if (mounted) {
          setFailedPlacement(placement);
        }
      });

    return () => {
      mounted = false;
      activeNativeAd?.destroy();
    };
  }, [canShowAds, googleMobileAds, placement]);

  if (!canShowAds) {
    return null;
  }

  const nativeAd = nativeAdState?.placement === placement ? nativeAdState.ad : null;
  const adFailed = failedPlacement === placement && !nativeAd;

  if (!canLoadNativeAdsSdk() || !googleMobileAds || adFailed) {
    return (
      <View style={[styles.container, styles.placeholder]}>
        <Text style={styles.label}>{t('adsMockLabel')}</Text>
        <Text style={styles.body}>{t('adsMockBody')}</Text>
      </View>
    );
  }

  if (!nativeAd) {
    return null;
  }

  const { NativeAdView, NativeAsset, NativeAssetType, NativeMediaView } = googleMobileAds;

  return (
    <View style={styles.container}>
      <NativeAdView nativeAd={nativeAd} style={styles.nativeCard}>
        <View style={styles.nativeHeader}>
          {nativeAd.icon ? (
            <NativeAsset assetType={NativeAssetType.ICON}>
              <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
            </NativeAsset>
          ) : null}
          <View style={styles.nativeCopy}>
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text numberOfLines={2} style={styles.headline}>
                {nativeAd.headline}
              </Text>
            </NativeAsset>
          </View>
          <Text style={styles.adBadge}>Ad</Text>
        </View>
        {nativeAd.mediaContent ? <NativeMediaView resizeMode="cover" style={styles.media} /> : null}
        {nativeAd.body ? (
          <Text numberOfLines={2} style={styles.nativeBody}>
            {nativeAd.body}
          </Text>
        ) : null}
        {nativeAd.callToAction ? (
          <View style={styles.callToActionRow}>
            <Text style={styles.callToAction}>{nativeAd.callToAction}</Text>
          </View>
        ) : null}
      </NativeAdView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
  },
  nativeCard: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    backgroundColor: colors.surfaceLow,
    borderColor: colors.divider,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginHorizontal: spacing.gutter,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  nativeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  nativeCopy: {
    flex: 1,
    gap: 2,
  },
  icon: {
    borderRadius: radii.base,
    height: 36,
    width: 36,
  },
  headline: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  adBadge: {
    backgroundColor: 'rgba(249, 188, 69, 0.16)',
    borderColor: 'rgba(249, 188, 69, 0.32)',
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 14,
    overflow: 'hidden',
    paddingHorizontal: 5,
    textTransform: 'uppercase',
  },
  media: {
    alignSelf: 'stretch',
    borderRadius: radii.md,
    height: 140,
    minHeight: 120,
    overflow: 'hidden',
  },
  nativeBody: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  callToActionRow: {
    alignItems: 'flex-start',
    minHeight: 36,
    paddingTop: spacing.xs,
  },
  callToAction: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.base,
    color: colors.background,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
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
