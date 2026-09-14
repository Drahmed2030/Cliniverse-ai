# Case media integration batch

Base: 84846acebd8a9c060521f7a5ded3d993085edf64, qa/case-batch20-cloud.

## Scope and evidence
- Verified remote Echo head is still fa820b345e85bb8e541d5400e36c48516abba62e.
- Existing batch summary has zero learner-ready and zero binary-commit-eligible derivatives.
- Five pathology candidates remain deferred; 14 cases still lack matched governed media.
- A4C remains the single supplementary link, restricted by the existing account review viewer.
- No new media, diagnoses, clinical approval, licenses, assessment scores or learner readiness claimed.

## Implemented
- A4C link carries a known case identity to the existing Echo account review route.
- That route offers a 48px minimum-height return link to the A4C case only when the case
  preview exists (development or approved QA branch). Untrusted URLs and repeated query
  parameters cannot become return destinations. Existing viewer/AuthGate remain intact.
- New browser check opens the existing route in a separate tab, verifies the return link,
  returns to the case, and checks that the original case tab is retained. This is navigation
  verification without a real session; it does not assert authenticated cine playback.
- Three route tests cover allowlisting, environment restriction and preservation of the gated viewer.
- checkout/setup-node/upload-artifact now use v5, whose official releases support Node 24.

## Local validation
18 targeted content/media/route tests PASS; ESLint and git diff --check PASS.
Cloud workflow result must be recorded separately after completion.

## Remaining
Artifact-specific clinical/privacy/device review and intact eligible files are required before
activating the five pathology candidates. No evidence currently authorizes that promotion.
Matching media for the other 14 cases, deeper Ward content and integrated release QA remain.
No production merge, database changes, new player or binary uploads are included.
