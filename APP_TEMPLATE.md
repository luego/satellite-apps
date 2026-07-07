# APP.md — Satellite App Brief

> Copy this file into `apps/<app-slug>/APP.md`.
> Complete every required field before asking Codex to build the app.
> Root architecture and workspace rules live in `/AGENTS.md`.

---

## 1. Identity

- **App name:** `{{APP_NAME}}`
- **Workspace package:** `@satellite/{{APP_SLUG}}`
- **Android package:** `com.luegoland.{{APP_SLUG}}`
- **Version-one languages:** English and Spanish
- **Initial language behavior:** Automatic from phone settings, with English fallback
- **User override:** Automatic / English / Español
- **Supported platform:** Android
- **Target implementation time:** 1–2 focused development days

---

## 2. Product

- **One-sentence promise:** `{{ONE_SENTENCE_PROMISE}}`
- **Primary user:** `{{PRIMARY_USER}}`
- **Problem solved:** `{{PROBLEM}}`
- **Core action:** `{{CORE_ACTION}}`
- **Thirty-second value moment:** `{{VALUE_MOMENT}}`

### Required v1 workflow

1. `{{STEP_1}}`
2. `{{STEP_2}}`
3. `{{STEP_3}}`
4. `{{STEP_4}}`
5. `{{STEP_5}}`

### Explicitly out of scope

- Authentication
- Cloud sync
- AI features
- Social/community features
- Web dashboard
- `{{OTHER_OUT_OF_SCOPE_FEATURES}}`

---

## 3. Screens

Required screens:

- `{{SCREEN_1}}`
- `{{SCREEN_2}}`
- `{{SCREEN_3}}`
- Settings
- Paywall
- Privacy/About

Optional screen:

- `{{OPTIONAL_SCREEN}}`

---

## 4. Local Data

- **Simple settings:** `{{KV_SETTINGS}}`, language preference (`automatic`, `en`, or `es`)
- **SQLite entities:** `{{SQLITE_ENTITIES}}`
- **History retention for free users:** `{{FREE_HISTORY}}`
- **History retention for Plus users:** `{{PLUS_HISTORY}}`

No login or backend is required in v1.

---


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

- **App name translation behavior:** `{{APP_NAME_TRANSLATION_BEHAVIOR}}`
- **Important terminology notes:** `{{LOCALIZATION_TERMINOLOGY_NOTES}}`

All user-facing text, validation, errors, empty states, paywall copy, privacy copy, and notifications must be translated.

---

## 6. Monetization

### Free

- `{{FREE_FEATURE_1}}`
- `{{FREE_FEATURE_2}}`
- `{{FREE_LIMITS}}`
- Ads only at approved natural breaks

### Plus

- No ads
- `{{PLUS_FEATURE_1}}`
- `{{PLUS_FEATURE_2}}`
- `{{PLUS_FEATURE_3}}`

### Products

- Monthly Plus: `{{MONTHLY_PRODUCT_ID}}`
- Yearly Plus: `{{YEARLY_PRODUCT_ID}}`
- Lifetime ad-free: `{{LIFETIME_PRODUCT_ID}}`

Do not hard-code prices in purchase UI. Display localized prices returned by the store/RevenueCat.

---

## 7. Ads

- **Banner locations:** `{{BANNER_LOCATIONS}}`
- **Interstitial natural break:** `{{INTERSTITIAL_NATURAL_BREAK}}`
- **Rewarded unlock:** `{{REWARDED_UNLOCK_OR_NONE}}`

Never show an ad during the core active experience.

---

## 8. Native Capabilities

Mark only what v1 needs:

- [ ] Audio
- [ ] Landscape orientation
- [ ] Keep awake
- [ ] Local notifications
- [ ] Haptics
- [ ] File export
- [ ] Sharing

Notes:

`{{NATIVE_CAPABILITY_NOTES}}`

---

## 9. Branding and Assets

- **Primary visual direction:** `{{VISUAL_DIRECTION}}`
- **Free themes/backgrounds:** `{{FREE_THEMES}}`
- **Plus themes/backgrounds:** `{{PLUS_THEMES}}`
- **Audio pack:** `{{AUDIO_PACK_OR_NONE}}`

All assets must be original, public-domain, or correctly licensed. Record licensing in `assets/LICENSES.md`.

---

## 10. Shared Packages

Expected existing packages:

- `{{SHARED_PACKAGE_1_OR_NONE}}`
- `{{SHARED_PACKAGE_2_OR_NONE}}`
- `@satellite/i18n` for locale resolution, preference handling, and shared translation utilities

Potential future extraction:

- `{{POTENTIAL_SHARED_CAPABILITY_OR_NONE}}`

Do not create a new shared package unless root `AGENTS.md` extraction rules are satisfied.

---

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

- [ ] `{{ACCEPTANCE_CRITERION_1}}`
- [ ] `{{ACCEPTANCE_CRITERION_2}}`
- [ ] `{{ACCEPTANCE_CRITERION_3}}`

---

## 12. Store Positioning

- **Working title:** `{{STORE_TITLE}}`
- **Short description:** `{{SHORT_DESCRIPTION}}`
- **Primary keyword/theme:** `{{PRIMARY_KEYWORD}}`
- **Differentiator:** `{{DIFFERENTIATOR}}`

This section guides product copy only. Validate final Play Store metadata separately before release.
