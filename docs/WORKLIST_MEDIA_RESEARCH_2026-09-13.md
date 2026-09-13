# Worklist media binding and focused interoperability review

Delivered: fixed per-request mapping to existing ECG and Echo review routes, opening a separate tab to preserve the in-memory checklist. Source, availability and separate-example identity are explicit. No patient/examination association, checklist completion, import or hospital access is inferred from opening a viewer.

ECG requires the existing reviewed record10 PDF selected locally, with the existing byte-count/SHA-256 validation. No PDF redistributed. Echo uses the existing governed A4C player and source/license display. No second viewer, package dependency or clinical scoring change.

Research read 2026-09-13:
- OHIF documentation: https://docs.ohif.org/ — currently presents 3.13 Beta and 3.11 documentation. Cornerstone3D rendering, DICOMweb archives, pluggable data sources, metadata-first/pixel streaming. Do not adopt beta merely for novelty.
- DICOM PS3.18 2026c: https://dicom.nema.org/medical/dicom/current/output/chtml/part18/chapter_10.html — QIDO-RS search and WADO-RS retrieval including frames. A hospital endpoint and format compatibility must be tested before deployment.
- SMART App Launch: https://hl7.org/fhir/smart-app-launch/ — scoped authorization for FHIR systems; it is not a substitute for PACS connectivity or diagnostic viewer validation.

Decision: reuse viewers now. Evaluate a DICOMweb adapter against one institution's sandbox later; use SMART where its EHR supports it. No interoperability/conformance claim, new subscription, real hospital connection or diagnostic-use approval.
