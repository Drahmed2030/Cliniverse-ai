import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readJson = relativePath => JSON.parse(readFileSync(new URL(relativePath, import.meta.url), 'utf8'))

const registry = readJson('../docs/PLATFORM_DEPLOYMENT_REGISTRY_V1.json')
const cliniverseRuleset = readJson('../docs/GITHUB_RULESET_CLINIVERSE_MAIN_V1.json')
const neuraopsRuleset = readJson('../docs/GITHUB_RULESET_NEURAOPS_MAIN_V1.json')

test('the platform registry has one canonical repository and runtime per product', () => {
  const repositories = registry.sourceControl.repositories
  const projects = registry.vercel.projects

  assert.deepEqual(
    repositories.filter(record => record.authority === 'canonical').map(record => record.repository),
    ['Drahmed2030/Cliniverse-ai', 'Drahmed2030/neuraops-core'],
  )
  assert.deepEqual(
    projects.filter(record => record.role === 'authoritative-runtime').map(record => record.projectName),
    ['cliniverse-ai-u7gi', 'neuraops-core'],
  )
  const duplicate = projects.find(record => record.projectName === 'neuraops-core-snnv')
  assert.deepEqual(duplicate?.customDomains, [])
  assert.equal(duplicate?.latestDeployment.state, 'ERROR')
  assert.equal(duplicate?.decision, 'quarantine-pending-env-and-dependency-review')
})

test('governance defaults fail closed for production and destructive operations', () => {
  assert.equal(registry.dataClassification, 'operational-metadata-only-no-phi-no-secrets')
  assert.equal(registry.releasePolicy.productionRequiresSeparateApproval, true)
  assert.equal(registry.releasePolicy.forcePushAllowed, false)
  assert.equal(registry.releasePolicy.bulkDeletionAllowed, false)
  assert.equal(registry.releasePolicy.defaultControlPlaneMode, 'read-only')
  assert.equal(registry.cloudflare.productionChangeAuthorized, false)
  assert.equal(registry.cloudflare.dnsChangeAuthorized, false)
})

test('proposed main rulesets block destructive history changes and require governed PRs', () => {
  for (const ruleset of [cliniverseRuleset, neuraopsRuleset]) {
    assert.equal(ruleset.target, 'branch')
    assert.deepEqual(ruleset.conditions.ref_name.include, ['~DEFAULT_BRANCH'])
    assert.deepEqual(ruleset.bypass_actors, [])
    assert.ok(ruleset.rules.some(rule => rule.type === 'deletion'))
    assert.ok(ruleset.rules.some(rule => rule.type === 'non_fast_forward'))
    assert.ok(ruleset.rules.some(rule => rule.type === 'required_linear_history'))
    const pullRequest = ruleset.rules.find(rule => rule.type === 'pull_request')
    assert.deepEqual(pullRequest.parameters.allowed_merge_methods, ['squash'])
    assert.equal(pullRequest.parameters.required_review_thread_resolution, true)
    assert.ok(ruleset.rules.some(rule => rule.type === 'required_status_checks'))
    assert.ok(!ruleset.rules.some(rule => rule.type === 'required_signatures'))
  }
})

test('external cleanup remains item-level and unapplied', () => {
  assert.ok(registry.vercel.visibleProjectInventory.inventoryLimitReached)
  assert.ok(registry.pendingExternalActions.every(action => action.state !== 'completed'))
  assert.ok(registry.pendingExternalActions.some(action => action.action === 'disable-cloudflare-non-production-builds'))
  assert.ok(registry.pendingExternalActions.some(action => action.action === 'remove-neuraops-core-snnv'))
})
