export type RecoveryState = 'active' | 'recoverable' | 'institutional' | 'archive'
export type ProductLayer = 'core-practice' | 'advanced-practice' | 'clinical-systems' | 'institutional'

export interface RecoveryAsset {
  id: string
  title: string
  layer: ProductLayer
  state: RecoveryState
  sourcePath: string
  unitCount?: number
  notes: string
  nextUse: string
}

export const RECOVERY_ASSETS: RecoveryAsset[] = [
  { id:'ecg-governed', title:'Governed ECG workspace', layer:'core-practice', state:'active', sourcePath:'app/learn/ecg', notes:'Real-record pipeline, provenance and renderer contracts already exist.', nextUse:'Convert engineering-facing states into learner-facing practice and grow the governed case library.' },
  { id:'echo-studio', title:'Echo learner + Clinical Media Studio', layer:'core-practice', state:'active', sourcePath:'app/learn/echo + app/components/clinical-media', notes:'Licensed cine playback, attribution, assessment and media controls are implemented.', nextUse:'Expand the licensed study library and expose studies as a real collection.' },
  { id:'ward-seven', title:'Ward v2 current case set', layer:'core-practice', state:'active', sourcePath:'app/lib/ward/wardData.ts', unitCount:7, notes:'Seven simulated learner cases are currently routed through Ward v2.', nextUse:'Use as the canonical case journey and attach more validated templates.' },
  { id:'ward-extra', title:'Deferred Ward templates', layer:'core-practice', state:'recoverable', sourcePath:'app/lib/ward/wardTemplatesExtra.ts', unitCount:8, notes:'Eight additional structured templates already exist in source.', nextUse:'Normalize into the Ward v2 contract, update source references, then add as a second case wave.' },
  { id:'codelab-bls', title:'Code Lab BLS lessons', layer:'advanced-practice', state:'active', sourcePath:'app/lib/codelab/blsLessons.ts', unitCount:6, notes:'Structured lessons with practice and knowledge checks.', nextUse:'Present as a coherent curriculum collection rather than an engineering workspace.' },
  { id:'codelab-acls', title:'Code Lab ACLS lessons', layer:'advanced-practice', state:'active', sourcePath:'app/lib/codelab/aclsLessons.ts', unitCount:6, notes:'Structured ACLS lessons are already implemented.', nextUse:'Link to Resuscitation pathways and saved review.' },
  { id:'megacode', title:'Megacode v2', layer:'advanced-practice', state:'recoverable', sourcePath:'app/components/ward/MegacodeRunner.tsx', unitCount:3, notes:'VF, PE and sepsis simulation runner exists.', nextUse:'Recompose under Resuscitation with shared scenario primitives and modern visual shell.' },
  { id:'critical-care', title:'Critical Care cases', layer:'advanced-practice', state:'recoverable', sourcePath:'app/components/CriticalCareModule.tsx', unitCount:2, notes:'Interactive ICU cases and tools exist in legacy UI.', nextUse:'Extract case logic into modern decision drills; do not revive the old screen unchanged.' },
  { id:'clinical-library', title:'Clinical Library cases', layer:'advanced-practice', state:'recoverable', sourcePath:'app/components/ClinicalLibrary.tsx', unitCount:7, notes:'Seven actual case definitions are present despite the older library presentation implying broader depth.', nextUse:'Extract only real cases into the shared content graph; remove inflated catalog presentation.' },
  { id:'pearls', title:'Weekly Clinical Pearls', layer:'advanced-practice', state:'recoverable', sourcePath:'app/components/WeeklyClinicalPearl.tsx', unitCount:3, notes:'Three authored pearl entries are present.', nextUse:'Convert into short daily/weekly practice cards linked to cases rather than standalone feed content.' },
  { id:'calculators', title:'Medical Calculators', layer:'clinical-systems', state:'recoverable', sourcePath:'app/components/MedCalculators.tsx', unitCount:6, notes:'ASCVD, CHA2DS2-VASc, CrCl, CURB-65, TIMI and Wells calculators exist.', nextUse:'Rebuild calculations against verified formula contracts and expose inside Clinical Reference/Atlas.' },
  { id:'clinical-nexus', title:'Clinical Nexus', layer:'advanced-practice', state:'recoverable', sourcePath:'app/components/ClinicalNexus.tsx', notes:'Multistep collaborative case experience exists and can load case data.', nextUse:'Extract team-decision mechanics into Nexus Learning and institutional assignments.' },
  { id:'fhir', title:'FHIR Integration foundation', layer:'institutional', state:'institutional', sourcePath:'app/components/FHIRIntegration.tsx', notes:'HL7 FHIR R4 integration concepts and UI foundation exist.', nextUse:'Keep as Connected Diagnostics / institutional integration foundation; connect only to real authorized endpoints.' },
  { id:'teleconsult', title:'Teleconsult / remote workflow', layer:'institutional', state:'institutional', sourcePath:'app/components/TeleconsultModule.tsx', notes:'Remote consult workflow and PACS/teleradiology scenario logic exist.', nextUse:'Extract workflow primitives for institutional simulation before any real clinical integration.' },
  { id:'code-blue', title:'Code Blue', layer:'advanced-practice', state:'recoverable', sourcePath:'app/components/CodeBlue.tsx', notes:'Legacy code simulation shell integrates MegacodeRunner.', nextUse:'Merge useful scenario mechanics into Resuscitation rather than exposing a duplicate product.' },
]

export const RECOVERY_SUMMARY = RECOVERY_ASSETS.reduce((acc, asset) => {
  acc.assets += 1
  acc.units += asset.unitCount ?? 0
  acc.byState[asset.state] = (acc.byState[asset.state] ?? 0) + 1
  return acc
}, {
  assets: 0,
  units: 0,
  byState: {} as Record<RecoveryState, number>,
})
