import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../app/components/ReleaseApp.tsx', import.meta.url), 'utf8')
const today = app.slice(app.indexOf('function TodaySurface'), app.indexOf('function ProgressSurface'))

test('Today keeps one primary CTA and takes collection continuation only through the shared projection contract', () => {
  assert.match(app, /import type \{ CollectionContinuation \} from '\.\.\/lib\/content\/collectionContinuation'/)
  assert.match(today, /continuation\?: CollectionContinuation \| null/)
  assert.match(today, /Continue \$\{continuation\.title\} →/)
  assert.match(today, /: 'Resume →'/)
  assert.equal((today.match(/className="cv-today-cta"/g) ?? []).length, 1)
  assert.match(today, /onNavigate\('learn'\)/)
})