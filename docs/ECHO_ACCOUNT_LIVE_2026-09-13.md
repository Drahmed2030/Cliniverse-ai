# Echo account review — live schema and Preview candidate

User explicitly approved the reviewed events-only schema on 2026-09-13.
Applied migration echo_account_events_v1, version 20260913084857, to Cliniverse Supabase zbiujqxinvcxvuviuenx. See supabase/applied/echo-account-events-v1.json for source hash.

Verified live: RLS enabled/forced; own-user SELECT and INSERT; eleven named INSERT columns exclude created_at; no authenticated UPDATE/DELETE; no echo_skill_mastery table. Security advisor returned no Echo-specific notices. Other project notices were not modified (24 RLS-enabled/no-policy INFO and one extension-in-public notice).

Restored the existing fa820b3 ClinicalMediaPreview dependency set and original A4C MP4. SHA256 89e311b8a841a2a6813d4c5ba470aede46ba85780d42b2124330fc01846c783c matches the frozen derivative. Remotion/player pinned to the existing engine versions 4.0.520; no second player.

New /labs/echo-account-review wraps that player with existing AuthGate, server-verified reviewer access, account-keyed lifecycle, existing scorer, stable attempt identities, explicit save/retry, and latest saved attempts for each current task on reload. It is available only in Preview/development. It exposes A4C only, without synthetic ECG or DCM review controls. The accepted Apple baseline and learner eligibility are unchanged.

The two existing governed task attempts are saved together via independent idempotent inserts. A partial failure is reported as unconfirmed and can retry the same identities. The third lesson boundary question remains part of the session receipt, not an invented competency task. Saved assessment evidence is not a mastery award or whole-history projection.

Verification before publishing: 42 PASS / 0 FAIL / 0 SKIP; TypeScript, targeted lint, and production-mode Next build passed. Live browser save/reload verification pending at this checkpoint.

Security advisor documentation: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
