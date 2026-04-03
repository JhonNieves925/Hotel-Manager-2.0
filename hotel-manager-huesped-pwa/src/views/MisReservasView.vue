<template>
  <div class="page">

    <!-- HEADER -->
    <header class="header">
      <div class="brand">
        <span class="brand-icon">✦</span>
        <span>Hotel Manager</span>
      </div>
      <div class="header-actions">
        <RouterLink to="/perfil" class="btn-perfil">{{ iniciales }}</RouterLink>
      </div>
    </header>

    <!-- NAV BOTTOM -->
    <nav class="bottom-nav">
      <RouterLink to="/inicio" class="nav-item">
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
        <RouterLink to="/inicio" class="btn-reservar-nuevo">Hacer una reserva</RouterLink>
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
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600&family=Montserrat:wght@300;400;500;600&display=swap');

.page { min-height: 100vh; background: var(--dark); display: flex; flex-direction: column; }

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(10,10,10,0.95); backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(201,168,76,0.1);
}
.brand { display: flex; align-items: center; gap: 0.4rem;
  font-family: 'Cormorant Garamond', serif; font-size: 1rem;
  letter-spacing: 0.15em; text-transform: uppercase; color: var(--text);
}
.brand-icon { color: var(--gold); font-size: 0.8rem; }

.btn-perfil {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; font-weight: 600; color: var(--gold); letter-spacing: 0.05em;
}

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
  flex: 1; padding: 5rem 1.5rem 6rem;
  max-width: 600px; margin: 0 auto; width: 100%;
}

.page-header { margin-bottom: 1.5rem; }
.page-header h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.8rem; font-weight: 300; color: var(--text); margin-bottom: 0.25rem;
}
.page-header p { font-size: 0.75rem; color: var(--text-muted); }

.filtros { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.filtro-btn {
  font-size: 0.65rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--text-muted); background: transparent;
  border: 1px solid rgba(201,168,76,0.15); border-radius: 20px;
  padding: 0.35rem 0.85rem; transition: all 0.2s;
}
.filtro-btn.active, .filtro-btn:hover {
  color: var(--gold); border-color: rgba(201,168,76,0.4);
  background: rgba(201,168,76,0.08);
}

.cargando {
  display: flex; align-items: center; gap: 0.75rem; justify-content: center;
  padding: 3rem; color: var(--text-muted); font-size: 0.85rem;
}
.spinner {
  width: 20px; height: 20px; border: 2px solid rgba(201,168,76,0.2);
  border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.vacio { text-align: center; padding: 4rem 1rem; }
.vacio-icon { font-size: 2rem; color: var(--gold); opacity: 0.3; margin-bottom: 1rem; }
.vacio-titulo { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 300; color: var(--text); margin-bottom: 0.5rem; }
.vacio-sub { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1.5rem; }
.btn-reservar-nuevo {
  display: inline-block; background: var(--gold); color: var(--dark);
  border-radius: 4px; padding: 0.7rem 1.5rem;
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase;
}

.reservas-lista { display: flex; flex-direction: column; gap: 1rem; }

.reserva-card {
  background: #1C1A17; border: 1px solid rgba(201,168,76,0.12);
  border-radius: 10px; overflow: hidden;
  animation: fadeUp 0.4s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.reserva-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.85rem 1.1rem; border-bottom: 1px solid rgba(201,168,76,0.08);
}
.reserva-id { font-size: 0.72rem; color: var(--text-muted); letter-spacing: 0.1em; }

.badge { display: inline-block; padding: 0.25rem 0.65rem; border-radius: 20px; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
.badge.pendiente  { background: rgba(217,119,6,0.15);  color: #fbbf24; }
.badge.confirmada { background: rgba(37,99,235,0.15);  color: #93c5fd; }
.badge.en_curso   { background: rgba(22,163,74,0.15);  color: #86efac; }
.badge.completada { background: rgba(100,116,139,0.15); color: #94a3b8; }
.badge.cancelada  { background: rgba(220,38,38,0.15);  color: #fca5a5; }

.reserva-hab {
  padding: 0.85rem 1.1rem; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid rgba(201,168,76,0.06);
}
.hab-tipo { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 400; color: var(--text); }
.hab-num { font-size: 0.72rem; color: var(--text-muted); }

.reserva-fechas {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.85rem 1.1rem; border-bottom: 1px solid rgba(201,168,76,0.06);
}
.fecha-item { display: flex; flex-direction: column; gap: 0.15rem; }
.fecha-label { font-size: 0.6rem; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
.fecha-valor { font-size: 0.82rem; color: var(--text); font-weight: 500; }
.fecha-sep { color: var(--gold); opacity: 0.4; font-size: 0.8rem; flex: 1; text-align: center; }

.reserva-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.85rem 1.1rem;
}
.reserva-total { display: flex; align-items: baseline; gap: 0.5rem; }
.total-label { font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
.total-monto { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 600; color: var(--gold); }

.btn-cancelar {
  font-size: 0.65rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
  color: #fca5a5; background: rgba(220,38,38,0.1);
  border: 1px solid rgba(220,38,38,0.2); border-radius: 4px;
  padding: 0.4rem 0.85rem; transition: all 0.2s;
}
.btn-cancelar:hover:not(:disabled) { background: rgba(220,38,38,0.2); }
.btn-cancelar:disabled { opacity: 0.5; cursor: not-allowed; }
</style>