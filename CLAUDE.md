# Cliniverse AI — Engineering Contract

Live at: cliniverseai.com | Repo: `Drahmed2030/Cliniverse-ai` | Vercel Pro + custom domain | Supabase Postgres + pgvector

This file is a **durable execution contract**, not a project status log. It tells an agent *how* to work in this repo. It does not track current batch state, current HEAD, current test counts, or current external review status — those change too fast to live here safely and go stale the moment they're written. See "Dynamic state" below for where that actually lives.

---

## 1. Core engineering principles

**A. Think before coding.** Inspect current state before touching anything. Identify the existing implementation path for what you're asked to do — most capabilities already have one. Identify invariants you must not break and the blast radius of your change. State your success criteria before you start, not after.

**B. Keep it simple.** Ship the smallest correct change. No speculative abstraction, no premature framework, no second implementation path for something that already has one. Three similar lines beat a premature abstraction.

**C. Surgical changes.** Touch only the files the task requires. Do not opportunistically refactor adjacent code. Do not break working production behavior to make a change "cleaner."

**D. Verify, don't assume.** Run tests, typecheck, and build — every time, not just when it's convenient. Verify in a browser/device/staging environment when the change is user-facing. **Never claim a migration, deployment, seed, or any other external effect happened without evidence** — a drafted SQL file is not an applied migration; a green build is not a live verification.

---

## 2. Cliniverse-specific invariants

- Work batch-by-batch. Standard loop: **inspect → implement → targeted test → full test → typecheck → build → commit → push → staging apply (external) → verify → document → close.** Do not start the next batch until the current one is explicitly closed by the user.
- Do not leave validated work sitting only in the working tree — commit and push it once it's verified and the user has asked for it persisted. Uncommitted work is not "done."
- Do not create a parallel architecture when an existing system can be extended. Before building something new, grep for whether it already exists — reuse over rebuild, every time (see Batch 5: `kg_nodes`/`kg_edges` already existed, empty and unused — extended additively rather than replaced).
- Prefer additive migrations (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, new indexes/constraints) over destructive ones.
- **Staging before production, always.** Production Supabase changes require prior staging verification. Never use production as the first migration test. This sandbox typically has no Supabase credentials or network access at all — migrations are drafted in `supabase/drafts/` (`<name>_v1.sql` forward, `.rollback.sql`, `_catalog_check.sql` read-only verification) and applied externally by the operator, then synced back via `git`. Do not assume a drafted migration has been applied until the user reports it and you can see the synced evidence (updated docs, row counts, etc.).
- Every RLS-enabled, client-facing table needs **explicit, intended privileges and policies, verified against live catalog state** — not just declared in the migration. Two hard lessons behind this, both real:
  1. A table with only a `SELECT` policy can silently block writes for a service-role key in some configs — `.update()` returns HTTP 200 with an empty array and **no error thrown**. Never trust a clean write response; `.select()` the row back afterward.
  2. **`REVOKE` does not delete a stale policy.** Batch 5's staging apply found two pre-existing `PUBLIC`-role policies on `kg_nodes`/`kg_edges` that predated the migration; revoking table privileges made them inert but did not remove them from `pg_policies`. A migration must explicitly `DROP POLICY IF EXISTS` anything not in its intended final state and self-verify the **exact policy count**, not just that privileges look right.
- Never expose `hidden` / `review_required` / `media_pending` / `labs` content to learners. `visibility === 'visible' && readiness === 'ready'` is the only combination a learner-facing query may return, ever — outside an explicitly reviewer/labs-gated scope.
- `clinical_content_catalog` (see `docs/CLINICAL_CONTENT_CATALOG_V1.md`) is the content truth/control-plane layer — one governed index of what content exists and whether it's learner-ready. No component hardcodes a content count or queries content tables directly; everything goes through `app/lib/contentCatalog.ts`.
- Clinical Orbit (see `docs/CLINICAL_ORBIT_V1.md`) must always resolve a content node against catalog visibility/readiness before showing it. No component queries `kg_nodes`/`kg_edges` directly — go through `app/lib/clinicalOrbit.ts`.
- StoreKit 2 remains subscription/entitlement authority. Supabase auth remains account-identity authority. Do not blur this boundary or invent a third source of truth for either.
- No PHI in learner-facing or general cloud features. Institutional/patient-data workflows require separate, explicit governance — never fold them into the general learner product path.
- No clinical claim without provenance and review status attached. No invented SNOMED/LOINC/RxNorm codes — only use a normalized code where a verified one exists. No AI-generated clinical relationship is ever promoted to "reviewed" evidence; that requires an actual clinical review step.
- Any UI using swipe/drag gestures must keep a non-gesture (keyboard, tap) path to the same action, and must respect `prefers-reduced-motion`.
- Do not introduce Tailwind, shadcn, or any new design system without an explicit decision from the user. This repo styles with inline `style` objects using the `var(--cv-*)` design tokens defined in `app/commercial-visual-system.css` (light/dark via `@media (prefers-color-scheme)` and `[data-theme]`).

---

## 3. Dynamic state — do not hardcode here

CLAUDE.md must never embed facts that change batch-to-batch. When you need current state, read it from source, not from memory of an earlier conversation:

- **Overall plan / batch sequence:** `CLINIVERSE_V1_2_EXECUTION_PLAN.md`
- **Canonical recovery/architecture reference** (supersedes older recovery audits): `CLINIVERSE_MASTER_RECOVERY_UNIFICATION_REPORT_V2.md`
- **Content catalog truth layer, current staging/local counts, drift notes:** `docs/CLINICAL_CONTENT_CATALOG_V1.md`
- **Clinical Orbit graph status, staging verification result:** `docs/CLINICAL_ORBIT_V1.md`
- **Batch-specific status docs** live in `docs/` (e.g. `RLS_ISOLATION_BATCH3_STATUS.md`) — grep `docs/` for the batch you care about rather than assuming this file knows.
- **Current HEAD, branch state, uncommitted work:** `git status`, `git log` — always live, never stale.
- **Current App Store / native review status, Bundle ID, Capacitor state:** verify directly (ask the user, or inspect `capacitor.config.json` / `ios/App/`) before any action that depends on it — do not assume a status from an old conversation still holds. (As of this writing, `capacitor.config.json` and `ios/App/` already exist in the repo — do not assume Capacitor conversion is still pending.)
- **Oracle / model-provider config:** `app/api/oracle/route.ts` is the source of truth — OpenRouter's free tier changes on its own schedule; verify a model slug against `openrouter.ai/models` before assuming it still works. Do not hardcode "current" model slugs into this contract file.

There is no capability registry in this repo today. Do not create a large one speculatively — if a specific batch genuinely needs one, that's a decision for that batch, made explicitly with the user.

---

## 4. Agent behavior checklist

**Before coding:**
- Inspect the relevant files as they exist right now, not as remembered.
- Run `git status` and confirm current branch/HEAD before making changes.
- Check whether the requested capability already exists somewhere in the repo.
- If asked to recover work from another branch, inspect that branch's actual diff before assuming what it contains.

**Before database work:**
- Inspect the live schema, policies, and privileges (or the best available draft/verification SQL) before writing a new migration.
- Inspect existing migrations in `supabase/drafts/` for a table before adding a competing one.
- Reconcile new work against current live state explicitly — don't write a migration that assumes a clean slate.

**Before introducing a dependency:**
- Prove the current stack can't solve it cleanly first (check what's already installed).
- If you do add one, report its cost (bundle size, maintenance surface) and why nothing existing sufficed.

**Before claiming completion:**
- Report the exact tests run and their pass/fail counts, not "tests pass."
- Report the exact files changed, not "updated the relevant files."
- Report exactly what external action was and was not performed (migration applied? deployed? seeded?) — never imply an external effect you didn't verify.
- Report blockers honestly, including ones you introduced or found late.

---

## 5. Medical / health-intelligence guardrails

- Educational output is not clinical authority. Never present it as diagnostic or prescriptive.
- Do not transform unreviewed AI inference into learner-ready "truth" — an unreviewed relationship, measurement, or claim stays marked as such until a real review step clears it.
- Preserve provenance, license, review status, and source revision on every piece of clinical content or relationship — these are load-bearing metadata, not decoration.
- Do not infer or expose patient identity anywhere in the general product.
- Do not ingest institutional patient media into general/learner product paths. De-identification and institutional approval are separate, explicit gates — never assumed or bundled into a general feature.
- Any measurement (e.g. an echo EF, an ECG interval) must preserve who/what produced it and its review status — never collapse "AI-estimated" and "clinician-verified" into one undifferentiated value.
- If a model/AI vendor is used for a clinical-adjacent feature, record provider, model, and version, plus clinician-verification status, alongside the output.
- Prefer structured uncertainty (e.g. "pending_review", a confidence band from a governed source) over false precision. Never fabricate a confidence score.

---

## 6. Batch 6 guardrails (contract only — Batch 6 itself is not started)

When Echo work is eventually implemented, it must:
- Reuse the existing Echo Studio/media contracts (`app/lib/clinicalMedia/*`) rather than building a parallel media model.
- Model at the **study** level, not "one video = one case" — separate study / cine / view / finding / measurement / phenotype / activity as distinct concepts.
- Preserve license, provenance, and review status on every asset and measurement.
- Never fabricate an EF or any other measurement value.
- Distinguish AI-produced measurements from clinician-verified ones explicitly, everywhere they're shown or stored.
- Never expose institutional/raw patient material in learner scope.
- Put any vendor AI integration behind an adapter contract — the architecture must not hardcode one vendor as *the* architecture. A provider swap should touch the adapter, not every call site.

---

## 7. Stack & repo conventions

- Next.js App Router, TypeScript, deployed on Vercel.
- Supabase Postgres + pgvector. Production: `zbiujqxinvcxvuviuenx.supabase.co`. Staging: `xhwotblarwsxoanpiloe.supabase.co`. Never confuse the two — production changes require explicit, separate approval after staging verification.
- Styling: inline `style` objects per component, using `var(--cv-*)` tokens from `app/commercial-visual-system.css`. No Tailwind/Shadcn.
- `app/page.tsx` renders `ReleaseApp` (`app/components/ReleaseApp.tsx`) — imports via relative paths (`./components/X`), not `@/components/X` (no path alias configured).
- Top-level navigation contract: `FloatingNav.tsx` exports `type Tab = 'hub' | 'ward' | 'oracle' | 'tools' | 'me'` with props `{ active, onChange }` (not `tab`/`setTab`) — this is the stable, external nav contract. `ReleaseApp.tsx` maintains its own richer internal tab/routing state on top of it; don't assume the two use identical string values. Multiple `page.tsx.bak*` files in `app/` are dead code from an earlier navigation iteration (including an old `MAIN_TABS` swipe implementation) — not live, not imported, safe to ignore unless a batch explicitly asks you to clean them up.
- Two-tier test pattern (established Batch 4, reused since): pure, network-free logic lives in `*Queries.ts` files and is directly unit-tested with `node --test`; anything touching `app/supabase.ts` (even transitively) is verified via static source-contract regex assertions instead of execution, since there's no live Supabase reachable in tests. Relative imports of a **value** (not `import type`) between two files under test must use an explicit `.ts` extension (Node's native TS-stripping test runner requires it even though Next.js's bundler doesn't) — see `app/lib/engagement/client.ts` or `app/lib/clinicalOrbitGraphQueries.ts` for the pattern.

---

## 8. Operational notes

- **Vercel env var corruption:** a pasted API key can look correct (right length/prefix) in both `.env.local` and Vercel but carry invisible whitespace/newlines, causing "invalid header value" errors at runtime. If a key that looks right is failing, suspect paste corruption before suspecting the key itself.
- **Native/App Store actions:** do not run `npx cap init`, change the Bundle ID, or make any other native-identity-affecting change without first confirming current App Store review status with the user — a stale assumption here can break an in-flight submission.
