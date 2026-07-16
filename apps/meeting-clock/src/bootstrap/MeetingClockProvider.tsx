import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, AppState, Linking, StyleSheet, Text, View } from 'react-native';

import type {
  PlusEntitlementStatus,
  PlusPurchaseOption,
  PlusPurchaseOptionId,
} from '../application/ports/EntitlementGateway';
import type { MeetingTimerSession } from '../domain/entities/MeetingTimer';
import { createTimerSession, endSession, pauseSession, resumeSession } from '../domain/services/timerEngine';
import { GoogleMobileAdsGateway } from '../infrastructure/ads/GoogleMobileAdsGateway';
import { SystemClock } from '../infrastructure/clock/SystemClock';
import { SQLiteSessionRepository } from '../infrastructure/database/SQLiteSessionRepository';
import { ExpoLocaleSource } from '../infrastructure/localization/ExpoLocaleSource';
import { MockEntitlementGateway } from '../infrastructure/purchases/MockEntitlementGateway';
import { createRevenueCatEntitlementGateway } from '../infrastructure/purchases/RevenueCatEntitlementGateway';
import { ExpoSettingsRepository } from '../infrastructure/repositories/ExpoSettingsRepository';
import type { LanguagePreference, SupportedLocale, TranslationKey } from '../localization';
import { resolveLocale, translate } from '../localization';
import { DEFAULT_TIMER_CONFIG, FREE_HISTORY_LIMIT, PLUS_HISTORY_LIMIT, type TimerConfig } from '../shared/constants/timer';
import { STORAGE_KEYS } from '../shared/constants/storageKeys';
import { canUseRevenueCat } from '../shared/config/revenueCat';
import { colors } from '../presentation/theme/colors';

export type PurchaseStatus =
  | 'idle'
  | 'loading'
  | 'purchased'
  | 'restored'
  | 'cancelled'
  | 'unavailable'
  | 'managementOpened'
  | 'managementUnavailable'
  | 'statusRefreshed'
  | 'error';
export type PurchasesMode = 'mock' | 'revenuecat';

const emptyPlusStatus: PlusEntitlementStatus = {
  isPlus: false,
  willRenew: null,
  expiresAt: null,
  unsubscribeDetectedAt: null,
  managementUrl: null,
};

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
  plusStatus: PlusEntitlementStatus;
  plusPurchaseOptions: PlusPurchaseOption[];
  purchaseStatus: PurchaseStatus;
  purchasesMode: PurchasesMode;
  purchasePlus: (optionId: PlusPurchaseOptionId) => Promise<void>;
  restorePurchases: () => Promise<void>;
  manageSubscription: () => Promise<void>;
  refreshPurchaseStatus: (options?: { showFeedback?: boolean }) => Promise<void>;
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
  const purchasesMode = useMemo<PurchasesMode>(() => (canUseRevenueCat() ? 'revenuecat' : 'mock'), []);
  const entitlementGateway = useMemo(
    () =>
      purchasesMode === 'revenuecat'
        ? createRevenueCatEntitlementGateway()
        : new MockEntitlementGateway(settingsRepository),
    [purchasesMode, settingsRepository],
  );

  const [ready, setReady] = useState(false);
  const [languagePreferenceState, setLanguagePreferenceState] =
    useState<LanguagePreference>('automatic');
  const [locale, setLocale] = useState<SupportedLocale>('en');
  const [timerConfigState, setTimerConfigState] = useState<TimerConfig>(DEFAULT_TIMER_CONFIG);
  const [activeSession, setActiveSession] = useState<MeetingTimerSession | null>(null);
  const [history, setHistory] = useState<MeetingTimerSession[]>([]);
  const [isPlus, setIsPlus] = useState(false);
  const [plusStatus, setPlusStatus] = useState<PlusEntitlementStatus>(emptyPlusStatus);
  const [canShowAds, setCanShowAds] = useState(false);
  const [plusPurchaseOptions, setPlusPurchaseOptions] = useState<PlusPurchaseOption[]>([]);
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>('idle');

  const refreshHistory = useCallback(async () => {
    const plus = await entitlementGateway.isPlus();
    const limit = plus ? PLUS_HISTORY_LIMIT : FREE_HISTORY_LIMIT;
    setHistory(await sessionRepository.listRecent(limit));
  }, [entitlementGateway, sessionRepository]);

  const refreshEntitlements = useCallback(async (options: { forceRefresh?: boolean } = {}) => {
    const status = await entitlementGateway.getPlusStatus({ forceRefresh: options.forceRefresh });
    const plus = status.isPlus;
    setPlusStatus(status);
    setIsPlus(plus);
    setCanShowAds(await adsGateway.canShowAds(plus));
    setPlusPurchaseOptions(await entitlementGateway.listPlusPurchaseOptions());
  }, [adsGateway, entitlementGateway]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      await sessionRepository.initialize();
      await adsGateway.initialize();
      await entitlementGateway.initialize();
      const [savedPreference, savedConfig] = await Promise.all([
        settingsRepository.get<LanguagePreference>(STORAGE_KEYS.languagePreference),
        settingsRepository.get<TimerConfig>(STORAGE_KEYS.timerConfig),
      ]);
      const nextPreference = savedPreference ?? 'automatic';
      const nextLocale = resolveLocale(nextPreference, localeSource.getDeviceLanguageCodes());
      const status = await entitlementGateway.getPlusStatus({ forceRefresh: true });
      const plus = status.isPlus;
      const limit = plus ? PLUS_HISTORY_LIMIT : FREE_HISTORY_LIMIT;

      if (!mounted) {
        return;
      }

      setLanguagePreferenceState(nextPreference);
      setLocale(nextLocale);
      setTimerConfigState(savedConfig ?? DEFAULT_TIMER_CONFIG);
      setPlusStatus(status);
      setIsPlus(plus);
      setCanShowAds(await adsGateway.canShowAds(plus));
      setPlusPurchaseOptions(await entitlementGateway.listPlusPurchaseOptions());
      setHistory(await sessionRepository.listRecent(limit));
      setReady(true);
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [adsGateway, entitlementGateway, localeSource, sessionRepository, settingsRepository]);

  useEffect(() => {
    if (!ready) {
      return undefined;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        return;
      }

      refreshEntitlements({ forceRefresh: true })
        .then(refreshHistory)
        .catch(() => undefined);
    });

    return () => {
      subscription.remove();
    };
  }, [ready, refreshEntitlements, refreshHistory]);

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
      setPurchaseStatus('idle');
      await refreshEntitlements();
      await refreshHistory();
    },
    [entitlementGateway, refreshEntitlements, refreshHistory],
  );

  const purchasePlus = useCallback(
    async (optionId: PlusPurchaseOptionId) => {
      const option = plusPurchaseOptions.find((candidate) => candidate.id === optionId);

      if (!option?.available) {
        setPurchaseStatus('unavailable');
        return;
      }

      setPurchaseStatus('loading');

      try {
        const purchased = await entitlementGateway.purchasePlus(optionId);
        setPurchaseStatus(purchased ? 'purchased' : 'cancelled');
        await refreshEntitlements();
        await refreshHistory();
      } catch {
        setPurchaseStatus('error');
      }
    },
    [entitlementGateway, plusPurchaseOptions, refreshEntitlements, refreshHistory],
  );

  const restorePurchases = useCallback(async () => {
    setPurchaseStatus('loading');

    try {
      const restored = await entitlementGateway.restore();
      setPurchaseStatus(restored ? 'restored' : 'unavailable');
      await refreshEntitlements();
      await refreshHistory();
    } catch {
      setPurchaseStatus('error');
    }
  }, [entitlementGateway, refreshEntitlements, refreshHistory]);

  const manageSubscription = useCallback(async () => {
    setPurchaseStatus('loading');

    try {
      const status = await entitlementGateway.getPlusStatus();
      setPlusStatus(status);

      if (!status.managementUrl) {
        setPurchaseStatus('managementUnavailable');
        return;
      }

      await Linking.openURL(status.managementUrl);
      setPurchaseStatus('managementOpened');
    } catch {
      setPurchaseStatus('error');
    }
  }, [entitlementGateway]);

  const refreshPurchaseStatus = useCallback(async (options: { showFeedback?: boolean } = {}) => {
    const showFeedback = options.showFeedback ?? true;

    if (showFeedback) {
      setPurchaseStatus('loading');
    }

    try {
      await refreshEntitlements({ forceRefresh: true });
      await refreshHistory();
      if (showFeedback) {
        setPurchaseStatus('statusRefreshed');
      }
    } catch {
      if (showFeedback) {
        setPurchaseStatus('error');
      }
    }
  }, [refreshEntitlements, refreshHistory]);

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
      plusStatus,
      plusPurchaseOptions,
      purchaseStatus,
      purchasesMode,
      purchasePlus,
      restorePurchases,
      manageSubscription,
      refreshPurchaseStatus,
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
      manageSubscription,
      pauseActiveSession,
      plusStatus,
      plusPurchaseOptions,
      purchasePlus,
      purchaseStatus,
      purchasesMode,
      ready,
      refreshHistory,
      refreshPurchaseStatus,
      restartActiveSession,
      restorePurchases,
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
