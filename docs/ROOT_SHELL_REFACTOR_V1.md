# Root Shell Refactor v1

## Decision
The legacy `app/page.tsx` has accumulated UI, routing, state, feature imports, duplicated visual helpers, and patch drift in one file. It is no longer a safe place for incremental product work.

## Remediation
Replace the root page with a minimal composition entry point and move release orchestration into a dedicated `ReleaseApp` component.

## Release architecture

`app/page.tsx`
→ `ReleaseApp`
→ `ReleaseNav`
→ one active surface at a time

Primary surfaces:
- Home — orientation and next-action entry points
- Care — existing Ward/Care experience, isolated behind a section boundary
- Intelligence — Oracle/evidence experience, isolated behind a section boundary
- Atlas — curated capability library; incomplete/high-risk tools are gated
- Me — single account/profile/life/subscription/settings destination

## Safety rules
- No feature deletion during the refactor.
- Legacy modules remain available in the repository while release exposure is curated.
- No sample/manual data is labelled as live or connected.
- High-risk or incomplete capabilities are not exposed as production-ready.
- Each primary surface has its own loading/failure boundary.
- Root startup must never depend on loading every legacy feature bundle.

## Why this is safer
The previous root page imported and coordinated dozens of modules and contained duplicated/misplaced render blocks. The new root page becomes intentionally boring and stable. Product complexity lives behind explicit boundaries instead of inside the startup path.

## Merge gate
1. Authoritative Vercel build passes.
2. Root page has no unresolved identifiers or legacy patch fragments.
3. Home/Care/Intelligence/Atlas/Me navigation loads independently.
4. A failure in a secondary surface cannot blank the entire app.
5. iPad/iPhone first-launch validation passes before App Store resubmission.
