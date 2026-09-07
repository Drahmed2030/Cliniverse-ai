export type NexusReferenceAuthority = 'local-approved' | 'national-regulatory' | 'international-guideline' | 'interoperability-standard'

export interface NexusReference {
  id: string
  title: string
  publisher: string
  authority: NexusReferenceAuthority
  version: string
  effectiveDate: string | null
  jurisdiction: string
  sourceUrl: string | null
  status: 'approved-local' | 'verified-public' | 'requires-local-review'
  scope: string
}

export const NEXUS_REFERENCE_REGISTRY: NexusReference[] = [
  {
    id: 'QAPAS-DIRECT-LOCAL',
    title: 'QAPAS-DIRECT local STEMI pathway',
    publisher: 'Prince Sultan Cardiac Center Qassim / Qassim Health Cluster',
    authority: 'local-approved',
    version: 'Provided internal pathway',
    effectiveDate: null,
    jurisdiction: 'Qassim, Saudi Arabia',
    sourceUrl: null,
    status: 'requires-local-review',
    scope: 'Operational referral, acceptance, transfer, and Cath Lab workflow.',
  },
  {
    id: 'AHA-KPI-LOCAL-AUDIT',
    title: 'AHA KPI compliance percentage',
    publisher: 'Provided local audit',
    authority: 'local-approved',
    version: 'Q2 2026',
    effectiveDate: '2026-06-30',
    jurisdiction: 'Local pilot context',
    sourceUrl: null,
    status: 'requires-local-review',
    scope: 'Prototype baselines for AHACAD2, AHACAD8, and AHACAD9.',
  },
  {
    id: 'AHA-MISSION-LIFELINE',
    title: 'Mission: Lifeline EMS',
    publisher: 'American Heart Association',
    authority: 'international-guideline',
    version: 'Current public program page',
    effectiveDate: null,
    jurisdiction: 'International reference',
    sourceUrl: 'https://www.heart.org/en/professional/quality-improvement/mission-lifeline',
    status: 'verified-public',
    scope: 'Systems of care, performance measurement, gap identification, and quality improvement.',
  },
  {
    id: 'ESC-ACS-2023',
    title: '2023 ESC Guidelines for the management of acute coronary syndromes',
    publisher: 'European Society of Cardiology',
    authority: 'international-guideline',
    version: '2023',
    effectiveDate: '2023-08-25',
    jurisdiction: 'International reference',
    sourceUrl: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Acute-Coronary-Syndromes-ACS',
    status: 'verified-public',
    scope: 'Clinical guideline reference. It does not grant Nexus clinical authority.',
  },
  {
    id: 'HL7-FHIR-R5-PROVENANCE',
    title: 'FHIR R5 Provenance',
    publisher: 'HL7 International',
    authority: 'interoperability-standard',
    version: 'R5.0.0',
    effectiveDate: '2023-03-26',
    jurisdiction: 'International standard',
    sourceUrl: 'https://hl7.org/fhir/R5/provenance.html',
    status: 'verified-public',
    scope: 'Context and source assertions for created or updated records.',
  },
  {
    id: 'HL7-FHIR-R5-AUDIT-EVENT',
    title: 'FHIR R5 AuditEvent',
    publisher: 'HL7 International',
    authority: 'interoperability-standard',
    version: 'R5.0.0',
    effectiveDate: '2023-03-26',
    jurisdiction: 'International standard',
    sourceUrl: 'https://hl7.org/fhir/R5/auditevent.html',
    status: 'verified-public',
    scope: 'Who, what, where, when, and why for auditable events.',
  },
  {
    id: 'SAUDI-PDPL',
    title: 'Personal Data Protection Law and Implementing Regulations',
    publisher: 'Saudi Data and AI Authority',
    authority: 'national-regulatory',
    version: 'Current official publication',
    effectiveDate: null,
    jurisdiction: 'Saudi Arabia',
    sourceUrl: 'https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/details/GPDPL/',
    status: 'verified-public',
    scope: 'Personal data processing obligations and data subject rights.',
  },
]

export function getNexusReference(referenceId: string): NexusReference | null {
  return NEXUS_REFERENCE_REGISTRY.find(reference => reference.id === referenceId) ?? null
}

export function validateReferenceIds(referenceIds: string[]): string[] {
  return referenceIds.filter(referenceId => getNexusReference(referenceId) === null)
}
