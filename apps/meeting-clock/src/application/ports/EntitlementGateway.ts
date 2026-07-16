export type PlusPurchaseOptionId = 'monthly' | 'yearly' | 'lifetime';

export interface PlusPurchaseOption {
  id: PlusPurchaseOptionId;
  priceLabel: string;
  productIdentifier: string;
  available: boolean;
}

export interface PlusEntitlementStatus {
  isPlus: boolean;
  willRenew: boolean | null;
  expiresAt: string | null;
  unsubscribeDetectedAt: string | null;
  managementUrl: string | null;
}

export interface PlusStatusOptions {
  forceRefresh?: boolean;
}

export interface EntitlementGateway {
  initialize(): Promise<void>;
  isPlus(): Promise<boolean>;
  getPlusStatus(options?: PlusStatusOptions): Promise<PlusEntitlementStatus>;
  listPlusPurchaseOptions(): Promise<PlusPurchaseOption[]>;
  purchasePlus(optionId: PlusPurchaseOptionId): Promise<boolean>;
  setDevelopmentOverride(value: boolean): Promise<void>;
  restore(): Promise<boolean>;
}
