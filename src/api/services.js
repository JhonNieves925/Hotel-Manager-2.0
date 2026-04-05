// src/api/services.js
import api from './axios'

// ============================================================
// AUTH
// ============================================================
export const authService = {
  login:    (credentials) => api.post('/auth/login', credentials),
  register: (data)        => api.post('/auth/register', data)
}

// ============================================================
// HABITACIONES
// ============================================================
export const habitacionService = {
  listarTodas:      ()             => api.get('/habitaciones'),
  listarDisponibles:(entrada, salida) => api.get('/habitaciones/disponibles', {
    params: { entrada, salida }
  }),
  obtener:          (id)           => api.get(`/habitaciones/${id}`),
  cambiarEstado:    (id, nuevoEstado) => api.patch(`/habitaciones/${id}/estado`, null, {
    params: { nuevoEstado }
  })
}

// ============================================================
// RESERVAS
// ============================================================
export const reservaService = {
  listarTodas:   ()              => api.get('/reservas'),
  obtener:       (id)            => api.get(`/reservas/${id}`),
  reservasDeHoy: ()              => api.get('/reservas/hoy'),
  crear:         (data)          => api.post('/reservas', data),
  editar: (id, data) => api.put(`/reservas/${id}`, data),
  cambiarEstado: (id, nuevoEstado) => api.patch(`/reservas/${id}/estado`, null, {
    params: { nuevoEstado }
  }),
  eliminar:      (id)            => api.delete(`/reservas/${id}`)
}

// ============================================================
// HUÉSPEDES
// ============================================================
export const huespedService = {
  listarTodos: ()    => api.get('/huespedes'),
  obtener:     (id)  => api.get(`/huespedes/${id}`),
  buscar:      (q)   => api.get('/huespedes/buscar', { params: { q } }),
  eliminar:    (id)  => api.delete(`/huespedes/${id}`)
}

// ============================================================
// REPORTES ADMIN — datos financieros completos
// Solo accesible con rol admin
// ============================================================
export const reporteAdminService = {
  ingresosHoy:    ()     => api.get('/reportes/admin/hoy'),
  ingresosSemana: ()     => api.get('/reportes/admin/semana'),
  ingresosMes:    ()     => api.get('/reportes/admin/mes'),
  ingresosAnual:  (anio) => api.get('/reportes/admin/anual', { params: { anio } })
}

// ============================================================
// REPORTES OCUPACIÓN — solo datos de habitaciones
// Accesible para admin y empleado
// ============================================================
export const reporteOcupacionService = {
  hoy:    ()     => api.get('/reportes/ocupacion/hoy'),
  semana: ()     => api.get('/reportes/ocupacion/semana'),
  mes:    ()     => api.get('/reportes/ocupacion/mes'),
  anual:  (anio) => api.get('/reportes/ocupacion/anual', { params: { anio } })
}