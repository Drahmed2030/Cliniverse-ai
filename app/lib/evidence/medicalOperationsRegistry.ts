import { getNexusReference } from '../cardiology/nexusReferences.ts'

export type EvidenceRegion = 'global' | 'gulf' | 'europe'
export type EvidenceUse = 'interoperability' | 'digital-guideline' | 'clinical-guideline' | 'governance'
export type EvidenceStatus = 'verified-source' | 'human-review-required'

export interface MedicalOperationsSource {
  id: string
  title: string
  publisher: string
  versionLabel: string
  region: EvidenceRegion
  use: EvidenceUse
  status: EvidenceStatus
  sourceUrl: string
  linkedPathways: readonly string[]
  operationalRole: string
  reviewBoundary: string
}

interface EvidenceProjection {
  canonicalId: string
  region: EvidenceRegion
  use: EvidenceUse
}

/**
 * NeuraOps portfolio presentation. Source facts remain owned by the canonical
 * Cardio/Nexus Medical Operations Registry and are resolved by immutable ID.
 */
const NEURAOPS_EVIDENCE_PROJECTION: readonly EvidenceProjection[] = [
  {
    canonicalId: 'WHO-SMART-DAK-REVIEW-2026-09-03',
    region: 'global',
    use: 'digital-guideline',
  },
  {
    canonicalId: 'HL7-FHIR-R5-SPECIFICATION',
    region: 'global',
    use: 'interoperability',
  },
  {
    canonicalId: 'SHA-CCS-FOCUSED-UPDATE-2026',
    region: 'gulf',
    use: 'clinical-guideline',
  },
  {
    canonicalId: 'EU-EHDS-REGULATION-2025-327',
    region: 'europe',
    use: 'governance',
  },
] as const

export const MEDICAL_OPERATIONS_REGISTRY: readonly MedicalOperationsSource[] = NEURAOPS_EVIDENCE_PROJECTION.map(
  projection => {
    const source = getNexusReference(projection.canonicalId)

    if (!source || source.sourceAccess !== 'public-primary-url' || source.sourceUrl === null) {
      throw new Error(`NeuraOps evidence projection cannot resolve public source ${projection.canonicalId}.`)
    }

    return {
      id: source.id,
      title: source.title,
      publisher: source.publisher,
      versionLabel: source.version,
      region: projection.region,
      use: projection.use,
      status: source.reviewStatus === 'requires-local-review'
        ? 'human-review-required'
        : 'verified-source',
      sourceUrl: source.sourceUrl,
      linkedPathways: source.linkedPathwayIds,
      operationalRole: source.intendedUse,
      reviewBoundary: source.scope,
    }
  },
)

export function summarizeEvidenceRegistry(sources = MEDICAL_OPERATIONS_REGISTRY) {
  return {
    sources: sources.length,
    regions: new Set(sources.map(source => source.region)).size,
    uses: new Set(sources.map(source => source.use)).size,
    linkedPathways: new Set(sources.flatMap(source => source.linkedPathways)).size,
    humanReviewItems: sources.filter(source => source.status === 'human-review-required').length,
  }
}
