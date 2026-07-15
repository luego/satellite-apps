import type {
  EntitlementGateway,
  PlusPurchaseOption,
  PlusPurchaseOptionId,
} from '../../application/ports/EntitlementGateway';
import type { SettingsRepository } from '../../application/ports/SettingsRepository';
import { STORAGE_KEYS } from '../../shared/constants/storageKeys';
import { REVENUECAT_PRODUCT_IDS } from '../../shared/config/revenueCat';

export class MockEntitlementGateway implements EntitlementGateway {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async initialize(): Promise<void> {}

  async isPlus(): Promise<boolean> {
    return (await this.settingsRepository.get<boolean>(STORAGE_KEYS.mockPlus)) ?? false;
  }

  async listPlusPurchaseOptions(): Promise<PlusPurchaseOption[]> {
    return [
      {
        id: 'monthly',
        priceLabel: '$0.00',
        productIdentifier: REVENUECAT_PRODUCT_IDS.monthly,
        available: true,
      },
      {
        id: 'yearly',
        priceLabel: '$0.00',
        productIdentifier: REVENUECAT_PRODUCT_IDS.yearly,
        available: true,
      },
      {
        id: 'lifetime',
        priceLabel: '$0.00',
        productIdentifier: REVENUECAT_PRODUCT_IDS.lifetime,
        available: true,
      },
    ];
  }

  async purchasePlus(_optionId: PlusPurchaseOptionId): Promise<boolean> {
    await this.setDevelopmentOverride(true);
    return true;
  }

  async setDevelopmentOverride(value: boolean): Promise<void> {
    await this.settingsRepository.set(STORAGE_KEYS.mockPlus, value);
  }

  async restore(): Promise<boolean> {
    return this.isPlus();
  }
}
