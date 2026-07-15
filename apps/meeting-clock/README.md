# MeetingClock

MeetingClock turns an iPhone into a large landscape timer for meetings, workshops, classes, and presentations.

## Workspace

- Package: `@satellite/meeting-clock`
- Directory: `apps/meeting-clock`
- iOS bundle identifier: `com.luegodev.meetingclock`
- Expo SDK: `57`
- Platform for v1: iOS

## Core Flow

1. Pick a 5, 10, 15, 20, 30, or 60-minute preset, or enter a custom duration.
2. Choose countdown or count-up mode.
3. Adjust warning and critical thresholds.
4. Start the timer and use the large landscape session screen.
5. Complete or reset the session and keep a small local history.

## Local-First Behavior

The core timer works offline. Settings, language preference, Plus state, and session history are stored locally with Expo SQLite.

## Monetization Status

AdMob is wired for iOS development builds, with native ad placements on setup, history, and settings. Test ads are enabled by default for local development.

RevenueCat subscriptions are wired behind the app-local entitlement gateway. Local development uses mock purchases while `EXPO_PUBLIC_ENABLE_MOCK_PURCHASES=true`. To test real RevenueCat purchases, set `EXPO_PUBLIC_ENABLE_MOCK_PURCHASES=false`, add `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`, configure the `plus` entitlement and products in RevenueCat/App Store Connect, then rebuild the iOS development app.

## Commands

Run from the repository root:

```bash
pnpm --filter @satellite/meeting-clock ios:build
pnpm --filter @satellite/meeting-clock ios
pnpm --filter @satellite/meeting-clock ios:open
pnpm --filter @satellite/meeting-clock typecheck
pnpm --filter @satellite/meeting-clock lint
pnpm --filter @satellite/meeting-clock test
pnpm --filter @satellite/meeting-clock exec expo-doctor
```

Use `ios:build` after native dependency or app config changes, then use `ios` for normal local simulator sessions. If the app does not open automatically, keep `ios` running and use `ios:open` from another terminal.
