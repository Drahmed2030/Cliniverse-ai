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
- a targeted training action; and
- a governance closure gate that remains blocked while evidence or review is open.

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

## Safety boundaries

- Fictional simulation data only.
- Human review is required for attribution and closure.
- No patient identity or clinical record ingestion.
- No autonomous diagnosis, triage, treatment, activation, or escalation.
- No claim of clinical validation or improved patient outcome.
- No database migration or production connection.
- No inclusion in the Apple release shell.

## Verification record

- Full repository tests: 123 passed, 0 failed.
- ESLint for new TypeScript/TSX: passed.
- TypeScript `--noEmit`: passed.
- Next.js production build with webpack: passed.
- Route output: statically generated.
- Server-rendered contract check: key headings, boundaries, return link, and training anchor present.
- Figma mobile and tablet compositions: visually reviewed after token, typography, component-state, clipping, and CTA corrections.

The remote browser could not reach the isolated localhost address because that environment blocks loopback navigation. This did not trigger a deployment workaround; the limitation is retained as a pre-deployment browser-test gate.

## Next gate

Before any real-data pilot, the team must approve the event schema, source-system mapping, reference ownership, clinical safety case, privacy impact assessment, validation protocol, human-review workflow, and institutional pilot contract. Code Connect should be finalized only after this branch is published at a stable source URL.
