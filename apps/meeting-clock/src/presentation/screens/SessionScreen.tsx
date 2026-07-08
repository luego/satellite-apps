import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getTimerSnapshot } from '../../domain/services/timerEngine';
import { AppButton } from '../components/AppButton';
import { TimerDisplay } from '../components/TimerDisplay';
import { useMeetingClock } from '../hooks/useMeetingClock';
import { colors, levelColors, spacing, typography } from '../theme/colors';

export function SessionScreen() {
  useKeepAwake('meeting-clock-active-session');
  const router = useRouter();
  const {
    activeSession,
    t,
    pauseActiveSession,
    resumeActiveSession,
    restartActiveSession,
    completeActiveSession,
    resetActiveSession,
  } = useMeetingClock();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  const snapshot = useMemo(
    () => (activeSession ? getTimerSnapshot(activeSession, now) : null),
    [activeSession, now],
  );

  if (!activeSession || !snapshot) {
    return (
      <SafeAreaView style={styles.empty}>
        <Text style={styles.emptyTitle}>{t('noActiveSessionTitle')}</Text>
        <Text style={styles.emptyBody}>{t('noActiveSessionBody')}</Text>
        <AppButton label={t('backToSetup')} onPress={() => router.replace('/')} />
      </SafeAreaView>
    );
  }

  const stateLabel = t(
    snapshot.level === 'normal'
      ? 'normalState'
      : snapshot.level === 'warning'
        ? 'warningState'
        : snapshot.level === 'critical'
          ? 'criticalState'
          : 'overtimeState',
  );
  const primaryLabel = activeSession.mode === 'countup' ? t('elapsedLabel') : t('remainingLabel');

  const finish = async (kind: 'complete' | 'reset') => {
    if (kind === 'complete') {
      await completeActiveSession();
    } else {
      await resetActiveSession();
    }
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TimerDisplay snapshot={snapshot} stateLabel={stateLabel} primaryLabel={primaryLabel} />
      <View style={styles.controls}>
        <SessionControl
          label={activeSession.status === 'paused' ? t('resume') : t('pause')}
          symbol={activeSession.status === 'paused' ? '>' : 'II'}
          onPress={activeSession.status === 'paused' ? resumeActiveSession : pauseActiveSession}
        />
        <SessionControl label={t('complete')} symbol="OK" onPress={() => finish('complete')} />
        <SessionControl label={t('restart')} symbol="R" onPress={restartActiveSession} />
        <SessionControl label={t('quit')} symbol="X" onPress={() => finish('reset')} danger />
      </View>
    </SafeAreaView>
  );
}

interface SessionControlProps {
  label: string;
  symbol: string;
  onPress: () => void;
  danger?: boolean;
}

function SessionControl({ label, symbol, onPress, danger = false }: SessionControlProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.controlButton,
        danger ? styles.controlButtonDanger : null,
        pressed ? styles.controlButtonPressed : null,
      ]}
    >
      <Text style={[styles.controlSymbol, danger ? styles.controlSymbolDanger : null]}>{symbol}</Text>
      <Text style={styles.controlLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkSurface,
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingBottom: spacing.xs,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(191, 194, 255, 0.12)',
    borderColor: 'rgba(191, 194, 255, 0.22)',
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 56,
    minWidth: 82,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  controlButtonDanger: {
    backgroundColor: 'rgba(255, 123, 123, 0.12)',
    borderColor: 'rgba(255, 123, 123, 0.32)',
  },
  controlButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  controlSymbol: {
    color: colors.primarySoft,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 20,
  },
  controlSymbolDanger: {
    color: levelColors.overtime,
  },
  controlLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  empty: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    color: colors.ink,
    ...typography.headlineMd,
  },
  emptyBody: {
    color: colors.muted,
    ...typography.bodyMd,
    textAlign: 'center',
  },
});
