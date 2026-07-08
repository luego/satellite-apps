import type { AdsGateway } from '../../application/ports/AdsGateway';

export class MockAdsGateway implements AdsGateway {
  async initialize(): Promise<void> {}

  async canShowBanner(isPlus: boolean): Promise<boolean> {
    return !isPlus;
  }

  async showInterstitialAtNaturalBreak(isPlus: boolean): Promise<boolean> {
    return !isPlus;
  }
}
