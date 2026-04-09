<template> 
  <div class="page">
 
    <!-- HEADER -->
    <header class="header">
      <div class="brand">
        <img src="/logo.png" alt="Hotel Manager" class="brand-logo" />
      </div>
      <div class="header-actions">
        <RouterLink to="/perfil" class="btn-perfil">{{ iniciales }}</RouterLink>
      </div>
    </header>

    <!-- NAV BOTTOM -->
    <nav class="bottom-nav">
      <RouterLink to="/buscar" class="nav-item">
        <span class="nav-icon">◈</span>
        <span>Reservar</span>
      </RouterLink>
      <RouterLink to="/mis-reservas" class="nav-item active">
        <span class="nav-icon">≡</span>
        <span>Mis reservas</span>
      </RouterLink>
      <RouterLink to="/perfil" class="nav-item">
        <span class="nav-icon">◉</span>
        <span>Perfil</span>
      </RouterLink>
    </nav>

    <main class="main">

      <div class="page-header">
        <h1>Mis reservas</h1>
        <p>Historial y reservas activas</p>
      </div>

      <!-- FILTRO -->
      <div class="filtros">
        <button
          v-for="f in filtros"
          :key="f.value"
          class="filtro-btn"
          :class="{ active: filtroActivo === f.value }"
          @click="filtroActivo = f.value"
        >{{ f.label }}</button>
      </div>

      <div v-if="cargando" class="cargando">
        <div class="spinner"></div>
        <span>Cargando reservas...</span>
      </div>

      <div v-else-if="reservasFiltradas.length === 0" class="vacio">
        <div class="vacio-icon">○</div>
        <p class="vacio-titulo">Sin reservas</p>
        <p class="vacio-sub">No tienes reservas {{ filtroActivo !== 'todas' ? 'en este estado' : 'aún' }}</p>
        <RouterLink to="/buscar" class="btn-reservar-nuevo">Hacer una reserva</RouterLink>
      </div>

      <div v-else class="reservas-lista">
        <div v-for="r in reservasFiltradas" :key="r.id" class="reserva-card">

          <div class="reserva-header">
            <div class="reserva-id">#{{ r.id }}</div>
            <span :class="['badge', r.estadoReserva]">{{ r.estadoReserva }}</span>
          </div>

          <div class="reserva-hab">
            <span class="hab-tipo">{{ r.tipoHabitacion }}</span>
            <span class="hab-num">Hab. {{ r.numeroHabitacion }}</span>
          </div>

          <div class="reserva-fechas">
            <div class="fecha-item">
              <span class="fecha-label">Check-in</span>
              <span class="fecha-valor">{{ formatFecha(r.fechaEntrada) }}</span>
            </div>
            <div class="fecha-sep">→</div>
            <div class="fecha-item">
              <span class="fecha-label">Check-out</span>
              <span class="fecha-valor">{{ formatFecha(r.fechaSalida) }}</span>
            </div>
          </div>

          <div class="reserva-footer">
            <div class="reserva-total">
              <span class="total-label">Total</span>
              <span class="total-monto">${{ formatPrecio(r.valorTotal) }}</span>
            </div>
            <button
              v-if="['pendiente','confirmada'].includes(r.estadoReserva)"
              class="btn-cancelar"
              @click="cancelar(r.id)"
              :disabled="cancelando === r.id"
            >
              {{ cancelando === r.id ? '...' : 'Cancelar' }}
            </button>
          </div>

        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHuespedAuthStore } from '../stores/auth'
import { huespedReservasService } from '../api/services'

const auth     = useHuespedAuthStore()
const reservas = ref([])
const cargando = ref(true)
const cancelando = ref(null)
const filtroActivo = ref('todas')

const filtros = [
  { label: 'Todas',      value: 'todas' },
  { label: 'Activas',    value: 'activas' },
  { label: 'Completadas', value: 'completada' },
  { label: 'Canceladas', value: 'cancelada' }
]

const iniciales = computed(() => {
  if (!auth.usuario) return '?'
  return `${auth.usuario.nombre[0]}${auth.usuario.apellido[0]}`.toUpperCase()
})

const reservasFiltradas = computed(() => {
  if (filtroActivo.value === 'todas') return reservas.value
  if (filtroActivo.value === 'activas')
    return reservas.value.filter(r => ['pendiente','confirmada','en_curso'].includes(r.estadoReserva))
  return reservas.value.filter(r => r.estadoReserva === filtroActivo.value)
})

onMounted(cargar)

async function cargar() {
  cargando.value = true
  try {
    const res = await huespedReservasService.misReservas()
    reservas.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

async function cancelar(id) {
  if (!confirm('¿Cancelar esta reserva?')) return
  cancelando.value = id
  try {
    await huespedReservasService.cancelar(id)
    await cargar()
  } catch (e) {
    alert(e.response?.data || 'Error al cancelar')
  } finally {
    cancelando.value = null
  }
}

function formatFecha(f) {
  if (!f) return ''
  return new Date(f + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function formatPrecio(v) {
  return Number(v || 0).toLocaleString('es-CO')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

/* ── Variables locales ── */
:root {
  --navy:        #0D1B3E;
  --navy-2:      #112244;
  --navy-3:      #1A2F5A;
  --navy-card:   #0F2040;
  --orange:      #E8773A;
  --orange-light:#F28C4E;
  --orange-dark: #C5602A;
  --white:       #FFFFFF;
  --white-muted: rgba(255,255,255,0.65);
  --white-dim:   rgba(255,255,255,0.25);
  --border:      rgba(255,255,255,0.08);
  --border-orange: rgba(232,119,58,0.3);
}

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

.brand { display: flex; align-items: center; height: 100%; }
.brand-logo {
  height: 110px;
  width: auto;
  object-fit: contain;
  mix-blend-mode: lighten;
}
.btn-perfil {
  width: 36px; height: 36px; border-radius: 50%;
  background: #a78a3d;
  border: none;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; font-weight: 700;
  color: #fff; letter-spacing: 0.05em;
  text-decoration: none;
}

/* ── BOTTOM NAV ── */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
  display: flex;
  background: #0f0f0f;
  box-shadow: 0 -1px 12px rgba(0,0,0,0.12);
  border-top: 1px solid rgba(0,0,0,0.06);
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  gap: 0.2rem; padding: 0.7rem 0.5rem;
  font-size: 0.58rem; font-weight: 500;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: #999; transition: color 0.2s; text-decoration: none;
}
.nav-item.active, .router-link-active { color: #e8bf3a !important; }
.nav-item:hover { color: #C9A84C; }
.nav-icon { font-size: 1rem; }

/* ── MAIN ── */
.main {
  flex: 1;
  padding: 5rem 1.5rem 6rem;
  max-width: 600px; margin: 0 auto; width: 100%;
}

/* ── PAGE HEADER ── */
.page-header { margin-bottom: 1.5rem; }
.page-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 1.9rem; font-weight: 600;
  color: #ffffff; margin-bottom: 0.25rem;
}
.page-header p {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.05em;
}

/* ── FILTROS ── */
.filtros { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }

.filtro-btn {
  font-size: 0.65rem; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px;
  padding: 0.35rem 0.9rem;
  transition: all 0.2s;
}
.filtro-btn.active,
.filtro-btn:hover {
  color: #C9A84C;
  border-color: rgba(232, 191, 58, 0.5);
  background: rgba(232, 191, 58, 0.1);
}

/* ── CARGANDO ── */
.cargando {
  display: flex; align-items: center; gap: 0.75rem;
  justify-content: center; padding: 3rem;
  color: rgba(255,255,255,0.4); font-size: 0.85rem;
}
.spinner {
  width: 20px; height: 20px;
  border: 2px solid rgba(232, 200, 58, 0.2);
  border-top-color: #e8bf3a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── VACÍO ── */
.vacio { text-align: center; padding: 4rem 1rem; }
.vacio-icon { font-size: 2rem; color: #e8bf3a; opacity: 0.3; margin-bottom: 1rem; }
.vacio-titulo {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem; font-weight: 400;
  color: #fff; margin-bottom: 0.5rem;
}
.vacio-sub { font-size: 0.78rem; color: rgba(255,255,255,0.4); margin-bottom: 1.5rem; }
.btn-reservar-nuevo {
  display: inline-block; background: #E8773A; color: #fff;
  border-radius: 6px; padding: 0.7rem 1.5rem;
  font-size: 0.72rem; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  transition: background 0.2s;
}
.btn-reservar-nuevo:hover { background: #F28C4E; }

/* ── LISTA DE RESERVAS ── */
.reservas-lista { display: flex; flex-direction: column; gap: 1rem; }

.reserva-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; overflow: hidden;
  backdrop-filter: blur(10px);
  transition: border-color 0.2s, transform 0.2s;
  animation: fadeUp 0.4s ease both;
}
.reserva-card:hover {
  border-color: rgba(232, 186, 58, 0.25);
  transform: translateY(-1px);
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.reserva-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.85rem 1.15rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
}
.reserva-id {
  font-size: 0.68rem; color: rgba(255, 255, 255, 0.61);
  letter-spacing: 0.12em; font-weight: 500;
}

/* ── BADGES ── */
.badge {
  display: inline-block; padding: 0.22rem 0.7rem;
  border-radius: 20px; font-size: 0.62rem;
  font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
}
.badge.pendiente  { background: rgba(251,191,36,0.12);  color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
.badge.confirmada { background: rgba(99,179,237,0.12);  color: #63b3ed; border: 1px solid rgba(99, 179, 237, 0.459); }
.badge.en_curso   { background: rgba(72,187,120,0.12);  color: #68d391; border: 1px solid rgba(72, 187, 120, 0.541); }
.badge.completada { background: rgba(160,174,192,0.12); color: #a0aec0; border: 1px solid rgba(160,174,192,0.2); }
.badge.cancelada  { background: rgba(252,129,74,0.12);  color: #fc504a; border: 1px solid rgba(252, 74, 74, 0.466); }

.reserva-hab {
  padding: 0.9rem 1.15rem;
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.hab-tipo {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem; font-weight: 400; color: #fff;
}
.hab-num { font-size: 0.7rem; color: rgba(255, 255, 255, 0.623); }

.reserva-fechas {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.9rem 1.15rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.fecha-item { display: flex; flex-direction: column; gap: 0.15rem; }
.fecha-label {
  font-size: 0.58rem; color: rgba(255, 255, 255, 0.678);
  letter-spacing: 0.12em; text-transform: uppercase;
}
.fecha-valor { font-size: 0.82rem; color: #fff; font-weight: 500; }
.fecha-sep {
  color: #8ef31b; opacity: 0.5; font-size: 0.85rem;
  flex: 1; text-align: center;
}

.reserva-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.85rem 1.15rem;
}
.reserva-total { display: flex; align-items: baseline; gap: 0.5rem; }
.total-label {
  font-size: 0.6rem; color: rgba(255, 255, 255, 0.685);
  text-transform: uppercase; letter-spacing: 0.1em;
}
.total-monto {
  font-family: 'Playfair Display', serif;
  font-size: 1.35rem; font-weight: 600; color: #9bfd2c;
}

.btn-cancelar {
  font-size: 0.63rem; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(252, 74, 74, 0.8);
  background: rgba(252,129,74,0.08);
  border: 1px solid rgba(252, 74, 74, 0.2);
  border-radius: 6px; padding: 0.4rem 0.9rem;
  transition: all 0.2s;
}
.btn-cancelar:hover:not(:disabled) {
  background: rgba(252,129,74,0.18);
  border-color: rgba(252,129,74,0.4);
  color: #fc814a;
}
.btn-cancelar:disabled { opacity: 0.4; cursor: not-allowed; }

</style>