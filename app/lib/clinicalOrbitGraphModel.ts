// Clinical Orbit node/edge vocabulary — deliberately small and controlled.
// Not an attempt at a complete medical ontology. See
// docs/CLINICAL_ORBIT_V1.md for the product model this supports.

export const CLINICAL_ORBIT_NODE_TYPES = [
  'condition',
  'finding',
  'investigation',
  'treatment',
  'drug',
  'guideline',
  'calculator',
  'content',
  'procedure',
  'anatomy',
] as const
export type ClinicalOrbitNodeType = typeof CLINICAL_ORBIT_NODE_TYPES[number]

export function isClinicalOrbitNodeType(value: string): value is ClinicalOrbitNodeType {
  return (CLINICAL_ORBIT_NODE_TYPES as readonly string[]).includes(value)
}

export const CLINICAL_ORBIT_RELATIONS = [
  'related_to',
  'demonstrates',
  'diagnosed_by',
  'treated_by',
  'measured_by',
  'supported_by',
  'prerequisite_for',
  'next_learning_step',
  'compares_with',
] as const
export type ClinicalOrbitRelation = typeof CLINICAL_ORBIT_RELATIONS[number]

export function isClinicalOrbitRelation(value: string): value is ClinicalOrbitRelation {
  return (CLINICAL_ORBIT_RELATIONS as readonly string[]).includes(value)
}

// Only 'demonstrates' is the inverse the seed actually uses in the direction
// "content demonstrates condition" vs. the more natural authoring direction
// "condition demonstrated_by content". The seed always authors edges as
// condition -> content for readability; the query layer can present either
// direction to the UI. There is no separate 'demonstrated_by' relation type
// — it is the same edge, just described from the other node's point of view.

export type EvidenceStatus = 'reviewed' | 'pending_review' | 'unverified'

/**
 * A graph node. `catalogRef` is present only for `content` nodes — it is
 * how a node stays tied to a real, governed catalog item instead of
 * duplicating content inventory in a second place. Concept nodes
 * (condition/finding/procedure/etc.) have no catalogRef; they represent a
 * clinical idea, not a piece of app content.
 */
export interface ClinicalOrbitNode {
  /** Stable, human-readable key — e.g. 'condition:atrial_fibrillation' or 'content:ecg:case:afib-rvr'. This is the identity the UI, edges, and navigation history all use; it never changes even if the underlying DB row id does. */
  nodeKey: string
  nodeType: ClinicalOrbitNodeType
  label: string
  normalizedCode?: string | null
  catalogRef?: { module: string; contentType: string; sourceKey: string } | null
  metadata?: Record<string, unknown>
}

export interface ClinicalOrbitEdge {
  sourceNodeKey: string
  targetNodeKey: string
  relation: ClinicalOrbitRelation
  /** Human-readable source of the claim — a repo file, a catalog provenance_ref, or a named clinical guideline. Required; this is what "Why connected?" shows. */
  provenanceRef: string
  evidenceStatus: EvidenceStatus
  /** Only set when it reflects a governed source's own stated confidence (e.g. a guideline's strength-of-recommendation grade) — never a fabricated model score. */
  confidence?: number | null
}
