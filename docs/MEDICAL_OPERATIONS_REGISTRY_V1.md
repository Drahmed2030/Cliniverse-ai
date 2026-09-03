# Medical Operations Registry v1

Status: implemented for the isolated synthetic Pathway Replay slice

Branch: `strategy/clinical-pathway-replay-v1`

Release impact: none; Apple `1.0 (62)` remains unchanged

## Product role

The Medical Operations Registry is the NeuraOps trust spark inside Cliniverse AI. It gives each rule and linked learning activity an exact, inspectable source revision without turning a guideline, standard, policy, or internal document into autonomous clinical authority.

The first complete link is:

`DEMO-PATHWAY-RULESET-V1 → Door-to-ECG flag → ECG drill → reassessment → closure brief`

The linked ruleset is owned, synthetic, and non-clinical. The 10-minute threshold remains a fictional demonstration configuration and is not presented as a locally adopted clinical rule.

## Record passport

Every registry revision now records:

- immutable revision ID and stable source-family ID;
- title, publisher, version, effective date, jurisdiction, and primary source location;
- public-URL or controlled-internal-copy access mode;
- review state, reviewer, and review date;
- intended operational use and linked pathway IDs;
- active, superseded, or expired lifecycle state;
- licensing / reuse status and required attribution; and
- rule-use mode plus explicit clinical approval ownership.

An internal source is allowed to have no public URL only when `sourceAccess` is `controlled-internal-copy`. A public source must have a primary URL. Automated tests enforce this relationship.

## Version and history invariant

Rules reference immutable revision IDs, not the current member of a source family. A replay compiles those revisions into a deterministic `mor-v1:` snapshot and carries the complete snapshot through training and the Closure Brief.

Adding a newer active revision, superseding an older revision, or expiring a revision therefore does not silently replace the version attached to an earlier replay. `getCurrentNexusReference()` exists for discovery only and is not called when a replay resolves its rule.

The registry fails closed when:

- a revision ID cannot be resolved;
- the same revision appears twice in one rule; or
- more than one active revision exists in the same source family.

## Clinical-authority gate

The strategy prototype always emits:

- `ruleMode: synthetic-demonstration-only`; and
- `clinicalExecution.state: blocked`.

`isClinicalRuleSourceApproved()` requires, at minimum, an active clinical-rule revision, named human approver, approval timestamp, approved jurisdiction, completed review, and cleared rights state. No current registry record satisfies that gate.

Even a source that passes this future eligibility check cannot autonomously diagnose, prescribe, activate a pathway, or replace local policy. Product activation still requires separate implementation, validation, clinical safety, privacy, institutional, and release approvals.

## Visible trust evidence

The Pathway Replay overview and Closure Brief now display a source passport containing:

- immutable snapshot ID;
- source, publisher, and exact version;
- review state and jurisdiction;
- intended use and rights state; and
- a persistent `Clinical rule blocked` boundary.

The ECG drill displays the same frozen revision ID in its acquisition evidence checklist. This creates one traceable source chain rather than separate content, media, assessment, and replay claims.

The NeuraOps company evidence page is now a read-only presentation projection of the same canonical Cardio/Nexus registry. Its region and use labels are portfolio navigation metadata; title, publisher, version, URL, linked pathways, intended use, and review boundary are all resolved from the immutable canonical source ID. The former independent four-record array no longer acts as a second source of truth.

## Public-source verification note

Repository URLs for the WHO SMART Guidelines / Digital Adaptation Kits programme, the HL7 FHIR R5 specification, FHIR R5 Provenance, FHIR R5 AuditEvent, the American Heart Association Mission: Lifeline page, the European Health Data Space Regulation, and the Saudi Data and AI Authority data-protection collection were checked against official primary domains on 3 September 2026. The Saudi Heart Association focused update DOI was checked against the Journal of the Saudi Heart Association record and deliberately remains `requires-local-review`. Source verification confirms identity and location only; it is not a clinical, legal, licensing, localization, or conformance approval.

The ESC ACS record remains link-only and its `reviewedAt` field remains empty in v1 because its exact current landing URL was not revalidated in this implementation pass.

## Explicitly excluded

- No real patient, hospital, audit, or photographed-form data.
- No external model or network call at runtime.
- No database table, migration, or persistence.
- No source-document ingestion or copyrighted content reproduction.
- No executable clinical decision rule.
- No Production, TestFlight, IPA, App Store, or active-review change.

## Next gate

Stage 6 remains the governed Gemini preparation gate. It may draft synthetic educational material only after a valid scoped Preview key passes the fixed non-clinical probe. Model output must reference this registry snapshot and enter `draft-human-review-required`; it cannot modify a source record or activate a rule.
