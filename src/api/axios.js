// src/api/axios.js
// Cliente HTTP configurado para conectarse al backend Spring Boot.
// Agrega automáticamente el token JWT en cada request
// y maneja errores de autenticación globalmente.

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',  //'/api',
  headers: { 
    'Content-Type': 'application/json'
    //'ngrok-skip-browser-warning': 'true'
   }
})

// Interceptor de request — agrega el token JWT si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de response — si el token expiró redirige al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api