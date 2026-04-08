<template>
  <div class="page"> 

    <header class="header">
      <RouterLink to="/mis-reservas" class="btn-volver">←</RouterLink>
      <div class="brand">Hotel Manager</div>
      <div style="width:32px"></div>
    </header>

    <nav class="bottom-nav">
      <RouterLink to="/buscar" class="nav-item">
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
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

.page {
  min-height: 100vh;
  background: linear-gradient(160deg, #000000 0%, #080804 45%, #141105 100%);
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
}

/* ── HEADER ── */
.header {
   position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center;
  height: 80px;
  padding: 0 2.5rem;
  background: rgba(5, 5, 5, 0.92);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(201,168,76,0.15);
  overflow: hidden;
}
.btn-volver { color: #999; font-size: 1.1rem; transition: color 0.2s; }
.btn-volver:hover { color: #e8a23a; }
.brand {
   font-family: "Georgia", "Times New Roman", serif;
  font-size: 28px;
  font-weight: 500;
  letter-spacing: 1px;
  text-align: center;
}


/* ── BOTTOM NAV ── */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
  display: flex; background: #0f0f0f;
  box-shadow: 0 -1px 12px rgba(0,0,0,0.1);
  border-top: 1px solid rgba(0,0,0,0.06);
  padding-bottom: env(safe-area-inset-bottom);
}
.nav-item {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  gap: 0.2rem; padding: 0.7rem 0.5rem;
  font-size: 0.58rem; font-weight: 500; letter-spacing: 0.06em;
  text-transform: uppercase; color: #999; transition: color 0.2s; text-decoration: none;
}
.nav-item.active, .router-link-active { color: #e8ab3a !important; }
.nav-item:hover { color: #e8a23a; }
.nav-icon { font-size: 1rem; }

/* ── MAIN ── */
.main { padding: 5rem 1.5rem 6rem; max-width: 500px; margin: 0 auto; }

/* ── PERFIL HERO ── */
.perfil-hero {
  text-align: center; padding: 2rem 0 2.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  margin-bottom: 2rem;
}
.avatar {
  width: 72px; height: 72px; border-radius: 50%;
  background: rgba(232, 162, 58, 0.12);
  border: 2px solid rgba(232, 177, 58, 0.35);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; font-weight: 700; color: #e8a23a;
  margin: 0 auto 1rem; letter-spacing: 0.05em;
}
.perfil-nombre {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem; font-weight: 400; color: #fff; margin-bottom: 0.25rem;
}
.perfil-email { font-size: 0.78rem; color: rgba(255, 255, 255, 0.74); margin-bottom: 0.75rem; }
.perfil-estrellas { font-size: 0.65rem; color: #e8bf3a; letter-spacing: 0.3em; opacity: 0.6; }

/* ── FORM ── */
.form { display: flex; flex-direction: column; gap: 2rem; }
.form-seccion { display: flex; flex-direction: column; gap: 1rem; }

.seccion-label {
  display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;
}
.seccion-num {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem; color: #e8bf3a; opacity: 0.5; font-weight: 400; line-height: 1;
}
.seccion-label span:nth-child(2) {
  font-size: 0.62rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: rgba(255, 255, 255, 0.89);
  white-space: nowrap;
}
.seccion-linea { flex: 1; height: 1px; background: rgba(255, 255, 255, 0.342); }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group label {
  font-size: 0.6rem; font-weight: 500; letter-spacing: 0.15em;
  text-transform: uppercase; color: rgba(255,255,255,0.35);
}
.form-group input {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px; padding: 0.75rem 1rem;
  font-family: 'Inter', sans-serif; font-size: 0.875rem;
  font-weight: 400; color: #fff; outline: none; transition: all 0.25s;
}
.form-group input:focus {
  border-color: rgba(232, 177, 58, 0.5);
  background: rgba(232, 200, 58, 0.04);
}
.form-group input:disabled { opacity: 0.4; cursor: default; }
.form-group input::placeholder { color: rgba(255,255,255,0.2); }

/* ── MENSAJES ── */
.exito-msg {
  background: rgba(72,187,120,0.1); border: 1px solid rgba(72,187,120,0.25);
  border-radius: 6px; padding: 0.7rem 1rem; font-size: 0.8rem; color: #68d391;
}
.error-msg {
  background: rgba(252,129,74,0.08); border: 1px solid rgba(252,129,74,0.2);
  border-radius: 6px; padding: 0.7rem 1rem; font-size: 0.8rem; color: #fc4a4a;
}

/* ── BOTONES ── */
.form-acciones { display: flex; gap: 0.75rem; }

.btn-editar {
  flex: 1; background: transparent; color: #e8b13a;
  border: 1px solid rgba(232, 177, 58, 0.4); border-radius: 6px;
  padding: 0.85rem; font-size: 0.7rem; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase; transition: all 0.2s;
}
.btn-editar:hover { background: rgba(232, 186, 58, 0.1); }

.btn-cancelar {
  flex: 1; background: transparent; color: rgba(255,255,255,0.4);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
  padding: 0.85rem; font-size: 0.7rem; font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase; transition: all 0.2s;
}
.btn-cancelar:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.6); }

.btn-guardar {
  flex: 1; background: #ac8a2d; color: #fff; border: none;
  border-radius: 6px; padding: 0.85rem; font-size: 0.7rem; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase; transition: all 0.2s;
}
.btn-guardar:hover:not(:disabled) { background: #866d26; transform: translateY(-1px); }
.btn-guardar:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── LOGOUT ── */
.logout-section {
  margin-top: 2.5rem; padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.07);
}
.btn-logout {
  width: 100%; background: rgba(252, 240, 74, 0.07);
  border: 1px solid rgba(252, 225, 74, 0.2); border-radius: 6px;
  padding: 0.85rem; font-size: 0.7rem; font-weight: 500;
  letter-spacing: 0.15em; text-transform: uppercase;
  color: rgba(252, 210, 74, 0.8); transition: all 0.2s;
}
.btn-logout:hover { background: rgba(252, 205, 74, 0.15); color: #ecce46; }

@media (max-width: 400px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>