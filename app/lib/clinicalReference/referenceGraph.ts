// ReferenceRelation — Batch 8 Section 9. A typed relation layer connecting
// drug -> label -> renal-dose rule -> interaction -> calculator ->
// condition -> evidence. Deliberately separate from Clinical Orbit's own
// graph (app/lib/clinicalOrbitGraphSeed.ts) — this is the fine-grained
// reference-domain relation layer that FEEDS a small, curated subset of
// high-quality links into Clinical Orbit (see the Batch 8 Clinical Orbit
// diff), not a duplicate of it. No relationship here exists without a
// provenanceRef — see validateReferenceRelations.

export type ReferenceEntityType = 'drug' | 'label' | 'renal_dose_rule' | 'interaction_rule' | 'calculator' | 'condition' | 'evidence_source'

export type ReferenceRelationType =
  | 'has_label'
  | 'has_renal_rule'
  | 'interacts_with'
  | 'measured_by'
  | 'supported_by'
  | 'related_to'

export interface ReferenceRelation {
  relationId: string
  sourceType: ReferenceEntityType
  sourceKey: string
  relation: ReferenceRelationType
  targetType: ReferenceEntityType
  targetKey: string
  provenanceRef: string
}

// Keys use "type:identifier" — e.g. "drug:rxcui:235743", "calculator:cha2ds2_va",
// "condition:atrial_fibrillation" (matching Clinical Orbit's own condition
// node keys so the two layers can be cross-referenced by a future batch
// without inventing a second naming scheme).
export const REFERENCE_RELATIONS: readonly ReferenceRelation[] = [
  {
    relationId: 'af-measured-by-cha2ds2-va',
    sourceType: 'condition', sourceKey: 'condition:atrial_fibrillation',
    relation: 'measured_by',
    targetType: 'calculator', targetKey: 'calculator:cha2ds2_va',
    provenanceRef: 'app/lib/clinicalReference/calculatorRegistry.ts (cha2ds2_va) — 2024 ESC AF guideline positioning',
  },
  {
    relationId: 'af-measured-by-cha2ds2-vasc',
    sourceType: 'condition', sourceKey: 'condition:atrial_fibrillation',
    relation: 'measured_by',
    targetType: 'calculator', targetKey: 'calculator:cha2ds2_vasc',
    provenanceRef: 'app/lib/clinicalReference/calculatorRegistry.ts (cha2ds2_vasc)',
  },
  {
    relationId: 'metformin-has-renal-rule',
    sourceType: 'drug', sourceKey: 'drug:rxcui:235743',
    relation: 'has_renal_rule',
    targetType: 'renal_dose_rule', targetKey: 'renal_dose_rule:235743',
    provenanceRef: 'app/lib/clinicalReference/renalDosingRules.ts (metformin)',
  },
  {
    relationId: 'metformin-has-label',
    sourceType: 'drug', sourceKey: 'drug:rxcui:235743',
    relation: 'has_label',
    targetType: 'label', targetKey: 'label:seed-metformin-v1',
    provenanceRef: 'app/lib/clinicalReference/drugLabelEvidence.ts (GOVERNED_SEED_LABEL_EVIDENCE, metformin)',
  },
  {
    relationId: 'warfarin-has-label',
    sourceType: 'drug', sourceKey: 'drug:rxcui:11289',
    relation: 'has_label',
    targetType: 'label', targetKey: 'label:seed-warfarin-v1',
    provenanceRef: 'app/lib/clinicalReference/drugLabelEvidence.ts (GOVERNED_SEED_LABEL_EVIDENCE, warfarin)',
  },
  {
    relationId: 'warfarin-interacts-aspirin',
    sourceType: 'drug', sourceKey: 'drug:rxcui:11289',
    relation: 'interacts_with',
    targetType: 'drug', targetKey: 'drug:rxcui:1191',
    provenanceRef: 'app/lib/clinicalReference/drugInteractionRules.ts (warfarin-aspirin-v1)',
  },
  {
    relationId: 'warfarin-aspirin-supported-by-seed',
    sourceType: 'interaction_rule', sourceKey: 'interaction_rule:warfarin-aspirin-v1',
    relation: 'supported_by',
    targetType: 'evidence_source', targetKey: 'evidence_source:clinical-strip-seed-v1',
    provenanceRef: 'app/components/ClinicalStrip.tsx (pre-existing seed, restructured for Batch 8)',
  },
] as const

export function validateReferenceRelations(relations: readonly ReferenceRelation[] = REFERENCE_RELATIONS): void {
  const ids = new Set<string>()
  for (const relation of relations) {
    if (!relation.relationId.trim() || !relation.sourceKey.trim() || !relation.targetKey.trim()) {
      throw new Error('Reference relation identity and both endpoints are required.')
    }
    if (!relation.provenanceRef.trim()) {
      throw new Error(`Reference relation ${relation.relationId} has no provenanceRef.`)
    }
    if (ids.has(relation.relationId)) throw new Error(`Duplicate relationId: ${relation.relationId}`)
    ids.add(relation.relationId)
  }
}

export function findReferenceRelationsFrom(sourceKey: string, relations: readonly ReferenceRelation[] = REFERENCE_RELATIONS): ReferenceRelation[] {
  return relations.filter(relation => relation.sourceKey === sourceKey)
}
