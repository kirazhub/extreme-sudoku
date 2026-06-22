// Extreme Sudoku — minimal Service Worker
// Strateji:
//  - install: app shell'i (/) onbellege al; geri kalan kaynaklar runtime'da dolar.
//  - activate: eski cache surumlerini sil.
//  - fetch: navigation isteklerinde network-first (canli surum), yedek olarak
//    cache; statik kaynaklarda cache-first (hizli ve cevrimdisi calisir).

const CACHE = "extreme-sudoku-v1";
const APP_SHELL = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {
        // Bir kaynak ulasilmazsa kuruluma engel olma.
      })
  );
  // Yeni surumu hemen aktive et (yeni acilan sekme tarafindan kullanilabilir).
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Sadece GET istekleri.
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Yalniz ayni origin'den olan kaynaklar.
  if (url.origin !== self.location.origin) return;

  // Sayfa navigasyonu (HTML): network-first, yedek cache.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/")))
    );
    return;
  }

  // Statik varliklar: cache-first.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Sadece basarili ayni-origin yanitlari onbellege ekle.
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
