#!/usr/bin/env node
// Deterministic seed/reconciliation for public.clinical_content_catalog.
//
// Reads app/lib/contentCatalogSeed.ts (the single source of truth also used
// by the app's local fallback — see app/lib/contentCatalog.ts) and upserts
// every item into Supabase, keyed on (module, content_type, source_key) —
// the same unique constraint the migration defines. Running this twice is a
// no-op the second time; nothing here appends duplicate rows.
//
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.
// Never run this against production without the same migration-window
// discipline as the migration itself — this script performs real writes.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-clinical-content-catalog.mjs [--dry-run]

import { createClient } from '@supabase/supabase-js'
import { CLINICAL_CONTENT_CATALOG_SEED } from '../app/lib/contentCatalogSeed.ts'

function block(message) {
  console.error(`RC BLOCKED: ${message}`)
  process.exit(2)
}

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const dryRun = process.argv.includes('--dry-run')

if (!supabaseUrl || !serviceRoleKey) {
  block('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set. This script never falls back to the anon key.')
}

const seenKeys = new Set()
for (const item of CLINICAL_CONTENT_CATALOG_SEED) {
  const key = `${item.module}::${item.content_type}::${item.source_key}`
  if (seenKeys.has(key)) block(`duplicate (module, content_type, source_key) in the seed manifest itself: ${key}`)
  seenKeys.add(key)
}

console.log(`Seed manifest: ${CLINICAL_CONTENT_CATALOG_SEED.length} items.`)

if (dryRun) {
  console.log('--dry-run: no writes performed. Manifest validated only.')
  process.exit(0)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

const rows = CLINICAL_CONTENT_CATALOG_SEED.map(item => ({
  source_key: item.source_key,
  module: item.module,
  content_type: item.content_type,
  title: item.title,
  category: item.category ?? null,
  access_tier: item.access_tier,
  visibility: item.visibility,
  readiness: item.readiness,
  route: item.route ?? null,
  provenance_ref: item.provenance_ref,
  source_revision: item.source_revision ?? null,
  sort_order: item.sort_order ?? 0,
}))

const { data, error } = await supabase
  .from('clinical_content_catalog')
  .upsert(rows, { onConflict: 'module,content_type,source_key' })
  .select('id,module,content_type,source_key')

if (error) {
  console.error('Upsert failed:', error.message)
  process.exit(1)
}

console.log(`Upserted ${data?.length ?? 0} rows.`)

// Verify writes by reading them back — per CLAUDE.md's own RLS lesson, never
// trust a clean response alone.
const { data: verify, error: verifyError } = await supabase
  .from('clinical_content_catalog')
  .select('module,content_type,source_key', { count: 'exact' })

if (verifyError) {
  console.error('Post-write verification read failed:', verifyError.message)
  process.exit(1)
}

if ((verify?.length ?? 0) < CLINICAL_CONTENT_CATALOG_SEED.length) {
  block(`post-write read returned ${verify?.length ?? 0} rows, expected at least ${CLINICAL_CONTENT_CATALOG_SEED.length}.`)
}

console.log(`Verified: ${verify.length} total rows present in clinical_content_catalog.`)
