// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../api/services'

export const useAuthStore = defineStore('auth', () => {

  const token   = ref(localStorage.getItem('token') || null)
  const usuario = ref(JSON.parse(localStorage.getItem('usuario') || 'null'))

  const isLoggedIn    = computed(() => !!token.value)
  const isAdmin       = computed(() => usuario.value?.rol === 'admin')
  const nombreUsuario = computed(() => usuario.value?.nombre || '')

  async function login(email, password) {
    const res  = await authService.login({ email, password })
    const data = res.data

    // Solo admin puede entrar a la app
    if (data.rol !== 'admin') {
      throw new Error('Solo los administradores pueden acceder a esta app')
    }

    token.value   = data.token
    usuario.value = { email: data.email, nombre: data.nombre, rol: data.rol }

    localStorage.setItem('token',   data.token)
    localStorage.setItem('usuario', JSON.stringify(usuario.value))

    return data
  }

  function logout() {
    token.value   = null
    usuario.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  return { token, usuario, isLoggedIn, isAdmin, nombreUsuario, login, logout }
})