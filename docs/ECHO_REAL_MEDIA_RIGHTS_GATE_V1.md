# ECHO Real Media Rights Gate v1

Status: candidate research only; no external media downloaded, copied, committed, deployed or approved

Date reviewed: 2026-09-04

## Executive decision

Real echocardiography cine can be sourced without a paid media subscription. The current best route is a small file-level selection from openly licensed Wikimedia Commons material, not a bulk research dataset. “Free to access” is not enough: every accepted file must explicitly permit commercial reuse and adaptation, carry stable attribution, show no patient identifier, and pass clinical review.

The synthetic ECHO phantom remains `internal-engine-only`. It cannot return to the learner surface as a substitute for real imaging.

## Candidate set A — CardioNetworks ECHOpedia on Wikimedia Commons

The Wikimedia Commons ECHOpedia category currently indexes 917 media files. The normal-view files checked below identify CardioNetworks as the copyright owner, use Creative Commons Attribution-ShareAlike 3.0, and carry Wikimedia Volunteer Response Team confirmation under ticket `2011102310008874`. Their file pages state that the works may be used for any purpose when the license requirements are followed.

| Candidate | Educational role | File-level license | Rights state |
|---|---|---|---|
| [A2C normal](https://commons.wikimedia.org/wiki/File:A2Cnormal_(CardioNetworks_ECGpedia).avi.webm) | apical two-chamber orientation | CC BY-SA 3.0; VRT-confirmed | candidate; attribution, ShareAlike, privacy and clinical review pending |
| [A3C normal](https://commons.wikimedia.org/wiki/File:A3Cnormal_(CardioNetworks_ECGpedia).avi.webm) | apical three-chamber orientation | CC BY-SA 3.0; VRT-confirmed | candidate; attribution, ShareAlike, privacy and clinical review pending |
| [A4C normal](https://commons.wikimedia.org/wiki/File:A4C_normal_(CardioNetworks_ECHOpedia).webm) | apical four-chamber orientation | CC BY-SA 3.0; VRT-confirmed | preferred first loop; attribution, ShareAlike, privacy and clinical review pending |
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

## Acceptance checklist before any download

1. Freeze the exact file page, author, source URL, license URL and Wikimedia revision or equivalent record.
2. Confirm commercial reuse, redistribution, modification and required attribution at file level.
3. Confirm that the license grant covers the media itself rather than only code, documentation or the paper.
4. Review every frame for patient names, dates, accession numbers, institution identifiers, burned-in overlays and unexpected audio.
5. Record consent or publication provenance where available; unresolved privacy provenance remains a stop condition even when copyright is permissive.
6. Obtain a cardiology review of the view label, normal/pathology claim, crop and bilingual teaching copy.
7. Define an in-product attribution surface and, for BY-SA material, a compliant derivative-media distribution policy.
8. Only after approval, acquire the exact source file, compute its checksum, transcode reproducibly if needed and test browser, Remotion, iPhone/iPad and reduced-motion behavior.

## First proposed learner slice

Use one normal A4C cine only. Teach view orientation and frame navigation without EF, chamber measurement, Doppler quantification, pathology classification or diagnostic inference. Add A2C/A3C/A5C only after the same file-level review. This limits clinical scope while proving the real-media ingestion, attribution and accessibility path.

No purchase or new paid service is required for this gate. Legal interpretation and clinical approval remain human decisions.
