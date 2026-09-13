# Cardiac Pathway: institution-neutral product identity

User decision: NeuraOps is the parent brand; Cliniverse is a product. QAPAS refers to Qassim Activation Pathway and must not imply institutional affiliation in commercial UI.

Visible product name: Cliniverse Cardiac Pathway. Short navigation name: Cardiac Pathway. Updated simulator, navigation, Atlas, practice entry and bilingual subscription copy. Internal Qapas symbols, evidence references and historical identifiers are retained to preserve traceability. No trademark clearance is asserted.

The existing workflow remains synthetic. Roles and timing examples require hospital-specific validation before operational use; a brand change does not validate a universal clinical protocol.

## Integration readiness
- DICOMweb: no hospital adapter or successful study retrieval was established in this review. Obtain vendor conformance information and an authorized test endpoint before implementation against that system.
- SMART on FHIR: no hospital authorization flow was established. Requires registered client, redirect URI, discovery endpoint and agreed scopes; FHIR authorization must not be assumed to authorize PACS access.
- OpenTelemetry: @opentelemetry/api and operational-telemetry.ts already exist, including attribute sanitization and span recording. Collector/exporter delivery and hospital connection traces have not been verified.
- Hospital permission is prospective, not granted. Begin with institution-authorized synthetic or de-identified pilot fixtures and clearly defined access roles.

Validation: 17 targeted pathway, Nexus and paywall tests pass; TypeScript passes. These checks do not certify clinical deployment or interoperability.
