# Cliniverse Release Content Promotion Manifest

Status: ACTIVE RELEASE-CLOSEOUT CONTROL  
Branch checkpoint when created: `fcb8bcb89e79ce49f9e898e334a147fd4af522fd`  
Purpose: distinguish catalog readiness from release/promotion authorization.

## Governing rule

`catalog readiness = ready` is **necessary but not sufficient** for learner promotion.

A content item may be promoted into learner-facing release value only when all applicable gates are satisfied:

1. source identity is known;
2. commercial-use rights are acceptable;
3. required attribution is preserved;
4. learner-facing clinical framing has been reviewed;
5. media/privacy requirements are satisfied;
6. presentation uses the current Cliniverse learner system rather than legacy UI;
7. no internal governance/provenance metadata leaks into learner UI;
8. the content does not make unsupported competency, diagnostic, treatment or outcome claims;
9. the relevant release tests are green;
10. explicit protected-content boundaries are preserved.

The catalog must not be treated as a publication authority by itself.

## SHIP-NOW — current release-safe learner value

These items/surfaces are already represented in the current release path and may remain visible subject to the existing access rules.

### Ward

Seven current Ward cases:

- Anterior STEMI — Post PCI Day 2
- Acute Ischemic Stroke
- Diabetic Ketoacidosis
- Severe Community-Acquired Pneumonia
- ACS Rule-Out
- Pre-eclampsia
- Post-operative Ulcer

Release rule:
- preserve current case/template contracts;
- preserve the corrected ACS Rule-Out identity;
- do not expose hidden extra templates merely because source material exists.

### ECG

Governed Record 10 learner path only.

Release rule:
- preserve governed source/provenance;
- no internal hashes, policy IDs, promotion decisions, blocker codes or engineering routes in learner UI;
- no promotion of legacy ECG Challenge cases through this manifest.

### Echo

Licensed Normal A4C learner experience:

- real licensed A4C cine;
- view-recognition check;
- safe next-best-evidence reasoning activity;
- source/license attribution.

Release rule:
- preserve the existing licensed media and provenance records;
- technical review metadata, hashes, receipt IDs, competency telemetry and engine IDs remain non-learner-facing;
- the reasoning activity remains image-interpretation education only, not patient-management advice.

### Pathway Replay

Current learner-ready Pathway Replay material may remain available:

- STEMI Pathway Replay fictional demonstration;
- Door-to-ECG acquisition drill;
- Reassessment and closure brief.

Release rule:
- keep fictional/simulation framing;
- do not convert pathway content into real-patient workflow claims.

### Clinical Reference

Existing source-linked reference tools may remain available under their current contracts.

These tools are useful product capability but must not be counted as equivalent to reviewed case-based learning units in commercial content-volume claims.

### Cardiology Operations

Existing current workspace may remain available according to its present entitlement/access contract.

Do not use its existence to imply hospital integration.

## PRESENT, BUT DO NOT COUNT AS PREMIUM DEPTH WITHOUT RE-REVIEW

### Legacy ECG Challenge — seven cases

Catalog entries currently include:

- Lateral STEMI
- Atrial Fibrillation with RVR
- Complete Heart Block
- Monomorphic Ventricular Tachycardia
- Severe Hyperkalemia
- Wellens Syndrome
- Brugada Pattern Type 1

Current decision: **HOLD FOR RECOMPOSITION / CLINICAL BOUNDARY REVIEW**

Reasons:

- legacy presentation system;
- XP/gamification;
- synthetic fallback behavior;
- management/treatment language;
- not governed through the current Record 10 learner contract;
- prior correction/attribution history requires careful preservation.

Do not promote these cases merely to increase content count.

### BLS / ACLS / Megacode

Existing lessons and scenario remain source material and current product capability.

Current decision: **DO NOT USE AS A PRIMARY PREMIUM-DEPTH CLAIM UNTIL GUIDELINE/COPY REVIEW**

Reasons:

- higher clinical-consequence content;
- some prescriptive/therapeutic language;
- freshness/guideline-version review may be required.

Do not remove the capability; do not expand or commercially emphasize it solely because the catalog marks entries ready.

## HOLD — not learner-promotable in the current release

### Resuscitation scenarios and drills

The simulation/debrief/competency engines may be technically ready, but the learner-facing scenario/drill content required by the collection readiness gate is not ready.

Current learner presentation:
`Coming later`

Do not create a bypass around the catalog gate.

### Additional Echo pathology media

Any additional Echo media in review_required, media_pending, hidden, candidate-only or reviewer-only state remains HOLD.

Do not promote DCM/HCM or other pathology assets without their required clinical/privacy/licensing gates.

### Batch-20 or other media-pending case assets

Hidden/media-pending material remains HOLD.

Do not infer learner readiness from case text alone.

### Institutional-only collections

Resident Onboarding remains institutional-only.

It must not appear in individual Today or Learn.

## Promotion queue — safest next waves

The order below is a work queue, not publication authorization.

### Wave A — deepen already-governed Echo learning

Prefer additional activities derived from the already licensed/reviewed A4C asset **only when they introduce no new unsupported clinical claim**.

Candidate pattern:

`Observe → identify landmarks → commit interpretation boundary → next-best-evidence reasoning → feedback`

Any new clinical statement still requires review before learner promotion.

### Wave B — governed ECG expansion

Use the current governed ECG pathway and provenance model rather than the legacy ECG Challenge UI.

Preferred source pool:
- commercially usable, traceable ECG datasets such as properly attributed PTB-XL records;
- deterministic rendering;
- explicit source/provenance;
- interpretation-first learner flow;
- no treatment recommendations unless separately reviewed and authorized.

A new ECG case is not learner-ready merely because an image can be rendered.

### Wave C — Ward depth

Prefer additional decision steps, review activities, handover tasks or safe evidence links derived from the existing reviewed Ward cases before exposing hidden legacy templates.

Do not change clinical timelines or prompts merely to increase unit count.

### Wave D — Resuscitation

Only after scenario/drill content itself passes the learner-readiness gate.

The existence of a simulation engine is not enough.

## Commercial counting rule

For release messaging, count only discrete learner experiences that a user can actually open and complete in the shipping build.

Do not count:

- hidden items;
- review-only items;
- engines without learner-ready content;
- duplicate surfaces pointing to the same exercise;
- internal tools;
- catalog records that are not exposed;
- institutional-only items for an individual subscription claim.

## Current strategic conclusion

The technical release path is healthy, but a green CI result does not itself resolve perceived subscription value.

A fresh signed build should follow one of two explicit decisions:

1. **Content wave first** — promote a meaningful additional set through the gates above; or
2. **Founder ship decision** — deliberately ship the current truthful content set knowing its depth is narrower than the intended mature subscription.

No agent may interpret this document as permission to bypass clinical review, licensing, StoreKit, Supabase, signing or production controls.
