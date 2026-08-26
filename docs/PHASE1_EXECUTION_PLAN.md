# Cliniverse AI — Phase 1 Execution Plan

## Objective
Unify Cliniverse with NeuraOps without rebuilding the product and without expanding high-risk clinical functionality.

## Sequence

### A. Capability extraction
- Inventory every major component and API.
- Assign each to Care Operations, Clinical Intelligence, Human Escalation, Clinical Tools, Academy, or Platform.
- Mark maturity: implemented / partial / placeholder.
- Mark decision: keep / refactor / hold / remove-after-archive.

### B. Shell consolidation
- Introduce a simplified NeuraOps-aligned shell.
- Preserve existing capabilities behind grouped navigation.
- No feature deletion during shell consolidation.

### C. Shared design system
- Establish NeuraOps/Cliniverse tokens for surfaces, typography, states, spacing, radii and responsive behavior.
- Replace ad-hoc visual divergence incrementally, not by mass rewrite.

### D. Security gate
- Complete P0 healthcare security gates before real patient data or production healthcare operations.

### E. First workflow
- Implement Follow-up → Prioritization → Human Escalation as the first operational Cliniverse workflow.
- Reuse NeuraOps lifecycle/escalation patterns where possible.

## Explicitly postponed
- autonomous diagnosis
- autonomous prescribing
- broad mobile expansion
- new gamification/social features
- additional AI model proliferation
- large-scale infrastructure migration

## Success criteria for Phase 1
- one coherent product hierarchy
- one simplified shell
- existing valuable features remain accessible
- shared NeuraOps design language
- security risks explicitly gated
- clear path to the first healthcare workflow pilot
