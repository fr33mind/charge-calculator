self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('charge-calculator-store').then(function(cache) {
     return cache.addAll([
       '/charge-calculator/battery-charging-64x64.png',
       '/charge-calculator/index.html',
       '/charge-calculator/index.js'
     ]);
   })
 );
});

self.addEventListener('fetch', function(e) {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
}); 
