# Cliniverse Commercial Activation v1

## Baseline

This workstream starts from the Apple-accepted release baseline commit:

`17ccee45711f396b04032ac14943247541c856fa`

The accepted release branch remains unchanged. Commercial activation work is isolated on `strategy/commercial-activation-v1` until a separate implementation/release candidate is explicitly approved.

## Objective

Turn the Apple-accepted review build into a coherent commercial product without weakening clinical, privacy, StoreKit, account, or release-safety boundaries.

North Star:

**Clinical Competency Intelligence** — governed clinical media → deliberate practice → deterministic scoring → longitudinal mastery → adaptive review → institutional competency intelligence.

## Release principles

1. Preserve the accepted Apple baseline as a golden reference.
2. Do not remotely activate hidden or materially different functionality inside the accepted build.
3. Material functionality enters a new reviewed build and is disclosed in App Review notes.
4. Real-patient workflows, diagnosis, prescribing, autonomous clinical decisions, HealthKit, and hospital integrations remain separately gated.
5. Synthetic/demo clinical content must never be presented as governed clinical truth.
6. Subscription access controls entitlement only; it does not establish clinical validity.
7. Commercial activation must improve acquisition, activation, retention, conversion, and trust — not merely increase feature count.

## Initial audit — accepted release surfaces

### ACTIVATE / KEEP

#### Authentication and account boundary
Current release requires AuthGate before the application shell. Keep as a commercial baseline requirement.

#### StoreKit purchase / restore / server verification boundary
The accepted release already presents a localized App Store plan and explicitly states that PRO activates after server verification. Keep and harden rather than replace.

#### Me / account / privacy / terms / support
Keep as first-class release surfaces. These are part of commercial trust and App Store compliance, not secondary settings.

#### Free Ward preview
Keep one high-quality free experience as the activation path into the product, provided it remains clearly fictional/simulated and clinically governed.

### REDESIGN

#### Home
Current Home is optimized for release safety and reviewer clarity, not conversion. Redesign around the user value proposition:

- What skill am I building?
- What should I review next?
- What competency progress have I made?
- What does PRO unlock?

Do not lead with internal release-boundary language in the primary commercial hierarchy. Keep safety language contextual and accessible.

#### Atlas
Current Atlas is a release tour. Redesign as a product capability catalog organized by learner outcomes rather than repository/module names.

Target hierarchy:

- ECG
- Echo
- Adaptive Review
- Competency Profile
- Simulated Clinical Workflows
- Account / Plan

#### Cardiology Operations
Current release positioning is operational/simulation-heavy. Reframe only the parts that support deliberate practice, structured interpretation, handover, reliability, or competency measurement.

#### Nexus Learning
Keep the strongest multi-role cardiovascular reliability exercise, but redesign it as a competency/reliability experience rather than a broad generic AI feature.

### HOLD

#### Clinical Intelligence tab
Current accepted build correctly keeps this disabled. Keep HOLD until disclosure, consent, provider/data-use review, clinical-claims review, and the intended-use boundary are explicitly approved for a future build.

#### HealthKit / personal health context
HOLD for a separate privacy and product-intent workstream. It must never be required for the core learner product.

#### Hospital / PACS / DICOM / EHR integrations
HOLD until a design partner or paying institutional customer creates real demand. No hospital integration dependency for the first commercial activation release.

#### Real-patient workflow features
HOLD. The first commercial activation release remains education/competency-first.

### RETIRE / DO NOT REACTIVATE AS-IS

#### Legacy synthetic ECG challenge as the primary ECG product
Do not commercially reactivate as the new ECG experience. The governed ECG pipeline and adaptive workspace supersede it.

#### Broad legacy AI modules without a clear competency, retention, or revenue role
Do not reactivate by default. Each legacy component must earn a place through user value, governance, and commercial fit.

## Commercial Release Scope v1

The next commercial candidate should be deliberately smaller than the historical component inventory.

### Core learner experience

1. Commercial Home / Today surface
2. ECG competency entry point using governed cases only
3. Echo competency entry point using governed media only
4. Adaptive review queue
5. Longitudinal competency profile
6. One clearly fictional free simulation path
7. PRO entitlement and purchase/restore flow
8. Account, privacy, terms, support, and deletion controls

### Not in v1 activation

- autonomous diagnosis
- prescribing or treatment instructions
- real-patient order/workflow transmission
- ungated third-party clinical AI
- HealthKit clinical data ingestion
- hospital PACS/EHR integration
- legacy synthetic ECG as a clinical learning authority

## Commercial information architecture target

### Home
**Today**
- Continue practice
- Due reviews
- Current competency progress
- Recommended next skill

### Learn
- ECG
- Echo
- Governed clinical simulations

### Progress
- Skill mastery
- Review schedule
- Competency history

### Explore
- Curated tools / references that pass release classification

### Me
- Account
- PRO plan
- Restore purchases
- Privacy / Terms / Support

The final tab model may differ after UX validation, but commercial hierarchy must prioritize learner value over internal architecture.

## Activation metrics for the first commercial release

Track only metrics that map to product decisions:

- App Store product page conversion
- onboarding completion
- first governed case started
- first governed case completed
- first competency score produced
- first adaptive review scheduled
- D1 / D7 learning return
- paywall viewed
- purchase initiated
- verified PRO entitlement
- restore success

Do not add behavioral telemetry that captures patient data or clinical content unnecessarily.

## Required gates before commercial promotion

- Apple accepted baseline preserved
- new build reviewed through App Review
- StoreKit purchase and restore verified
- account creation/login/logout verified
- account deletion path verified
- privacy/terms/support links verified
- iPhone and iPad device baselines verified
- adaptive layout verified across supported geometries
- governed clinical content only in marketed ECG/Echo competency paths
- no unreviewed clinical claims in product or App Store metadata
- GitHub Actions/release gates green on the exact candidate SHA

## Parallel engineering tracks

### Track A — Commercial activation
Home, IA, paywall value story, onboarding, App Store presentation, analytics, retention.

### Track B — Clinical competency engine
Governed ECG Batch 01, Echo competency, scoring, mastery, review scheduling, adaptive selection, unified profile.

### Track C — Adaptive clinical experience
Compact / Expanded / Wide Clinical layouts, iPhone/Fold/iPad continuity, state-preserving reflow.

### Track D — Enterprise readiness
Institution analytics, governance evidence pack, tenant boundaries, pilot packaging. No hospital adapters until demand.

## Immediate next audit

Before implementation, inspect every currently reachable and legacy candidate component and classify it as:

`ACTIVATE | REDESIGN | HOLD | RETIRE`

For every component record:

- user problem solved
- target user
- commercial role
- competency/North-Star fit
- clinical risk
- privacy risk
- Apple review implication
- current technical readiness
- dependency on real patient data
- dependency on external AI
- recommended release action

No component should be restored merely because it already exists in the repository.
