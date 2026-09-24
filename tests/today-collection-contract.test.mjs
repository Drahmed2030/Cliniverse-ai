import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../app/components/ReleaseApp.tsx', import.meta.url), 'utf8')
const today = app.slice(app.indexOf('function TodaySurface'), app.indexOf('function ProgressSurface'))

test('Today keeps one primary CTA and resolves continuation through the shared persisted collection projection', () => {
  assert.match(app, /import \{ collectionContinuation, type CollectionContinuation \} from '\.\.\/lib\/content\/collectionContinuation'/)
  assert.match(app, /import \{ readCliniverseEvents \} from '\.\.\/lib\/platform\/eventStore'/)
  assert.match(today, /collectionContinuation\(readCliniverseEvents\(window\.localStorage, actorId\)\)/)
  assert.match(today, /continuation\?: CollectionContinuation \| null/)
  assert.match(today, /Continue \$\{continuation\.title\} →/)
  assert.match(today, /: 'Resume →'/)
  assert.equal((today.match(/className="cv-today-cta"/g) ?? []).length, 1)
  assert.match(today, /onNavigate\('learn'\)/)
})
