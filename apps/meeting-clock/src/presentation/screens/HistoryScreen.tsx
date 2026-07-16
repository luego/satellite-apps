import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatClock } from '../../shared/formatting/time';
import { AdNativeSlot } from '../components/AdNativeSlot';
import { ChoiceChip } from '../components/ChoiceChip';
import { ScreenShell } from '../components/ScreenShell';
import { useMeetingClock } from '../hooks/useMeetingClock';
import { colors, radii, shadows, spacing, typography } from '../theme/colors';

export function HistoryScreen() {
  const { t, history, refreshHistory, locale } = useMeetingClock();
  const totalSeconds = history.reduce((total, session) => total + session.durationSeconds, 0);
  const totalMinutes = Math.round(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const totalDurationLabel =
    totalHours === 0
      ? t('minutesShort', { count: totalMinutes })
      : remainingMinutes === 0
        ? t('hoursShort', { count: totalHours })
        : t('hoursMinutesShort', { hours: totalHours, minutes: remainingMinutes });

  useFocusEffect(
    useCallback(() => {
      refreshHistory();
    }, [refreshHistory]),
  );

  return (
    <ScreenShell title={t('historyTitle')}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>{t('historyTotalFocusToday')}</Text>
        <Text style={styles.summaryValue}>{totalDurationLabel}</Text>
        <View style={styles.summaryTrack}>
          <View style={styles.summaryFill} />
        </View>
      </View>

      <View style={styles.filters}>
        <ChoiceChip label={t('historyAllTime')} selected onPress={() => {}} />
        <ChoiceChip label={t('historyQuick15')} selected={false} onPress={() => {}} />
        <ChoiceChip label={t('historyClientMeeting')} selected={false} onPress={() => {}} />
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t('historyEmptyTitle')}</Text>
          <Text style={styles.emptyBody}>{t('historyEmptyBody')}</Text>
        </View>
      ) : (
        history.map((session) => (
          <View key={session.id} style={styles.row}>
            <View>
              <Text style={styles.outcome}>
                {session.outcome === 'completed' ? t('historyCompleted') : t('historyReset')}
              </Text>
              <Text style={styles.meta}>
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(session.endedAt ?? session.startedAt))}
              </Text>
            </View>
            <Text style={styles.duration}>{formatClock(session.durationSeconds)}</Text>
          </View>
        ))
      )}
      <AdNativeSlot placement="history" />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.xl,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadows.card,
  },
  emptyTitle: {
    color: colors.ink,
    ...typography.headlineMd,
  },
  emptyBody: {
    color: colors.muted,
    ...typography.bodyMd,
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.gutter,
  },
  outcome: {
    color: colors.ink,
    ...typography.labelLg,
  },
  meta: {
    color: colors.muted,
    ...typography.labelSm,
    marginTop: 4,
  },
  duration: {
    color: colors.warning,
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  summaryLabel: {
    color: colors.muted,
    ...typography.labelSm,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: colors.primarySoft,
    fontFamily: 'monospace',
    fontSize: 40,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  summaryTrack: {
    backgroundColor: colors.divider,
    borderRadius: radii.full,
    height: 4,
    marginTop: spacing.gutter,
  },
  summaryFill: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.full,
    height: 4,
    width: '68%',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
