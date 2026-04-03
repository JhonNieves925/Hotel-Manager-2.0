import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { huespedAuthService } from '../api/services'
import { huespedPerfilService } from '../api/services'

export const useHuespedAuthStore = defineStore('huespedAuth', () => {

  const token   = ref(localStorage.getItem('huesped_token') || null)
  const usuario = ref(JSON.parse(localStorage.getItem('huesped_usuario') || 'null'))

  const isLoggedIn  = computed(() => !!token.value)
  const nombreCompleto = computed(() =>
    usuario.value ? `${usuario.value.nombre} ${usuario.value.apellido}` : ''
  )

  async function login(email, password) {
  const res = await huespedAuthService.login({ email, password })
  token.value   = res.data.token
  
  // Guardar token primero para que el interceptor lo use
  localStorage.setItem('huesped_token', res.data.token)
  
  // Cargar perfil completo
  const perfilRes = await huespedPerfilService.obtener(res.data.id)
  
  usuario.value = {
    id:              res.data.id,
    nombre:          perfilRes.data.nombre,
    apellido:        perfilRes.data.apellido,
    email:           perfilRes.data.email,
    telefono:        perfilRes.data.telefono,
    nacionalidad:    perfilRes.data.nacionalidad,
    fechaNacimiento: perfilRes.data.fechaNacimiento,
    tipoDocumento:   perfilRes.data.tipoDocumento,
    numeroDocumento: perfilRes.data.numeroDocumento,
    rol:             'huesped'
  }
  localStorage.setItem('huesped_usuario', JSON.stringify(usuario.value))
  return res.data
}

  async function register(data) {
    const res = await huespedAuthService.register(data)
    return res.data
  }

  function logout() {
    token.value   = null
    usuario.value = null
    localStorage.removeItem('huesped_token')
    localStorage.removeItem('huesped_usuario')
  }

  return { token, usuario, isLoggedIn, nombreCompleto, login, register, logout }
})