# Echo Batch 01 — Apple Playback Matrix

Status: CURRENT IPHONE + LEGACY APPLE PLAYBACK PASS

This matrix records playback evidence only. It does not provide clinical approval, privacy approval, learner readiness, binary inclusion authorization, diagnosis authorization, certification, deployment authorization, or Supabase authorization.

## Scope

Exact-SHA playback review for the six intact Batch 01 pathology derivatives governed by `echoBatch01HumanReview.ts` and `echoBatch01PlaybackReview.ts`.

## Evidence classes

- **Legacy Apple compatibility evidence**: MacBook Pro 2012 / macOS Catalina using Safari and QuickTime. Useful for real Apple decoding, controls, aspect-ratio preservation, and low-end compatibility. It is not evidence for current iOS/iPadOS/WebKit behavior.
- **Current Apple platform evidence**: physical current iPhone/iPad or an explicitly identified modern Apple device environment. Required before final learner promotion.

## Required checks per candidate/environment

- exact derivative SHA256 verified before review;
- playback starts without a blank/black failure;
- play/pause works;
- seek works;
- frame stepping works where exposed by Clinical Studio;
- loop works without an obvious broken seam;
- aspect ratio is preserved;
- no crop or geometric distortion;
- clinically relevant anatomy remains readable;
- retained overlays remain readable and do not obscure the teaching target;
- reduced-motion/accessibility behavior does not break playback;
- reviewer, device model, OS version, app/browser version, date, and notes recorded.

Any checksum mismatch, FAIL, uncertainty requiring escalation, or inability to verify a required check must fail closed as HOLD/FAIL.

## Candidate matrix

| Candidate | SHA256 | Catalina Safari | Catalina QuickTime | iPhone | iPad | Current status |
|---|---|---:|---:|---:|---:|---|
| Pericardial effusion | `ac4ae1abd4ba3a14f050a5e2222af0a8a46f910669934892eac2b6e1f89e7d1a` | **PASS** | **PASS** | **PASS** | PENDING | current iPhone + legacy Apple playback pass; iPad pending |
| Severe HCM | `39f7d2930a1383c688723871887c02e75ddd932819a01b176bbc6e03cb6cf913` | **PASS** | **PASS** | **PASS** | PENDING | current iPhone + legacy Apple playback pass; iPad pending |
| Severe MS | `c9db61d29ae454e9967023aa0b2ce3e218b333b4b199f6394b8665199616f274` | **PASS** | **PASS** | **PASS** | PENDING | current iPhone + legacy Apple playback pass; iPad pending |
| Severe AR | `13f3d791637cdc7e8704fd36fc98269b458afc0d472f03ca1349540b09ca91cc` | **PASS** | **PASS** | **PASS** | PENDING | current iPhone + legacy Apple playback pass; iPad pending |
| Severe AS | `1f2e57f80802dc0f13c1c8732d8b48f05b228e39cdcd408a91956a76877fb715` | **PASS** | **PASS** | **PASS** | PENDING | current iPhone + legacy Apple playback pass; iPad pending |
| ARVD source-supported RV pattern | `2e83143bd1e969b4b53349687cc2371cc9896c54e7c2c475659c7bb1b767c97b` | **PASS** | **PASS** | **PASS** | PENDING | current iPhone + legacy Apple playback pass; iPad pending |

## Verified Catalina QuickTime batch evidence

Date: 2026-09-07

- Hardware: MacBook Pro 2012
- OS: macOS Catalina
- Environment: QuickTime Player
- Exact-SHA verification before playback: PASS; all six files matched `SHA256SUMS.txt` on the Mac
- Six of six derivatives opened and played successfully
- Playback start: PASS across all six
- Blank/black failure: PASS; none reported across all six
- Play/pause: PASS across all six
- Seek/scrub: PASS across all six
- Loop/replay: PASS across all six; no disruptive seam or playback failure reported
- Aspect ratio: PASS across all six
- No obvious crop/geometric distortion: PASS across all six
- Anatomy readability: PASS by device observer across all six
- Overlay readability: PASS by device observer across all six
- Visual quality: device observer reported all six as very clear/high quality and comparable in appearance to routine echo cine displayed on clinical-center echo workstations

## Verified Catalina Safari batch evidence

Date: 2026-09-07

- Hardware: MacBook Pro 2012
- OS: macOS Catalina
- Browser: Safari 15.6.1 / WebKit 605.1.15
- Delivery: local `file:` page serving the exact downloaded MP4 derivatives without re-encoding
- Exact-SHA verification had already passed for all six files on the same Mac before browser review
- Six of six derivatives were visually reviewed in Safari and reported PASS by the device observer
- Playback start: PASS across all six
- Play/pause: PASS across all six
- Seek/scrub: PASS across all six
- No blank/black playback failure reported across all six
- Aspect ratio and visible geometry: PASS by device observer across all six
- Anatomy and retained overlays remained readable by device observer across all six
- User-provided photos show all six clips loaded in the local Safari review page, with the first three and second three visible in separate views

The Safari record is based on direct user/device observation. An earlier exported observation JSON recorded three provisional HOLD values while the batch review was incomplete; those were superseded by explicit manual re-review of all six clips, with the user confirming all six PASS.

## Verified current iPhone batch evidence

Date: 2026-09-07

- Device: physical iPhone (exact model and iOS version not recorded in this evidence entry)
- Delivery: exact MP4 derivatives served from the Mac over the local network and opened on the iPhone
- Exact-SHA verification had already passed for all six files on the source Mac before iPhone review
- Six of six derivatives were opened and played successfully on the iPhone
- Playback start: PASS across all six
- Play/pause: PASS across all six
- Seek/scrub: PASS across all six
- No blank/black playback failure reported across all six
- Visible geometry/aspect ratio: PASS by device observer across all six
- Anatomy and retained overlays: clearly readable by device observer across all six
- Overall visual quality: user reported all six as excellent on the iPhone
- User-provided screenshots document successful iPhone playback of representative Batch 01 clips, including grayscale and color-Doppler examples

This is current-device playback evidence only. It is not specialist clinical approval, privacy approval, diagnosis authorization, or learner-readiness authorization.

## Next playback step

Legacy Apple playback is complete for the six exact-SHA derivatives on Catalina in both QuickTime and Safari. Current physical iPhone playback is also complete for all six.

Next:

1. obtain current physical iPad evidence if available, or keep iPad pending rather than infer it;
2. review the Clinical Studio integration path separately if it can serve the exact files without transformation;
3. keep human clinical/privacy review and post-review quality gate independent;
4. only after all governed gates clear should learner promotion be considered.

## Release boundary

The current iPhone PASS clears the iPhone row of the playback matrix, but it does not by itself make any artifact learner-ready or binary-commit-eligible. iPad, human clinical/privacy review, and the post-review quality gate remain independent requirements. Learner readiness remains false until all governed gates clear.
