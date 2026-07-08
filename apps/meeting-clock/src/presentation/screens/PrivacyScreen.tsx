import { StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '../components/ScreenShell';
import { useMeetingClock } from '../hooks/useMeetingClock';
import { colors, radii, spacing, typography } from '../theme/colors';

export function PrivacyScreen() {
  const { t } = useMeetingClock();

  return (
    <ScreenShell title={t('privacyTitle')}>
      <View style={styles.card}>
        <Text style={styles.body}>{t('privacyBody')}</Text>
        <Text style={styles.body}>{t('privacyAds')}</Text>
        <Text style={styles.body}>{t('privacyPurchases')}</Text>
        <Text style={styles.contact}>{t('contact')}</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.xl,
    gap: spacing.md,
    padding: spacing.lg,
  },
  body: {
    color: colors.ink,
    ...typography.bodyMd,
  },
  contact: {
    color: colors.primarySoft,
    ...typography.labelLg,
  },
});
