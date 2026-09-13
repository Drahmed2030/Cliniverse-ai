# Code Lab account completion — isolated Preview candidate

Base: `2d971d11c9a77abbfded381059d930dcba27bda7` on `strategy/commercial-activation-v1`.

This candidate carries only the existing AccountCodeLab, lessonCompletion repository, BLS/ACLS player and hub fixes, their three focused test files, and a minimal Code Lab entry in the existing Ward workspace. Open Learn → Ward Simulation → Code Lab. No replacement learning player is introduced.

The larger local commercial candidate, marketing page, clinical-content edits, subscription changes, Codemagic settings and Apple release baseline are not included or modified. This is a detached verification worktree, not a second development branch. The original dirty worktree remains intact.

Verification: 23 focused tests PASS, 0 FAIL, 0 SKIP; TypeScript PASS; targeted ESLint PASS; diff whitespace check PASS. Local build uses webpack because dependencies are reused via an external symlink; this is not a dependency or configuration change. Vercel uses its normal configured build.

Completion is account-owned learning progress, not clinical competency or a credential. No schema, migration, RLS, entitlement or XP changes. The existing case_completions table is used. A real signed-in browser completion/save/reopen test remains pending.

Publishing authorization: user approved Preview only, no merge and no Production. Last observed Vercel deployment for this exact base and branch is Preview (`target: null`), project `cliniverse-ai-u7gi`, deployment `dpl_HLRgJopGvVL5UWyxnZPSLTsW83Vi`. Remote HEAD must be rechecked before pushing; no force push.
