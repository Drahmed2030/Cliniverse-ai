# Cliniverse — Production Web Releases Are App Releases (Control Procedure, DRAFT for MASTER / Work 1)

**Why this exists.** The iOS app is a thin shell that loads `https://www.cliniverseai.com` (`capacitor.config.json` → `server.url`; `webDir: public` holds only `native-offline.html`). Whatever Vercel serves at that origin *is* the app — for installed users, TestFlight and App Review — with no IPA involved. Codemagic additionally refuses to build unless `GET /api/release-contract` (`app/api/release-contract/route.ts`, returns `VERCEL_GIT_COMMIT_SHA`) equals the commit being built, so the production deployment and the IPA are bound to the same SHA. (`codemagic.yaml` → `scripts/verify-native-release-origin.mjs`.)
MASTER decision (Issue #36): every production deployment to www.cliniverseai.com is an app release event.

## Verified facts (read-only Vercel queries by Claude on 2026-10-26; no changes made)
| Fact | Value | Class |
|---|---|---|
| Team / project serving the domain | team `cliniverse-ai`, project `cliniverse-ai-u7gi` (`prj_Dq2B7ckeEqS6UvNzEaIZnYHBCFnX`); `www.cliniverseai.com` is a domain of that project; apex `cliniverseai.com` redirects (308) to www | VERIFIED |
| **Current production deployment** | `dpl_CJC9unCgx4Xd7FeHNZkU8wER14Ya`, state READY, created 2026-09-22 16:58 UTC, branch `qa/case-batch20-cloud`, **commit `e4dab595d96c1d7e2583a28b15f2bb2497b4e65b`** ("feat(account): add protected in-app account deletion") | VERIFIED |
| Meaning | Production serves exactly the Build 69 baseline. **R3/R4/R5 are NOT deployed** (R4 is approved but not live). Whether Codemagic's "1.1 (69)" IPA was built from this SHA still needs Work 1's Codemagic evidence. | VERIFIED / INFER |
| Previous production deployments (rollback candidates, all `isRollbackCandidate: true`) | `dpl_HkCb4x9C…` = `d38af2cc` (2026-09-19), `dpl_8zBeRy2E…` = `ddeefb09`, `dpl_Hn3aLoWo…` = `34d26849` (Build 67 lineage), `dpl_CmFu4fvY…` = `1cdacf9e`, `dpl_3j6YWQqA…` = `d019f5fc` (branch `strategy/commercial-activation-v1`) | VERIFIED |
| Branches that produced production deployments | `qa/case-batch20-cloud` (latest five) and once `strategy/commercial-activation-v1` | VERIFIED |
| Branch `claude/cliniverse-1-1-build-69-tpzp5p` | each push creates a **preview** deployment (`target: null`, not a rollback candidate), e.g. `dpl_7nzHXeiB…` for the assessment commit. Patches are stored as files in `docs/`, so previews contain no patched code. | VERIFIED |
| Project Production Branch setting / auto-deploy behaviour | not exposed by the queries | **UNVERIFIED** |
| SSO protection | enabled for all deployments except custom domains | VERIFIED |

**Consequence to confirm today:** if `qa/case-batch20-cloud` is (or behaves as) the Production Branch, **a plain `git push` to it would change the live app**. R4/R5 are descendants of that branch's commit `e4dab59`; they must **not** be pushed or merged there without the full gate below.

## Gate for any production web deployment
1. **Candidate identified by exact SHA** (40 hex) and, when applying patches, the SHA-256 of each patch (R4 `80d3fdac…93f9`, R5 `020c0918…d5fb`, R6 `4f7dba1d…93ae`, R6.1 `00a37464…e11d`, R6.2 `c83c3a7e…78f2`, R6.3 `6aa429dc…d6`) and their apply order. No "latest of branch".
2. **Preview first:** deploy that exact SHA to a Vercel preview (never to production first). Record the preview deployment id.
3. **Evidence package on that SHA:** `npm test`, `npx tsc --noEmit`, `next build`, browser check script(s), diff vs the current production SHA (file list), list of user-visible changes.
4. **Independent review:** Work 1 sign-off on the exact SHA + digests.
5. **MASTER written authorization** naming the SHA, the target (production), and the time window. Issue #36 comment is the record.
6. **Pre-deploy snapshot:** record the current production deployment id and commit (today: `dpl_CJC9un…` / `e4dab595…`), the output of `/api/release-contract`, and confirm a rollback target exists and is READY.
7. **Deploy exactly that SHA.** Promote the reviewed preview or run the approved production deployment of that commit; do not rebuild from a moving branch.
8. **Verify (within minutes):** `GET /api/release-contract` returns the authorised SHA with `environment: production`; smoke checklist — sign-in (email + reviewer), sign-up screen loads, Forgot-password request reachable, `/reset-password` headers (`Referrer-Policy: no-referrer`, `no-store`), Learn/Ward/Echo load, Paywall shows corrected copy, `/sw.js` and `/register-sw.js` return `no-store` and the registered worker is `cliniverse-static-v4` (legacy `cliniverse-*` caches gone after a reload), offline `/` shows only the offline page, **in a browser profile that already visited production** (the only way to prove the production-origin worker upgrade) a first direct visit to `/reset-password` removes the old worker and continues, Me → Delete account dialog opens (do not delete), `/terms`, `/privacy`, `/support` return 200.
9. **Rollback triggers:** failed smoke check, sign-in/session errors, error-rate spike, any reviewer-account failure. **Action:** re-promote the recorded previous production deployment (Vercel "Instant Rollback" / `vercel rollback`; operator to confirm availability on the Pro plan), then re-check `/api/release-contract` and the smoke list. Note a rollback also changes the contract commit; if an IPA build is pending, Codemagic will refuse until production and the build commit match again.
10. **Record:** SHA, digests, who approved, deployment ids, smoke results, rollback status — appended to Issue #36 and the release packet.

## Rules while an Apple review or a TestFlight build is in flight
- **Freeze:** no production web deployment except an authorised fix that went through the gate above. The reviewer sees live production, so an unreviewed deploy can change what Apple is reviewing.
- **Order for the next release candidate:** (a) build the RC lineage and run evidence; (b) deploy that exact SHA to production through the gate; (c) only then start Codemagic with `CM_COMMIT` = that SHA (it verifies the contract); (d) TestFlight QA; (e) submit. Step (b) is the release step — it must not be treated as routine.
- **Branch hygiene (proposed):** make production deploy only from a protected release branch or by explicit promotion; keep `qa/*` and `claude/*` branches preview-only; require review for pushes to the production branch. Needs an operator to inspect/change project settings — not done here.
- **Cost note:** every push to a connected branch builds a preview; keep patch deliveries as files in `docs/` (as done) to avoid building patched code on previews unintentionally.

## Open items for Work 1 / operator
Production Branch setting and auto-deploy; Instant Rollback availability; who may promote to production (team roles); Codemagic run → SHA → IPA → ASC mapping for 1.1 (69); whether the apex redirect and the `cliniverse-ai-u7gi*.vercel.app` aliases should be reachable.
