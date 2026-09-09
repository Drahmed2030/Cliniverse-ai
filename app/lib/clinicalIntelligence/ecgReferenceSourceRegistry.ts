export type EcgReferenceUseMode = 'INGESTION_ELIGIBLE' | 'REFERENCE_ONLY'
export type EcgReferenceRights =
  | 'CC-BY-4.0'
  | 'CC-BY-NC-SA'
  | 'NONPROFIT_REPRODUCTION_ONLY'
  | 'ALL_RIGHTS_RESERVED'

export interface EcgReferenceSource {
  id: string
  name: string
  publisher: string
  url: string
  scope: readonly string[]
  approximateScale: string
  useMode: EcgReferenceUseMode
  rights: EcgReferenceRights
  commercialIngestionAllowed: boolean
  attributionRequired: boolean
  governanceNote: string
}

/**
 * Human-review/reference registry for ECG interpretation and teaching support.
 * REFERENCE_ONLY sources may inform reviewer reasoning, terminology and case
 * selection, but their images/text must not be copied into commercial learner
 * content unless a separate rights check or permission explicitly allows it.
 */
export const ECG_REFERENCE_SOURCES: readonly EcgReferenceSource[] = [
  {
    id: 'physionet-ptb-xl-v1.0.3',
    name: 'PTB-XL',
    publisher: 'PhysioNet',
    url: 'https://physionet.org/content/ptb-xl/1.0.3/',
    scope: ['12-lead-waveforms', 'scp-ecg-annotations', 'dataset-provenance'],
    approximateScale: '21,799 ECG records',
    useMode: 'INGESTION_ELIGIBLE',
    rights: 'CC-BY-4.0',
    commercialIngestionAllowed: true,
    attributionRequired: true,
    governanceNote: 'Primary waveform/data source. Record-level technical, privacy, clinical and provenance review remains mandatory.',
  },
  {
    id: 'ecgpedia-de-voogt-archive',
    name: 'ECGpedia / De Voogt ECG Archive',
    publisher: 'Cardionetworks Foundation / ECGpedia',
    url: 'https://en.ecgpedia.org/',
    scope: ['systematic-interpretation', 'diagnostic-examples', 'reference-images', 'teaching-explanations'],
    approximateScale: '>2,000 ECGs in the De Voogt archive',
    useMode: 'REFERENCE_ONLY',
    rights: 'CC-BY-NC-SA',
    commercialIngestionAllowed: false,
    attributionRequired: true,
    governanceNote: 'Excellent reviewer reference. Do not ingest images/text into commercial Cliniverse content without separate permission because the standard ECGpedia license is non-commercial and some items have third-party exceptions.',
  },
  {
    id: 'litfl-ecg-library',
    name: 'LITFL ECG Library',
    publisher: 'Life in the Fast Lane',
    url: 'https://litfl.com/ecg-library/',
    scope: ['ecg-basics', 'diagnostic-a-z', 'clinical-cases', 'self-assessment', 'interpretation-frameworks'],
    approximateScale: '100+ ECG topics and 150-case quiz collection',
    useMode: 'REFERENCE_ONLY',
    rights: 'NONPROFIT_REPRODUCTION_ONLY',
    commercialIngestionAllowed: false,
    attributionRequired: true,
    governanceNote: 'High-value explanatory and case-review reference. LITFL states ECG reproduction is for educational not-for-profit use; therefore keep as reference-only for Cliniverse commercial content.',
  },
  {
    id: 'bidmc-ecg-wave-maven',
    name: 'ECG Wave-Maven',
    publisher: 'Beth Israel Deaconess Medical Center / Harvard Medical School',
    url: 'https://ecg.bidmc.harvard.edu/maven/mavenmain.asp',
    scope: ['12-lead-cases', 'diagnosis-search', 'quiz-mode', 'reference-mode'],
    approximateScale: '400+ case studies',
    useMode: 'REFERENCE_ONLY',
    rights: 'ALL_RIGHTS_RESERVED',
    commercialIngestionAllowed: false,
    attributionRequired: true,
    governanceNote: 'Strong expert reference and benchmarking source, but the live site states copyright and all rights reserved. Do not ingest its case images into Cliniverse without explicit permission.',
  },
] as const

export function getCommerciallyIngestibleEcgSources() {
  return ECG_REFERENCE_SOURCES.filter(source => source.commercialIngestionAllowed && source.useMode === 'INGESTION_ELIGIBLE')
}

export function getReferenceOnlyEcgSources() {
  return ECG_REFERENCE_SOURCES.filter(source => source.useMode === 'REFERENCE_ONLY')
}

export function canIngestEcgSourceIntoCommercialContent(sourceId: string): boolean {
  const source = ECG_REFERENCE_SOURCES.find(item => item.id === sourceId)
  return Boolean(source?.commercialIngestionAllowed && source.useMode === 'INGESTION_ELIGIBLE')
}
