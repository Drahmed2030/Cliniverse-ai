# DCM governed derivative readiness — 2026-09-06

**HOLD: local educational-preview review artifact only.** The DCM derivative is created, but neither binary inclusion nor learner release is authorized. Specialist clinical review, final privacy/provenance review and physical-device playback remain incomplete. DCM remains excluded from Normal Gold and numerical EF claims. The A4C Normal Foundation Reference is unchanged.

The source and license-page snapshot were reused locally, with both SHA256 values matching [the existing evidence](../evidence.json). No source was downloaded again. The existing public CC BY-SA 3.0 notice permits commercial adaptation subject to attribution, change notice and ShareAlike; private VRT correspondence was not accessed. Copyright permission does not resolve clinical or privacy review.

| Measurement | Original | Derivative |
| --- | --- | --- |
| Filename | original.webm | echo-a4c-dcm-e00476-preview-v1.mp4 |
| Codec / pixel format | VP8 / yuv420p | H.264 High, level 3.1 / yuv420p |
| Dimensions | 647 × 480 | 648 × 480 |
| Nominal frame rate | 51/1 | 51/1 |
| Average frame rate reported | 51/1 | 22000/431 (about 51.044) |
| Decoded frames | 44 | 44 |
| Container duration | 863 ms | 862 ms |
| Audio streams | 0 | 0 |
| Bytes | 260932 | 253578 |

Source SHA256: `ea5a6bf54bcbda40a73ea76f3dd7fab876c9c48c8d4abd9461748cb9538aaf45`

Derivative SHA256: `7aa9c9b446c84f6de3af0eaf3cbcfd0821b5f70f8b12d031fa027b083079397f`

The [recipe](../../../../scripts/prepare-echo-dcm-derivative.py) verifies the source and saved license page before encoding, rejects unexpected streams or metadata changes, and only writes outside the repository. Run from the repository root with paths to the already verified original and saved source HTML, followed by a new local output directory:

```sh
python3 scripts/prepare-echo-dcm-derivative.py SOURCE_WEBM SOURCE_HTML OUTPUT_DIR
```

The transformation adds one black pixel on the right and uses libx264, slow preset, CRF 16, yuv420p, no B frames, passthrough timestamps, a millisecond encoder/container timebase and MP4 faststart. Source metadata and chapters are omitted; standard muxer/encoder tags remain. No crop, mask, frame invention, interpolation, speed change or anatomy rescaling is applied. The full source credits, ECG, depth/grayscale scales and acquisition annotations remain visible. H.264 MP4 follows the Foundation playback format; this is not proof of Safari/iPad playback.

All 44 frame presentation timestamps match exactly, from 0 through 843 ms, with 19–20 ms intervals. The final sample/container duration differs by 1 ms because of muxing duration rounding; this explains the changed average-rate fraction and does not represent a frame-rate conversion. An initial duration check exposed a floating-point comparison at the 1 ms boundary; the recipe now compares integer milliseconds. The first output was held; a verified recipe run produced the recorded artifact.

Two complete derivative contact sheets cover all 44 frames; full-resolution frame 1 and static widths 375, 768 and 1024 px were reviewed. Ordered frames show no new discontinuity. FFmpeg SSIM over 44 corresponding decoded frames against the padded original was 0.991938 overall (luma 0.988180). This is lossy encoding, and SSIM is an engineering comparison, not clinical validation. Native acquisition timing, loop sufficiency and subtle motion fidelity require specialist review.

No direct patient identifiers or acquisition date/time were observed in this technical screen. The changing timing/phase annotation adjacent to HR and the source credits remain; their final privacy/provenance disposition is not inferred from copyright permission. The source-labelled A4C geometry and full anatomy rectangle remain visible. Dark apical/endocardial detail remains limited at mobile width; enlarging on iPad/desktop adds no source detail. Fine discrimination tasks and quantitative measurements are not approved. Static resized images are not physical-device or browser playback tests.

Attribution for any future authorized distribution: **CardioNetworks ECHOpedia; courtesy of the AMC Echolab, AMC, The Netherlands; via Wikimedia Commons.** Include the [canonical source](https://commons.wikimedia.org/wiki/File:Dilated_cardiomyopathy_E00476_(CardioNetworks_ECHOpedia).webm?oldid=1205737674), [CC BY-SA 3.0 license](https://creativecommons.org/licenses/by-sa/3.0/), and the transformation notice above. The derivative remains under CC BY-SA 3.0. Attribution is recorded here, not installed in a learner UI.

[readiness.json](readiness.json) separates technical screening from pending review and binds the result to the artifact checksum. [technical.json](technical.json) records parameters, before/after timestamps and fingerprints; the two ffprobe JSON files record stream/container metadata. The offline readiness evaluator is deliberately outside the application and cannot grant runtime release or binary inclusion, even if a checklist is later completed. Existing Echo quality/clinical contracts and Studio boundaries remain authoritative.

The source, derivative, frame exports, contact sheets, static previews and execution logs stay outside git. Only this evidence, recipe, checklist and targeted tests are committed. No other Batch 01 candidate was processed, no Gold promotion occurred, and no runtime manifest, competency architecture, Foundation asset, deployment configuration or Supabase file changed.

Next: obtain a recorded specialist review tied to the derivative SHA256 covering A4C view, pathology teaching boundaries, preserved annotations/anatomy, motion/loop sufficiency and exclusion of numerical EF claims; complete final privacy review and mobile/iPad/desktop playback. Any later binary inclusion or learner readiness must pass the existing governance contracts separately.
