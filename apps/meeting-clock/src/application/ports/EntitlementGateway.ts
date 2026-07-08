export interface EntitlementGateway {
  isPlus(): Promise<boolean>;
  setDevelopmentOverride(value: boolean): Promise<void>;
  restore(): Promise<void>;
}
