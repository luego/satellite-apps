import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

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

const plusPlanSubtitleKeys = {
  monthly: 'plusMonthlySubtitle',
  yearly: 'plusYearlySubtitle',
  lifetime: 'plusLifetimeSubtitle',
} as const satisfies Record<string, TranslationKey>;

const plusFeatureKeys = [
  'plusFeatureNoAds',
  'plusFeaturePresets',
  'plusFeatureThemes',
  'plusFeatureHistory',
] as const satisfies TranslationKey[];

const purchaseStatusLabelKeys = {
  idle: null,
  loading: 'purchaseLoading',
  purchased: 'purchasePurchased',
  restored: 'purchaseRestored',
  cancelled: 'purchaseCancelled',
  unavailable: 'purchaseUnavailable',
  managementOpened: 'purchaseManagementOpened',
  managementUnavailable: 'purchaseManagementUnavailable',
  statusRefreshed: 'purchaseStatusRefreshed',
  error: 'purchaseError',
} as const satisfies Record<PurchaseStatus, TranslationKey | null>;

export function SettingsScreen() {
  const {
    t,
    locale,
    languagePreference,
    setLanguagePreference,
    timerConfig,
    setTimerConfig,
    isPlus,
    plusStatus,
    plusPurchaseOptions,
    purchaseStatus,
    purchasesMode,
    purchasePlus,
    restorePurchases,
    manageSubscription,
    refreshPurchaseStatus,
    setMockPlus,
  } = useMeetingClock();

  const purchaseStatusKey = purchaseStatusLabelKeys[purchaseStatus];
  const formattedExpirationDate = plusStatus.expiresAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(plusStatus.expiresAt))
    : null;
  const subscriptionStatusText = isPlus
    ? formattedExpirationDate && plusStatus.willRenew === false
      ? t('subscriptionCancelsAt', { date: formattedExpirationDate })
      : formattedExpirationDate
        ? t('subscriptionRenews')
        : t('subscriptionActiveLifetime')
    : null;

  useFocusEffect(
    useCallback(() => {
      refreshPurchaseStatus({ showFeedback: false });
    }, [refreshPurchaseStatus]),
  );

  return (
    <ScreenShell title={t('settingsTitle')}>
      <View style={styles.plusCard}>
        <View style={styles.plusHeader}>
          <View style={styles.plusTitleGroup}>
            <Text style={styles.plusBadge}>{t('plusBadge')}</Text>
            <Text style={styles.plusTitle}>{t('paywallTitle')}</Text>
          </View>
          {isPlus ? <Text style={styles.activePill}>{t('plusActive')}</Text> : null}
        </View>
        <Text style={styles.plusBody}>{t('paywallBody')}</Text>
        <View style={styles.featureGrid}>
          {plusFeatureKeys.map((key) => (
            <View key={key} style={styles.featureChip}>
              <Text style={styles.featureDot}>•</Text>
              <Text style={styles.featureText}>{t(key)}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.plusMode}>
          {purchasesMode === 'mock' ? t('purchasesMockMode') : t('purchasesRevenueCatMode')}
        </Text>
        {subscriptionStatusText ? <Text style={styles.subscriptionStatus}>{subscriptionStatusText}</Text> : null}
        <View style={styles.purchaseStack}>
          {plusPurchaseOptions.map((option) => {
            const planLabel = t(plusPlanLabelKeys[option.id]);
            const planSubtitle = t(plusPlanSubtitleKeys[option.id]);
            const priceLabel = option.priceLabel || (purchasesMode === 'mock' ? t('plusMockPrice') : t('plusUnavailablePrice'));
            const disabled = purchaseStatus === 'loading' || isPlus || !option.available;
            const featured = option.id === 'yearly';

            return (
              <Pressable
                accessibilityRole="button"
                disabled={disabled}
                key={option.id}
                onPress={() => purchasePlus(option.id)}
                style={({ pressed }) => [
                  styles.purchaseOption,
                  featured && styles.purchaseOptionFeatured,
                  disabled && styles.purchaseOptionDisabled,
                  pressed && !disabled && styles.purchaseOptionPressed,
                ]}
              >
                <View style={styles.purchaseCopy}>
                  <View style={styles.purchaseTitleRow}>
                    <Text style={styles.purchaseTitle}>{planLabel}</Text>
                    {featured ? <Text style={styles.bestValuePill}>{t('plusBestValue')}</Text> : null}
                  </View>
                  <Text style={styles.purchaseSubtitle}>{planSubtitle}</Text>
                </View>
                <View style={styles.purchaseAction}>
                  <Text style={styles.purchasePrice} numberOfLines={1}>
                    {priceLabel}
                  </Text>
                  <Text style={styles.purchaseButtonLabel}>{t('purchaseShortButton')}</Text>
                </View>
              </Pressable>
            );
          })}
          <View style={styles.purchaseFooter}>
            {isPlus ? (
              <View style={styles.managementActions}>
                <AppButton
                  label={t('manageSubscription')}
                  variant="secondary"
                  onPress={manageSubscription}
                  disabled={purchaseStatus === 'loading'}
                />
                <AppButton
                  label={t('refreshSubscriptionStatus')}
                  variant="secondary"
                  onPress={() => refreshPurchaseStatus()}
                  disabled={purchaseStatus === 'loading'}
                />
              </View>
            ) : null}
            <AppButton
              label={t('restorePurchases')}
              variant="secondary"
              onPress={restorePurchases}
              disabled={purchaseStatus === 'loading'}
            />
            {purchaseStatusKey ? <Text style={styles.purchaseStatus}>{t(purchaseStatusKey)}</Text> : null}
          </View>
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
    backgroundColor: colors.surfaceLow,
    borderColor: colors.divider,
    borderWidth: 1,
    borderRadius: radii.xl,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  plusHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  plusTitleGroup: {
    flex: 1,
    gap: spacing.sm,
  },
  plusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    color: colors.primaryInk,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    ...typography.labelSm,
  },
  activePill: {
    backgroundColor: 'rgba(191, 194, 255, 0.12)',
    borderColor: colors.primarySoft,
    borderRadius: radii.full,
    borderWidth: 1,
    color: colors.primarySoft,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    ...typography.labelSm,
  },
  plusTitle: {
    color: colors.ink,
    ...typography.headlineMd,
  },
  plusBody: {
    color: colors.muted,
    ...typography.bodyMd,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureChip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.divider,
    borderRadius: radii.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  featureDot: {
    color: colors.primarySoft,
    ...typography.labelLg,
  },
  featureText: {
    color: colors.ink,
    ...typography.labelSm,
  },
  plusMode: {
    color: colors.muted,
    ...typography.labelSm,
  },
  subscriptionStatus: {
    color: colors.primarySoft,
    ...typography.labelLg,
  },
  purchaseStack: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  purchaseOption: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.divider,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  purchaseOptionFeatured: {
    borderColor: colors.primarySoft,
  },
  purchaseOptionDisabled: {
    opacity: 0.55,
  },
  purchaseOptionPressed: {
    opacity: 0.82,
  },
  purchaseCopy: {
    flex: 1,
    gap: 4,
  },
  purchaseTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  purchaseTitle: {
    color: colors.ink,
    ...typography.labelLg,
  },
  bestValuePill: {
    backgroundColor: colors.secondary,
    borderRadius: radii.full,
    color: colors.secondaryInk,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    ...typography.labelSm,
  },
  purchaseSubtitle: {
    color: colors.muted,
    ...typography.labelSm,
  },
  purchaseAction: {
    alignItems: 'flex-end',
    gap: spacing.sm,
    minWidth: 96,
  },
  purchasePrice: {
    color: colors.primarySoft,
    maxWidth: 128,
    ...typography.labelLg,
  },
  purchaseButtonLabel: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    color: colors.primaryInk,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.labelSm,
  },
  purchaseFooter: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  managementActions: {
    gap: spacing.sm,
  },
  purchaseStatus: {
    color: colors.muted,
    ...typography.labelSm,
  },
});
