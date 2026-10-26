import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

// Runs the REAL public/sw.js and public/register-sw.js in a sandbox with an in-memory Cache API, so the
// request policy is exercised through the same fetch/install/activate listeners the browser calls.
// The real-Chromium test with a genuinely controlling worker is scripts/verify-service-worker-browser.cjs.
const read = p => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const SW = read('public/sw.js')
const REGISTER = read('public/register-sw.js')
const ORIGIN = 'https://app.test'

function makeCaches(initial = {}) {
  const stores = new Map(Object.entries(initial).map(([name, urls]) => [name, new Map(urls.map(u => [u, new Response('cached:' + u, { status: 200 })]))]))
  const log = []
  const api = {
    log,
    stores,
    async keys() { return [...stores.keys()] },
    async delete(name) { log.push(['delete-cache', name]); return stores.delete(name) },
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map())
      const store = stores.get(name)
      return {
        async add(url) { if (url.includes('missing')) throw new TypeError('404'); store.set(new URL(url, ORIGIN).href, new Response('precached:' + url)) },
        async put(request, response) { log.push(['put', name, request.url]); store.set(request.url, response) },
        async match(request) { const key = typeof request === 'string' ? new URL(request, ORIGIN).href : request.url; const hit = store.get(key); return hit ? hit.clone() : undefined },
        async keys() { return [...store.keys()].map(url => ({ url, headers: new Headers(), cache: 'default' })) },
        async delete(request) { log.push(['delete-entry', name, request.url]); return store.delete(request.url) },
      }
    },
  }
  return api
}

function loadWorker({ caches = makeCaches(), network = async () => new Response('net', { status: 200 }) } = {}) {
  const listeners = {}
  const flags = { skipWaiting: 0, claim: 0 }
  const fetched = []
  const self = {
    location: { origin: ORIGIN },
    addEventListener: (type, fn) => { listeners[type] = fn },
    skipWaiting: () => { flags.skipWaiting++ },
    clients: { claim: async () => { flags.claim++ }, matchAll: async () => [] },
    registration: {},
  }
  const sandbox = { self, caches, URL, Response, Headers, Request, TypeError, Promise, fetch: async (request) => { fetched.push(request.url); return network(request) }, clients: self.clients }
  vm.runInNewContext(SW, sandbox)
  return { listeners, flags, caches, fetched, self }
}

const request = (url, { method = 'GET', mode = 'cors', headers = {}, cache = 'default' } = {}) => ({ url: new URL(url, ORIGIN).href, method, mode, cache, headers: new Headers(headers) })
async function dispatch(worker, req) {
  let responded = null
  const event = { request: req, respondWith: p => { responded = Promise.resolve(p) } }
  worker.listeners.fetch(event)
  return responded ? { intercepted: true, response: await responded } : { intercepted: false }
}
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve() }

const SENSITIVE = [
  ['Supabase auth user (cross-origin)', 'https://zbiujqxinvcxvuviuenx.supabase.co/auth/v1/user'],
  ['Supabase token refresh', 'https://zbiujqxinvcxvuviuenx.supabase.co/auth/v1/token?grant_type=refresh_token'],
  ['Supabase REST profile read', 'https://zbiujqxinvcxvuviuenx.supabase.co/rest/v1/profiles?select=*&id=eq.1'],
  ['Supabase function', 'https://zbiujqxinvcxvuviuenx.supabase.co/functions/v1/delete-account'],
  ['any third-party GET', 'https://example.org/data.json'],
  ['recovery page', '/reset-password'],
  ['recovery page with query', '/reset-password?x=1'],
  ['recovery page trailing slash', '/reset-password/'],
  ['recovery page upper case', '/Reset-Password'],
  ['recovery page double slash', '//reset-password'],
  ['recovery page percent-encoded', '/%72eset-password'],
  ['recovery page with token query', '/reset-password?access_token=abc&refresh_token=def'],
  ['auth callback with code', '/auth/callback?code=abc'],
  ['root with code', '/?code=abc'],
  ['root with recovery type', '/?type=recovery'],
  ['root with error code', '/?error_code=otp_expired'],
  ['private API', '/api/subscriptions/apple/verify'],
  ['evidence API', '/api/ward/case-evidence?templateId=dka'],
  ['release contract API', '/api/release-contract'],
  ['account path', '/account/profile'],
]

test('sensitive requests are never intercepted: no respondWith, no cache read, no cache write', async () => {
  for (const [label, url] of SENSITIVE) {
    const caches = makeCaches()
    const worker = loadWorker({ caches })
    const result = await dispatch(worker, request(url, { mode: url.startsWith('/') && !url.includes('/api/') ? 'navigate' : 'cors' }))
    assert.equal(result.intercepted, false, label)
    assert.deepEqual(worker.fetched, [], `${label}: the worker did not even call fetch`)
    assert.deepEqual(caches.log, [], `${label}: no cache writes or deletions`)
  }
})

test('sensitive request headers disable interception even for otherwise allowed static paths', async () => {
  for (const headers of [{ authorization: 'Bearer x' }, { apikey: 'anon' }, { 'x-client-info': 'supabase-js' }, { rsc: '1' }, { 'next-action': 'abc' }]) {
    const result = await dispatch(loadWorker(), request('/icons/icon-192.svg', { headers }))
    assert.equal(result.intercepted, false, JSON.stringify(headers))
  }
  assert.equal((await dispatch(loadWorker(), request('/icons/icon-192.svg', { cache: 'no-store' }))).intercepted, false)
  assert.equal((await dispatch(loadWorker(), request('/icons/icon-192.svg', { method: 'POST' }))).intercepted, false)
})

test('public static assets are served network-first and cached only when cacheable', async () => {
  for (const url of ['/icons/icon-192.svg', '/manifest.json', '/_next/static/chunks/app.js', '/native-offline.html']) {
    const caches = makeCaches()
    const worker = loadWorker({ caches })
    const result = await dispatch(worker, request(url))
    assert.equal(result.intercepted, true, url)
    assert.equal(await result.response.text(), 'net')
    await flush()
    assert.ok(caches.log.some(entry => entry[0] === 'put' && entry[2].endsWith(url)), `${url} cached`)
  }
  // not cacheable: error status, no-store/private, wildcard Vary
  for (const response of [new Response('x', { status: 404 }), new Response('x', { headers: { 'cache-control': 'no-store' } }), new Response('x', { headers: { 'cache-control': 'private, max-age=0' } }), new Response('x', { headers: { vary: '*' } })]) {
    const caches = makeCaches()
    await dispatch(loadWorker({ caches, network: async () => response }), request('/icons/icon-192.svg'))
    await flush()
    assert.equal(caches.log.filter(entry => entry[0] === 'put').length, 0)
  }
})

test('offline: an allowed static asset falls back to its own cached copy, never to another page', async () => {
  const caches = makeCaches({ 'cliniverse-static-v4': [`${ORIGIN}/icons/icon-192.svg`, `${ORIGIN}/native-offline.html`] })
  const worker = loadWorker({ caches, network: async () => { throw new TypeError('offline') } })
  const hit = await dispatch(worker, request('/icons/icon-192.svg'))
  assert.equal(await hit.response.text(), `cached:${ORIGIN}/icons/icon-192.svg`)
  const miss = await dispatch(worker, request('/icons/icon-512.svg'))
  assert.equal(miss.response.type, 'error')
})

test('offline navigation shows only the generic offline page; account/recovery navigations get no fallback at all', async () => {
  const caches = makeCaches({ 'cliniverse-static-v4': [`${ORIGIN}/native-offline.html`, `${ORIGIN}/`, `${ORIGIN}/reset-password`] })
  const worker = loadWorker({ caches, network: async () => { throw new TypeError('offline') } })
  const root = await dispatch(worker, request('/', { mode: 'navigate' }))
  assert.equal(root.intercepted, true)
  assert.equal(await root.response.text(), `cached:${ORIGIN}/native-offline.html`, 'never the cached app shell "/"')
  const recovery = await dispatch(worker, request('/reset-password', { mode: 'navigate' }))
  assert.equal(recovery.intercepted, false, 'the browser shows its own network error; the worker adds no page')
})

test('online navigations and ordinary data requests are never written to the cache', async () => {
  const caches = makeCaches()
  const worker = loadWorker({ caches })
  await dispatch(worker, request('/', { mode: 'navigate' }))
  const data = await dispatch(worker, request('/data/anything.json'))
  assert.equal(data.intercepted, false)
  await flush()
  assert.deepEqual(caches.log.filter(entry => entry[0] === 'put'), [])
})

test('install survives a missing precache file (the old worker listed PNG icons that do not exist) and activates immediately', async () => {
  const caches = makeCaches()
  const worker = loadWorker({ caches })
  let waited
  worker.listeners.install({ waitUntil: p => { waited = p } })
  await waited
  assert.equal(worker.flags.skipWaiting, 1)
  assert.ok(caches.stores.get('cliniverse-static-v4').has(`${ORIGIN}/native-offline.html`))
  assert.match(SW, /const PRECACHE = \[[^\]]*\]/)
  for (const file of SW.match(/const PRECACHE = \[([^\]]*)\]/)[1].match(/'[^']+'|OFFLINE_URL/g)) {
    const path = file === 'OFFLINE_URL' ? '/native-offline.html' : file.slice(1, -1)
    assert.ok(fs.existsSync(new URL(`../public${path}`, import.meta.url)), `${path} exists in public/`)
  }
})

test('UPGRADE: activation removes every legacy Cliniverse cache (with synthetic auth and recovery entries) and scrubs the current one', async () => {
  const sensitive = ['https://zbiujqxinvcxvuviuenx.supabase.co/auth/v1/user', 'https://zbiujqxinvcxvuviuenx.supabase.co/rest/v1/profiles?id=eq.1', `${ORIGIN}/reset-password`, `${ORIGIN}/api/subscriptions/apple/verify`, `${ORIGIN}/`]
  const caches = makeCaches({
    'cliniverse-v3': sensitive,
    'cliniverse-v2': sensitive.slice(0, 2),
    'Cliniverse-legacy': sensitive.slice(2),
    'cliniverse-static-v4': [...sensitive, `${ORIGIN}/icons/icon-192.svg`, `${ORIGIN}/native-offline.html`],
    'unrelated-tool-cache': [`${ORIGIN}/something`],
  })
  const worker = loadWorker({ caches })
  let waited
  worker.listeners.activate({ waitUntil: p => { waited = p } })
  await waited
  assert.deepEqual([...caches.stores.keys()].sort(), ['cliniverse-static-v4', 'unrelated-tool-cache'])
  assert.deepEqual([...caches.stores.get('cliniverse-static-v4').keys()].sort(), [`${ORIGIN}/icons/icon-192.svg`, `${ORIGIN}/native-offline.html`])
  assert.equal(caches.stores.get('unrelated-tool-cache').size, 1, 'unrelated caches are untouched')
  assert.equal(worker.flags.claim, 1, 'the upgraded worker takes control of open pages')
})

function loadRegister({ pathname = '/', cacheNames = [], readyState = 'loading' } = {}) {
  const calls = { register: [], deleted: [], listeners: [], swListeners: [] }
  const window = { location: { pathname }, addEventListener: (type, fn) => calls.listeners.push([type, fn]), caches: null }
  const navigator = { serviceWorker: { addEventListener: (type, fn) => calls.swListeners.push([type, fn]), register: (...args) => { calls.register.push(args); return Promise.resolve({ update: () => Promise.resolve() }) } } }
  const caches = { keys: async () => cacheNames, delete: async name => { calls.deleted.push(name) } }
  window.caches = caches; window.navigator = navigator
  vm.runInNewContext(REGISTER, { window, navigator, caches, document: { readyState }, Promise, RegExp })
  return calls
}

test('register-sw.js: purges legacy caches at once, registers with updateViaCache none, and never registers from /reset-password', async () => {
  const names = ['cliniverse-v3', 'cliniverse-static-v4', 'other-cache', 'Cliniverse-old']
  const home = loadRegister({ pathname: '/', cacheNames: names }); await flush()
  assert.deepEqual(home.deleted.sort(), ['Cliniverse-old', 'cliniverse-v3'])
  home.listeners.find(([type]) => type === 'load')[1](); await flush()
  assert.deepEqual(JSON.parse(JSON.stringify(home.register)), [['/sw.js', { updateViaCache: 'none' }]])
  // The script is loaded after hydration: if the window load event has already fired it must register at once.
  const late = loadRegister({ pathname: '/', readyState: 'complete' }); await flush()
  assert.equal(late.register.length, 1)
  assert.equal(late.listeners.length, 0)
  for (const pathname of ['/reset-password', '/reset-password/', '/Reset-Password']) {
    const recovery = loadRegister({ pathname, cacheNames: names }); await flush()
    assert.equal(recovery.listeners.length, 0, pathname)
    assert.equal(recovery.register.length, 0, pathname)
    assert.deepEqual(recovery.deleted.sort(), ['Cliniverse-old', 'cliniverse-v3'], 'legacy caches are still purged there')
  }
  assert.equal(REGISTER.match(/CURRENT_CACHE = '([^']+)'/)[1], SW.match(/const CACHE = '([^']+)'/)[1], 'both files name the same current cache')
})

test('workers are never HTTP-cached so a fix reaches installed browsers', async () => {
  const config = (await import(new URL('../next.config.js', import.meta.url).pathname)).default
  const rule = (await config.headers()).find(r => r.source.includes('sw.js'))
  assert.match(rule.headers.find(h => h.key === 'Cache-Control').value, /no-store/)
})

// ───────── R6.1: Cache-Control precedence, case-insensitive query names, version handshake, controllerchange ─────────

test('Cache-Control: no-store / private / no-cache are NEVER overridden by immutable or anything else', async () => {
  const never = ['no-store, immutable', 'private, immutable', 'immutable, no-store', 'immutable, private', 'no-cache, immutable', 'public, max-age=31536000, immutable, no-store', 'NO-STORE', 'Private, Immutable', 'private="x-user"', 'max-age=0, private', 'no-store']
  for (const value of never) {
    const caches = makeCaches()
    await dispatch(loadWorker({ caches, network: async () => new Response('x', { headers: { 'cache-control': value } }) }), request('/icons/icon-192.svg'))
    await flush()
    assert.equal(caches.log.filter(entry => entry[0] === 'put').length, 0, value)
  }
  for (const value of ['public, max-age=31536000, immutable', 'public, max-age=0', 'max-age=3600', '']) {
    const caches = makeCaches()
    const headers = value ? { 'cache-control': value } : {}
    await dispatch(loadWorker({ caches, network: async () => new Response('x', { headers }) }), request('/icons/icon-192.svg'))
    await flush()
    assert.equal(caches.log.filter(entry => entry[0] === 'put').length, 1, `cacheable: "${value}"`)
  }
})

const CASE_VARIANTS = ['CODE=1', 'Code=1', 'Token_Hash=x', 'TOKEN_HASH=x', 'ACCESS_TOKEN=a', 'Refresh_Token=r', 'Type=recovery', 'ERROR_CODE=otp_expired', 'Id_Token=x', 'cOdE=', '%63ode=1', '%43ODE=1', 'a=1&Token=x']

test('sensitive query parameter NAMES are matched case-insensitively: never intercepted, never cached', async () => {
  for (const query of CASE_VARIANTS) {
    for (const base of ['/icons/icon-192.svg', '/manifest.json', '/_next/static/chunks/a.js', '/native-offline.html', '/']) {
      const caches = makeCaches()
      const worker = loadWorker({ caches })
      const result = await dispatch(worker, request(`${base}?${query}`))
      assert.equal(result.intercepted, false, `${base}?${query}`)
      assert.deepEqual(worker.fetched, [], `${base}?${query}: no fetch by the worker`)
      assert.deepEqual(caches.log.filter(entry => entry[0] === 'put'), [], `${base}?${query}`)
    }
  }
  // an ordinary version parameter is still fine
  const worker = loadWorker()
  assert.equal((await dispatch(worker, request('/icons/icon-192.svg?v=3'))).intercepted, true)
})

test('activation removes existing cache entries whose query names match case-insensitively', async () => {
  const bad = CASE_VARIANTS.map(query => `${ORIGIN}/icons/icon-192.svg?${query}`)
  const good = [`${ORIGIN}/icons/icon-192.svg`, `${ORIGIN}/icons/icon-512.svg?v=3`, `${ORIGIN}/native-offline.html`]
  const caches = makeCaches({ 'cliniverse-static-v4': [...bad, ...good] })
  const worker = loadWorker({ caches })
  let waited
  worker.listeners.activate({ waitUntil: p => { waited = p } })
  await waited
  assert.deepEqual([...caches.stores.get('cliniverse-static-v4').keys()].sort(), [...good].sort())
})

test('version handshake: the current worker answers on the supplied port; other messages are ignored', async () => {
  const worker = loadWorker()
  const posted = []
  worker.listeners.message({ data: { type: 'cliniverse-sw-version' }, ports: [{ postMessage: m => posted.push(m) }] })
  worker.listeners.message({ data: { type: 'other' }, ports: [{ postMessage: m => posted.push(m) }] })
  worker.listeners.message({ data: { type: 'cliniverse-sw-version' }, ports: [] })
  worker.listeners.message({ data: null })
  assert.deepEqual(JSON.parse(JSON.stringify(posted)), [{ version: 'cliniverse-static-v4' }])
  assert.equal(SW.match(/const CACHE = '([^']+)'/)[1], 'cliniverse-static-v4')
})

test('register-sw.js purges legacy caches again whenever another worker takes control (an old worker can re-create its cache)', async () => {
  const calls = loadRegister({ pathname: '/', cacheNames: ['cliniverse-v3', 'cliniverse-static-v4'] }); await flush()
  assert.deepEqual(calls.deleted, ['cliniverse-v3'])
  calls.deleted.length = 0
  const handler = calls.swListeners.find(([type]) => type === 'controllerchange')
  assert.ok(handler, 'controllerchange listener registered')
  handler[1](); await flush()
  assert.deepEqual(calls.deleted, ['cliniverse-v3'])
  const recovery = loadRegister({ pathname: '/reset-password', cacheNames: ['cliniverse-v3'] }); await flush()
  assert.ok(recovery.swListeners.find(([type]) => type === 'controllerchange'), 'also on the recovery page')
})
