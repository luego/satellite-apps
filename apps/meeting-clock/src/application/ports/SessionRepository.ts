import type { MeetingTimerSession } from '../../domain/entities/MeetingTimer';

export interface SessionRepository {
  initialize(): Promise<void>;
  save(session: MeetingTimerSession): Promise<void>;
  listRecent(limit: number): Promise<MeetingTimerSession[]>;
  countCompleted(): Promise<number>;
  prune(limit: number): Promise<void>;
}
