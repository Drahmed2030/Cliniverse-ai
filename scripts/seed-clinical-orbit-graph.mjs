#!/usr/bin/env node
// Deterministic seed/reconciliation for the Clinical Orbit graph
// (public.kg_nodes / public.kg_edges), extending Batch 4's catalog.
//
// Reads app/lib/clinicalOrbitGraphSeed.ts (node_key-based, no DB ids baked
// in) and:
//   1. Resolves each content node's catalogRef to a real
//      clinical_content_catalog.id (fails closed if a referenced catalog
//      item doesn't exist — never inserts a dangling content_catalog_id).
//   2. Upserts nodes keyed on metadata->>'node_key' (the DB enforces
//      uniqueness; this script also reads existing rows first so re-running
//      it updates in place rather than erroring).
//   3. Upserts edges keyed on (source_node_id, target_node_id,
//      relationship) after resolving node_key -> id for both ends.
//
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Never falls back to
// the anon key. Run --dry-run first.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-clinical-orbit-graph.mjs [--dry-run]

import { createClient } from '@supabase/supabase-js'
import { CLINICAL_ORBIT_NODE_SEED, CLINICAL_ORBIT_EDGE_SEED } from '../app/lib/clinicalOrbitGraphSeed.ts'

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

// Manifest self-checks before touching the database.
const seenNodeKeys = new Set()
for (const node of CLINICAL_ORBIT_NODE_SEED) {
  if (seenNodeKeys.has(node.nodeKey)) block(`duplicate node_key in the seed manifest itself: ${node.nodeKey}`)
  seenNodeKeys.add(node.nodeKey)
}
for (const edge of CLINICAL_ORBIT_EDGE_SEED) {
  if (!seenNodeKeys.has(edge.sourceNodeKey)) block(`edge references unknown source node_key: ${edge.sourceNodeKey}`)
  if (!seenNodeKeys.has(edge.targetNodeKey)) block(`edge references unknown target node_key: ${edge.targetNodeKey}`)
}

console.log(`Seed manifest: ${CLINICAL_ORBIT_NODE_SEED.length} nodes, ${CLINICAL_ORBIT_EDGE_SEED.length} edges.`)

if (dryRun) {
  console.log('--dry-run: no writes performed. Manifest validated only.')
  process.exit(0)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

// Resolve each content node's catalogRef to a real catalog row id. Fails
// closed on any node whose referenced catalog item can't be found — this
// script never invents a content_catalog_id.
const { data: catalogRows, error: catalogError } = await supabase
  .from('clinical_content_catalog')
  .select('id, module, content_type, source_key')

if (catalogError) { console.error('Failed to read clinical_content_catalog:', catalogError.message); process.exit(1) }

function findCatalogId(ref) {
  if (!ref) return null
  const row = catalogRows.find(r => r.module === ref.module && r.content_type === ref.contentType && r.source_key === ref.sourceKey)
  if (!row) block(`node references a catalog item that does not exist in Supabase: ${ref.module}/${ref.contentType}/${ref.sourceKey} — apply and seed the Batch 4 catalog migration first`)
  return row.id
}

const { data: existingNodes, error: existingNodesError } = await supabase
  .from('kg_nodes')
  .select('id, metadata')

if (existingNodesError) { console.error('Failed to read kg_nodes:', existingNodesError.message); process.exit(1) }

const existingByKey = new Map(
  (existingNodes ?? [])
    .filter(row => row.metadata?.node_key)
    .map(row => [row.metadata.node_key, row.id]),
)

const nodeKeyToId = new Map()
let nodesCreated = 0
let nodesUpdated = 0

for (const node of CLINICAL_ORBIT_NODE_SEED) {
  const contentCatalogId = findCatalogId(node.catalogRef)
  const row = {
    node_type: node.nodeType,
    label: node.label,
    normalized_code: node.normalizedCode ?? null,
    content_catalog_id: contentCatalogId,
    metadata: { node_key: node.nodeKey, ...(node.metadata ?? {}) },
  }

  const existingId = existingByKey.get(node.nodeKey)
  if (existingId) {
    const { error } = await supabase.from('kg_nodes').update(row).eq('id', existingId)
    if (error) { console.error(`Failed to update node ${node.nodeKey}:`, error.message); process.exit(1) }
    nodeKeyToId.set(node.nodeKey, existingId)
    nodesUpdated += 1
  } else {
    const { data, error } = await supabase.from('kg_nodes').insert(row).select('id').single()
    if (error) { console.error(`Failed to insert node ${node.nodeKey}:`, error.message); process.exit(1) }
    nodeKeyToId.set(node.nodeKey, data.id)
    nodesCreated += 1
  }
}

console.log(`Nodes: ${nodesCreated} created, ${nodesUpdated} updated.`)

const { data: existingEdges, error: existingEdgesError } = await supabase
  .from('kg_edges')
  .select('id, source_node_id, target_node_id, relationship')

if (existingEdgesError) { console.error('Failed to read kg_edges:', existingEdgesError.message); process.exit(1) }

const existingEdgeKey = (sourceId, targetId, relationship) => `${sourceId}::${targetId}::${relationship}`
const existingEdgesByKey = new Map(
  (existingEdges ?? []).map(row => [existingEdgeKey(row.source_node_id, row.target_node_id, row.relationship), row.id]),
)

let edgesCreated = 0
let edgesUpdated = 0

for (const edge of CLINICAL_ORBIT_EDGE_SEED) {
  const sourceId = nodeKeyToId.get(edge.sourceNodeKey)
  const targetId = nodeKeyToId.get(edge.targetNodeKey)
  const row = {
    source_node_id: sourceId,
    target_node_id: targetId,
    relationship: edge.relation,
    confidence: edge.confidence ?? null,
    provenance_ref: edge.provenanceRef,
    evidence_status: edge.evidenceStatus,
  }

  const key = existingEdgeKey(sourceId, targetId, edge.relation)
  const existingId = existingEdgesByKey.get(key)
  if (existingId) {
    const { error } = await supabase.from('kg_edges').update(row).eq('id', existingId)
    if (error) { console.error(`Failed to update edge ${edge.sourceNodeKey} -> ${edge.targetNodeKey}:`, error.message); process.exit(1) }
    edgesUpdated += 1
  } else {
    const { error } = await supabase.from('kg_edges').insert(row)
    if (error) { console.error(`Failed to insert edge ${edge.sourceNodeKey} -> ${edge.targetNodeKey}:`, error.message); process.exit(1) }
    edgesCreated += 1
  }
}

console.log(`Edges: ${edgesCreated} created, ${edgesUpdated} updated.`)

// Verify writes by reading them back — per CLAUDE.md's own RLS lesson, never
// trust a clean response alone.
const { count: nodeCount, error: nodeCountError } = await supabase
  .from('kg_nodes')
  .select('id', { count: 'exact', head: true })
const { count: edgeCount, error: edgeCountError } = await supabase
  .from('kg_edges')
  .select('id', { count: 'exact', head: true })

if (nodeCountError || edgeCountError) {
  console.error('Post-write verification read failed:', nodeCountError?.message, edgeCountError?.message)
  process.exit(1)
}

if ((nodeCount ?? 0) < CLINICAL_ORBIT_NODE_SEED.length || (edgeCount ?? 0) < CLINICAL_ORBIT_EDGE_SEED.length) {
  block(`post-write read found ${nodeCount} nodes / ${edgeCount} edges, expected at least ${CLINICAL_ORBIT_NODE_SEED.length} / ${CLINICAL_ORBIT_EDGE_SEED.length}.`)
}

console.log(`Verified: ${nodeCount} total nodes, ${edgeCount} total edges present.`)
