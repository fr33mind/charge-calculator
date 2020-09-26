// Register service worker to control making site work offline

if('serviceWorker' in navigator) {
  navigator.serviceWorker
           .register('/charge-calculator/sw.js')
           .then(function() { alert('Service Worker Registered'); });
}
