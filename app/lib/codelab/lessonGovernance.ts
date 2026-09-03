export const CODE_LAB_SOURCE_LEDGER_SCHEMA_VERSION = 1 as const
export const CODE_LAB_SOURCE_SNAPSHOT_ID = 'codelab-resuscitation-source-snapshot-2026-09-03-v1' as const

export interface CodeLabSourceRecord {
  sourceId: string
  publisher: 'American Heart Association'
  title: string
  versionLabel: '2025'
  url: string
  identityStatus: 'official-source-identity-verified'
  rightsStatus: 'link-only-no-content-reproduction'
  checkedAt: '2026-09-03'
}

export interface CodeLabLessonSourceBinding {
  lessonId: string
  track: 'bls' | 'acls'
  contentVersion: '1.0.0-draft'
  assessmentItemCount: number
  sourceIds: string[]
  mappingStatus: 'provisional-source-family-only'
  clinicalReviewStatus: 'not-reviewed'
  humanReviewRequired: true
}

export const CODE_LAB_SOURCE_RECORDS: readonly CodeLabSourceRecord[] = [
  {
    sourceId: 'aha-2025-cpr-ecc-guidelines',
    publisher: 'American Heart Association',
    title: '2025 AHA Guidelines for CPR and ECC',
    versionLabel: '2025',
    url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines',
    identityStatus: 'official-source-identity-verified',
    rightsStatus: 'link-only-no-content-reproduction',
    checkedAt: '2026-09-03',
  },
  {
    sourceId: 'aha-2025-cpr-ecc-algorithms',
    publisher: 'American Heart Association',
    title: '2025 CPR and ECC Guidelines Algorithms',
    versionLabel: '2025',
    url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/algorithms',
    identityStatus: 'official-source-identity-verified',
    rightsStatus: 'link-only-no-content-reproduction',
    checkedAt: '2026-09-03',
  },
  {
    sourceId: 'aha-2025-adult-advanced-life-support',
    publisher: 'American Heart Association',
    title: 'Part 9: Adult Advanced Life Support',
    versionLabel: '2025',
    url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support',
    identityStatus: 'official-source-identity-verified',
    rightsStatus: 'link-only-no-content-reproduction',
    checkedAt: '2026-09-03',
  },
] as const

const BLS_LESSON_IDS = [
  'bls_01_chain',
  'bls_02_compressions',
  'bls_03_ventilations',
  'bls_04_aed',
  'bls_05_airway',
  'bls_06_team',
] as const

const ACLS_LESSON_IDS = [
  'acls_01_systematic',
  'acls_02_vf_vt',
  'acls_03_pea_asystole',
  'acls_04_bradycardia',
  'acls_05_tachycardia',
  'acls_06_post_rosc',
] as const

const ASSESSMENT_ITEM_COUNTS: Readonly<Record<string, number>> = {
  bls_01_chain: 2,
  bls_02_compressions: 2,
  bls_03_ventilations: 2,
  bls_04_aed: 2,
  bls_05_airway: 2,
  bls_06_team: 1,
  acls_01_systematic: 3,
  acls_02_vf_vt: 3,
  acls_03_pea_asystole: 3,
  acls_04_bradycardia: 3,
  acls_05_tachycardia: 3,
  acls_06_post_rosc: 3,
}

function createBinding(
  lessonId: string,
  track: CodeLabLessonSourceBinding['track'],
  sourceIds: string[],
): CodeLabLessonSourceBinding {
  return {
    lessonId,
    track,
    contentVersion: '1.0.0-draft',
    assessmentItemCount: ASSESSMENT_ITEM_COUNTS[lessonId] ?? 0,
    sourceIds,
    mappingStatus: 'provisional-source-family-only',
    clinicalReviewStatus: 'not-reviewed',
    humanReviewRequired: true,
  }
}

export const CODE_LAB_LESSON_SOURCE_BINDINGS: readonly CodeLabLessonSourceBinding[] = [
  ...BLS_LESSON_IDS.map(lessonId => createBinding(lessonId, 'bls', [
    'aha-2025-cpr-ecc-guidelines',
    'aha-2025-cpr-ecc-algorithms',
  ])),
  ...ACLS_LESSON_IDS.map(lessonId => createBinding(lessonId, 'acls', [
    'aha-2025-cpr-ecc-guidelines',
    'aha-2025-cpr-ecc-algorithms',
    'aha-2025-adult-advanced-life-support',
  ])),
] as const

export function getCodeLabLessonSourceBinding(lessonId: string): CodeLabLessonSourceBinding | null {
  return CODE_LAB_LESSON_SOURCE_BINDINGS.find(binding => binding.lessonId === lessonId) ?? null
}

export function getCodeLabLessonSources(lessonId: string): CodeLabSourceRecord[] {
  const binding = getCodeLabLessonSourceBinding(lessonId)
  if (!binding) return []
  return binding.sourceIds.flatMap(sourceId => {
    const source = CODE_LAB_SOURCE_RECORDS.find(item => item.sourceId === sourceId)
    return source ? [source] : []
  })
}
