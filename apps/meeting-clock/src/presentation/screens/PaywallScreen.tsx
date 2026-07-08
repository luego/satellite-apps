import { StyleSheet, Text, View } from 'react-native';

import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { ScreenShell } from '../components/ScreenShell';
import { useMeetingClock } from '../hooks/useMeetingClock';
import { colors, radii, shadows, spacing, typography } from '../theme/colors';

export function PaywallScreen() {
  const { t } = useMeetingClock();

  return (
    <ScreenShell title={t('paywallTitle')}>
      <View style={styles.card}>
        <Text style={styles.body}>{t('paywallBody')}</Text>
        <Text style={styles.note}>{t('paywallMockNote')}</Text>
      </View>
      <AdBannerPlaceholder />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  body: {
    color: colors.primaryInk,
    ...typography.bodyLg,
  },
  note: {
    color: colors.primaryInk,
    ...typography.labelLg,
  },
});
