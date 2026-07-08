import * as SQLite from 'expo-sqlite';

import type { SessionRepository } from '../../application/ports/SessionRepository';
import type { MeetingTimerSession } from '../../domain/entities/MeetingTimer';

interface SessionRow {
  id: string;
  durationSeconds: number;
  mode: MeetingTimerSession['mode'];
  warningThresholdSeconds: number;
  criticalThresholdSeconds: number;
  startedAt: string;
  pausedAt: string | null;
  accumulatedPausedSeconds: number;
  status: MeetingTimerSession['status'];
  endedAt: string | null;
  outcome: MeetingTimerSession['outcome'];
}

export class SQLiteSessionRepository implements SessionRepository {
  private database: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    const db = await this.getDatabase();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY NOT NULL,
        durationSeconds INTEGER NOT NULL,
        mode TEXT NOT NULL,
        warningThresholdSeconds INTEGER NOT NULL,
        criticalThresholdSeconds INTEGER NOT NULL,
        startedAt TEXT NOT NULL,
        pausedAt TEXT,
        accumulatedPausedSeconds INTEGER NOT NULL,
        status TEXT NOT NULL,
        endedAt TEXT,
        outcome TEXT
      );
      CREATE INDEX IF NOT EXISTS sessions_endedAt_idx ON sessions (endedAt DESC);
    `);
  }

  async save(session: MeetingTimerSession): Promise<void> {
    const db = await this.getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO sessions (
        id,
        durationSeconds,
        mode,
        warningThresholdSeconds,
        criticalThresholdSeconds,
        startedAt,
        pausedAt,
        accumulatedPausedSeconds,
        status,
        endedAt,
        outcome
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      session.id,
      session.durationSeconds,
      session.mode,
      session.warningThresholdSeconds,
      session.criticalThresholdSeconds,
      session.startedAt,
      session.pausedAt,
      session.accumulatedPausedSeconds,
      session.status,
      session.endedAt,
      session.outcome,
    );
  }

  async listRecent(limit: number): Promise<MeetingTimerSession[]> {
    const db = await this.getDatabase();
    const rows = await db.getAllAsync<SessionRow>(
      'SELECT * FROM sessions ORDER BY COALESCE(endedAt, startedAt) DESC LIMIT ?',
      limit,
    );
    return rows.map((row) => ({ ...row }));
  }

  async countCompleted(): Promise<number> {
    const db = await this.getDatabase();
    const row = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM sessions WHERE outcome = ?',
      'completed',
    );
    return row?.count ?? 0;
  }

  async prune(limit: number): Promise<void> {
    const db = await this.getDatabase();
    await db.runAsync(
      `DELETE FROM sessions
       WHERE id NOT IN (
        SELECT id FROM sessions ORDER BY COALESCE(endedAt, startedAt) DESC LIMIT ?
       )`,
      limit,
    );
  }

  private async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.database) {
      this.database = await SQLite.openDatabaseAsync('meeting-clock.db');
    }
    return this.database;
  }
}
