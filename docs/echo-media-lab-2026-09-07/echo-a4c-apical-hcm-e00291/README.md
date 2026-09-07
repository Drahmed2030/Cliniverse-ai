# Apical HCM local derivative review — 2026-09-07

Status: **clinical-review-required**. This is a quarantined local review artifact, not an approved governed derivative or learner asset. The existing readiness evaluator returns `governedDerivativeAllowed=false`; processing was specifically requested for local review and does not waive that gate. Final privacy, specialist clinical and later device playback reviews remain required. Binary inclusion and learner readiness are false.

## Source and transformation

The existing source and saved license page were reused, without downloading another revision. Source SHA256: `e23aa565789effcae9728fc8e9a4b71e6a90062e8c0014e4fe85899bd419f97a`. Source SHA1: `0c73d70ee7ad0663a7c62b0a3ed0e453b4f4f84e`. Source page SHA256: `51a0b8e575d1a6ad52ed1090c51794f6644c667b53dbf6e88b1733fede38df62`.

The original per-file rights evidence records CC BY-SA 3.0 commercial reuse and adaptation. Preserve CardioNetworks ECHOpedia / AMC Echolab / Wikimedia Commons attribution, canonical source link, license link, modification notice and ShareAlike obligations. Existing burned-in source credits are retained. Final provenance/privacy acceptance is human-required.

| Property | Source | Local derivative |
|---|---|---|
| Codec | VP8 | H.264 High, level 3.1 |
| Pixel format | yuv420p | yuv420p |
| Dimensions | 647 × 480 | 648 × 480 |
| Nominal fps | 51 | 51 |
| Frames | 50 | 50 |
| Container duration | 0.981 s | 0.980 s |
| Bytes | 302041 | 336958 |
| Audio streams | 0 | 0 |

Derivative: `echo-a4c-apical-hcm-e00291-preview-v1.mp4`. SHA256: `d7bd8c51449596da112362d7747f67d2fedec979f0a5327b748ebd5d8984260e`.

All 50 presentation timestamps match exactly, with strictly increasing 19–20 ms intervals. The 1 ms duration difference is final sample/container rounding, not a playback-speed change; derivative average frame rate is 2500/49. One black pixel column was padded at the right edge. No anatomy was cropped, no overlay masked, no frames invented/interpolated/dropped, and no cosmetic enhancement applied. Lossy re-encoding is not pixel-identical to the source. H.264 CRF 16, no B frames, 1/1000 encoder timebase and MP4 timescale 1000 preserve frame presentation times. Faststart is enabled; container metadata and chapters are removed.

The executable recipe is `scripts/prepare-echo-apical-hcm-derivative.py`. Supply the verified source WebM, saved source HTML and a new output directory outside the repository. It refuses checksum mismatches before processing. `technical.json` records exact parameters, timestamps and hashes; compact ffprobe records accompany it. The binary and complete decoded-frame/contact-sheet inspections remain outside Git under the session's `echo-lab/apical-hcm-derivative-v1` directory.

## Technical inspection and clinical limits

All 50 source frames and all 50 derivative frames were reviewed in complete ordered contact sheets. The apex and four-chamber context remain visible. Source-supported label: “Apical hypertrophic cardiomyopathy”; this is not an independently established diagnosis. Specialist confirmation of view, pattern and motion sufficiency is pending.

No patient names, accession/study identifiers or burned-in acquisition date/time were observed. Visible overlays include depth scale, orientation markers, grayscale bar, ECG trace, HR and changing timing/phase numerals. AMC Echolab and ECHOPEDIA source credits remain present. These residual annotations and institutional credits require final human privacy/provenance review. No unexpected audio exists. The technical privacy screen does not constitute final privacy approval.

Complete decoding succeeded without reported errors. Ordered images and exact timestamps support temporal continuity; live playback, loop seam, physical device compatibility and clinical motion sufficiency are not established. Mobile, iPad and desktop readability remain HOLD pending actual observation. No device result is inferred from contact sheets or format metadata.

Teaching scope is A4C recognition, source-supported apical hypertrophic pattern and qualitative pattern recognition. Wall thickness, chamber measurement, LVOT obstruction, Doppler severity, genotype, prognosis, treatment, independent HCM diagnosis, exclusion of alternative pathology and numerical EF claims remain prohibited. Normal-versus-pathology learner discrimination requires specialist approval. This pathology candidate does not replace or compete for Normal Gold promotion.

## Contract and isolation

The existing Apical readiness contract and its tests were retrieved from required-branch commit `6a044672a3c3318ce29ad2ea78cf5c04b077ae95`, because they were absent at local HEAD `2388a7d1980406149ad05fd3356a8916a7785eb6`. No DCM closure files from that commit were imported. The same evaluator was strengthened with explicit chamber-measurement, Doppler, treatment, alternative-pathology and numerical-EF exclusions; missing exclusions fail closed.

`readiness.json` is the evaluator's result with both human reviews absent. No clinical or privacy approval was self-certified. Foundation media, DCM binary/evidence, Player 2026, Studio isolation, assessments, persistence and release state are unchanged. `frozen-assets.json` records tracked asset/component hashes; the pre-existing untracked DCM review files and local DCM binary were also verified unchanged locally.

Next: human specialist and privacy/provenance review of this exact checksum, followed by device/playback review. Do not include the binary or enable learner use without the existing gates.

## Validation

Apical tests: 19/19 pass. Affected Echo tests: 146/147 pass; the pre-existing pericardial skill-graph-gap expectation fails, unchanged by this work. Typecheck and targeted lint pass. Source, derivative and all frozen file checksums reverified. No binaries, frames, contact sheets, caches or logs are included in the commit.
