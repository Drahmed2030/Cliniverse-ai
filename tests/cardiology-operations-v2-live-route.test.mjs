import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

import { CLINICAL_ORBIT_NODE_SEED, CLINICAL_ORBIT_EDGE_SEED } from '../app/lib/clinicalOrbitGraphSeed.ts'
import { getOrbitNeighbors, getOrbitCenter } from '../app/lib/clinicalOrbitGraphQueries.ts'
import { CLINICAL_CONTENT_CATALOG_SEED } from '../app/lib/contentCatalogSeed.ts'
import { isAvailable } from '../app/lib/contentCatalogQueries.ts'

const CATALOG = CLINICAL_CONTENT_CATALOG_SEED
const GRAPH = { nodes: CLINICAL_ORBIT_NODE_SEED, edges: CLINICAL_ORBIT_EDGE_SEED }

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

// ── UI wiring ─────────────────────────────────────────────────────────────

test('the Operations Console tab exists and is wired into CardiologyOperations.tsx', () => {
  const source = read('app/components/ward/cardiology/CardiologyOperations.tsx')
  assert.match(source, /import OperationsConsole from '\.\/OperationsConsole'/)
  assert.match(source, /id: 'console', label: 'Console'/)
  assert.match(source, /activeModule === 'console' && <OperationsConsole/)
})

test('nexusCase is lifted to CardiologyOperations.tsx and shared with both the pathway tab and the console', () => {
  const source = read('app/components/ward/cardiology/CardiologyOperations.tsx')
  assert.match(source, /const \[nexusCase, setNexusCase\] = useState\(createInitialQapasCase\)/)
  assert.match(source, /<OperationsConsole nexusCase=\{nexusCase\} state=\{state\} \/>/)
  assert.match(source, /<QapasDirectSimulation nexusCase=\{nexusCase\} onNexusCaseChange=\{setNexusCase\} \/>/)

  const pathway = read('app/components/ward/cardiology/QapasDirectSimulation.tsx')
  assert.doesNotMatch(pathway, /const \[nexusCase, setNexusCase\] = useState/, 'nexusCase must no longer be owned locally inside QapasDirectSimulation')
  assert.match(pathway, /export function createInitialQapasCase/)
})

test('no competing/parallel operations architecture was created — one Console, one Care Beam renderer', () => {
  const console_ = read('app/components/ward/cardiology/OperationsConsole.tsx')
  assert.equal((console_.match(/export default function OperationsConsole/g) ?? []).length, 1)
  assert.equal((console_.match(/deriveCareBeam\(/g) ?? []).length, 1)
})

test('the console reads real derived data, not a hardcoded/duplicated count', () => {
  const source = read('app/components/ward/cardiology/OperationsConsole.tsx')
  assert.doesNotMatch(source, /ordersOpen\s*:\s*\d/, 'no hardcoded count literal like the legacy ordersOpen field')
  assert.match(source, /derivePulse\(/)
  assert.match(source, /deriveOwnershipSummary\(/)
  assert.match(source, /deriveExceptionLens\(/)
})

// ── Swipe / keyboard parity, accessibility, responsive layout (Section 15/16/25) ──

test('the encounter rail has swipe AND a visible button AND keyboard alternative for every navigation action', () => {
  const source = read('app/components/ward/cardiology/OperationsConsole.tsx')
  assert.match(source, /onTouchStart=\{onTouchStart\}/)
  assert.match(source, /onTouchEnd=\{onTouchEnd\}/)
  assert.match(source, /onKeyDown=\{onKeyDown\}/)
  assert.match(source, /ArrowRight/)
  assert.match(source, /ArrowLeft/)
  assert.match(source, /Previous encounter/)
  assert.match(source, /Next encounter/)
})

test('the encounter rail is keyboard-focusable and announces state changes', () => {
  const source = read('app/components/ward/cardiology/OperationsConsole.tsx')
  assert.match(source, /tabIndex=\{0\}/)
  assert.match(source, /aria-live="polite"/)
  assert.match(source, /role="listbox"/)
})

test('touch targets meet the 44px minimum used elsewhere in this app', () => {
  const css = read('app/components/ward/cardiology/operations-console.module.css')
  const count = (css.match(/min-height:\s*44px/g) ?? []).length
  assert.ok(count >= 3, `expected several 44px touch targets, found ${count}`)
})

test('the console has a compact single-column layout and a wider three-region console layout, and respects reduced motion', () => {
  const css = read('app/components/ward/cardiology/operations-console.module.css')
  assert.match(css, /grid-template-columns:\s*1fr;/)
  assert.match(css, /@media \(min-width: 1024px\)/)
  assert.match(css, /grid-template-areas/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
})

test('operational state color communicates workflow status, not an unverified clinical severity label', () => {
  const css = read('app/components/ward/cardiology/operations-console.module.css')
  assert.doesNotMatch(css, /critical|severe|deteriorat/i)
  const source = read('app/components/ward/cardiology/OperationsConsole.tsx')
  // The only sanctioned mention is the explicit disclaimer disclaiming exactly this — never a positive severity claim anywhere else in the component.
  assert.match(source, /never infers patient deterioration, diagnostic severity, or treatment urgency/)
  const withoutDisclaimer = source.replace(/Operational workflow signaling only.*?Synthetic simulation data only\./s, '')
  assert.doesNotMatch(withoutDisclaimer, /critical|severe|deteriorat/i)
})

// ── Operational Core structural guards ───────────────────────────────────

test('operationalCore.ts declares every contract named in Section 2', () => {
  const source = read('app/lib/cardiologyOperations/operationalCore.ts')
  for (const name of ['OperationalEncounter', 'ClinicalWorkItem', 'OperationalEvent', 'OwnershipAssignment', 'OperationalClock', 'ProcedureState', 'HandoverState', 'EscalationState', 'OperationalEvidenceReference']) {
    assert.match(source, new RegExp(`interface ${name}`), `missing contract: ${name}`)
  }
})

test('every event type named in Section 3 is part of the OperationalEventType union', () => {
  const source = read('app/lib/cardiologyOperations/operationalCore.ts')
  for (const type of [
    'encounter.created', 'work_item.created', 'work_item.assigned', 'work_item.acknowledged', 'work_item.completed',
    'result.pending', 'result.received', 'procedure.prepared', 'procedure.started',
    'handover.prepared', 'handover.transferred', 'escalation.raised', 'escalation.acknowledged', 'encounter.closed',
  ]) {
    assert.match(source, new RegExp(type.replace('.', '\\.')), `missing event type: ${type}`)
  }
})

test('every work-item kind named in Section 4 is part of the ClinicalWorkItemKind union', () => {
  const source = read('app/lib/cardiologyOperations/operationalCore.ts')
  for (const kind of ['investigation', 'result_review', 'documentation', 'referral', 'procedure_prep', 'follow_up', 'handover', 'coordination', 'escalation']) {
    assert.match(source, new RegExp(`'${kind}'`), `missing work item kind: ${kind}`)
  }
})

test('operationalWorkItems.ts documents that it never places, approves, or transmits an order', () => {
  const source = read('app/lib/cardiologyOperations/operationalWorkItems.ts')
  assert.match(source, /places, approves, or transmits/i)
})

test('nexusCore.ts is untouched by this batch (reused, not rewritten)', () => {
  const source = read('app/lib/cardiology/nexusCore.ts')
  assert.match(source, /export const NEXUS_TRANSITION_RULES/)
  assert.match(source, /export function applyNexusEvent/)
})

// ── FHIR / SMART boundary docs ────────────────────────────────────────────

test('the FHIR boundary file constructs no FHIR resource — documentation only', () => {
  const source = read('app/lib/cardiologyOperations/fhirMappingBoundary.ts')
  assert.doesNotMatch(source, /new (Encounter|Task|ServiceRequest|Observation|Procedure|Provenance|AuditEvent)\(/)
  assert.match(source, /DOCUMENTATION ONLY/)
})

test('the Batch 10 doc records the SMART/CDS future boundary with no live EHR connectivity implied', () => {
  const doc = read('docs/CARDIOLOGY_OPERATIONS_V2.md')
  assert.match(doc, /SMART App Launch/)
  assert.match(doc, /CDS Hooks/)
  assert.match(doc, /No live EHR connectivity exists or is implemented in this batch/)
})

// ── Catalog (Section 23) ──────────────────────────────────────────────────

test('Cardiology Operations remains one cataloged workspace row — Batch 10 does not add a row per internal tab', () => {
  const rows = CATALOG.filter(item => item.module === 'cardiology_ops')
  assert.equal(rows.length, 1)
  assert.equal(rows[0].source_key, 'cardiology_operations')
  assert.equal(isAvailable(rows[0]), true)
})

test('no new operations_workspace/work_queue/procedure_board/handover/care_beam content_type rows were introduced', () => {
  const newTypes = ['operations_workspace', 'work_queue', 'procedure_board', 'care_beam', 'pathway_profile']
  for (const type of newTypes) {
    assert.equal(CATALOG.filter(item => item.content_type === type).length, 0, `unexpected new catalog content_type: ${type}`)
  }
})

// ── Clinical Orbit (Section 24) ───────────────────────────────────────────

test('exactly one new Clinical Orbit node/edge was added for Cardiology Operations v2, staying within the existing ceiling', () => {
  assert.equal(CLINICAL_ORBIT_NODE_SEED.length, 30)
  assert.equal(CLINICAL_ORBIT_EDGE_SEED.length, 25)
  const node = CLINICAL_ORBIT_NODE_SEED.find(n => n.nodeKey === 'content:cardiology_ops:workspace:cardiology_operations')
  assert.ok(node)
  assert.deepEqual(node.catalogRef, { module: 'cardiology_ops', contentType: 'workspace', sourceKey: 'cardiology_operations' })
})

test('STEMI/ACS links to the live Cardiology Operations workspace, reviewed with provenance', () => {
  const neighbors = getOrbitNeighbors(GRAPH, CATALOG, 'condition:anterior_stemi_acs')
  const match = neighbors.find(n => n.node.nodeKey === 'content:cardiology_ops:workspace:cardiology_operations')
  assert.ok(match)
  assert.equal(match.edge.evidenceStatus, 'reviewed')
  assert.ok(match.edge.provenanceRef.trim().length > 0)
  const center = getOrbitCenter(GRAPH, CATALOG, 'content:cardiology_ops:workspace:cardiology_operations')
  assert.ok(center)
})

// ── Regression: Ward / Resuscitation / Pathway Replay / Clinical Reference untouched ──

test('Resuscitation Hub catalog rows and readiness gate are untouched by this batch', () => {
  const vfPvt = CATALOG.find(item => item.source_key === 'resus_vf_pvt_v1')
  assert.equal(vfPvt.readiness, 'review_required')
  const engine = CATALOG.find(item => item.source_key === 'resuscitation_simulation_engine')
  assert.equal(engine.readiness, 'ready')
})

test('Pathway Replay and Clinical Reference catalog rows are untouched by this batch', () => {
  const pathway = CATALOG.find(item => item.source_key === 'pathway-replay-stemi-demo-v2')
  assert.equal(pathway.readiness, 'ready')
  const cha2ds2 = CATALOG.find(item => item.source_key === 'cha2ds2_vasc')
  assert.equal(cha2ds2.readiness, 'review_required')
})

test('the Cardiology Operations Epic v1 doc still exists (kept as legacy reference, not deleted)', () => {
  assert.ok(existsSync(new URL('../docs/CARDIOLOGY_OPERATIONS_EPIC_V1.md', import.meta.url)))
})

test('the reconciliation classification doc exists and covers every file named in Section 1', () => {
  const doc = read('docs/CARDIOLOGY_OPERATIONS_V2.md')
  for (const file of [
    'CardiologyOperations.tsx', 'OperationsOverview.tsx', 'ChestPainCensus.tsx', 'NotesOrdersTracker.tsx',
    'SurgicalList.tsx', 'StructuredHandover.tsx', 'TeamPerspective.tsx', 'QapasDirectSimulation.tsx',
    'useCardiologyOperations.ts', 'simulationData.ts', 'types.ts', 'nexusCore.ts', 'nexusKpiEngine.ts',
    'nexusReferences.ts', 'decisionReplay.ts', 'teamPerspective.ts', 'CARDIOLOGY_OPERATIONS_EPIC_V1.md',
  ]) {
    assert.match(doc, new RegExp(file.replace('.', '\\.')), `Section 1 doc missing classification for ${file}`)
  }
})
