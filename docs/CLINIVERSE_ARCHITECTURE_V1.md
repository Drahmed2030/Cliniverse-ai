# Cliniverse AI — Target Architecture v1

## Executive principle
Cliniverse AI is not a separate infrastructure company. It is the healthcare vertical of NeuraOps.

## Target layers

### NeuraOps shared platform layer
- Identity and authentication
- Role/tenant authorization
- Workflow state machine
- Human escalation lifecycle
- AI gateway and resilience
- Audit log and operations tooling
- Observability and controlled fallbacks

### Cliniverse healthcare domain layer
- Patient/follow-up context
- Clinical event model
- Prioritization rules and signals
- Evidence enrichment
- Clinical timeline / patient journey
- Human escalation context
- Clinical tools and simulation modules

### External integration layer
- FHIR/EHR adapters
- PubMed/FDA/RxNorm/WHO evidence adapters
- Approved AI providers
- Messaging/notification adapters when required

## First workflow

1. Follow-up item enters workflow.
2. Context is normalized and scoped.
3. Rules/AI identify unresolved, overdue, abnormal or high-attention signals.
4. Evidence/context is attached where useful.
5. System assigns a priority state.
6. Uncertain/high-risk states are escalated to a human.
7. Human reviews, acts, resolves or reassigns.
8. State transition and audit event are persisted.

## Safety boundaries
- No autonomous diagnosis.
- No autonomous prescribing.
- No claim of validated clinical confidence from model self-confidence.
- No production PHI until auth, authorization, tenancy, audit, retention, vendor/privacy and regulatory requirements are explicitly satisfied.
- Human review is mandatory for clinically consequential escalations.

## UI shell

### Home
- attention-needed summary
- follow-ups due
- open escalations
- recent activity

### Care Operations
- follow-up queue
- prioritization view
- escalation queue
- patient/workflow timeline

### Clinical Intelligence
- evidence panel
- Oracle/context assistant
- similar case/context retrieval
- uncertainty/disagreement review

### Clinical Tools
- calculators
- medication tools
- FHIR utilities
- other preserved point tools

### Academy
- simulation
- generated cases
- exams / MCQs
- resuscitation modules

## Migration strategy

Do not mass-rewrite the current application.

Use strangler-style consolidation:
1. introduce shared tokens and shell;
2. route existing capabilities into the simplified information architecture;
3. harden security and shared infrastructure;
4. migrate one operational workflow at a time;
5. archive obsolete duplicates only after canonical equivalents are verified.
