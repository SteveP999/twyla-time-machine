// sw.js - Service Worker for Twyla's Time Machine
// Intercepts Suno's listen_milestone "completed" POST and notifies the page

self.addEventListener('fetch', function(event) {
  const url = event.request.url;
  
  // Watch for Suno's completion signal
  if (url.includes('listen_milestone') && event.request.method === 'POST') {
    event.respondWith(
      event.request.clone().json().then(function(body) {
        if (body && body.milestone === 'completed') {
          // Notify all clients (our page) that song completed
          self.clients.matchAll().then(function(clients) {
            clients.forEach(function(client) {
              client.postMessage({ type: 'SUNO_SONG_COMPLETE' });
            });
          });
        }
        // Still let the request go through to Suno
        return fetch(event.request);
      }).catch(function() {
        return fetch(event.request);
      })
    );
    return;
  }
  
  // All other requests pass through normally
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});
