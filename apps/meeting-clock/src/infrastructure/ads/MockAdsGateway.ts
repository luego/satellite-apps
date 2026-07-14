import type { AdsGateway, InterstitialNaturalBreak } from '../../application/ports/AdsGateway';

export class MockAdsGateway implements AdsGateway {
  async initialize(): Promise<void> {}

  async canShowBanner(isPlus: boolean): Promise<boolean> {
    return !isPlus;
  }

  async showInterstitialAtNaturalBreak({ isPlus }: InterstitialNaturalBreak): Promise<boolean> {
    return !isPlus;
  }
}
