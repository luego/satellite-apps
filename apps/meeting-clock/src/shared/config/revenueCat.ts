import { Platform } from 'react-native';

export const PLUS_ENTITLEMENT_ID = 'plus';

export const REVENUECAT_PRODUCT_IDS = {
  monthly: 'meetingclock_plus_monthly',
  yearly: 'meetingclock_plus_yearly',
  lifetime: 'meetingclock_lifetime_ad_free',
} as const;

export const revenueCatConfig = {
  enableMockPurchases: process.env.EXPO_PUBLIC_ENABLE_MOCK_PURCHASES !== 'false',
  iosApiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '',
  plusEntitlementId: process.env.EXPO_PUBLIC_REVENUECAT_PLUS_ENTITLEMENT_ID ?? PLUS_ENTITLEMENT_ID,
  offeringId: process.env.EXPO_PUBLIC_REVENUECAT_OFFERING_ID ?? '',
} as const;

export function canUseRevenueCat() {
  return Platform.OS === 'ios' && !revenueCatConfig.enableMockPurchases && Boolean(revenueCatConfig.iosApiKey);
}
