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
      caches.match(url.pathname).then((cacheResponse) => {
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
          .then((cache) =>
            fetch(event.request).then((response) => {
              console.log('metadata_cache_put', response.clone());
              cache.put(url.pathname, response.clone());
              return response;
            })
          )
          .catch((error) => {
            console.error('Cache operation failed:', error);
            return new Response(
              JSON.stringify({ code: 500, msg: 'Cache operation failed' }),
              {
                status: 500,
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
          });
      })
    );
  }
});
