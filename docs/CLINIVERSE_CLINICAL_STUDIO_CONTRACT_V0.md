# Cliniverse Clinical Studio Contract v0

Status: future-branch prototype. Human clinical, legal, accessibility, and localization review required.

## Purpose

One versioned content object should drive the interactive lesson, deterministic ECG visual, Remotion video, narration, Arabic/English variants, and Code Lab completion receipt. This prevents the lesson, video, assessment, and pathway evidence from becoming separate sources of truth.

## First complete loop

`Door-to-ECG gap → Code Lab ECG acquisition drill → deterministic completion receipt → reassessment → reviewer closure gate`

The baseline replay remains immutable. The post-training value is an illustrative simulation, never a measured clinical outcome.

## Required fields

- Stable asset ID and semantic content version.
- Stable Code Lab activity, player, and answer-key versions.
- Locale and intended use.
- Explicit `synthetic-non-clinical` data mode.
- Human-review status.
- Linked training activity and evidence references.
- Ordered scenes with frame durations and narration keys.
- Deterministic waveform engine version and lead set.
- Permanent safety disclaimer.

The executable contract is in `app/lib/clinicalMedia/clinicalStudioManifest.ts`.

## Rendering strategy

The web experience and a 24-second Remotion composition now consume the same manifest and deterministic SVG waveform engine. The Code Lab activity contract binds the same content asset and version to the deterministic assessment and its same-session completion receipt. The composition contains four contiguous scenes: pathway gap context, waveform inspection, evidence verification, and illustrative reassessment. It supports English and Arabic plus explicit 16:9, 9:16, and 1:1 profiles.

The in-app Player is click-to-play, loaded on demand, and honours the operating-system reduced-motion preference. Export rendering is intentionally not connected to a cloud renderer in v0, keeping the prototype deployment-neutral and free from a new service dependency.

## Evidence policy

The first slice uses synthetic waveforms only. Any later PhysioNet material must be reviewed dataset by dataset for access controls, license, attribution, permitted derivative use, and governance approval before ingestion. No dataset is approved by this document.

Generated or uploaded patient-identifiable media is outside this contract. Generative video may be used only for non-diagnostic atmosphere or brand material after rights and privacy review; waveform truth remains deterministic code.

The completion receipt is structural evidence that the configured synthetic answer key passed. It is not certification, a digital signature, clinical validation, or proof of a patient outcome.

## Non-goals

- Diagnosis, treatment advice, activation, or autonomous clinical decision-making.
- AHA certification or replacement for authorized training.
- Real-patient data, database writes, or production telemetry.
- Claims of improved patient outcomes.
