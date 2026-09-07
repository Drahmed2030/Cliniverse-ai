# Local DCM review input

The existing Clinical Studio composition and Remotion Player now have a development-only DCM selector. The Foundation binary, URL, manifest and assessment remain unchanged. The DCM branch hides navigation, lesson/assessment, competency controls and summary; it emits no DCM learning events. Review state is not learner-ready and clinical/privacy approval remains pending.

Start from the repository root with the existing verified file outside the repository:

```sh
CLINIVERSE_LOCAL_DCM_FILE=/absolute/path/to/echo-a4c-dcm-e00476-preview-v1.mp4 npm run dev -- --webpack --hostname 0.0.0.0 --port 3000
```

Use `127.0.0.1` instead of `0.0.0.0` when testing only on the host. The earlier verification session used `0.0.0.0` to permit device access if the host network supports it. No public tunnel or deployment was created.

Route: `http://localhost:3000/labs/pathway-replay` (port 3000, no query required). Select **Open Clinical Studio**, then **DCM candidate · local review only**, then use the existing Play control. DCM mode loops 44 frames at 51 fps, with the complete 648×480 image contained in the existing responsive viewport. Select the DCM button again to return to Foundation. Normal lesson content is not reused as DCM teaching content.

The endpoint `/api/local-echo-review` requires development mode plus the explicit server-only file path. It hashes the complete in-memory bytes before responding, including byte-range requests. Missing files return 404 and a checksum mismatch returns 409. There is no fallback to Foundation. No user-supplied file path or source URL is accepted. Media responses use no-store, video/mp4 and byte-range support. The binary is never copied into public assets or committed.

Validation: 109/109 targeted Echo tests pass; typecheck and targeted lint pass. Same-session HTTP checks returned 200 for the Studio page, 200 for the full media with the expected checksum, and 206 for bytes 0–1/253578. Next reported Ready and compiled the requested route. These are server checks, not browser playback observations.

The cloud browser reported `ERR_BLOCKED_BY_CLIENT` for this localhost. Separate command sessions also could not reach the listener; the startup session itself could. Network-interface enumeration was unavailable, so no LAN IP or physical-device-reachable URL is verified. `0.0.0.0` is a bind address, not a device URL. An iPhone's localhost refers to the phone, not this hosted session.

Physical Apple observations are DEFERRED and unobserved; technical Apple compatibility and browser verification remain HOLD. On an accessible local development host, use that host's actual LAN IP with port 3000 and the route above, with devices on the same reachable network. Record actual device/browser versions and each observed playback result in the separately maintained physical-device checklist. Do not mark device tests PASS from HTTP responses or viewport sizing.

This input is included in the Player feature-branch review. It does not authorize a merge, deployment, Production, Supabase or learner-release change.
