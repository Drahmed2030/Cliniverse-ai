// Register the service worker (see sw.js for what it does and never does).
(function () {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  var CURRENT_CACHE = 'cliniverse-static-v4';

  // Remove caches left by earlier workers straight away, even before an updated worker takes control.
  // Only Cliniverse-named caches other than the current one are touched.
  function purgeLegacyCaches() {
    if (!('caches' in window)) return;
    caches.keys().then(function (names) {
      names.filter(function (name) { return /^cliniverse/i.test(name) && name !== CURRENT_CACHE; })
        .forEach(function (name) { caches.delete(name); });
    }).catch(function () {});
  }

  purgeLegacyCaches();
  // The password-recovery page carries one-time tokens: it never registers or updates a worker.
  if (/^\/reset-password(\/|$)/i.test(window.location.pathname)) return;

  function register() {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then(function (registration) { registration.update().catch(function () {}); })
      .catch(function () {});
  }
  // This script is loaded after hydration, which can be after the window "load" event has already fired.
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register);
})();
