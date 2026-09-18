import { supabase } from '../supabase'
import { getAllCatalogItems, type CatalogItem } from './contentCatalog'
import { CLINICAL_ORBIT_NODE_SEED, CLINICAL_ORBIT_EDGE_SEED } from './clinicalOrbitGraphSeed'
import type { ClinicalOrbitNode, ClinicalOrbitEdge } from './clinicalOrbitGraphModel'
import {
  type ClinicalOrbitGraph,
  type OrbitQueryOptions,
  type OrbitNeighbor,
  type OrbitPathStep,
  getOrbitCenter as pureGetOrbitCenter,
  getOrbitNeighbors as pureGetOrbitNeighbors,
  getRelatedContent as pureGetRelatedContent,
  getOrbitPath as pureGetOrbitPath,
  getOrbitBreadcrumbs as pureGetOrbitBreadcrumbs,
  resolveContentRoute as pureResolveContentRoute,
} from './clinicalOrbitGraphQueries'

// Typed boundary over the Clinical Orbit graph (public.kg_nodes /
// public.kg_edges, extended in Batch 5 with content_catalog_id / provenance
// / evidence_status — see supabase/drafts/clinical_orbit_graph_v1.sql). No
// component should query kg_nodes/kg_edges directly; everything goes
// through the functions below.
//
// Same Supabase-or-fallback shape as app/lib/contentCatalog.ts: where the
// live tables are reachable, real rows are read (joined back to
// clinical_content_catalog to reconstruct each content node's catalogRef);
// everywhere else — including this sandbox — it falls back to
// clinicalOrbitGraphSeed.ts, the exact manifest scripts/seed-clinical-orbit-graph.mjs
// upserts. There is deliberately no second, independently-maintained graph.

export type { ClinicalOrbitGraph, OrbitQueryOptions, OrbitNeighbor, OrbitPathStep }
export type { ClinicalOrbitNode, ClinicalOrbitEdge }

let cachedGraph: ClinicalOrbitGraph | null = null
let cachedCatalog: CatalogItem[] | null = null
let graphSource: 'supabase' | 'local-fallback' | null = null

async function loadGraphAndCatalog(): Promise<{ graph: ClinicalOrbitGraph; catalog: CatalogItem[] }> {
  const catalog = cachedCatalog ?? (cachedCatalog = await getAllCatalogItems())
  if (cachedGraph) return { graph: cachedGraph, catalog }

  try {
    const [{ data: nodeRows, error: nodeError }, { data: edgeRows, error: edgeError }] = await Promise.all([
      supabase.from('kg_nodes').select('id,node_type,label,normalized_code,metadata,content_catalog_id'),
      supabase.from('kg_edges').select('source_node_id,target_node_id,relationship,confidence,provenance_ref,evidence_status'),
    ])

    if (nodeError || edgeError || !nodeRows || !edgeRows) throw nodeError ?? edgeError ?? new Error('no data')

    const idToNodeKey = new Map<number, string>()
    const nodes: ClinicalOrbitNode[] = nodeRows.map((row: any) => {
      const nodeKey: string = row.metadata?.node_key ?? `kg:${row.id}`
      idToNodeKey.set(row.id, nodeKey)
      const catalogItem = row.content_catalog_id ? catalog.find(c => c.id === row.content_catalog_id) : null
      return {
        nodeKey,
        nodeType: row.node_type,
        label: row.label,
        normalizedCode: row.normalized_code,
        catalogRef: catalogItem ? { module: catalogItem.module, contentType: catalogItem.content_type, sourceKey: catalogItem.source_key } : null,
        metadata: row.metadata,
      }
    })

    const edges: ClinicalOrbitEdge[] = edgeRows
      .filter((row: any) => idToNodeKey.has(row.source_node_id) && idToNodeKey.has(row.target_node_id))
      .map((row: any) => ({
        sourceNodeKey: idToNodeKey.get(row.source_node_id)!,
        targetNodeKey: idToNodeKey.get(row.target_node_id)!,
        relation: row.relationship,
        provenanceRef: row.provenance_ref ?? 'unknown',
        evidenceStatus: row.evidence_status ?? 'unverified',
        confidence: row.confidence,
      }))

    cachedGraph = { nodes, edges }
    graphSource = 'supabase'
    return { graph: cachedGraph, catalog }
  } catch {
    cachedGraph = { nodes: CLINICAL_ORBIT_NODE_SEED, edges: CLINICAL_ORBIT_EDGE_SEED }
    graphSource = 'local-fallback'
    return { graph: cachedGraph, catalog }
  }
}

/** Test/debug only. */
export function _resetClinicalOrbitCacheForTests(): void {
  cachedGraph = null
  cachedCatalog = null
  graphSource = null
}

export function getClinicalOrbitSource(): 'supabase' | 'local-fallback' | null {
  return graphSource
}

export async function getOrbitCenter(nodeKey: string, options?: OrbitQueryOptions): Promise<ClinicalOrbitNode | null> {
  const { graph, catalog } = await loadGraphAndCatalog()
  return pureGetOrbitCenter(graph, catalog, nodeKey, options)
}

export async function getOrbitNeighbors(centerNodeKey: string, options?: OrbitQueryOptions): Promise<OrbitNeighbor[]> {
  const { graph, catalog } = await loadGraphAndCatalog()
  return pureGetOrbitNeighbors(graph, catalog, centerNodeKey, options)
}

export async function getRelatedContent(centerNodeKey: string, options?: OrbitQueryOptions): Promise<OrbitNeighbor[]> {
  const { graph, catalog } = await loadGraphAndCatalog()
  return pureGetRelatedContent(graph, catalog, centerNodeKey, options)
}

export async function getOrbitPath(nodeKeyPath: string[], options?: OrbitQueryOptions): Promise<OrbitPathStep[]> {
  const { graph, catalog } = await loadGraphAndCatalog()
  return pureGetOrbitPath(graph, catalog, nodeKeyPath, options)
}

export async function getOrbitBreadcrumbs(nodeKeyPath: string[], options?: OrbitQueryOptions): Promise<ClinicalOrbitNode[]> {
  const { graph, catalog } = await loadGraphAndCatalog()
  return pureGetOrbitBreadcrumbs(graph, catalog, nodeKeyPath, options)
}

/** Resolves a content node's real catalog route — null if the node has no catalogRef, the catalog item can't be found, or the route is API-only with no learner-facing UI. */
export async function resolveOrbitContentRoute(node: ClinicalOrbitNode): Promise<string | null> {
  if (!node.catalogRef) return null
  const catalog = cachedCatalog ?? (cachedCatalog = await getAllCatalogItems())
  const item = catalog.find(c => c.module === node.catalogRef!.module && c.content_type === node.catalogRef!.contentType && c.source_key === node.catalogRef!.sourceKey) ?? null
  return pureResolveContentRoute(item)
}
