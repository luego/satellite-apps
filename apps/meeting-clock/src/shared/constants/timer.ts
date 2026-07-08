import type { TimerMode } from '../../domain/entities/MeetingTimer';

export const PRESET_DURATIONS_SECONDS = [5, 10, 15, 20, 30, 60].map((minutes) => minutes * 60);

export interface TimerConfig {
  durationSeconds: number;
  mode: TimerMode;
  warningThresholdSeconds: number;
  criticalThresholdSeconds: number;
}

export const DEFAULT_TIMER_CONFIG: TimerConfig = {
  durationSeconds: 15 * 60,
  mode: 'countdown',
  warningThresholdSeconds: 5 * 60,
  criticalThresholdSeconds: 60,
};

export const FREE_HISTORY_LIMIT = 20;
export const PLUS_HISTORY_LIMIT = 200;
