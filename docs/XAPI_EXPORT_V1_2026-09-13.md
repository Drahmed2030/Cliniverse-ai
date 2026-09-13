# Saved assessment xAPI export v1

Implemented on the existing account/history path. Progress now includes Download assessments (xAPI). The authenticated GET /api/learning-export verifies the bearer token with Supabase and queries both tables under that user's token/RLS; no service key and no caller-selected owner. It returns a downloadable JSON array, not an LRS service or a conformance-certified xAPI endpoint.

Echo maps saved task/version/skill, observation time, 0–100 score to scaled 0–1, confidence 1–5 as an extension and response time as ISO duration. ECG requires a persisted eligible decision receipt matching the row and score evidence; it preserves 0–1 score, engine outcome (including critical-miss failures) and optional 0–1 confidence. No new scoring, promotion, success threshold, mastery or clinical certification is inferred.

Actor uses the account UUID and canonical account home page, omitting email, name and answer text. This is pseudonymous account data, not anonymized data. UUID v5 statement IDs are stable per account/modality/event/mapping version; activities include content versions. Extensions use the Cliniverse namespace; recipients must agree on this profile before automated import. No LRS authority/stored timestamp or arbitrary xAPI version is forged.

The current download is complete only when exact query counts equal returned rows, with a maximum 1000 rows per modality. Larger or server-truncated histories return 413 without a partial file. Source failures return 503. Cache is disabled. Client download is suppressed after account change/unmount. Repeated downloads preserve statement identity. The account's saved assessments are exported, not the currently visible history page.

## Scope and verification
12 new mapping/request-handler tests; 92 total targeted tests. TypeScript and targeted lint pass. These tests cover authentication, owner filtering, capped results, malformed evidence, deterministic IDs, score scales and duplicate rejection. Browser download behavior and institutional LRS acceptance still require actual observation; no conformance claim is made. No data sent to an external system, migration, new dependency, patient data, subscription change or Apple/native modification.

Activity-only events (viewed/reviewed) remain a separate future increment, because the current database has no trusted persisted viewing history to export. This implementation does not fabricate those events from assessment records.

## Current standards research
IEEE's page lists active IEEE 9274.1.1-2023 and international ISO/IEC/IEEE 39274-1-1-2025. This implementation uses the shared basic statement fields documented in the public ADL data model. Full 2.0/2025 conformance and a recipient's profile must be validated before an institutional connector is enabled.
- https://standards.ieee.org/ieee/9274.1.1/7321/
- https://standards.ieee.org/ieee/39274-1-1/12268/
- https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md

Next: verify the download in the authenticated Preview, then validate a founder-approved sample against the chosen institution's LRS/profile. Export has no network sender and needs no new service purchase.
