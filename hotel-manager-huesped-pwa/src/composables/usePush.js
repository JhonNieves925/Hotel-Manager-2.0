import api from '../api/axios'

/**
 * Convierte una clave VAPID base64url en un Uint8Array
 * necesario para PushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

  try {
    // 1. Pedir permiso al usuario
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    // 2. Obtener clave pública VAPID del backend
    const { data } = await api.get('/push/vapid-key')
    const appServerKey = urlBase64ToUint8Array(data.publicKey)

    // 3. Suscribirse al push
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey
    })

    // 4. Enviar la suscripción al backend
    const sub = subscription.toJSON()
    await api.post('/push/suscribir', {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.keys.p256dh,
        auth:   sub.keys.auth
      }
    })
  } catch (err) {
    console.warn('[Push] No se pudo activar notificaciones:', err)
  }
}

export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) return

    await api.delete('/push/cancelar', { data: { endpoint: subscription.endpoint } })
    await subscription.unsubscribe()
  } catch (err) {
    console.warn('[Push] Error al cancelar suscripción:', err)
  }
}
