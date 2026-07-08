import { describe, expect, it } from 'vitest';

import { createTimerSession, getTimerSnapshot, pauseSession, resumeSession } from '../../src/domain/services/timerEngine';

describe('timerEngine', () => {
  it('calculates countdown snapshots from timestamps', () => {
    const startedAt = new Date('2026-07-07T10:00:00.000Z');
    const session = createTimerSession({
      id: 'test',
      durationSeconds: 600,
      mode: 'countdown',
      warningThresholdSeconds: 120,
      criticalThresholdSeconds: 30,
      startedAt,
    });

    const snapshot = getTimerSnapshot(session, new Date('2026-07-07T10:08:30.000Z'));

    expect(snapshot.elapsedSeconds).toBe(510);
    expect(snapshot.remainingSeconds).toBe(90);
    expect(snapshot.displaySeconds).toBe(90);
    expect(snapshot.level).toBe('warning');
  });

  it('enters critical and overtime states without decrementing source state', () => {
    const session = createTimerSession({
      id: 'test',
      durationSeconds: 60,
      mode: 'countdown',
      warningThresholdSeconds: 20,
      criticalThresholdSeconds: 10,
      startedAt: new Date('2026-07-07T10:00:00.000Z'),
    });

    expect(getTimerSnapshot(session, new Date('2026-07-07T10:00:55.000Z')).level).toBe('critical');

    const overtime = getTimerSnapshot(session, new Date('2026-07-07T10:01:08.000Z'));
    expect(overtime.level).toBe('overtime');
    expect(overtime.overtimeSeconds).toBe(8);
    expect(session.accumulatedPausedSeconds).toBe(0);
  });

  it('excludes paused time from elapsed calculations', () => {
    const session = createTimerSession({
      id: 'test',
      durationSeconds: 300,
      mode: 'countup',
      warningThresholdSeconds: 60,
      criticalThresholdSeconds: 15,
      startedAt: new Date('2026-07-07T10:00:00.000Z'),
    });

    const paused = pauseSession(session, new Date('2026-07-07T10:01:00.000Z'));
    const resumed = resumeSession(paused, new Date('2026-07-07T10:03:00.000Z'));
    const snapshot = getTimerSnapshot(resumed, new Date('2026-07-07T10:04:00.000Z'));

    expect(snapshot.elapsedSeconds).toBe(120);
    expect(snapshot.displaySeconds).toBe(120);
  });
});
