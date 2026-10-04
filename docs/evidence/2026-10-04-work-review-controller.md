# WORK review controller and synthetic gateway — execution ledger
Plan: Cliniverse_WORK_Architecture_Implementation_v1.md, 29 September 2026, sections 4–5 and tasks 1–2.
Source plan: saved original, fully read during contract reconciliation; application routes remain proposals.
Base: qa/case-batch20-cloud at 6f2fcf95fc2e6053ba7fd8fc6fcb9275ca8b11cd.
Scope: first two implementation tasks only. No UI, hooks, live adapter, credentials, migrations, deployment or LEARN changes.

## Execution
- Isolated full shallow clone and feature branch; no existing working tree changed.
- Existing trust baseline: 5/5 pass.
- Full baseline: 941 tests, 917 pass, 24 fail, zero skipped.
- New tests written before implementation. Initial RED for both files: missing module, as anticipated by the saved plan. This is not a behavioral mutation proof.
- Task 1 implemented: strict Zod contracts, bounded JSON parsing, pure review controller using existing evidence trust/presentation policies.
- Task 2 implemented: six synthetic scenarios; in-memory idempotency, payload conflict, outcome reconciliation, two fixture organizations and expiry checks before replay. No production durability claim.
- Regression discovered during author review: local async-response generation was incorrectly equated with upstream session generation. Behavioral test produced unavailable instead of queue (RED); separating these identities passed (GREEN).
- Focused final: 38/38 pass (33 new plus 5 existing), zero skips.
- Typecheck: project tsc --noEmit --incremental false exited 0; app/lib/**/*.ts already included. No typecheck config change needed.
- Full final: 974 tests, 950 pass, 24 fail, zero skipped. Exact failing test names match baseline; no newly failing tests.
- git diff --check passed. Author review only; independent review not performed per user's no-extra-agent instruction.
- npm ci --ignore-scripts installed locked dependencies without modifying manifests/lockfile. Postinstall capacitor patch not executed. Existing Node module-type and npm deprecation warnings remain.
- No build or browser tests: this increment contains no rendered UI or routes and is not a release candidate.

## Rulings
- Execute tasks 1–2 as this bounded increment. Screens/cache/telemetry are not complete; live adapter remains blocked on upstream capability verification. Cost if mistaken: scope must be extended before any demonstration or live use.
- Source evidence is bounded plain text for the first synthetic slice; no arbitrary HTML/URL delivery. Patient context is an opaque reference only. Cost: later supported content types require reviewed schema extensions.
- Fixture factory adds optional A/B institution selector to test the plan's two-organization isolation requirement; defaults to A. It is not a production tenant selector.
- Local request generation and upstream sessionGeneration are independent; stale async responses are gated by the locally captured generation.
- Existing full-suite failures are retained and reported rather than changing unrelated auth/navigation/content behavior. Draft must not be presented as a fully green release.
- No extra reviewer agent; review is not independent acceptance.

## Remaining
Task 3: protected synthetic preview/effect runner and browser behavior tests.
Task 4: service-worker upgrade/cache and telemetry boundaries, before live institutional data.
Task 5: actual upstream authorization/concurrency/receipt compatibility, session handling and disabled adapter; no invented upstream endpoints.
IT configuration reuses Health Cloud ADR-023; no setup screen or persistence is claimed here.

## Existing full-suite failures (unchanged)
- ECG opens the governed ECG workspace and Echo its learner workspace (Learn owns their entry); Ward opens in place
- Echo is reachable from exactly one entry point (the Learn Echo track, now the Echo v2 workspace) — no second Echo navigation system was created
- Explore is a curated discovery list limited to verified release surfaces
- Explore links only to active release paths; the StoreKit plan is owned by Me and the PRO workspace gate
- Learn landing has exactly the three approved practice tracks, in order
- Me composes identity/plan, preferences, real support routes and the one existing sign-out action, in that order
- Me primary identity accent is gold to match account identity
- Me styling is scoped, token-only and restrained
- Resuscitation Hub is reachable from exactly one Explore/Atlas entry point
- all three drafts exactly preserve pinned historical content and provenance
- auth inputs prevent iOS focus auto-zoom
- identity comes from the real profile and Supabase Auth email, with nothing invented or exposed
- invalid sign-in surfaces a controlled error and does not call onComplete
- legacy workspaces are not presented as Learn tracks, and no user data is invented
- magic-link sign-in stays disabled by default and cannot implicitly create accounts
- paywall does not invent a free trial and presents one connected product
- reviewer preview access is derived from the verified authenticated email, not a client-set flag, and only when explicitly enabled
- sign-in delegates to Supabase Auth and fails closed on any error, never marking a caller authenticated
- snapshot regeneration is deterministic and contains no hand-edited drift
- styling is token-only and restrained: no glow, glass, shadow or ambient animation, one editorial column
- the existing Normal A4C lesson/assessment path is unmodified by this closeout
- the first screen is the Golden Entry: wordmark, Skip, hero, the Observe → Commit → Refine proof and one Continue
- the step affordance is a text-labelled group whose active step differs by more than colour
- untargeted Learn shows the landing; every explicit workspace deep link still works

## Cache and telemetry increment — 2026-10-04
- Task 3 browser setup blocked: locked Playwright Chromium shell download repeatedly received an invalid/truncated ZIP within one install command; browser not installed. The new-route browser test attempt also timed out waiting for the unimplemented preview endpoint. Neither result is a behavioral RED test for a UI. No UI implementation or browser pass is claimed.
- Prepared local browser spec/config are unfinished and are not included in this commit/PR. No public preview route was added.
- Ruling: proceed with independent Task 4 unit-verifiable work while leaving browser acceptance open; do not upgrade dependencies or repeat infrastructure setup to hide the block. Cost: visual and real service-worker upgrade acceptance remain outstanding.
- Real service-worker source executed in Node VM against a controlled Cache API/fetch harness. Existing implementation failed protected GET, no-store, navigation/RSC, offline fallback and cache-ownership tests before change.
- Revised worker caches only an explicit same-origin public static allowlist. API, WORK, navigation, cross-origin, query-bearing, RSC and Authorization requests bypass worker caching. Private/no-store/no-cache and redirected responses are not saved.
- Activation removes only known unsafe cliniverse-v1/v2/v3 caches, preserves unrelated caches, then claims clients. No cache on a live user device was modified in this task.
- Public offline behavior changes deliberately: previously fetched allowlisted static assets can fall back to their own cache; generic HTML/app-shell offline fallback and install-time root pre-caching are removed. Offline LEARN browser acceptance remains required before merge.
- Closed telemetry key/value allowlists added, without wiring an exporter. Caller must generate random correlation UUIDs; UUID format validation is not proof that a value is non-identifying.
- Final focused suite: 50/50 passed (12 added in this increment), zero skipped. Full suite: 986 total, 962 passed, same 24 baseline failures, zero new failing names. TypeScript check exited 0.
- No build, screenshot, visual acceptance, protected-route verification or browser cache-upgrade proof obtained.
- Next dev regenerated AGENTS.md locally; unrelated generated change is not included. No dependency or lockfile changes.
- Author review only. Draft remains unmerged. Tasks 3 and browser portion of 4 remain incomplete; task 5 remains gated.
