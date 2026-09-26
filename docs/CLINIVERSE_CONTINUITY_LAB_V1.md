# Cliniverse Continuity Lab v1

Status: FOUNDATION / INTERNAL ONLY

## Product intent

Continuity Lab extends the Cliniverse learning loop from a static question-and-answer experience into a longitudinal reasoning exercise:

`Observe → Interpret → Decide → Change → Reconcile → Communicate → Close → Remember`

The commercial goal is to train how clinicians respond when evidence evolves, not only whether they can identify a diagnosis at one moment in time.

## Product boundary

Cliniverse owns:

- learner-facing reasoning flow;
- governed educational ECG and Echo experiences;
- case progression and feedback;
- learner-friendly provenance;
- handover and communication drills;
- adaptive review;
- institutional learning assignments and completion evidence.

Cliniverse does not become the hospital system of record.

## Institution-ready architecture

Institution mode is configuration-driven and disabled by default.

A future institution supplies:

- organization identifier;
- cohort identifier;
- assignment source;
- approved Cliniverse collection identifier;
- completion receipt mode;
- optional institution display branding.

The foundation does not store shared hospital credentials and does not assume a hospital connection.

The existing `resident-onboarding` institutional collection remains a suitable first configuration target.

## Health Cloud boundary

Live institutional diagnostic context is deferred to NeuraOps Health Cloud.

Health Cloud owns the future institution connection for:

- Labs;
- live Echo/report context;
- source-study access context.

Cliniverse receives only an explicit learning capability contract after the institution is configured.

The Cliniverse foundation contains:

- no live PHI;
- no direct hospital API endpoint;
- no hospital token or shared credentials;
- no PACS/EHR replacement claim;
- no diagnostic authority.

Source systems remain authoritative for original clinical records and diagnostic media.

## Initial vertical slice

The first Continuity Lab scenario should be built only when learner-ready evidence is available:

1. governed ECG signal;
2. learner interpretation;
3. committed decision;
4. new or corrected evidence;
5. reconciliation prompt;
6. handover/communication task;
7. closure explanation;
8. adaptive review event.

A live institutional Echo or Lab result must not be simulated as connected. Until Health Cloud configuration exists, the corresponding access state is explicitly deferred or unavailable.

## Commercial packaging

### Cliniverse PRO

- ECG and Echo learning
- Cases
- Continuity Lab
- adaptive review

### Cliniverse for Institutions

- cohort assignments
- approved collections
- configurable institution identity
- completion evidence
- institution-specific configuration without product fork

### Health Cloud Connected

Optional enterprise connectivity for live institutional diagnostic context. It is a separate integration layer, not a prerequisite for individual Cliniverse learning.

## Release rule

This foundation is not learner-exposed by default and must not alter the current Apple release flow.

Promotion requires:

- approved learner-ready evidence;
- product review;
- regression coverage;
- explicit release authorization.
