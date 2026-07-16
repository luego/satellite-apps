import { StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '../components/ScreenShell';
import { useMeetingClock } from '../hooks/useMeetingClock';
import { colors, radii, shadows, spacing, typography } from '../theme/colors';

export function PaywallScreen() {
  const { t } = useMeetingClock();
  const features = [
    t('plusFeatureNoAds'),
    t('plusFeaturePresets'),
    t('plusFeatureThemes'),
    t('plusFeatureHistory'),
  ];

  return (
    <ScreenShell title={t('paywallTitle')}>
      <View style={styles.card}>
        <Text style={styles.badge}>{t('plusBadge')}</Text>
        <Text style={styles.body}>{t('paywallBody')}</Text>
        <View style={styles.featureList}>
          {features.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Text style={styles.featureDot}>•</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.note}>{t('paywallMockNote')}</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceLow,
    borderColor: colors.divider,
    borderWidth: 1,
    borderRadius: radii.xl,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    color: colors.primaryInk,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    ...typography.labelSm,
  },
  body: {
    color: colors.ink,
    ...typography.bodyLg,
  },
  featureList: {
    gap: spacing.sm,
  },
  featureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  featureDot: {
    color: colors.primarySoft,
    ...typography.labelLg,
  },
  featureText: {
    color: colors.ink,
    ...typography.labelLg,
  },
  note: {
    color: colors.muted,
    ...typography.labelSm,
  },
});
