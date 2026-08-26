# Executive Decision Log — 2026-08-26

1. NeuraOps is the company and shared AI workflow platform.
2. Cliniverse AI is a core healthcare vertical of NeuraOps, not a separate infrastructure company.
3. Cliniverse's existing feature base is preserved and reorganized rather than deleted wholesale.
4. The simplified shell groups capabilities into Care Operations, Clinical Intelligence, Clinical Tools, Academy, and role-gated platform/admin areas.
5. The first operational Cliniverse wedge remains Follow-up + Prioritization + Human Escalation.
6. NeuraOps infrastructure patterns should be reused for auth, tenancy, workflow lifecycle, escalation, resilience, audit and operations.
7. Cliniverse should contribute healthcare event/state orchestration, evidence enrichment, vector/context matching and clinical workflow UX patterns back to the wider NeuraOps platform where appropriate.
8. v0 is approved as a UI/shell acceleration layer, not as an authority for clinical logic, security, data access or medical algorithms.
9. No production healthcare/PHI use until the P0 security gates are satisfied.
10. Changes proceed branch-first, preview-first and review-first; no direct production modification during consolidation.
