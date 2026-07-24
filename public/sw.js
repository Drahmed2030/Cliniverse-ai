self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Cliniverse AI'
  const options = {
    body: data.body || 'New clinical case waiting for you',
    icon: '/og.png',
    badge: '/og.png',
    data: { url: data.url || 'https://cliniverse-ai-xmev.vercel.app' }
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url))
})
