const CACHE_NAME = 'matrix-ai-v2'; // بدلنا v1 ل v2 باش يتمسح القديم
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
  // نحينا app.js من هنا باش ما يبقاش يحفظ القديم
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(()=>caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
});

self.addEventListener('fetch', e => {
  // للـ app.js ديما جيب الجديد
  if(e.request.url.includes('app.js')){
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
