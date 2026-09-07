# Echo Batch 01 — Apple Playback Matrix

Status: PENDING DEVICE REVIEW

This matrix records playback evidence only. It does not provide clinical approval, privacy approval, learner readiness, binary inclusion authorization, diagnosis authorization, certification, deployment authorization, or Supabase authorization.

## Scope

Exact-SHA playback review for the six intact Batch 01 pathology derivatives governed by `echoBatch01HumanReview.ts` and `echoBatch01PlaybackReview.ts`.

## Evidence classes

- **Legacy Apple compatibility evidence**: MacBook Pro 2012 / macOS Catalina using Safari and QuickTime. Useful for real Apple decoding, controls, aspect-ratio preservation, and low-end compatibility. It is not evidence for current iOS/iPadOS/WebKit behavior.
- **Current Apple platform evidence**: physical current iPhone/iPad or an explicitly identified modern Apple device environment. Required before final learner promotion.

## Required checks per candidate/environment

- exact derivative SHA256 verified before review;
- playback starts without a blank/black failure;
- play/pause works;
- seek works;
- frame stepping works where exposed by Clinical Studio;
- loop works without an obvious broken seam;
- aspect ratio is preserved;
- no crop or geometric distortion;
- clinically relevant anatomy remains readable;
- retained overlays remain readable and do not obscure the teaching target;
- reduced-motion/accessibility behavior does not break playback;
- reviewer, device model, OS version, app/browser version, date, and notes recorded.

Any checksum mismatch, FAIL, uncertainty requiring escalation, or inability to verify a required check must fail closed as HOLD/FAIL.

## Candidate matrix

| Candidate | SHA256 | Catalina Safari | Catalina QuickTime | iPhone | iPad | Current status |
|---|---|---:|---:|---:|---:|---|
| Pericardial effusion | `ac4ae1abd4ba3a14f050a5e2222af0a8a46f910669934892eac2b6e1f89e7d1a` | PENDING | PENDING | PENDING | PENDING | device review pending |
| Severe HCM | `39f7d2930a1383c688723871887c02e75ddd932819a01b176bbc6e03cb6cf913` | PENDING | PENDING | PENDING | PENDING | device review pending |
| Severe MS | `c9db61d29ae454e9967023aa0b2ce3e218b333b4b199f6394b8665199616f274` | PENDING | PENDING | PENDING | PENDING | device review pending |
| Severe AR | `13f3d791637cdc7e8704fd36fc98269b458afc0d472f03ca1349540b09ca91cc` | PENDING | PENDING | PENDING | PENDING | device review pending |
| Severe AS | `1f2e57f80802dc0f13c1c8732d8b48f05b228e39cdcd408a91956a76877fb715` | PENDING | PENDING | PENDING | PENDING | device review pending |
| ARVD source-supported RV pattern | `2e83143bd1e969b4b53349687cc2371cc9896c54e7c2c475659c7bb1b767c97b` | PENDING | PENDING | PENDING | PENDING | device review pending |

## Catalina pilot order

Start with **Pericardial effusion** on the MacBook Pro 2012:

1. verify the exact file SHA256;
2. open the file directly in QuickTime and run the required checks;
3. open the same exact file in Safari/direct media playback and repeat;
4. if Clinical Studio can serve the exact file without transformation, review it there and record that separately;
5. only after the pilot workflow is clean, repeat the same sequence for the remaining five cases.

## Release boundary

A PASS on Catalina is recorded as legacy compatibility evidence only. It does not clear `current-apple-platform-playback-pending`. Human clinical/privacy review and the post-review quality gate remain independent requirements. Learner readiness remains false until all governed gates clear.
