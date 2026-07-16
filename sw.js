// Cliniverse AI — Service Worker
// Network-first strategy: always tries to load the LATEST version first.
// Falls back to cache only when truly offline. This prevents the
// "stuck on an old broken version" white-screen bug.
const CACHE_NAME = "cliniverse-ai-v2"; // bumped to force-clear the old broken cache
const APP_SHELL = [
  "/cliniverse-app-v4.html",
  "/manifest.json"
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(key){ return key !== CACHE_NAME; })
            .map(function(key){ return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(event){
  // Only handle GET requests for our own app shell — let everything else
  // (Cloudinary videos, Supabase API calls) pass through to the network normally
  if(event.request.method !== "GET") return;
  if(event.request.url.indexOf(self.location.origin) !== 0) return;

  event.respondWith(
    // NETWORK FIRST: always try to get the freshest version
    fetch(event.request).then(function(response){
      if(response && response.status === 200){
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache){
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(function(){
      // Only fall back to cache when the network genuinely fails (offline)
      return caches.match(event.request).then(function(cached){
        return cached || caches.match("/cliniverse-app-v4.html");
      });
    })
  );
});
