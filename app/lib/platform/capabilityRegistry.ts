export type CapabilityLayer = 'learner' | 'platform' | 'institutional'
export type CapabilityState = 'active' | 'recoverable' | 'internal' | 'planned'

export interface CapabilityRecord {
  id: string
  title: string
  layer: CapabilityLayer
  state: CapabilityState
  owner: 'cliniverse' | 'neuraops'
  surface: string
  dependencies: string[]
  sourcePath: string
}

export const CAPABILITY_REGISTRY: CapabilityRecord[] = [
  { id:'ecg-practice', title:'ECG Practice', layer:'learner', state:'active', owner:'cliniverse', surface:'Learn', dependencies:['content-graph','progress'], sourcePath:'app/learn/ecg' },
  { id:'echo-practice', title:'Echo Practice', layer:'learner', state:'active', owner:'cliniverse', surface:'Learn', dependencies:['content-graph','clinical-media'], sourcePath:'app/learn/echo' },
  { id:'ward-practice', title:'Ward Practice', layer:'learner', state:'active', owner:'cliniverse', surface:'Learn', dependencies:['content-graph','progress'], sourcePath:'app/components/ward' },
  { id:'resuscitation', title:'Resuscitation', layer:'learner', state:'active', owner:'cliniverse', surface:'Learn', dependencies:['content-graph','code-lab'], sourcePath:'app/labs/resuscitation-hub' },
  { id:'handover', title:'Handover Practice', layer:'learner', state:'active', owner:'cliniverse', surface:'Learn', dependencies:['ward-practice','progress'], sourcePath:'app/components/ward' },
  { id:'code-lab', title:'Code Lab', layer:'learner', state:'active', owner:'cliniverse', surface:'Learn', dependencies:['content-graph','progress'], sourcePath:'app/components/ward/AccountCodeLab.tsx' },
  { id:'clinical-reference', title:'Clinical Reference', layer:'learner', state:'active', owner:'cliniverse', surface:'Explore', dependencies:['content-graph'], sourcePath:'app/labs/clinical-reference' },
  { id:'content-graph', title:'Clinical Content Graph', layer:'platform', state:'active', owner:'neuraops', surface:'Internal', dependencies:[], sourcePath:'app/lib/content/contentGraph.ts' },
  { id:'content-studio', title:'Content Studio', layer:'platform', state:'active', owner:'neuraops', surface:'Internal', dependencies:['content-graph','recovery-manifest'], sourcePath:'app/internal/content-studio' },
  { id:'event-contract', title:'Event Contract', layer:'platform', state:'active', owner:'neuraops', surface:'Internal', dependencies:['content-graph'], sourcePath:'app/lib/platform/events.ts' },
  { id:'model-gateway', title:'Model Gateway', layer:'platform', state:'planned', owner:'neuraops', surface:'Internal', dependencies:['ai-evals'], sourcePath:'app/lib/intelligence' },
  { id:'ai-evals', title:'AI Evaluation Contract', layer:'platform', state:'active', owner:'neuraops', surface:'Internal', dependencies:[], sourcePath:'app/lib/intelligence/evalContract.ts' },
  { id:'ward-extra', title:'Ward Extra Case Set', layer:'learner', state:'recoverable', owner:'cliniverse', surface:'Learn', dependencies:['ward-practice','content-graph'], sourcePath:'app/lib/ward/wardTemplatesExtra.ts' },
  { id:'megacode-v2', title:'Megacode v2', layer:'learner', state:'recoverable', owner:'cliniverse', surface:'Learn', dependencies:['resuscitation'], sourcePath:'app/components/ward/MegacodeRunner.tsx' },
  { id:'medical-calculators', title:'Medical Calculators', layer:'learner', state:'recoverable', owner:'cliniverse', surface:'Explore', dependencies:['clinical-reference'], sourcePath:'app/components/MedCalculators.tsx' },
  { id:'clinical-nexus', title:'Clinical Nexus', layer:'learner', state:'recoverable', owner:'cliniverse', surface:'Learn', dependencies:['content-graph'], sourcePath:'app/components/ClinicalNexus.tsx' },
  { id:'institution-assignments', title:'Institution Assignments', layer:'institutional', state:'active', owner:'neuraops', surface:'Institution', dependencies:['content-graph','event-contract'], sourcePath:'app/lib/institution/assignmentContract.ts' },
  { id:'fhir-foundation', title:'FHIR Foundation', layer:'institutional', state:'internal', owner:'neuraops', surface:'Institution', dependencies:['content-graph'], sourcePath:'app/components/FHIRIntegration.tsx' },
  { id:'teleconsult-foundation', title:'Teleconsult Foundation', layer:'institutional', state:'internal', owner:'neuraops', surface:'Institution', dependencies:['fhir-foundation'], sourcePath:'app/components/TeleconsultModule.tsx' },
]

export function capability(id: string) {
  return CAPABILITY_REGISTRY.find(item => item.id === id) ?? null
}
