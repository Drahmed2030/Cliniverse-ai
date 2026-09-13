# ECG live save and review completion — 13 September 2026

## Confirmed live finding

The review account submitted an agent-selected sinus-rhythm test answer through the deployed browser UI, using the owner's previously confirmed external PDF review context. It was a technical test, not an independently completed learner assessment or a new iPhone execution.

POST returned 409. Deployed bounded diagnostics then established PostgreSQL code 42501, credentialRole=anon, and `permission denied for function save_ecg_attempt_v1`. Therefore the Preview value named SUPABASE_SERVICE_ROLE_KEY is an anon credential. No secret value was printed or committed.

The prepared evidence and matching eligibility receipt succeeded in transactionally rolled-back SQL probes, including SET LOCAL ROLE service_role. Both probes were rolled back. No actual saved ECG attempt was present on subsequent inspection. No database grants, policies or schema were changed to work around the rejected credential.

## Changes

- Review controls use consistent cards, spacing, touch targets and focus states.
- The device checkbox explicitly references prior owner-confirmed use; no new device test is asserted.
- History distinguishes loading, empty and error states.
- Configuration sanity checks reject anon/malformed credentials before RPC and report saving unavailable to the review UI. This is not JWT authentication; Supabase still verifies keys and database access.
- Progress reads the owner's latest 20 record-10 answers under existing RLS, validates score range and stored eligible receipt, and distinguishes loading/error/empty states. It does not grant eligibility or write scores.

## Verification and remaining action

111 targeted tests passed, zero failed/skipped; TypeScript and targeted lint passed. The deployed polished review layout was visually inspected. The real save remains incomplete due to server credential configuration.

In Vercel project cliniverse-ai-u7gi, correct SUPABASE_SERVICE_ROLE_KEY for Preview using the corresponding project's server credential, then redeploy the commercial preview. Do not put the key in chat, source control or NEXT_PUBLIC variables, and do not grant anon access to the save RPC. The connected tools used here do not expose the required secret-key read or environment-variable write operation.

After configuration: submit one explicit review-account test answer, verify its exact acknowledgement, reload, check the same single persisted event in Progress and xAPI, and document it as a technical test. Do not claim this final step passed yet.
