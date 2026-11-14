/* ==========================================================================
   sw.js  -  service worker: lets the site open offline and load faster.
   Rules of thumb:
   - Pages, CSS, JS and data: always try the network first (so deploys show
     up straight away), fall back to the saved copy when offline or slow.
   - Fonts: saved once, reused.   Images: saved copy first, refreshed quietly.
   - Never touches the admin pages, forms, Supabase or any other website.
   Bump VERSION to clear every saved copy on all devices.
   ========================================================================== */
const VERSION = "v1";
const MAIN = "mech-main-" + VERSION;
const IMG = "mech-img-" + VERSION;
const OFFLINE = "/offline.html";
const MAX_IMAGES = 80;

const PRECACHE = [
  "/", "/about.html", "/academics.html", "/people.html", "/projects.html", "/news-events.html", "/resources.html",
  "/labs.html", "/gallery.html", "/partner.html", "/contact.html", "/privacy.html", "/accessibility.html", OFFLINE,
  "/css/tokens.css", "/css/base.css", "/css/components.css", "/css/pages.css", "/css/posts.css", "/css/forms.css", "/css/home.css",
  "/css/academics.css", "/css/people.css", "/css/projects.css", "/css/resources.css", "/css/contact.css", "/css/about.css",
  "/css/article.css", "/css/labs.css", "/css/gallery.css", "/css/partner.css", "/css/legal.css", "/css/error.css",
  "/js/site-config.js", "/js/supabase-config.js", "/js/supabase-lite.js", "/js/posts-ui.js", "/js/components.js",
  "/js/home-news.js", "/js/academics.js", "/js/people.js", "/js/projects.js", "/js/news-events.js", "/js/post.js",
  "/js/resources.js", "/js/contact.js", "/js/labs.js", "/js/gallery.js", "/js/partner.js", "/js/legal.js", "/js/offline.js",
  "/data/courses.js", "/data/people.js", "/data/projects.js", "/data/labs.js", "/data/gallery.js",
  "/fonts/inter-400.woff2", "/fonts/inter-500.woff2", "/fonts/inter-600.woff2", "/fonts/inter-700.woff2",
  "/fonts/space-grotesk-400.woff2", "/fonts/space-grotesk-500.woff2", "/fonts/space-grotesk-600.woff2", "/fonts/space-grotesk-700.woff2",
  "/fonts/jetbrains-mono-400.woff2", "/fonts/jetbrains-mono-500.woff2",
  "/favicon.svg", "/site.webmanifest"
];
const PRECACHE_IMAGES = ["/images/logo-sm.webp", "/images/logo.webp"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const main = await caches.open(MAIN);
    const img = await caches.open(IMG);
    /* one missing file must not stop the install */
    await Promise.allSettled(PRECACHE.map((u) => main.add(new Request(u, { cache: "reload" }))));
    await Promise.allSettled(PRECACHE_IMAGES.map((u) => img.add(new Request(u, { cache: "reload" }))));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith("mech-") && k !== MAIN && k !== IMG).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        /* Supabase, Web3Forms, Google Drive, etc. */
  const p = url.pathname;
  if (p.startsWith("/admin") || p === "/sw.js") return;   /* admin and the worker itself */

  if (req.mode === "navigate") { event.respondWith(networkFirst(req, true)); return; }
  if (p.startsWith("/fonts/")) { event.respondWith(cacheFirst(req)); return; }
  if (/\.(png|jpe?g|webp|svg|ico|gif)$/i.test(p)) { event.respondWith(staleWhileRevalidate(req)); return; }
  event.respondWith(networkFirst(req, false));
});

async function networkFirst(req, isPage) {
  const cache = await caches.open(MAIN);
  const net = fetch(req).then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; });
  net.catch(() => {});
  const slow = new Promise((_, reject) => setTimeout(() => reject(new Error("slow")), isPage ? 4500 : 6000));
  try {
    return await Promise.race([net, slow]);
  } catch (e) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (isPage) { const off = await cache.match(OFFLINE); if (off) return off; }
    return Response.error();
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(MAIN);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.ok) cache.put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(IMG);
  const hit = await cache.match(req);
  const net = fetch(req).then(async (res) => {
    if (res && res.ok) { await cache.put(req, res.clone()); trim(cache, MAX_IMAGES); }
    return res;
  }).catch(() => null);
  return hit || (await net) || Response.error();
}

async function trim(cache, max) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}
