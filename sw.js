var staticCacheName = 'curr-conv-static-v1';
var contentImgsCache = "curr-conv-imgs";
var allCaches = [
  staticCacheName,
  contentImgsCache
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      return cache.addAll([
        '/skeleton',
        'js/app.js',
        'css/app.css',
        'imgs/icon.png',
        'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
        'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
      ]);
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (cacheName) {
          return cacheName.startsWith("curr-conv-") && !allCaches.includes(cacheName);
        }).map(function (cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function (event) {
  var requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === '/') {
      event.respondWith(caches.match('/skeleton'));
      return;
    }

    // TODO: respond to xxx urls by responding with
    // the return value of serveXXX(event.request)
    if (requestUrl.pathname.startsWith("/xxx/")) {
      event.respondWith(serveXXX(event.request));
      return;
    }
  }

  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});

function serveXXX(request) {
  // xxx urls look like:
  // xxx/sam-2x.jpg
  var storageUrl = request.url.replace(/-\dx\.jpg$/, '');

  // TODO: return images from the "curr-conv-" cache
  // if they're in there. But afterwards, go to the network
  // to update the entry in the cache.

  return caches.open(staticCacheName).then(function(cache) {
    return cache.match(storageUrl).then(function(response) {
      var networkFetch = fetch(storageUrl).then(function(networkResponse) {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
      return response || networkFetch;
    });
  });
}

self.addEventListener('message', function (event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});