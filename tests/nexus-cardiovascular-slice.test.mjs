import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function source(path) {
  return readFile(new URL(path, root), 'utf8')
}

test('Nexus cardiovascular slice is exposed only through the verified PRO workspace boundary', async () => {
  const [releaseApp, releaseNav, ward, tsconfig] = await Promise.all([
    source('app/components/ReleaseApp.tsx'),
    source('app/components/ReleaseNav.tsx'),
    source('app/components/ward/index.tsx'),
    source('tsconfig.json'),
  ])

  assert.doesNotMatch(releaseApp, /NexusCardiovascularSlice/)
  assert.doesNotMatch(releaseNav, /NexusCardiovascularSlice/)
  assert.match(ward, /import NexusCardiovascularSlice/)
  assert.match(ward, /activeWorkspace === 'nexus' && isPro/)
  assert.match(ward, /useCliniverseSubscription/)
  assert.match(ward, /openPaywall/)
  assert.match(tsconfig, /app\/components\/nexus\/\*\*\/\*\.tsx/)
})

test('Nexus cardiovascular exercise preserves the fictional, unreviewed content boundary', async () => {
  const data = await source('app/lib/nexus/simulationData.ts')

  assert.match(data, /SIM-NEXUS-CARD-001/)
  assert.match(data, /contentStatus: 'draft-unreviewed'/)
  assert.match(data, /reviewedBy: null/)
  assert.match(data, /sources: \[\]/)
  assert.match(data, /Do not enter real patient information/)
  assert.match(data, /not clinical management/)
})

test('Nexus learning state is versioned and debrief is gated by all modules plus confirmation', async () => {
  const data = await source('app/lib/nexus/simulationData.ts')
  const types = await source('app/lib/nexus/types.ts')

  assert.match(data, /cliniverse:nexus:cardiovascular-learning:simulation:v1/)
  assert.match(types, /schemaVersion: 1/)
  assert.match(data, /hasCompletedNexusModules/)
  assert.match(data, /state\.fictionalBoundaryConfirmed/)
  assert.match(data, /state\.completedModules\.every/)
  assert.match(data, /new Set\(value\.completedModules\)\.size/)
  assert.match(data, /typed\.completedModules\.every/)
  assert.match(data, /!typed\.debriefRevealed \|\| canRevealNexusDebrief/)
})

test('all four Nexus modules are implemented without network or model calls', async () => {
  const paths = [
    'app/components/nexus/CaseHuddle.tsx',
    'app/components/nexus/NursingLens.tsx',
    'app/components/nexus/MedicationSafety.tsx',
    'app/components/nexus/SafetyReview.tsx',
    'app/components/nexus/NexusCardiovascularSlice.tsx',
  ]
  const combined = (await Promise.all(paths.map(source))).join('\n')

  for (const label of ['CASE HUDDLE', 'NURSING LENS', 'MEDICATION SAFETY', 'SAFETY REVIEW']) {
    assert.match(combined, new RegExp(label))
  }
  assert.doesNotMatch(combined, /fetch\s*\(/)
  assert.doesNotMatch(combined, /createClient\s*\(/)
  assert.doesNotMatch(combined, /Anthropic|OpenAI|Grok|DeepSeek|Llama/)
})

test('Nexus documentation records the bounded PRO release-candidate gate', async () => {
  const docs = await source('docs/NEXUS_CARDIOVASCULAR_SLICE_V1.md')

  assert.match(docs, /server-verified Cliniverse PRO entitlement/)
  assert.match(docs, /No API, database, model, or Supabase call/)
  assert.match(docs, /No deployment, database migration, or App Store submission/)
})
