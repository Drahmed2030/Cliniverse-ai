export type EchoCandidateEvidenceState = 'source-page-verified' | 'media-fingerprint-pending' | 'rejected'

export interface EchoBatch01Candidate {
  candidateId: string
  diagnosisLabel: string
  view: string
  sourceDescription: string
  sourcePageUrl: string
  sourceProvider: 'CardioNetworks ECHOpedia / Wikimedia Commons'
  licenseId: 'CC-BY-SA-3.0'
  vrtTicket: '2011102310008874'
  learningFocus: string[]
  evidenceState: EchoCandidateEvidenceState
  selectionRationale: string
}

/**
 * Curated replacement-quality candidate set for Echo Batch 01.
 *
 * These records are source-page verified only. They MUST NOT become learner-ready until
 * the original media is downloaded, fingerprinted, privacy-reviewed, transcoded through
 * the governed derivative pipeline, clinically reviewed, and converted into EchoBatchRecord.
 */
export const ECHO_BATCH_01_CANDIDATES: readonly EchoBatch01Candidate[] = [
  {
    candidateId: 'echo-a4c-normal-cardionetworks',
    diagnosisLabel: 'Normal heart',
    view: 'A4C',
    sourceDescription: 'Apical 4 Chamber view of a normal heart',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:A4C_normal_(CardioNetworks_ECHOpedia).webm',
    sourceProvider: 'CardioNetworks ECHOpedia / Wikimedia Commons',
    licenseId: 'CC-BY-SA-3.0',
    vrtTicket: '2011102310008874',
    learningFocus: ['normal-reference', 'view-recognition', 'a4c-landmarks'],
    evidenceState: 'source-page-verified',
    selectionRationale: 'High-value normal reference anchor already governed in Cliniverse.',
  },
  {
    candidateId: 'echo-a4c-takotsubo-cardionetworks',
    diagnosisLabel: 'Takotsubo cardiomyopathy',
    view: 'A4C',
    sourceDescription: 'Apical 4 chamber view of a Takotsubo cardiomyopathy',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:A4CTTS_(CardioNetworks_ECHOpedia).webm',
    sourceProvider: 'CardioNetworks ECHOpedia / Wikimedia Commons',
    licenseId: 'CC-BY-SA-3.0',
    vrtTicket: '2011102310008874',
    learningFocus: ['cardiomyopathy-pattern', 'regional-motion', 'a4c-pattern-discrimination'],
    evidenceState: 'source-page-verified',
    selectionRationale: 'Distinctive high-yield motion pattern with strong contrast against the normal A4C anchor.',
  },
  {
    candidateId: 'echo-a4c-severe-hcm-mm0002',
    diagnosisLabel: 'Severe hypertrophic cardiomyopathy',
    view: 'A4C',
    sourceDescription: 'A4CH view',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Severe_Hypertrophic_Cardiomyopathy_(HCM)_MM0002_(CardioNetworks_ECHOpedia).webm',
    sourceProvider: 'CardioNetworks ECHOpedia / Wikimedia Commons',
    licenseId: 'CC-BY-SA-3.0',
    vrtTicket: '2011102310008874',
    learningFocus: ['cardiomyopathy-pattern', 'wall-thickness-pattern', 'a4c-pattern-discrimination'],
    evidenceState: 'source-page-verified',
    selectionRationale: 'Strong cardiomyopathy contrast case with explicit A4C source labeling.',
  },
  {
    candidateId: 'echo-a4c-apical-hcm-e00291',
    diagnosisLabel: 'Apical hypertrophic cardiomyopathy',
    view: 'A4C',
    sourceDescription: 'A4CH: apical hypertrophic cardiomyopathy',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Apical_HCM_E00291_(CardioNetworks_ECHOpedia).webm',
    sourceProvider: 'CardioNetworks ECHOpedia / Wikimedia Commons',
    licenseId: 'CC-BY-SA-3.0',
    vrtTicket: '2011102310008874',
    learningFocus: ['cardiomyopathy-pattern', 'apical-pattern', 'misconception-discrimination'],
    evidenceState: 'source-page-verified',
    selectionRationale: 'Adds within-family discrimination rather than another generic HCM example.',
  },
  {
    candidateId: 'echo-a4c-dcm-e00476',
    diagnosisLabel: 'Dilated cardiomyopathy',
    view: 'A4C',
    sourceDescription: 'A4CH: dilated poor left ventricle',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Dilated_cardiomyopathy_E00476_(CardioNetworks_ECHOpedia).webm',
    sourceProvider: 'CardioNetworks ECHOpedia / Wikimedia Commons',
    licenseId: 'CC-BY-SA-3.0',
    vrtTicket: '2011102310008874',
    learningFocus: ['lv-global-function', 'chamber-dilation', 'cardiomyopathy-pattern'],
    evidenceState: 'source-page-verified',
    selectionRationale: 'High-yield global LV dysfunction pattern with explicit A4C source description.',
  },
  {
    candidateId: 'echo-a4c-arvd-e00299',
    diagnosisLabel: 'Arrhythmogenic right ventricular dysplasia',
    view: 'A4C',
    sourceDescription: 'A4CH: dilated right ventricle, reduced systolic function',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:ARVD_E00299_(CardioNetworks_ECHOpedia).webm',
    sourceProvider: 'CardioNetworks ECHOpedia / Wikimedia Commons',
    licenseId: 'CC-BY-SA-3.0',
    vrtTicket: '2011102310008874',
    learningFocus: ['rv-size', 'rv-function', 'right-heart-pattern'],
    evidenceState: 'source-page-verified',
    selectionRationale: 'Expands beyond LV-centric training and introduces a high-value right-heart pattern.',
  },
  {
    candidateId: 'echo-a4c-pericardial-effusion-e00674',
    diagnosisLabel: 'Pericardial effusion',
    view: 'A4C',
    sourceDescription: 'A4CH',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Pericardial_effusion_E00674_(CardioNetworks_ECHOpedia).webm',
    sourceProvider: 'CardioNetworks ECHOpedia / Wikimedia Commons',
    licenseId: 'CC-BY-SA-3.0',
    vrtTicket: '2011102310008874',
    learningFocus: ['pericardial-space', 'pattern-recognition', 'a4c-context'],
    evidenceState: 'source-page-verified',
    selectionRationale: 'Adds a non-myocardial pathology with a visually distinct educational target.',
  },
  {
    candidateId: 'echo-a4c-severe-ms-e00613',
    diagnosisLabel: 'Severe mitral stenosis',
    view: 'A4C with Color Doppler',
    sourceDescription: 'A4CH with Color Doppler: high velocity mitral inflow',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Severe_mitral_valve_stenosis_E00613_(CardioNetworks_ECHOpedia).webm',
    sourceProvider: 'CardioNetworks ECHOpedia / Wikimedia Commons',
    licenseId: 'CC-BY-SA-3.0',
    vrtTicket: '2011102310008874',
    learningFocus: ['mitral-valve-disease', 'color-doppler-context', 'stenosis-pattern'],
    evidenceState: 'source-page-verified',
    selectionRationale: 'Introduces valvular stenosis and Doppler interpretation context without requiring quantitative claims.',
  },
  {
    candidateId: 'echo-a4c-flail-mv-e00466',
    diagnosisLabel: 'Flail mitral valve with severe mitral regurgitation',
    view: 'A4C with Color Doppler',
    sourceDescription: 'A4CH: Color Doppler, severe mitral regurgitation, excentric jet',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Flail_of_mitral_valve_E00466_(CardioNetworks_ECHOpedia).webm',
    sourceProvider: 'CardioNetworks ECHOpedia / Wikimedia Commons',
    licenseId: 'CC-BY-SA-3.0',
    vrtTicket: '2011102310008874',
    learningFocus: ['mitral-valve-disease', 'regurgitation-pattern', 'color-doppler-context'],
    evidenceState: 'source-page-verified',
    selectionRationale: 'Mechanistically meaningful MR case with explicit eccentric-jet source description.',
  },
  {
    candidateId: 'echo-a3c-severe-ar-e00234',
    diagnosisLabel: 'Severe aortic regurgitation',
    view: 'A3C with Color Doppler',
    sourceDescription: 'A3CH: Color Doppler, severe aortic regurgitation',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Severe_aortic_regurgitation_E00234_(CardioNetworks_ECHOpedia).webm',
    sourceProvider: 'CardioNetworks ECHOpedia / Wikimedia Commons',
    licenseId: 'CC-BY-SA-3.0',
    vrtTicket: '2011102310008874',
    learningFocus: ['aortic-valve-disease', 'regurgitation-pattern', 'a3c-recognition'],
    evidenceState: 'source-page-verified',
    selectionRationale: 'Adds aortic valve disease and a non-A4C apical view to prevent view overfitting.',
  },
  {
    candidateId: 'echo-psax-severe-as-e00261',
    diagnosisLabel: 'Severe aortic stenosis',
    view: 'PSAX',
    sourceDescription: 'PSAX: stenotic aortic valve',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Severe_aortic_valve_stenosis_E00261_(CardioNetworks_ECHOpedia).webm',
    sourceProvider: 'CardioNetworks ECHOpedia / Wikimedia Commons',
    licenseId: 'CC-BY-SA-3.0',
    vrtTicket: '2011102310008874',
    learningFocus: ['aortic-valve-disease', 'psax-recognition', 'valve-morphology'],
    evidenceState: 'source-page-verified',
    selectionRationale: 'High-yield morphology case with an explicit PSAX source description.',
  },
  {
    candidateId: 'echo-plax-vsd-rtl-e00832',
    diagnosisLabel: 'Large perimembranous VSD with right-to-left shunt',
    view: 'PLAX',
    sourceDescription: 'PLAX: large perimembraneous ventricular septum defect',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Ventricular_septum_defect_with_right_to_left_shunt_E00832_(CardioNetworks_ECHOpedia).webm',
    sourceProvider: 'CardioNetworks ECHOpedia / Wikimedia Commons',
    licenseId: 'CC-BY-SA-3.0',
    vrtTicket: '2011102310008874',
    learningFocus: ['congenital-pattern', 'septal-defect', 'plax-recognition'],
    evidenceState: 'source-page-verified',
    selectionRationale: 'Adds congenital structural pathology and PLAX diversity to the batch.',
  },
] as const

export function validateEchoBatch01CandidateRegistry(candidates = ECHO_BATCH_01_CANDIDATES): void {
  const ids = new Set<string>()
  const pages = new Set<string>()
  for (const candidate of candidates) {
    if (ids.has(candidate.candidateId)) throw new Error(`Duplicate Echo candidateId: ${candidate.candidateId}`)
    if (pages.has(candidate.sourcePageUrl)) throw new Error(`Duplicate Echo candidate source page: ${candidate.sourcePageUrl}`)
    if (!candidate.sourcePageUrl.startsWith('https://commons.wikimedia.org/wiki/File:')) {
      throw new Error(`Echo candidate must preserve a Wikimedia Commons file page: ${candidate.candidateId}`)
    }
    if (candidate.licenseId !== 'CC-BY-SA-3.0' || candidate.vrtTicket !== '2011102310008874') {
      throw new Error(`Echo candidate rights contract mismatch: ${candidate.candidateId}`)
    }
    if (candidate.evidenceState !== 'source-page-verified') {
      throw new Error(`Curated Echo candidate must remain source-page-verified before ingestion: ${candidate.candidateId}`)
    }
    ids.add(candidate.candidateId)
    pages.add(candidate.sourcePageUrl)
  }
}
