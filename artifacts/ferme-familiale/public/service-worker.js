/* BLOC 10 — Service Worker minimal pour PWA + résilience hors-ligne */
const CACHE = "ferme-shell-v2";

// Stratégies :
//   - GET navigation (le document HTML) → network-first avec fallback cache.
//     Indispensable : le document n'est pas versionné et référence les bundles
//     hashés. En cache-first, un visiteur qui revient continue d'exécuter
//     l'ancienne application après chaque déploiement.
//   - GET assets statiques (JS/CSS/images) → cache-first : leur nom contient un
//     hash de contenu, une URL donnée ne change donc jamais.
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

  // Document HTML : network-first, fallback cache (hors-ligne)
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("./")))
    );
    return;
  }

  // Assets hashés : cache-first, fallback réseau, fallback HTML
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
