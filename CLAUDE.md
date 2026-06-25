# Project Overview

[1-2 sentence description of what this app does]

This is a **React Native** app targeting **iOS and macOS**, with native shells managed through Xcode.
Native build/run/debug happens in Xcode; app logic lives in TypeScript.

## Stack

- React Native [version]
- TypeScript [version]
- macOS support via: [react-native-macos | other — fill in]
- State management: [Redux / Zustand / Context / etc — fill in]
- Navigation: [React Navigation / other — fill in]

## Project Structure

```
/src              → TypeScript app code (components, screens, hooks, etc.)
/ios              → Native iOS shell (Xcode project/workspace)
/macos            → Native macOS shell (Xcode project/workspace)
/__tests__        → Tests
package.json
```

[Adjust the above to match your actual folder layout]

## Working Conventions

- Run Claude Code from the **repo root**, not from inside `ios/` or `macos/`.
- Most feature work happens in `/src` — prefer editing TypeScript over touching native code unless the task explicitly requires a native module or platform-specific config.
- Native code changes (Podfile, `.xcodeproj`, `AppDelegate`, entitlements, Info.plist) should be called out explicitly when made, since they often require a manual Xcode step (e.g. re-running `pod install`) afterward.
- After any native-side change, run:
  ```
  cd ios && pod install && cd ..
  ```
  (or the macos equivalent, if applicable)

## Build & Run

- iOS simulator: `npx react-native run-ios`
- macOS: `npx react-native run-macos` (or via Xcode directly using the `macos/*.xcworkspace`)
- Metro bundler: `npx react-native start`

[Fill in if you use Fastlane, custom scripts, or specific simulator/device targets]

## Testing

- Unit tests: `npx jest` (or your test runner)
- [Add any native test suite commands if applicable]

## Code Style

- [Prettier/ESLint config location, if any]
- [Naming conventions, file organization patterns you follow]

## Things Claude Should Know

- SwiftUI Previews and visual inspection of native UI are **not available** in this terminal-based workflow — for UI changes, describe what you see in the Xcode preview/simulator back to Claude rather than expecting it to "see" the result.
- [Any tricky build quirks, e.g. signing setup, CocoaPods issues, monorepo tooling like Nx/Turborepo if relevant]
- [Any parts of the codebase that are off-limits or need extra care]

## Current Focus

[Optional: what you're actively working on, so Claude has context without you re-explaining each session]
