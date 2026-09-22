export type ContentKind =
  | 'ecg'
  | 'echo'
  | 'ward'
  | 'resuscitation'
  | 'handover'
  | 'code-lab'
  | 'pathway'
  | 'reference'
  | 'calculator'
  | 'nexus'
  | 'institutional'

export type PublicationState = 'learner' | 'internal' | 'recoverable'

export interface ContentNode {
  id: string
  title: string
  kind: ContentKind
  publicationState: PublicationState
  durationMinutes?: number
  tags: string[]
  sourcePath: string
}

export interface ContentEdge {
  from: string
  to: string
  relation: 'practice-next' | 'related' | 'review-with' | 'supports' | 'institutional-extension'
}

export const CONTENT_NODES: ContentNode[] = [
  { id: 'ecg-record-10', title: 'ECG Record 10', kind: 'ecg', publicationState: 'learner', durationMinutes: 4, tags: ['cardiology','rhythm','signal'], sourcePath: 'app/learn/ecg' },
  { id: 'echo-a4c-normal', title: 'Normal A4C Echo', kind: 'echo', publicationState: 'learner', durationMinutes: 4, tags: ['cardiology','echo','a4c','media'], sourcePath: 'app/components/clinical-media' },
  { id: 'ward-current-set', title: 'Ward current case set', kind: 'ward', publicationState: 'learner', durationMinutes: 10, tags: ['clinical-reasoning','decisions','simulation'], sourcePath: 'app/lib/ward/wardData.ts' },
  { id: 'resuscitation-hub', title: 'Resuscitation', kind: 'resuscitation', publicationState: 'learner', durationMinutes: 8, tags: ['resuscitation','simulation','acute-care'], sourcePath: 'app/labs/resuscitation-hub' },
  { id: 'handover-practice', title: 'Handover Practice', kind: 'handover', publicationState: 'learner', durationMinutes: 5, tags: ['communication','handover','ward'], sourcePath: 'app/components/ward' },
  { id: 'code-lab-bls', title: 'BLS curriculum', kind: 'code-lab', publicationState: 'learner', durationMinutes: 8, tags: ['bls','resuscitation','curriculum'], sourcePath: 'app/lib/codelab/blsLessons.ts' },
  { id: 'code-lab-acls', title: 'ACLS curriculum', kind: 'code-lab', publicationState: 'learner', durationMinutes: 10, tags: ['acls','resuscitation','curriculum'], sourcePath: 'app/lib/codelab/aclsLessons.ts' },
  { id: 'pathway-replay', title: 'Pathway Replay', kind: 'pathway', publicationState: 'learner', durationMinutes: 6, tags: ['pathway','decision','replay'], sourcePath: 'app/labs/pathway-replay' },
  { id: 'clinical-reference', title: 'Clinical Reference', kind: 'reference', publicationState: 'learner', tags: ['reference','drug-label','source-linked'], sourcePath: 'app/labs/clinical-reference' },

  { id: 'ward-extra-set', title: 'Deferred Ward templates', kind: 'ward', publicationState: 'recoverable', tags: ['ward','legacy','structured-cases'], sourcePath: 'app/lib/ward/wardTemplatesExtra.ts' },
  { id: 'megacode-v2', title: 'Megacode v2', kind: 'resuscitation', publicationState: 'recoverable', tags: ['vf','pe','sepsis','simulation'], sourcePath: 'app/components/ward/MegacodeRunner.tsx' },
  { id: 'critical-care-legacy', title: 'Critical Care case set', kind: 'ward', publicationState: 'recoverable', tags: ['critical-care','icu','legacy'], sourcePath: 'app/components/CriticalCareModule.tsx' },
  { id: 'clinical-library-legacy', title: 'Clinical Library case set', kind: 'ward', publicationState: 'recoverable', tags: ['cases','legacy','clinical-reasoning'], sourcePath: 'app/components/ClinicalLibrary.tsx' },
  { id: 'medical-calculators', title: 'Medical Calculators', kind: 'calculator', publicationState: 'recoverable', tags: ['calculator','reference','clinical-systems'], sourcePath: 'app/components/MedCalculators.tsx' },
  { id: 'clinical-nexus', title: 'Nexus Learning', kind: 'nexus', publicationState: 'recoverable', tags: ['collaboration','team','cardiology'], sourcePath: 'app/components/ClinicalNexus.tsx' },
  { id: 'fhir-foundation', title: 'FHIR Integration foundation', kind: 'institutional', publicationState: 'internal', tags: ['fhir','integration','enterprise'], sourcePath: 'app/components/FHIRIntegration.tsx' },
  { id: 'teleconsult-foundation', title: 'Teleconsult workflow foundation', kind: 'institutional', publicationState: 'internal', tags: ['teleconsult','pacs','enterprise'], sourcePath: 'app/components/TeleconsultModule.tsx' },
]

export const CONTENT_EDGES: ContentEdge[] = [
  { from: 'ecg-record-10', to: 'ward-current-set', relation: 'practice-next' },
  { from: 'echo-a4c-normal', to: 'ward-current-set', relation: 'practice-next' },
  { from: 'ward-current-set', to: 'handover-practice', relation: 'practice-next' },
  { from: 'resuscitation-hub', to: 'code-lab-bls', relation: 'supports' },
  { from: 'resuscitation-hub', to: 'code-lab-acls', relation: 'supports' },
  { from: 'code-lab-acls', to: 'pathway-replay', relation: 'practice-next' },
  { from: 'clinical-reference', to: 'ward-current-set', relation: 'review-with' },
  { from: 'medical-calculators', to: 'clinical-reference', relation: 'supports' },
  { from: 'clinical-nexus', to: 'ward-current-set', relation: 'related' },
  { from: 'fhir-foundation', to: 'clinical-reference', relation: 'institutional-extension' },
  { from: 'teleconsult-foundation', to: 'ward-current-set', relation: 'institutional-extension' },
]

export function contentNode(id: string) {
  return CONTENT_NODES.find(node => node.id === id) ?? null
}

export function connectedContent(id: string) {
  return CONTENT_EDGES
    .filter(edge => edge.from === id || edge.to === id)
    .map(edge => ({
      edge,
      node: contentNode(edge.from === id ? edge.to : edge.from),
    }))
    .filter(item => item.node !== null)
}
