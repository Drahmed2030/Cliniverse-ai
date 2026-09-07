# QAPAS-DIRECT Journey Simulator v1

## Purpose

This internal Cliniverse AI / Cardio Nexus slice makes the proposed regional STEMI coordination model visible and testable before any integration or production build. It follows one entirely fictional referral from the referring facility to KPI review.

## What the simulator demonstrates

- A referral begins with a `Referral Case ID`, before an MRN exists.
- Authorized staff later link `Referral Case ID → MRN → Encounter → Cath Episode` without losing the original event history.
- Each pathway step has one accountable owner, supporting roles, an operational output, an AI assistance boundary, and a mandatory human gate.
- The same journey can be viewed as the referring team, Medical Coordination, accepting Cardiology, Cath Lab, or Quality.
- KPI baseline cards show where an event may support AHACAD2, AHACAD8, or AHACAD9 measurement.

## Eight-step workflow

1. Referral received
2. Clinical review
3. Human acceptance
4. MRN coordination
5. Transport in progress
6. Cath Lab activation
7. Arrival and encounter activation
8. Procedure milestone and KPI review

## Nexus AI role

The simulated Nexus layer can check operational completeness, summarize source-linked information, flag conflicting timestamps, surface readiness dependencies, and suggest an evidence-backed operational delay category for human review.

It cannot diagnose, interpret ECGs, accept or redirect a referral, activate the Cath Lab, recommend treatment, merge patient identities, or submit KPI reports. Every consequential action remains with an authorized human and the approved system of record.

## Data and integration boundary

- All identifiers, events, and timestamps in this slice are fictional.
- No Supabase, API, model, hospital system, messaging service, or external network call is used.
- No real patient data may be entered.
- Existing systems such as Ehalati, STEMI Code workflows, HIS, registration, and Cath Lab systems remain the systems of record. Cardio Nexus is proposed as the orchestration and audit layer between them.

## KPI references

The prototype displays supplied Q2 2026 audit baselines as context only:

- AHACAD2 First hospital to PCI `<120 min`: 72%
- AHACAD8 First medical contact to PCI: 89%
- AHACAD9 Primary PCI `<90 min`: 90%

These values are not a prediction or claim of improvement. A governed pilot must validate KPI definitions, exclusions, clock sources, event provenance, and measured impact.
