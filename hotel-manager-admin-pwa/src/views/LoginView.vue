<template>
  <div class="login-page">

    <div class="login-top">
      <div class="login-logo">HM</div>
      <h1>Hotel Manager</h1>
      <p>Panel de administración</p>
    </div>

    <div class="login-card">
      <form @submit.prevent="handleLogin">

        <div class="field">
          <label>Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="admin@hotelmanager.co"
            autocomplete="email"
            required
            :disabled="cargando"
          />
        </div>

        <div class="field">
          <label>Contraseña</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            required
            :disabled="cargando"
          />
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button type="submit" class="btn-login" :disabled="cargando">
          {{ cargando ? 'Ingresando...' : 'Ingresar' }}
        </button>

      </form>
    </div>

    <p class="login-nota">Acceso exclusivo para administradores</p>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const form     = ref({ email: '', password: '' })
const cargando = ref(false)
const error    = ref('')

async function handleLogin() {
  cargando.value = true
  error.value    = ''
  try {
    await authStore.login(form.value.email, form.value.password)
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch (e) {
    error.value = e.message || e.response?.data?.error || 'Error al ingresar'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  background: linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%, #2563eb 100%);
}

.login-top {
  text-align: center;
  margin-bottom: 2rem;
  color: #fff;
}

.login-logo {
  width: 64px;
  height: 64px;
  background: rgba(255,255,255,0.15);
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 800;
  color: #fff;
  margin: 0 auto 1rem;
  letter-spacing: 1px;
}

.login-top h1 {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.login-top p {
  font-size: 0.9rem;
  opacity: 0.7;
}

.login-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 1.75rem 1.5rem;
  width: 100%;
  max-width: 360px;
  box-shadow: var(--shadow-md);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.field label {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--text-muted);
}

.field input {
  padding: 0.75rem 1rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  font-size: 1rem;
  outline: none;
  color: var(--text);
  transition: border-color 0.2s;
  background: #fff;
}

.field input:focus { border-color: var(--primary); }
.field input:disabled { background: #f8fafc; }

.error-msg {
  background: #fef2f2;
  color: var(--danger);
  border: 1px solid #fecaca;
  border-radius: var(--radius);
  padding: 0.65rem 1rem;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.btn-login {
  width: 100%;
  background: var(--primary);
  color: #fff;
  border-radius: var(--radius);
  padding: 0.85rem;
  font-size: 1rem;
  font-weight: 700;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.btn-login:hover:not(:disabled) { background: var(--primary-dark); }
.btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

.login-nota {
  margin-top: 1.5rem;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.45);
  text-align: center;
}
</style>