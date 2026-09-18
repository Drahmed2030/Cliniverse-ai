import type { ClinicalOrbitNode, ClinicalOrbitEdge } from './clinicalOrbitGraphModel'
import { isAvailable as isCatalogItemAvailable, type CatalogItem } from './contentCatalogQueries.ts'

// Pure functions only — no Supabase, no network, no caching. Mirrors the
// contentCatalogQueries.ts pattern: app/lib/clinicalOrbit.ts wraps these
// with the async "fetch from Supabase, fall back to the seed manifest"
// logic; these are what's actually under test, since exercising the
// network-touching wrapper directly would depend on live Supabase
// reachability this sandbox doesn't have.

export interface ClinicalOrbitGraph {
  nodes: ClinicalOrbitNode[]
  edges: ClinicalOrbitEdge[]
}

export interface OrbitQueryOptions {
  /** The ONLY way hidden/review_required/media_pending/labs content, or a pending_review/unverified edge, is ever returned. Defaults to false (learner scope) everywhere in this app except an explicitly reviewer/labs-gated surface. */
  reviewerScope?: boolean
  /** Hard cap on returned neighbors — the whole graph is never sent to the client. */
  maxNeighbors?: number
}

const DEFAULT_MAX_NEIGHBORS = 6

function findCatalogItem(
  catalog: CatalogItem[],
  ref: { module: string; contentType: string; sourceKey: string } | null | undefined,
): CatalogItem | null {
  if (!ref) return null
  return catalog.find(c => c.module === ref.module && c.content_type === ref.contentType && c.source_key === ref.sourceKey) ?? null
}

/** Concept nodes (no catalogRef) have no readiness gate of their own and are always available. A content node with a catalogRef that can't be resolved fails closed — never shown, not even to reviewers, since it would be a dangling/unverifiable reference. */
export function isNodeAvailable(node: ClinicalOrbitNode, catalog: CatalogItem[], reviewerScope: boolean): boolean {
  if (!node.catalogRef) return true
  const item = findCatalogItem(catalog, node.catalogRef)
  if (!item) return false
  if (reviewerScope) return true
  return isCatalogItemAvailable(item)
}

export function getOrbitCenter(
  graph: ClinicalOrbitGraph,
  catalog: CatalogItem[],
  nodeKey: string,
  options?: OrbitQueryOptions,
): ClinicalOrbitNode | null {
  const node = graph.nodes.find(n => n.nodeKey === nodeKey)
  if (!node) return null
  if (!isNodeAvailable(node, catalog, options?.reviewerScope ?? false)) return null
  return node
}

export interface OrbitNeighbor {
  node: ClinicalOrbitNode
  edge: ClinicalOrbitEdge
  direction: 'outgoing' | 'incoming'
}

/**
 * Default query depth is always exactly 1 hop — this function has no
 * recursion and no way to be asked for more. Result size is hard-capped at
 * options.maxNeighbors (default 6). Ordering is deterministic: relation
 * type, then neighbor label, then node key — never insertion order.
 */
export function getOrbitNeighbors(
  graph: ClinicalOrbitGraph,
  catalog: CatalogItem[],
  centerNodeKey: string,
  options?: OrbitQueryOptions,
): OrbitNeighbor[] {
  const reviewerScope = options?.reviewerScope ?? false
  const maxNeighbors = options?.maxNeighbors ?? DEFAULT_MAX_NEIGHBORS
  const center = getOrbitCenter(graph, catalog, centerNodeKey, options)
  if (!center) return []

  const results: OrbitNeighbor[] = []
  for (const edge of graph.edges) {
    let neighborKey: string | null = null
    let direction: 'outgoing' | 'incoming' | null = null
    if (edge.sourceNodeKey === centerNodeKey) { neighborKey = edge.targetNodeKey; direction = 'outgoing' }
    else if (edge.targetNodeKey === centerNodeKey) { neighborKey = edge.sourceNodeKey; direction = 'incoming' }
    if (!neighborKey || !direction) continue

    // Edge-level gate: a relationship not yet clinically reviewed must not
    // leak to the learner graph even if the neighbor node itself happens to
    // be available — review status is about the RELATIONSHIP, not just the
    // target's own readiness.
    if (!reviewerScope && edge.evidenceStatus !== 'reviewed') continue

    const neighborNode = graph.nodes.find(n => n.nodeKey === neighborKey)
    if (!neighborNode) continue
    if (!isNodeAvailable(neighborNode, catalog, reviewerScope)) continue

    results.push({ node: neighborNode, edge, direction })
  }

  results.sort((a, b) => {
    if (a.edge.relation !== b.edge.relation) return a.edge.relation.localeCompare(b.edge.relation)
    if (a.node.label !== b.node.label) return a.node.label.localeCompare(b.node.label)
    return a.node.nodeKey.localeCompare(b.node.nodeKey)
  })

  return results.slice(0, maxNeighbors)
}

/** Neighbors that are real navigable content (have a catalogRef) — a UI-friendly subset of getOrbitNeighbors for surfaces that only want "what can I open," not other clinical concepts. */
export function getRelatedContent(
  graph: ClinicalOrbitGraph,
  catalog: CatalogItem[],
  centerNodeKey: string,
  options?: OrbitQueryOptions,
): OrbitNeighbor[] {
  return getOrbitNeighbors(graph, catalog, centerNodeKey, options).filter(n => Boolean(n.node.catalogRef))
}

export interface OrbitPathStep {
  node: ClinicalOrbitNode
  /** The edge used to reach this node from the previous step in the path — null for the first step. */
  viaEdge: ClinicalOrbitEdge | null
}

/** Resolves a navigation-history stack of node keys into full steps with the edge that connected each hop. Fails closed: stops at the first node that isn't currently available rather than skipping it and continuing, since a broken breadcrumb is safer than a silently-shortened one. */
export function getOrbitPath(
  graph: ClinicalOrbitGraph,
  catalog: CatalogItem[],
  nodeKeyPath: string[],
  options?: OrbitQueryOptions,
): OrbitPathStep[] {
  const reviewerScope = options?.reviewerScope ?? false
  const steps: OrbitPathStep[] = []
  for (let i = 0; i < nodeKeyPath.length; i++) {
    const node = graph.nodes.find(n => n.nodeKey === nodeKeyPath[i])
    if (!node || !isNodeAvailable(node, catalog, reviewerScope)) break
    let viaEdge: ClinicalOrbitEdge | null = null
    if (i > 0) {
      const prevKey = nodeKeyPath[i - 1]
      viaEdge = graph.edges.find(e =>
        (e.sourceNodeKey === prevKey && e.targetNodeKey === node.nodeKey) ||
        (e.targetNodeKey === prevKey && e.sourceNodeKey === node.nodeKey),
      ) ?? null
    }
    steps.push({ node, viaEdge })
  }
  return steps
}

/** Compact breadcrumb labels for a navigation path — same fail-closed truncation as getOrbitPath. */
export function getOrbitBreadcrumbs(
  graph: ClinicalOrbitGraph,
  catalog: CatalogItem[],
  nodeKeyPath: string[],
  options?: OrbitQueryOptions,
): ClinicalOrbitNode[] {
  return getOrbitPath(graph, catalog, nodeKeyPath, options).map(step => step.node)
}

/** A route is only learner-navigable if it's a real page, not a bare API endpoint with no corresponding UI. */
export function resolveContentRoute(catalogItem: CatalogItem | null): string | null {
  if (!catalogItem?.route) return null
  if (catalogItem.route.startsWith('/api/')) return null
  return catalogItem.route
}
