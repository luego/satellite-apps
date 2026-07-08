# APP.md — MeetingClock

## 1. Identity

- **App name:** `MeetingClock`
- **Workspace package:** `@satellite/meeting-clock`
- **Android package:** `com.luegodev.meetingclock`
- **Version-one languages:** English and Spanish
- **Initial language behavior:** Automatic from phone settings, with English fallback
- **User override:** Automatic / English / Español
- **Supported platform:** Android
- **Target implementation time:** 1–2 focused development days

## 2. Product

- **One-sentence promise:** MeetingClock turns an Android phone into a large, readable landscape timer for meetings and presentations.
- **Primary user:** Facilitators, presenters, teachers, coaches, and meeting hosts who need visible timing without a laptop setup.
- **Problem solved:** People lose time awareness in meetings and talks when the timer is tiny, distracting, or buried in another device.
- **Core action:** Choose a duration, start the timer, and read the remaining or overtime time from across the room.
- **Thirty-second value moment:** A new user can pick a preset, tap Start, rotate the phone, and see a large color-coded timer.

### Required v1 workflow

1. Select a timer duration from presets or a custom value.
2. Optionally configure warning and critical thresholds.
3. Start the countdown or optional count-up session.
4. Use the large landscape session screen with pause, resume, reset, complete, warning, critical, and overtime states.
5. Save a small local session history after completion or reset.

### Explicitly out of scope

- Authentication
- Cloud sync
- AI features
- Social/community features
- Web dashboard
- Real ads, real purchases, remote analytics, shared rooms, speaker queues, and cloud backups

## 3. Screens

Required screens:

- Timer setup
- Landscape session
- History
- Settings
- Paywall
- Privacy/About

Optional screen:

- None for v1

## 4. Local Data

- **Simple settings:** warning threshold, critical threshold, count direction, theme, mock Plus override, language preference (`automatic`, `en`, or `es`)
- **SQLite entities:** completed or reset timer sessions
- **History retention for free users:** latest 20 sessions
- **History retention for Plus users:** latest 200 sessions

No login or backend is required in v1.

## 5. Localization

Both English and Spanish are required.

### Automatic behavior

- Spanish phone locale (`es-*`) → Spanish
- English phone locale (`en-*`) → English
- Unsupported phone locale → English fallback

### Settings override

The Settings screen must offer:

- Automatic
- English
- Español

The selected preference must apply immediately and persist locally.

### Dictionaries

App-specific translations live in:

```text
src/localization/
  en.ts
  es.ts
  index.ts
```

- **App name translation behavior:** MeetingClock remains untranslated.
- **Important terminology notes:** Use “warning”/“advertencia” for the first threshold, “critical”/“crítico” for the final threshold, and “overtime”/“tiempo extra” for time past zero.

All user-facing text, validation, errors, empty states, paywall copy, privacy copy, and notifications must be translated.

## 6. Monetization

### Free

- Standard timer with presets and custom duration
- Basic themes
- Limited saved presets and recent history
- Ads only outside the active timer

### Plus

- No ads
- Unlimited presets
- Additional themes
- Additional warning customization and extended history

### Products

- Monthly Plus: `meetingclock_plus_monthly`
- Yearly Plus: `meetingclock_plus_yearly`
- Lifetime ad-free: `meetingclock_lifetime_ad_free`

Do not hard-code prices in purchase UI. Display localized prices returned by the store/RevenueCat.

## 7. Ads

- **Banner locations:** Timer setup, history, settings, and paywall only
- **Interstitial natural break:** After a completed session, never during an active timer
- **Rewarded unlock:** None for v1

Never show an ad during the core active experience.

## 8. Native Capabilities

Mark only what v1 needs:

- [x] Audio
- [x] Landscape orientation
- [x] Keep awake
- [ ] Local notifications
- [ ] Haptics
- [ ] File export
- [ ] Sharing

Notes:

The active session screen should prefer landscape orientation and keep the screen awake while a session is active. Restore normal orientation behavior after leaving the active session.
Play a short, non-looping bell once when a countdown session reaches zero. Do not repeat it during overtime.

## 9. Branding and Assets

- **Primary visual direction:** High-contrast, calm presentation timer with large typography and clear state colors.
- **Free themes/backgrounds:** Light, dark, and high-contrast basic timer themes.
- **Plus themes/backgrounds:** Additional presentation-friendly themes for future release.
- **Audio pack:** One bundled end-of-session bell for countdown completion.

All assets must be original, public-domain, or correctly licensed. Record licensing in `assets/LICENSES.md`.

## 10. Shared Packages

Expected existing packages:

- None yet. Keep MeetingClock-specific behavior inside the app until another app needs the same stable capability.

Potential future extraction:

- Deterministic timer engine, locale resolution helpers, ad frequency policy, entitlement mock helpers, and shared timer display primitives.

Do not create a new shared package unless root `AGENTS.md` extraction rules are satisfied.

## 11. Acceptance Criteria

The MVP is complete when:

- [ ] A new user reaches the core action in under 30 seconds.
- [ ] English and Spanish dictionaries are complete and have matching keys.
- [ ] Automatic language follows the phone locale with English fallback.
- [ ] The user can select Automatic, English, or Español in Settings.
- [ ] The selected language applies immediately and persists after restart.
- [ ] The complete free workflow works offline.
- [ ] State survives an app restart where appropriate.
- [ ] History is saved where required.
- [ ] Empty and error states exist.
- [ ] Free limits work.
- [ ] Mock Plus removes ads and unlocks Plus features.
- [ ] Ads never interrupt the active experience.
- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Tests pass.
- [ ] Expo Doctor passes.
- [ ] README and `.env.example` are current.

App-specific acceptance criteria:

- [ ] Presets include 5, 10, 15, 20, 30, and 60 minutes plus a custom duration.
- [ ] Countdown, count-up, warning, critical, and overtime states are calculated from timestamps.
- [ ] The session screen supports pause, resume, reset, complete, landscape orientation, and keep awake.

## 12. Store Positioning

- **Working title:** MeetingClock
- **Short description:** A large landscape timer for meetings, workshops, and presentations.
- **Primary keyword/theme:** meeting timer
- **Differentiator:** Fast offline setup with room-readable warning, critical, and overtime states.

This section guides product copy only. Validate final Play Store metadata separately before release.
