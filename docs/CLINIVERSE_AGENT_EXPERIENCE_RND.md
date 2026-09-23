# Cliniverse Agent Experience Layer — CopilotKit / AG-UI Evaluation

Status: POST-RELEASE R&D CANDIDATE  
Implementation authorization: NONE  
Release impact: NONE

## Purpose

Record a future Cliniverse agent-experience research candidate informed by OpenMuse, CopilotKit and AG-UI interaction patterns.

This document does not authorize implementation, dependencies, UI changes, backend changes or release-scope expansion.

## Candidate experience patterns

Potentially valuable future interaction patterns include:

- visible agent plans and progress;
- persistent rich threads;
- pause / resume / cancel;
- human-in-the-loop approvals;
- explicit action receipts;
- safe takeover / handoff;
- clear tool-call state;
- no blind retry after an uncertain external write;
- durable agent tasks.

## Required architecture

Future direction must preserve:

Cliniverse
→ Agent Experience Layer
→ NeuraOps Application Services
→ Policy / Workflow / Audit / Provenance
→ Hospital adapters

CopilotKit / AG-UI may be evaluated only as an experience-layer implementation.

OpenMuse must not become the backend or source of truth.

## Agent layer must not own

The agent-experience layer must not own:

- clinical truth;
- authorization policy;
- hospital identity;
- workflow truth;
- persistence truth;
- continuity / reconciliation;
- audit authority.

## Healthcare-specific requirements

Any future agent layer must require:

- explicit permission scope;
- tenant / organization context;
- human approval for consequential writes;
- complete action receipts;
- audit and provenance;
- no shared credentials;
- no unrestricted terminal or browser access;
- no PHI in telemetry;
- uncertain external write state must never trigger blind retry;
- fail closed when action outcome is unknown.

## Release boundary

For the current Cliniverse release:

- do not implement this layer;
- do not add CopilotKit, AG-UI or OpenMuse dependencies;
- do not rewrite current learner UI around agent interactions;
- do not alter release scope;
- do not change the current source-of-truth architecture.

Re-evaluate only after release closeout as a separate architecture decision.
