import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { TimerSnapshot } from '../../domain/entities/MeetingTimer';
import { formatClock } from '../../shared/formatting/time';
import { colors, levelColors, typography } from '../theme/colors';

interface TimerDisplayProps {
  snapshot: TimerSnapshot;
  stateLabel: string;
  primaryLabel: string;
}

export function TimerDisplay({ snapshot, stateLabel, primaryLabel }: TimerDisplayProps) {
  const { width, height } = useWindowDimensions();
  const stateColor = levelColors[snapshot.level];
  const isOvertime = snapshot.overtimeSeconds > 0;
  const displayText = isOvertime
    ? `+${formatClock(snapshot.overtimeSeconds)}`
    : formatClock(snapshot.displaySeconds);
  const ringSize = Math.max(170, Math.min(width - 96, height - 118, 340));
  const maxTimerSize = width < 680 ? typography.timerDisplayMobile.fontSize : typography.timerDisplay.fontSize;
  const timerScale = displayText.length >= 8 ? 0.2 : displayText.length >= 7 ? 0.22 : displayText.length >= 6 ? 0.26 : 0.34;
  const timerSize = Math.min(maxTimerSize, ringSize * timerScale);

  return (
    <View style={styles.container}>
      <Text style={[styles.state, { color: stateColor }]}>{stateLabel}</Text>
      <View
        style={[
          styles.ring,
          {
            borderColor: stateColor,
            borderRadius: ringSize / 2,
            height: ringSize,
            width: ringSize,
          },
        ]}
      >
        <Text
          adjustsFontSizeToFit
          allowFontScaling={false}
          minimumFontScale={0.42}
          numberOfLines={1}
          style={[styles.time, { color: stateColor, fontSize: timerSize, maxWidth: ringSize * 0.9 }]}
        >
          {displayText}
        </Text>
      </View>
      <Text style={[styles.label, isOvertime ? { color: stateColor } : null]}>
        {isOvertime ? stateLabel : primaryLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 220,
    backgroundColor: colors.darkSurface,
    gap: 10,
  },
  state: {
    ...typography.labelSm,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  ring: {
    alignItems: 'center',
    borderWidth: 2,
    justifyContent: 'center',
  },
  time: {
    fontFamily: 'monospace',
    fontWeight: '700',
    includeFontPadding: false,
    textAlign: 'center',
    textShadowColor: 'rgba(191,194,255,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  label: {
    color: colors.muted,
    ...typography.labelSm,
    textTransform: 'uppercase',
  },
});
