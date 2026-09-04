# Cardiac Imaging Engine Recovery v1

Status: synthetic ECHO cine retained as an internal engine prototype; licensed A4C Normal added as a local Preview-only real-media lesson; clinical copy review remains required; no Apple, Production, database, paid-service, upload, or patient-data change

## Executive decision

The preserved ECHO, CT and radiology fragments contain useful teaching ideas, but they are not medical imaging engines. They must not be restored under an analysis or diagnostic claim.

Cliniverse will use one governed learning and media contract with three modality-specific scientific engines:

| Modality | Scientific object | Engine decision | Current state |
|---|---|---|---|
| ECG | time-series electrical signal | deterministic parametric waveform renderer | strategy prototype |
| ECHO | ordered cine frames | dedicated cine-frame engine with licensed-file adapter | synthetic engine internal; real A4C Preview candidate implemented |
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

The real-media candidate and acceptance policy is recorded in `ECHO_REAL_MEDIA_RIGHTS_GATE_V1.md`. The exact A4C Normal source is now represented by a privacy-hardened local H.264 derivative with frozen original and derivative checksums, file-level CC BY-SA 3.0 attribution, VRT permission identity and disclosed transformations. It drives a 20-second English-only Remotion composition, three-part lesson, deterministic assessment and session-only receipt in Clinical Studio Preview. The source selection is approved; the learning copy and answer key remain human-review gated and the media has not been pushed or deployed.

Core ECG and ECHO clinical media are now English-only by product decision. Existing Arabic synthetic contracts may remain as internal regression fixtures, but the learner Clinical Studio no longer offers a language switch. Localization elsewhere in Cliniverse is unchanged.

The real-ECG sourcing path is recorded in `ECG_REAL_SIGNAL_SOURCE_GATE_V1.md` and encoded in `realEcgSourceRegistry.ts`. PTB-XL, MIT-BIH Arrhythmia and LUDB provide the approved curation sources. No ECG signal file is ingested in this A4C change; the next slice will import five calibrated WFDB records and render original samples rather than screenshots or generated waveforms.

CT remains contract-only. No CT learning asset is accepted until its source, license, de-identification status, teaching objective and reviewer are recorded. A production-quality CT renderer would later use a DICOM/DICOMweb viewer and a volume/MPR engine; dependency selection remains a separate architecture and security decision.

## Gate state

1. Synthetic ECHO learning objective and deterministic answer key: retained for internal engineering tests only.
2. Deterministic synthetic cine phantom, bilingual frame descriptions and reduced-motion behavior: implemented; learner access blocked.
3. Clinical Studio, Remotion, bilingual lesson and structural completion receipt: retained internally; no longer imported by the learner surface.
4. Learner-surface fail-closed access contract: synthetic ECHO remains blocked; real A4C is explicitly `preview-only`; TestFlight and Production unchanged.
5. Real ECHO media: A4C rights, checksums, all-frame technical privacy review, attribution and local derivative passed; clinical learning-copy review and device verification remain open.
6. CT implementation: not started; remains blocked on dataset approval and a DICOM security threat model.

Real-patient upload, automated interpretation, measurements, diagnostic claims, PACS connectivity and clinical action remain a separate regulated-risk program.
