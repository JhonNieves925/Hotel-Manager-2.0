<template>
  <div class="login-page">
    <div class="login-card">

      <div class="login-header">
        <h1>Hotel Manager</h1>
        <p>Inicia sesión para continuar</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="admin@hotelmanager.co"
            required
            :disabled="cargando"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
            :disabled="cargando"
          />
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-msg">
          {{ error }}
        </div>

        <button type="submit" class="btn-login" :disabled="cargando">
          {{ cargando ? 'Iniciando sesión...' : 'Iniciar sesión' }}
        </button>

      </form>

      <div class="login-footer">
        <RouterLink to="/">Volver al portal de reservas</RouterLink>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router   = useRouter()
const route    = useRoute()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})
const cargando = ref(false)
const error    = ref('')

async function handleLogin() {
  cargando.value = true
  error.value    = ''

  try {
    await authStore.login(form.value.email, form.value.password)
    // Si había una ruta destino guardada, redirige ahí
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al iniciar sesión'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
  padding: 1rem;
}

.login-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-md);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-gray-800);
  margin-bottom: 0.25rem;
}

.login-header p {
  color: var(--color-gray-400);
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-600);
}

.form-group input {
  padding: 0.7rem 1rem;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius);
  font-size: 0.95rem;
  transition: border-color 0.2s;
  outline: none;
}

.form-group input:focus {
  border-color: var(--color-primary);
}

.form-group input:disabled {
  background: var(--color-gray-100);
  cursor: not-allowed;
}

.error-msg {
  background: #fef2f2;
  color: var(--color-danger);
  border: 1px solid #fecaca;
  border-radius: var(--radius);
  padding: 0.6rem 1rem;
  font-size: 0.875rem;
}

.btn-login {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.btn-login:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--color-gray-400);
}
</style>