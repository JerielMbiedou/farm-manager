/* BLOC 10 — Service Worker minimal pour PWA + résilience hors-ligne */
const CACHE = "ferme-shell-v1";

// Stratégies :
//   - GET HTML / assets statiques (navigateur) → cache-first avec fallback réseau
//   - GET /api/...  → network-first avec fallback cache (lecture)
//   - POST/PUT/DELETE /api/... → laissé au front (offline-queue.ts gère la file d'attente)

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(["./", "./favicon.svg", "./manifest.webmanifest"]).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // mutations gérées par offline-queue côté JS app

  const url = new URL(req.url);

  // API : network-first, fallback cache
  if (url.pathname.includes("/api/")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || new Response(JSON.stringify({ offline: true }), { status: 503, headers: { "Content-Type": "application/json" } })))
    );
    return;
  }

  // Shell : cache-first, fallback réseau, fallback HTML
  event.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req)
        .then((res) => {
          if (res.ok && (req.destination === "script" || req.destination === "style" || req.destination === "image" || req.destination === "document")) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match("./"))
    )
  );
});
