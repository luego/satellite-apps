import { StyleSheet, Switch, Text, View } from 'react-native';

import type { LanguagePreference, TranslationKey } from '../../localization';
import type { PurchaseStatus } from '../../bootstrap/MeetingClockProvider';
import { AdNativeSlot } from '../components/AdNativeSlot';
import { AppButton } from '../components/AppButton';
import { ChoiceChip } from '../components/ChoiceChip';
import { ScreenShell } from '../components/ScreenShell';
import { useMeetingClock } from '../hooks/useMeetingClock';
import { colors, radii, shadows, spacing, typography } from '../theme/colors';

const languageOptions: LanguagePreference[] = ['automatic', 'en', 'es'];

const plusPlanLabelKeys = {
  monthly: 'plusMonthly',
  yearly: 'plusYearly',
  lifetime: 'plusLifetime',
} as const satisfies Record<string, TranslationKey>;

const purchaseStatusLabelKeys = {
  idle: null,
  loading: 'purchaseLoading',
  purchased: 'purchasePurchased',
  restored: 'purchaseRestored',
  cancelled: 'purchaseCancelled',
  unavailable: 'purchaseUnavailable',
  error: 'purchaseError',
} as const satisfies Record<PurchaseStatus, TranslationKey | null>;

export function SettingsScreen() {
  const {
    t,
    languagePreference,
    setLanguagePreference,
    timerConfig,
    setTimerConfig,
    isPlus,
    plusPurchaseOptions,
    purchaseStatus,
    purchasesMode,
    purchasePlus,
    restorePurchases,
    setMockPlus,
  } = useMeetingClock();

  const purchaseStatusKey = purchaseStatusLabelKeys[purchaseStatus];

  return (
    <ScreenShell title={t('settingsTitle')}>
      <View style={styles.plusCard}>
        <Text style={styles.plusBadge}>PRO</Text>
        <Text style={styles.plusTitle}>{t('paywallTitle')}</Text>
        <Text style={styles.plusBody}>{t('paywallBody')}</Text>
        <Text style={styles.plusMode}>
          {purchasesMode === 'mock' ? t('purchasesMockMode') : t('purchasesRevenueCatMode')}
        </Text>
        <View style={styles.purchaseStack}>
          {plusPurchaseOptions.map((option) => {
            const planLabel = t(plusPlanLabelKeys[option.id]);
            const priceLabel = option.priceLabel || (purchasesMode === 'mock' ? t('plusMockPrice') : t('plusUnavailablePrice'));

            return (
              <View key={option.id} style={styles.purchaseOption}>
                <View style={styles.purchaseCopy}>
                  <Text style={styles.purchaseTitle}>{planLabel}</Text>
                  <Text style={styles.purchasePrice}>{priceLabel}</Text>
                </View>
                <AppButton
                  label={t('purchaseButton', { plan: planLabel })}
                  onPress={() => purchasePlus(option.id)}
                  disabled={purchaseStatus === 'loading' || isPlus || !option.available}
                />
              </View>
            );
          })}
          <AppButton
            label={t('restorePurchases')}
            variant="secondary"
            onPress={restorePurchases}
            disabled={purchaseStatus === 'loading'}
          />
          {purchaseStatusKey ? <Text style={styles.purchaseStatus}>{t(purchaseStatusKey)}</Text> : null}
        </View>
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

      {purchasesMode === 'mock' ? (
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.label}>{t('mockPlusLabel')}</Text>
            <Text style={styles.help}>{t('mockPlusHelp')}</Text>
          </View>
          <Switch value={isPlus} onValueChange={setMockPlus} />
        </View>
      ) : null}

      <AdNativeSlot placement="settings" />
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
  plusMode: {
    color: colors.primaryInk,
    ...typography.labelLg,
  },
  purchaseStack: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  purchaseOption: {
    backgroundColor: 'rgba(7, 4, 148, 0.12)',
    borderColor: 'rgba(7, 4, 148, 0.18)',
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  purchaseCopy: {
    gap: 2,
  },
  purchaseTitle: {
    color: colors.primaryInk,
    ...typography.labelLg,
  },
  purchasePrice: {
    color: colors.primaryInk,
    ...typography.bodyMd,
  },
  purchaseStatus: {
    color: colors.primaryInk,
    ...typography.labelLg,
  },
});
