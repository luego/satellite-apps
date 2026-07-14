export interface InterstitialNaturalBreak {
  isPlus: boolean;
  completedSessionCount: number;
  now: Date;
}

export interface AdsGateway {
  initialize(): Promise<void>;
  canShowBanner(isPlus: boolean): Promise<boolean>;
  showInterstitialAtNaturalBreak(options: InterstitialNaturalBreak): Promise<boolean>;
}
