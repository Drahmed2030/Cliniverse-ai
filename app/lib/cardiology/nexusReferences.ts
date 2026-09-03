export const MEDICAL_OPERATIONS_REGISTRY_SCHEMA_VERSION = 1 as const

export type NexusReferenceAuthority =
  | 'internal-demonstration'
  | 'local-approved'
  | 'national-regulatory'
  | 'supranational-regulatory'
  | 'international-guideline'
  | 'professional-guideline'
  | 'interoperability-standard'

export type NexusReferenceReviewStatus =
  | 'reviewed-synthetic-only'
  | 'verified-public-reference'
  | 'requires-local-review'

export type NexusReferenceLifecycleState = 'active' | 'superseded' | 'expired'

export type NexusReferenceRightsStatus =
  | 'owned-internal'
  | 'internal-use-review-required'
  | 'link-only-review-required'

export type NexusReferenceRuleUse =
  | 'reference-only'
  | 'synthetic-demonstration-only'
  | 'clinical-rule'

export interface NexusReference {
  schemaVersion: typeof MEDICAL_OPERATIONS_REGISTRY_SCHEMA_VERSION
  /** Immutable revision identifier. Rules must reference this ID, never a family ID. */
  id: string
  /** Stable identifier shared by future revisions of the same source. */
  familyId: string
  title: string
  publisher: string
  authority: NexusReferenceAuthority
  version: string
  effectiveDate: string | null
  jurisdiction: string
  sourceUrl: string | null
  sourceAccess: 'public-primary-url' | 'controlled-internal-copy'
  reviewStatus: NexusReferenceReviewStatus
  reviewedAt: string | null
  reviewedBy: string | null
  intendedUse: string
  linkedPathwayIds: readonly string[]
  scope: string
  lifecycle: {
    state: NexusReferenceLifecycleState
    expiresAt: string | null
    supersedesId: string | null
    supersededById: string | null
  }
  rights: {
    status: NexusReferenceRightsStatus
    attributionRequired: boolean
    attribution: string
  }
  ruleAuthority: {
    use: NexusReferenceRuleUse
    clinicalApproval: 'not-approved' | 'approved'
    approvedBy: string | null
    approvedAt: string | null
    approvedJurisdiction: string | null
  }
}

export interface MedicalOperationsSourceSnapshot {
  schemaVersion: typeof MEDICAL_OPERATIONS_REGISTRY_SCHEMA_VERSION
  id: string
  familyId: string
  title: string
  publisher: string
  authority: NexusReferenceAuthority
  version: string
  effectiveDate: string | null
  jurisdiction: string
  sourceUrl: string | null
  sourceAccess: NexusReference['sourceAccess']
  reviewStatus: NexusReferenceReviewStatus
  reviewedAt: string | null
  reviewedBy: string | null
  intendedUse: string
  linkedPathwayIds: string[]
  scope: string
  lifecycle: NexusReference['lifecycle']
  rights: NexusReference['rights']
  ruleAuthority: NexusReference['ruleAuthority']
}

export interface MedicalOperationsRegistrySnapshot {
  schemaVersion: typeof MEDICAL_OPERATIONS_REGISTRY_SCHEMA_VERSION
  /** Deterministic identity composed only from explicitly referenced immutable revisions. */
  snapshotId: string
  sourceIds: string[]
  sources: MedicalOperationsSourceSnapshot[]
  ruleMode: 'synthetic-demonstration-only'
  clinicalExecution: {
    state: 'blocked'
    reasons: string[]
  }
}

export const NEXUS_REFERENCE_REGISTRY: readonly NexusReference[] = [
  {
    schemaVersion: 1,
    id: 'DEMO-PATHWAY-RULESET-V1',
    familyId: 'DEMO-PATHWAY-RULESET',
    title: 'Cliniverse synthetic pathway demonstration ruleset',
    publisher: 'NeuraOps / Cliniverse AI',
    authority: 'internal-demonstration',
    version: '1.0-demo',
    effectiveDate: '2026-09-03',
    jurisdiction: 'Global demonstration; not locally adopted',
    sourceUrl: null,
    sourceAccess: 'controlled-internal-copy',
    reviewStatus: 'reviewed-synthetic-only',
    reviewedAt: '2026-09-03',
    reviewedBy: 'Project governance review',
    intendedUse: 'Deterministic fictional pathway replay and training demonstration only.',
    linkedPathwayIds: ['stemi-pathway-replay-demo'],
    scope: 'Defines the fictional Door-to-ECG threshold used by the isolated strategy prototype.',
    lifecycle: { state: 'active', expiresAt: null, supersedesId: null, supersededById: null },
    rights: {
      status: 'owned-internal',
      attributionRequired: true,
      attribution: 'NeuraOps / Cliniverse AI synthetic demonstration ruleset.',
    },
    ruleAuthority: {
      use: 'synthetic-demonstration-only',
      clinicalApproval: 'not-approved',
      approvedBy: null,
      approvedAt: null,
      approvedJurisdiction: null,
    },
  },
  {
    schemaVersion: 1,
    id: 'QAPAS-DIRECT-LOCAL',
    familyId: 'QAPAS-DIRECT-LOCAL',
    title: 'QAPAS-DIRECT local STEMI pathway',
    publisher: 'Prince Sultan Cardiac Center Qassim / Qassim Health Cluster',
    authority: 'local-approved',
    version: 'Provided internal pathway; version not verified',
    effectiveDate: null,
    jurisdiction: 'Qassim, Saudi Arabia',
    sourceUrl: null,
    sourceAccess: 'controlled-internal-copy',
    reviewStatus: 'requires-local-review',
    reviewedAt: null,
    reviewedBy: null,
    intendedUse: 'Reference mapping for a future locally governed operational pathway.',
    linkedPathwayIds: ['qapas-direct-simulation'],
    scope: 'Operational referral, acceptance, transfer, and Cath Lab workflow.',
    lifecycle: { state: 'active', expiresAt: null, supersedesId: null, supersededById: null },
    rights: {
      status: 'internal-use-review-required',
      attributionRequired: true,
      attribution: 'Prince Sultan Cardiac Center Qassim / Qassim Health Cluster.',
    },
    ruleAuthority: {
      use: 'reference-only',
      clinicalApproval: 'not-approved',
      approvedBy: null,
      approvedAt: null,
      approvedJurisdiction: null,
    },
  },
  {
    schemaVersion: 1,
    id: 'AHA-KPI-LOCAL-AUDIT',
    familyId: 'AHA-KPI-LOCAL-AUDIT',
    title: 'AHA KPI compliance percentage',
    publisher: 'Provided local audit',
    authority: 'local-approved',
    version: 'Q2 2026',
    effectiveDate: '2026-06-30',
    jurisdiction: 'Local pilot context',
    sourceUrl: null,
    sourceAccess: 'controlled-internal-copy',
    reviewStatus: 'requires-local-review',
    reviewedAt: null,
    reviewedBy: null,
    intendedUse: 'Contextual prototype baseline; not an official KPI submission or predicted result.',
    linkedPathwayIds: ['qapas-direct-simulation'],
    scope: 'Prototype baselines for AHACAD2, AHACAD8, and AHACAD9.',
    lifecycle: { state: 'active', expiresAt: null, supersedesId: null, supersededById: null },
    rights: {
      status: 'internal-use-review-required',
      attributionRequired: true,
      attribution: 'Provided local audit; reuse requires owner and rights confirmation.',
    },
    ruleAuthority: {
      use: 'reference-only',
      clinicalApproval: 'not-approved',
      approvedBy: null,
      approvedAt: null,
      approvedJurisdiction: null,
    },
  },
  {
    schemaVersion: 1,
    id: 'AHA-MISSION-LIFELINE',
    familyId: 'AHA-MISSION-LIFELINE',
    title: 'Mission: Lifeline EMS',
    publisher: 'American Heart Association',
    authority: 'professional-guideline',
    version: 'Public program page; exact measure set not adopted',
    effectiveDate: null,
    jurisdiction: 'United States program; international reference only',
    sourceUrl: 'https://www.heart.org/en/professional/quality-improvement/mission-lifeline',
    sourceAccess: 'public-primary-url',
    reviewStatus: 'verified-public-reference',
    reviewedAt: '2026-09-03',
    reviewedBy: 'Repository source verification',
    intendedUse: 'Background reference for systems-of-care and quality-improvement concepts.',
    linkedPathwayIds: ['qapas-direct-simulation'],
    scope: 'Systems of care, performance measurement, gap identification, and quality improvement.',
    lifecycle: { state: 'active', expiresAt: null, supersedesId: null, supersededById: null },
    rights: {
      status: 'link-only-review-required',
      attributionRequired: true,
      attribution: 'American Heart Association, Mission: Lifeline EMS.',
    },
    ruleAuthority: {
      use: 'reference-only',
      clinicalApproval: 'not-approved',
      approvedBy: null,
      approvedAt: null,
      approvedJurisdiction: null,
    },
  },
  {
    schemaVersion: 1,
    id: 'ESC-ACS-2023',
    familyId: 'ESC-ACS',
    title: '2023 ESC Guidelines for the management of acute coronary syndromes',
    publisher: 'European Society of Cardiology',
    authority: 'international-guideline',
    version: '2023',
    effectiveDate: '2023-08-25',
    jurisdiction: 'International reference; local applicability not approved',
    sourceUrl: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Acute-Coronary-Syndromes-ACS',
    sourceAccess: 'public-primary-url',
    reviewStatus: 'verified-public-reference',
    reviewedAt: null,
    reviewedBy: null,
    intendedUse: 'Background guideline reference pending version, rights, and local clinical review.',
    linkedPathwayIds: ['future-acs-content'],
    scope: 'Clinical guideline reference. It does not grant Nexus clinical authority.',
    lifecycle: { state: 'active', expiresAt: null, supersedesId: null, supersededById: null },
    rights: {
      status: 'link-only-review-required',
      attributionRequired: true,
      attribution: 'European Society of Cardiology, 2023 ACS Guidelines.',
    },
    ruleAuthority: {
      use: 'reference-only',
      clinicalApproval: 'not-approved',
      approvedBy: null,
      approvedAt: null,
      approvedJurisdiction: null,
    },
  },
  {
    schemaVersion: 1,
    id: 'WHO-SMART-DAK-REVIEW-2026-09-03',
    familyId: 'WHO-SMART-DAK',
    title: 'SMART Guidelines and Digital Adaptation Kits',
    publisher: 'World Health Organization',
    authority: 'international-guideline',
    version: 'Living programme · source reviewed 2026-09-03',
    effectiveDate: null,
    jurisdiction: 'Global reference; pathway localization not approved',
    sourceUrl: 'https://www.who.int/teams/sexual-and-reproductive-health-and-research-%28srh%29/areas-of-work/digital-innovations/smart-guidelines-and-digital-adaptation-kits',
    sourceAccess: 'public-primary-url',
    reviewStatus: 'verified-public-reference',
    reviewedAt: '2026-09-03',
    reviewedBy: 'Repository source verification',
    intendedUse: 'Software-neutral pattern for translating narrative guidance into structured digital workflows.',
    linkedPathwayIds: ['future-pathway-template'],
    scope: 'No WHO recommendation is executable until a pathway-specific clinical review approves its localized rule set.',
    lifecycle: { state: 'active', expiresAt: null, supersedesId: null, supersededById: null },
    rights: {
      status: 'link-only-review-required',
      attributionRequired: true,
      attribution: 'World Health Organization, SMART Guidelines and Digital Adaptation Kits.',
    },
    ruleAuthority: {
      use: 'reference-only',
      clinicalApproval: 'not-approved',
      approvedBy: null,
      approvedAt: null,
      approvedJurisdiction: null,
    },
  },
  {
    schemaVersion: 1,
    id: 'HL7-FHIR-R5-SPECIFICATION',
    familyId: 'HL7-FHIR-SPECIFICATION',
    title: 'FHIR R5 Specification',
    publisher: 'HL7 International',
    authority: 'interoperability-standard',
    version: 'v5.0.0 (R5) · current published version at 2026-09-03',
    effectiveDate: '2023-03-26',
    jurisdiction: 'International standard; no conformance claim',
    sourceUrl: 'https://hl7.org/fhir/',
    sourceAccess: 'public-primary-url',
    reviewStatus: 'verified-public-reference',
    reviewedAt: '2026-09-03',
    reviewedBy: 'Repository source verification',
    intendedUse: 'Future exchange vocabulary for traceable events, observations, tasks, and provenance.',
    linkedPathwayIds: ['future-interoperability-mapping'],
    scope: 'The prototype contains no EHR connection and does not claim conformance to a FHIR implementation guide.',
    lifecycle: { state: 'active', expiresAt: null, supersedesId: null, supersededById: null },
    rights: {
      status: 'link-only-review-required',
      attributionRequired: true,
      attribution: 'HL7 International, FHIR R5 Specification.',
    },
    ruleAuthority: {
      use: 'reference-only',
      clinicalApproval: 'not-approved',
      approvedBy: null,
      approvedAt: null,
      approvedJurisdiction: null,
    },
  },
  {
    schemaVersion: 1,
    id: 'SHA-CCS-FOCUSED-UPDATE-2026',
    familyId: 'SHA-CCS-GUIDELINE',
    title: '2026 Focused Update on Chronic Coronary Syndromes',
    publisher: 'Saudi Heart Association',
    authority: 'professional-guideline',
    version: 'Journal of the Saudi Heart Association 38(3), Article 4 · 2026',
    effectiveDate: '2026-08-18',
    jurisdiction: 'Saudi Arabia; local implementation not approved',
    sourceUrl: 'https://doi.org/10.37616/2212-5043.1516',
    sourceAccess: 'public-primary-url',
    reviewStatus: 'requires-local-review',
    reviewedAt: '2026-09-03',
    reviewedBy: 'Repository source verification; clinical review pending',
    intendedUse: 'Regional evidence input for a future governed chronic coronary syndromes pathway module.',
    linkedPathwayIds: ['future-ccs-pathway'],
    scope: 'The focused update complements the 2022 guideline; cardiology-panel review is required before digitizing recommendations.',
    lifecycle: { state: 'active', expiresAt: null, supersedesId: null, supersededById: null },
    rights: {
      status: 'link-only-review-required',
      attributionRequired: true,
      attribution: 'Saudi Heart Association, 2026 Focused Update on Chronic Coronary Syndromes.',
    },
    ruleAuthority: {
      use: 'reference-only',
      clinicalApproval: 'not-approved',
      approvedBy: null,
      approvedAt: null,
      approvedJurisdiction: null,
    },
  },
  {
    schemaVersion: 1,
    id: 'EU-EHDS-REGULATION-2025-327',
    familyId: 'EU-EHDS-REGULATION',
    title: 'European Health Data Space Regulation',
    publisher: 'European Union',
    authority: 'supranational-regulatory',
    version: 'Regulation (EU) 2025/327 · in force 2025-03-26',
    effectiveDate: '2025-03-26',
    jurisdiction: 'European Union',
    sourceUrl: 'https://eur-lex.europa.eu/eli/reg/2025/327/oj/eng',
    sourceAccess: 'public-primary-url',
    reviewStatus: 'verified-public-reference',
    reviewedAt: '2026-09-03',
    reviewedBy: 'Repository source verification',
    intendedUse: 'Future European interoperability, patient-access, and health-data governance readiness reference.',
    linkedPathwayIds: ['future-eu-data-readiness'],
    scope: 'Regulatory readiness is a design target and not a legal compliance certification.',
    lifecycle: { state: 'active', expiresAt: null, supersedesId: null, supersededById: null },
    rights: {
      status: 'link-only-review-required',
      attributionRequired: true,
      attribution: 'European Union, Regulation (EU) 2025/327 on the European Health Data Space.',
    },
    ruleAuthority: {
      use: 'reference-only',
      clinicalApproval: 'not-approved',
      approvedBy: null,
      approvedAt: null,
      approvedJurisdiction: null,
    },
  },
  {
    schemaVersion: 1,
    id: 'HL7-FHIR-R5-PROVENANCE',
    familyId: 'HL7-FHIR-PROVENANCE',
    title: 'FHIR R5 Provenance',
    publisher: 'HL7 International',
    authority: 'interoperability-standard',
    version: 'R5.0.0',
    effectiveDate: '2023-03-26',
    jurisdiction: 'International standard; no conformance claim',
    sourceUrl: 'https://hl7.org/fhir/R5/provenance.html',
    sourceAccess: 'public-primary-url',
    reviewStatus: 'verified-public-reference',
    reviewedAt: '2026-09-03',
    reviewedBy: 'Repository source verification',
    intendedUse: 'Future provenance vocabulary mapping; not a current FHIR conformance claim.',
    linkedPathwayIds: ['cardio-nexus-core'],
    scope: 'Context and source assertions for created or updated records.',
    lifecycle: { state: 'active', expiresAt: null, supersedesId: null, supersededById: null },
    rights: {
      status: 'link-only-review-required',
      attributionRequired: true,
      attribution: 'HL7 International, FHIR R5 Provenance.',
    },
    ruleAuthority: {
      use: 'reference-only',
      clinicalApproval: 'not-approved',
      approvedBy: null,
      approvedAt: null,
      approvedJurisdiction: null,
    },
  },
  {
    schemaVersion: 1,
    id: 'HL7-FHIR-R5-AUDIT-EVENT',
    familyId: 'HL7-FHIR-AUDIT-EVENT',
    title: 'FHIR R5 AuditEvent',
    publisher: 'HL7 International',
    authority: 'interoperability-standard',
    version: 'R5.0.0',
    effectiveDate: '2023-03-26',
    jurisdiction: 'International standard; no conformance claim',
    sourceUrl: 'https://hl7.org/fhir/R5/auditevent.html',
    sourceAccess: 'public-primary-url',
    reviewStatus: 'verified-public-reference',
    reviewedAt: '2026-09-03',
    reviewedBy: 'Repository source verification',
    intendedUse: 'Future audit vocabulary mapping; not a current FHIR conformance claim.',
    linkedPathwayIds: ['cardio-nexus-core'],
    scope: 'Who, what, where, when, and why for auditable events.',
    lifecycle: { state: 'active', expiresAt: null, supersedesId: null, supersededById: null },
    rights: {
      status: 'link-only-review-required',
      attributionRequired: true,
      attribution: 'HL7 International, FHIR R5 AuditEvent.',
    },
    ruleAuthority: {
      use: 'reference-only',
      clinicalApproval: 'not-approved',
      approvedBy: null,
      approvedAt: null,
      approvedJurisdiction: null,
    },
  },
  {
    schemaVersion: 1,
    id: 'SAUDI-PDPL',
    familyId: 'SAUDI-PDPL',
    title: 'Personal Data Protection Law and Implementing Regulations',
    publisher: 'Saudi Data and AI Authority',
    authority: 'national-regulatory',
    version: 'Official publication; legal version verification required before reliance',
    effectiveDate: null,
    jurisdiction: 'Saudi Arabia',
    sourceUrl: 'https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/PoliciesAndRegulations/',
    sourceAccess: 'public-primary-url',
    reviewStatus: 'verified-public-reference',
    reviewedAt: '2026-09-03',
    reviewedBy: 'Repository source verification',
    intendedUse: 'Privacy governance reference; legal counsel and current-text verification required.',
    linkedPathwayIds: ['shared-governance'],
    scope: 'Personal data processing obligations and data subject rights.',
    lifecycle: { state: 'active', expiresAt: null, supersedesId: null, supersededById: null },
    rights: {
      status: 'link-only-review-required',
      attributionRequired: true,
      attribution: 'Saudi Data and AI Authority, Personal Data Protection Law resources.',
    },
    ruleAuthority: {
      use: 'reference-only',
      clinicalApproval: 'not-approved',
      approvedBy: null,
      approvedAt: null,
      approvedJurisdiction: null,
    },
  },
]

export function getNexusReference(
  referenceId: string,
  registry: readonly NexusReference[] = NEXUS_REFERENCE_REGISTRY,
): NexusReference | null {
  const matches = registry.filter(reference => reference.id === referenceId)

  if (matches.length > 1) {
    throw new Error(`Medical Operations Registry contains duplicate immutable revision ID ${referenceId}.`)
  }

  return matches[0] ?? null
}

/**
 * Returns the active revision for discovery only. Replay rules intentionally do not call this:
 * they resolve immutable revision IDs so a later source update cannot rewrite history.
 */
export function getCurrentNexusReference(
  familyId: string,
  registry: readonly NexusReference[] = NEXUS_REFERENCE_REGISTRY,
): NexusReference | null {
  const active = registry.filter(reference => (
    reference.familyId === familyId && reference.lifecycle.state === 'active'
  ))

  if (active.length > 1) {
    throw new Error(`Medical Operations Registry family ${familyId} has multiple active revisions.`)
  }

  return active[0] ?? null
}

export function validateReferenceIds(
  referenceIds: readonly string[],
  registry: readonly NexusReference[] = NEXUS_REFERENCE_REGISTRY,
): string[] {
  return referenceIds.filter(referenceId => getNexusReference(referenceId, registry) === null)
}

export function isClinicalRuleSourceApproved(reference: NexusReference): boolean {
  return reference.lifecycle.state === 'active'
    && reference.ruleAuthority.use === 'clinical-rule'
    && reference.ruleAuthority.clinicalApproval === 'approved'
    && reference.ruleAuthority.approvedBy !== null
    && reference.ruleAuthority.approvedAt !== null
    && reference.ruleAuthority.approvedJurisdiction !== null
    && reference.reviewStatus !== 'requires-local-review'
    && reference.rights.status !== 'internal-use-review-required'
    && reference.rights.status !== 'link-only-review-required'
}

export function createMedicalOperationsRegistrySnapshot(
  referenceIds: readonly string[],
  registry: readonly NexusReference[] = NEXUS_REFERENCE_REGISTRY,
): MedicalOperationsRegistrySnapshot {
  const uniqueIds = [...new Set(referenceIds)]
  if (uniqueIds.length !== referenceIds.length) {
    throw new Error('Medical Operations Registry references must be unique immutable revision IDs.')
  }

  const unresolved = validateReferenceIds(uniqueIds, registry)
  if (unresolved.length) {
    throw new Error(`Unresolved Medical Operations Registry references: ${unresolved.join(', ')}`)
  }

  const sources = uniqueIds.map(referenceId => {
    const reference = getNexusReference(referenceId, registry)
    if (!reference) throw new Error(`Unresolved Medical Operations Registry reference: ${referenceId}`)
    return snapshotSource(reference)
  })

  return {
    schemaVersion: MEDICAL_OPERATIONS_REGISTRY_SCHEMA_VERSION,
    snapshotId: `mor-v1:${sources.map(source => `${source.id}@${source.version}`).join('|')}`,
    sourceIds: [...uniqueIds],
    sources,
    ruleMode: 'synthetic-demonstration-only',
    clinicalExecution: {
      state: 'blocked',
      reasons: [
        'The configured threshold is limited to a fictional deterministic demonstration.',
        'No source revision has been activated as an executable clinical rule.',
        'Scoped human clinical, rights, jurisdiction, and validation approval are required.',
      ],
    },
  }
}

function snapshotSource(reference: NexusReference): MedicalOperationsSourceSnapshot {
  return {
    schemaVersion: MEDICAL_OPERATIONS_REGISTRY_SCHEMA_VERSION,
    id: reference.id,
    familyId: reference.familyId,
    title: reference.title,
    publisher: reference.publisher,
    authority: reference.authority,
    version: reference.version,
    effectiveDate: reference.effectiveDate,
    jurisdiction: reference.jurisdiction,
    sourceUrl: reference.sourceUrl,
    sourceAccess: reference.sourceAccess,
    reviewStatus: reference.reviewStatus,
    reviewedAt: reference.reviewedAt,
    reviewedBy: reference.reviewedBy,
    intendedUse: reference.intendedUse,
    linkedPathwayIds: [...reference.linkedPathwayIds],
    scope: reference.scope,
    lifecycle: { ...reference.lifecycle },
    rights: { ...reference.rights },
    ruleAuthority: { ...reference.ruleAuthority },
  }
}
