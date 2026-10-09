// Généré par scripts/build.mjs — ne pas éditer.
const CACHE = 'formules-e6e4d354c9';
const FICHIERS = [
 "./",
 "index.html",
 "manifest.webmanifest",
 "data/formules.json",
 "css/style.css",
 "js/app.js",
 "js/icones.js",
 "js/quiz.js",
 "js/srs.js",
 "js/unites.js",
 "icons/apple-touch-icon.png",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/icon-maskable-512.png",
 "vendor/katex/katex.min.css",
 "vendor/katex/katex.min.js",
 "vendor/katex/fonts/KaTeX_AMS-Regular.woff2",
 "vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff2",
 "vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff2",
 "vendor/katex/fonts/KaTeX_Fraktur-Bold.woff2",
 "vendor/katex/fonts/KaTeX_Fraktur-Regular.woff2",
 "vendor/katex/fonts/KaTeX_Main-Bold.woff2",
 "vendor/katex/fonts/KaTeX_Main-BoldItalic.woff2",
 "vendor/katex/fonts/KaTeX_Main-Italic.woff2",
 "vendor/katex/fonts/KaTeX_Main-Regular.woff2",
 "vendor/katex/fonts/KaTeX_Math-BoldItalic.woff2",
 "vendor/katex/fonts/KaTeX_Math-Italic.woff2",
 "vendor/katex/fonts/KaTeX_SansSerif-Bold.woff2",
 "vendor/katex/fonts/KaTeX_SansSerif-Italic.woff2",
 "vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2",
 "vendor/katex/fonts/KaTeX_Script-Regular.woff2",
 "vendor/katex/fonts/KaTeX_Size1-Regular.woff2",
 "vendor/katex/fonts/KaTeX_Size2-Regular.woff2",
 "vendor/katex/fonts/KaTeX_Size3-Regular.woff2",
 "vendor/katex/fonts/KaTeX_Size4-Regular.woff2",
 "vendor/katex/fonts/KaTeX_Typewriter-Regular.woff2"
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const cle = e.request.mode === 'navigate' ? './' : e.request;
  e.respondWith(caches.match(cle, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
