import { StyleSheet, Switch, Text, View } from 'react-native';

import type { LanguagePreference } from '../../localization';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { ChoiceChip } from '../components/ChoiceChip';
import { ScreenShell } from '../components/ScreenShell';
import { useMeetingClock } from '../hooks/useMeetingClock';
import { colors, radii, shadows, spacing, typography } from '../theme/colors';

const languageOptions: LanguagePreference[] = ['automatic', 'en', 'es'];

export function SettingsScreen() {
  const {
    t,
    languagePreference,
    setLanguagePreference,
    timerConfig,
    setTimerConfig,
    isPlus,
    setMockPlus,
  } = useMeetingClock();

  return (
    <ScreenShell title={t('settingsTitle')}>
      <View style={styles.plusCard}>
        <Text style={styles.plusBadge}>PRO</Text>
        <Text style={styles.plusTitle}>{t('paywallTitle')}</Text>
        <Text style={styles.plusBody}>{t('paywallBody')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t('languageLabel')}</Text>
        <View style={styles.optionRow}>
          {languageOptions.map((option) => (
            <ChoiceChip
              key={option}
              label={option === 'automatic' ? t('automatic') : option === 'en' ? t('english') : t('spanish')}
              selected={languagePreference === option}
              onPress={() => setLanguagePreference(option)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t('modeLabel')}</Text>
        <View style={styles.optionRow}>
          <ChoiceChip
            label={t('countdown')}
            selected={timerConfig.mode === 'countdown'}
            onPress={() => setTimerConfig({ ...timerConfig, mode: 'countdown' })}
          />
          <ChoiceChip
            label={t('countup')}
            selected={timerConfig.mode === 'countup'}
            onPress={() => setTimerConfig({ ...timerConfig, mode: 'countup' })}
          />
        </View>
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchCopy}>
          <Text style={styles.label}>{t('mockPlusLabel')}</Text>
          <Text style={styles.help}>{t('mockPlusHelp')}</Text>
        </View>
        <Switch value={isPlus} onValueChange={setMockPlus} />
      </View>

      <AdBannerPlaceholder />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.xl,
    gap: spacing.md,
    padding: spacing.gutter,
  },
  label: {
    color: colors.ink,
    ...typography.labelLg,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  switchRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.xl,
    flexDirection: 'row',
    gap: spacing.gutter,
    justifyContent: 'space-between',
    padding: spacing.gutter,
  },
  switchCopy: {
    flex: 1,
    gap: 4,
  },
  help: {
    color: colors.muted,
    ...typography.labelSm,
  },
  plusCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadows.card,
  },
  plusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryInk,
    borderRadius: radii.full,
    color: colors.primarySoft,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    ...typography.labelSm,
  },
  plusTitle: {
    color: colors.primaryInk,
    ...typography.headlineMd,
  },
  plusBody: {
    color: colors.primaryInk,
    ...typography.bodyMd,
  },
});
