# Cliniverse AI — Capability Extraction Map v1

Status: Phase 1 / executive architecture consolidation
Owner: NeuraOps
Relationship: Cliniverse AI is the healthcare intelligence and workflow vertical of NeuraOps.

## Product architecture

### 1. Care Operations
Purpose: manage follow-up, prioritization, workflow state and escalation.

Representative assets:
- Virtual Ward / ward state engine
- Patient Journey
- Shift Handover AI
- Live Cases / workflow state patterns
- Critical event and decision-needed logic

Strategic destination:
Follow-up → Prioritization → Human Escalation → Resolution → Audit trail.

### 2. Clinical Intelligence
Purpose: enrich workflow decisions with evidence and context.

Representative assets:
- Clinical Oracle
- Clinical Nexus
- PubMed/FDA/RxNorm integrations
- Medical AI evidence route
- Knowledge graph / vector similarity matching
- Related Evidence Panel

Guardrail: model self-confidence or weighted multi-model agreement must never be represented as validated clinical confidence without formal validation.

### 3. Human Escalation
Purpose: ensure the system routes uncertainty, risk and unresolved work to a human clinician.

Target capabilities:
- escalation queue
- reason / trigger
- contextual summary
- evidence context
- ownership
- status lifecycle
- resolution / close-out
- audit history

Primary infrastructure source: reuse proven NeuraOps escalation and lifecycle patterns rather than rebuilding.

### 4. Clinical Tools
Purpose: preserve useful point tools without crowding the core navigation.

Representative assets:
- Drug interaction tools
- Renal dosing
- Clinical risk calculators
- FHIR integration prototype
- Prescription-related prototypes
- Clinical toolkit

Policy: preserve as capability library. High-risk medical decision tools remain HOLD for production use until validation, governance, security and regulatory requirements are defined.

### 5. Academy & Simulation
Purpose: preserve the education and simulation asset base as a separate engagement layer.

Representative assets:
- Virtual Ward simulation mode
- AI case generation
- Dynamic MCQ
- Code Blue
- BLS/ACLS
- Diagnostic Detective
- Board Exam
- Clinical Academy
- Clinical Duels

Commercial role: acquisition, education, onboarding and future institutional training; not the first operational wedge.

### 6. Platform / Infrastructure
Purpose: shared technical foundation.

Current assets:
- Next.js full-stack app
- Supabase data layer
- AI provider integrations
- embeddings/vector search
- PWA / Capacitor mobile assets
- Vercel configuration

Target source of truth:
- NeuraOps patterns for authentication, authorization, tenancy, workflow lifecycle, AI resilience, escalation, observability and operational admin
- Cliniverse-specific clinical domain logic remains isolated in the Cliniverse vertical

## Keep / Refactor / Hold / Remove

### KEEP
- Ward/event/state engine concepts
- Patient Journey
- Evidence retrieval adapters
- Vector similarity / contextual matching
- Related evidence UX
- FHIR R4 sandbox work as R&D asset
- Education/simulation modules

### REFACTOR
- Authentication
- authorization boundaries
- API guards
- shared design tokens
- navigation / information architecture
- database access boundaries
- AI response validation
- provider resilience
- environment/configuration management

### HOLD
- autonomous symptom/diagnostic workflows
- prescription decision workflows
- renal dosing automation in production
- broad mobile expansion
- education feature expansion
- social/gamification expansion

### REMOVE AFTER SAFE ARCHIVAL
- production debug endpoints exposing credential metadata
- committed secrets / secret-like configuration
- obsolete backup files and patch debris once verified against canonical source

## NeuraOps ↔ Cliniverse relationship

NeuraOps provides the shared AI workflow infrastructure.
Cliniverse provides healthcare-specific workflow intelligence.

NeuraOps should supply:
- auth / identity
- authorization / tenancy
- resilient AI calls
- workflow lifecycle
- escalation persistence
- auditability
- admin operations
- observability
- deployment discipline

Cliniverse should contribute back patterns for:
- event/state orchestration
- evidence enrichment
- vector/context matching
- disagreement/dissent review UX
- timeline / patient journey visualization

## Simplified Cliniverse shell v1

Primary navigation:
1. Home
2. Care Operations
3. Clinical Intelligence
4. Clinical Tools
5. Academy
6. Admin / Settings (role-gated)

The shell must remain simple even if the capability library is deep.

## Brand relationship

Company: NeuraOps
Healthcare vertical: Cliniverse AI
Recommended lockup: Cliniverse AI — Healthcare Intelligence by NeuraOps

Use NeuraOps corporate design language and Edge N identity, while allowing Cliniverse a restrained healthcare accent. Avoid generic AI visuals, sci-fi styling and excessive gradients.

## First operational wedge

Follow-up + Prioritization + Human Escalation.

This wedge must be implemented as a secure human-in-the-loop workflow before broad clinical decision support or production PHI use.
