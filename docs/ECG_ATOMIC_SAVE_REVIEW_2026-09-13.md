# ECG account transaction review — 2026-09-13

This follow-on draft is based on PR #23 at cb2c28419ec3031606fbfacbb3ba23ad3c124dbf. It separates database changes from the evidence-only package. No live schema change, registry promotion or learner activation has occurred.

## Implemented
- Existing TypeScript evidence policy and scorer feed a server-side save adapter after authenticated account verification.
- Draft SQL adds a private current-decision registry and an append-only account attempt table. Authenticated users may read only their own attempts. Anonymous users have no access. Clients cannot publish decisions or insert scores.
- A service-only SECURITY INVOKER function locks the registry row, compares decision ID/digest, validates prepared evidence, and atomically saves the immutable decision receipt alongside the score. The registry publisher is trusted server infrastructure, never the assessment request.
- Repeated identical attempts reuse the original row; conflicting reuse fails. Registry changes or HOLD reject stale prepared attempts. No automatic registry registration or promotion is performed by the save adapter.
- SQL is a review draft outside migrations. Its transaction is exercised only against local PGlite using synthetic fixture eligibility. No new application dependencies.

## Verification
80 targeted tests pass, zero failed/skipped; TypeScript and targeted lint pass. The 12 new tests exercise actual draft SQL through local PGlite, including the existing policy/scorer/save adapter, save/re-read, own-row isolation, client write denial, idempotency, conflict rejection, rollback, stale decisions and HOLD. PGlite is not proof of multi-connection concurrency or deployed Supabase/PostgREST behavior; those are required before live activation.

## Renderer and eligibility boundary
Recovered PDF SHA-256: 237865bfb5092573904802afabf10d4b51f2c21af85ef27a49d5c8a839962fc5.
Recovered original renderer source SHA-256: 66b9cf66c88c7dfaedb86bc065ce1ad489d6f818f6fa613ead24e2e4517520dd.
Original source uses ReportLab, 25 mm/s, 10 mm/mV, fixed lead order and raw calibrated waveform paths. Recovered PDF drawing streams match original pages 1–3, and page 4 after Prepared-date replacement. This supports the reviewed PDF lineage; it does not prove the current adaptive in-app renderer or reconstruct the regenerated reader/renderer source revision. Do not substitute the original source hash for that revision.

Actual record-10 remains HOLD. Accepted device-viewing confirmations remain preserved. Full target fingerprint and an authorized current promotion must be bound before publishing an eligible registry row. No new clinical interpretation, assessment reference answers or promotion is manufactured.

## Required live integration
Review this exact schema before applying it. Then configure trusted registry publication and a request-authenticated server endpoint with server-owned grading. Verify on the live reviewer account and a second account, including save/reload and concurrent registry updates/retries. Only then connect ECG history in Progress. The current adapter has no HTTP or UI entry point and the database draft is not deployed.

Reference: Supabase recommends SECURITY INVOKER and explicit function privileges: https://supabase.com/docs/guides/database/functions . Changelog index reviewed; this change does not use the affected Realtime schema, GraphQL introspection, log API, self-hosted gateway or extension version pinning.
