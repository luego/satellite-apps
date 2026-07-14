import { describe, expect, it } from 'vitest';

import { shouldShowCompletionInterstitial } from '../../src/domain/services/adFrequencyPolicy';

const now = new Date('2026-07-08T12:00:00.000Z');

describe('adFrequencyPolicy', () => {
  it('does not show interstitials during the first two completed sessions', () => {
    expect(
      shouldShowCompletionInterstitial({
        completedSessionCount: 2,
        isPlus: false,
        lastInterstitialShownAt: null,
        now,
      }),
    ).toBe(false);
  });

  it('shows on every third completed session for free users', () => {
    expect(
      shouldShowCompletionInterstitial({
        completedSessionCount: 3,
        isPlus: false,
        lastInterstitialShownAt: null,
        now,
      }),
    ).toBe(true);
  });

  it('does not show between third-session intervals', () => {
    expect(
      shouldShowCompletionInterstitial({
        completedSessionCount: 4,
        isPlus: false,
        lastInterstitialShownAt: null,
        now,
      }),
    ).toBe(false);
  });

  it('enforces the ten-minute cooldown', () => {
    expect(
      shouldShowCompletionInterstitial({
        completedSessionCount: 6,
        isPlus: false,
        lastInterstitialShownAt: new Date('2026-07-08T11:55:00.000Z'),
        now,
      }),
    ).toBe(false);

    expect(
      shouldShowCompletionInterstitial({
        completedSessionCount: 6,
        isPlus: false,
        lastInterstitialShownAt: new Date('2026-07-08T11:49:59.000Z'),
        now,
      }),
    ).toBe(true);
  });

  it('does not show to Plus users', () => {
    expect(
      shouldShowCompletionInterstitial({
        completedSessionCount: 3,
        isPlus: true,
        lastInterstitialShownAt: null,
        now,
      }),
    ).toBe(false);
  });
});
