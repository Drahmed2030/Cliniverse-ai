# Clinical Pathway Replay — Implementation Record v1

Status: isolated future prototype  
Branch: `strategy/clinical-pathway-replay-v1`  
Release impact: none

## Implemented slice

The first NeuraOps-to-Cliniverse operating slice is a deterministic, synthetic-only STEMI pathway replay. It converts a fictional event trail into a traceable operational view without making a diagnostic, treatment, or outcome claim.

The prototype exposes:

- a versioned replay input and output contract;
- seven ordered fictional events with source and accountable role metadata;
- Door-to-ECG interval, completeness, and open-gate metrics;
- explicit missing-evidence and delayed-event states;
- a draft gap attribution that always requires human review;
- a targeted deterministic ECG training action;
- a four-stage session contract (`Replay → ECG drill → Reassess → Review brief`);
- safe same-tab resume with malformed state rejected;
- an illustrative post-training reassessment; and
- a compiled review brief whose governance closure remains blocked while evidence or review is open.

## Six governed agents

1. Intake and normalization
2. Timeline integrity
3. KPI computation
4. Gap attribution
5. Training orchestration
6. Governance and closure

These are bounded functional agents, not six independent clinical authorities. Version 1 performs no model call, network request, database operation, or patient-data processing.

## Product surface

- Route: `/labs/pathway-replay`
- Figma file: <https://www.figma.com/design/drt0TfLkNtdUV7a9LNAvju>
- Primary phone frame: `11:2`
- Primary tablet frame: `14:3`
- Responsive implementation: `app/labs/pathway-replay/`
- Deterministic engine: `app/lib/cardiology/pathwayReplayAgents.ts`
- Session state machine: `app/lib/cardiology/pathwaySession.ts`
- Browser journey gate: `tests/visual/pathway-replay.spec.ts`

## Safety boundaries

- Fictional simulation data only.
- Human review is required for attribution and closure.
- No patient identity or clinical record ingestion.
- No autonomous diagnosis, triage, treatment, activation, or escalation.
- No claim of clinical validation or improved patient outcome.
- No database migration or production connection.
- No inclusion in the Apple release shell.

## Verification record

- Full repository tests: 149 passed, 0 failed.
- ESLint for new TypeScript/TSX: passed.
- TypeScript `--noEmit`: passed.
- Next.js 16 production build with Turbopack: passed.
- Route output: statically generated.
- Session contract tests: gating, retry, success, safe restoration and human-owned closure passed.
- Isolation test: engine, session, page and experience contain no provider, database or release-shell dependency.
- Figma mobile and tablet compositions: visually reviewed after token, typography, component-state, clipping, and CTA corrections.

The local browser binary could not be installed because the execution network rejected the external Chrome download. The responsive Playwright journey is committed as a repeatable gate; live browser and accessibility verification remains required on the strategy Preview before this implementation record is closed.

## Next gate

Before any real-data pilot, the team must approve the event schema, source-system mapping, reference ownership, clinical safety case, privacy impact assessment, validation protocol, human-review workflow, and institutional pilot contract. Code Connect should be finalized only after this branch is published at a stable source URL.
