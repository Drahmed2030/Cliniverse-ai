# Apple Build 67 Outcome — 2026-09-17

This record distinguishes what is verifiable directly from this repository from what is reported externally (Codemagic, App Store Connect, TestFlight, a physical device) but not independently confirmable from this sandbox, which has no network or credential access to any of those systems.

## Branch and release commit

- Branch: `qa/case-batch20-cloud`
- HEAD at time of this record: `34d2684965eba31c84704f08bda913fca6125236`
- Most recent functional commit on this branch: `1cdacf9` ("restore ECG competency/adaptive-selection engine, wire Atlas knowledge-graph card, and reconcile native screenshot automation with current release UI")
- **[repo-verified]** Both commits exist on this branch and are current HEAD / HEAD's parent respectively.
- **[externally reported, not repo-verifiable]** The exact commit Codemagic built Build 67 from is not confirmable from this sandbox (no Codemagic build-log access). It is reported to be at or near this HEAD, which includes the native screenshot-automation reconciliation below.

## Version / build

- **[repo-verified]** `CFBundleShortVersionString` (marketing version): `1.1`, set via `codemagic.yaml`'s `PlistBuddy` step against `ios/App/App/Info.plist`.
- **[repo-verified]** `package.json` `"version"`: `1.1.0`.
- **[repo-verified]** `CFBundleVersion` (build number) is set at Codemagic build time from the `BUILD_NUMBER` environment variable (`codemagic.yaml`), not committed to the repo. "Build 67" refers to `BUILD_NUMBER=67` for this Codemagic run.

## Screenshot automation reconciliation

- **[repo-verified]** `native/screenshot/CliniverseScreenshotTests.swift` was rewritten in commit `1cdacf9` to assert against the current live `ReleaseNav` copy instead of a stale shell's copy:
  - Home wait-text: `"One clear path through healthcare intelligence."` → `"One clear next step."`
  - "Care" tab → "Learn" tab (`waitingFor: "Care Workflow Simulation"` → `"Ward Simulation"`)
  - "Atlas" tab → "Explore" tab (`waitingFor: "CURRENT RELEASE TOUR"` → `"FIND YOUR NEXT PRACTICE"`)
  - "Me" wait-text: `"ONE ACCOUNT DESTINATION"` → `"YOUR CLINIVERSE"`
  - `signInIfNeeded()`'s home-title check updated to match
- This is the class of drift that failed the Codemagic build-30 screenshot-geometry gate documented in `docs/RELEASE_GATE_EXECUTION_LOG.md` (the geometry itself was separately fixed across builds 26–30; the copy drift addressed here is a distinct, additional issue in the same test file).

## Codemagic outcome

- **[externally reported, not repo-verifiable]** Build 67 reported to have completed a successful Codemagic build.

## Apple binary validation

- **[externally reported, not repo-verifiable]** Reported to have passed Apple's binary validation step.

## TestFlight state

- **[externally reported, not repo-verifiable]** Reported available via TestFlight and installed from TestFlight onto a physical iPhone.

## Device-smoke surfaces exercised

- **[externally reported, not repo-verifiable]** Reported observed running on a real iPhone: onboarding, Learn, Ward, ECG Challenge, Echo/Cliniverse Studio, Code Lab, Me.

## Repository verification run alongside this record

- **[repo-verified, re-run this session]** `npm test` → 370/370 pass.
- **[repo-verified, re-run this session]** `npx tsc --noEmit` → clean, zero errors.
- **[repo-verified, re-run this session]** `npx next build` → compiled successfully, full route manifest, zero errors.

## Remaining release blockers

Per `docs/APPLE_RC1_REVIEWER_PACKAGE.md`, the following are unaffected by Build 67's reported outcome and remain open:

- Reviewer-access gate: attach `com.cliniverse.ai.pro.monthly` to the app-version submission; correct the product display-name capitalization (currently `CLiniverse PRO Monthly`); test the reviewer account on a clean iPhone and iPad install.
- Final external checks: support mailbox send/receive/reply test; Support/Privacy/Terms HTTP 200 checks against the production origin used by the native shell; App Store privacy-answer reconciliation against `native/privacy/PrivacyInfo.xcprivacy`; content-rights/age-rating/encryption/export-compliance/category confirmations in App Store Connect; support contact fields entered in protected App Review Information.
- Runtime and Security gate status: not re-verified by this record — carried forward as last documented, not confirmed in this session.

## Apple submission status — explicit statement

**No Apple App Store review submission (Add for Review / Update Review / Resubmit) has occurred, and none is authorized by this record.** Build 67's reported TestFlight availability is a separate process from an App Store review resubmission — TestFlight distribution does not itself constitute or require a review submission. `docs/APPLE_RC1_REVIEWER_PACKAGE.md`'s "Submission decision" section explicitly withholds authorization pending the remaining reviewer-access and final-external-check items above, none of which are resolved by this record. **The overall release status is not "fully production ready."**
