const CACHE_NAME = 'penguin-race-v1';
const ASSETS = [
  './penguin_mobile.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// 설치 시 캐시 저장
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS.filter(a => !a.endsWith('.png')));
    })
  );
  self.skipWaiting();
});

// 활성화 시 구버전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 요청 처리: 네트워크 우선, 실패 시 캐시 반환 (항상 최신 버전 유지)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
