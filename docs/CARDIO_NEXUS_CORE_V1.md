# Cardio Nexus Core v1

## Decision

Cardio Nexus Core is the product nucleus. Supabase is a replaceable infrastructure layer. The durable product assets are the versioned journey definitions, transition rules, event ledger, reference mappings, KPI definitions, and integration contracts.

## Runtime model

The first runtime is a deterministic TypeScript domain engine. It operates on fictional data and has no network or model dependency.

The engine provides:

- a case aggregate that begins with a Referral Case ID before MRN;
- an explicit state machine for the QAPAS-DIRECT journey;
- role-based transition authorization;
- mandatory identifiers at MRN, encounter, and Cath episode boundaries;
- an append-only event sequence;
- source and reference metadata on every event;
- separate clock events for KPI calculations;
- draft KPI calculations that always require human validation.

The engine rejects:

- events for another case;
- duplicate event IDs;
- sequence gaps;
- invalid timestamps;
- unauthorized roles;
- invalid state transitions;
- transitions missing required identifiers.

## Reference hierarchy

1. Approved local pathway and policy.
2. Applicable Saudi regulation and national standards.
3. International professional guidelines.
4. Interoperability standards.

A reference supports a configured rule. It does not grant the software clinical authority. The registry stores publisher, version, effective date, jurisdiction, source URL, review status, and scope. Local governance must approve applicable versions and resolve conflicts.

## AI boundary

AI may summarize source-linked events, detect missing fields, identify timestamp conflicts, and draft an operational delay explanation.

AI cannot append a consequential transition, accept or redirect a referral, interpret an ECG, recommend treatment, merge identities, validate a KPI, or submit a report.

## Database contract

`supabase/drafts/cardio_nexus_core_contract.sql` defines a private `cardio_nexus` schema for review. It contains cases, identifiers, references, events, KPI definitions, and KPI results.

The contract is fail-closed:

- it grants no access to `public`, `anon`, or `authenticated`;
- it enables RLS on every table without permissive policies;
- it indexes foreign keys and common access paths;
- it blocks updates and deletes on the event ledger;
- it ends with `rollback`;
- it is outside `supabase/migrations` and cannot deploy through the current migration path.

No production database change is authorized by this document.

## Promotion gates

Before converting the contract into a migration:

1. Confirm the tenant and facility ownership model.
2. Approve the minimum patient data set and retention schedule.
3. Approve the local clinical workflow and reference versions.
4. Complete privacy, security, clinical safety, and integration reviews.
5. Define server-side authorization and RLS policies.
6. Test with synthetic data in an isolated Supabase branch or local stack.
7. Run database advisors and two-user isolation tests.
