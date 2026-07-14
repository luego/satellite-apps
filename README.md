# Satellite Apps

iOS-first Expo applications collected in a plain pnpm workspace.

## Workspace Layout

- `apps/*` contains independently buildable Expo applications.
- `packages/*` contains reusable `@satellite/*` packages once behavior is shared by more than one app.

This repository root is not an Expo app and intentionally does not depend on Expo, React, React Native, monetization SDKs, or app-specific native configuration.

## Commands

```bash
pnpm install
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run check
```

The recursive scripts use `--if-present`, so they are safe while the workspace is empty.
