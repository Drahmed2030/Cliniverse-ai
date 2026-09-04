# ECHO Real Media Rights Gate v1

Status: A4C Normal source and local privacy-hardened derivative verified; Preview implementation only; clinical lesson-copy review, Push, Preview deployment and Production approval remain pending

Date reviewed: 2026-09-04

## Executive decision

Real echocardiography cine can be sourced without a paid media subscription. The current best route is a small file-level selection from openly licensed Wikimedia Commons material, not a bulk research dataset. “Free to access” is not enough: every accepted file must explicitly permit commercial reuse and adaptation, carry stable attribution, pass frame-level privacy review, and preserve clinical review boundaries.

The synthetic ECHO phantom remains `internal-engine-only`. It cannot return to the learner surface as a substitute for real imaging. A4C Normal is the first real-media Preview candidate and does not make the synthetic phantom learner content.

## A4C Normal implementation record

The exact Wikimedia original was acquired only after the file-level rights decision. Its SHA-1 is `1ae4551bf89fc5f41d4f2632584999230c2dcbab`, matching Wikimedia structured data, and its size is 288,005 bytes. `ffprobe` confirms one 624×480 VP8 video stream, 51 fps, 0.981 seconds and no audio stream.

All 50 decoded frames were inspected in a contact sheet with a full-resolution spot check. No patient name, patient number or accession number was visible, but the original carried a burned-in acquisition date and time in the top-left corner. The local derivative therefore masks only that overlay, removes container metadata, omits audio and re-encodes the video to H.264 MP4 for Safari/iOS compatibility. The bottom source credits and ECHOpedia mark remain visible.

Derivative record:

- path: `public/clinical-media/echo/a4c-normal-cardionetworks-v1.mp4`
- SHA-256: `89e311b8a841a2a6813d4c5ba470aede46ba85780d42b2124330fc01846c783c`
- size: 168,220 bytes
- decoded properties: 624×480, 51 fps, 50 frames, 0.980392 seconds, H.264, no audio
- license notice: `public/clinical-media/echo/A4C_NORMAL_LICENSE.txt`
- adaptation disclosure: acquisition timestamp masked; VP8 WebM re-encoded to H.264 MP4; container metadata removed; no diagnostic annotation added

The derivative remains CC BY-SA 3.0. Its attribution and change notice are rendered in-product, carried in the manifest and stored beside the media. The source selection is approved; the English learning copy and answer key remain explicitly human-review required before Production.

## Candidate set A — CardioNetworks ECHOpedia on Wikimedia Commons

The Wikimedia Commons ECHOpedia category currently indexes 917 media files. The normal-view files checked below identify CardioNetworks as the copyright owner, use Creative Commons Attribution-ShareAlike 3.0, and carry Wikimedia Volunteer Response Team confirmation under ticket `2011102310008874`. Their file pages state that the works may be used for any purpose when the license requirements are followed.

| Candidate | Educational role | File-level license | Rights state |
|---|---|---|---|
| [A2C normal](https://commons.wikimedia.org/wiki/File:A2Cnormal_(CardioNetworks_ECGpedia).avi.webm) | apical two-chamber orientation | CC BY-SA 3.0; VRT-confirmed | candidate; attribution, ShareAlike, privacy and clinical review pending |
| [A3C normal](https://commons.wikimedia.org/wiki/File:A3Cnormal_(CardioNetworks_ECGpedia).avi.webm) | apical three-chamber orientation | CC BY-SA 3.0; VRT-confirmed | candidate; attribution, ShareAlike, privacy and clinical review pending |
| [A4C normal](https://commons.wikimedia.org/wiki/File:A4C_normal_(CardioNetworks_ECHOpedia).webm) | apical four-chamber orientation | CC BY-SA 3.0; VRT-confirmed | selected; rights, checksum and technical privacy review passed; clinical learning-copy review pending |
| [A5C normal](https://commons.wikimedia.org/wiki/File:A5Cnormal_(CardioNetworks_ECHOpedia).webm) | apical five-chamber orientation | CC BY-SA 3.0; VRT-confirmed | candidate; attribution, ShareAlike, privacy and clinical review pending |

This is a commercially compatible license, not an unrestricted asset. Attribution is mandatory, and adaptations must be distributed under the same or a compatible license. The implementation must record whether trimming, overlays, captions or transcoding create an adapted asset and satisfy the resulting notice and ShareAlike obligations.

## Candidate set B — BMC healthy-volunteer cardiac ultrasound

[Ultrasound video of a human heart](https://commons.wikimedia.org/wiki/File:Ultrasound_video_of_a_human_heart_-_1741-7015-9-17.ogv) is sourced to a BMC Medicine publication, describes a healthy male volunteer and is licensed CC BY 2.0. The file license permits sharing and adaptation with attribution and no NonCommercial condition.

This is the strongest low-complexity single-file rights candidate found in the first pass because it avoids ShareAlike. It is not yet approved: the precise view, visible overlays, clinical learning label and privacy provenance must still be reviewed.

## Held or excluded sources

| Source | Decision | Reason |
|---|---|---|
| EchoNet-Dynamic | exclude from product | research agreement prohibits commercial use and redistribution |
| RVENet | exclude from product | research agreement prohibits commercial use, redistribution and derivative works |
| EchoCP | hold | public listings report Apache 2.0, but confirmation that the license covers the patient videos and product redistribution is still required |
| EchoRisk MICCAI 2026 | hold | current license signals conflict across the challenge listing, repository documentation and record metadata |
| CAMUS | hold | public access is clear; product redistribution and commercial-use rights are not yet explicit enough |

## Acceptance checklist for each file

1. Freeze the exact file page, author, source URL, license URL and Wikimedia revision or equivalent record. **A4C: passed.**
2. Confirm commercial reuse, redistribution, modification and required attribution at file level. **A4C: passed; CC BY-SA 3.0 and VRT ticket recorded.**
3. Confirm that the license grant covers the media itself rather than only code, documentation or the paper. **A4C: passed at the Commons file level.**
4. Review every frame for patient names, dates, accession numbers, institution identifiers, burned-in overlays and unexpected audio. **A4C: passed after the acquisition date/time was masked; source credits retained.**
5. Record consent or publication provenance where available; unresolved privacy provenance remains a stop condition even when copyright is permissive. **A4C: Wikimedia VRT permission provenance recorded; no direct patient identifier visible after masking.**
6. Obtain cardiology review of the view label, normal/pathology claim, privacy mask and English teaching copy. **A4C: source selection approved; copy and answer-key review remain open.**
7. Define an in-product attribution surface and, for BY-SA material, a compliant derivative-media distribution policy. **A4C: implemented locally.**
8. Compute checksums, transcode reproducibly if needed and test browser, Remotion, iPhone/iPad and reduced-motion behavior. **A4C: checksum/transcode implemented; automated browser and device review remain open.**

## First proposed learner slice

Use one normal A4C cine only. Teach view identity, landmark recognition and cine observation without EF, chamber measurement, Doppler quantification, pathology classification or diagnostic inference. Add A2C/A3C/A5C only after the same file-level review. This limits clinical scope while proving real-media ingestion, privacy hardening, attribution, Remotion, assessment and receipt infrastructure.

No purchase or new paid service is required for this gate. Legal interpretation and clinical approval remain human decisions.
