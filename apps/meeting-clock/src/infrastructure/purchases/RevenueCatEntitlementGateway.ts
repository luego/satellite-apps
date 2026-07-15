import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';

import type {
  EntitlementGateway,
  PlusPurchaseOption,
  PlusPurchaseOptionId,
} from '../../application/ports/EntitlementGateway';
import {
  REVENUECAT_PRODUCT_IDS,
  revenueCatConfig,
} from '../../shared/config/revenueCat';

type PurchasesModule = typeof import('react-native-purchases');
type PurchasesClass = PurchasesModule['default'];

export class RevenueCatEntitlementGateway implements EntitlementGateway {
  private purchases: PurchasesClass | null = null;
  private configured = false;

  constructor(
    private readonly apiKey: string,
    private readonly plusEntitlementId: string,
    private readonly offeringId: string,
  ) {}

  async initialize(): Promise<void> {
    if (this.configured || Platform.OS !== 'ios' || !this.apiKey) {
      return;
    }

    const module = await import('react-native-purchases');
    const Purchases = module.default;
    await Purchases.setLogLevel(module.LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey: this.apiKey });
    this.purchases = Purchases;
    this.configured = true;
  }

  async isPlus(): Promise<boolean> {
    const customerInfo = await this.getCustomerInfo();
    return Boolean(customerInfo?.entitlements.active[this.plusEntitlementId]);
  }

  async listPlusPurchaseOptions(): Promise<PlusPurchaseOption[]> {
    const offering = await this.getOffering();

    return (['monthly', 'yearly', 'lifetime'] as const).map((id) => {
      const packageToPurchase = this.findPackage(offering, id);

      return {
        id,
        priceLabel: packageToPurchase?.product.priceString ?? '',
        productIdentifier: REVENUECAT_PRODUCT_IDS[id],
        available: Boolean(packageToPurchase),
      };
    });
  }

  async purchasePlus(optionId: PlusPurchaseOptionId): Promise<boolean> {
    const Purchases = await this.requirePurchases();
    const offering = await this.getOffering();
    const packageToPurchase = this.findPackage(offering, optionId);

    if (!packageToPurchase) {
      return false;
    }

    try {
      const result = await Purchases.purchasePackage(packageToPurchase);
      return Boolean(result.customerInfo.entitlements.active[this.plusEntitlementId]);
    } catch (error) {
      if (this.isPurchaseCancelled(error)) {
        return false;
      }

      throw error;
    }
  }

  async setDevelopmentOverride(_value: boolean): Promise<void> {}

  async restore(): Promise<boolean> {
    const Purchases = await this.requirePurchases();
    const customerInfo = await Purchases.restorePurchases();
    return Boolean(customerInfo.entitlements.active[this.plusEntitlementId]);
  }

  private async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      const Purchases = await this.requirePurchases();
      return Purchases.getCustomerInfo();
    } catch {
      return null;
    }
  }

  private async getOffering(): Promise<PurchasesOffering | null> {
    try {
      const Purchases = await this.requirePurchases();
      const offerings = await Purchases.getOfferings();

      if (this.offeringId) {
        return offerings.all[this.offeringId] ?? offerings.current;
      }

      return offerings.current;
    } catch {
      return null;
    }
  }

  private findPackage(
    offering: PurchasesOffering | null,
    optionId: PlusPurchaseOptionId,
  ): PurchasesPackage | null {
    if (!offering) {
      return null;
    }

    const byPackageType = optionId === 'monthly'
      ? offering.monthly
      : optionId === 'yearly'
        ? offering.annual
        : offering.lifetime;

    if (byPackageType) {
      return byPackageType;
    }

    const productId = REVENUECAT_PRODUCT_IDS[optionId];
    return offering.availablePackages.find((pack) => pack.product.identifier === productId) ?? null;
  }

  private async requirePurchases(): Promise<PurchasesClass> {
    await this.initialize();

    if (!this.purchases) {
      throw new Error('RevenueCat is not configured for this build.');
    }

    return this.purchases;
  }

  private isPurchaseCancelled(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '1'
    );
  }
}

export function createRevenueCatEntitlementGateway() {
  return new RevenueCatEntitlementGateway(
    revenueCatConfig.iosApiKey,
    revenueCatConfig.plusEntitlementId,
    revenueCatConfig.offeringId,
  );
}
