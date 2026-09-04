# Cliniverse Clinical Studio Contract v0

Status: future-branch prototype. Human clinical, legal, accessibility, and localization review required.

## Purpose

One versioned content object should drive each interactive lesson, modality-specific deterministic visual, Remotion video, narration, Arabic/English variants, and completion receipt. This prevents the lesson, video, assessment, and pathway evidence from becoming separate sources of truth while keeping each scientific renderer independent.

## First complete loop

`Door-to-ECG gap → Code Lab ECG acquisition drill → deterministic completion receipt → reassessment → reviewer closure gate`

The synthetic ECHO loop is separate from the pathway result and internal-only:

`Synthetic cine orientation → manual or reduced-motion-safe frame review → two-question boundary check → deterministic session receipt → human clinical review gate`

The baseline replay remains immutable. The post-training value is an illustrative simulation, never a measured clinical outcome.

## Required fields

- Stable asset ID and semantic content version.
- Stable Code Lab activity, player, and answer-key versions.
- Locale and intended use.
- Explicit `synthetic-non-clinical` data mode.
- Human-review status.
- Explicit learner or internal-engine-only surface access.
- Linked training activity and evidence references.
- Ordered scenes with frame durations and narration keys.
- Modality and modality-specific engine version.
- Deterministic waveform lead set or deterministic cine-frame specification.
- Permanent safety disclaimer.

The executable contract is in `app/lib/clinicalMedia/clinicalStudioManifest.ts`.

## Rendering strategy

The ECG web experience and 24-second Remotion composition consume the same manifest and deterministic SVG waveform engine. The Code Lab activity contract binds the same content asset and version to the deterministic assessment and its same-session completion receipt. Its four scenes are pathway gap context, waveform inspection, evidence verification and illustrative reassessment.

The internal ECHO web experience and 18-second Remotion composition consume the same deterministic 90-frame cine core. Its four scenes are modality boundary, ordered frames, safe motion description and human review gate. The Canvas lesson provides explicit play, pause, previous, next and frame-scrubber controls without autoplay. Reduced-motion mode disables automatic playback and leaves manual frame inspection available. Its boundary assessment produces one session-only receipt bound to the localized asset, phantom source, cine engine and answer key. The learner compiler rejects this program until a separate real-media asset clears the rights and clinical gates.

Both programs support English and Arabic plus explicit 16:9, 9:16 and 1:1 profiles. ECG and ECHO share governance infrastructure but never share a scientific renderer.

The in-app Player is click-to-play, loaded on demand, and honours the operating-system reduced-motion preference. Export rendering is intentionally not connected to a cloud renderer in v0, keeping the prototype deployment-neutral and free from a new service dependency.

## Evidence policy

The current slices use synthetic waveforms and retain an internally authored abstract motion phantom for engineering tests only. Any later PhysioNet or ECHO teaching material must be reviewed file by file for access controls, license, attribution, permitted commercial and derivative use, de-identification and governance approval before ingestion. Candidate research is recorded in `ECHO_REAL_MEDIA_RIGHTS_GATE_V1.md`; no external media is approved by this document.

Generated or uploaded patient-identifiable media is outside this contract. Generative video may be used only for non-diagnostic atmosphere or brand material after rights and privacy review; waveform truth remains deterministic code.

The completion receipt is structural evidence that the configured synthetic answer key passed. It is not certification, a digital signature, clinical validation, or proof of a patient outcome.

## Non-goals

- Diagnosis, treatment advice, activation, or autonomous clinical decision-making.
- AHA certification or replacement for authorized training.
- Real-patient data, database writes, or production telemetry.
- Claims of improved patient outcomes.
