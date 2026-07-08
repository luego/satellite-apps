import type { EntitlementGateway } from '../../application/ports/EntitlementGateway';
import type { SettingsRepository } from '../../application/ports/SettingsRepository';
import { STORAGE_KEYS } from '../../shared/constants/storageKeys';

export class MockEntitlementGateway implements EntitlementGateway {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async isPlus(): Promise<boolean> {
    return (await this.settingsRepository.get<boolean>(STORAGE_KEYS.mockPlus)) ?? false;
  }

  async setDevelopmentOverride(value: boolean): Promise<void> {
    await this.settingsRepository.set(STORAGE_KEYS.mockPlus, value);
  }

  async restore(): Promise<void> {}
}
