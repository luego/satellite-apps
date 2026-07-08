import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PRESET_DURATIONS_SECONDS } from "../../shared/constants/timer";
import { formatClock, formatMinutes } from "../../shared/formatting/time";
import { AdBannerPlaceholder } from "../components/AdBannerPlaceholder";
import { AppButton } from "../components/AppButton";
import { ChoiceChip } from "../components/ChoiceChip";
import { ScreenShell } from "../components/ScreenShell";
import { useMeetingClock } from "../hooks/useMeetingClock";
import {
  colors,
  levelColors,
  radii,
  shadows,
  spacing,
  typography,
} from "../theme/colors";

const sanitizeNumericInput = (value: string) => value.replace(/[^0-9]/g, "");

export function TimerSetupScreen() {
  const router = useRouter();
  const { t, timerConfig, startSession, history } = useMeetingClock();
  const [durationSeconds, setDurationSeconds] = useState(
    timerConfig.durationSeconds,
  );
  const [customMinutes, setCustomMinutes] = useState(
    formatMinutes(timerConfig.durationSeconds),
  );
  const [mode, setMode] = useState(timerConfig.mode);
  const [warningMinutes, setWarningMinutes] = useState(
    formatMinutes(timerConfig.warningThresholdSeconds),
  );
  const [criticalMinutes, setCriticalMinutes] = useState(
    formatMinutes(timerConfig.criticalThresholdSeconds),
  );

  const normalizedConfig = useMemo(() => {
    const customDurationSeconds =
      Math.max(1, Number(customMinutes) || durationSeconds / 60) * 60;
    const warningThresholdSeconds =
      Math.max(0, Number(warningMinutes) || 0) * 60;
    const criticalThresholdSeconds =
      Math.max(0, Number(criticalMinutes) || 0) * 60;

    return {
      durationSeconds,
      mode,
      warningThresholdSeconds: Math.min(
        warningThresholdSeconds,
        customDurationSeconds,
      ),
      criticalThresholdSeconds: Math.min(
        criticalThresholdSeconds,
        warningThresholdSeconds,
      ),
    };
  }, [criticalMinutes, customMinutes, durationSeconds, mode, warningMinutes]);

  const selectDuration = (seconds: number) => {
    setDurationSeconds(seconds);
    setCustomMinutes(formatMinutes(seconds));
  };

  const adjustDuration = (deltaMinutes: number) => {
    const nextSeconds = Math.max(60, durationSeconds + deltaMinutes * 60);
    selectDuration(nextSeconds);
  };

  const start = async () => {
    await startSession(normalizedConfig);
    router.push("/session");
  };

  return (
    <ScreenShell title="" showBottomNav>
      <View style={styles.timerHero}>
        <View style={styles.durationRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => adjustDuration(-1)}
            style={styles.stepButton}
          >
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <View style={styles.durationStack}>
            <Text style={styles.heroTime}>{formatClock(durationSeconds)}</Text>
            <Text style={styles.heroMeta}>{t("durationLabel")}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => adjustDuration(1)}
            style={styles.stepButton}
          >
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {PRESET_DURATIONS_SECONDS.map((seconds) => (
          <ChoiceChip
            key={seconds}
            label={t("minutesShort", { count: formatMinutes(seconds) })}
            selected={durationSeconds === seconds}
            onPress={() => selectDuration(seconds)}
          />
        ))}
      </ScrollView>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t("customDurationLabel")}</Text>
        <TextInput
          accessibilityLabel={t("customDurationLabel")}
          inputMode="numeric"
          keyboardType="number-pad"
          onChangeText={(value) => {
            const nextValue = sanitizeNumericInput(value);
            setCustomMinutes(nextValue);
            const minutes = Number(nextValue);
            if (minutes > 0) {
              setDurationSeconds(minutes * 60);
            }
          }}
          placeholder={t("customDurationPlaceholder")}
          style={styles.input}
          value={customMinutes}
        />
      </View>

      <View style={styles.modeRow}>
        <ChoiceChip
          label={t("countdown")}
          selected={mode === "countdown"}
          onPress={() => setMode("countdown")}
        />
        <ChoiceChip
          label={t("countup")}
          selected={mode === "countup"}
          onPress={() => setMode("countup")}
        />
      </View>

      <View style={styles.twoColumns}>
        <View style={[styles.phaseCard, { borderColor: levelColors.warning }]}>
          <Text style={[styles.phaseLabel, { color: levelColors.warning }]}>
            {t("warningLabel")}
          </Text>
          <TextInput
            accessibilityLabel={t("warningLabel")}
            inputMode="numeric"
            keyboardType="number-pad"
            onChangeText={(value) =>
              setWarningMinutes(sanitizeNumericInput(value))
            }
            style={styles.phaseInput}
            value={warningMinutes}
          />
        </View>
        <View style={[styles.phaseCard, { borderColor: levelColors.critical }]}>
          <Text style={[styles.phaseLabel, { color: levelColors.critical }]}>
            {t("criticalLabel")}
          </Text>
          <TextInput
            accessibilityLabel={t("criticalLabel")}
            inputMode="numeric"
            keyboardType="number-pad"
            onChangeText={(value) =>
              setCriticalMinutes(sanitizeNumericInput(value))
            }
            style={styles.phaseInput}
            value={criticalMinutes}
          />
        </View>
      </View>
      <Text style={styles.help}>{t("thresholdHelp")}</Text>
      <View style={styles.recentHeader}>
        <Text style={styles.sectionLabel}>{t("historyTitle")}</Text>
        <Link href="/history" style={styles.link}>
          {t("navHistory")}
        </Link>
      </View>
      <View style={styles.recentStack}>
        {history.slice(0, 2).map((session) => (
          <View key={session.id} style={styles.recentRow}>
            <View style={styles.recentIcon}>
              <Text style={styles.recentIconText}>↺</Text>
            </View>
            <View style={styles.recentCopy}>
              <Text style={styles.recentTitle}>
                {session.outcome === "completed"
                  ? t("historyCompleted")
                  : t("historyReset")}
              </Text>
              <Text style={styles.recentMeta}>
                {formatClock(session.durationSeconds)}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        ))}
      </View>

      <View style={styles.startWrap}>
        <AppButton label={t("startTimer")} onPress={start} />
      </View>

      <AdBannerPlaceholder />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  timerHero: {
    alignItems: "center",
    paddingVertical: spacing.gutter,
  },
  durationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.gutter,
  },
  stepButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.full,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  stepText: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "700",
  },
  durationStack: {
    alignItems: "center",
  },
  heroTime: {
    color: colors.primarySoft,
    fontFamily: "monospace",
    fontSize: 42,
    fontWeight: "700",
    textShadowColor: "rgba(191,194,255,0.35)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  heroMeta: {
    color: colors.muted,
    ...typography.labelSm,
    textTransform: "uppercase",
  },
  link: {
    color: colors.primarySoft,
    ...typography.labelSm,
  },
  sectionLabel: {
    color: colors.ink,
    ...typography.labelSm,
    textTransform: "uppercase",
  },
  chipRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  fieldGroup: {
    flex: 1,
    gap: spacing.sm,
  },
  label: {
    color: colors.ink,
    ...typography.labelSm,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: colors.surfaceContainer,
    borderBottomColor: colors.primary,
    borderBottomWidth: 2,
    borderRadius: radii.md,
    color: colors.ink,
    ...typography.bodyLg,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  modeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  twoColumns: {
    gap: spacing.sm,
  },
  help: {
    color: colors.muted,
    ...typography.labelSm,
  },
  phaseCard: {
    backgroundColor: colors.surfaceContainer,
    borderLeftWidth: 3,
    borderRadius: radii.lg,
    gap: spacing.xs,
    padding: spacing.gutter,
  },
  phaseLabel: {
    ...typography.labelSm,
    textTransform: "uppercase",
  },
  phaseInput: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "700",
    minHeight: 36,
  },
  recentHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recentStack: {
    gap: spacing.sm,
  },
  recentRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.lg,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  recentIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.full,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  recentIconText: {
    color: colors.primarySoft,
  },
  recentCopy: {
    flex: 1,
  },
  recentTitle: {
    color: colors.ink,
    ...typography.labelLg,
  },
  recentMeta: {
    color: colors.muted,
    ...typography.labelSm,
  },
  chevron: {
    color: colors.ink,
    fontSize: 24,
  },
  startWrap: {
    borderRadius: radii.xl,
    ...shadows.card,
  },
});
