<template>
  <div class="login-page">
    <div class="login-card">

      <div class="card-top">
        <RouterLink to="/inicio" class="btn-volver">← Volver</RouterLink>
        <div class="brand">
          <span class="brand-icon">✦</span>
          <span>Hotel Manager</span>
        </div>
      </div>

      <div class="card-header">
        <div class="header-badge">Acceso huéspedes</div>
        <h1>Bienvenido de vuelta</h1>
        <p>Inicia sesión para gestionar tus reservas</p>
      </div>

      <form @submit.prevent="handleLogin" class="form">
        <div class="form-group">
          <label>Correo electrónico</label>
          <input v-model="form.email" type="email" placeholder="juan@email.com" required :disabled="cargando" />
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <div class="input-wrap">
            <input v-model="form.password" :type="verPass ? 'text' : 'password'" placeholder="••••••••" required :disabled="cargando" />
            <button type="button" class="btn-ver" @click="verPass = !verPass">{{ verPass ? '○' : '●' }}</button>
          </div>
        </div>
        <div v-if="error" class="error-msg">⚠ {{ error }}</div>
        <button type="submit" class="btn-submit" :disabled="cargando">
          <span v-if="cargando" class="spinner"></span>
          <span v-else>Ingresar</span>
        </button>
      </form>

      <div class="card-footer">
        <span>¿No tienes cuenta?</span>
        <RouterLink to="/registro" class="link-registro">Regístrate aquí</RouterLink>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHuespedAuthStore } from '../stores/auth'

const router = useRouter()
const route  = useRoute()
const auth   = useHuespedAuthStore()

const form    = ref({ email: '', password: '' })
const cargando = ref(false)
const error    = ref('')
const verPass  = ref(false)

async function handleLogin() {
  cargando.value = true
  error.value    = ''
  try {
    await auth.login(form.value.email, form.value.password)
    const redirect = route.query.redirect || '/mis-reservas'
    router.push(redirect)
  } catch {
    error.value = 'Credenciales incorrectas. Verifica tu email y contraseña.'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

.login-page {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 2rem 1.5rem;
  background: linear-gradient(160deg, #0D1B3E 0%, #0A1628 45%, #1a0a2e 100%);
  font-family: 'Inter', sans-serif;
}

/* ── CARD ── */
.login-card {
  width: 100%; max-width: 420px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 16px; padding: 2rem;
  backdrop-filter: blur(16px);
  animation: fadeUp 0.5s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── CARD TOP ── */
.card-top {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 2rem;
}
.btn-volver {
  font-size: 0.72rem; font-weight: 500;
  color: rgba(255,255,255,0.4); transition: color 0.2s;
}
.btn-volver:hover { color: #E8773A; }

.brand {
  display: flex; align-items: center; gap: 0.5rem;
  font-family: 'Inter', sans-serif; font-size: 1rem; font-weight: 700;
  color: #E8773A; letter-spacing: 0.02em;
}
.brand-icon { color: #E8773A; font-size: 1rem; }

/* ── CARD HEADER ── */
.card-header { margin-bottom: 2rem; }

.header-badge {
  display: inline-block; font-size: 0.58rem; font-weight: 600;
  letter-spacing: 0.22em; text-transform: uppercase; color: #E8773A;
  border: 1px solid rgba(232,119,58,0.3);
  background: rgba(232,119,58,0.08);
  padding: 0.3rem 0.85rem; border-radius: 20px; margin-bottom: 1rem;
}
.card-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem; font-weight: 400; color: #fff; margin-bottom: 0.4rem;
}
.card-header p { font-size: 0.78rem; color: rgba(255,255,255,0.4); font-weight: 300; }

/* ── FORM ── */
.form { display: flex; flex-direction: column; gap: 1.1rem; margin-bottom: 1.5rem; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label {
  font-size: 0.6rem; font-weight: 500; letter-spacing: 0.15em;
  text-transform: uppercase; color: rgba(255,255,255,0.35);
}
.form-group input,
.input-wrap input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px; padding: 0.8rem 1rem;
  font-family: 'Inter', sans-serif; font-size: 0.875rem;
  font-weight: 400; color: #fff; outline: none;
  transition: all 0.25s; width: 100%;
}
.form-group input:focus,
.input-wrap input:focus {
  border-color: rgba(232,119,58,0.5);
  background: rgba(232,119,58,0.04);
}
.form-group input::placeholder { color: rgba(255,255,255,0.2); }

.input-wrap { position: relative; }
.input-wrap input { padding-right: 3rem; }
.btn-ver {
  position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
  background: transparent; border: none; color: rgba(255,255,255,0.3);
  font-size: 0.65rem; cursor: pointer; padding: 0.25rem; transition: color 0.2s;
}
.btn-ver:hover { color: #E8773A; }

/* ── ERROR ── */
.error-msg {
  background: rgba(252,129,74,0.08); border: 1px solid rgba(252,129,74,0.2);
  border-radius: 6px; padding: 0.7rem 1rem; font-size: 0.8rem; color: #fc814a;
  display: flex; align-items: center; gap: 0.5rem;
}

/* ── SUBMIT ── */
.btn-submit {
  background: #E8773A; color: #fff; border: none; border-radius: 6px;
  padding: 0.9rem; font-family: 'Inter', sans-serif; font-size: 0.72rem;
  font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
  transition: all 0.25s; display: flex; align-items: center;
  justify-content: center; gap: 0.5rem;
}
.btn-submit:hover:not(:disabled) { background: #F28C4E; transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

.spinner {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,0.25);
  border-top-color: #fff;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── FOOTER ── */
.card-footer {
  text-align: center; padding-top: 1.25rem;
  border-top: 1px solid rgba(255,255,255,0.07);
  font-size: 0.75rem; color: rgba(255,255,255,0.35);
  display: flex; justify-content: center; gap: 0.5rem;
}
.link-registro { color: #E8773A; font-weight: 500; transition: color 0.2s; }
.link-registro:hover { color: #F28C4E; }
</style>