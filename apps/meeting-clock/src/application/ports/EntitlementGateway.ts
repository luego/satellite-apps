export type PlusPurchaseOptionId = 'monthly' | 'yearly' | 'lifetime';

export interface PlusPurchaseOption {
  id: PlusPurchaseOptionId;
  priceLabel: string;
  productIdentifier: string;
  available: boolean;
}

export interface EntitlementGateway {
  initialize(): Promise<void>;
  isPlus(): Promise<boolean>;
  listPlusPurchaseOptions(): Promise<PlusPurchaseOption[]>;
  purchasePlus(optionId: PlusPurchaseOptionId): Promise<boolean>;
  setDevelopmentOverride(value: boolean): Promise<void>;
  restore(): Promise<boolean>;
}
