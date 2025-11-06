const METADATA_BUCKET_NAME = 'diana-audio-metadata-cache';
const AUDIO_BUCKET_NAME = 'diana-audio-file-cache';

self.addEventListener('install', (_) => {
  console.log('service worker installed');
  _.waitUntil(self.skipWaiting());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (
    url.pathname.match('/api/podcast/fetch/([0-9]+)') ||
    url.hostname.endsWith('music.126.net') ||
    url.hostname.endsWith('music.163.com')
  ) {
    event.respondWith(
      caches.match(url).then((cacheResponse) => {
        if (cacheResponse) {
          console.log('metadata_cache_hit', cacheResponse);
          return cacheResponse;
        }

        return caches
          .open(
            url.hostname.endsWith('music.126.net') ||
              url.hostname.endsWith('music.163.com')
              ? AUDIO_BUCKET_NAME
              : METADATA_BUCKET_NAME
          )
          .then((bucket) => {
            return fetch(event.request.url).then((res) => {
              console.log('metadata_cache_push', res);
              bucket.put(event.request.url, res.clone());
              return res;
            });
          });
      })
    );
  }
});

self.addEventListener('message', (event) => {
  const { action } = event.data;
  if (action === 'CACHE_CLEAR') {
    caches.delete(METADATA_BUCKET_NAME).then((_) => {
      caches.delete(AUDIO_BUCKET_NAME).then((__) => {
        console.log('cache storage cleared');
        return;
      });
    });
  }
});
