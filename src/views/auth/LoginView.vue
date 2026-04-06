<template>
  <div class="login-page">

    <!-- Panel izquierdo decorativo -->
    <div class="login-left">
      <div class="left-content">
        <div class="left-logo">
          <span class="logo-icon">✦</span>
          <span class="logo-text">Hotel Manager</span>
        </div>
        <div class="left-estrellas">★★★★★</div>
        <h2 class="left-titulo">Panel de<br/>gestión hotelera</h2>
        <p class="left-sub">Acceso exclusivo para el equipo del hotel</p>
        <div class="left-deco">
          <div class="deco-line"></div>
          <span class="deco-texto">Sistema de gestión</span>
          <div class="deco-line"></div>
        </div>
        <div class="left-features">
          <div class="feature-item">
            <span class="feature-icon">◈</span>
            <span>Gestión de reservas en tiempo real</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">◈</span>
            <span>Control de habitaciones y huéspedes</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">◈</span>
            <span>Reportes financieros y de ocupación</span>
          </div>
        </div>
      </div>
      <div class="left-particles">
        <span v-for="i in 12" :key="i" class="particle" :style="particleStyle(i)"></span>
      </div>
    </div>

    <!-- Panel derecho — formulario -->
    <div class="login-right">
      <div class="login-card">

        <div class="card-header">
          <div class="card-badge">Acceso restringido</div>
          <h1 class="card-titulo">Acceso para<br/>empleados y admin</h1>
          <p class="card-sub">Ingresa tus credenciales para continuar</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">

          <div class="form-group">
            <label for="email">
              <span class="label-icon">◉</span> Correo electrónico
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="empleado@hotelmanager.co"
              required
              :disabled="cargando"
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="password">
              <span class="label-icon">◉</span> Contraseña
            </label>
            <div class="input-wrap">
              <input
                id="password"
                v-model="form.password"
                :type="verPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                :disabled="cargando"
                autocomplete="current-password"
              />
              <button type="button" class="btn-ver" @click="verPassword = !verPassword">
                {{ verPassword ? '◯' : '●' }}
              </button>
            </div>
          </div>

          <div v-if="error" class="error-msg">
            <span>⚠</span> {{ error }}
          </div>

          <button type="submit" class="btn-login" :disabled="cargando">
            <span v-if="cargando" class="btn-spinner"></span>
            <span v-else>Ingresar al panel</span>
          </button>

        </form>

        <div class="card-footer">
          <RouterLink to="/" class="link-volver">
            ← Volver al portal de reservas
          </RouterLink>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const form = ref({ email: '', password: '' })
const cargando   = ref(false)
const error      = ref('')
const verPassword = ref(false)

function particleStyle(i) {
  return {
    left: `${(i * 19 + 7) % 100}%`,
    top:  `${(i * 27 + 5) % 100}%`,
    animationDelay: `${(i * 0.5) % 5}s`,
    width:  i % 3 === 0 ? '3px' : '2px',
    height: i % 3 === 0 ? '3px' : '2px',
    opacity: 0.15 + (i % 4) * 0.08
  }
}

async function handleLogin() {
  cargando.value = true
  error.value    = ''
  try {
    await authStore.login(form.value.email, form.value.password)
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch (e) {
    error.value = e.response?.data?.error || 'Credenciales incorrectas. Verifica tu email y contraseña.'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: 'Inter', sans-serif;
}

/* ─── PANEL IZQUIERDO ─── */
.login-left {
  background: linear-gradient(160deg, #0D1B3E 0%, #0A1628 50%, #1a0a2e 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.left-content {
  position: relative;
  z-index: 2;
  max-width: 400px;
}

.left-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 2rem;
}

.logo-icon { color: #E8773A; font-size: 1rem; }

.logo-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  letter-spacing: 0.1em;
  color: #fff;
  font-weight: 600;
}

.left-estrellas {
  font-size: 0.7rem;
  color: #E8773A;
  letter-spacing: 0.3em;
  margin-bottom: 2rem;
  opacity: 0.8;
}

.left-titulo {
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  font-weight: 400;
  line-height: 1.15;
  color: #fff;
  margin-bottom: 1rem;
}

.left-sub {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.08em;
  margin-bottom: 2.5rem;
  font-weight: 300;
}

.left-deco {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.deco-line {
  flex: 1;
  height: 1px;
  background: rgba(232,119,58,0.2);
}

.deco-texto {
  font-size: 0.6rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #E8773A;
  opacity: 0.7;
  white-space: nowrap;
}

.left-features {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
  font-weight: 300;
  letter-spacing: 0.03em;
}

.feature-icon { color: #E8773A; font-size: 0.6rem; flex-shrink: 0; }

.left-particles { position: absolute; inset: 0; pointer-events: none; }

.particle {
  position: absolute;
  background: #E8773A;
  border-radius: 50%;
  animation: float 7s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.06; }
  50%       { transform: translateY(-15px) scale(1.4); opacity: 0.18; }
}

.login-left::after {
  content: '';
  position: absolute;
  right: 0; top: 10%; bottom: 10%;
  width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(232,119,58,0.25), transparent);
}

/* ─── PANEL DERECHO ─── */
.login-right {
  background: #0A1628;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
}

.login-card {
  width: 100%;
  max-width: 420px;
}

.card-header { margin-bottom: 2.5rem; }

.card-badge {
  display: inline-block;
  font-size: 0.6rem; font-weight: 600;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: #E8773A;
  border: 1px solid rgba(232,119,58,0.3);
  background: rgba(232,119,58,0.08);
  padding: 0.35rem 0.9rem; border-radius: 20px;
  margin-bottom: 1.25rem;
}

.card-titulo {
  font-family: 'Playfair Display', serif;
  font-size: 2.2rem; font-weight: 400;
  line-height: 1.2; color: #fff;
  margin-bottom: 0.6rem;
}

.card-sub {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
  font-weight: 300; letter-spacing: 0.05em;
}

/* ─── FORMULARIO ─── */
.login-form {
  display: flex; flex-direction: column;
  gap: 1.25rem; margin-bottom: 2rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.5rem; }

.form-group label {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.62rem; font-weight: 500;
  letter-spacing: 0.15em; text-transform: uppercase;
  color: rgba(255,255,255,0.35);
}

.label-icon { font-size: 0.5rem; color: #E8773A; }

.form-group input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px; padding: 0.85rem 1rem;
  font-family: 'Inter', sans-serif; font-size: 0.875rem;
  font-weight: 400; color: #fff; outline: none;
  transition: all 0.25s; width: 100%;
}
.form-group input:focus {
  border-color: rgba(232,119,58,0.5);
  background: rgba(232,119,58,0.04);
}
.form-group input::placeholder { color: rgba(255,255,255,0.2); }
.form-group input:disabled { opacity: 0.4; cursor: not-allowed; }

.input-wrap { position: relative; }
.input-wrap input { padding-right: 3rem; }

.btn-ver {
  position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
  background: transparent; border: none;
  color: rgba(255,255,255,0.3); font-size: 0.7rem;
  cursor: pointer; padding: 0.25rem; transition: color 0.2s;
}
.btn-ver:hover { color: #E8773A; }

.error-msg {
  display: flex; align-items: center; gap: 0.5rem;
  background: rgba(252,129,74,0.08); border: 1px solid rgba(252,129,74,0.2);
  border-radius: 6px; padding: 0.75rem 1rem;
  font-size: 0.8rem; color: #fc814a;
}

.btn-login {
  background: #E8773A; color: #fff; border: none;
  border-radius: 6px; padding: 0.95rem;
  font-family: 'Inter', sans-serif; font-size: 0.72rem;
  font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
  cursor: pointer; transition: all 0.25s;
  display: flex; align-items: center; justify-content: center;
  gap: 0.5rem; margin-top: 0.5rem;
}
.btn-login:hover:not(:disabled) {
  background: #F28C4E; transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(232,119,58,0.3);
}
.btn-login:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

.btn-spinner {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,0.25);
  border-top-color: #fff;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.card-footer {
  text-align: center; padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.07);
}

.link-volver {
  font-size: 0.72rem; color: rgba(255,255,255,0.35);
  letter-spacing: 0.08em; text-decoration: none; transition: color 0.2s;
}
.link-volver:hover { color: #E8773A; }

/* ─── RESPONSIVE ─── */
@media (max-width: 768px) {
  .login-page { grid-template-columns: 1fr; }
  .login-left { display: none; }
  .login-right {
    padding: 2rem 1.5rem;
    background: linear-gradient(160deg, #0D1B3E 0%, #0A1628 50%, #1a0a2e 100%);
  }
}
</style>