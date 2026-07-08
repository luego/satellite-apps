export interface AdsGateway {
  initialize(): Promise<void>;
  canShowBanner(isPlus: boolean): Promise<boolean>;
  showInterstitialAtNaturalBreak(isPlus: boolean): Promise<boolean>;
}
