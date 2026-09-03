# Code Lab Pathway Bridge v1

Status: implemented locally on the isolated strategy branch  
Branch: `strategy/clinical-pathway-replay-v1`  
Apple, Production, and database impact: none

## Product decision

Code Lab is no longer a disconnected lesson catalogue in this slice. The Door-to-ECG gap opens one governed activity, successful deterministic practice creates one completion receipt, and only that receipt unlocks the same-session reassessment.

`Pathway gap → Code Lab activity → completion receipt → reassessment → human-owned Closure Brief`

## Canonical activity

- Activity: `door-to-ecg-drill-v1`
- Activity version: `1.0.0`
- Content asset: `door-to-ecg-acquisition-evidence-v1`
- Content version: `1.0.0-draft`
- Player: `codelab-governed-player-v1`
- Answer key: `deterministic-svg-v1`
- Data mode: `synthetic-non-clinical`
- Review state: `draft-human-review-required`
- Completion scope: `session-only`

The activity contract is defined in `app/lib/codelab/trainingActivity.ts`. The same content asset and version are consumed by the Clinical Studio media manifest, preventing the interactive drill and motion lesson from becoming independent sources of truth.

## Completion receipt

A correct configured-marker selection produces a canonical receipt containing:

- receipt schema and deterministic structural ID;
- activity, content, player, and answer-key versions;
- fictional case ID;
- immutable Medical Operations Registry snapshot and ordered source revision IDs;
- attempt count, passed result, and exact matched synthetic leads; and
- intended use, data mode, review state, and human-review requirement.

The receipt is reconstructed from its inputs during session restoration. Any altered ID, version, source snapshot, source order, assessment result, boundary, or attempt count fails closed and resets the pathway session safely.

The receipt is not a credential, certification, digital signature, clinical validation, or outcome claim.

Adding the receipt to the compiled Closure Brief advances that artifact contract from schema `1.0` to `1.1`.

## State and navigation

- Pathway session schema: `v2`
- Browser key: `cliniverse_pathway_replay_session_v2`
- Storage: same-tab `sessionStorage`, with an in-memory fallback
- Network calls: none
- Database writes: none
- Legacy or malformed state: rejected and reset to the initial synthetic replay

The experience keeps one visible sequence on phone and tablet: Replay, Code Lab, Reassess, Review Brief. Reassessment remains locked until a valid receipt exists; Closure Brief remains locked until reassessment completes.

## Verification contract

Automated coverage verifies:

1. the replay report, Code Lab activity, and media manifest share one activity and content identity;
2. successful practice produces one deterministic, versioned receipt;
3. incorrect answers produce no receipt;
4. version, source, receipt, and state tampering fail closed;
5. the Closure Brief contains the exact receipt used to unlock reassessment; and
6. the bridge remains network-free, database-free, and outside the Apple release shell.

## Explicitly deferred

- Global Cliniverse Code Lab navigation
- Existing BLS and ACLS lesson migration into this contract
- PRO and StoreKit entitlement behavior
- Cross-device progress, user ownership, retention, and deletion
- Production telemetry or database persistence
- Real clinical sources or patient data
- Apple binary, metadata, TestFlight, or App Store changes

Each deferred item requires its own review and authorization gate. This bridge does not imply completion of roadmap Stage 7.
