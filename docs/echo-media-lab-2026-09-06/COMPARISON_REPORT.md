# A4C Gold Reference media laboratory — 6 September 2026

**Decision: retain the Foundation Reference; no Gold promotion or learner release.**

Repository: `Drahmed2030/Cliniverse-ai`. Required branch: `feature/echo-competency-engine-v1`. Laboratory baseline HEAD: `c26466099bc1e8f833ac68b9e907eae31c5980be`. This report records the completed laboratory phase on that branch. Commit preparation retains compact evidence and excludes temporary artifacts. No Gold promotion, learner release, merge, deployment, Production change, or Supabase apply is part of this work.

## Evidence and scope

Thirteen commercially reusable originals were downloaded after per-source rights review: all 12 existing Echo Batch 01 candidates plus Nature Supplementary Video 2. Every original was hashed with SHA-1 and SHA-256, inspected with ffprobe, decoded in full, and represented by complete numbered contact sheets. **853 original frames and 50 Foundation derivative frames** were screened. All Commons originals contain no audio stream. Nature contains an AAC stream; all 888,832 decoded float samples are exactly zero.

Each candidate subdirectory contains `evidence.json` and `ffprobe.json` (with the machine-specific filename reduced to its basename). Per-frame timestamp and MD5 exports remain outside git; measured frame counts and interval summaries are retained in the evidence. Evidence preserves canonical page and original media URLs, license terms/conditions, page snapshot checksum, source checksums, contact-sheet checksums, and review observations. Raw originals, full page snapshots, frames, contact sheets and execution logs remain quarantined outside the repository. Contact-sheet names and checksums identify excluded review artifacts, not files shipped in this commit. Reproduction uses the original URL in evidence, verifies the source hash, then runs `python scripts/inspect-echo-media.py MEDIA NEW_OUTPUT_DIRECTORY`. The script never approves rights or release. Contact sheets are downscaled review derivatives; full-resolution frame 1 was also inspected for every asset. Static 375 px renderings were screened for mobile readability; this is not physical iOS/iPad playback validation.

Public Commons per-file notices identify CC BY-SA 3.0 and VRT ticket 2011102310008874. Attribution, source/license links, changes and ShareAlike must follow any derivative. The private VRT correspondence was not accessed. Nature's article is CC BY 4.0, and its linked Supplementary Video 2 has no separate restrictive credit in the page entry or visible frames. These rights findings do not constitute privacy or clinical approval.

## Foundation comparison

The existing H.264 MP4 is unchanged: 624×480, 51 fps, 50 frames, 0.980392 seconds, 168,220 bytes. SHA-256: `89e311b8a841a2a6813d4c5ba470aede46ba85780d42b2124330fc01846c783c`. The downloaded Commons original also matches the frozen source SHA-1 `1ae4551bf89fc5f41d4f2632584999230c2dcbab`.

The original's acquisition date/time is visible; the existing derivative masks it throughout the reviewed frames. Source credits, ECG, depth scale and acquisition parameters remain. Four chambers and AV-valve planes are visible, with ordered motion across the short loop. This preserves its **source-labelled normal, view-recognition, preview-only** role. It does not prove pathology exclusion, measurement suitability, or approved discrimination training. Clinical copy approval remains outstanding.

The repaired existing Media Standard benchmarks the Foundation at **69/100**, with Gold blockers for unconfirmed normal-reference clinical approval, incomplete clinical review, distracting overlays and unapproved discrimination suitability. The scoring weights and eight-point replacement margin remain unchanged. New explicit blocking gates prevent high pixels/fps from outweighing these requirements.

Candidate scores below are conservative evidence-completeness scores, **not a validated clinical quality ranking**. Unknown clinical, privacy and device approvals remain false. They cannot be fairly interpreted as measured diagnostic accuracy or native acquisition quality. The existing evaluator's blocked `releaseTier: foundation` fallback does not appoint any candidate as a Foundation Reference. The only Foundation remains the frozen existing asset. The current executable license allowlist remains CC BY-SA 3.0/VRT; CC BY 4.0 rights are documented separately and no allowlist expansion was used to promote Nature.

| Candidate | Codec / dimensions | fps | Frames | Seconds | Screening score | Normal Gold decision |
|---|---|---:|---:|---:|---:|---|
| Normal heart | vp8 · 624×480 | 51 | 50 | 0.981 | 59 | preserve-existing-foundation-only |
| Takotsubo cardiomyopathy | vp8 · 694×480 | 51 | 89 | 1.745 | 64 | exclude-pathology-or-other-view |
| Severe hypertrophic cardiomyopathy | vp8 · 427×480 | 50 | 123 | 2.460 | 63 | exclude-pathology-or-other-view |
| Apical hypertrophic cardiomyopathy | vp8 · 647×480 | 51 | 50 | 0.981 | 65 | exclude-pathology-or-other-view |
| Dilated cardiomyopathy | vp8 · 647×480 | 51 | 44 | 0.863 | 65 | exclude-pathology-or-other-view |
| Arrhythmogenic right ventricular dysplasia | vp8 · 647×480 | 28 | 31 | 1.107 | 60 | exclude-pathology-or-other-view |
| Pericardial effusion | vp8 · 647×480 | 47 | 32 | 0.681 | 65 | exclude-pathology-or-other-view |
| Severe mitral stenosis | vp8 · 608×480 | 24 | 19 | 0.792 | 34 | exclude-pathology-or-other-view |
| Flail mitral valve with severe mitral regurgitation | vp8 · 647×480 | 32 | 19 | 0.594 | 40 | exclude-pathology-or-other-view |
| Severe aortic regurgitation | vp8 · 647×480 | 51 | 48 | 0.942 | 50 | exclude-pathology-or-other-view |
| Severe aortic stenosis | vp8 · 647×480 | 50 | 82 | 1.640 | 49 | exclude-pathology-or-other-view |
| Large perimembranous VSD with right-to-left shunt | vp8 · 647×480 | 51 | 44 | 0.863 | 50 | exclude-pathology-or-other-view |
| Nature Supplementary Video 2 | h264 · 512×640 | 24 | 222 | 9.250 | 30 | reject-as-is-research-presentation |

## Gold candidate decisions

- **Nature wearable (2023): reject this file as Gold.** All 222 frames show a split A4C/A2C research presentation with coordinate axes/borders and large black margins. At full-container mobile width, each panel is markedly smaller than Foundation anatomy. The measured 24 fps container cannot prove native acquisition fidelity. No names, patient IDs or acquisition dates were observed; audio is digitally silent. An isolated native A4C cine and specialist normal-reference review remain on hold. No cropping or temporal interpolation was used to manufacture a Gold candidate.
- **Robotic acquisition (2026): hold.** The article and CC BY 4.0 notice are accessible, but inspection found no linked supplementary original cine. Its publication year and reported image-quality score do not establish media availability or superiority. No media was downloaded.
- **Frontiers perception (2022): existing research-overlay rejection retained.** No new download or clinical review is claimed.
- **EchoNet Dynamic: existing commercial-rights rejection retained.** No media inspected or downloaded.
- **CardiacNet PAH/ASD: existing pathology-only exclusion retained.** No new dataset download or rights approval is claimed.

## Batch 01 findings and holds

All 12 records now have local source fingerprints and technical evidence. The existing runtime source-page registry is preserved as its intake contract; the separate lab evidence records progress without pretending that an approved `EchoBatchRecord` or learner asset exists. Eleven pathology/other-view candidates are excluded from Normal Gold; the Normal source is the existing Foundation source, not a replacement.

- **Takotsubo:** a burned-in date/time needs masking; periodic image-size/blur changes around frames 15, 31, 46, 61 and 76 undermine continuous-motion training. Hold for motion investigation and privacy remediation. Its nominal 694×480/51 fps metadata alone would conceal these limitations.
- **Severe HCM / apical HCM:** potentially useful wall/apical pattern contrast; saturation, narrow source framing and short-loop sufficiency need specialist review. No thickness or severity measurements are licensed by the visual screen.
- **DCM / ARVD:** potential chamber/global-motion contrast. Dark endocardial detail and the ARVD clip's lower temporal sampling limit fine tasks. Do not turn the source diagnosis label into an independently confirmed diagnosis.
- **Effusion:** visible pericardial-space contrast; no tamponade claim.
- **Mitral stenosis / flail MR:** only 19 frames each. Color sector and flow dominate the images; flail MR has insufficiently clear anatomy for confident full A4C landmark confirmation. Hold clinical/view validation; no quantitative severity inference.
- **Aortic regurgitation / aortic stenosis / VSD:** screen as A3C, PSAX and PLAX respectively, not A4C. The PSAX valve target is small/dark on mobile. The non-color PLAX clip does not independently demonstrate the source-labelled right-to-left shunt direction.

No direct patient name or ID was observed during this screen. Provider/clinician credits are attribution, not patient identity. The Normal original and Takotsubo retain visible dates. All new candidates remain held for final privacy/clinical review; **no downloaded binary is eligible for commit in this phase**. Container timestamps are strictly increasing across all files, but that does not prove native acquisition cadence, seamless looping, or motion fidelity. Continuous real-time playback and physical-device validation remain outstanding; visual motion statements are provisional contact-sheet assessments.

## Architecture and branch repairs

The existing chain remains licensed asset → quality gate → batch manifest/study → isolated Clinical Studio → optional competency/persistence/adaptive enhancement. The lab is offline evidence, not a second renderer, ingestion architecture or learner pathway. `licensedEchoAsset.ts`, the Foundation binary, study registry, quality/release contract and database schema are unchanged.

The Gold Pilot previously imported three nonexistent Media Standard exports. It now consumes the existing evaluator, input contract and replacement function. Its Foundation flags no longer imply unapproved discrimination/clinical suitability. Privacy/clinical incompleteness holds; identity mismatch rejects. Normal status, A4C view, motion, clinical review, overlays, mobile readability and discrimination are explicit blocking gates, in addition to existing provenance/rights/privacy checks. No weight-based auto-promotion bypass is allowed.

A separate branch TypeScript failure came from persistence expecting `selectedAnswer` that real assessment scoring did not return. Scoring now preserves selected option IDs as a JSON string, including multi-select ordering, through the existing event contract. A regression test traverses actual scoring → event conversion. This does not apply a database migration. Two existing source-text tests were repaired to tolerate whitespace / check the actual degradation catch rather than a deleted comment; the branch-only React purity violation in `EchoA4cLesson.tsx` was also fixed by starting the timer in a mount effect instead of calling `Date.now()` during render; layout and content were not changed.

Competency remains an educational signal, not certification. The uncertainty contract's `1/sqrt(evidenceCount)` is a heuristic; optional difficulty/discrimination metadata is not psychometric calibration. No coefficients, learner mastery data, clinical approvals, or calibration claims were invented. Persistence/adaptive failure remains isolated from core study navigation and playback.

## Validation

Starting baseline: authoritative `npm test` had 243 passes / 3 failures; TypeScript had four errors; completed lint had 474 errors / 311 warnings. An early progress message mistakenly described the still-running lint as passing; that claim is superseded. Branch history locates the broken Gold imports in the new Gold Pilot and the selected-answer mismatch in the new competency contracts. All lint paths were compared against changes since `b681bb7^`, the parent of the first competency commit. Only `EchoA4cLesson.tsx` overlapped, and its purity error was repaired. Other lint findings are outside the competency branch changes and were left untouched. Final results: **259/259 authoritative tests and 84/84 targeted tests pass; typecheck and changed-file lint pass. Repository-wide lint still fails with 473 errors / 311 warnings**, down one branch-introduced error from baseline. Results are recorded in `validation.json`; execution logs are excluded from the repository. The authoritative suite is the repository's `npm test` command (`node --test tests/*.test.mjs`). Runtime is Node 24.19.0; dependencies were reused from an existing installation with byte-identical `package-lock.json`. No new install, dev server, cloud CI run, build/deployment, or browser/device playback is claimed.

## Next execution step

Keep Foundation in place. Prioritize clinician review of the apical-HCM/DCM/effusion teaching boundaries, while resolving Takotsubo's date/scale artifacts separately. For Gold, obtain an accessible, commercially reusable, isolated unannotated native normal A4C cine. Only after final source/privacy/clinical gates pass should a governed derivative be generated, reviewed in motion and on mobile/iPad, then converted into the existing batch contract. Stop again before learner release, merge, deployment, Production or Supabase apply.
