# Nexus Cardiovascular Learning Slice v1

## Decision

The first Nexus vertical slice is an internal, fictional learning exercise. It is intentionally not imported by `ReleaseApp` or the Apple v1 navigation. It compiles with the project but remains invisible until a later, explicit release gate is approved.

## Learning flow

One fictional cardiovascular transfer is reviewed through four coordinated modules:

1. **Case Huddle** — identifies ownership and communication gaps.
2. **Nursing Lens** — structures observation continuity, ownership, and neutral escalation language.
3. **Medication Safety** — examines reconciliation workflow and licensed human-review ownership without prescribing support.
4. **Safety Review** — reconstructs the fictional timeline and system conditions without blame.

The debrief remains locked until all four modules have a reflection of at least 20 characters and the user confirms that no real or identifiable patient information was entered.

## Safety contract

- Fictional simulation data only.
- Content status is `draft-unreviewed`; `reviewedBy` is `null`; sources are empty until a formal clinical-content review is completed.
- No diagnosis, treatment, prescribing, dosing, order entry, clinical scoring, escalation thresholds, or autonomous clinical decision support.
- No API, database, model, or Supabase call is made by this slice.
- Reflections are stored only in versioned browser storage under `cliniverse:nexus:cardiovascular-learning:simulation:v1`.
- The storage validator rejects unknown schema versions, malformed module identifiers, duplicate completion records, and inconsistent debrief state.
- This package must not be connected to production navigation before product, clinical-safety, privacy, accessibility, and Apple-release reviews pass.

## Release boundary

Current release surfaces must not import `NexusCardiovascularSlice`. Later activation requires a separate decision and feature gate; it must not be enabled through a local-only entitlement or an unreviewed URL flag.

## Acceptance criteria

- All four module names and their safety boundaries are visible when the internal package is rendered.
- Each module requires a systems-focused reflection before completion.
- Editing a completed reflection below the minimum re-locks the debrief.
- The debrief requires all modules plus an explicit fictional-data confirmation.
- Reloading the page restores only a valid version-1 local state.
- The component is included in TypeScript checks but excluded from the current release composition.
