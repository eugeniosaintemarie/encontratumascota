const CACHE_NAME = 'encontratumascota-v2'

const PRECACHE_URLS = [
  '/favicon.svg',
  '/apple-icon.png',
  '/manifest.json',
]

// Install: precache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: network-first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip non-http or cross-origin requests (don't intercept external images/assets)
  try {
    const url = new URL(event.request.url)
    if (url.origin !== self.location.origin) return

    // Nunca cachear endpoints API
    if (url.pathname.startsWith('/api/')) return

    // No cachear navegaciones/documentos para evitar HTML/JS desfasado
    if (event.request.mode === 'navigate') return

    // No cachear chunks/scripts de Next para evitar hydration mismatch
    if (url.pathname.startsWith('/_next/')) return
  } catch (e) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful same-origin responses (avoid opaque cross-origin issues)
        if (response && response.ok && (response.type === 'basic' || response.type === 'cors')) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(() => {})
          })
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
