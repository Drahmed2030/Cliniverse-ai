// fhirMappingBoundary — Batch 10 Section 11. DOCUMENTATION ONLY. No FHIR
// server, no FHIR resource construction, no FHIR client anywhere in this
// batch. Internal domain objects (operationalCore.ts) are deliberately
// version-neutral — this file records the FUTURE mapping intent so a real
// FHIR R4/R5 boundary can be added later without redesigning the internal
// model, but it emits nothing at runtime beyond this static table.

export type FhirVersionTarget = 'R4' | 'R5'

export interface FhirMappingIntent {
  internalType: string
  fhirResourceType: string
  targets: readonly FhirVersionTarget[]
  notes: string
}

export const FHIR_MAPPING_BOUNDARY: readonly FhirMappingIntent[] = [
  { internalType: 'OperationalEncounter', fhirResourceType: 'Encounter', targets: ['R4', 'R5'], notes: 'encounterId -> Encounter.identifier; status -> Encounter.status (mapping not yet defined); no PHI fields exist to map.' },
  { internalType: 'ClinicalWorkItem', fhirResourceType: 'Task', targets: ['R4', 'R5'], notes: 'Preferred over ServiceRequest for most kinds since a ClinicalWorkItem tracks operational acknowledgement, not an order — see ServiceRequest note below.' },
  { internalType: "ClinicalWorkItem (kind: 'investigation' | 'referral')", fhirResourceType: 'ServiceRequest', targets: ['R4', 'R5'], notes: 'Only if a future batch decides these specific kinds represent an actual request, never an order Cliniverse itself places or transmits (see Section 21).' },
  { internalType: 'ClinicalWorkItem (kind: result_review, once resolved)', fhirResourceType: 'Observation', targets: ['R4', 'R5'], notes: 'A result_review work item resolving is NOT itself an Observation — this row documents that a future integration would read an externally-sourced Observation, never fabricate one.' },
  { internalType: 'ProcedureState', fhirResourceType: 'Procedure', targets: ['R4', 'R5'], notes: 'checklist/readiness stay internal; only a completed, externally-verified procedure would ever map outward.' },
  { internalType: 'OperationalEvent', fhirResourceType: 'Provenance', targets: ['R4', 'R5'], notes: 'evidence.referenceIds/sourceRef already mirror Provenance.entity/agent shape conceptually (see HL7-FHIR-R5-PROVENANCE in nexusReferences.ts).' },
  { internalType: 'OperationalEvent', fhirResourceType: 'AuditEvent', targets: ['R4', 'R5'], notes: 'actorRole/actorId/occurredAt/recordedAt already mirror AuditEvent.agent/recorded shape conceptually.' },
]

/** Guard used by tests: this batch introduces no FHIR resource construction — every mapping stays a documented intent, not code. */
export function isDocumentationOnlyBoundary(): true {
  return true
}
