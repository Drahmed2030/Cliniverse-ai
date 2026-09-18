import type { ClinicalContentCatalogSeedItem, AccessTier } from './contentCatalogSeed'

// Pure functions only — no Supabase, no network, no caching. Operates on
// whatever item array it's given. app/lib/contentCatalog.ts wraps these with
// the async "fetch from Supabase, fall back to the seed manifest" logic;
// these are what's actually under test in
// tests/clinical-content-catalog-contract.test.mjs, since exercising the
// network-touching wrapper directly would make the test suite depend on
// live Supabase reachability, which this sandbox doesn't have (see
// tests/auth-identity-session-contract.test.mjs's identity.ts precedent for
// why Supabase-touching modules in this repo are tested at the boundary,
// not by executing the network call).

export type CatalogItem = ClinicalContentCatalogSeedItem

export interface CatalogQueryOptions {
  module?: string
  accessTier?: AccessTier
}

export function isAvailable(item: CatalogItem): boolean {
  return item.visibility === 'visible' && item.readiness === 'ready'
}

export function applyFilters(items: CatalogItem[], options?: CatalogQueryOptions): CatalogItem[] {
  return items.filter(item =>
    (!options?.module || item.module === options.module) &&
    (!options?.accessTier || item.access_tier === options.accessTier),
  )
}

/** Items a learner can actually see and use right now — visible AND ready. Never includes review_required, media_pending, or labs-readiness items. */
export function filterVisibleContent(items: CatalogItem[], options?: CatalogQueryOptions): CatalogItem[] {
  return applyFilters(items.filter(isAvailable), options)
}

export function countVisibleContent(items: CatalogItem[], options?: CatalogQueryOptions): number {
  return filterVisibleContent(items, options).length
}

/** Distinct categories among currently-available items. */
export function countAvailableGroups(items: CatalogItem[], options?: CatalogQueryOptions): number {
  const visible = filterVisibleContent(items, options)
  return new Set(visible.map(item => item.category).filter((c): c is string => Boolean(c))).size
}

/** Content that is production-quality (readiness='ready'), regardless of current visibility. */
export function countReadyContent(items: CatalogItem[], options?: CatalogQueryOptions): number {
  return applyFilters(items.filter(item => item.readiness === 'ready'), options).length
}

export function countProContent(items: CatalogItem[], options?: Omit<CatalogQueryOptions, 'accessTier'>): number {
  return filterVisibleContent(items, { ...options, accessTier: 'pro' }).length
}

/** All items in a module, any readiness/visibility — the full picture, not just what's available. */
export function filterByModule(items: CatalogItem[], module: string): CatalogItem[] {
  return items.filter(item => item.module === module)
}

export function filterByAccessTier(items: CatalogItem[], accessTier: AccessTier, options?: Omit<CatalogQueryOptions, 'accessTier'>): CatalogItem[] {
  return filterVisibleContent(items, { ...options, accessTier })
}
