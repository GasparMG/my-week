// Service worker de "Mi semana": guarda la app en el celular para que abra sin internet.
// Si cambias algún archivo, sube el número de VERSION para que el celular baje la versión nueva.
const VERSION = "mi-semana-v1";
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    // Primero lo guardado; si hay internet, actualiza en segundo plano.
    e.respondWith(
      caches.match("./index.html").then((cached) => {
        const net = fetch(req).then((res) => {
          if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put("./index.html", copy)); }
          return res;
        }).catch(() => cached);
        return cached || net;
      })
    );
    return;
  }
  e.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
