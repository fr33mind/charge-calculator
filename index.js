// Register service worker to control making site work offline

if('serviceWorker' in navigator) {
  navigator.serviceWorker
           .register('/charge-calculator/sw.js')
           .then(function() { console.log('Service Worker Registered'); });
}
