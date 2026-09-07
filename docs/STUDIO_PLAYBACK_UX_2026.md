# Studio playback UX update — 2026-09-07

Local implementation on `feature/echo-competency-engine-v1`, preserving the existing Studio route, Remotion Player, modality renderers and all prior work. No dependency upgrade, native Apple SDK integration or release is claimed.

The design follows Apple's current [materials guidance](https://developer.apple.com/design/human-interface-guidelines/materials) and [accessibility guidance](https://developer.apple.com/design/human-interface-guidelines/accessibility): controls separate from content, user-controlled playback, readable surfaces and reduced-motion support. It is a web adaptation, not the native Liquid Glass API.

Changes:

- One Echo control shelf with 48 CSS-pixel minimum targets, visible keyboard focus, reset, previous/next frame and explicit loop control. Frame stepping pauses and clamps at boundaries. The Foundation presentation readout says “Timeline frame”; DCM's readout says “Cine frame” to avoid equating presentation frames with source frames.
- Expand cine uses the same video element/composition path with the source aspect ratio and contain sizing. Surrounding presentation text and decorative grid are removed from the expanded viewport; embedded source annotations remain. Review-only labeling stays outside the viewport.
- Responsive wrapping, restrained translucent surface with solid fallback, reduced-transparency/high-contrast support and reduced-motion transitions. No autoplay was introduced. Existing playback controls remain available.
- Initial capability contract governs implemented preview controls; DCM assessment and study progression stay disabled. ECG retains its existing synthetic signal composition and gets no cine controls. Future CT/X-ray renderers are not implemented or implied.
- The separately prepared local telemetry contract and specialist packet are excluded from this Player commit; no collection, persistence or external analytics was introduced.

Original local verification: 117/117 targeted Echo tests passed. Final isolated commit verification after preserving remote clinical-review changes: Player/DCM tests 7/7 passed; broader Echo tests 123/124; typecheck and targeted lint passed. The failing `echo-batch01-clinical-promotion.test.mjs` pericardial-gap assertion also fails on untouched remote HEAD `6dd9e9e653e819189cd41f3d2ec5841cf1cdc819`: it expects a missing skill that newer remote code deliberately supplies. This unrelated baseline test is unchanged. Frame-boundary and modality/review-capability tests added. DCM SHA256 remains `7aa9c9b446c84f6de3af0eaf3cbcfd0821b5f70f8b12d031fa027b083079397f`; Foundation SHA256 remains `89e311b8a841a2a6813d4c5ba470aede46ba85780d42b2124330fc01846c783c`.

Visual browser verification, 375px/landscape and tablet checks, large text/zoom, contrast measurements, screen-reader behavior and physical Apple playback are still pending. Prior cloud-browser localhost access was blocked; no new browser success is asserted. Code-level responsive/accessibility support is not device certification. This update does not alter the deferred physical-device observation status or pending clinical/privacy approvals.

Use the existing `/labs/pathway-replay` route → Open Clinical Studio. The local-only DCM selector still requires the verified derivative endpoint. Test the new controls and expanded view there before accepting visual quality. This change is for feature-branch review only; it authorizes no merge, deployment, Production or Supabase change.

## Player commit scope

- `app/components/clinical-media/ClinicalMediaPreview.tsx`
- `app/components/clinical-media/EchoA4cMediaComposition.tsx`
- `app/components/clinical-media/clinical-media.module.css`
- `app/components/clinical-media/EchoPlaybackControls.tsx`
- `app/lib/clinicalMedia/studioPlayerCapabilities.ts`
- `app/lib/clinicalMedia/localDcmReview.ts`
- `app/api/local-echo-review/route.ts`
- `tests/echo-studio-player-controls.test.mjs`
- `tests/echo-local-dcm-review.test.mjs`
- `docs/STUDIO_PLAYBACK_UX_2026.md`
- `docs/echo-media-lab-2026-09-06/echo-a4c-dcm-e00476/derivative-v1/LOCAL_PREVIEW.md`

Earlier specialist packets, physical-playback evidence, telemetry contract/tests and broader architecture notes remain local and outside this commit. Existing remote clinical-review work is preserved.
