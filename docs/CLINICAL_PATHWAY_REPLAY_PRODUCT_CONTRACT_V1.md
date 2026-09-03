# Clinical Pathway Replay Product Contract v1

Status: **STRATEGY CANDIDATE - SYNTHETIC DATA ONLY**

Owner: NeuraOps / Cliniverse AI

Release relationship: This contract is isolated from the submitted Apple 1.0 (62) release. It does not authorize changes to that binary, App Store metadata, production, Supabase, or the open release PR.

## Executive decision

NeuraOps and Cliniverse are one product system:

- **NeuraOps** is the company and governed workflow intelligence core.
- **Cliniverse AI** is the clinician-facing product and learning experience.
- **Clinical Pathway Replay** is the shared flagship capability.
- **STEMI Replay** is the first narrow proof of value.

Cliniverse is not a replacement HIS, EHR, referral platform, incident system, or medical device. It is a vendor-neutral clinical intelligence and readiness layer that can later connect to approved systems of record.

## One-sentence promise

> Turn a clinical pathway into a measurable timeline, locate the operational gap, train the gap, and show whether it closed.

Arabic working promise:

> حوّل المسار السريري إلى رحلة قابلة للقياس، واكتشف موضع التعطل، ودرّب الفريق عليه، ثم أثبت هل أُغلقت الفجوة.

## The hero moment

Within the first minute of a synthetic demonstration, the user must see:

1. a versioned pathway;
2. an ordered event timeline;
3. calculated KPI intervals;
4. one visible delay or missing-data flag;
5. the rule and source behind the flag;
6. the accountable role and proposed next step;
7. a direct route to a targeted Shift or Nexus simulation;
8. a before/after reassessment state.

The product is not successful if the demonstration requires a long explanation before the user understands the value.

## Closed-loop contract

`Event -> KPI -> Rule -> Owner -> Corrective Action -> Simulation -> Reassessment -> Closure Evidence`

Every stage must remain traceable. A score without an event, rule, source, version, owner, and next action is not an approved product output.

## Existing asset map

| Existing asset | Role in Clinical Pathway Replay | Decision |
| --- | --- | --- |
| Cardio Nexus Core | State machine, event ledger, role authorization, KPI engine | Core product asset |
| QAPAS Direct simulation | Existing fictional pathway demonstration | Input reference; do not expand the regional name as the global brand |
| Cardiology Operations | Operational context and five safe workflow shells | Reuse selectively |
| Nexus Cardiovascular Slice | Team learning, role lenses, reflection and debrief | Targeted simulation layer |
| Atlas / Related Evidence | Source, version, scope and evidence display | Protocol and evidence layer |
| Ward Simulation | Fictional case engine and safe local persistence | Reusable simulation foundation |
| Learning Journey / Shift concepts | Short individual practice and repetition | First post-replay action |
| Clinical Quality System | Evaluation, reviewer decisions and release evidence | Internal control plane |
| Intelligence Lab | Future evaluated assistance | Internal only; not required for prototype |
| Life, family, real documents, symptoms | Sensitive or unrelated domains | Parked outside the flagship slice |

## Product sorting rule

Every preserved capability is assigned to exactly one bucket:

### A. Flagship loop

Required to demonstrate the full replay-to-readiness journey. This is the only bucket authorized for the first prototype.

### B. Shared foundation

Authentication, entitlement, brand system, release gates, versioned storage, evidence metadata, accessibility, and deterministic tests.

### C. Expansion pack

Medication safety, referral closure, structured handover, infection prevention, surgery, resuscitation, and other governed pathways. These are not top-level products.

### D. Regulated future

Real ECG or imaging interpretation, patient-specific recommendations, symptom interpretation, prescribing, dosing, monitoring, and live patient data. Each requires a separate intended-use and regulatory program.

### E. Archive or retire

Any feature that does not contribute to the flagship loop, a verified expansion pack, or the shared foundation.

## First user and buyer

Primary user: clinical quality lead, cardiovascular service lead, simulation educator, or pathway coordinator.

Primary buyer hypothesis: one hospital department with a measurable pathway problem and an accountable quality or education budget owner.

The prototype is not optimized for a broad consumer audience. The existing Cliniverse subscription remains a distribution and learning hypothesis; institutional willingness to pay must be tested separately.

## STEMI Replay scope

The first pack uses one entirely fictional journey and a locally configurable pathway definition. It may demonstrate event sequencing, timestamp validation, interval calculation, data completeness, delay categorization, role ownership, evidence display, targeted training, and reassessment.

It must not:

- contain real or identifiable patient information;
- interpret an ECG;
- diagnose STEMI;
- recommend or select treatment;
- activate a Cath Lab or contact a clinician;
- validate an official KPI submission;
- claim improved patient outcomes;
- rank or punish individual staff.

## Readiness result

The prototype uses a transparent readiness summary, not a validated clinical score. It displays:

- pathway completeness;
- protocol adherence within the fictional scenario;
- team handover and ownership completeness;
- time interval performance against configured demonstration thresholds;
- missing or conflicting evidence;
- open corrective actions;
- reassessment status.

Any composite score is marked **illustrative and unvalidated** until a measurement plan, external review, and pilot evidence are approved. A safety-critical failed gate overrides an otherwise high average.

## Brand and naming boundary

The frozen NeuraOps and Cliniverse visual family remains authoritative. The existing navy, blue, violet and clinical teal palette, system typography, semantic status colors, and geometric marks remain unchanged.

UI guidance may improve hierarchy, accessibility, charts, density and motion, but must not introduce a competing palette, remote font dependency, decorative medical-device styling, or a new corporate identity.

`QAPAS` remains an existing regional/source reference and an Apple-release simulation label. It is not approved as the name of the global platform. Public naming requires ownership and trademark clearance.

## Success gate

The first prototype succeeds only if:

1. a new evaluator understands the problem and value in under two minutes;
2. every displayed conclusion is traceable to synthetic events and configured rules;
3. the evaluator can move from a gap to a targeted simulation and back to reassessment;
4. no real data, diagnosis, prescribing, autonomous action, or false live state is present;
5. at least five buyer interviews produce a documented problem, current workaround, buyer, budget path, and willingness-to-pilot signal;
6. at least one qualified organization agrees to a bounded design-partner or pilot discussion before institutional expansion.

No revenue is guaranteed. The purpose of the prototype is to obtain high-quality commercial evidence with bounded cost.

