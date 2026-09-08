# Cliniverse Clinical Intelligence Platform 2026

Status: architecture and product preparation only. No Production deployment, no hospital integration, no clinical autonomy.

## Executive direction
Cliniverse should evolve as one governed Clinical Competency Intelligence platform rather than a collection of unrelated tools. Echo remains the active reference implementation. ECG, pathway simulation, radiology, institutional analytics, governed educational content, and NeuraOps assurance reuse the same evidence, competency, provenance, policy, and entitlement foundations.

## 2026 external signals incorporated
- NIST AI 800-4 strengthens the need for post-deployment monitoring across functionality, operations, drift, incidents, policy, and human oversight.
- NIST TEVV-Athlon explicitly targets extensible evaluation across statistical ML, LLMs, multimodal systems, and agentic systems.
- ONC 2026 ISA and USCDI evolution reinforce standards-based interoperability and terminology discipline.
- CMS Interoperability Framework 2026 emphasizes FHIR APIs, US Core/USCDI, Bulk FHIR, FHIR subscriptions, clinical documents, and diagnostic imaging modernization.
- HL7 FHIR R5 supports topic-based subscriptions for proactive event notification, while requiring authorization to remain valid at notification time.

These signals support a governance-first platform with event provenance, reusable modality adapters, evidence-backed algorithms, and explicit human review boundaries.

## Platform layers
1. Clinical Media & Signal Studio
   - Echo cine
   - ECG calibrated signals
   - X-ray images
   - CT series
   - Angiography cine
   Shared responsibilities: ingest, renderer fingerprint, technical quality, privacy preflight, provenance, checksum, review state.

2. Competency Intelligence Engine
   - deterministic scoring
   - recency-weighted mastery
   - confidence calibration
   - adaptive case selection
   - spaced retrieval
   - cohort benchmarking
   This should become modality-agnostic at the contract level while keeping modality-specific scoring logic isolated.

3. Clinical Pathway Simulation
   Existing pathwaySimulation, pathwaySession and pathwayReplayAgents can become a governed simulation/replay engine for decision sequencing, not an autonomous clinical decision maker.

4. Evidence & Governance
   Evidence Ledger + Integrity v2 + promotion gates + NeuraOps adapter are the shared control plane. Every commercial or institutional capability that makes quality or trust claims should bind to this layer.

5. Institutional Analytics
   Use competency events and attempts to calculate skill gaps, trends, cohort distributions, reliability, remediation needs and curriculum effectiveness. Avoid patient-level operational analytics until a separate privacy and institutional integration boundary is approved.

6. Educational Content
   Existing clinical_documents, guidelines, generated_questions, question_bank and evidence components can support governed learning content. Generated content should carry source/provenance/version/reviewer state and should not silently become learner-ready.

7. Commercial & Entitlement Layer
   Existing Apple subscription and entitlement foundations can map product access to Individual Pro, Institution/Department, and Enterprise Assurance tiers without duplicating clinical logic.

8. External Clinical Data Adapter Layer — future only
   - SMART/FHIR
   - FHIR subscriptions
   - Bulk FHIR
   - DICOMweb QIDO/WADO/STOW
   - terminology normalization
   This layer is not learner content storage and must not copy PHI into the competency ledger by default.

## Algorithm families worth developing
### Near-term, lower risk
- deterministic skill scoring
- Bayesian/recency-weighted mastery estimates
- confidence calibration and overconfidence detection
- spaced retrieval scheduling
- adaptive case selection with exploration/exploitation limits
- cohort benchmark percentiles with minimum sample thresholds
- quality-control charts for competency drift
- evidence freshness scoring

### Medium-term
- multimodal case sequencing across Echo + ECG + pathway context
- latent skill graph inference
- item difficulty/discrimination calibration
- institutional gap clustering
- simulation replay comparison against expert pathways
- uncertainty-aware content recommendation

### High-risk / future only
- imaging inference for patient care
- autonomous diagnostic agents
- patient-specific treatment recommendations
- hospital event-driven agents acting on live clinical data
These require separate validation, privacy, regulatory, human-approval, monitoring and rollback architecture.

## Monetization map
### Individual Pro
Echo/ECG competency, adaptive practice, verified learning portfolio, pathway simulation, advanced analytics.

### Institution / Department
Cohort dashboards, curriculum assignment, competency gaps, remediation workflows, governance reports, pilot analytics.

### Enterprise / Hospital
Governance evidence packs, TEVV records, policy/version provenance, audit exports, controlled integrations, eventually model monitoring and assurance.

## Existing components to preserve and repurpose
- cardiology/ecgWaveform -> ECG renderer/calibration foundation
- cardiology/pathwaySimulation + pathwaySession + pathwayReplayAgents -> simulation/replay engine
- cardiology/nexusKpiEngine -> institutional KPI ideas, only after competency metric definitions are governed
- clinicalMedia -> shared media lifecycle and renderer boundary
- competency -> longitudinal skill graph foundation
- evidence + governance -> source truth / provenance / promotion control
- embeddings + clinical_case_embeddings -> retrieval support only after source and licensing controls; never authoritative clinical truth by themselves
- generated_questions + question_bank + clinical_documents + guidelines -> governed educational content pipeline
- subscriptions + entitlements -> commercial access control
- user_progress + case_attempts -> learner telemetry, later normalized into competency events

## Non-goals for the current phase
- no second Echo implementation
- no generic autonomous healthcare agent
- no patient-care inference in the learner application
- no direct PACS/EHR exposure
- no PHI in Evidence Ledger by default
- no Production migration merely because staging works
- no modality expansion that bypasses clinical review, privacy review or evidence lineage

## Next implementation sequence
1. Verify the new platform capability registry and tests.
2. Complete staging Data API exposure only for the narrow `api` RPC surface and verify real runtime transport.
3. Add a governed educational-content contract that binds source, version, evidence and reviewer state.
4. Normalize competency telemetry contract across Echo and future ECG.
5. Build ECG competency vertical slice using the same promotion/evidence/competency architecture.
6. Add institution analytics contracts from de-identified competency events.
7. Keep FHIR/DICOMweb adapters as interface contracts until a real hospital pilot requires them.
