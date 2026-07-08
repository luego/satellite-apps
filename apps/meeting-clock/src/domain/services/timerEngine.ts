import type { MeetingTimerSession, SessionOutcome, TimerMode, TimerSnapshot } from '../entities/MeetingTimer';

export interface CreateTimerSessionInput {
  id: string;
  durationSeconds: number;
  mode: TimerMode;
  warningThresholdSeconds: number;
  criticalThresholdSeconds: number;
  startedAt: Date;
}

const secondsBetween = (start: string, end: Date) =>
  Math.max(0, Math.floor((end.getTime() - new Date(start).getTime()) / 1000));

const clampThreshold = (value: number, durationSeconds: number) =>
  Math.min(Math.max(0, Math.floor(value)), durationSeconds);

export function createTimerSession(input: CreateTimerSessionInput): MeetingTimerSession {
  const durationSeconds = Math.max(1, Math.floor(input.durationSeconds));
  const warningThresholdSeconds = clampThreshold(input.warningThresholdSeconds, durationSeconds);
  const criticalThresholdSeconds = clampThreshold(input.criticalThresholdSeconds, warningThresholdSeconds);

  return {
    id: input.id,
    durationSeconds,
    mode: input.mode,
    warningThresholdSeconds,
    criticalThresholdSeconds,
    startedAt: input.startedAt.toISOString(),
    pausedAt: null,
    accumulatedPausedSeconds: 0,
    status: 'running',
    endedAt: null,
    outcome: null,
  };
}

export function pauseSession(session: MeetingTimerSession, pausedAt: Date): MeetingTimerSession {
  if (session.status !== 'running') {
    return session;
  }

  return {
    ...session,
    status: 'paused',
    pausedAt: pausedAt.toISOString(),
  };
}

export function resumeSession(session: MeetingTimerSession, resumedAt: Date): MeetingTimerSession {
  if (session.status !== 'paused' || !session.pausedAt) {
    return session;
  }

  return {
    ...session,
    status: 'running',
    accumulatedPausedSeconds:
      session.accumulatedPausedSeconds + secondsBetween(session.pausedAt, resumedAt),
    pausedAt: null,
  };
}

export function endSession(
  session: MeetingTimerSession,
  endedAt: Date,
  outcome: SessionOutcome,
): MeetingTimerSession {
  const resumed = session.status === 'paused' ? resumeSession(session, endedAt) : session;

  return {
    ...resumed,
    status: outcome,
    pausedAt: null,
    endedAt: endedAt.toISOString(),
    outcome,
  };
}

export function getTimerSnapshot(session: MeetingTimerSession, now: Date): TimerSnapshot {
  const effectiveNow = session.status === 'paused' && session.pausedAt ? new Date(session.pausedAt) : now;
  const elapsedSeconds = Math.max(
    0,
    secondsBetween(session.startedAt, effectiveNow) - session.accumulatedPausedSeconds,
  );
  const remainingSeconds = session.durationSeconds - elapsedSeconds;
  const overtimeSeconds = Math.max(0, -remainingSeconds);

  let level: TimerSnapshot['level'] = 'normal';
  if (overtimeSeconds > 0) {
    level = 'overtime';
  } else if (remainingSeconds <= session.criticalThresholdSeconds) {
    level = 'critical';
  } else if (remainingSeconds <= session.warningThresholdSeconds) {
    level = 'warning';
  }

  return {
    elapsedSeconds,
    remainingSeconds,
    overtimeSeconds,
    displaySeconds: session.mode === 'countup' ? elapsedSeconds : Math.max(0, remainingSeconds),
    level,
    isRunning: session.status === 'running',
  };
}
