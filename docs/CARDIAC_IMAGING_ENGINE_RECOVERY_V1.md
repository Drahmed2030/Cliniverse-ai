# Cardiac Imaging Engine Recovery v1

Status: implemented architecture boundary on the isolated strategy branch; no Apple, Production, database, paid-service, upload, or patient-data change

## Executive decision

The preserved ECHO, CT and radiology fragments contain useful teaching ideas, but they are not medical imaging engines. They must not be restored under an analysis or diagnostic claim.

Cliniverse will use one governed learning and media contract with three modality-specific scientific engines:

| Modality | Scientific object | Engine decision | Current state |
|---|---|---|---|
| ECG | time-series electrical signal | deterministic parametric waveform renderer | strategy prototype |
| ECHO | ordered ultrasound cine frames | dedicated cine-frame engine | contract only |
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

This is deliberately a contract, not a simulated echocardiogram. The first visual ECHO implementation may show cardiac-motion orientation only after a cardiology reviewer approves its learning objective and labels. It must never manufacture EF, chamber dimensions, Doppler values, pathology or diagnostic findings from text.

CT remains contract-only. No CT learning asset is accepted until its source, license, de-identification status, teaching objective and reviewer are recorded. A production-quality CT renderer would later use a DICOM/DICOMweb viewer and a volume/MPR engine; dependency selection remains a separate architecture and security decision.

## Next gates

1. Define one narrow ECHO learning objective and a cardiology-reviewed answer key.
2. Build a deterministic synthetic cine phantom with accessible frame descriptions and reduced-motion behavior.
3. Bind it to the Clinical Studio bilingual lesson/media compiler and a structural completion receipt.
4. Verify phone and tablet behavior in the future TestFlight candidate.
5. Select a licensed, de-identified ECHO teaching dataset only after rights and privacy review.
6. Start CT only after ECHO proves the shared governance contract and a DICOM security threat model is approved.

Real-patient upload, automated interpretation, measurements, diagnostic claims, PACS connectivity and clinical action remain a separate regulated-risk program.
