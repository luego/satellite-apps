export interface AdFrequencyPolicyInput {
  completedSessionCount: number;
  isPlus: boolean;
  lastInterstitialShownAt: Date | null;
  now: Date;
}

const completedSessionInterval = 3;
const minimumInterstitialIntervalMs = 10 * 60 * 1000;

export function shouldShowCompletionInterstitial({
  completedSessionCount,
  isPlus,
  lastInterstitialShownAt,
  now,
}: AdFrequencyPolicyInput): boolean {
  if (isPlus || completedSessionCount < completedSessionInterval) {
    return false;
  }

  if (completedSessionCount % completedSessionInterval !== 0) {
    return false;
  }

  if (!lastInterstitialShownAt) {
    return true;
  }

  return now.getTime() - lastInterstitialShownAt.getTime() >= minimumInterstitialIntervalMs;
}
