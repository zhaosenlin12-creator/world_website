/* Minimal compatibility stub.
 * Some legacy browsers or extensions auto-request /sw.js. We never register
 * this file as a real service worker, but we serve a 200 response so the
 * network panel no longer reports a 404 and confused cache cleanup logic
 * stops removing future chunks.
 */
self.addEventListener("install", () => {
  // Activate immediately so the noop worker replaces any older registration.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Claim existing clients but explicitly do NOT pre-cache anything: this
  // project ships through Next.js and must always serve fresh bundles.
  event.waitUntil(self.clients.claim());
});

// Pass-through fetch handler. Returning the live network response keeps the
// browser from intercepting asset requests and lets Next.js own caching.
self.addEventListener("fetch", () => {
  // intentionally empty: no respondWith -> default network fetch.
});
