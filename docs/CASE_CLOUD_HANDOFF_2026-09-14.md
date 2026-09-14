# Protected cloud account QA handoff

User approved cloud preview after local browser access returned ERR_BLOCKED_BY_CLIENT.
Local dev process stopped; generated AGENTS.md change reverted without altering prior instructions.

Remote qa/case-batch20-cloud verified at 3108e7c22ed68b0ad5761438f3a0bce8aa70e3c8 before preparing changes.
Existing deployment dpl_CTBwuHEju62haDsKwswV372mwxLm is READY on that branch and SHA.
Unauthenticated request redirects (302) to https://vercel.com/sso-api; the configured cloud browser can reach the application's sign-in screen. No protection setting or bypass token was changed or created.

The case route now permits cloud account QA only when VERCEL_ENV=preview AND VERCEL_GIT_COMMIT_REF=qa/case-batch20-cloud. Local development keeps its opt-in flag. Production and other branches fail closed even if the local flag is set. Tests cover these combinations. This supersedes the local-only route descriptions in earlier reports.

Keep Vercel protection enabled and verify it again for the new deployment. Do not promote this QA artifact, merge this branch or change production aliases. No public release is authorized here. If protection is unavailable, do not expose the case route.

Account sign-in is per origin: the production reviewer session does not prove a preview session. Use secure browser authentication on the new preview. Never transfer bearer tokens, cookies or credentials between origins.

Next check: one explicit reviewed-text completion, reload and confirmation on the SAME preview origin. This will add one zero-XP test completion to the reviewer account. No patient content, subscription writes or clinical orders. Do not delete test evidence automatically. Media competency and full release readiness remain unverified.
