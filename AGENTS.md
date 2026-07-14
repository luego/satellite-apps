# AGENTS.md — Expo Satellite Apps Monorepo

> Place this file once at the root of the repository.
> Each application must also contain its own `APP.md`, created from `APP_TEMPLATE.md`.
> Codex must read this root file and the target app's `APP.md` before making changes.

---

## 1. Purpose

This repository contains multiple small, iOS-first Expo applications.

The goals are:

- Release useful apps quickly.
- Reuse stable code safely.
- Keep every app independently buildable and publishable.
- Avoid backend and infrastructure costs in v1.
- Maintain clean, pragmatic hexagonal boundaries.
- Monetize with respectful ads and optional Plus/lifetime purchases.
- Build a portfolio without turning one-day apps into enterprise projects.
- Support English and Spanish in every app from the first release.

### Product rule

A new user must reach the app's core value in fewer than 30 seconds.

Unless `APP.md` explicitly requires otherwise, do not add:

- Authentication
- Firebase
- Cloud sync
- AI APIs
- Chat
- Community features
- A web dashboard
- A custom backend

The core feature must continue working without internet access.

---

## 2. Source-of-Truth Documentation

Before changing dependencies, Expo configuration, native modules, builds, ads, or purchases, consult the latest official/version-matched documentation.

- Expo: https://docs.expo.dev/
- Expo monorepos: https://docs.expo.dev/guides/monorepos/
- EAS monorepo builds: https://docs.expo.dev/build-reference/build-with-monorepos/
- Expo Router: https://docs.expo.dev/router/introduction/
- EAS Build: https://docs.expo.dev/build/introduction/
- Expo Audio: https://docs.expo.dev/versions/latest/sdk/audio/
- Expo SQLite: https://docs.expo.dev/versions/latest/sdk/sqlite/
- Expo Screen Orientation: https://docs.expo.dev/versions/latest/sdk/screen-orientation/
- Expo Keep Awake: https://docs.expo.dev/versions/latest/sdk/keep-awake/
- Expo Localization: https://docs.expo.dev/versions/latest/sdk/localization/
- pnpm workspaces: https://pnpm.io/workspaces
- Google Mobile Ads iOS: https://developers.google.com/admob/ios/quick-start
- React Native Google Mobile Ads: https://docs.page/invertase/react-native-google-mobile-ads
- RevenueCat Expo: https://www.revenuecat.com/docs/getting-started/installation/expo
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/

Rules:

1. Never guess package versions.
2. Confirm the target app's Expo SDK before installing dependencies.
3. Use `pnpm --filter <app-package> exec expo install <package>` for Expo-compatible dependencies.
4. Use the Expo documentation matching the target app's installed SDK.
5. Do not add custom Metro monorepo configuration unless the installed Expo version and official documentation require it.
6. Ads and real purchases require a development build; do not assume Expo Go can run native monetization modules.
7. Use only Google test ad IDs in development.
8. Never load production ads in automated tests, emulators used for development, or debug builds.
9. Run EAS commands from the target application's directory, not the repository root.
10. Never claim a command or build passed unless it was actually executed successfully.

---

## 3. Workspace Strategy

Use a plain **pnpm workspace**.

Do not add Nx, Turborepo, Lerna, or another task orchestrator unless repository scale creates a demonstrated need.

The expected repository layout is:

```text
satellite-apps/
  AGENTS.md
  APP_TEMPLATE.md
  README.md
  package.json
  pnpm-workspace.yaml
  pnpm-lock.yaml
  tsconfig.base.json
  .gitignore
  .npmrc                    # only when required; do not add unnecessary pnpm options

  apps/
    meeting-clock/
      APP.md
      README.md
      package.json
      app.config.ts
      eas.json
      .env.example
      app/
      src/
      assets/
      tests/

    focus-frame/
      APP.md
      README.md
      package.json
      app.config.ts
      eas.json
      .env.example
      app/
      src/
      assets/
      tests/

  packages/
    timer/
      package.json
      src/
      tests/

    ui/
      package.json
      src/
      tests/

    monetization/
      package.json
      src/
      tests/

    storage/
      package.json
      src/
      tests/

    audio/
      package.json
      src/
      tests/

    i18n/
      package.json
      src/
      tests/

    config/
      package.json
      eslint/
      typescript/

    testing/
      package.json
      src/
```

Not every shared package must exist on day one. Create a package only after shared code has a clear consumer.

### Required `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Root package rules

The root `package.json` must:

- Be private.
- Pin the chosen pnpm version with `packageManager`.
- Contain repository-wide scripts.
- Avoid depending on Expo, React, or React Native as runtime dependencies.
- Avoid hiding app-specific dependencies at the workspace root.

Example:

```json
{
  "name": "satellite-apps",
  "private": true,
  "packageManager": "pnpm@<PINNED_PNPM_VERSION>",
  "scripts": {
    "typecheck": "pnpm -r --if-present typecheck",
    "lint": "pnpm -r --if-present lint",
    "test": "pnpm -r --if-present test",
    "check": "pnpm run typecheck && pnpm run lint && pnpm run test"
  }
}
```

Replace `<PINNED_PNPM_VERSION>` with the stable version installed for the repository. Do not invent it.

---

## 4. Application Ownership

Every application is an independent Expo product.

Each app owns:

- Its Expo SDK and app dependencies
- Navigation and routes
- Product-specific domain logic
- SQLite schema and migrations
- Branding, icons, splash screen, backgrounds, and sounds
- iOS bundle identifier
- App Store metadata
- AdMob app and unit IDs
- RevenueCat public SDK key, offering, and product mapping
- Privacy copy and data-safety declarations
- English and Spanish translation dictionaries for product-specific copy
- `app.config.ts`
- `eas.json`
- `.env.example`
- `APP.md`
- Release notes and versioning

An app must not import source code directly from another app.

Forbidden:

```ts
import { Something } from "../../meeting-clock/src/...";
```

Required:

```ts
import { TimerEngine } from "@satellite/timer";
```

If code is truly reusable, move it into a shared workspace package first.

---

## 5. Shared Package Boundaries

Share stable capabilities, not whole app features.

### Good candidates for sharing

- Deterministic timer calculations
- Pause/resume/session state machines
- Generic duration value objects
- Generic SQLite key-value adapters
- Ad frequency policy
- Monetization ports and mock adapters
- Entitlement state helpers
- Reusable paywall primitives
- Theme primitives and design tokens
- Buttons, dialogs, screen containers, and empty states
- Landscape session shell
- Audio playback interfaces and generic Expo adapter
- Common ESLint and TypeScript configuration
- Locale types, language preference handling, translation helpers, and localized formatting utilities
- Test fixtures and fake clocks

### Keep app-specific

- Screen composition
- App navigation
- Product copy
- App-specific entities and use cases
- SQLite tables unique to one app
- App-specific paywall text
- Ad placement decisions unique to one experience
- Product IDs and ad unit IDs
- Assets and licensing files
- App-specific English and Spanish translation dictionaries and product wording
- Business rules that only one app uses

### Extraction rule

Do not create a shared abstraction because code looks similar once.

Promote code into `packages/` when:

1. At least two apps need the same behavior.
2. The behavior has a stable, understandable API.
3. The package can be tested independently.
4. Moving it does not force app-specific options into a giant configuration object.

Small duplication is preferable to a premature shared framework.

### Shared package naming

Use the `@satellite/*` scope:

```text
@satellite/timer
@satellite/ui
@satellite/monetization
@satellite/storage
@satellite/audio
@satellite/i18n
@satellite/config
@satellite/testing
```

Apps should also use scoped names:

```text
@satellite/meeting-clock
@satellite/focus-frame
@satellite/daily-three
```

Use `workspace:*` for internal dependencies:

```json
{
  "dependencies": {
    "@satellite/timer": "workspace:*",
    "@satellite/ui": "workspace:*"
  }
}
```

---

## 6. Dependency Rules in a pnpm Monorepo

pnpm's strict dependency isolation is a feature. Do not work around it by relying on undeclared transitive dependencies.

Rules:

1. Every workspace must declare every package it imports.
2. Each Expo app declares its own Expo, React, React Native, and native module dependencies.
3. Shared packages that import React or React Native declare them as peer dependencies.
4. Shared packages that wrap an Expo/native module declare that module as a peer dependency unless official guidance requires another arrangement.
   For example, `@satellite/i18n` may declare `expo-localization` as a peer dependency while each app declares the compatible Expo package directly.
5. Keep a single compatible version of React, React Native, and each native module across apps when practical.
6. Do not add duplicate native dependencies to shared packages as normal runtime dependencies.
7. Do not use relative imports across workspace boundaries.
8. Do not edit `pnpm-lock.yaml` manually.
9. Commit the root `pnpm-lock.yaml`.
10. Do not create per-app lockfiles.
11. Add dependencies from the repository root with a filter, or from the target workspace directory.
12. Use `pnpm why <package>` and Expo dependency checks when investigating duplicates.
13. Do not set `node-linker=hoisted` or other pnpm compatibility options unless a real incompatibility is confirmed and documented.

Example shared UI package:

```json
{
  "name": "@satellite/ui",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "peerDependencies": {
    "react": "*",
    "react-native": "*"
  }
}
```

Prefer exporting TypeScript source directly for small internal packages unless a build step becomes necessary.

Each package must expose a deliberate public API through `src/index.ts`. Apps must not deep-import package internals.

Allowed:

```ts
import { PrimaryButton } from "@satellite/ui";
```

Forbidden:

```ts
import { PrimaryButton } from "@satellite/ui/src/components/PrimaryButton";
```

---

## 7. Pragmatic Hexagonal Architecture

Use hexagonal boundaries without turning a one-day app into an enterprise framework.

### Per-app structure

```text
apps/<app-name>/
  app/
    _layout.tsx
    index.tsx
    session.tsx
    history.tsx
    settings.tsx
    paywall.tsx

  src/
    domain/
      entities/
      value-objects/
      services/
      errors/

    application/
      ports/
      use-cases/
      dto/

    infrastructure/
      database/
      repositories/
      ads/
      purchases/
      audio/
      notifications/
      clock/

    presentation/
      components/
      hooks/
      view-models/
      theme/

    shared/
      config/
      constants/
      utils/
      types/

    bootstrap/
      container.ts

  assets/
    audio/
    images/
    icons/
    LICENSES.md

  tests/
    domain/
    application/
    infrastructure/
```

### Shared package structure

A shared package should be smaller and capability-focused:

```text
packages/timer/
  package.json
  src/
    domain/
    application/
    infrastructure/        # only when the package owns a generic adapter
    index.ts
  tests/
```

### Dependency direction

```text
presentation -> application -> domain
infrastructure -> application/domain ports
app routes -> presentation
bootstrap -> wires implementations to ports
apps -> shared packages
shared packages -X-> apps
```

A shared package must never import an app.

The domain layer must not import:

- React
- React Native
- Expo
- SQLite
- AdMob
- RevenueCat
- Navigation libraries
- Another app

### Route rule

Files inside an app's `app/` directory are thin route components. They may:

- Read route parameters
- Select a view model or hook
- Render a screen component
- Configure screen options

They must not contain:

- Business rules
- SQL
- Ad frequency logic
- Purchase logic
- Timer calculations
- Cross-app imports

---

## 8. Common Ports

Create only the ports needed by the target app.

```ts
export interface SessionRepository {
  save(session: Session): Promise<void>;
  listRecent(limit: number): Promise<Session[]>;
  countCompleted(): Promise<number>;
}

export interface SettingsRepository {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
}

export interface EntitlementGateway {
  isPlus(): Promise<boolean>;
  purchaseMonthly(): Promise<void>;
  purchaseYearly(): Promise<void>;
  purchaseLifetimeAdFree(): Promise<void>;
  restore(): Promise<void>;
}

export interface AdsGateway {
  initialize(): Promise<void>;
  showInterstitialAtNaturalBreak(): Promise<boolean>;
  canShowInterstitial(): Promise<boolean>;
}

export interface AudioGateway {
  load(trackId: string): Promise<void>;
  play(options?: { loop?: boolean }): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  setVolume(value: number): Promise<void>;
}

export interface Clock {
  now(): Date;
}
```

The app may define these ports locally first. Move them to a shared package only after multiple apps need the same contract.

---

## 9. Timer Rules

Timers must be deterministic and resilient to app state changes.

Do not use a decremented number as the source of truth.

Persist or retain:

- `startedAt`
- `durationSeconds`
- `pausedAt`
- `accumulatedPausedSeconds`
- `status`

Calculate remaining time from timestamps. UI intervals only trigger re-rendering; they do not own elapsed time.

Useful pure concepts include:

- `Duration`
- `SessionStatus`
- `TimerSnapshot`
- `calculateRemainingSeconds`
- `pauseSession`
- `resumeSession`
- `completeSession`

The generic, pure timer engine belongs in `@satellite/timer` after at least two apps use it. App-specific session meanings remain in each app.

Use a fake `Clock` in tests.

---

## 10. Local Data

Prefer local-first storage.

### Use `expo-sqlite/kv-store` for

- Theme
- Sound selection
- Volume
- Onboarding completion
- Ad frequency counters
- Last interstitial timestamp
- Development entitlement override
- Language preference: `automatic`, `en`, or `es`

### Use SQLite tables for

- Sessions
- Tasks
- Routines
- Books
- Presets
- History

Database rules:

1. Each app owns its database and migrations.
2. Do not create one database shared by all installed apps.
3. Keep migrations in numbered files.
4. Never silently destroy user data to fix a schema.
5. Keep SQL inside infrastructure repositories.
6. Map rows to domain entities.
7. Add indexes only where queries need them.
8. Use transactions for multi-step writes.
9. A shared storage package may provide generic helpers, but not a universal schema containing every app's tables.

---

## 11. Ads

Ads must never interrupt the core active experience.

### Allowed placements

- Adaptive banner on setup, history, or settings screens
- Interstitial after a completed session or another natural break
- Rewarded ad initiated by the user to temporarily unlock a theme or sound pack

### Forbidden placements

- When the user taps Start
- While a timer/session is active
- During onboarding
- During purchase or restore
- Immediately after app launch
- On every navigation
- Anywhere likely to cause accidental clicks

### Default frequency cap

- No interstitial in the first two completed sessions
- At most one interstitial every three completed sessions
- At least ten minutes between interstitials
- Never show an interstitial to Plus or lifetime-ad-free users

Put generic frequency logic in a testable `AdFrequencyPolicy`. It may live in `@satellite/monetization` once reused.

Each app decides which events are legitimate natural breaks.

Before initializing ads:

1. Resolve consent requirements.
2. Configure request flags.
3. Use test IDs in non-production builds.
4. Initialize the SDK once per app.
5. Fail silently if ads cannot load; the app must still work.
6. Keep AdMob identifiers in the target app's configuration, never in a shared package.

---

## 12. Purchases and Entitlements

Use one logical entitlement named `plus` unless `APP.md` documents another requirement.

Suggested products per app:

- `plus_monthly`
- `plus_yearly`
- `lifetime_ad_free`

Product identifiers may need an app-specific prefix to avoid operational confusion. Document the exact mapping in the app's README.

Plus should provide sustained value:

- No ads
- Premium themes
- Premium sound packs
- Unlimited presets
- Extended local history
- Export when supported

Do not describe a subscription as only “remove ads.”

Requirements:

- Show localized store prices from RevenueCat.
- Include Restore Purchases.
- Include Manage Subscription.
- Cache entitlement state and refresh it at launch and after purchases.
- Keep the free core functional when RevenueCat is unavailable.
- Never lock previously created user data behind a paywall.
- Provide a development mock adapter behind an environment flag.
- Keep RevenueCat keys and offering configuration app-specific.
- Shared monetization code may contain ports, state helpers, mock adapters, frequency policies, and reusable UI—not app-specific product IDs.

---

## 13. Audio and Assets

For audio apps:

- Use original, commissioned, public-domain, or correctly licensed royalty-free audio.
- Store source, author, license, and proof in the app's `assets/LICENSES.md`.
- Do not include commercial songs.
- Do not scrape streaming services.
- Bundle only a small starter pack.
- Loop tracks cleanly.
- Stop or pause audio when the session ends according to settings.
- Handle headphones or Bluetooth disconnection gracefully.

For images:

- Optimize images before bundling.
- Prefer efficient formats supported by the workflow.
- Add required attribution to `assets/LICENSES.md`.
- Do not fetch large remote backgrounds in v1.

Assets are app-owned by default. Do not create a giant shared asset package unless multiple apps intentionally share the same licensed asset set and the licensing permits that use.

---

## 14. UI and Accessibility

Design for speed and clarity.

- One primary action per screen
- Minimum 44x44 touch targets
- Respect system font scaling
- Do not communicate status only with color
- Add accessibility labels to icon-only controls
- Support small iPhone screens
- Support dark mode when it does not double implementation time
- Keep active timer/session screens visually quiet
- Prevent screen sleep only while required
- Restore previous orientation after leaving a landscape-only screen

Required states:

- Loading
- Empty
- Error
- Offline or unavailable-service fallback where applicable
- Free
- Plus
- Ad failed to load
- Purchase pending, cancelled, and failed

The shared UI package may contain primitives and design tokens. Each app still owns its visual identity and screen composition.

---


## 15. Localization: English and Spanish

Every app must support both English and Spanish in its first release.

### Required behavior

- On first launch, select the language automatically from the phone's locale.
- Use Spanish when the resolved device language starts with `es`.
- Use English when the resolved device language starts with `en`.
- Fall back to English for unsupported device languages.
- Provide a Settings option with exactly these choices:
  - Automatic
  - English
  - Español
- Persist the user's selection locally.
- When `Automatic` is selected, continue resolving from the current phone settings on future launches.
- When the user explicitly selects English or Spanish, that choice overrides the phone language.
- Apply language changes immediately without requiring an app restart.
- Preserve the language preference across app restarts and upgrades.

### Architecture

Use `expo-localization` to read device locales.

A reusable `@satellite/i18n` package may provide:

- `SupportedLocale = "en" | "es"`
- `LanguagePreference = "automatic" | SupportedLocale`
- Locale resolution
- Translation provider and hooks
- Typed translation-key helpers
- Interpolation and simple pluralization helpers
- Localized date, time, number, and currency formatting
- A mock locale source for tests

Each app owns its product-specific dictionaries:

```text
apps/<app-name>/src/localization/
  en.ts
  es.ts
  index.ts
```

The shared package must not contain product-specific text from individual apps.

### Translation rules

- Do not hard-code user-facing text in route files, screens, components, dialogs, validation messages, notifications, ads-related explanations, paywalls, privacy screens, or error states.
- Keep translation keys stable and semantic.
- English and Spanish dictionaries must contain the same keys.
- Add a test or type-level check that fails when one locale is missing a key.
- Do not construct sentences by concatenating translated fragments.
- Use interpolation for dynamic values.
- Use locale-aware formatting through `Intl` or a small shared formatter.
- Do not manually format dates as fixed US or Latin American strings.
- Keep brand names and product names untranslated unless the app brief explicitly requires localized names.
- App Store listing translations remain app-specific release work.

### Suggested port

```ts
export interface LocaleSource {
  getDeviceLanguageCodes(): readonly string[];
}

export interface LanguagePreferenceRepository {
  get(): Promise<"automatic" | "en" | "es">;
  set(value: "automatic" | "en" | "es"): Promise<void>;
}
```

The domain layer should not import `expo-localization`. Resolve the native locale through an infrastructure adapter.

### Tests

At minimum, test:

- Spanish device locale resolves to Spanish in Automatic mode.
- English device locale resolves to English in Automatic mode.
- Unsupported device locale falls back to English.
- Explicit English overrides a Spanish phone.
- Explicit Spanish overrides an English phone.
- All English and Spanish translation keys match.
- The saved preference is restored.
- Dates and numbers use the selected locale.

---

## 16. Privacy

Keep data on-device in v1.

Every app must include a Privacy screen that states:

- What is stored locally
- Whether analytics are used
- Whether ads are shown
- That ad providers may process device/ad-related data
- How to contact the developer
- How to manage purchases

Do not request permissions that are unnecessary for the core feature.

Privacy and App Store Connect declarations are app-specific, even when SDK wrappers are shared.

---

## 17. Testing Strategy

Focus tests on code that can break revenue or the core experience.

### Shared package tests

- Timer calculations
- Pause/resume state transitions
- Ad frequency policy
- Generic entitlement rules
- Generic data mapping
- Shared UI behavior where valuable

### App tests

- Product-specific use cases
- Free limits
- App-specific reminder calculations
- SQLite repositories and migrations
- Screen/view-model behavior for the core flow
- Ad natural-break decisions
- Product-to-entitlement mapping

### Manual release checklist per app

- Fresh install
- Upgrade from previous version
- Core flow from start to completion
- Background and foreground behavior
- Rotation into and out of landscape
- Audio interruption when applicable
- Free limits
- Test subscription purchase
- Restore purchase
- No ads for Plus/lifetime users
- Airplane mode
- Small iPhone screen
- iOS navigation/back behavior

When a shared package changes, run its tests and the checks for every app that consumes it.

---

## 18. Code Quality

- TypeScript strict mode is mandatory.
- Avoid `any`; document unavoidable exceptions.
- Prefer named exports.
- Keep one responsibility per module.
- Keep functions small and intention-revealing.
- Avoid magic numbers.
- Model expected failures with typed errors/results where useful.
- Log technical details only in development.
- Do not expose secrets in `EXPO_PUBLIC_*`.
- Never commit real AdMob unit IDs into tests or examples.
- Keep native configuration in app config/config plugins where supported.
- Delete dead code rather than commenting it out.
- Do not create barrel files that cause circular dependencies.
- Do not hard-code user-facing strings; use the target app's English and Spanish dictionaries.
- Export only intentional public APIs from shared packages.

### Naming

- Entities: nouns, such as `FocusSession`
- Use cases: verbs, such as `CompleteSession`
- Ports: capability names, such as `SessionRepository`
- Adapters: implementation names, such as `SQLiteSessionRepository`
- Hooks: `useX`
- Screen components: `XScreen`
- Workspace packages: `@satellite/<kebab-case-name>`

---

## 19. Configuration

Each app owns:

```text
.env.example
app.config.ts
eas.json
```

Suggested app variables:

```bash
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_ADMOB_IOS_APP_ID=
EXPO_PUBLIC_ADMOB_IOS_BANNER_ID=
EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID=
EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID=
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=
EXPO_PUBLIC_ENABLE_MOCK_PURCHASES=true
EXPO_PUBLIC_ENABLE_TEST_ADS=true
```

Public mobile configuration is not a secret.

Never place these in the app bundle:

- Server secrets
- Private API keys
- Service-account JSON
- Signing credentials

Validate app configuration at startup and provide readable development errors.

Shared packages must receive configuration through constructors, providers, or typed options. They must not read another app's `.env` directly.

---

## 20. Common Commands

Run commands from the repository root unless noted otherwise.

### Install all workspaces

```bash
pnpm install
```

### Create a new Expo app

Confirm the current Expo instructions first, then create the app under `apps/`:

```bash
pnpm dlx create-expo-app@latest apps/<app-slug>
```

After creation:

1. Set its package name to `@satellite/<app-slug>`.
2. Add `APP.md`.
3. Add app-specific scripts.
4. Confirm the Expo SDK.
5. Install internal packages with `workspace:*`.
6. Remove any nested lockfile.
7. Run `pnpm install` at the repository root.

### Install an Expo-compatible dependency in one app

```bash
pnpm --filter @satellite/<app-slug> exec expo install <package>
```

### Install a normal dependency in one app

```bash
pnpm --filter @satellite/<app-slug> add <package>
```

### Add an internal workspace package

```bash
pnpm --filter @satellite/<app-slug> add @satellite/timer@workspace:*
```

### Run one app

```bash
pnpm --filter @satellite/<app-slug> start
```

Or:

```bash
pnpm --dir apps/<app-slug> start
```

### Run checks for one app

```bash
pnpm --filter @satellite/<app-slug> typecheck
pnpm --filter @satellite/<app-slug> lint
pnpm --filter @satellite/<app-slug> test
pnpm --filter @satellite/<app-slug> exec expo-doctor
```

### Run checks across the repository

```bash
pnpm run check
```

### Build one app with EAS

Run from the app directory:

```bash
cd apps/<app-slug>
eas build --profile development --platform ios
```

Each EAS-enabled app keeps its own `eas.json` and related build files in that app's directory.

Because ads and real purchases use native modules, test them in an Expo development build, not only Expo Go.

---

## 21. Shared Components and Services

Potential reusable UI:

- `AppScreen`
- `PrimaryButton`
- `IconButton`
- `DurationPicker`
- `TimerDisplay`
- `LandscapeSessionShell`
- `SoundPicker`
- `ThemePicker`
- `EmptyState`
- `AdBannerSlot`
- `PlusBadge`
- `PaywallCard`
- `SettingsRow`
- `ConfirmDialog`
- `ErrorBoundary`

Potential reusable capabilities:

- `TimerEngine`
- `AdFrequencyPolicy`
- `EntitlementState`
- `MockEntitlementGateway`
- `ThemePrimitives`
- `FakeClock`
- `KVSettingsAdapter`
- `AudioGateway`
- `LocaleResolver`
- `LanguagePreferenceRepository`
- `TranslationProvider`

Do not create all of them preemptively.

Start locally inside the first app. Extract only when a second app needs the same stable behavior. After extraction, replace copies with the workspace dependency and add package-level tests.

---

## 22. Definition of Done

A feature is done only when:

- The happy path works on a physical iPhone.
- Empty and error states exist.
- Relevant tests pass.
- No TypeScript or lint errors remain.
- No production ad IDs are used in development.
- Free and Plus behavior are verified.
- Back navigation and rotation are correct.
- The app works without internet except ads/purchases.
- English and Spanish are complete and selectable.
- Automatic language follows the phone locale, with English fallback.
- The user's language override persists and applies immediately.
- README and `APP.md` remain accurate.
- No unnecessary scope was added.

A shared package change is done only when:

- Its public API is explicit.
- Its tests pass.
- Every consuming app still typechecks.
- No app-specific configuration leaked into the package.
- No duplicate native dependency was introduced.
- Its README or source documentation explains intended use.

An app is release-ready only when:

- `expo-doctor` passes for that app.
- The production iOS build succeeds.
- App Store Connect ad/privacy declarations are correct.
- Privacy policy is published.
- Data safety form matches actual SDK behavior.
- Subscription cancellation/manage link is accessible.
- Store screenshots show the real app.
- Test purchases and restore work.
- Ads appear only at natural breaks.

---

## 23. Codex Scope Rules

Before modifying code, Codex must identify:

- The target app
- The target app's package name
- The relevant `APP.md`
- Which shared packages it consumes
- Whether the requested change belongs in the app or a package
- Which other apps could be affected

### When working on one app

Codex should:

1. Read root `AGENTS.md`.
2. Read `apps/<app>/APP.md`.
3. Inspect the target app and relevant shared packages.
4. Avoid editing unrelated apps.
5. Implement the smallest working vertical slice.
6. Run checks for the target app.
7. Run tests for changed shared packages.
8. Run typecheck for all consumers of a changed package.
9. Report exactly what changed.

### When changing a shared package

Codex must:

1. Explain why the behavior is genuinely reusable.
2. Preserve backward compatibility unless the task explicitly allows a breaking change.
3. Keep app-specific copy, product IDs, assets, and configuration outside the package.
4. Update the package public API through `src/index.ts`.
5. Add or update package tests.
6. Search for every consumer.
7. Run checks for every consumer.
8. Avoid broad repository refactors unrelated to the request.

### Do not

- Copy app code into every app when a stable package already exists.
- Extract a package used by only one app without a concrete reason.
- Introduce Nx/Turbo to solve a problem pnpm scripts already solve.
- Modify every app merely for consistency.
- Upgrade all Expo SDKs as a side effect of one app change.
- Move app-specific database schemas into a generic storage package.
- Put AdMob IDs or RevenueCat product IDs in shared code.

---

## 24. Codex Implementation Order

For a new app:

1. Read root `AGENTS.md`.
2. Read or create the app's `APP.md`.
3. Confirm the current Expo SDK and documentation.
4. Configure localization before building screens:
   - English and Spanish dictionaries
   - Automatic phone-locale resolution
   - Persistent Settings override
5. Build the smallest vertical slice:
   - Open app
   - Configure one session/item
   - Run the core action
   - Complete it
   - Save local history
6. Add tests for pure domain rules.
7. Reuse existing workspace packages only where their APIs fit naturally.
8. Keep new app-specific code local.
9. Add development mock ads and entitlements.
10. Add real AdMob/RevenueCat adapters only after core checks pass.
11. Run app typecheck, lint, tests, and Expo Doctor.
12. Build a development iOS version when native modules are introduced.
13. Update the app README and `APP.md`.
14. Report:
    - Workspaces changed
    - Files changed
    - Commands run
    - Tests run
    - Other apps checked
    - Manual configuration remaining
    - Known limitations

---

## 25. Initial Codex Prompt

Use this after creating the target app's `APP.md`:

```text
Build the iOS-first Expo application described in:

- The root AGENTS.md
- apps/<app-slug>/APP.md

This repository uses pnpm workspaces. Work only in the target app and the minimum shared packages needed for the task.

Before coding:

1. Inspect the workspace structure.
2. Confirm the target app's Expo SDK.
3. Identify existing @satellite/* packages that can be reused.
4. Decide whether new behavior belongs in the app or a shared package.
5. Produce a short implementation plan.

Implementation rules:

- Follow the pragmatic hexagonal architecture.
- Keep the app local-first with no account or backend.
- Start with the smallest working vertical slice.
- Do not introduce Nx, Turbo, Firebase, AI APIs, or unnecessary abstractions.
- Use workspace:* for internal package dependencies.
- Do not import from another app.
- Do not deep-import shared package internals.
- Keep app-specific IDs, copy, assets, database schema, and monetization products inside the app.
- The app must remain usable if ads or purchases are unavailable.

Implement:

1. Core free workflow
2. Local persistence
3. History where required by APP.md
4. Settings
5. Landscape, keep-awake, and audio only when required
6. Ad interfaces and development mocks
7. Plus entitlement interfaces and development mocks
8. Unit tests for domain rules
9. App README and .env.example

Only after the core flow, typecheck, lint, and tests pass, integrate native monetization SDKs behind existing ports using test ads and RevenueCat test/development configuration.

Run checks for the target app. If a shared package changes, run its tests and check every consuming app.

Truthfully report all commands, results, changed workspaces, remaining manual setup, and known limitations.
```
