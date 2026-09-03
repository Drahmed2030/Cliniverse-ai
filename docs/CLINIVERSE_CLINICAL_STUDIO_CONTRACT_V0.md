# Cliniverse Clinical Studio Contract v0

Status: future-branch prototype. Human clinical, legal, accessibility, and localization review required.

## Purpose

One versioned content object should drive the interactive lesson, deterministic ECG visual, future Remotion video, narration, and Arabic/English variants. This prevents the lesson, video, and assessment from becoming separate sources of truth.

## First complete loop

`Door-to-ECG gap → ECG acquisition drill → deterministic answer key → reassessment → reviewer closure gate`

The baseline replay remains immutable. The post-training value is an illustrative simulation, never a measured clinical outcome.

## Required fields

- Stable asset ID and semantic content version.
- Locale and intended use.
- Explicit `synthetic-non-clinical` data mode.
- Human-review status.
- Linked training activity and evidence references.
- Ordered scenes with frame durations and narration keys.
- Deterministic waveform engine version and lead set.
- Permanent safety disclaimer.

The executable contract is in `app/lib/clinicalMedia/clinicalStudioManifest.ts`.

## Rendering strategy

The web experience renders the ECG from deterministic SVG paths. A later Remotion composition may consume the same manifest and waveform engine to render video, subtitles, and localized narration. Remotion is intentionally not installed in this slice: the contract is prepared first, keeping the interactive prototype small and deployment-neutral.

## Evidence policy

The first slice uses synthetic waveforms only. Any later PhysioNet material must be reviewed dataset by dataset for access controls, license, attribution, permitted derivative use, and governance approval before ingestion. No dataset is approved by this document.

## Non-goals

- Diagnosis, treatment advice, activation, or autonomous clinical decision-making.
- AHA certification or replacement for authorized training.
- Real-patient data, database writes, or production telemetry.
- Claims of improved patient outcomes.
