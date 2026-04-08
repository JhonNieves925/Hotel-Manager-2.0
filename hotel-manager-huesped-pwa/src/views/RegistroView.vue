<template>
  <div class="registro-page">
    <div class="registro-card">

      <div class="card-top">
        <RouterLink to="/login" class="btn-volver">← Volver</RouterLink>
        <div class="brand">
          <span class="brand-icon">✦</span>
          <span>Hotel Manager</span>
        </div>
      </div>

      <div class="card-header">
        <div class="header-badge">Nueva cuenta</div>
        <h1>Crea tu cuenta</h1>
        <p>Regístrate para gestionar tus reservas fácilmente</p>
      </div>

      <form @submit.prevent="handleRegistro" class="form">

        <div class="form-row">
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="form.nombre" type="text" placeholder="Juan" required :disabled="cargando" />
          </div>
          <div class="form-group">
            <label>Apellido *</label>
            <input v-model="form.apellido" type="text" placeholder="Pérez" required :disabled="cargando" />
          </div>
        </div>

        <div class="form-group">
          <label>Correo electrónico *</label>
          <input v-model="form.email" type="email" placeholder="juan@email.com" required :disabled="cargando" />
        </div>

        <div class="form-group">
          <label>Contraseña *</label>
          <div class="input-wrap">
            <input v-model="form.password" :type="verPass ? 'text' : 'password'" placeholder="Mínimo 6 caracteres" required :disabled="cargando" />
            <button type="button" class="btn-ver" @click="verPass = !verPass">{{ verPass ? '○' : '●' }}</button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Tipo de documento *</label>
            <select v-model="form.tipoDocumento" required :disabled="cargando">
              <option value="cc">Cédula</option>
              <option value="ce">Cédula extranjería</option>
              <option value="pasaporte">Pasaporte</option>
            </select>
          </div>
          <div class="form-group">
            <label>Número de documento *</label>
            <input v-model="form.numeroDocumento" type="text" placeholder="1234567890" required :disabled="cargando" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Fecha de nacimiento *</label>
            <input v-model="form.fechaNacimiento" type="date" required :disabled="cargando" />
          </div>
          <div class="form-group">
            <label>Nacionalidad *</label>
            <input v-model="form.nacionalidad" type="text" placeholder="Colombiano/a" required :disabled="cargando" />
          </div>
        </div>

        <div class="form-group">
          <label>Teléfono *</label>
          <input v-model="form.telefono" type="tel" placeholder="3001234567" required :disabled="cargando" />
        </div>

        <div v-if="error" class="error-msg">⚠ {{ error }}</div>
        <div v-if="exito" class="exito-msg">✓ {{ exito }}</div>

        <button type="submit" class="btn-submit" :disabled="cargando">
          <span v-if="cargando" class="spinner"></span>
          <span v-else>Crear cuenta</span>
        </button>

      </form>

      <div class="card-footer">
        <span>¿Ya tienes cuenta?</span>
        <RouterLink to="/login" class="link-login">Inicia sesión</RouterLink>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHuespedAuthStore } from '../stores/auth'

const router = useRouter()
const auth   = useHuespedAuthStore()

const cargando = ref(false)
const error    = ref('')
const exito    = ref('')
const verPass  = ref(false)

const form = ref({
  nombre: '', apellido: '', email: '', password: '',
  tipoDocumento: 'cc', numeroDocumento: '',
  fechaNacimiento: '', nacionalidad: '', telefono: ''
})

async function handleRegistro() {
  cargando.value = true
  error.value    = ''
  exito.value    = ''
  try {
    await auth.register(form.value)
    exito.value = '¡Cuenta creada exitosamente! Iniciando sesión...'
    await auth.login(form.value.email, form.value.password)
    setTimeout(() => router.push('/mis-reservas'), 1000)
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al crear la cuenta'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

.registro-page {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 2rem 1.5rem;
  background: linear-gradient(160deg, #000000 0%, #080804 45%, #141105 100%);
  font-family: 'Inter', sans-serif;
}

/* ── CARD ── */
.registro-card {
  width: 100%; max-width: 480px;
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
.btn-volver:hover { color: #C9A84C; }

.brand {
  display: flex; align-items: center; gap: 0.5rem;
  font-family: 'Inter', sans-serif; font-size: 1rem; font-weight: 700;
  color: #C9A84C; letter-spacing: 0.02em; text-transform: none;
}
.brand-icon { color: #C9A84C; font-size: 1rem; }

/* ── CARD HEADER ── */
.card-header { margin-bottom: 1.75rem; }

.header-badge {
  display: inline-block; font-size: 0.58rem; font-weight: 600;
  letter-spacing: 0.22em; text-transform: uppercase; color: #C9A84C;
  border: 1px solid rgba(232, 191, 58, 0.3);
  background: rgba(232, 177, 58, 0.08);
  padding: 0.3rem 0.85rem; border-radius: 20px; margin-bottom: 1rem;
}
.card-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem; font-weight: 400; color: #fff; margin-bottom: 0.4rem;
}
.card-header p { font-size: 0.78rem; color: rgba(255,255,255,0.4); font-weight: 300; }

/* ── FORM ── */
.form { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group label {
  font-size: 0.6rem; font-weight: 500; letter-spacing: 0.15em;
  text-transform: uppercase; color: rgba(255,255,255,0.35);
}

.form-group input,
.form-group select,
.input-wrap input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px; padding: 0.75rem 1rem;
  font-family: 'Inter', sans-serif; font-size: 0.875rem;
  font-weight: 400; color: #fff; outline: none;
  transition: all 0.25s; width: 100%;
}
.form-group input:focus,
.form-group select:focus,
.input-wrap input:focus {
  border-color: rgba(232,119,58,0.5);
  background: rgba(232,119,58,0.04);
}
.form-group input::placeholder { color: rgba(255,255,255,0.2); }
.form-group select option { background: #0D1B3E; color: #fff; }

/* ── PASSWORD WRAP ── */
.input-wrap { position: relative; }
.input-wrap input { padding-right: 3rem; }
.btn-ver {
  position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
  background: transparent; border: none;
  color: rgba(255,255,255,0.3); font-size: 0.65rem;
  cursor: pointer; transition: color 0.2s;
}
.btn-ver:hover { color: #C9A84C; }

/* ── MENSAJES ── */
.error-msg {
  background: rgba(252,129,74,0.08); border: 1px solid rgba(252,129,74,0.2);
  border-radius: 6px; padding: 0.7rem 1rem; font-size: 0.8rem; color: #fc814a;
  display: flex; align-items: center; gap: 0.5rem;
}
.exito-msg {
  background: rgba(72,187,120,0.1); border: 1px solid rgba(72,187,120,0.25);
  border-radius: 6px; padding: 0.7rem 1rem; font-size: 0.8rem; color: #68d391;
}

/* ── SUBMIT ── */
.btn-submit {
  background: #C9A84C; color: #fff; border: none; border-radius: 6px;
  padding: 0.9rem; font-family: 'Inter', sans-serif; font-size: 0.72rem;
  font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
  transition: all 0.25s; display: flex; align-items: center;
  justify-content: center; gap: 0.5rem;
}
.btn-submit:hover:not(:disabled) { background: #c9c14c; transform: translateY(-1px); }
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
.link-login { color: #C9A84C; font-weight: 500; transition: color 0.2s; }
.link-login:hover { color: #f2d94e; }

@media (max-width: 480px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>