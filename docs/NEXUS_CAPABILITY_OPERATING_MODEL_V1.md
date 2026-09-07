# Nexus Capability Operating Model v1

Status: PRO release candidate, not deployed
Branch: `epic/cardiology-operations-v1`
Review date: 2026-08-28
Release boundary: Fictional local learning behind verified PRO entitlement

## Executive decision

Nexus remains a named Cliniverse product Epic, but its purpose changes from an implied global clinician network or live multi-model decision system into a controlled interprofessional learning and safety workspace.

Nexus v1 contains four small modules under one shared boundary:

1. **Case Huddle** — replaces Daily Case.
2. **Nursing Lens** — replaces the standalone Nursing module.
3. **Medication Safety** — replaces Clinical Pharmacy as a dosing or prescribing surface.
4. **Safety Review** — replaces Error Autopsy.

The modules may share a fictional case, an approved debrief, a versioned evidence record and a local learning record. They do not share real patient information, create clinical orders, diagnose, prescribe, contact clinicians or claim consensus.

## Why the concept changes

The preserved code contains useful product ideas, but several legacy surfaces combine education, social proof, clinical decision support and unverified content. Treating all of them as equally ready would create avoidable safety, privacy, review and commercial risk.

The new structure keeps the differentiated value while making the product promise honest:

- one coherent interprofessional workflow rather than four unrelated tools;
- fictional simulation and reflection rather than care delivery;
- role-specific learning rather than autonomous recommendations;
- source, version and reviewer metadata rather than unsupported authority;
- visible release states rather than inactive controls that appear finished.

## Nexus module contracts

| Module | User value | Allowed foundation | Explicitly excluded |
|---|---|---|---|
| Case Huddle | Understand one case through multiple professional perspectives | Curated fictional case, staged reveal, role lens, reflection, approved debrief | Real patient intake, public clinician voting, diagnosis, treatment recommendation, fabricated global metrics |
| Nursing Lens | Practise observation, escalation and handover reasoning | Fictional observations, structured handover, safety checklist, rationale after completion | Bedside monitoring, authoritative scoring without verification, autonomous escalation, local-policy substitution |
| Medication Safety | Learn reconciliation, monitoring and communication around medicines | Fictional medication list, discrepancy identification, monitoring prompts, pharmacist communication exercise | Prescribing, dose selection, renal-dose automation, interaction clearance, formulary authority |
| Safety Review | Learn from systems and process failures without blame | Fictional or approved composite timeline, contributory factors, barriers, actions, debrief | Real incident reporting, staff ranking, blame assignment, unsupported safety statistics, legal or regulatory determination |

The four-module fictional slice is now marked `release_candidate`. It remains undeployed, local-only, non-clinical, and subject to signed-device verification. Any new scenario or clinical content still requires its own content, clinical, privacy, security, accessibility and interaction evidence.

## Verified inventory correction

The following status reflects the repository and the connected Supabase project inspected on 2026-08-28. “Code present” is not equivalent to release-ready or clinically validated.

| Preserved capability | Verified observation | Product decision |
|---|---|---|
| Multi-AI Oracle | Provider orchestration code exists and is release-gated. The legacy UI and API contracts are inconsistent, model confidence is self-reported, and the displayed agreement heuristic is not a validated consensus method. | Rename internally to **Evidence Review Board**. Keep internal-only until retrieval, claim-level citations, model/version audit, disagreement handling and licensed human sign-off are implemented. Do not market model count as clinical value. |
| Knowledge Graph / pgvector | Vector storage and matching code exist. The inspected database contained five documents and five embeddings, while `kg_nodes` and `kg_edges` were empty. | Call it **Evidence Retrieval Index** until a provenance-backed graph actually exists. Keep service-only. |
| Clinical Evaluation Baseline | Ten cardiac cases exist and nine have one recorded run; the High-Risk PE case had no recorded run. The data does not prove independent review, repeatability or clinical validation. | Rename to **Clinical Safety Evaluation Suite v0.1** and keep internal. Add the missing run, repeat trials and rubrics for harmful omission, escalation, citation and reviewer adjudication. |
| Ward Virtual Hospital | Six primary fictional templates are present, with additional preserved mock cases elsewhere. | Keep as **Ward Simulation**. Version each scenario and require source/reviewer metadata before release. |
| Cardiovascular OS | No single verified eight-unit product boundary was found; related capabilities are distributed across legacy components. | Consolidate operational value under **Cardiology Operations** and educational value under a future **Cardiovascular Learning Pack** in Atlas. |
| Doc Analyzer | Document extraction and third-party analysis code exist, but the legacy flow lacks an approved PHI/DLP, retention, consent and provider-disclosure contract. | Redefine as **Document Study Workspace** for synthetic or public educational documents first. Keep gated. |
| Symptom Checker | Generative interpretation and raw symptom persistence paths exist. The current safety and data contract is insufficient for release. | Defer. A future **Urgency & Care Navigation** surface requires a separate clinical-risk program and must not present diagnostic output. |
| Mental Wellness | Breathing and mood concepts exist; legacy mood ownership relies on a device identifier and permissive data paths. | Keep breathing locally under **Life**. Defer server mood history until authenticated ownership, retention, deletion and crisis-path review are complete. |
| Today Bank / Progress / Megacode v2 | Learning content and fragmented local progress mechanisms exist. | Consolidate into **Learning Journey**. Megacode remains educational simulation and requires scenario-level review. |
| My Medications | Browser-local medication entries exist; reminders are implied but not implemented. | Redefine as **Personal Medication List** with an explicit device-only contract, export/delete controls and no adherence or prescribing claims. Do not enable in Apple v1. |
| Family Health Passport | Local profile switching exists without a verified guardianship, consent or data-separation model. | Defer until identity, authorization, child-data, emergency-access and per-member deletion requirements are approved. |

## Product architecture

Cliniverse capabilities are organized into product families instead of exposing every preserved component as a top-level feature.

| Product family | Purpose | Current release posture |
|---|---|---|
| Care Operations | Fictional workflow simulations, Cardiology Operations and Ward Simulation | Internal simulation foundation |
| Nexus | Interprofessional case learning and systems-safety review | PRO release candidate; fictional local slice only |
| Atlas | Individually verified references, calculators and training packs | Capability-by-capability gate |
| Learning Journey | Daily learning, progress and assessed simulation | Planned; no unsupported achievement claims |
| Intelligence Lab | Evidence Review Board, retrieval, document study and evaluated AI experiments | Internal-only, provider and safety gated |
| Life & Family | Personal wellness, medication list and future family profiles | Separate identity and privacy domain; deferred |
| Clinical Quality System | Evaluation cases, runs, reviewer decisions, evidence versions and release records | Internal control plane; never a clinical user feature |

## Data boundaries

| Class | Examples | Permitted storage in the foundation |
|---|---|---|
| A — Fictional simulation | Case Huddle cases, Ward cases, Cardiology Operations records | Versioned local storage or approved service storage with a visible fictional label |
| B — Learning record | Completed activity, reflection state, reviewed debrief | Authenticated own-user record after ownership and deletion tests pass |
| C — Curated clinical content | Reference text, calculator formula, scenario debrief | Service-controlled, versioned source and reviewer record; read access only after release approval |
| D — Sensitive health context | Symptoms, mood history, medication list, family health data, uploaded documents | Prohibited from the current release backend until a dedicated privacy, security and legal design is approved |
| E — Patient-identifiable information | Any real patient or institutional record | Prohibited in the current product and test program |

## Data containment finding

The release proxy blocks the preserved deferred HTTP routes, but that boundary does not govern direct Supabase Data API access. The connected project inspection found broad client grants and permissive legacy policies on document, embedding, graph, mood, generated-case and daily-case tables. Nexus tables had RLS enabled without a policy, which currently fails closed, but they still retained unnecessary client table grants.

The reviewed SQL draft `supabase/drafts/deferred_capabilities_safe_hold.sql` removes every client policy and client table privilege in the deferred scope, retains trusted service-role access and keeps vector matching service-only. It is deliberately marked `PRODUCTION HOLD`; it has not been applied by this work. The draft must be converted into a migration with the project Supabase CLI only after staging is available.

## Release gates

A capability may move from preserved code to internal test only when all applicable gates are evidenced:

1. **Product gate** — one named user problem and measurable, non-clinical success criterion.
2. **Clinical content gate** — sources, version, scope, limitations and licensed reviewer decision.
3. **Safety gate** — foreseeable misuse, harmful omission, escalation and human-review controls.
4. **Privacy gate** — data inventory, purpose, minimization, retention, deletion, processors and consent.
5. **Security gate** — authenticated ownership, least privilege, service-only authority, abuse controls and auditability.
6. **Quality gate** — deterministic contract tests plus scenario, accessibility, restart and failure-path verification.
7. **Claims gate** — UI, store copy and marketing make no claim beyond verified evidence.
8. **Release gate** — explicit approval for internal, TestFlight or production; promotion is never automatic.

## Delivery sequence

### Phase 1 — Governance and containment

- Record the capability manifest and the decisions in this document.
- Preserve the existing Apple v1 runtime gates.
- Prepare a fail-closed database migration for deferred clinical, mood, Nexus and knowledge data.
- Do not apply the migration to production without backup, staging execution and an explicit migration-window decision.

### Phase 2 — Nexus foundation

- Build the four-module shell with fictional seed data only.
- Use one shared case contract and one shared content metadata contract.
- Keep reflections on-device until authenticated learning-record ownership is proven.
- Show a visible status for planned, internal, review required and release candidate states.

### Phase 3 — One verified vertical slice

- Select one fictional cardiovascular Case Huddle.
- Complete Nursing Lens, Medication Safety and Safety Review for that case.
- Obtain clinical content review and document every source/version.
- Verify accessibility, restart, offline behavior and misleading-action risks.

### Phase 4 — Controlled learning service

- Add authenticated, own-user progress only.
- Add content publishing with reviewer roles and immutable version history.
- Add deletion, export, audit and retention controls before any sensitive category is considered.

### Phase 5 — Evaluated intelligence experiments

- Repair the Oracle contract and replace confidence averaging with claim/evidence evaluation.
- Run the Clinical Safety Evaluation Suite repeatedly with independent adjudication.
- Keep every AI capability internal until provider disclosure, consent, privacy, safety and claims gates pass.

## Commercial boundary

The valuable paid proposition is not the number of preserved modules. It is a dependable workflow: curated case, role-specific practice, verified debrief, progress and safe repetition.

- **Core hypothesis:** verified Atlas content plus a limited Learning Journey.
- **Professional hypothesis:** Nexus case packs, structured progress and advanced simulations after validation.
- **Institution hypothesis:** managed cohorts, content governance and audit capabilities only after tenancy, contracts and compliance controls exist.

Prices remain experiments. No subscription promise or medical outcome claim is approved by this document.

## Non-goals

- No real patient or institutional data.
- No diagnosis, triage, prescribing, dosing or autonomous care decision.
- No live clinician marketplace, public vote or implied global network.
- No production database mutation in this phase.
- No App Store, TestFlight or production promotion from this work alone.
- No claim that code presence, a green evaluation row or multiple AI providers establishes clinical validation.
