export type TimerMode = 'countdown' | 'countup';

export type SessionStatus = 'running' | 'paused' | 'completed' | 'reset';

export type SessionOutcome = 'completed' | 'reset';

export type TimerStateLevel = 'normal' | 'warning' | 'critical' | 'overtime';

export interface MeetingTimerSession {
  id: string;
  durationSeconds: number;
  mode: TimerMode;
  warningThresholdSeconds: number;
  criticalThresholdSeconds: number;
  startedAt: string;
  pausedAt: string | null;
  accumulatedPausedSeconds: number;
  status: SessionStatus;
  endedAt: string | null;
  outcome: SessionOutcome | null;
}

export interface TimerSnapshot {
  elapsedSeconds: number;
  remainingSeconds: number;
  overtimeSeconds: number;
  displaySeconds: number;
  level: TimerStateLevel;
  isRunning: boolean;
}
