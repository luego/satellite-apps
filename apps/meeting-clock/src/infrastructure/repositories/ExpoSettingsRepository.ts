import { SQLiteStorage } from 'expo-sqlite/kv-store';

import type { SettingsRepository } from '../../application/ports/SettingsRepository';

export class ExpoSettingsRepository implements SettingsRepository {
  private readonly storage = new SQLiteStorage('meeting-clock-settings.db');

  async get<T>(key: string): Promise<T | null> {
    const value = await this.storage.getItemAsync(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.storage.setItemAsync(key, JSON.stringify(value));
  }
}
