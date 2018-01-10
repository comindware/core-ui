const staticCacheName = 'core-ui-cache';

this.addEventListener('install', event => {
    event.waitUntil(
        caches.open(staticCacheName).then(cache => cache.addAll([
            './app.css',
            './app.js',
            './index.html',
            './vendor.js'
        ]))
    );
});

this.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => Promise.all(
            cacheNames.filter(cacheName => cacheName.startsWith('core-ui-cache-old') &&
                        cacheName !== staticCacheName).map(cacheName => caches.delete(cacheName))
        ))
    );
});

function fromCache(request) {
    return caches.open(staticCacheName).then(cache =>
        cache.match(request).then(matching =>
            matching || Promise.reject('no-match')
        ));
}

function update(request) {
    return caches.open(staticCacheName).then(cache =>
        fetch(request).then(response =>
            cache.put(request, response)
        )
    );
}

this.addEventListener('fetch', event => {
    event.respondWith(fromCache(event.request));

    event.waitUntil(update(event.request));
});

this.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') {
        this.skipWaiting();
    }
});
