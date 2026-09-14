# Focused media research — 14 September 2026

## Sources checked and decisions

| Source | Verified finding | Decision for Cliniverse |
| --- | --- | --- |
| [PTB-XL 1.0.3](https://physionet.org/content/ptb-xl/1.0.3/) | 21,799 ten-second, 12-lead ECGs; waveform files, statements and checksums; CC BY 4.0 | Primary candidate pool for ECG selection. Use exact record/version and human waveform review before pairing with a teaching case. A label alone does not prove an acute event or the entire fictional scenario. |
| [PTB-XL+ 1.0.1](https://physionet.org/content/ptb-xl-plus/1.0.1/) | Supplementary algorithm-derived features, median beats and fiducial points; original human annotations remain distinct | Potential measurement comparison aid, not automatic clinical approval or justification to replace the current renderer. |
| [EchoNet-Dynamic](https://echonet.github.io/dynamic/) | Research agreement limits use to non-commercial research and restricts redistribution and derivatives | Not an eligible commercial-app media source under these published terms. No download or acceptance performed. |
| [Existing A4C source](https://commons.wikimedia.org/wiki/File:A4C_normal_(CardioNetworks_ECHOpedia).webm) | CardioNetworks/Vdbilt attribution; CC BY-SA 3.0; file-specific permissions with stated exceptions elsewhere | Retain existing governed derivative and viewer. Check each pathology file independently; do not infer blanket reuse permission from the site name. |
| [ECG image dataset framework, May 2025](https://arxiv.org/abs/2506.06315) | Research generates labelled ECG images from PTB-XL signals for digitisation and segmentation | Useful technique for traceable rendering/testing. It is not evidence that an AI-generated illustrative tracing is clinically valid. No new dependency adopted. |

This is a targeted current-source check, not an exhaustive review or a claim that these are
the newest products. Existing open waveforms are more useful to this immediate need than
adding an image-generation model. Proposed approach: select source signal, preserve timing,
lead labels and calibration in the existing renderer, record its checksum and transformation,
then review the exact visual and clinical pairing. SVG can serve diagrams or a faithful
waveform export; Canva/Figma can organise explanation and layout, not certify clinical media.

## Present boundaries

One supplementary A4C link remains available. Five historical pathology candidates still have
artifact-specific review blockers; 14 cases remain without matched media. Research did not
create new clinical approvals, download patient datasets, or activate new media.

## Ward implementation implications

Three source-based reflections connect the existing fictional Ward snapshot to ECG report
provenance, missing Echo evidence and the separation of educational examples from patient
examinations. Related topics open the existing case player from Ward and Atlas, only in the
reviewer preview where the route is enabled. Reflections do not write or score an attempt.

Read-only live schema check found ward_practice_checkpoints.content_version restricted to
w1-handover-1.0.0, w1-pending-1.0.0 and w1-recipient-1.0.0. These frozen tasks remain intact.
New persistable scenario versions require a separately reviewed schema/content migration;
the added reflections do not silently reinterpret existing checkpoints.
