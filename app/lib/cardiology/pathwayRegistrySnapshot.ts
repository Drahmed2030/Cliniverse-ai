import { getNexusReference, validateReferenceIds, type NexusReference } from './nexusReferences.ts'

// PathwayRegistrySnapshot — Batch 7. ADAPTED, not ported: the source branch
// (ops/platform-governance-v1) carries a much richer "Medical Operations
// Registry" schema in its own nexusReferences.ts (schemaVersion, familyId,
// lifecycle, rights, ruleAuthority — ~10 extra reference entries). Porting
// that wholesale would silently rewrite the NexusReference shape this repo's
// existing Nexus Learning workspace already depends on
// (tests/nexus-core-behavior.test.mjs, app/lib/cardiology/index.ts).
//
// This file instead builds the same conceptual guarantee — a deterministic,
// content-addressed snapshot of exactly which governed reference revisions a
// pathway replay/receipt is bound to — purely additively, using HEAD's
// existing, simpler NexusReference type as-is. Nothing here modifies
// nexusReferences.ts's shape.

export const PATHWAY_REGISTRY_SNAPSHOT_SCHEMA_VERSION = 1 as const

export interface PathwayRegistrySource {
  id: string
  title: string
  publisher: string
  version: string
  sourceUrl: string | null
  status: NexusReference['status']
  scope: string
}

export interface PathwayRegistrySnapshot {
  schemaVersion: typeof PATHWAY_REGISTRY_SNAPSHOT_SCHEMA_VERSION
  /** Deterministic identity composed only from explicitly referenced immutable revisions. */
  snapshotId: string
  sourceIds: string[]
  sources: PathwayRegistrySource[]
  ruleMode: 'synthetic-demonstration-only'
  clinicalExecution: {
    state: 'blocked'
    reasons: string[]
  }
}

export function createPathwayRegistrySnapshot(referenceIds: readonly string[]): PathwayRegistrySnapshot {
  const uniqueIds = [...new Set(referenceIds)]
  if (uniqueIds.length !== referenceIds.length) {
    throw new Error('Pathway registry references must be unique reference IDs.')
  }

  const unresolved = validateReferenceIds(uniqueIds)
  if (unresolved.length) {
    throw new Error(`Unresolved pathway registry references: ${unresolved.join(', ')}`)
  }

  const sources = uniqueIds.map((referenceId): PathwayRegistrySource => {
    const reference = getNexusReference(referenceId)
    if (!reference) throw new Error(`Unresolved pathway registry reference: ${referenceId}`)
    return {
      id: reference.id,
      title: reference.title,
      publisher: reference.publisher,
      version: reference.version,
      sourceUrl: reference.sourceUrl,
      status: reference.status,
      scope: reference.scope,
    }
  })

  return {
    schemaVersion: PATHWAY_REGISTRY_SNAPSHOT_SCHEMA_VERSION,
    snapshotId: `pathway-registry-v1:${sources.map(source => `${source.id}@${source.version}`).join('|')}`,
    sourceIds: [...uniqueIds],
    sources,
    ruleMode: 'synthetic-demonstration-only',
    clinicalExecution: {
      state: 'blocked',
      reasons: [
        'The configured threshold is limited to a fictional deterministic demonstration.',
        'No source revision has been activated as an executable clinical rule.',
        'Scoped human clinical, rights, jurisdiction and validation approval are required.',
      ],
    },
  }
}
