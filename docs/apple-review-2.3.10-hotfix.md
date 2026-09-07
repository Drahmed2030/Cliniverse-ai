# Apple Review Guideline 2.3.10 hotfix

## Review finding

App Review requested removal of Android references from the iOS binary under Guideline 2.3.10 (Accurate Metadata).

## Verified release-path finding

The active release shell routes the Me tab through `app/components/release/MeHub.tsx`. That screen contained user-visible copy referring to both Apple Health and Health Connect. Health Connect is not relevant to App Store users and has been removed from the iOS release copy.

The repository also contains legacy/unreferenced cross-platform components such as `ProfilePage.tsx` and `PWAInstall.tsx`. They are not imported by the active `app/page.tsx -> ReleaseApp.tsx` release path and are intentionally left untouched by this minimal App Review hotfix so existing non-iOS/platform work is not destroyed.

## Hotfix constraints

- Apple-specific release copy only.
- No clinical behavior changes.
- No subscription or entitlement changes.
- No Supabase changes.
- No Echo/Studio changes.
- No deployment, TestFlight upload, App Store submission, or merge performed by this commit.

## Required pre-release verification

Before creating the replacement iOS build:

1. Verify the release dependency path still starts at `app/page.tsx -> ReleaseApp.tsx`.
2. Search the active release dependency closure for user-visible references to Android, Google Play, Health Connect, APK, or cross-platform install promotion.
3. Confirm the Me/Life surface now mentions Apple Health only.
4. Run release build/typecheck/lint gates already used for the Apple candidate.
5. Build a new signed iOS binary and perform a binary/string scan before upload.
