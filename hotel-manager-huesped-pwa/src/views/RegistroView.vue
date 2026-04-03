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
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Montserrat:wght@300;400;500;600&display=swap');

.registro-page {
  min-height: 100vh; display: flex; align-items: center;
  justify-content: center; padding: 2rem 1.5rem;
  background: radial-gradient(ellipse 80% 60% at 50% 30%, rgba(201,168,76,0.05) 0%, transparent 70%),
              linear-gradient(160deg, #080808 0%, #111108 50%, #080808 100%);
}

.registro-card {
  width: 100%; max-width: 480px;
  background: #111111; border: 1px solid rgba(201,168,76,0.12);
  border-radius: 12px; padding: 2rem; animation: fadeUp 0.6s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card-top {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 2rem;
}
.btn-volver { font-size: 0.72rem; color: var(--text-muted); transition: color 0.2s; }
.btn-volver:hover { color: var(--gold); }
.brand { display: flex; align-items: center; gap: 0.4rem;
  font-family: 'Cormorant Garamond', serif; font-size: 1rem;
  letter-spacing: 0.15em; text-transform: uppercase; color: var(--text);
}
.brand-icon { color: var(--gold); font-size: 0.8rem; }

.card-header { margin-bottom: 1.75rem; }
.header-badge {
  display: inline-block; font-size: 0.58rem; font-weight: 500;
  letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold);
  border: 1px solid rgba(201,168,76,0.25); padding: 0.3rem 0.8rem;
  border-radius: 20px; margin-bottom: 1rem;
}
.card-header h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.8rem; font-weight: 300; color: var(--text); margin-bottom: 0.4rem;
}
.card-header p { font-size: 0.78rem; color: var(--text-muted); font-weight: 300; }

.form { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group label {
  font-size: 0.6rem; font-weight: 500; letter-spacing: 0.15em;
  text-transform: uppercase; color: var(--text-muted);
}

.form-group input, .form-group select, .input-wrap input {
  background: #1A1A1A; border: 1px solid rgba(201,168,76,0.15);
  border-radius: 4px; padding: 0.75rem 1rem;
  font-family: 'Montserrat', sans-serif; font-size: 0.875rem;
  font-weight: 300; color: var(--text); outline: none; transition: all 0.3s; width: 100%;
}
.form-group input:focus, .form-group select:focus, .input-wrap input:focus {
  border-color: rgba(201,168,76,0.45);
}
.form-group input::placeholder { color: var(--text-dim); }
.form-group select option { background: #1A1A1A; }

.input-wrap { position: relative; }
.input-wrap input { padding-right: 3rem; }
.btn-ver {
  position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
  background: transparent; border: none; color: var(--text-muted); font-size: 0.65rem; cursor: pointer;
}
.btn-ver:hover { color: var(--gold); }

.error-msg {
  background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.2);
  border-radius: 4px; padding: 0.7rem 1rem; font-size: 0.8rem; color: #FCA5A5;
}

.exito-msg {
  background: rgba(22,163,74,0.1); border: 1px solid rgba(22,163,74,0.25);
  border-radius: 4px; padding: 0.7rem 1rem; font-size: 0.8rem; color: #86efac;
}

.btn-submit {
  background: var(--gold); color: var(--dark); border: none; border-radius: 4px;
  padding: 0.9rem; font-family: 'Montserrat', sans-serif; font-size: 0.72rem;
  font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase;
  transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
}
.btn-submit:hover:not(:disabled) { background: var(--gold-light); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner {
  width: 15px; height: 15px; border: 2px solid rgba(0,0,0,0.3);
  border-top-color: var(--dark); border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.card-footer {
  text-align: center; padding-top: 1.25rem;
  border-top: 1px solid rgba(201,168,76,0.08);
  font-size: 0.75rem; color: var(--text-muted);
  display: flex; justify-content: center; gap: 0.5rem;
}
.link-login { color: var(--gold); font-weight: 500; }

@media (max-width: 480px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>