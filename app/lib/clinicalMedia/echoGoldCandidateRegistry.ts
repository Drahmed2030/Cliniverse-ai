export type EchoGoldCandidateDisposition = 'reject' | 'hold' | 'pathology-only' | 'gold-review'

export interface EchoGoldCandidateRecord {
  candidateId: string
  sourcePageUrl: string
  publishedYear: number
  license: string
  commercialReuse: boolean
  normalReferenceEligible: boolean
  view: 'A4C'
  temporalQualityNote: string
  disposition: EchoGoldCandidateDisposition
  reason: string
}

export const ECHO_A4C_GOLD_CANDIDATES: readonly EchoGoldCandidateRecord[] = [
  {
    candidateId: 'frontiers-image-perception-a4c-60fps-2022',
    sourcePageUrl: 'https://www.frontiersin.org/journals/medicine/articles/10.3389/fmed.2022.850555/full',
    publishedYear: 2022,
    license: 'CC-BY',
    commercialReuse: true,
    normalReferenceEligible: false,
    view: 'A4C',
    temporalQualityNote: 'Supplementary A4C background explicitly demonstrated at 60 fps.',
    disposition: 'reject',
    reason: 'Purpose-built moving red-line overlay makes the clip unsuitable as a clean normal Gold visual reference despite strong temporal quality and permissive rights.',
  },
  {
    candidateId: 'nature-wearable-apical-4ch-2023',
    sourcePageUrl: 'https://doi.org/10.1038/s41586-022-05498-z',
    publishedYear: 2023,
    license: 'CC-BY-4.0',
    commercialReuse: true,
    normalReferenceEligible: true,
    view: 'A4C',
    temporalQualityNote: 'Original Supplementary Video 2 measured: H.264, 512x640, 24 fps, 222 frames, 9.25 seconds; continuous timestamps do not establish native acquisition fidelity.',
    disposition: 'reject',
    reason: 'Media laboratory reviewed all 222 frames of Supplementary Video 2: split A4C/A2C panels, research axes, 512x640 container at 24 fps, and a silent AAC track. Reject this presentation as Normal Gold; clinical approval and isolated native cine remain outstanding.',
  },
  {
    candidateId: 'robotic-a4c-acquisition-2026',
    sourcePageUrl: 'https://doi.org/10.1007/s11548-026-03766-1',
    publishedYear: 2026,
    license: 'CC-BY-4.0',
    commercialReuse: true,
    normalReferenceEligible: true,
    view: 'A4C',
    temporalQualityNote: '2026 proof-of-concept robotic acquisition in five subjects; reported image-quality score 68.0% ± 7.6%.',
    disposition: 'hold',
    reason: 'The article is current and permissively licensed, but a reusable source cine with sufficient visual quality has not yet been verified from the publication assets.',
  },
  {
    candidateId: 'echonet-dynamic-normal-a4c',
    sourcePageUrl: 'https://echonet.github.io/dynamic/',
    publishedYear: 2020,
    license: 'research-use-agreement',
    commercialReuse: false,
    normalReferenceEligible: true,
    view: 'A4C',
    temporalQualityNote: 'Large modern clinical A4C dataset acquired 2016-2018.',
    disposition: 'reject',
    reason: 'Dataset agreement expressly prohibits commercial use, redistribution and derivative works.',
  },
  {
    candidateId: 'cardiacnet-pah-asd-a4c',
    sourcePageUrl: 'https://www.kaggle.com/datasets/xiaoweixumedicalai/abnormcardiacechovideos',
    publishedYear: 2024,
    license: 'CC-BY-4.0',
    commercialReuse: true,
    normalReferenceEligible: false,
    view: 'A4C',
    temporalQualityNote: '800x600 or 1024x768 videos, over 100 frames and at least two cardiac cycles, physician-reviewed.',
    disposition: 'pathology-only',
    reason: 'Excellent future pathology-batch candidate, but dataset is PAH/ASD focused and therefore not appropriate as the Normal A4C Gold reference.',
  },
] as const

export function validateEchoGoldCandidateRegistry(): void {
  const ids = new Set<string>()
  const urls = new Set<string>()
  for (const candidate of ECHO_A4C_GOLD_CANDIDATES) {
    if (ids.has(candidate.candidateId)) throw new Error(`Duplicate Echo Gold candidate id: ${candidate.candidateId}`)
    if (urls.has(candidate.sourcePageUrl)) throw new Error(`Duplicate Echo Gold source page: ${candidate.sourcePageUrl}`)
    if (candidate.disposition === 'gold-review' && (!candidate.commercialReuse || !candidate.normalReferenceEligible)) {
      throw new Error(`Gold review candidate must be commercially reusable and normal-reference eligible: ${candidate.candidateId}`)
    }
    ids.add(candidate.candidateId)
    urls.add(candidate.sourcePageUrl)
  }
}
