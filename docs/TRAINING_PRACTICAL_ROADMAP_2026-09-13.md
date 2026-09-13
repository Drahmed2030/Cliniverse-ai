# Training and practical workflow delivery

Scope: commercial reviewer Preview. Apple baseline and production unchanged.

## Delivered
- Today: Your training shift, linking existing Ward, ECG, Echo and Progress journeys.
- Practical exercise: preparation of a remote review request. Five explicit checks; completion invalidated after any edit. Session-only, no patient data, no transmission, no clinical approval.
- Existing Cardiology coordination workspace linked with its existing PRO entitlement gate.
- Ward remains three documentation scenarios on one fictional case, not three patients or a daily content service.
- Validation: 20 Ward/preparation tests pass, zero fail/skip; TypeScript and targeted ESLint pass. New UI browser acceptance pending.

## Package 1: subscriber release acceptance
Verify navigation, authenticated persistence/reload, dark/mobile layout and entitlement behavior in one Preview acceptance run. Review content eligibility before widening beyond the reviewer. Test purchasing/restoration in the next native TestFlight candidate.
Subscriber proposition to validate: a focused training shift plus saved continuity. No demonstrated conversion uplift or promised publishing cadence.

## Package 2: one hospital pilot
1. Build a synthetic examination worklist using actual supported file formats and existing viewers, linked to existing pathway replay. This checklist is preparation, not a worklist implementation or viewer approval.
2. With a named hospital, discover its EHR/PACS/vendor interfaces; establish scoped clinician identity, audit trail and read-only examination access, then test one ECG and one Echo study. Real clinical use requires the institution's operational, security and clinical acceptance. Urgent STEMI escalation remains outside the educational simulator.

Verified standards references: SMART App Launch for FHIR authorization https://hl7.org/fhir/smart-app-launch/ ; DICOM PS3.18 Studies service for search/retrieval https://dicom.nema.org/medical/dicom/current/output/chtml/part18/chapter_10.html . Hospital compatibility and ECG format support are not established.
No new subscription, pricing change, database migration or hospital integration delivered in this change.
