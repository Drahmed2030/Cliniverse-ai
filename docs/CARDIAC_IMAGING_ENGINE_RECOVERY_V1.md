# Cardiac Imaging Engine Recovery v1

Status: synthetic ECHO cine retained as an internal engine prototype and removed from the learner surface; real-media rights and clinical review remain required; no Apple, Production, database, paid-service, upload, or patient-data change

## Executive decision

The preserved ECHO, CT and radiology fragments contain useful teaching ideas, but they are not medical imaging engines. They must not be restored under an analysis or diagnostic claim.

Cliniverse will use one governed learning and media contract with three modality-specific scientific engines:

| Modality | Scientific object | Engine decision | Current state |
|---|---|---|---|
| ECG | time-series electrical signal | deterministic parametric waveform renderer | strategy prototype |
| ECHO | ordered cine frames | dedicated deterministic cine-frame engine | internal engine prototype; learner access blocked |
| CT | calibrated voxel volume and DICOM metadata | dedicated DICOM volume/MPR engine | contract only |

The three engines may share identity, source, rights, localization, review, accessibility, lesson and receipt infrastructure. They do not share a scientific renderer.

## Legacy inventory and disposition

| Preserved code | What it actually does | Decision |
|---|---|---|
| `LiveCaseViewer.tsx` ECHO and X-ray visuals | changes illustrative SVG geometry after matching generated text | preserve the teaching concept; retire as imaging evidence |
| `GrandRoundsAI.tsx` | static fictional case and text findings | extract only reviewed scenario structure |
| `RadiologyModule.tsx` | hard-coded CXR/CT summaries and quiz | rewrite into sourced, versioned lessons; do not restore the present action language |
| `ToolsPage.tsx` AI Imaging | uploads a browser image and sends it to `/api/medical-ai` | quarantine; no patient or clinical upload in this program |
| `generate-case` route | asks a language model to invent ECG, ECHO and X-ray findings | quarantine from governed imaging content |

The current Apple entry is `ReleaseApp`; it does not import these legacy imaging components.

## First safe slice

`app/lib/clinicalMedia/imagingEngineContract.ts` now makes the engine boundary executable. It provides:

- a distinct engine identity and scientific model for ECG, ECHO and CT;
- an explicit prohibition on diagnosis and patient data;
- an ECHO-only synthetic motion-phantom manifest in English and Arabic;
- stable provenance, rights, review and disclaimer fields; and
- validation that rejects routing an ECHO asset through the ECG engine.

The first visual implementation is deliberately an abstract synthetic motion phantom, not a simulated echocardiogram. `echoCinePhantom.ts` emits one deterministic 90-frame cycle and bilingual frame descriptions. The web adapter renders it to Canvas; the Remotion adapter consumes the same frame model. Reduced-motion mode disables automatic Canvas playback and freezes the Remotion visual at one representative frame while preserving manual frame stepping.

Clinical Studio now compiles an 18-second ECHO timeline in English and Arabic for 16:9, 9:16 and 1:1. The linked two-question lesson checks only the scientific object and the permitted non-diagnostic observation. A passing answer creates a deterministic, session-only structural receipt bound to the localized asset, engine, source and answer-key versions.

This implementation is now classified `internal-engine-only`. The learner compiler fails closed if asked to compile the synthetic ECHO program, and the learner-facing Clinical Studio no longer imports or offers its Canvas lesson or Remotion composition. The prototype remains useful for deterministic frame, localization, accessibility and receipt tests, but is not learner content. It does not calculate or manufacture EF, chamber dimensions, Doppler values, pathology or diagnostic findings.

The real-media candidate and acceptance policy is recorded in `ECHO_REAL_MEDIA_RIGHTS_GATE_V1.md`. No external video has been downloaded, copied into the repository or approved for learner use.

CT remains contract-only. No CT learning asset is accepted until its source, license, de-identification status, teaching objective and reviewer are recorded. A production-quality CT renderer would later use a DICOM/DICOMweb viewer and a volume/MPR engine; dependency selection remains a separate architecture and security decision.

## Gate state

1. Synthetic ECHO learning objective and deterministic answer key: retained for internal engineering tests only.
2. Deterministic synthetic cine phantom, bilingual frame descriptions and reduced-motion behavior: implemented; learner access blocked.
3. Clinical Studio, Remotion, bilingual lesson and structural completion receipt: retained internally; no longer imported by the learner surface.
4. Learner-surface fail-closed access contract: implemented; Preview and TestFlight unchanged.
5. Real ECHO media: permissive-license candidates identified; file-by-file rights, privacy and clinical review required before any download or ingestion.
6. CT implementation: not started; remains blocked on dataset approval and a DICOM security threat model.

Real-patient upload, automated interpretation, measurements, diagnostic claims, PACS connectivity and clinical action remain a separate regulated-risk program.
