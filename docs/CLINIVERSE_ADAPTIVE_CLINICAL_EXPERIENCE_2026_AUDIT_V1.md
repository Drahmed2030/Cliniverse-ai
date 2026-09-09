# Cliniverse Adaptive Clinical Experience 2026 — Audit v1

Status: STARTED / READ-ONLY FINDINGS CAPTURED

Branch under review: `feature/echo-competency-engine-v1`

## Objective

Prepare Cliniverse for resizable, foldable, iPhone, iPad, mirrored and future multi-window clinical experiences without coupling the product to named device models. Preserve the current competency, governance and learner-state architecture while allowing the visual workspace to adapt to available geometry.

## Architectural rule

**Capability- and geometry-based, never device-name-based.**

The UI must adapt to available width, height and interaction capability. It must not branch on `iPhone18`, a specific foldable model, or equivalent marketing device names.

## Layout modes

### COMPACT
Focused single-column clinical learning flow for narrow mobile surfaces.

### EXPANDED
Two-pane clinical workspace for large phones, foldable-open states and intermediate resizable windows.

### WIDE_CLINICAL
Three-zone workspace for iPad, large foldable surfaces and wide desktop/mirroring windows:

`case/navigation | clinical media | interpretation/competency`

These are semantic workspace modes, not device identities.

## State continuity rule

Layout changes, resize, fold/unfold, rotation-equivalent geometry changes and window resizing must not create a new learner attempt or silently reset:

- case identity;
- attempt identity;
- current lead/view;
- zoom/pan state;
- annotations;
- answer state;
- confidence state;
- telemetry continuity;
- competency evidence lineage.

Clinical/learner state must be independent from layout state.

## Initial current-branch findings

### P0 — Portrait lock in PWA manifest

`public/manifest.json` currently declares `"orientation": "portrait"`.

This conflicts with the adaptive-workspace direction and should be treated as a release/configuration constraint to remove only after runtime layout validation demonstrates safe behavior across wide and resizable geometries.

Do not change it blindly before that validation.

### P0 — Legacy ECG challenge contains fixed geometry

`app/components/EcgChallenge.tsx` currently uses a fixed synthetic SVG design surface:

- `svgW = 340`;
- `svgH = 80`;
- waveform path generation tied to that fixed coordinate system.

The SVG itself renders with `width="100%"` and a viewBox, so basic visual scaling is possible, but the underlying interaction/clinical geometry contract is not suitable as the future governed ECG renderer baseline.

This component is legacy/synthetic educational UI and must not become the canonical implementation for governed ECG cases.

### P0 — Synthetic ECG path is not the governed waveform path

The current legacy ECG challenge generates visual ECG paths procedurally. That is acceptable only for preview/legacy synthetic UX. It must remain isolated from the governed ECG learner path, whose source waveform, calibration, provenance and renderer identity are already governed separately.

### P1 — Layout behavior must be container/scene driven

The target architecture should use container/scene geometry and CSS/container-query style adaptation rather than global screen assumptions.

No new runtime code should be introduced that depends on named device models or static screen bounds.

### P1 — Fold/unfold is a layout transition, not a session transition

A fold/open/resize transition must preserve the same competency attempt and telemetry chain. Only the presentation shell may recompose.

### P1 — ECG workspace opportunity

Expanded and wide modes should support:

- persistent waveform pane;
- interpretation/answer pane;
- measurements/skills/feedback pane when space permits;
- lead labels and calibration remaining readable;
- no geometry distortion;
- no silent crop;
- zoom/pan state continuity.

### P1 — Echo workspace opportunity

Expanded and wide modes should support media plus interpretation/measurement feedback simultaneously while preserving the existing Echo playback/governance boundaries.

## Non-goals for this track

This track does **not**:

- change ECG clinical truth;
- change Echo clinical truth;
- alter learner readiness;
- bypass renderer/device baselines;
- modify Evidence Ledger state;
- create hospital integrations;
- add DICOM/FHIR/vendor adapters;
- change Supabase schemas;
- deploy or merge.

## Recommended implementation sequence

1. Verify the in-flight Adaptive ECG Case Selection contract first.
2. Complete a branch-specific UI/resizability inventory of active learner surfaces.
3. Introduce semantic layout-mode contract (`COMPACT`, `EXPANDED`, `WIDE_CLINICAL`).
4. Add state/layout separation contract tests.
5. Adapt governed ECG learner surface first.
6. Adapt governed Echo learner surface second.
7. Validate with resizable browser/Xcode tooling where available.
8. Validate real iPhone/iPad/foldable hardware when accessible.
9. Only after validation, remove orientation restrictions that are no longer required.

## Acceptance principles

Adaptive Experience work is acceptable only if:

- competency engine behavior is unchanged;
- attempt identity survives resize/recomposition;
- clinical media geometry remains trustworthy;
- no source/vendor/device-specific rendering forks are introduced;
- narrow and wide modes use one governed state model;
- unsupported device evidence remains HOLD rather than being inferred as PASS.

## Executive decision

Adaptive Clinical Experience 2026 is an approved parallel, non-blocking roadmap track. It must strengthen the commercial learner experience without delaying governed case expansion, scoring, mastery, review scheduling or adaptive selection.
