# Clinical Studio Responsive Display v1

Status: local strategy-branch implementation; device verification and quality gates pending; no Push, Merge, Production, Apple, database, paid-service or patient-data change

Date: 2026-09-04

## Executive decision

Clinical Studio keeps the existing visual system and the independent ECHO/ECG scientific engines. This slice corrects the display layer and information hierarchy only. It does not add a modality, diagnosis, clinical claim or new content library.

The four priorities are:

1. Separate the selected export canvas from the viewport used to inspect it.
2. Put the cine or signal first, followed by concise study notes and a short assessment.
3. Keep one calm, expandable Preview-status record instead of repeating warning language across the same lesson.
4. Verify the same surface at explicit phone, tablet, landscape and desktop viewport contracts.

## XS Max finding and correction

The supplied iPhone XS Max capture exposed a real containment defect. Remotion emitted the selected portrait composition with an inline `720px × 1280px` root size. The existing CSS class attempted to limit the width to `390px`, but a class cannot override that inline width. The outer stage used `overflow: hidden`, so the right side of the composition and the source credit appeared cropped.

The source derivative itself is complete at `624×480`, and its full bottom credit is present. The application now passes an explicit responsive width through the Remotion `style` prop, which makes Remotion compute the correct aspect ratio before painting. A separate viewport wrapper caps the visual preview by both available width and `72dvh`, while the export contract remains unchanged:

| Export format | Frozen output | Device-preview rule |
|---|---:|---|
| Landscape | 1280×720 | fit within width and 72% of the dynamic viewport height |
| Portrait | 720×1280 | fit within width, 390px review width and 72% of viewport height |
| Square | 1080×1080 | fit within width, 560px review width and 72% of viewport height |

Video descendants also receive explicit `object-fit: contain` and centered positioning. The global Cliniverse watermark is retained, marked decorative, and reduced in size and opacity below 760px so it does not compete with clinical media on high-density phone screens.

## Device contract

The browser matrix now names the target classes rather than relying on one generic mobile size:

| Target | Viewport | Purpose |
|---|---:|---|
| iPhone XS Max | 414×896 | supplied-device regression |
| iPhone Pro | 393×852 | current narrow-phone baseline |
| iPhone landscape | 852×393 | orientation and dynamic-height containment |
| iPad portrait | 820×1180 | tablet layout |
| Desktop | 1440×900 | Mac/PC responsive layout baseline |

The automated contract checks all three export formats for stage containment, preview overflow, media `contain` behavior and 44px format controls. It also runs the A4C assessment, source disclosure and WCAG scan with Reduced Motion enabled.

## Information hierarchy

The rights and clinical gates are unchanged in data and code. Their presentation is consolidated:

- one neutral, expandable Preview-status row states the current release gate;
- three concise A4C study notes precede the three-question check;
- source, license, transformations, disclaimer and checksum remain accessible in one expandable source record; and
- alert styling is reserved for an answer that actually needs correction.

This reduces alert fatigue without weakening provenance, attribution, clinical review or learner-release controls.

## Gemini boundary

Gemini can assist a later editorial workflow, but it is not a rights-cleared clinical case library and it is not the system of record for ECHO or ECG media.

- [Gemini File Search](https://ai.google.dev/gemini-api/docs/file-search) indexes user-provided documents for retrieval and currently does not support audio or video.
- [Gemini Files API](https://ai.google.dev/gemini-api/docs/files) can accept media for model interaction, but uploaded files are temporary and retained for 48 hours rather than acting as a permanent product repository.
- [Google Search grounding](https://ai.google.dev/gemini-api/docs/google-search) can help discover candidates and return citations, but file-level license, privacy, checksum and clinical review must still be verified independently.

Therefore no Gemini integration, bulk import or paid-service dependency is added in this slice. A future Gemini-assisted curation adapter may propose tags, draft study notes and question candidates, but it must never author the source diagnosis, grant media rights, bypass a reviewer or become the canonical asset store.

## Next bounded work

1. Complete responsive and accessibility gates for this A4C display correction.
2. Obtain clinical approval of the English A4C copy and answer key before any learner release.
3. In a separate approved tranche, ingest five calibrated PTB-XL records through the existing ECG real-signal contract and attach source-labelled notes, questions and receipts.
4. Keep CT contract-only and keep Apple and Production unchanged.
