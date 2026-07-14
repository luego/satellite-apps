import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { MeetingTimerSession } from '../domain/entities/MeetingTimer';
import { createTimerSession, endSession, pauseSession, resumeSession } from '../domain/services/timerEngine';
import { GoogleMobileAdsGateway } from '../infrastructure/ads/GoogleMobileAdsGateway';
import { SystemClock } from '../infrastructure/clock/SystemClock';
import { SQLiteSessionRepository } from '../infrastructure/database/SQLiteSessionRepository';
import { ExpoLocaleSource } from '../infrastructure/localization/ExpoLocaleSource';
import { MockEntitlementGateway } from '../infrastructure/purchases/MockEntitlementGateway';
import { ExpoSettingsRepository } from '../infrastructure/repositories/ExpoSettingsRepository';
import type { LanguagePreference, SupportedLocale, TranslationKey } from '../localization';
import { resolveLocale, translate } from '../localization';
import { DEFAULT_TIMER_CONFIG, FREE_HISTORY_LIMIT, PLUS_HISTORY_LIMIT, type TimerConfig } from '../shared/constants/timer';
import { STORAGE_KEYS } from '../shared/constants/storageKeys';
import { colors } from '../presentation/theme/colors';

interface MeetingClockContextValue {
  ready: boolean;
  locale: SupportedLocale;
  languagePreference: LanguagePreference;
  setLanguagePreference: (value: LanguagePreference) => Promise<void>;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
  timerConfig: TimerConfig;
  setTimerConfig: (value: TimerConfig) => Promise<void>;
  activeSession: MeetingTimerSession | null;
  history: MeetingTimerSession[];
  startSession: (config: TimerConfig) => Promise<MeetingTimerSession>;
  pauseActiveSession: () => void;
  resumeActiveSession: () => void;
  restartActiveSession: () => void;
  completeActiveSession: () => Promise<void>;
  resetActiveSession: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  isPlus: boolean;
  setMockPlus: (value: boolean) => Promise<void>;
  canShowAds: boolean;
}

export const MeetingClockContext = createContext<MeetingClockContextValue | null>(null);

const createSessionId = () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function MeetingClockProvider({ children }: PropsWithChildren) {
  const settingsRepository = useMemo(() => new ExpoSettingsRepository(), []);
  const sessionRepository = useMemo(() => new SQLiteSessionRepository(), []);
  const localeSource = useMemo(() => new ExpoLocaleSource(), []);
  const clock = useMemo(() => new SystemClock(), []);
  const adsGateway = useMemo(
    () => new GoogleMobileAdsGateway(settingsRepository),
    [settingsRepository],
  );
  const entitlementGateway = useMemo(
    () => new MockEntitlementGateway(settingsRepository),
    [settingsRepository],
  );

  const [ready, setReady] = useState(false);
  const [languagePreferenceState, setLanguagePreferenceState] =
    useState<LanguagePreference>('automatic');
  const [locale, setLocale] = useState<SupportedLocale>('en');
  const [timerConfigState, setTimerConfigState] = useState<TimerConfig>(DEFAULT_TIMER_CONFIG);
  const [activeSession, setActiveSession] = useState<MeetingTimerSession | null>(null);
  const [history, setHistory] = useState<MeetingTimerSession[]>([]);
  const [isPlus, setIsPlus] = useState(false);
  const [canShowAds, setCanShowAds] = useState(false);

  const refreshHistory = useCallback(async () => {
    const plus = await entitlementGateway.isPlus();
    const limit = plus ? PLUS_HISTORY_LIMIT : FREE_HISTORY_LIMIT;
    setHistory(await sessionRepository.listRecent(limit));
  }, [entitlementGateway, sessionRepository]);

  const refreshEntitlements = useCallback(async () => {
    const plus = await entitlementGateway.isPlus();
    setIsPlus(plus);
    setCanShowAds(await adsGateway.canShowBanner(plus));
  }, [adsGateway, entitlementGateway]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      await sessionRepository.initialize();
      await adsGateway.initialize();
      const [savedPreference, savedConfig] = await Promise.all([
        settingsRepository.get<LanguagePreference>(STORAGE_KEYS.languagePreference),
        settingsRepository.get<TimerConfig>(STORAGE_KEYS.timerConfig),
      ]);
      const nextPreference = savedPreference ?? 'automatic';
      const nextLocale = resolveLocale(nextPreference, localeSource.getDeviceLanguageCodes());
      const plus = await entitlementGateway.isPlus();
      const limit = plus ? PLUS_HISTORY_LIMIT : FREE_HISTORY_LIMIT;

      if (!mounted) {
        return;
      }

      setLanguagePreferenceState(nextPreference);
      setLocale(nextLocale);
      setTimerConfigState(savedConfig ?? DEFAULT_TIMER_CONFIG);
      setIsPlus(plus);
      setCanShowAds(await adsGateway.canShowBanner(plus));
      setHistory(await sessionRepository.listRecent(limit));
      setReady(true);
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [adsGateway, entitlementGateway, localeSource, sessionRepository, settingsRepository]);

  const setLanguagePreference = useCallback(
    async (value: LanguagePreference) => {
      await settingsRepository.set(STORAGE_KEYS.languagePreference, value);
      setLanguagePreferenceState(value);
      setLocale(resolveLocale(value, localeSource.getDeviceLanguageCodes()));
    },
    [localeSource, settingsRepository],
  );

  const setTimerConfig = useCallback(
    async (value: TimerConfig) => {
      await settingsRepository.set(STORAGE_KEYS.timerConfig, value);
      setTimerConfigState(value);
    },
    [settingsRepository],
  );

  const startSession = useCallback(
    async (config: TimerConfig) => {
      await setTimerConfig(config);
      const session = createTimerSession({
        id: createSessionId(),
        ...config,
        startedAt: clock.now(),
      });
      setActiveSession(session);
      return session;
    },
    [clock, setTimerConfig],
  );

  const pauseActiveSession = useCallback(() => {
    setActiveSession((session) => (session ? pauseSession(session, clock.now()) : session));
  }, [clock]);

  const resumeActiveSession = useCallback(() => {
    setActiveSession((session) => (session ? resumeSession(session, clock.now()) : session));
  }, [clock]);

  const restartActiveSession = useCallback(() => {
    setActiveSession((session) =>
      session
        ? createTimerSession({
            id: createSessionId(),
            durationSeconds: session.durationSeconds,
            mode: session.mode,
            warningThresholdSeconds: session.warningThresholdSeconds,
            criticalThresholdSeconds: session.criticalThresholdSeconds,
            startedAt: clock.now(),
          })
        : session,
    );
  }, [clock]);

  const saveAndCloseSession = useCallback(
    async (outcome: 'completed' | 'reset') => {
      if (!activeSession) {
        return;
      }

      const ended = endSession(activeSession, clock.now(), outcome);
      const plus = await entitlementGateway.isPlus();
      const limit = plus ? PLUS_HISTORY_LIMIT : FREE_HISTORY_LIMIT;
      await sessionRepository.save(ended);
      await sessionRepository.prune(limit);
      setActiveSession(null);
      await refreshHistory();

      if (outcome === 'completed') {
        await adsGateway.showInterstitialAtNaturalBreak({
          completedSessionCount: await sessionRepository.countCompleted(),
          isPlus: plus,
          now: clock.now(),
        });
      }
    },
    [activeSession, adsGateway, clock, entitlementGateway, refreshHistory, sessionRepository],
  );

  const setMockPlus = useCallback(
    async (value: boolean) => {
      await entitlementGateway.setDevelopmentOverride(value);
      await refreshEntitlements();
      await refreshHistory();
    },
    [entitlementGateway, refreshEntitlements, refreshHistory],
  );

  const value = useMemo<MeetingClockContextValue>(
    () => ({
      ready,
      locale,
      languagePreference: languagePreferenceState,
      setLanguagePreference,
      t: (key, values) => translate(locale, key, values),
      timerConfig: timerConfigState,
      setTimerConfig,
      activeSession,
      history,
      startSession,
      pauseActiveSession,
      resumeActiveSession,
      restartActiveSession,
      completeActiveSession: () => saveAndCloseSession('completed'),
      resetActiveSession: () => saveAndCloseSession('reset'),
      refreshHistory,
      isPlus,
      setMockPlus,
      canShowAds,
    }),
    [
      activeSession,
      canShowAds,
      history,
      isPlus,
      languagePreferenceState,
      locale,
      pauseActiveSession,
      ready,
      refreshHistory,
      restartActiveSession,
      resumeActiveSession,
      saveAndCloseSession,
      setLanguagePreference,
      setMockPlus,
      setTimerConfig,
      startSession,
      timerConfigState,
    ],
  );

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>{translate(locale, 'loading')}</Text>
      </View>
    );
  }

  return <MeetingClockContext.Provider value={value}>{children}</MeetingClockContext.Provider>;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
});
