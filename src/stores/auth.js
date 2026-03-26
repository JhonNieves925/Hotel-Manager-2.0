// src/stores/auth.js
// Estado global de autenticación.
// Guarda el usuario y token en localStorage para que
// persistan aunque el usuario recargue la página.

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../api/services'

export const useAuthStore = defineStore('auth', () => {

  // Estado — se inicializa desde localStorage si ya había sesión
  const token = ref(localStorage.getItem('token') || null)
  const usuario = ref(
    JSON.parse(localStorage.getItem('usuario') || 'null')
  )

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin    = computed(() => usuario.value?.rol === 'admin')
  const isEmpleado = computed(() =>
    usuario.value?.rol === 'empleado' || usuario.value?.rol === 'admin'
  )
  const nombreUsuario = computed(() => usuario.value?.nombre || '')

  // Login — llama al backend y guarda el token
  async function login(email, password) {
    const response = await authService.login({ email, password })
    const data = response.data

    token.value   = data.token
    usuario.value = {
      email:  data.email,
      nombre: data.nombre,
      rol:    data.rol
    }

    // Persistir en localStorage
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(usuario.value))

    return data
  }

  // Logout — limpia todo
  function logout() {
    token.value   = null
    usuario.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  return {
    token,
    usuario,
    isLoggedIn,
    isAdmin,
    isEmpleado,
    nombreUsuario,
    login,
    logout
  }
})