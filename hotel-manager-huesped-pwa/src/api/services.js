import api from './axios'

export const huespedAuthService = {
  login:    (data) => api.post('/huesped-auth/login', data),
  register: (data) => api.post('/huesped-auth/register', data)
}

export const huespedReservasService = {
  misReservas: ()       => api.get('/huesped-reservas'),
  cancelar:    (id)     => api.patch(`/huesped-reservas/${id}/cancelar`)
}

export const huespedPerfilService = {
  obtener:    (id)       => api.get(`/huesped-perfil/${id}`),
  actualizar: (id, data) => api.put(`/huesped-perfil/${id}`, data)
}

export const habitacionService = {
  listarDisponibles: (entrada, salida) =>
    api.get('/habitaciones/disponibles', { params: { entrada, salida } }),
  obtener: (id) => api.get(`/habitaciones/${id}`)
}

export const reservaService = {
  crear: (data) => api.post('/reservas', data)
}

export const pushService = {
  vapidKey:  ()         => api.get('/push/vapid-key'),
  suscribir: (sub)      => api.post('/push/suscribir', sub),
  cancelar:  (endpoint) => api.delete('/push/cancelar', { data: { endpoint } })
}