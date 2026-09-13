# ECG account transaction review — 2026-09-13

This follow-on draft is based on PR #23 at cb2c28419ec3031606fbfacbb3ba23ad3c124dbf. It separates database changes from the evidence-only package. Live schema applied with explicit user authorization on 2026-09-13, migration 20260913111435. No registry promotion or learner activation has occurred.

## Implemented
- Existing TypeScript evidence policy and scorer feed a server-side save adapter after authenticated account verification.
- Draft SQL adds a private current-decision registry and an append-only account attempt table. Authenticated users may read only their own attempts. Anonymous users have no access. Clients cannot publish decisions or insert scores.
- A service-only SECURITY INVOKER function locks the registry row, compares decision ID/digest, validates prepared evidence, and atomically saves the immutable decision receipt alongside the score. The registry publisher is trusted server infrastructure, never the assessment request.
- Repeated identical attempts reuse the original row; conflicting reuse fails. Registry changes or HOLD reject stale prepared attempts. No automatic registry registration or promotion is performed by the save adapter.
- The reviewed SQL was applied unchanged through Supabase migration history after user authorization. Synthetic positive-score tests run only in local PGlite; live negative tests verify rejection without writing records. No new application dependencies.

## Verification
80 targeted tests pass, zero failed/skipped; TypeScript and targeted lint pass. The 12 new tests exercise actual draft SQL through local PGlite, including the existing policy/scorer/save adapter, save/re-read, own-row isolation, client write denial, idempotency, conflict rejection, rollback, stale decisions and HOLD. PGlite is not proof of multi-connection concurrency or deployed Supabase/PostgREST behavior; those are required before live activation.

## Renderer and eligibility boundary
Recovered PDF SHA-256: 237865bfb5092573904802afabf10d4b51f2c21af85ef27a49d5c8a839962fc5.
Recovered original renderer source SHA-256: 66b9cf66c88c7dfaedb86bc065ce1ad489d6f818f6fa613ead24e2e4517520dd.
Original source uses ReportLab, 25 mm/s, 10 mm/mV, fixed lead order and raw calibrated waveform paths. Recovered PDF drawing streams match original pages 1–3, and page 4 after Prepared-date replacement. This supports the reviewed PDF lineage; it does not prove the current adaptive in-app renderer or reconstruct the regenerated reader/renderer source revision. Do not substitute the original source hash for that revision.

Actual record-10 remains HOLD. Accepted device-viewing confirmations remain preserved. Full target fingerprint and an authorized current promotion must be bound before publishing an eligible registry row. No new clinical interpretation, assessment reference answers or promotion is manufactured.

## Required live integration
Schema application is complete. Next configure trusted registry publication and a request-authenticated server endpoint with server-owned grading. Verify on the live reviewer account and a second account, including save/reload and concurrent registry updates/retries. Only then connect ECG history in Progress. The current adapter still has no HTTP or UI entry point. See supabase/applied/ecg-account-atomic-v1.json for the deployment receipt.

Reference: Supabase recommends SECURITY INVOKER and explicit function privileges: https://supabase.com/docs/guides/database/functions . Changelog index reviewed; this change does not use the affected Realtime schema, GraphQL introspection, log API, self-hosted gateway or extension version pinning.


## Live verification
Both tables have enabled/forced RLS. Client insert and anonymous/authenticated RPC execution are denied. Service RPC execution is allowed and rejects record-10 because no eligible registry row exists. Client RPC denial and service HOLD rejection were exercised in a rolled-back transaction. Both tables remain empty. The advisor reports private registry RLS without policies; that is intentional client deny-all, not a reason to grant client access. No Echo or subscription schema changed.
