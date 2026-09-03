import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createMedicalOperationsRegistrySnapshot,
  getCurrentNexusReference,
  isClinicalRuleSourceApproved,
  NEXUS_REFERENCE_REGISTRY,
} from '../app/lib/cardiology/nexusReferences.ts'
import { runPathwayReplay, STEMI_REPLAY_DEMO } from '../app/lib/cardiology/pathwayReplayAgents.ts'

test('every Medical Operations Registry record carries the governance passport', () => {
  const ids = new Set()

  for (const source of NEXUS_REFERENCE_REGISTRY) {
    assert.equal(source.schemaVersion, 1)
    assert.ok(source.id.length > 3)
    assert.equal(ids.has(source.id), false, `duplicate immutable revision ID: ${source.id}`)
    ids.add(source.id)

    assert.ok(source.familyId.length > 3)
    assert.ok(source.publisher.length > 2)
    assert.ok(source.version.length > 0)
    assert.ok(source.jurisdiction.length > 2)
    assert.ok(source.intendedUse.length > 20)
    assert.ok(source.scope.length > 20)
    assert.ok(source.reviewStatus.length > 0)
    assert.ok(source.lifecycle.state.length > 0)
    assert.ok(source.rights.status.length > 0)
    assert.ok(source.rights.attribution.length > 2)
    assert.ok(source.ruleAuthority.use.length > 0)
    assert.equal(
      source.sourceAccess === 'public-primary-url',
      source.sourceUrl !== null,
      `${source.id} source access and URL must agree`,
    )
  }
})

test('an immutable revision snapshot does not drift when a source family advances', () => {
  const template = NEXUS_REFERENCE_REGISTRY.find(source => source.id === 'DEMO-PATHWAY-RULESET-V1')
  assert.ok(template)

  const oldRevision = {
    ...template,
    id: 'TEST-SOURCE-V1',
    familyId: 'TEST-SOURCE',
    title: 'Test source revision one',
    version: '1.0',
    linkedPathwayIds: ['test-pathway-v1'],
    lifecycle: {
      state: 'superseded',
      expiresAt: null,
      supersedesId: null,
      supersededById: 'TEST-SOURCE-V2',
    },
    rights: { ...template.rights, attribution: 'Test attribution v1.' },
  }
  const currentRevision = {
    ...template,
    id: 'TEST-SOURCE-V2',
    familyId: 'TEST-SOURCE',
    title: 'Test source revision two',
    version: '2.0',
    linkedPathwayIds: ['test-pathway-v2'],
    lifecycle: {
      state: 'active',
      expiresAt: null,
      supersedesId: 'TEST-SOURCE-V1',
      supersededById: null,
    },
    rights: { ...template.rights, attribution: 'Test attribution v2.' },
  }
  const registry = [oldRevision, currentRevision]
  const snapshot = createMedicalOperationsRegistrySnapshot(['TEST-SOURCE-V1'], registry)

  assert.equal(getCurrentNexusReference('TEST-SOURCE', registry)?.id, 'TEST-SOURCE-V2')
  assert.equal(snapshot.sources[0].id, 'TEST-SOURCE-V1')
  assert.equal(snapshot.sources[0].version, '1.0')
  assert.equal(snapshot.sources[0].scope, template.scope)
  assert.equal(snapshot.sources[0].lifecycle.state, 'superseded')

  oldRevision.title = 'mutated registry title'
  oldRevision.rights.attribution = 'mutated registry attribution'
  oldRevision.linkedPathwayIds.push('mutated-pathway')

  assert.equal(snapshot.sources[0].title, 'Test source revision one')
  assert.equal(snapshot.sources[0].rights.attribution, 'Test attribution v1.')
  assert.deepEqual(snapshot.sources[0].linkedPathwayIds, ['test-pathway-v1'])
})

test('registry resolution fails closed for unknown, duplicate, or ambiguous references', () => {
  assert.throws(
    () => createMedicalOperationsRegistrySnapshot(['UNKNOWN-REVISION']),
    /unresolved Medical Operations Registry references/i,
  )
  assert.throws(
    () => createMedicalOperationsRegistrySnapshot(['DEMO-PATHWAY-RULESET-V1', 'DEMO-PATHWAY-RULESET-V1']),
    /must be unique immutable revision IDs/i,
  )

  const duplicateRevision = [
    NEXUS_REFERENCE_REGISTRY[0],
    { ...NEXUS_REFERENCE_REGISTRY[0] },
  ]
  assert.throws(
    () => createMedicalOperationsRegistrySnapshot(['DEMO-PATHWAY-RULESET-V1'], duplicateRevision),
    /duplicate immutable revision ID/i,
  )

  const template = NEXUS_REFERENCE_REGISTRY[0]
  const ambiguous = [
    { ...template, id: 'AMBIGUOUS-V1', familyId: 'AMBIGUOUS', lifecycle: { ...template.lifecycle } },
    { ...template, id: 'AMBIGUOUS-V2', familyId: 'AMBIGUOUS', lifecycle: { ...template.lifecycle } },
  ]
  assert.throws(
    () => getCurrentNexusReference('AMBIGUOUS', ambiguous),
    /multiple active revisions/i,
  )
})

test('no current source is silently approved as an executable clinical rule', () => {
  for (const source of NEXUS_REFERENCE_REGISTRY) {
    assert.equal(isClinicalRuleSourceApproved(source), false, source.id)
  }
})

test('Pathway Replay carries the exact governed source snapshot into training', () => {
  const report = runPathwayReplay(STEMI_REPLAY_DEMO)

  assert.equal(report.registry.schemaVersion, 1)
  assert.deepEqual(report.registry.sourceIds, ['DEMO-PATHWAY-RULESET-V1'])
  assert.equal(report.registry.sources[0].version, '1.0-demo')
  assert.equal(report.registry.ruleMode, 'synthetic-demonstration-only')
  assert.equal(report.registry.clinicalExecution.state, 'blocked')
  assert.equal(report.training.registrySnapshotId, report.registry.snapshotId)
  assert.deepEqual(report.training.referenceIds, report.registry.sourceIds)
})
