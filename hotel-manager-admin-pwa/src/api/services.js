// hotel-manager-admin-pwa/src/api/services.js
import api from './axios'

export const authService = {
  login:    (credentials) => api.post('/auth/login', credentials),
  register: (data)        => api.post('/auth/register', data)
}

export const habitacionService = {
  listarTodas:       ()             => api.get('/habitaciones'),
  listarDisponibles: (entrada, salida) => api.get('/habitaciones/disponibles', { params: { entrada, salida } })
}

export const reservaService = {
  reservasDeHoy: ()               => api.get('/reservas/hoy'),
  listarTodas:   ()               => api.get('/reservas'),
  obtener:       (id)             => api.get(`/reservas/${id}`),
  cambiarEstado: (id, nuevoEstado) => api.patch(`/reservas/${id}/estado`, null, { params: { nuevoEstado } }),
  editar:        (id, data)       => api.put(`/reservas/${id}`, data),
  eliminar:      (id)             => api.delete(`/reservas/${id}`)
}

export const reporteAdminService = {
  ingresosHoy:    ()     => api.get('/reportes/admin/hoy'),
  ingresosSemana: ()     => api.get('/reportes/admin/semana'),
  ingresosMes:    ()     => api.get('/reportes/admin/mes'),
  ingresosAnual:  (anio) => api.get('/reportes/admin/anual', { params: { anio } })
}