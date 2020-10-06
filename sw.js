self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('charge-calculator-store-v2').then(function(cache) {
     return cache.addAll([
       '/charge-calculator/',
       '/charge-calculator/index.html',
       '/charge-calculator/index.js',
       '/charge-calculator/style.css',
       '/charge-calculator/battery-charging-64x64.png',
       '/charge-calculator/battery-charging-256x256.png'
     ]);
   })
 );
});

self.addEventListener('fetch', function(e) {
  //console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
}); 

self.addEventListener('activate', (event) => {
  var cacheKeeplist = ['charge-calculator-store-v2'];

  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (cacheKeeplist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});
