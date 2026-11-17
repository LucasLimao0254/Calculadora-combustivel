// Service worker: deixa o app funcionar offline depois do primeiro acesso.
// - Página (navegação): rede primeiro, para pegar sempre a versão nova; sem rede, usa o cache.
// - Chart.js, fontes e ícones: cache primeiro, atualizando em segundo plano.
// Mude VERSAO para forçar a limpeza dos caches antigos.
const VERSAO = "v2";
const CACHE = "calc-reajuste-" + VERSAO;
const BASE = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png", "./icons/favicon-32.png",
  "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"];

self.addEventListener("install", e => {
  // cache: "reload" ignora o cache HTTP do navegador (o GitHub Pages guarda arquivos por 10 min)
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(BASE.map(u => c.add(new Request(u, { cache: "reload" })).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("calc-reajuste-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (req.mode === "navigate") {
    // no-cache: sempre confere com o servidor (ETag), para não abrir uma versão antiga da página
    e.respondWith(fetch(req.url, { cache: "no-cache", credentials: "same-origin" }).then(res => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", copia)); }
      return res;
    }).catch(() => caches.match("./index.html").then(r => r || caches.match("./"))));
    return;
  }

  const outros = ["cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];
  if (url.origin === location.origin || outros.includes(url.hostname)) {
    e.respondWith(caches.match(req).then(cached => {
      const rede = fetch(req).then(res => {
        if (res.ok || res.type === "opaque") { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
        return res;
      }).catch(() => cached);
      return cached || rede;
    }));
  }
});
