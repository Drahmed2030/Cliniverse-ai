export type ClinicalIntelligenceDomain =
  | 'ECHO'
  | 'ECG'
  | 'XRAY'
  | 'CT'
  | 'ANGIO'
  | 'CLINICAL_PATHWAY'
  | 'COMPETENCY'
  | 'EDUCATIONAL_CONTENT'
  | 'INSTITUTION_ANALYTICS'
  | 'GOVERNANCE_ASSURANCE'
  | 'EXTERNAL_DATA'

export type ClinicalIntelligenceRiskTier = 'LOW' | 'MODERATE' | 'HIGH'
export type ClinicalIntelligenceLifecycle = 'ACTIVE' | 'PILOT' | 'PREPARED' | 'FUTURE'
export type ClinicalIntelligenceRevenueSurface =
  | 'INDIVIDUAL_SUBSCRIPTION'
  | 'INSTITUTION_SAAS'
  | 'ENTERPRISE_ASSURANCE'
  | 'PILOT_SERVICE'
  | 'NONE'

export interface ClinicalIntelligenceCapability {
  id: string
  domain: ClinicalIntelligenceDomain
  lifecycle: ClinicalIntelligenceLifecycle
  riskTier: ClinicalIntelligenceRiskTier
  revenueSurface: readonly ClinicalIntelligenceRevenueSurface[]
  requiresEvidenceLedger: boolean
  requiresHumanClinicalReview: boolean
  requiresHumanPrivacyReview: boolean
  requiresInstitutionIntegration: boolean
  algorithmFamily: readonly string[]
  currentFoundation: readonly string[]
}

export const CLINICAL_INTELLIGENCE_CAPABILITIES: readonly ClinicalIntelligenceCapability[] = [
  {
    id: 'echo-competency-engine',
    domain: 'ECHO',
    lifecycle: 'ACTIVE',
    riskTier: 'MODERATE',
    revenueSurface: ['INDIVIDUAL_SUBSCRIPTION', 'INSTITUTION_SAAS', 'PILOT_SERVICE'],
    requiresEvidenceLedger: true,
    requiresHumanClinicalReview: true,
    requiresHumanPrivacyReview: true,
    requiresInstitutionIntegration: false,
    algorithmFamily: ['deterministic-scoring', 'recency-weighted-mastery', 'adaptive-case-selection'],
    currentFoundation: ['clinicalMedia', 'competency', 'echo skill graph', 'renderer baseline'],
  },
  {
    id: 'ecg-competency-engine',
    domain: 'ECG',
    lifecycle: 'PREPARED',
    riskTier: 'MODERATE',
    revenueSurface: ['INDIVIDUAL_SUBSCRIPTION', 'INSTITUTION_SAAS'],
    requiresEvidenceLedger: true,
    requiresHumanClinicalReview: true,
    requiresHumanPrivacyReview: false,
    requiresInstitutionIntegration: false,
    algorithmFamily: ['signal-calibration', 'interval-measurement', 'pattern-scoring', 'adaptive-case-selection'],
    currentFoundation: ['cardiology/ecgWaveform', 'competency', 'governance'],
  },
  {
    id: 'radiology-competency-engine',
    domain: 'XRAY',
    lifecycle: 'PREPARED',
    riskTier: 'MODERATE',
    revenueSurface: ['INSTITUTION_SAAS', 'PILOT_SERVICE'],
    requiresEvidenceLedger: true,
    requiresHumanClinicalReview: true,
    requiresHumanPrivacyReview: true,
    requiresInstitutionIntegration: false,
    algorithmFamily: ['structured-visual-checklist', 'localization-scoring', 'uncertainty-scoring'],
    currentFoundation: ['clinicalMedia', 'governance', 'competency'],
  },
  {
    id: 'ct-competency-engine',
    domain: 'CT',
    lifecycle: 'FUTURE',
    riskTier: 'HIGH',
    revenueSurface: ['INSTITUTION_SAAS', 'ENTERPRISE_ASSURANCE'],
    requiresEvidenceLedger: true,
    requiresHumanClinicalReview: true,
    requiresHumanPrivacyReview: true,
    requiresInstitutionIntegration: true,
    algorithmFamily: ['series-navigation', 'window-level-protocols', 'lesion-localization', 'uncertainty-scoring'],
    currentFoundation: ['clinicalMedia', 'governance'],
  },
  {
    id: 'angiography-competency-engine',
    domain: 'ANGIO',
    lifecycle: 'FUTURE',
    riskTier: 'HIGH',
    revenueSurface: ['INSTITUTION_SAAS', 'ENTERPRISE_ASSURANCE'],
    requiresEvidenceLedger: true,
    requiresHumanClinicalReview: true,
    requiresHumanPrivacyReview: true,
    requiresInstitutionIntegration: true,
    algorithmFamily: ['cine-review', 'anatomy-localization', 'lesion-severity-scoring'],
    currentFoundation: ['clinicalMedia', 'governance'],
  },
  {
    id: 'clinical-pathway-simulation',
    domain: 'CLINICAL_PATHWAY',
    lifecycle: 'PILOT',
    riskTier: 'MODERATE',
    revenueSurface: ['INDIVIDUAL_SUBSCRIPTION', 'INSTITUTION_SAAS'],
    requiresEvidenceLedger: true,
    requiresHumanClinicalReview: true,
    requiresHumanPrivacyReview: false,
    requiresInstitutionIntegration: false,
    algorithmFamily: ['state-machine-simulation', 'branch-scoring', 'replay-analysis', 'agent-assisted-evaluation'],
    currentFoundation: ['cardiology/pathwaySimulation', 'cardiology/pathwaySession', 'cardiology/pathwayReplayAgents'],
  },
  {
    id: 'longitudinal-competency-graph',
    domain: 'COMPETENCY',
    lifecycle: 'PILOT',
    riskTier: 'LOW',
    revenueSurface: ['INDIVIDUAL_SUBSCRIPTION', 'INSTITUTION_SAAS'],
    requiresEvidenceLedger: true,
    requiresHumanClinicalReview: false,
    requiresHumanPrivacyReview: false,
    requiresInstitutionIntegration: false,
    algorithmFamily: ['recency-weighted-mastery', 'confidence-calibration', 'spaced-retrieval', 'adaptive-selection'],
    currentFoundation: ['competency', 'evidence ledger', 'user_progress', 'case_attempts'],
  },
  {
    id: 'governed-educational-content',
    domain: 'EDUCATIONAL_CONTENT',
    lifecycle: 'PILOT',
    riskTier: 'LOW',
    revenueSurface: ['INDIVIDUAL_SUBSCRIPTION', 'INSTITUTION_SAAS'],
    requiresEvidenceLedger: true,
    requiresHumanClinicalReview: true,
    requiresHumanPrivacyReview: false,
    requiresInstitutionIntegration: false,
    algorithmFamily: ['evidence-grounded-generation', 'difficulty-calibration', 'content-versioning'],
    currentFoundation: ['clinical_documents', 'generated_questions', 'question_bank', 'guidelines', 'evidence'],
  },
  {
    id: 'institution-competency-analytics',
    domain: 'INSTITUTION_ANALYTICS',
    lifecycle: 'PREPARED',
    riskTier: 'MODERATE',
    revenueSurface: ['INSTITUTION_SAAS', 'ENTERPRISE_ASSURANCE'],
    requiresEvidenceLedger: true,
    requiresHumanClinicalReview: false,
    requiresHumanPrivacyReview: false,
    requiresInstitutionIntegration: false,
    algorithmFamily: ['cohort-benchmarking', 'skill-gap-detection', 'trend-analysis', 'quality-control-charts'],
    currentFoundation: ['competency', 'case_attempts', 'user_progress', 'nexusKpiEngine'],
  },
  {
    id: 'ai-governance-assurance',
    domain: 'GOVERNANCE_ASSURANCE',
    lifecycle: 'PILOT',
    riskTier: 'MODERATE',
    revenueSurface: ['ENTERPRISE_ASSURANCE', 'PILOT_SERVICE'],
    requiresEvidenceLedger: true,
    requiresHumanClinicalReview: false,
    requiresHumanPrivacyReview: false,
    requiresInstitutionIntegration: false,
    algorithmFamily: ['tevv-evidence', 'post-deployment-monitoring', 'policy-gating', 'incident-tracking'],
    currentFoundation: ['governance', 'evidence ledger', 'NeuraOps adapter'],
  },
  {
    id: 'external-clinical-data-adapters',
    domain: 'EXTERNAL_DATA',
    lifecycle: 'FUTURE',
    riskTier: 'HIGH',
    revenueSurface: ['INSTITUTION_SAAS', 'ENTERPRISE_ASSURANCE'],
    requiresEvidenceLedger: true,
    requiresHumanClinicalReview: false,
    requiresHumanPrivacyReview: true,
    requiresInstitutionIntegration: true,
    algorithmFamily: ['fhir-adapter', 'dicomweb-adapter', 'terminology-normalization', 'event-subscription'],
    currentFoundation: ['governance', 'clinicalMedia', 'external adapter boundary planned'],
  },
] as const

export function getCapabilitiesForRevenueSurface(surface: ClinicalIntelligenceRevenueSurface) {
  return CLINICAL_INTELLIGENCE_CAPABILITIES.filter(capability => capability.revenueSurface.includes(surface))
}

export function getCapabilitiesByLifecycle(lifecycle: ClinicalIntelligenceLifecycle) {
  return CLINICAL_INTELLIGENCE_CAPABILITIES.filter(capability => capability.lifecycle === lifecycle)
}

export function getHighRiskCapabilities() {
  return CLINICAL_INTELLIGENCE_CAPABILITIES.filter(capability => capability.riskTier === 'HIGH')
}
