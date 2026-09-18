import { countByContentType, type CatalogItem } from '../contentCatalogQueries.ts'
import { ECHO_STUDY_RECORD_SEED, type EchoStudyRecord } from './echoStudyRecord.ts'

// EchoAtlasMetrics — Batch 6, Section 12. Truthful derived counts for the
// Echo Intelligence Atlas. Nothing here is hardcoded: every number is
// derived from the catalog (cine/phenotype/activity content_type rows,
// spanning the 'echo' and 'echo_batch20' modules) or from
// ECHO_STUDY_RECORD_SEED (studies). study_count and cine_count are
// deliberately kept separate — a study can exist (DCM, HCM) with zero
// playable cines. Nothing here is counted as a generic "case".

export interface EchoAtlasMetrics {
  studyCount: number
  cineCount: number
  phenotypeCount: number
  activityCount: number
}

const ECHO_MODULES = ['echo', 'echo_batch20'] as const

function inEchoModules(items: CatalogItem[]): CatalogItem[] {
  return items.filter(item => (ECHO_MODULES as readonly string[]).includes(item.module))
}

export function deriveEchoAtlasMetrics(
  catalog: CatalogItem[],
  studyRecords: readonly EchoStudyRecord[] = ECHO_STUDY_RECORD_SEED,
): EchoAtlasMetrics {
  const echoItems = inEchoModules(catalog)
  return {
    studyCount: studyRecords.length,
    cineCount: countByContentType(echoItems, 'cine'),
    phenotypeCount: countByContentType(echoItems, 'phenotype'),
    activityCount: countByContentType(echoItems, 'activity'),
  }
}
