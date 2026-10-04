// Public static assets only. WORK, APIs, navigation and cross-origin requests stay network-only.
const CACHE = 'cliniverse-static-v4';
const STATIC = new Set(['/manifest.json', '/icons/icon.svg', '/icons/icon-192.svg', '/icons/icon-512.svg']);
const UNSAFE_LEGACY_CACHES = new Set(['cliniverse-v1', 'cliniverse-v2', 'cliniverse-v3']);

self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => UNSAFE_LEGACY_CACHES.has(k)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const request = e.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.search
    || !STATIC.has(url.pathname) || request.mode === 'navigate'
    || request.headers.has('Authorization') || request.headers.has('RSC')
    || request.headers.has('Next-Router-State-Tree')) return;
  e.respondWith((async () => {
    try {
      const response = await fetch(request);
      const cacheControl = response.headers.get('Cache-Control') || '';
      if (response.status === 200 && !response.redirected
        && !/no-store|private|no-cache/i.test(cacheControl)
        && (!response.url || new URL(response.url).origin === self.location.origin)) {
        try { await (await caches.open(CACHE)).put(request, response.clone()); }
        catch { /* Cache quota failure must not discard a valid network response. */ }
      }
      return response;
    } catch (error) {
      const cached = await (await caches.open(CACHE)).match(request);
      if (cached) return cached;
      throw error;
    }
  })());
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
