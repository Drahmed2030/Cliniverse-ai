// Cliniverse service worker — deliberately minimal and fail-closed.
//
// What it does: keeps a tiny allow-list of PUBLIC static files (offline page, manifest, icons, hashed Next assets)
// and shows the offline page when a page navigation fails.
// What it never does: touch authentication, session, recovery or API traffic. Those requests are not intercepted
// at all (no respondWith), so they are never read from or written to the Cache API and never answered with a
// cached page. Earlier versions cached every successful GET (including Supabase responses) and answered any
// failure with the cached "/" page; activation below removes those caches.

const CACHE = 'cliniverse-static-v4';
const CACHE_PREFIX = /^cliniverse/i; // every cache this worker family ever created
const OFFLINE_URL = '/native-offline.html';
const PRECACHE = [OFFLINE_URL, '/manifest.json', '/icons/icon-192.svg', '/icons/icon-512.svg'];
const STATIC_EXACT = new Set(PRECACHE);
const STATIC_PREFIXES = ['/icons/', '/_next/static/'];

// Never intercepted, whatever the origin or method of the request.
const SENSITIVE_PATH = /^\/(reset-password|auth|api|login|signin|signup|callback|account)(\/|$)/;
const SENSITIVE_UPSTREAM_PATH = /\/(auth|rest|functions|storage|realtime|graphql)\/v1(\/|$)/;
const SENSITIVE_QUERY_KEYS = [
  'access_token', 'refresh_token', 'provider_token', 'token', 'token_hash', 'code', 'type', 'nonce',
  'error', 'error_code', 'error_description', 'id_token', 'redirect_to',
];
const SENSITIVE_HEADERS = ['authorization', 'apikey', 'x-client-info', 'rsc', 'next-router-state-tree', 'next-action'];

// Normalises case, repeated slashes and percent-encoding so "/%72eset-password", "//Reset-Password/" etc. match too.
function normalisePath(pathname) {
  let decoded = pathname;
  try { decoded = decodeURIComponent(pathname); } catch (error) { /* keep the raw path */ }
  return decoded.toLowerCase().replace(/\/{2,}/g, '/');
}

function shouldBypass(request, url) {
  if (url.origin !== self.location.origin) return true; // Supabase and every other third party
  const path = normalisePath(url.pathname);
  if (SENSITIVE_PATH.test(path) || SENSITIVE_UPSTREAM_PATH.test(path)) return true;
  for (const key of SENSITIVE_QUERY_KEYS) if (url.searchParams.has(key)) return true;
  if (/(^|[?&#])(access_token|refresh_token)=/i.test(url.search + url.hash)) return true;
  for (const name of SENSITIVE_HEADERS) if (request.headers.has(name)) return true;
  if (request.cache === 'no-store') return true;
  return false;
}

function isStaticAsset(path) {
  return STATIC_EXACT.has(path) || STATIC_PREFIXES.some(prefix => path.startsWith(prefix));
}

function isCacheable(response) {
  if (!response || response.status !== 200) return false;
  if (response.type !== 'basic' && response.type !== 'default') return false; // same-origin responses only; never opaque/cors
  const cacheControl = response.headers.get('cache-control') || '';
  if (/no-store|private|no-cache/i.test(cacheControl) && !/immutable/i.test(cacheControl)) return false;
  if ((response.headers.get('vary') || '').includes('*')) return false;
  return true;
}

self.addEventListener('install', event => {
  // One missing file must never abort the install (the previous version listed PNG icons that do not exist).
  event.waitUntil(
    caches.open(CACHE).then(cache => Promise.all(PRECACHE.map(url => cache.add(url).catch(() => undefined))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Remove every earlier cache of this worker family (e.g. "cliniverse-v3"), which may hold auth or recovery
    // responses. Caches that do not belong to Cliniverse are left alone.
    const names = await caches.keys();
    await Promise.all(names.filter(name => CACHE_PREFIX.test(name) && name !== CACHE).map(name => caches.delete(name)));
    // Defence in depth: drop anything in the current cache that the policy would not store today.
    const cache = await caches.open(CACHE);
    for (const request of await cache.keys()) {
      const url = new URL(request.url);
      if (url.origin !== self.location.origin || !isStaticAsset(normalisePath(url.pathname)) || shouldBypass(request, url)) {
        await cache.delete(request);
      }
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  let url;
  try { url = new URL(request.url); } catch (error) { return; }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return;
  if (shouldBypass(request, url)) return; // pure network: no cache read, no cache write, no fallback page

  if (isStaticAsset(normalisePath(url.pathname))) {
    event.respondWith(
      fetch(request).then(response => {
        if (isCacheable(response)) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => undefined);
        }
        return response;
      }).catch(() => caches.open(CACHE).then(cache => cache.match(request)).then(cached => cached || Response.error()))
    );
    return;
  }

  if (request.mode === 'navigate') {
    // Only the generic offline page is ever substituted — never a cached app or account page.
    event.respondWith(
      fetch(request).catch(() => caches.open(CACHE).then(cache => cache.match(OFFLINE_URL)).then(page => page || Response.error()))
    );
  }
  // Anything else (API calls, data, RSC payloads): not intercepted.
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Cliniverse AI', {
      body: data.body || 'Your daily clinical challenge is ready!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      data: { url: data.url || '/' },
      actions: [
        { action: 'open',    title: 'Start Training' },
        { action: 'dismiss', title: 'Later' },
      ],
    })
  );
});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow(e.notification.data?.url || '/');
    })
  );
});
