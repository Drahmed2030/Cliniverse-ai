# Cliniverse Agent Execution Contract

Status: ACTIVE  
Scope: release-closeout and approved post-release preparation only  
Owner: Cliniverse command center  
Repository: Drahmed2030/Cliniverse-ai  
Canonical working branch: qa/case-batch20-cloud

## Current verified baseline

Verified HEAD at time of this contract:

`ba98f9ebb33af096e6db71724139837b7253c6f4`

Latest verified workflow:

`Case batch cloud QA #91 — SUCCESS`

An agent must always fetch and verify the current remote branch before editing. The SHA above is a historical checkpoint, not permission to reset a newer remote state.

## Operating model

The command center owns:

- architecture;
- scope;
- release priorities;
- protected-system decisions;
- merge/push/deploy decisions;
- final diff and CI review.

The coding agent owns only:

- implementation of the explicitly assigned slice;
- focused tests;
- typecheck;
- browser regression where required;
- a concise evidence report.

The agent must not invent a second architecture or broaden the task.

## Mandatory start protocol

Before editing:

1. fetch `origin/qa/case-batch20-cloud`;
2. report repository, branch, remote SHA and local HEAD;
3. report `git status --short`;
4. preserve unrelated local or untracked work;
5. if the local checkout is dirty or does not match the required remote state, create an isolated Git worktree;
6. do not reset, clean, stash, overwrite or absorb unrelated changes;
7. stop if the remote branch advanced beyond the task's declared starting SHA unless the new state is explicitly reviewed.

## Protected systems

Do not change unless the command center explicitly authorizes that exact change:

- StoreKit products or product identifiers;
- entitlements;
- Apple signing configuration;
- Supabase schema, migrations or RLS;
- ECG governed source or provenance;
- Echo licensing or provenance;
- Connected Diagnostics;
- NeuraOps implementation or service boundaries;
- production deployment configuration;
- accepted five-tab primary navigation;
- approved clinical release content.

Primary navigation must remain exactly:

`Today / Learn / Progress / Explore / Me`

## Product rules

- Never invent learner progress, clinical evidence, review status or licensing status.
- Never expose engineering/governance internals in learner-facing UI.
- Feature availability and clinical content readiness are separate concepts.
- Unreviewed or uncertain clinical material must not be presented as learner-ready.
- Reuse Content Graph, Content Collections, Event Contract and shared design tokens.
- Prefer small contracts/adapters over direct module coupling.
- No duplicate navigation systems, theme forks or legacy-screen resurrection.
- Legacy code is source material; presentation must be recomposed through the current Cliniverse system.
- Do not add dependencies merely to simplify an implementation that can use existing platform primitives.

## Current release-closeout priorities

Work only in this order unless the command center changes it.

### Gate 1 — Learner-facing commercial cleanup

Verify and correct only genuine learner-facing release blockers:

1. ECG learner UI must not expose internal engineering/governance details such as hashes, policy IDs, promotion blockers or internal routes.
2. Explore must not present ambiguous `In review` language as if it were usable learner content. Preserve truthful readiness without falsely promoting content.
3. No internal/demo/synthetic engineering copy should appear as premium learner value.

Do not alter protected ECG provenance or underlying review contracts to accomplish presentation cleanup.

### Gate 2 — Branded authentication confirmation

Prepare the application-side branded confirmation route and safe error/success states.

Do not modify Supabase schema/RLS.

Any live Supabase email-template or redirect configuration change requires explicit command-center authorization after code review.

### Gate 3 — Approved content depth

Surface only already approved, licensed and learner-ready content.

Do not promote candidate, review-only or uncertain media to learner-ready.

Commercial-safe content rights remain required.

### Gate 4 — Final release regression

Required before any fresh signed build:

- focused content and boundary tests;
- Ward/Atlas compatibility;
- TypeScript;
- navigation/media/accessibility Playwright checks;
- account-saving matrix;
- Today/Learn/Progress continuity checks;
- no protected-system drift;
- no learner-facing engineering internals.

### Gate 5 — iOS build handoff

Only after Gate 4 is green:

- prepare fresh signed iOS build through the existing Codemagic path;
- preserve StoreKit and signing configuration;
- verify device/runtime behavior;
- do not submit to Apple until commercial closeout evidence is reviewed.

## Change protocol

For each assigned slice:

1. make the smallest coherent change;
2. add or update tests that validate behavior, not only source strings where executable behavior is practical;
3. run the narrow test first;
4. run the relevant broader gate;
5. run typecheck;
6. run `git diff --check`;
7. inspect the final diff;
8. commit one logical slice only;
9. do not merge or deploy unless explicitly authorized.

A stale test should be scoped or updated only when the existing product behavior is demonstrably correct. Never change valid product behavior merely to satisfy a stale assertion.

## Stop conditions

Stop immediately and report if:

- required remote state cannot be verified;
- a protected-system change appears necessary;
- clinical readiness or licensing is uncertain;
- the implementation would require invented progress/data;
- an external write outcome is uncertain;
- unrelated worktree changes would be overwritten;
- tests reveal a semantic defect outside the authorized slice;
- production deployment would be required.

## Required completion report

Every agent implementation report must include:

- starting SHA;
- final commit SHA;
- files changed;
- behavioral purpose of each changed file;
- focused PASS/FAIL counts;
- broader regression result;
- TypeScript result;
- Playwright result where applicable;
- protected-system changes: YES/NO;
- Supabase schema/RLS changes: YES/NO;
- StoreKit/signing changes: YES/NO;
- production changes: YES/NO;
- unresolved blockers;
- ready for command-center review: YES/NO.

## Post-release R&D boundary

The following items are recorded only as post-release work and must not enter current release scope:

**Cliniverse Agent Experience Layer — CopilotKit / AG-UI Evaluation**

**Audio Learning Layer v1 — Gemini TTS Evaluation**
- evaluate provider-neutral speech synthesis behind a SpeechProvider adapter;
- initial candidate experiences: Ward handover read-aloud and ECG/Echo reasoning playback;
- reviewed Cliniverse transcript remains the source of clinical content;
- TTS must never generate or decide clinical truth;
- no PHI in provider requests;
- no runtime dependency or API integration is authorized for the current release.

Their existence in documentation is not implementation authorization.

## Final principle

Do not optimize for the largest change.

Optimize for the smallest verified change that moves Cliniverse toward release while preserving clinical truth, provenance, licensing, account safety and product coherence.
