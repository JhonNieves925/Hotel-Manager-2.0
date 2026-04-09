import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// ── Push Notifications ────────────────────────────────────────
self.addEventListener('push', event => {
  let data = {}
  try { data = event.data?.json() ?? {} } catch (_) { data = { body: event.data?.text() } }

  const title   = data.title ?? 'Hotel Manager'
  const options = {
    body:  data.body  ?? '',
    icon:  '/huesped/icons/icon-192.png',
    badge: '/huesped/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data:  { url: data.url ?? '/huesped/' }
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/huesped/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
