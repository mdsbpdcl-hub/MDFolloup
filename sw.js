// Opens instantly from cache, refreshes the cache in the background.
const C = 'fu-v27';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './bulletin.html', './sticky.html'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // never touch server calls
  // One cache entry per file. The query part (e.g. ?text=… of a shared message) is dropped,
  // so message text is never sent to GitHub or kept in the cache.
  const key = u.origin + u.pathname;
  e.respondWith(caches.open(C).then(async c => {
    const hit = await c.match(key);
    const net = fetch(key).then(r => { if (r.ok) c.put(key, r.clone()); return r; })
                          .catch(() => hit || Response.error());
    return hit || net;
  }));
});
