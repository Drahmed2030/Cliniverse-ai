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

export const MEDICAL_OPERATIONS_REGISTRY: readonly MedicalOperationsSource[] = [
  {
    id: 'who-smart-dak',
    title: 'SMART Guidelines and Digital Adaptation Kits',
    publisher: 'World Health Organization',
    versionLabel: 'Living programme · reviewed 2026-09-03',
    region: 'global',
    use: 'digital-guideline',
    status: 'verified-source',
    sourceUrl: 'https://www.who.int/teams/sexual-and-reproductive-health-and-research-%28srh%29/areas-of-work/digital-innovations/smart-guidelines-and-digital-adaptation-kits',
    linkedPathways: ['future-pathway-template'],
    operationalRole: 'Defines a software-neutral pattern for translating narrative guidance into structured digital workflows.',
    reviewBoundary: 'No WHO recommendation is executable until a pathway-specific clinical review approves its localized rule set.',
  },
  {
    id: 'hl7-fhir-r5',
    title: 'FHIR R5 Specification',
    publisher: 'HL7 International',
    versionLabel: 'v5.0.0 · current published version',
    region: 'global',
    use: 'interoperability',
    status: 'verified-source',
    sourceUrl: 'https://hl7.org/fhir/',
    linkedPathways: ['future-interoperability-mapping'],
    operationalRole: 'Provides the future exchange vocabulary for traceable events, observations, tasks, and provenance.',
    reviewBoundary: 'The prototype contains no EHR connection and does not claim conformance to a FHIR implementation guide.',
  },
  {
    id: 'sha-ccs-2026',
    title: '2026 Focused Update on Chronic Coronary Syndromes',
    publisher: 'Saudi Heart Association',
    versionLabel: 'Accepted 2026-07-08 · available 2026-08-18',
    region: 'gulf',
    use: 'clinical-guideline',
    status: 'human-review-required',
    sourceUrl: 'https://doi.org/10.37616/2212-5043.1516',
    linkedPathways: ['future-ccs-pathway'],
    operationalRole: 'Supplies regionally contextual evidence for a future governed CCS pathway module.',
    reviewBoundary: 'The focused update complements the 2022 guideline; recommendations require cardiology-panel review before digitization.',
  },
  {
    id: 'eu-ehds-2025',
    title: 'European Health Data Space Regulation',
    publisher: 'European Union',
    versionLabel: 'Regulation (EU) 2025/327 · in force 2025-03-26',
    region: 'europe',
    use: 'governance',
    status: 'verified-source',
    sourceUrl: 'https://eur-lex.europa.eu/eli/reg/2025/327/oj/eng',
    linkedPathways: ['future-eu-data-readiness'],
    operationalRole: 'Frames future European interoperability, patient access, and health-data governance readiness.',
    reviewBoundary: 'Regulatory readiness is a design target, not a legal compliance certification.',
  },
] as const

export function summarizeEvidenceRegistry(sources = MEDICAL_OPERATIONS_REGISTRY) {
  return {
    sources: sources.length,
    regions: new Set(sources.map(source => source.region)).size,
    uses: new Set(sources.map(source => source.use)).size,
    linkedPathways: new Set(sources.flatMap(source => source.linkedPathways)).size,
    humanReviewItems: sources.filter(source => source.status === 'human-review-required').length,
  }
}

