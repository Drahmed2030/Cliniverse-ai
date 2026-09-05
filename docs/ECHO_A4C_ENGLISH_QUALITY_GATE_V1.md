# ECHO A4C English Quality Gate v1

Status: Preview verified; human clinical-copy approval recorded; automated device-matrix completion remains open; TestFlight and Production are not approved

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

The lesson does not teach or claim ejection fraction, chamber measurement, Doppler quantification, pathology exclusion, diagnosis or clinical action.

Human approval record: Dr. Ahmed Osman, project owner and physician, approved the objective, wording and answer key for English Preview use on 2026-09-05. This approval is limited to the bounded educational objective above and does not authorize diagnostic claims, TestFlight or Production.

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
| Automated phone/iPad/reduced-motion matrix | CI workflow configured; local run blocked by unavailable Playwright Chromium download, not an application failure |

The automated device matrix remains a release stop until it runs in an environment with the pinned Playwright browser available. The `Clinical visual quality` workflow now installs Chromium automatically, supports manual dispatch, and covers the engineering branches. Manual desktop success does not substitute for phone, iPad, landscape and reduced-motion evidence.

## Remotion license gate

The repository currently uses Remotion `4.0.520`. The project owner confirmed a team size of three people or fewer, placing this project in Remotion's Free License category for the current scope. Remotion's published terms include unlimited commercial use for that category. No paid license, license key or subscription is authorized by this document. The existing v4 Player warning remains an informational engineering warning; it will not be suppressed by an unverified code assertion.

Source: <https://www.remotion.dev/docs/license/pricing>

## Release decisions

| Stage | Decision |
|---|---|
| Vercel Preview | Active for review |
| Clinical-copy approval | Approved for bounded English Preview scope |
| Automated device matrix | Open technical gate |
| TestFlight | Hold until both open gates pass |
| Production | Not authorized |
| CT | Contract only; blocked on licensed de-identified data and a DICOM threat model |

## Next executable order

1. Run the pinned Playwright device and reduced-motion matrix in CI or another approved browser environment.
2. Update the release receipt with reviewer identity, test run and immutable commit SHA.
3. Include the slice in a future TestFlight candidate only under separate approval.
