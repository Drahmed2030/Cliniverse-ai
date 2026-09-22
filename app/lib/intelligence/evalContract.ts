export type EvalDimension =
  | 'grounding'
  | 'tool-selection'
  | 'clinical-boundary'
  | 'format'
  | 'latency'
  | 'cost'

export interface EvalRequirement {
  id: EvalDimension
  required: boolean
  description: string
}

export interface IntelligenceCapabilityPolicy {
  capability: string
  productionReadyWhen: readonly EvalDimension[]
  disallowedWithoutEvidence: readonly string[]
}

export const BASE_AI_EVALS: readonly EvalRequirement[] = [
  { id:'grounding', required:true, description:'Claims that depend on source material remain traceable to the supplied evidence.' },
  { id:'tool-selection', required:true, description:'The orchestration layer chooses the intended deterministic, retrieval or model tool for the task.' },
  { id:'clinical-boundary', required:true, description:'Educational and simulation features do not present themselves as real-patient diagnosis or treatment.' },
  { id:'format', required:true, description:'Outputs satisfy the receiving product contract exactly.' },
  { id:'latency', required:false, description:'Interactive features stay within the declared user-facing latency budget.' },
  { id:'cost', required:false, description:'The selected route stays within the declared cost budget.' },
]

export const INTELLIGENCE_POLICIES: readonly IntelligenceCapabilityPolicy[] = [
  {
    capability:'next-practice',
    productionReadyWhen:['grounding','tool-selection','clinical-boundary','format'],
    disallowedWithoutEvidence:['clinical diagnosis','patient-specific treatment recommendation','unsupported competency claim'],
  },
  {
    capability:'content-classification',
    productionReadyWhen:['grounding','tool-selection','format'],
    disallowedWithoutEvidence:['license classification inferred from missing rights metadata','publication-state promotion'],
  },
  {
    capability:'cohort-insight',
    productionReadyWhen:['grounding','tool-selection','clinical-boundary','format'],
    disallowedWithoutEvidence:['patient outcome claim','staff competence certification'],
  },
]
