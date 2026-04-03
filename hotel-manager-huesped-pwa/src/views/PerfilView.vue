<template>
  <div class="page">

    <header class="header">
      <RouterLink to="/mis-reservas" class="btn-volver">←</RouterLink>
      <div class="brand">
        <span class="brand-icon">✦</span>
        <span>Hotel Manager</span>
      </div>
      <div style="width:32px"></div>
    </header>

    <nav class="bottom-nav">
      <RouterLink to="/inicio" class="nav-item">
        <span class="nav-icon">◈</span>
        <span>Reservar</span>
      </RouterLink>
      <RouterLink to="/mis-reservas" class="nav-item">
        <span class="nav-icon">≡</span>
        <span>Mis reservas</span>
      </RouterLink>
      <RouterLink to="/perfil" class="nav-item active">
        <span class="nav-icon">◉</span>
        <span>Perfil</span>
      </RouterLink>
    </nav>

    <main class="main">

      <div class="perfil-hero">
        <div class="avatar">{{ iniciales }}</div>
        <h1 class="perfil-nombre">{{ auth.usuario?.nombre }} {{ auth.usuario?.apellido }}</h1>
        <p class="perfil-email">{{ auth.usuario?.email }}</p>
        <div class="perfil-estrellas">★★★★★</div>
      </div>

      <form @submit.prevent="guardar" class="form">
        <div class="form-seccion">
          <div class="seccion-label">
            <span class="seccion-num">01</span>
            <span>Información personal</span>
            <div class="seccion-linea"></div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Nombre</label>
              <input v-model="form.nombre" type="text" :disabled="!editando" />
            </div>
            <div class="form-group">
              <label>Apellido</label>
              <input v-model="form.apellido" type="text" :disabled="!editando" />
            </div>
          </div>

          <div class="form-group">
            <label>Teléfono</label>
            <input v-model="form.telefono" type="tel" :disabled="!editando" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Fecha de nacimiento</label>
              <input v-model="form.fechaNacimiento" type="date" :disabled="!editando" />
            </div>
            <div class="form-group">
              <label>Nacionalidad</label>
              <input v-model="form.nacionalidad" type="text" :disabled="!editando" />
            </div>
          </div>
        </div>

        <div class="form-seccion" v-if="editando">
          <div class="seccion-label">
            <span class="seccion-num">02</span>
            <span>Nueva contraseña</span>
            <div class="seccion-linea"></div>
          </div>
          <div class="form-group">
            <label>Contraseña (dejar vacío para no cambiar)</label>
            <input v-model="form.password" type="password" placeholder="••••••••" />
          </div>
        </div>

        <div v-if="exito" class="exito-msg">✓ {{ exito }}</div>
        <div v-if="error" class="error-msg">⚠ {{ error }}</div>

        <div class="form-acciones">
          <button v-if="!editando" type="button" class="btn-editar" @click="editando = true">
            Editar perfil
          </button>
          <template v-else>
            <button type="button" class="btn-cancelar" @click="cancelar">Cancelar</button>
            <button type="submit" class="btn-guardar" :disabled="guardando">
              {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </template>
        </div>
      </form>

      <div class="logout-section">
        <button class="btn-logout" @click="logout">Cerrar sesión</button>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHuespedAuthStore } from '../stores/auth'
import { huespedPerfilService } from '../api/services'

const router   = useRouter()
const auth     = useHuespedAuthStore()
const editando = ref(false)
const guardando = ref(false)
const exito    = ref('')
const error    = ref('')

const form = ref({
  nombre: '', apellido: '', telefono: '',
  fechaNacimiento: '', nacionalidad: '', password: ''
})

const iniciales = computed(() => {
  if (!auth.usuario) return '?'
  return `${auth.usuario.nombre[0]}${auth.usuario.apellido[0]}`.toUpperCase()
})

onMounted(async () => {
  if (!auth.usuario?.id) return
  try {
    const res = await huespedPerfilService.obtener(auth.usuario.id)
    const d = res.data
    form.value = {
      nombre: d.nombre, apellido: d.apellido,
      telefono: d.telefono || '', nacionalidad: d.nacionalidad || '',
      fechaNacimiento: d.fechaNacimiento || '', password: ''
    }
  } catch (e) { console.error(e) }
})

async function guardar() {
  guardando.value = true
  error.value     = ''
  exito.value     = ''
  try {
    await huespedPerfilService.actualizar(auth.usuario.id, form.value)
    exito.value = 'Perfil actualizado correctamente'
    editando.value = false
    form.value.password = ''
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al guardar'
  } finally {
    guardando.value = false
  }
}

function cancelar() {
  editando.value = false
  error.value    = ''
  exito.value    = ''
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600&family=Montserrat:wght@300;400;500;600&display=swap');

.page { min-height: 100vh; background: var(--dark); }

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(10,10,10,0.95); backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(201,168,76,0.1);
}
.btn-volver { color: var(--text-muted); font-size: 1.1rem; transition: color 0.2s; }
.btn-volver:hover { color: var(--gold); }
.brand { display: flex; align-items: center; gap: 0.4rem;
  font-family: 'Cormorant Garamond', serif; font-size: 1rem;
  letter-spacing: 0.15em; text-transform: uppercase; color: var(--text);
}
.brand-icon { color: var(--gold); font-size: 0.8rem; }

.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
  display: flex; background: rgba(10,10,10,0.95); backdrop-filter: blur(20px);
  border-top: 1px solid rgba(201,168,76,0.1);
  padding-bottom: env(safe-area-inset-bottom);
}
.nav-item {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  gap: 0.25rem; padding: 0.75rem 0.5rem;
  font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--text-muted); transition: color 0.2s; text-decoration: none;
}
.nav-item.active, .nav-item:hover { color: var(--gold); }
.nav-icon { font-size: 1rem; }

.main {
  padding: 5rem 1.5rem 6rem;
  max-width: 500px; margin: 0 auto;
}

.perfil-hero {
  text-align: center; padding: 2rem 0 2.5rem;
  border-bottom: 1px solid rgba(201,168,76,0.08); margin-bottom: 2rem;
}
.avatar {
  width: 72px; height: 72px; border-radius: 50%;
  background: rgba(201,168,76,0.12); border: 2px solid rgba(201,168,76,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; font-weight: 600; color: var(--gold);
  margin: 0 auto 1rem; letter-spacing: 0.05em;
}
.perfil-nombre {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem; font-weight: 300; color: var(--text); margin-bottom: 0.25rem;
}
.perfil-email { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.75rem; }
.perfil-estrellas { font-size: 0.65rem; color: var(--gold); letter-spacing: 0.3em; opacity: 0.6; }

.form { display: flex; flex-direction: column; gap: 2rem; }

.form-seccion { display: flex; flex-direction: column; gap: 1rem; }

.seccion-label {
  display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;
}
.seccion-num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem; color: var(--gold); opacity: 0.4; font-weight: 300; line-height: 1;
}
.seccion-label span:nth-child(2) {
  font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted);
  white-space: nowrap;
}
.seccion-linea { flex: 1; height: 1px; background: rgba(201,168,76,0.1); }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group label {
  font-size: 0.6rem; font-weight: 500; letter-spacing: 0.15em;
  text-transform: uppercase; color: var(--text-muted);
}
.form-group input {
  background: #1A1A1A; border: 1px solid rgba(201,168,76,0.15);
  border-radius: 4px; padding: 0.75rem 1rem;
  font-family: 'Montserrat', sans-serif; font-size: 0.875rem;
  font-weight: 300; color: var(--text); outline: none; transition: all 0.3s;
}
.form-group input:focus { border-color: rgba(201,168,76,0.45); }
.form-group input:disabled { opacity: 0.5; cursor: default; }
.form-group input::placeholder { color: var(--text-dim); }

.exito-msg {
  background: rgba(22,163,74,0.1); border: 1px solid rgba(22,163,74,0.25);
  border-radius: 4px; padding: 0.7rem 1rem; font-size: 0.8rem; color: #86efac;
}
.error-msg {
  background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.2);
  border-radius: 4px; padding: 0.7rem 1rem; font-size: 0.8rem; color: #FCA5A5;
}

.form-acciones { display: flex; gap: 0.75rem; }

.btn-editar {
  flex: 1; background: transparent; color: var(--gold);
  border: 1px solid rgba(201,168,76,0.35); border-radius: 4px;
  padding: 0.85rem; font-size: 0.72rem; font-weight: 600;
  letter-spacing: 0.15em; text-transform: uppercase; transition: all 0.2s;
}
.btn-editar:hover { background: rgba(201,168,76,0.08); }

.btn-cancelar {
  flex: 1; background: transparent; color: var(--text-muted);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;
  padding: 0.85rem; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
}

.btn-guardar {
  flex: 1; background: var(--gold); color: var(--dark); border: none;
  border-radius: 4px; padding: 0.85rem; font-size: 0.72rem; font-weight: 600;
  letter-spacing: 0.15em; text-transform: uppercase; transition: all 0.2s;
}
.btn-guardar:hover:not(:disabled) { background: var(--gold-light); }
.btn-guardar:disabled { opacity: 0.5; cursor: not-allowed; }

.logout-section {
  margin-top: 2.5rem; padding-top: 1.5rem;
  border-top: 1px solid rgba(201,168,76,0.08);
}
.btn-logout {
  width: 100%; background: rgba(220,38,38,0.08);
  border: 1px solid rgba(220,38,38,0.2); border-radius: 4px;
  padding: 0.85rem; font-size: 0.72rem; font-weight: 500;
  letter-spacing: 0.15em; text-transform: uppercase; color: #fca5a5; transition: all 0.2s;
}
.btn-logout:hover { background: rgba(220,38,38,0.15); }

@media (max-width: 400px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>