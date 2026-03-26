// src/api/services.js
import api from './axios'

export const authService = {
  login:    (credentials) => api.post('/auth/login', credentials),
  register: (data)        => api.post('/auth/register', data)
}

export const habitacionService = {
  listarTodas: () => api.get('/habitaciones')
}

export const reservaService = {
  reservasDeHoy: ()              => api.get('/reservas/hoy'),
  listarTodas:   ()              => api.get('/reservas'),
  cambiarEstado: (id, nuevoEstado) => api.patch(`/reservas/${id}/estado`, null, {
    params: { nuevoEstado }
  })
}

// Reportes solo admin — datos financieros completos
export const reporteAdminService = {
  ingresosHoy:    ()     => api.get('/reportes/admin/hoy'),
  ingresosSemana: ()     => api.get('/reportes/admin/semana'),
  ingresosMes:    ()     => api.get('/reportes/admin/mes'),
  ingresosAnual:  (anio) => api.get('/reportes/admin/anual', { params: { anio } })
}