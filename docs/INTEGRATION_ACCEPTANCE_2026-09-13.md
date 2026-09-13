# Consolidated acceptance and institutional handoff

Application Preview base: 0fad8697dc5194c7ee62a9920703d9043104e17a.
Scope: reviewer Preview, not Apple production release acceptance.

## Verification
45 targeted tests PASS, 0 FAIL, 0 SKIP across Ward session/checkpoint/rotation/preparation/worklist, QAPAS, Nexus core, Apple subscription persistence contracts and release paywall contracts. TypeScript and targeted lint pass. These are code/contract tests, not actual StoreKit purchases or hospital interoperability tests.
Old Atlas assertions expected CURRENT RELEASE TOUR and localized price from StoreKit; current component exposes data-commercial-explore-surface, atlas-title, StoreKit price and Restore purchases. Updated those stale copy assertions, preserving all premium-action and purchase-authority checks. No runtime code changed in this acceptance pass.

Browser: existing reviewer without PRO opens Cliniverse PRO dialog from STEMI coordination entry. No entitlement modifications, purchase, or restore transaction executed. Previous desktop validation covers training links, Ward restore, preparation transitions, separate worklist state, and educational-viewer links. Direct PRO pathway branch, new mobile UI matrix and native StoreKit end-to-end remain unverified.

## Technology decisions
- DICOMweb QIDO-RS/WADO-RS: hospital study search/retrieval where supported. https://dicom.nema.org/medical/dicom/current/output/chtml/part18/chapter_10.html
- SMART App Launch: scoped FHIR authorization where supported. https://hl7.org/fhir/smart-app-launch/
- OpenTelemetry: vendor-neutral traces/metrics/logs for future connector diagnostics. https://opentelemetry.io/docs/what-is-opentelemetry/ . Not installed. Instrument metadata/timings/errors without patient content or credentials; tracing is not a substitute for an access audit.
- Existing viewers retained. Educational examples must not become examinations of synthetic referrals. No clinical readiness inferred from checklist state.

## Required inputs to close remaining work
1. An authorized existing PRO test account/session, or native sandbox purchase/restore run. Do not fabricate entitlement to test the paid branch.
2. A named pilot hospital and technical contact; EHR/PACS vendor and versions, sandbox FHIR/DICOMweb (or vendor API) endpoints and authorization method. Request access through a secure channel, not credentials in chat.
3. Institution-approved de-identified test ECG and Echo studies, format/transfer syntax/conformance details, expected display and measurement behavior. Existing PDF/video evidence does not validate arbitrary hospital formats.
4. Institution-defined clinician access, case assignment, audit/retention and remote-device requirements, plus named responsible team for urgent escalation.

Pilot scope: read-only access to one ECG and one Echo study in a sandbox. No clinical alerts, cath-lab activation, clinical orders or claims of improved Door-to-ECG/Balloon. Native release acceptance via TestFlight remains a separate gate.
