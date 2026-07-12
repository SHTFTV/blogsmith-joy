// Legacy app-shell cache kill switch.
// This file intentionally does not precache or serve cached assets. It replaces
// the old app-shell service worker so returning browsers stop seeing stale
// pricing/design bundles after each publish.

function isLegacyAppCache(name) {
  return (
    name.startsWith('weddings-io-') ||
    name.startsWith('wio-app-') ||
    /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name)
  );
}

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.allSettled(cacheNames.filter(isLegacyAppCache).map((name) => caches.delete(name)));
      await self.clients.claim();
      const windowClients = await self.clients.matchAll({ type: 'window' });
      await Promise.allSettled(windowClients.map((client) => client.navigate(client.url)));
    } finally {
      await self.registration.unregister();
    }
  })());
});

// Paths that MUST always bypass any service worker handling and hit network fresh.
const ALWAYS_FRESH = [
  /^\/admin(\/|$)/,
  /^\/build-info\.json$/,
  /^\/pricing-version\.json$/,
  /^\/pricing(\/|$)/,
];

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  // For always-fresh paths, do not respondWith at all — let the browser
  // perform its own network fetch, fully bypassing the SW response pipeline.
  if (ALWAYS_FRESH.some((re) => re.test(url.pathname))) return;
  event.respondWith(fetch(event.request, { cache: 'no-store' }));
});
