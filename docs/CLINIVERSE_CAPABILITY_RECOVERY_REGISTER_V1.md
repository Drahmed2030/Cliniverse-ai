# Cliniverse Capability Recovery Register v1

Status: strategy inventory; no Production or Apple release change

Purpose: preserve useful product value without reactivating unsafe or incoherent legacy behavior

## Recovery rule

Code presence is not a release decision. A preserved component is adopted only when it has one product role, an honest user promise, a source/review boundary, safe data handling, accessible interaction, and repeatable verification.

## Verified component groups

| Existing assets | Product destination | Current decision | Required next gate |
|---|---|---|---|
| `CodeLabHub`, `TrainingLessonPlayer`, BLS and ACLS lesson sets | Code Lab / Learning Journey | Adopt through Care and Atlas | Lesson-level sources, clinical review, versioned completion receipt |
| `CodeBlue`, `MegacodeRunner` | Resuscitation Simulation Pack | Preserve; do not expose as authoritative guidance | Scenario audit, source versions, deterministic scoring, debrief review |
| `EcgChallenge`, deterministic SVG waveform engine, Clinical Media compiler | ECG Learning Track | Reuse the deterministic engine; quarantine unsupported diagnostic claims | Reviewed synthetic cases, answer-key versions, accessibility and receipt contract |
| Echo fragments in `LiveCaseViewer`, Grand Rounds and snapshots | Future Echo Learning Track | Preserve concepts, not the current fragmented UI; modality-specific engine contract added | Narrow learning objective, synthetic cine phantom, licensed assets, cardiology review |
| CT summaries and radiology quiz fragments | Future CT Learning Track | Preserve sourced teaching patterns only; CT engine remains contract-only | DICOM threat model, licensed de-identified dataset, radiology review |
| Case Huddle, Nursing Lens, Medication Safety, Safety Review | Nexus Learning | Already consolidated | Scenario-by-scenario content approval and signed-device evidence |
| Legacy Nursing, Pharmacy and Error Autopsy screens | Nexus source inventory | Do not restore as standalone clinical tools | Extract only reviewed learning patterns |
| Clinical Library, Global Standards and calculators | Atlas | Preserve by capability | Canonical source ID, effective date, jurisdiction, formula tests |
| Document analyzer and upload flows | Document Study Workspace | Quarantine | PHI/DLP, consent, retention, provider disclosure and deletion contract |
| Ambient Scribe concepts | Intelligence Lab | Quarantine | Recording consent, regional privacy, retention, transcript quality and human sign-off |
| Generative ECG/imaging interpreters and symptom checker | Separate regulated-risk program | Do not expose in current product | Intended-use decision, clinical-risk management, validation and regulatory review |
| Personal medication and family-profile concepts | Life & Family | Defer | Identity, authorization, export/delete, child-data and privacy architecture |

## Product sorting

The recovery sequence is deliberately narrow:

1. **Learning foundation** — Code Lab navigation, entitlement and honest draft boundary.
2. **Evidence foundation** — lesson sources, versions, reviewers and completion receipts.
3. **Deterministic skills** — ECG, resuscitation and workflow simulations using synthetic inputs.
4. **Media compiler** — one reviewed source drives lesson, animation, captions and assessment.
5. **Institution controls** — cohorts, governance and audit only after tenancy and compliance work.
6. **High-risk intelligence** — documents, voice and clinical interpretation remain isolated until their dedicated programs pass.

This register prevents two failure modes: losing useful work, and mistaking preserved prototypes for validated healthcare products.
