import { StyleSheet, Text, View } from 'react-native';

import { useMeetingClock } from '../../presentation/hooks/useMeetingClock';
import { colors, radii, spacing, typography } from '../theme/colors';

export function AdBannerPlaceholder() {
  const { t, canShowAds } = useMeetingClock();

  if (!canShowAds) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('adsMockLabel')}</Text>
      <Text style={styles.body}>{t('adsMockBody')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: colors.divider,
    borderRadius: radii.xl,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.gutter,
    backgroundColor: colors.surfaceLow,
  },
  label: {
    color: colors.ink,
    ...typography.labelLg,
  },
  body: {
    color: colors.muted,
    ...typography.labelSm,
  },
});
