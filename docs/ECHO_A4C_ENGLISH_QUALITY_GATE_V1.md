# ECHO A4C English Quality Gate v1

Status: Preview verified; human clinical-copy approval and automated device-matrix completion remain open; TestFlight and Production are not approved

Review date: 2026-09-05

## Executive scope

The first learner-facing ECHO slice is English-only. It reuses Cliniverse governance, identity, source-rights, accessibility, Remotion and completion-receipt infrastructure, while keeping the ECHO cine engine scientifically separate from the ECG time-series engine. Existing Arabic synthetic fixtures may remain internal regression assets; they are not part of this learner release.

This gate authorizes verification only. It does not authorize Merge, Production, TestFlight, Cloudflare changes, paid services, patient uploads, diagnostic interpretation or CT implementation.

## Frozen Preview evidence

| Item | Verified value |
|---|---|
| Repository | `Drahmed2030/Cliniverse-ai` |
| Engineering commit | `b9ee4321fd23b7c6c7390c8d02997a86023d9132` |
| Governance commit | `b9af163d85d17e2b65e7269a0e6b6e9f5dbbf0dc` |
| Vercel project | `cliniverse-ai-u7gi` |
| Engineering deployment | `dpl_GQhX4PvgBiQX3GPGpWcZNhuEyibw` |
| Deployment state | `READY` / Preview |
| Learner asset | `echo-a4c-normal-cardionetworks-v1-en` |
| Original SHA-1 | `1ae4551bf89fc5f41d4f2632584999230c2dcbab` |
| Derivative SHA-256 | `89e311b8a841a2a6813d4c5ba470aede46ba85780d42b2124330fc01846c783c` |

## Human clinical-review target

Learning objective:

> Recognize the A4C view without over-interpreting a short loop.

Frozen answer key:

1. View identity: `Apical four-chamber (A4C)`.
2. Visible landmarks: `Four chambers, AV valve planes and septa`.
3. Safe conclusion: `Use the source-labelled normal cine for view recognition only`.

The lesson does not teach or claim ejection fraction, chamber measurement, Doppler quantification, pathology exclusion, diagnosis or clinical action. A named human clinical reviewer must approve the objective, wording and answer key before TestFlight or Production.

## Verification receipt

| Gate | Result |
|---|---|
| Unit and contract tests | 186/186 passed |
| TypeScript | Passed |
| Next.js production build | Passed locally |
| Vercel Preview | Ready |
| Live desktop learner flow | Passed |
| Cine playback and containment | Passed |
| Three-answer assessment | Passed |
| Deterministic receipt | `echo-a4c-receipt-v1-a1334a63` |
| Automated phone/iPad/reduced-motion matrix | Blocked locally by unavailable Playwright Chromium download; not an application failure |

The automated device matrix remains a release stop until it runs in an environment with the pinned Playwright browser available. Manual desktop success does not substitute for phone, iPad, landscape and reduced-motion evidence.

## Remotion license gate

The repository currently uses Remotion `4.0.520`. Remotion's published terms state that individuals and organizations of up to three people qualify for the Free License, including unlimited commercial use, and that collaborations or companies of four or more people require a Company License. Before adding `acknowledgeRemotionLicense`, the project owner must record the actual team-size category. No purchase is authorized by this document.

Source: <https://www.remotion.dev/docs/license/pricing>

## Release decisions

| Stage | Decision |
|---|---|
| Vercel Preview | Active for review |
| Clinical-copy approval | Open human gate |
| Automated device matrix | Open technical gate |
| TestFlight | Hold until both open gates pass |
| Production | Not authorized |
| CT | Contract only; blocked on licensed de-identified data and a DICOM threat model |

## Next executable order

1. Record named human approval or requested corrections for the objective and answer key.
2. Run the pinned Playwright device and reduced-motion matrix in CI or another approved browser environment.
3. Resolve the Remotion license declaration from the actual team size; do not infer or purchase.
4. Update the release receipt with reviewer identity, test run and immutable commit SHA.
5. Include the slice in a future TestFlight candidate only under separate approval.

