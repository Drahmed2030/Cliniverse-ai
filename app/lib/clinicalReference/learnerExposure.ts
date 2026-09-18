import { CLINICAL_CONTENT_CATALOG_SEED, type ClinicalContentCatalogSeedItem } from '../contentCatalogSeed.ts'
import { isAvailable } from '../contentCatalogQueries.ts'

// learnerExposure — Batch 8 fix. Registry presence (a calculator, drug
// identity, dosing rule, or interaction rule existing in
// app/lib/clinicalReference/*) is necessary but NEVER sufficient for
// learner exposure. The Batch 4 clinical_content_catalog readiness gate
// is the sole authority on what a learner may open or use — this file
// does not reimplement that gate, it only looks up the right catalog row
// by source_key and calls the existing isAvailable() from
// contentCatalogQueries.ts. Every reference UI surface must go through
// this, never query a clinicalReference/* registry's own reviewStatus/
// learnerReadiness field to decide what to show a learner (those fields
// describe the registry's own governance state, not learner exposure —
// see calculatorContract.ts's own header for that distinction).

export function findReferenceCatalogItem(
  sourceKey: string,
  catalog: readonly ClinicalContentCatalogSeedItem[] = CLINICAL_CONTENT_CATALOG_SEED,
): ClinicalContentCatalogSeedItem | null {
  return catalog.find(item => item.source_key === sourceKey) ?? null
}

/** Fails closed: a sourceKey with no matching catalog row is never learner-ready, regardless of what the registry itself claims. */
export function isReferenceItemLearnerReady(
  sourceKey: string,
  catalog: readonly ClinicalContentCatalogSeedItem[] = CLINICAL_CONTENT_CATALOG_SEED,
): boolean {
  const item = findReferenceCatalogItem(sourceKey, catalog)
  if (!item) return false
  return isAvailable(item)
}
