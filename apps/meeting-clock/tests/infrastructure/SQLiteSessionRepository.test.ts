import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MeetingTimerSession } from '../../src/domain/entities/MeetingTimer';
import { SQLiteSessionRepository } from '../../src/infrastructure/database/SQLiteSessionRepository';

interface SessionRecord {
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

type SQLValue = string | number | null;

const sqliteMock = vi.hoisted(() => {
  class FakeDatabase {
    private rows = new Map<string, SessionRecord>();

    async execAsync(_sql: string): Promise<void> {}

    async runAsync(sql: string, ...params: SQLValue[]): Promise<void> {
      if (sql.includes('INSERT OR REPLACE INTO sessions')) {
        const row: SessionRecord = {
          id: String(params[0]),
          durationSeconds: Number(params[1]),
          mode: params[2] as SessionRecord['mode'],
          warningThresholdSeconds: Number(params[3]),
          criticalThresholdSeconds: Number(params[4]),
          startedAt: String(params[5]),
          pausedAt: params[6] === null ? null : String(params[6]),
          accumulatedPausedSeconds: Number(params[7]),
          status: params[8] as SessionRecord['status'],
          endedAt: params[9] === null ? null : String(params[9]),
          outcome: params[10] as SessionRecord['outcome'],
        };
        this.rows.set(row.id, row);
        return;
      }

      if (sql.includes('DELETE FROM sessions')) {
        const keep = new Set(this.listRecentRows(Number(params[0])).map((row) => row.id));
        for (const id of this.rows.keys()) {
          if (!keep.has(id)) {
            this.rows.delete(id);
          }
        }
      }
    }

    async getAllAsync<T>(_sql: string, limit: number): Promise<T[]> {
      return this.listRecentRows(limit).map((row) => ({ ...row }) as T);
    }

    async getFirstAsync<T>(_sql: string, outcome: SessionRecord['outcome']): Promise<T | null> {
      const count = [...this.rows.values()].filter((row) => row.outcome === outcome).length;
      return { count } as T;
    }

    private listRecentRows(limit: number): SessionRecord[] {
      return [...this.rows.values()]
        .sort((a, b) => this.sortDate(b).localeCompare(this.sortDate(a)))
        .slice(0, limit);
    }

    private sortDate(row: SessionRecord): string {
      return row.endedAt ?? row.startedAt;
    }
  }

  const databases = new Map<string, FakeDatabase>();

  return {
    openDatabaseAsync: vi.fn(async (name: string) => {
      const existing = databases.get(name);
      if (existing) {
        return existing;
      }

      const database = new FakeDatabase();
      databases.set(name, database);
      return database;
    }),
    reset: () => databases.clear(),
  };
});

vi.mock('expo-sqlite', () => ({
  openDatabaseAsync: sqliteMock.openDatabaseAsync,
}));

const createSession = (
  id: string,
  endedAt: string,
  outcome: MeetingTimerSession['outcome'] = 'completed',
): MeetingTimerSession => ({
  id,
  durationSeconds: 900,
  mode: 'countdown',
  warningThresholdSeconds: 300,
  criticalThresholdSeconds: 60,
  startedAt: '2026-07-16T10:00:00.000Z',
  pausedAt: null,
  accumulatedPausedSeconds: 0,
  status: outcome ?? 'completed',
  endedAt,
  outcome,
});

describe('SQLiteSessionRepository', () => {
  beforeEach(() => {
    sqliteMock.reset();
  });

  it('loads saved sessions after a fresh repository instance', async () => {
    const savedSession = createSession('session-1', '2026-07-16T10:15:00.000Z');
    const firstRepository = new SQLiteSessionRepository();
    await firstRepository.initialize();
    await firstRepository.save(savedSession);

    const restoredRepository = new SQLiteSessionRepository();
    await restoredRepository.initialize();

    await expect(restoredRepository.listRecent(10)).resolves.toEqual([savedSession]);
    await expect(restoredRepository.countCompleted()).resolves.toBe(1);
  });

  it('lists the newest sessions first and prunes older rows by history limit', async () => {
    const repository = new SQLiteSessionRepository();
    await repository.initialize();
    await repository.save(createSession('old', '2026-07-16T10:15:00.000Z'));
    await repository.save(createSession('newest', '2026-07-16T12:15:00.000Z', 'reset'));
    await repository.save(createSession('middle', '2026-07-16T11:15:00.000Z'));

    await repository.prune(2);

    const restoredRepository = new SQLiteSessionRepository();
    await restoredRepository.initialize();
    const restored = await restoredRepository.listRecent(10);

    expect(restored.map((session) => session.id)).toEqual(['newest', 'middle']);
    await expect(restoredRepository.countCompleted()).resolves.toBe(1);
  });
});
