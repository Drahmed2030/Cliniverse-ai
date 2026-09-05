# Platform Governance and Recovery v1

Status: local governance package; no external setting change, deletion, merge, production promotion, credential rotation, purchase or clinical authorization is granted by this document.

Observed: 2026-09-05

## Executive decision

Cliniverse AI and NeuraOps keep one source-control authority and one primary web runtime each. Duplicate deployment projects are quarantined before removal, Cloudflare is not an active production or disaster-recovery runtime until a tested adapter and recovery drill exist, and NeuraOps becomes the read-only operational control plane for portfolio evidence rather than a second source repository.

This package is enabling infrastructure for the existing clinical, Apple and commercial roadmaps. It does not add a product surface, medical content or a third product spark.

## Authority map

| Capability | Authority | Approved role | Explicitly excluded |
|---|---|---|---|
| Cliniverse source | `Drahmed2030/Cliniverse-ai` | canonical code, pull requests, CI and release history | duplicate source repositories |
| NeuraOps source | `Drahmed2030/neuraops-core` | canonical control-plane code and commercial operations | storing Cliniverse source as a second copy |
| Cliniverse runtime | Vercel `cliniverse-ai-u7gi` | Preview and approved Production delivery | legacy unlinked Vercel projects |
| NeuraOps runtime | Vercel `neuraops-core` | Preview and approved Production delivery | `neuraops-core-snnv` |
| Cloudflare | Worker `cliniverse` | DNS/WAF or future recovery candidate after a governed adapter | automatic builds from every feature branch |
| Apple | App Store Connect and Codemagic | signed iOS distribution under the existing Apple gates | inference from a green web build |

The machine-readable snapshot is `PLATFORM_DEPLOYMENT_REGISTRY_V1.json`.

## Authentication model

1. Agent read access to Vercel uses the connected Vercel application with OAuth. A personal access token must not be requested from the founder for routine inspection.
2. Protected Preview access uses a short-lived Vercel share link or an automation bypass secret stored only in the relevant secret manager. It must not be committed.
3. GitHub access uses the installed GitHub application with repository-scoped permissions.
4. Dashboard actions that require account recovery, billing ownership, MFA or organization administration remain human-authenticated actions. MFA codes and recovery codes must never be sent in chat or committed.
5. Cloudflare changes remain blocked until the official Cloudflare connection or an authenticated founder browser session identifies the exact account and Worker settings.

## Commit and release contract

1. Begin from a freshly verified canonical branch head.
2. Use one bounded branch and one logical concern per commit.
3. Use Conventional Commit prefixes: `feat`, `fix`, `test`, `docs`, `refactor`, `security`, `chore`.
4. Run tests, TypeScript, lint, build and `git diff --check` appropriate to the changed scope.
5. Record the commit SHA, tree SHA, parent SHA and gate result before Push.
6. Push only after the approved destination repository and branch are re-read.
7. Preview is created from a non-production branch. Preview success is not Production approval.
8. Merge to `main` uses a pull request and squash merge after required checks and explicit approval.
9. Production promotion, Apple submission, database migration and secret changes remain separate approvals.
10. Force Push and branch deletion are prohibited unless an incident-specific recovery plan is approved.

When a local commit must be rebased onto an equivalent remote commit, proceed only when the local parent tree and remote head tree are identical. Create a new commit with the approved remote head as its single parent, verify the resulting tree equals the local commit tree, and update the branch with a non-force fast-forward.

## Proposed `main` rulesets

The two JSON files beside this document are reviewable REST payloads, not active settings:

- `GITHUB_RULESET_CLINIVERSE_MAIN_V1.json`
- `GITHUB_RULESET_NEURAOPS_MAIN_V1.json`

They prohibit deletion and force pushes, require linear history and require pull requests. Cliniverse requires the `release-contracts` check; NeuraOps requires the actual `reliability` check emitted by its workflow. Approval count is initially zero because the repositories currently have one human owner; this preserves an auditable PR boundary without inventing a second reviewer. Required signatures are deferred until the GitHub App commit path can produce verified signatures.

## Vercel cleanup protocol

Cleanup is two-stage and fail-closed:

### Stage 1 — quarantine

- Preserve `cliniverse-ai-u7gi` and `neuraops-core`.
- Mark `neuraops-core-snnv` as a confirmed duplicate because it is linked to the same repository, has no custom domain and repeatedly creates failing builds for the same SHAs.
- Treat every unlinked or legacy Vercel project as `inventory-required`, not deletion-approved.
- For each candidate, inspect domains, environment-variable names and targets, current aliases, latest Production deployment, integration ownership and rollback relevance.
- Remove Git integration or automatic deployment from duplicates before deletion when possible.

### Stage 2 — removal

A project can be removed only when it has no authoritative domain, no unique required environment configuration, no active production dependency, no required evidence artifact and an exact project ID has been approved. Removal must use the platform's safe mode where available and produce a deletion receipt.

## Cloudflare cleanup protocol

1. Open Worker `cliniverse` and confirm its linked GitHub repository.
2. In `Settings > Build > Branch control`, disable builds for non-production branches.
3. Confirm the production branch is `main`; do not change it during this cleanup.
4. Inspect the build and deploy commands. If no reviewed Cloudflare adapter exists in the repository, disconnect the Git integration rather than accepting permanent red checks.
5. Preserve DNS/WAF settings and custom domains. This package authorizes no DNS movement.
6. A future Cloudflare recovery path requires a reproducible OpenNext/Workers build, isolated secrets, a non-production URL, compatibility tests and an explicit recovery drill before it can be called a standby.

## NeuraOps control-plane boundary

NeuraOps may ingest only operational metadata: repository, branch, commit SHA, tree SHA, pull request, test status, deployment environment, Vercel deployment ID, URL, owner, approval state, incident state, cost category and next action.

NeuraOps must not ingest patient-identifiable data, clinical payloads, access tokens, MFA codes, secret values or raw protected logs. It is read-only by default. Merge, deployment, deletion, secret rotation, billing and production changes require a scoped approval and an immutable receipt.

## Recovery tiers

- Tier 0: GitHub canonical repositories and release tags.
- Tier 1: a one-way, non-deploying repository mirror after credentials and divergence protection are approved.
- Tier 2: Vercel rollback to a previously verified deployment.
- Tier 3: Cloudflare warm standby only after adapter and recovery tests pass.

An automatically failing duplicate deployment is not a backup.

## Healthcare-system controls

- Separate Preview, Production and disaster-recovery environments.
- Keep PHI out of source control, deployment metadata, analytics and control-plane records.
- Apply least privilege, auditability, deterministic release evidence and human approval to clinical wording and regulated-data changes.
- Do not treat platform compliance certifications as product compliance or clinical validation.
- Preserve the existing database, Apple and clinical-safety gates; this package changes none of them.

## Completion gates

This governance slice is complete only when:

1. the registry passes its deterministic test;
2. both proposed rulesets are reviewed before activation;
3. Cloudflare non-production builds are disabled or the obsolete Git integration is disconnected;
4. the duplicate Vercel project is proven safe to remove and receives exact deletion approval;
5. the remaining legacy Vercel inventory is classified without bulk deletion; and
6. NeuraOps exposes the registry as a read-only operational projection in a later, separately approved slice.
