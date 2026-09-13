# Release scope freeze

No new features in this closeout. Working tree starts from the code tree published at 6202ecbd018fca0b31ed3018844e90ea7ce91c0c.

## Verified
- 108 targeted commercial, Ward, pathway, reviewer-access, subscription and native contract tests PASS; 0 FAIL, 0 SKIP.
- Five obsolete copy/token assertions reconciled: three light/dark/system token definitions instead of two, semantic gold instead of C.gold, current account copy, explicit color schemes. Contrast threshold remains 4.5:1. Payment-authority checks remain in the dedicated suite.
- TypeScript PASS.
- Existing authenticated reviewer browser: team-perspective section visible, no document horizontal overflow at 1363px. Earlier session evidence verifies replay and event attribution. This is not a new mobile matrix.

## Public versus preview
- Cardiology/Pathway/replay/team perspective remain premium learning components; synthetic and session-only.
- Release candidate now authorizes the pinned confirmed reviewer in Preview and production for premium educational UI. No admin permissions or Apple entitlement changes. Production activation still requires deploying this candidate.
- Today training hub, remote worklist, ECG review entry and Ward saved practice are currently gated by showEcgReview/reviewPreview. Do not advertise them as generally available without a separate verified release decision.
- No live hospital, NeuraOps, HealthKit or Watch integration.

## Outstanding release gates
1. Verify reviewer access on the deployed release origin. The release-compatible account policy is implemented and unit-tested; real production validation remains pending.
2. Execute the native iPhone/iPad matrix, cold launch, text scaling, media and StoreKit sandbox purchase/restore on the exact candidate.
3. Promote the verified release code to canonical origin and prove release-contract commit alignment. Last observed production was accepted baseline 17ccee45711f396b04032ac14943247541c856fa.
4. Verify signing and build number in Codemagic, build and inspect IPA, then TestFlight. No Codemagic callable connector was available in this closeout. No new signed build, production promotion or Apple submission occurred.

Decision: scoped code checks PASS; general Apple submission readiness NOT YET VERIFIED.
