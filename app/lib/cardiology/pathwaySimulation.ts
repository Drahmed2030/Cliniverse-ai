export type QapasRoleId = 'referring' | 'coordination' | 'cardiology' | 'cath-lab' | 'quality'

export interface QapasRole {
  id: QapasRoleId
  label: string
  responsibility: string
}

export interface QapasPathwayStep {
  id: string
  number: number
  title: string
  owner: QapasRoleId
  supportingRoles: QapasRoleId[]
  identifier: string
  operationalOutput: string
  nexusAssist: string
  humanGate: string
  roleActions: Partial<Record<QapasRoleId, string>>
  relatedKpis: string[]
}

export interface QapasKpiBaseline {
  id: string
  label: string
  target: string
  baseline: string
}

export const QAPAS_ROLES: QapasRole[] = [
  { id: 'referring', label: 'Referring team', responsibility: 'Starts the referral and supplies the minimum operational dataset.' },
  { id: 'coordination', label: 'Medical Coordination', responsibility: 'Maintains the referral identity and coordinates MRN readiness.' },
  { id: 'cardiology', label: 'Accepting Cardiology', responsibility: 'Records the accountable human review and acceptance decision.' },
  { id: 'cath-lab', label: 'Cath Lab', responsibility: 'Records activation, readiness, arrival, and procedural milestones.' },
  { id: 'quality', label: 'Quality', responsibility: 'Reviews event provenance, exclusions, delays, and KPI completeness.' },
]

export const QAPAS_STEPS: QapasPathwayStep[] = [
  {
    id: 'referral',
    number: 1,
    title: 'Referral received',
    owner: 'referring',
    supportingRoles: ['coordination'],
    identifier: 'Referral Case ID: SIM-QD-001',
    operationalOutput: 'A time-stamped referral workspace exists before an MRN is available.',
    nexusAssist: 'Checks required operational fields and flags missing items without interpreting the ECG or diagnosing STEMI.',
    humanGate: 'The referring clinician confirms the referral content and submission.',
    roleActions: {
      referring: 'Record referral time, source facility, transport status, and attach a synthetic ECG placeholder.',
      coordination: 'Acknowledge receipt and preserve the original referral timestamp.',
      quality: 'Verify that referral time and source are attributable.',
    },
    relatedKpis: ['AHACAD2'],
  },
  {
    id: 'review',
    number: 2,
    title: 'Clinical review',
    owner: 'cardiology',
    supportingRoles: ['referring'],
    identifier: 'Referral Case ID: SIM-QD-001',
    operationalOutput: 'The reviewer, review time, and requested clarifications are traceable.',
    nexusAssist: 'Produces a source-linked operational summary and highlights conflicting or absent timestamps.',
    humanGate: 'A licensed clinician performs the clinical review; Nexus cannot classify the ECG or recommend treatment.',
    roleActions: {
      referring: 'Answer clarification requests and confirm the source of new information.',
      cardiology: 'Review the supplied material and record the human decision.',
      quality: 'Audit elapsed time without judging clinical appropriateness.',
    },
    relatedKpis: ['AHACAD2'],
  },
  {
    id: 'acceptance',
    number: 3,
    title: 'Human acceptance',
    owner: 'cardiology',
    supportingRoles: ['coordination', 'cath-lab'],
    identifier: 'Referral Case ID: SIM-QD-001',
    operationalOutput: 'Acceptance status, accountable clinician, destination, and time are recorded.',
    nexusAssist: 'Routes the confirmed decision to the relevant operational roles and creates an immutable event.',
    humanGate: 'Only the accepting clinician can accept, redirect, or decline the case.',
    roleActions: {
      coordination: 'Begin the operational coordination sequence after the human decision.',
      cardiology: 'Record acceptance, destination, and accountable consultant.',
      'cath-lab': 'Acknowledge visibility; activation is a separate human action.',
      quality: 'Verify decision ownership and timestamp provenance.',
    },
    relatedKpis: ['AHACAD2'],
  },
  {
    id: 'mrn',
    number: 4,
    title: 'MRN coordination',
    owner: 'coordination',
    supportingRoles: ['cardiology'],
    identifier: 'Referral Case ID → Synthetic MRN: SIM-MRN-4401',
    operationalOutput: 'The pre-arrival referral is linked to a synthetic MRN without losing its event history.',
    nexusAssist: 'Suggests possible duplicate records for human reconciliation; it never merges identities automatically.',
    humanGate: 'Authorized registration or coordination staff confirm the identity link.',
    roleActions: {
      coordination: 'Request or locate the MRN and confirm the link to the referral case.',
      cardiology: 'Review the linked identifier before relying on the workspace.',
      quality: 'Check that pre-MRN events remain visible after linking.',
    },
    relatedKpis: ['AHACAD2'],
  },
  {
    id: 'transport',
    number: 5,
    title: 'Transport in progress',
    owner: 'referring',
    supportingRoles: ['coordination', 'cath-lab'],
    identifier: 'Synthetic MRN: SIM-MRN-4401',
    operationalOutput: 'Departure, estimated arrival, transport team, and receiving readiness are visible.',
    nexusAssist: 'Detects stale ETA or missing departure confirmation and prompts the responsible role.',
    humanGate: 'A passenger clinician or dispatcher updates the journey; the ambulance driver never interacts while driving.',
    roleActions: {
      referring: 'Confirm departure and hand responsibility to the transport clinical team.',
      coordination: 'Monitor ETA and resolve operational gaps by approved channels.',
      'cath-lab': 'Review ETA and readiness dependencies.',
      quality: 'Review timestamp completeness after the event.',
    },
    relatedKpis: ['AHACAD2'],
  },
  {
    id: 'activation',
    number: 6,
    title: 'Cath Lab activation',
    owner: 'cath-lab',
    supportingRoles: ['cardiology', 'coordination'],
    identifier: 'Synthetic MRN: SIM-MRN-4401',
    operationalOutput: 'Activation time, readiness blockers, and acknowledged team status are recorded.',
    nexusAssist: 'Surfaces unresolved readiness dependencies and drafts an operational status summary.',
    humanGate: 'The authorized Cath Lab team confirms activation and readiness.',
    roleActions: {
      coordination: 'Escalate an unresolved operational dependency through the approved pathway.',
      cardiology: 'Remain the accountable clinical owner for the accepted case.',
      'cath-lab': 'Record activation and confirm or qualify readiness.',
      quality: 'Review delay categories only after human confirmation.',
    },
    relatedKpis: ['AHACAD2', 'AHACAD8', 'AHACAD9'],
  },
  {
    id: 'arrival',
    number: 7,
    title: 'Arrival and encounter activation',
    owner: 'cath-lab',
    supportingRoles: ['coordination'],
    identifier: 'Synthetic MRN → Encounter: SIM-ENC-901',
    operationalOutput: 'Arrival and visit activation are linked to the original referral timeline.',
    nexusAssist: 'Compares system timestamps, preserves their sources, and asks a human to resolve discrepancies.',
    humanGate: 'Authorized staff confirm arrival and encounter activation in the system of record.',
    roleActions: {
      coordination: 'Close the pre-arrival coordination loop after encounter confirmation.',
      'cath-lab': 'Confirm arrival location and procedural workspace readiness.',
      quality: 'Reconcile clock/source discrepancies with the responsible human.',
    },
    relatedKpis: ['AHACAD8', 'AHACAD9'],
  },
  {
    id: 'kpi-review',
    number: 8,
    title: 'Procedure milestone and KPI review',
    owner: 'quality',
    supportingRoles: ['cath-lab', 'cardiology'],
    identifier: 'Encounter → Cath Episode: SIM-CATH-220',
    operationalOutput: 'The pathway becomes an auditable event timeline with documented exceptions and ownership.',
    nexusAssist: 'Calculates elapsed intervals from approved timestamps and suggests an operational delay category with evidence.',
    humanGate: 'Quality staff validate KPI inclusion, exclusions, timestamps, and any delay classification.',
    roleActions: {
      cardiology: 'Review the final clinical ownership trail and unresolved exceptions.',
      'cath-lab': 'Confirm procedural milestone timestamps from the source system.',
      quality: 'Validate KPI logic, exclusions, and delay attribution before reporting.',
    },
    relatedKpis: ['AHACAD2', 'AHACAD8', 'AHACAD9'],
  },
]

export const QAPAS_KPI_BASELINES: QapasKpiBaseline[] = [
  { id: 'AHACAD2', label: 'First hospital to PCI', target: '<120 min', baseline: '72%' },
  { id: 'AHACAD8', label: 'First medical contact to PCI', target: 'Local definition', baseline: '89%' },
  { id: 'AHACAD9', label: 'Primary PCI', target: '<90 min', baseline: '90%' },
]
