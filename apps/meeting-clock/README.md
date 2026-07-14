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

The core timer works offline. Settings, language preference, mock Plus state, and session history are stored locally with Expo SQLite.

## Monetization Status

AdMob is wired for iOS development builds, with test ads enabled by default. RevenueCat is intentionally not configured yet; the app contains app-local development interfaces and mock adapters for Plus entitlements.

## Commands

Run from the repository root:

```bash
pnpm --filter @satellite/meeting-clock start
pnpm --filter @satellite/meeting-clock ios
pnpm --filter @satellite/meeting-clock typecheck
pnpm --filter @satellite/meeting-clock lint
pnpm --filter @satellite/meeting-clock test
pnpm --filter @satellite/meeting-clock exec expo-doctor
```
