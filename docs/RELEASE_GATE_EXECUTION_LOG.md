# Release Gate Execution Log

## 2026-08-26
- Company-grade audit started.
- Verified auth is currently simulated/local-state driven.
- Verified PRO/subscription logic is distributed and lacks a single entitlement authority.
- Verified Afia is a substantial patient-facing product surface requiring completion and safety classification.
- Verified automated test script is absent.
- App Store remediation and P0 security remain separate release workstreams.

Next: build real identity + entitlement foundation on an isolated branch, then wire UI only after provider and environment validation.

## 2026-09-02
- Activated one shared StoreKit 2 purchase surface from Me, Care and the Atlas reviewer tour.
- Kept Apple price and renewal-period display authoritative to StoreKit; no price is hard-coded in the client.
- Applied and verified `apple_subscription_authority_v2` and `apple_subscription_events_fk_index` on the Cliniverse Supabase project.
- Verified RLS, client read-only entitlement access, service-role-only persistence and the event-lineage foreign-key index.
- Limited the reviewer-visible release to fictional Ward, Cardiology Operations, QAPAS, Nexus learning and account/subscription controls.
- Kept third-party clinical AI, diagnosis, prescribing, real-patient workflows and device-health integrations outside the submitted surface.
- Passed 115 repository tests, TypeScript, release-file ESLint and a 41-route production build.

Next: verify Vercel runtime secret names, create a signed iOS candidate, complete Sandbox purchase/restore tests on clean iPhone and iPad installs, then update App Store Connect. No production promotion or Apple submission is authorized by this log.

### iOS screenshot evidence recovery

- Codemagic build 26 on commit `37406b4` failed only at the screenshot geometry gate.
- The iPhone 17 Pro Max evidence measured the release title at `minY = -15`, below the required `60` point clearance.
- The artifact confirmed that `ios.contentInset = always` moved the sticky release header behind the system status bar.
- The recovery candidate removes scroll-view automatic inset adjustment and installs a document-start native safe-area contract for every WKWebView navigation.
- The same contract now protects authentication, release headers, bottom navigation, onboarding, paywall, patient detail, splash and offline recovery surfaces.
- Repository tests pass `116/116`; the production Next.js build and targeted release-file ESLint pass.

Next: deploy the recovery commit to the canonical production origin, then require a fresh non-publishing iPhone and iPad screenshot-evidence build. Do not create an IPA or submit to Apple until all twelve images pass automated and visual review.

### Build 27 evidence result

- Vercel production and the canonical release contract both matched commit `fe84a7f` before the run.
- Codemagic build 27 passed every preparation gate and failed only at the iPhone screenshot geometry assertion.
- The title improved from `minY = -15` in build 26 to `minY = 19`, but remained below the required `60` point clearance.
- The remaining defect is deterministic: iOS reported a valid bottom safe-area inset and a zero top inset. Whole-vector fallback accepted that partial measurement and replaced the 59-point bootstrap top inset with zero.
- The next candidate resolves each safe-area edge independently, preserving measured values while retaining the bootstrap minimum for any zero edge.

Next: verify this narrow per-edge correction locally, then require a new non-publishing screenshot-evidence run before any IPA or Apple submission.

# Screenshot evidence origin decoupling

- The production IPA workflow still requires an exact release-contract commit match.
- The non-publishing screenshot workflow may use a newer descendant commit only when Git proves every delta is confined to audited native, test, documentation, or CI-verifier paths.
- Any application, public asset, dependency, or web-runtime change still blocks screenshot capture until the matching commit is promoted to production.
- This removes manual Vercel promotion from native-only screenshot iterations without weakening the production packaging gate.

### Screenshot evidence build 28

- Codemagic build 28 passed dependency installation, the production web build, the native-only production compatibility gate, StoreKit, privacy, CocoaPods and native test-target setup.
- The capture stage still measured the iPhone release title at `minY = 19`, below the required `60` point clearance.
- The unchanged geometry proves that resolving each native inset was not enough. The remaining fault is the Swift-to-CSS application contract during WKWebView document hydration.
- The next candidate persists the native values with one guarded observer, enforces the release-header top clearance directly, and emits non-sensitive computed safe-area diagnostics to the build log.

Next: run one non-publishing screenshot-evidence build and use the `[CliniverseSafeArea]` diagnostic together with the XCTest geometry result. Do not create an IPA, promote production, merge, or submit to Apple from this gate.
