# Cliniverse Company-Grade Audit v1

Status: ACTIVE
Owner: NeuraOps / Cliniverse AI
Scope: release readiness before App Store resubmission and before any real healthcare-data use.

## Verified current-state findings

### Authentication — BLOCKER
- `app/components/AuthScreen.tsx` currently simulates Apple, Google, and email success with local timers rather than a real identity provider.
- `app/components/SettingsSheet.tsx` treats a localStorage flag as auth state and clears that flag on sign-out.
- Decision: standardize on Supabase Auth as the initial identity authority because Supabase is already the project data/auth dependency. Apple/Google provider enablement remains configuration work and must not be faked in the UI.

### Subscription / PRO entitlement — BLOCKER
- `app/supabase.ts` contains profile-level `is_pro`, subscription fields, an `is_user_pro` RPC, a `subscriptions` table reader, and direct Lemon Squeezy checkout links.
- PRO state is presented in UI components such as Settings and Afia.
- There is no verified single entitlement service used consistently across the app.
- Decision: create a single read-only entitlement authority first. Payment activation must be server-verified and must not rely on client-only toggles.

### Afia / عافية — REFACTOR + SAFETY GATE
- Afia is a substantial patient-facing product surface, not a minor feature.
- Current modules include symptom checking, medications, nutrition, mental wellness, exercise, hospital discovery, teleconsultation, labs, and travel health.
- Some Afia UI tokens/references are internally inconsistent and some cards imply capabilities that are not wired.
- High-risk patient-facing capabilities must remain gated until auth, privacy, safety, evidence, and clinical-risk requirements are defined and implemented.

### iOS / App Store — ACTIVE BLOCKER
- Apple reported a blank launch on iPad, placeholder-like icons, and an invalid Support URL.
- `appstore/resubmission-fixes` exists for iOS/App Store remediation.
- Do not resubmit until clean-install launch, final icons, support page, and release build validation pass.

### Security — ACTIVE P0
- `p0/healthcare-hardening` / PR #2 contains the first verified secret/debug remediations.
- No PHI or live healthcare workflow activation before auth, API authorization, RLS/data isolation, auditability, and P0 gates pass.

### Testing — BLOCKER
- `package.json` currently has no automated test script.
- Automated release tests are mandatory before release candidate status.

## Product architecture decision

NeuraOps
└── Cliniverse AI — Healthcare Intelligence Platform
    ├── Care Operations
    ├── Clinical Intelligence
    ├── Clinical Tools
    ├── Academy & Simulation
    └── Afia — Patient Health Companion

## Execution order
1. P0 security closure
2. iOS/App Store launch stability
3. Real auth foundation
4. Single subscription entitlement authority
5. Afia completion and safety classification
6. Unified navigation/design integration
7. Automated tests
8. Release candidate review

## Release rule
No production merge or App Store resubmission unless Build + Product + Security + Auth + Entitlement + App Store gates all pass.
