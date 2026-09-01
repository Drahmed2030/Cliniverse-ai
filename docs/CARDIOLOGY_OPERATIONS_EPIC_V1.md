# Cardiology Operations Epic v1

Status: Internal MVP foundation
Branch: `epic/cardiology-operations-v1`
Release boundary: Internal simulation only

## Executive decision

Cardiology Operations is implemented as one product Epic with five isolated modules that share one versioned domain model. This keeps the product coherent while allowing each module to be reviewed, tested, and promoted through a small follow-up change.

The Epic does not replace the existing Ward Simulation. Both workspaces remain available under Care, with Cardiology Operations as the default internal MVP surface.

## Included modules

1. Night Shift / On-call Board
2. Chest Pain and STEMI Census
3. Surgical List
4. Notes and Orders Tracking
5. Structured Handover

## Architecture

- `app/lib/cardiology/` owns the shared types, fictional seed data, schema version, and storage contract.
- `app/components/ward/cardiology/` owns the five user-facing modules and their shared state hook.
- `app/components/ward/index.tsx` owns the workspace boundary between Cardiology Operations and Ward Simulation.
- State is saved only to versioned browser storage on the current device.
- There is no server persistence, hospital integration, external messaging, or cross-device synchronization in this Epic.

## Safety and legal boundary

- Fictional simulation data only; no real patient or patient-identifiable data.
- No diagnosis, triage, treatment recommendation, clinical decision support, prescribing, or autonomous escalation.
- Notes and Orders Tracking records operational acknowledgement state only. It cannot place, alter, approve, or transmit an order.
- Structured Handover saves locally and sends nothing to a person, hospital, or external service.
- Human review remains mandatory.
- Higher-risk Atlas and Intelligence capabilities remain gated under their existing release controls.
- Any production clinical claim, institutional workflow, data-processing purpose, or regulated-market release requires clinical, privacy, security, and licensed legal review.

## Data and recovery contract

- Storage key: `cliniverse:cardiology-operations:simulation:v1`
- Stored payloads have an explicit schema version.
- Invalid or unavailable stored data falls back to safe fictional seed data.
- Users can reset the local demonstration state.
- Handover readiness requires a non-empty note plus confirmation that pending items were reviewed, the next simulated owner was confirmed, and no real patient information was entered.

## Acceptance criteria

- All five module labels are visible and selectable.
- On-call cases and tasks use fictional identifiers and generic locations.
- Operational status changes persist after closing and reopening the app on the same device.
- Surgical readiness checklist changes persist locally.
- Task acknowledgement changes persist locally.
- Handover drafts persist locally and cannot be marked ready without every confirmation.
- Ward Simulation remains independently accessible.
- The existing release gates for clinical AI and Atlas remain unchanged.
- Unit/contract tests, lint, TypeScript, and production build pass before any internal build is requested.

## Delivery sequence

1. Foundation: shared model, local recovery, workspace navigation, and all five safe operational shells.
2. Internal verification: interaction, persistence, restart, accessibility, and fictional-data review.
3. Vertical validation: verify one module at a time with approved operational acceptance criteria.
4. Platform preparation: reuse the domain model for a future Cliniverse web/admin platform only after authentication, tenancy, audit logging, retention, and privacy requirements are approved.
5. Monetization discovery: measure repeat use and willingness to pay before enabling subscriptions. Current price points remain hypotheses, not commitments.

## Explicit non-goals

- Production deployment or public release
- Real patient data
- EHR/HIS integration
- Medical-device claims
- Autonomous clinical decisions
- Payment or subscription activation
- Re-enabling preserved high-risk modules
