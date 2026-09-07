# Nexus Cardiovascular Learning Slice v1

## Decision

The first Nexus vertical slice is included in the Care release candidate as a fictional learning exercise. Access requires the shared server-verified Cliniverse PRO entitlement. Free users reach the same StoreKit paywall used by the account surface; no local state, URL flag, or client write can unlock the module.

This composition decision does not change the clinical boundary. The exercise contains systems-reliability reflection only and remains visibly separated from diagnosis, treatment, prescribing, order entry, real incident reporting, and patient care.

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
- No deployment, database migration, or App Store submission is authorized by this release-candidate composition.

## Release boundary

`app/components/ward/index.tsx` is the only release composition boundary for `NexusCardiovascularSlice`. It renders the module only after the authenticated subscription authority returns PRO. The slice remains local, fictional, and network-free. Any move to real data, institutional workflow, clinical guidance, server persistence, or external communication requires a separate reviewed release.

## Acceptance criteria

- All four module names and their safety boundaries are visible when the internal package is rendered.
- Each module requires a systems-focused reflection before completion.
- Editing a completed reflection below the minimum re-locks the debrief.
- The debrief requires all modules plus an explicit fictional-data confirmation.
- Reloading the page restores only a valid version-1 local state.
- The component is included in TypeScript checks and the Care release candidate behind the verified PRO boundary.
