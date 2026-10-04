import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

function worker({ response = new Response('synthetic', { status: 200 }), offline = false } = {}) {
  const handlers = {}, writes = [], deleted = [], matches = []
  const storage = new Map([
    ['cliniverse-v1', new Map([['/api/work/private', new Response('old synthetic protected content')]])],
    ['cliniverse-v2', new Map()], ['cliniverse-v3', new Map()], ['unrelated-cache', new Map()],
  ])
  const caches = {
    async keys() { return [...storage.keys()] },
    async delete(key) { deleted.push(key); return storage.delete(key) },
    async open(key) {
      if (!storage.has(key)) storage.set(key, new Map())
      const entries = storage.get(key)
      return {
        async addAll(paths) { for (const p of paths) entries.set(p, new Response('static')) },
        async put(req, res) { writes.push(req.url); entries.set(req.url, res) },
        async match(req) { matches.push(req.url ?? req); return entries.get(req.url ?? req)?.clone() },
      }
    },
    async match(req) { matches.push(req.url ?? req); for (const map of storage.values()) if (map.has(req.url ?? req)) return map.get(req.url ?? req)?.clone() },
  }
  const self = { location: { origin: 'https://preview.example' }, addEventListener: (name, fn) => { handlers[name] = fn }, skipWaiting() {}, clients: { claim: async () => {} } }
  vm.runInNewContext(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), { self, caches, URL, Promise, fetch: async () => { if (offline) throw Error('offline'); return response.clone() } })
  async function fetchEvent(path, options = {}) {
    const request = { url: new URL(path, self.location.origin).href, method: 'GET', mode: 'cors', credentials: 'omit', headers: new Headers(), ...options }
    const promises = []; let intercepted = false, result
    handlers.fetch({ request, waitUntil: p => promises.push(p), respondWith(p) { intercepted = true; result = p } })
    if (result) await result.catch(() => {})
    await Promise.all(promises)
    return intercepted
  }
  async function activate() { const promises = []; handlers.activate({ waitUntil: p => promises.push(p) }); await Promise.all(promises) }
  return { fetchEvent, activate, writes, deleted, matches, storage }
}
for (const path of ['/api/work/private', '/work', '/labs/work-preview', '/', 'https://other.example/document']) {
  test(`protected or non-allowlisted GET is not intercepted or cached: ${path}`, async () => {
    const w = worker()
    assert.equal(await w.fetchEvent(path), false)
    assert.deepEqual(w.writes, [])
  })
}
test('static asset may be cached, but no-store response is not', async () => {
  const ordinary = worker()
  await ordinary.fetchEvent('/manifest.json')
  assert.deepEqual(ordinary.writes, ['https://preview.example/manifest.json'])
  const sensitive = worker({ response: new Response('private', { headers: { 'Cache-Control': 'private, no-store' } }) })
  await sensitive.fetchEvent('/manifest.json')
  assert.deepEqual(sensitive.writes, [])
})
test('navigation, RSC and authorization requests cannot enter the static cache', async () => {
  for (const options of [{ mode: 'navigate' }, { headers: new Headers({ RSC: '1' }) }, { headers: new Headers({ Authorization: 'Bearer SYNTHETIC' }) }]) {
    const w = worker(); await w.fetchEvent('/manifest.json', options); assert.deepEqual(w.writes, [])
  }
})
test('offline protected requests never use cached evidence or an HTML fallback', async () => {
  const w = worker({ offline: true })
  assert.equal(await w.fetchEvent('/api/work/private'), false)
  assert.deepEqual(w.matches, [])
})
test('upgrade removes known unsafe application caches and preserves unrelated caches', async () => {
  const w = worker(); await w.activate()
  assert.deepEqual(w.deleted.sort(), ['cliniverse-v1', 'cliniverse-v2', 'cliniverse-v3'])
  assert.equal(w.storage.has('unrelated-cache'), true)
  assert.equal(w.storage.has('cliniverse-v3'), false)
})
