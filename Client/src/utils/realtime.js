import { io } from 'socket.io-client'

let socketInstance = null

const resolveSocketUrl = () => {
  const explicitSocketUrl = String(import.meta.env.VITE_SOCKET_URL || '').trim()
  if (explicitSocketUrl) {
    return explicitSocketUrl.replace(/\/$/, '')
  }

  const apiUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

  if (/^https?:\/\//i.test(apiUrl)) {
    return apiUrl.replace(/\/api$/i, '')
  }

  if (import.meta.env.DEV) {
    const devBackendUrl = String(import.meta.env.VITE_DEV_BACKEND_URL || '').trim()
    if (devBackendUrl) {
      return devBackendUrl.replace(/\/$/, '')
    }

    return 'http://127.0.0.1:5000'
  }

  return window.location.origin
}

export const getRealtimeSocket = () => {
  if (socketInstance) {
    return socketInstance
  }

  socketInstance = io(resolveSocketUrl(), {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 3000
  })

  return socketInstance
}
