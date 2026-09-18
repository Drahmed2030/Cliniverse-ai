import { supabase } from '../supabase'
import { CLINICAL_CONTENT_CATALOG_SEED, type AccessTier } from './contentCatalogSeed'
import {
  type CatalogItem,
  type CatalogQueryOptions,
  filterVisibleContent,
  countVisibleContent,
  countAvailableGroups,
  countReadyContent,
  countProContent,
  filterByModule,
  filterByAccessTier,
} from './contentCatalogQueries'

// Typed boundary over public.clinical_content_catalog. The UI must never
// query the raw table shape or the seed manifest directly — everything goes
// through the functions below, so there is exactly one place that knows
// what "available" means. See docs/CLINICAL_CONTENT_CATALOG_V1.md.
//
// The catalog migration (supabase/drafts/clinical_content_catalog_v1.sql)
// is applied and truth-match verified (71/71, zero drift) on Supabase
// staging (xhwotblarwsxoanpiloe) as of 2026-09-18, seeded from
// CLINICAL_CONTENT_CATALOG_SEED via scripts/seed-clinical-content-catalog.mjs.
// It has NOT been applied to production. In any environment where the real
// table is reachable (staging today; production once promoted), calls below
// read from Supabase directly; everywhere else — including this sandbox,
// which has no Supabase network access at all — they transparently fall
// back to CLINICAL_CONTENT_CATALOG_SEED, the exact same manifest the seed
// script upserts. There is deliberately no second, independently-maintained
// set of numbers, so the two paths can never silently disagree.
//
// The actual filtering/counting logic lives in contentCatalogQueries.ts as
// plain, network-free functions — this file only decides which item array
// to hand them.

export type { CatalogItem, CatalogQueryOptions }

let cachedItems: CatalogItem[] | null = null
let cacheSource: 'supabase' | 'local-fallback' | null = null

async function loadAllItems(): Promise<CatalogItem[]> {
  if (cachedItems) return cachedItems

  try {
    const { data, error } = await supabase
      .from('clinical_content_catalog')
      .select('id,source_key,module,content_type,title,category,access_tier,visibility,readiness,route,provenance_ref,source_revision,sort_order')
      .order('sort_order', { ascending: true })

    if (error || !data) throw error ?? new Error('no data')

    cachedItems = data as CatalogItem[]
    cacheSource = 'supabase'
    return cachedItems
  } catch {
    // Table not yet promoted to this environment, RLS not yet applied, or
    // any other transient failure — fall back to the local manifest rather
    // than surfacing an error to the learner-facing UI.
    cachedItems = [...CLINICAL_CONTENT_CATALOG_SEED].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    cacheSource = 'local-fallback'
    return cachedItems
  }
}

/** Test/debug only — forces the next call to re-resolve instead of using the cache. */
export function _resetContentCatalogCacheForTests(): void {
  cachedItems = null
  cacheSource = null
}

/** Which source actually answered the last query — 'supabase' or 'local-fallback'. Null before any query has run. */
export function getContentCatalogSource(): 'supabase' | 'local-fallback' | null {
  return cacheSource
}

/** The full, unfiltered catalog — for callers that need to cross-reference against it themselves, e.g. app/lib/clinicalOrbit.ts resolving a graph node's catalogRef. Most callers should use one of the filtered functions below instead. */
export async function getAllCatalogItems(): Promise<CatalogItem[]> {
  return loadAllItems()
}

export async function getVisibleContent(options?: CatalogQueryOptions): Promise<CatalogItem[]> {
  return filterVisibleContent(await loadAllItems(), options)
}

export async function getVisibleCaseCount(options?: CatalogQueryOptions): Promise<number> {
  return countVisibleContent(await loadAllItems(), options)
}

export async function getAvailableGroupCount(options?: CatalogQueryOptions): Promise<number> {
  return countAvailableGroups(await loadAllItems(), options)
}

export async function getReadyContentCount(options?: CatalogQueryOptions): Promise<number> {
  return countReadyContent(await loadAllItems(), options)
}

export async function getProContentCount(options?: Omit<CatalogQueryOptions, 'accessTier'>): Promise<number> {
  return countProContent(await loadAllItems(), options)
}

export async function getContentByModule(module: string): Promise<CatalogItem[]> {
  return filterByModule(await loadAllItems(), module)
}

export async function getContentByAccessTier(accessTier: AccessTier, options?: Omit<CatalogQueryOptions, 'accessTier'>): Promise<CatalogItem[]> {
  return filterByAccessTier(await loadAllItems(), accessTier, options)
}
