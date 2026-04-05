<template>
  <div class="dashboard-layout">

    <aside class="sidebar">
      <div class="sidebar-brand">Hotel Manager</div>
      <nav class="sidebar-nav">
        <RouterLink to="/dashboard"    class="nav-item" active-class="active">Dashboard</RouterLink>
        <RouterLink to="/reservas"     class="nav-item" active-class="active">Reservas</RouterLink>
        <RouterLink to="/huespedes"    class="nav-item" active-class="active">Huéspedes</RouterLink>
        <RouterLink to="/habitaciones" class="nav-item" active-class="active">Habitaciones</RouterLink>
        <RouterLink to="/reportes"     class="nav-item" active-class="active">Reportes</RouterLink>
      </nav>
      <div class="sidebar-footer">
        <div class="usuario-info">
          <div class="usuario-nombre">{{ authStore.nombreUsuario }}</div>
          <div class="usuario-rol">{{ authStore.usuario?.rol }}</div>
        </div>
        <button class="btn-logout" @click="handleLogout">Cerrar sesión</button>
      </div>
    </aside>

    <main class="main-content">

      <div class="page-header">
        <h1>Dashboard</h1>
        <span class="fecha-hoy">{{ fechaHoy }}</span>
      </div>

      <div v-if="cargando" class="estado-cargando">
        <div class="spinner"></div> Cargando...
      </div>

      <template v-else>

        <!-- ── TARJETAS MÉTRICAS ──────────────────────────────── -->
        <div class="stats-grid">
          <div class="stat-card ocupadas">
            <div class="stat-numero">{{ stats.ocupadas }}</div>
            <div class="stat-label">Habitaciones ocupadas</div>
          </div>
          <div class="stat-card disponibles">
            <div class="stat-numero">{{ stats.disponibles }}</div>
            <div class="stat-label">Disponibles</div>
          </div>
          <div class="stat-card mantenimiento">
            <div class="stat-numero">{{ stats.mantenimiento }}</div>
            <div class="stat-label">En mantenimiento</div>
          </div>
          <div class="stat-card ingresos" v-if="authStore.isAdmin">
            <div class="stat-numero">${{ formatPrecio(stats.ingresosHoy) }}</div>
            <div class="stat-label">Ingresos hoy</div>
          </div>
        </div>

        <!-- ── ALERTAS DEL DÍA ───────────────────────────────── -->
        <div class="alertas-grid">

          <!-- Check-ins pendientes hoy -->
          <div class="alerta-card checkin" :class="{ 'sin-alertas': checkinsPendientes.length === 0 }">
            <div class="alerta-header">
              <div class="alerta-titulo-wrap">
                <span class="alerta-icono checkin-ico">↓</span>
                <span class="alerta-titulo">Check-ins de hoy</span>
              </div>
              <span class="alerta-badge" :class="checkinsPendientes.length > 0 ? 'urgente' : 'ok'">
                {{ checkinsPendientes.length }} pendiente{{ checkinsPendientes.length !== 1 ? 's' : '' }}
              </span>
            </div>

            <div v-if="checkinsPendientes.length === 0" class="alerta-vacia">
              Sin check-ins pendientes hoy
            </div>

            <div v-else class="alerta-lista">
              <div v-for="r in checkinsPendientes" :key="r.id" class="alerta-item">
                <div class="alerta-item-info">
                  <span class="alerta-nombre">{{ r.nombreHuesped }} {{ r.apellidoHuesped }}</span>
                  <span class="alerta-sub">{{ r.tipoHabitacion }} — Hab. {{ r.numeroHabitacion }}</span>
                </div>
                <button
                  class="btn-alerta checkin-btn"
                  @click="cambiarEstado(r.id, 'en_curso')"
                >
                  Check-in
                </button>
              </div>
            </div>
          </div>

          <!-- Check-outs pendientes hoy -->
          <div class="alerta-card checkout" :class="{ 'sin-alertas': checkoutsPendientes.length === 0 }">
            <div class="alerta-header">
              <div class="alerta-titulo-wrap">
                <span class="alerta-icono checkout-ico">↑</span>
                <span class="alerta-titulo">Check-outs de hoy</span>
              </div>
              <span class="alerta-badge" :class="checkoutsPendientes.length > 0 ? 'urgente' : 'ok'">
                {{ checkoutsPendientes.length }} pendiente{{ checkoutsPendientes.length !== 1 ? 's' : '' }}
              </span>
            </div>

            <div v-if="checkoutsPendientes.length === 0" class="alerta-vacia">
              Sin check-outs pendientes hoy
            </div>

            <div v-else class="alerta-lista">
              <div v-for="r in checkoutsPendientes" :key="r.id" class="alerta-item">
                <div class="alerta-item-info">
                  <span class="alerta-nombre">{{ r.nombreHuesped }} {{ r.apellidoHuesped }}</span>
                  <span class="alerta-sub">{{ r.tipoHabitacion }} — Hab. {{ r.numeroHabitacion }}</span>
                </div>
                <button
                  class="btn-alerta checkout-btn"
                  @click="cambiarEstado(r.id, 'completada')"
                >
                  Check-out
                </button>
              </div>
            </div>
          </div>

          <!-- Reservas pendientes de confirmar -->
          <div class="alerta-card pendientes" :class="{ 'sin-alertas': reservasSinConfirmar.length === 0 }">
            <div class="alerta-header">
              <div class="alerta-titulo-wrap">
                <span class="alerta-icono pendiente-ico">!</span>
                <span class="alerta-titulo">Sin confirmar</span>
              </div>
              <span class="alerta-badge" :class="reservasSinConfirmar.length > 0 ? 'urgente' : 'ok'">
                {{ reservasSinConfirmar.length }} reserva{{ reservasSinConfirmar.length !== 1 ? 's' : '' }}
              </span>
            </div>

            <div v-if="reservasSinConfirmar.length === 0" class="alerta-vacia">
              No hay reservas pendientes
            </div>

            <div v-else class="alerta-lista">
              <div v-for="r in reservasSinConfirmar" :key="r.id" class="alerta-item">
                <div class="alerta-item-info">
                  <span class="alerta-nombre">{{ r.nombreHuesped }} {{ r.apellidoHuesped }}</span>
                  <span class="alerta-sub">Check-in: {{ formatFechaCorta(r.fechaEntrada) }}</span>
                </div>
                <button
                  class="btn-alerta confirmar-btn"
                  @click="cambiarEstado(r.id, 'confirmada')"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- ── TODAS LAS RESERVAS ACTIVAS HOY ────────────────── -->
        <div class="seccion">
          <div class="seccion-header">
            <h2>Reservas activas hoy</h2>
            <span class="seccion-count">{{ reservasHoy.length }} total</span>
          </div>

          <div v-if="reservasHoy.length === 0" class="estado-vacio">
            No hay reservas activas hoy
          </div>

          <div v-else class="tabla-wrapper">
            <table class="tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Habitación</th>
                  <th>Huésped</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in reservasHoy" :key="r.id">
                  <td class="col-id">#{{ r.id }}</td>
                  <td>{{ r.tipoHabitacion }} — {{ r.numeroHabitacion }}</td>
                  <td>{{ r.nombreHuesped }} {{ r.apellidoHuesped }}</td>
                  <td>{{ formatFechaCorta(r.fechaEntrada) }}</td>
                  <td>{{ formatFechaCorta(r.fechaSalida) }}</td>
                  <td><span :class="['badge', r.estadoReserva]">{{ labelEstado(r.estadoReserva) }}</span></td>
                  <td>
                    <button class="btn-sm confirmar" @click="cambiarEstado(r.id, 'confirmada')" v-if="r.estadoReserva === 'pendiente'">Confirmar</button>
                    <button class="btn-sm checkin"   @click="cambiarEstado(r.id, 'en_curso')"   v-if="r.estadoReserva === 'confirmada'">Check-in</button>
                    <button class="btn-sm checkout"  @click="cambiarEstado(r.id, 'completada')" v-if="r.estadoReserva === 'en_curso'">Check-out</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { reservaService, reporteAdminService, habitacionService } from '../../api/services'

const router    = useRouter()
const authStore = useAuthStore()

const reservasHoy = ref([])
const todasLasReservas = ref([])
const cargando    = ref(true)
const stats = ref({ ocupadas: 0, disponibles: 0, mantenimiento: 0, ingresosHoy: 0 })

// ── Computadas ───────────────────────────────────────────────

const fechaHoy = computed(() =>
  new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
)

const hoyISO = computed(() => new Date().toISOString().slice(0, 10))

function parsearFecha(valor) {
  if (!valor) return null
  if (Array.isArray(valor)) {
    const [y, m, d] = valor
    return new Date(y, m - 1, d)
  }
  if (typeof valor === 'string') {
    if (valor.length === 10) return new Date(valor + 'T00:00:00')
    return new Date(valor)
  }
  return new Date(valor)
}

function esFechaHoy(valor) {
  const d = parsearFecha(valor)
  if (!d || isNaN(d.getTime())) return false
  const hoy = new Date()
  return d.getDate()     === hoy.getDate() &&
         d.getMonth()    === hoy.getMonth() &&
         d.getFullYear() === hoy.getFullYear()
}

// Reservas con check-in HOY y estado confirmada
const checkinsPendientes = computed(() =>
  todasLasReservas.value.filter(r =>
    r.estadoReserva === 'confirmada' && esFechaHoy(r.fechaEntrada)
  )
)

// Reservas en curso cuyo check-out es HOY
const checkoutsPendientes = computed(() =>
  todasLasReservas.value.filter(r =>
    r.estadoReserva === 'en_curso' && esFechaHoy(r.fechaSalida)
  )
)

// Todas las reservas pendientes (sin importar fecha)
const reservasSinConfirmar = computed(() =>
  todasLasReservas.value.filter(r => r.estadoReserva === 'pendiente')
)

// ── Lifecycle ────────────────────────────────────────────────
onMounted(async () => {
  try {
    const [resReservasHoy, resHabitaciones, resTodas] = await Promise.all([
      reservaService.reservasDeHoy(),
      habitacionService.listarTodas(),
      reservaService.listarTodas()
    ])

    reservasHoy.value      = resReservasHoy.data
    todasLasReservas.value = resTodas.data

    const habs = resHabitaciones.data
    stats.value.ocupadas      = habs.filter(h => h.estado === 'ocupada').length
    stats.value.disponibles   = habs.filter(h => h.estado === 'disponible').length
    stats.value.mantenimiento = habs.filter(h => h.estado === 'mantenimiento').length

    if (authStore.isAdmin) {
      const resReporte = await reporteAdminService.ingresosHoy()
      stats.value.ingresosHoy = resReporte.data.total
    }
  } catch (e) {
    console.error('Error cargando dashboard:', e)
  } finally {
    cargando.value = false
  }
})

// ── Métodos ──────────────────────────────────────────────────
async function cambiarEstado(id, nuevoEstado) {
  try {
    await reservaService.cambiarEstado(id, nuevoEstado)
    // Recargar ambas listas para que las alertas se actualicen
    const [resHoy, resTodas] = await Promise.all([
      reservaService.reservasDeHoy(),
      reservaService.listarTodas()
    ])
    reservasHoy.value      = resHoy.data
    todasLasReservas.value = resTodas.data
  } catch (e) {
    alert('Error al cambiar estado')
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function formatPrecio(valor) {
  return Number(valor || 0).toLocaleString('es-CO', {
    minimumFractionDigits: 0, maximumFractionDigits: 0
  })
}

function formatFechaCorta(valor) {
  if (!valor) return '—'
  const d = parsearFecha(valor)
  if (!d || isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function labelEstado(estado) {
  const map = {
    pendiente: 'Pendiente', confirmada: 'Confirmada',
    en_curso: 'En curso', completada: 'Completada', cancelada: 'Cancelada'
  }
  return map[estado] || estado
}
</script>

<style scoped>
.dashboard-layout { display: flex; min-height: 100vh; background: var(--color-gray-50); }

/* Sidebar */
.sidebar { width: 200px; min-height: 100vh; background: #1e293b; display: flex; flex-direction: column; padding: 1.5rem 0; position: fixed; top: 0; left: 0; bottom: 0; }
.sidebar-brand { color: #fff; font-size: 1rem; font-weight: 700; padding: 0 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 0.75rem; }
.sidebar-nav { display: flex; flex-direction: column; flex: 1; }
.nav-item { color: rgba(255,255,255,0.65); font-size: 0.875rem; padding: 0.65rem 1.25rem; text-decoration: none; transition: background 0.15s, color 0.15s; }
.nav-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
.nav-item.active { background: rgba(37,99,235,0.3); color: #fff; border-left: 3px solid var(--color-primary); }
.sidebar-footer { padding: 1rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.08); }
.usuario-nombre { color: #fff; font-size: 0.85rem; font-weight: 600; }
.usuario-rol { color: rgba(255,255,255,0.45); font-size: 0.75rem; margin-bottom: 0.75rem; text-transform: capitalize; }
.btn-logout { width: 100%; padding: 0.45rem; background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); border-radius: var(--radius); font-size: 0.8rem; cursor: pointer; }
.btn-logout:hover { background: rgba(239,68,68,0.25); }

/* Contenido */
.main-content { margin-left: 200px; flex: 1; padding: 2rem; min-height: 100vh; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.35rem; font-weight: 700; color: var(--color-gray-800); }
.fecha-hoy { font-size: 0.82rem; color: var(--color-gray-400); text-transform: capitalize; }

/* Spinner */
.estado-cargando { display: flex; align-items: center; gap: 0.75rem; padding: 3rem; justify-content: center; color: var(--color-gray-400); }
.spinner { width: 20px; height: 20px; border: 2px solid var(--color-gray-200); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Stats grid */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: #fff; border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; box-shadow: var(--shadow-sm); border-left: 4px solid; }
.stat-card.ocupadas     { border-left-color: var(--color-danger, #dc2626); }
.stat-card.disponibles  { border-left-color: var(--color-success, #16a34a); }
.stat-card.mantenimiento{ border-left-color: var(--color-warning, #d97706); }
.stat-card.ingresos     { border-left-color: var(--color-primary, #2563eb); }
.stat-numero { font-size: 1.7rem; font-weight: 700; color: var(--color-gray-800); line-height: 1; margin-bottom: 0.3rem; }
.stat-label  { font-size: 0.78rem; color: var(--color-gray-400); }

/* ── ALERTAS DEL DÍA ─────────────────────────────────────── */
.alertas-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.alerta-card {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  border-top: 3px solid;
  transition: box-shadow 0.15s;
}
.alerta-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
.alerta-card.checkin   { border-top-color: #16a34a; }
.alerta-card.checkout  { border-top-color: #2563eb; }
.alerta-card.pendientes{ border-top-color: #d97706; }
.alerta-card.sin-alertas { opacity: 0.7; }

.alerta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--color-gray-100);
}

.alerta-titulo-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alerta-icono {
  width: 24px; height: 24px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 700;
  flex-shrink: 0;
}
.checkin-ico  { background: #dcfce7; color: #15803d; }
.checkout-ico { background: #dbeafe; color: #1d4ed8; }
.pendiente-ico{ background: #fef3c7; color: #92400e; }

.alerta-titulo { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-800); }

.alerta-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}
.alerta-badge.urgente { background: #fee2e2; color: #991b1b; }
.alerta-badge.ok      { background: #f1f5f9; color: var(--color-gray-400); }

.alerta-vacia {
  padding: 1rem;
  font-size: 0.8rem;
  color: var(--color-gray-400);
  text-align: center;
}

.alerta-lista {
  display: flex;
  flex-direction: column;
  max-height: 200px;
  overflow-y: auto;
}

.alerta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 1rem;
  border-bottom: 1px solid var(--color-gray-50);
  gap: 0.5rem;
}
.alerta-item:last-child { border-bottom: none; }

.alerta-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.alerta-nombre { font-size: 0.82rem; font-weight: 600; color: var(--color-gray-800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.alerta-sub    { font-size: 0.72rem; color: var(--color-gray-400); }

.btn-alerta {
  flex-shrink: 0;
  padding: 0.3rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.checkin-btn   { background: #dcfce7; color: #15803d; }
.checkin-btn:hover  { background: #bbf7d0; }
.checkout-btn  { background: #dbeafe; color: #1d4ed8; }
.checkout-btn:hover { background: #bfdbfe; }
.confirmar-btn { background: #fef3c7; color: #92400e; }
.confirmar-btn:hover{ background: #fde68a; }

/* ── SECCIÓN RESERVAS ACTIVAS ────────────────────────────── */
.seccion { background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; }
.seccion-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid var(--color-gray-100); }
.seccion-header h2 { font-size: 0.95rem; font-weight: 600; color: var(--color-gray-800); margin: 0; }
.seccion-count { font-size: 0.75rem; color: var(--color-gray-400); background: var(--color-gray-100); padding: 2px 8px; border-radius: 10px; }

.tabla-wrapper { overflow-x: auto; }
.tabla { width: 100%; border-collapse: collapse; font-size: 0.83rem; }
.tabla thead th { text-align: left; padding: 0.65rem 1rem; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-gray-400); background: var(--color-gray-50); border-bottom: 1px solid var(--color-gray-100); white-space: nowrap; }
.tabla tbody td { padding: 0.7rem 1rem; border-bottom: 1px solid var(--color-gray-50); color: var(--color-gray-700); vertical-align: middle; }
.tabla tbody tr:last-child td { border-bottom: none; }
.tabla tbody tr:hover { background: #f8fafc; }
.col-id { color: var(--color-gray-400) !important; font-size: 0.75rem; }

.estado-vacio { padding: 2.5rem; text-align: center; color: var(--color-gray-400); font-size: 0.875rem; }

/* Badges */
.badge { display: inline-block; padding: 0.2rem 0.65rem; border-radius: 20px; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
.badge.pendiente  { background: #fef3c7; color: #92400e; }
.badge.confirmada { background: #dbeafe; color: #1e40af; }
.badge.en_curso   { background: #d1fae5; color: #065f46; }
.badge.completada { background: #f3f4f6; color: #374151; }
.badge.cancelada  { background: #fee2e2; color: #991b1b; }

/* Botones acción tabla */
.btn-sm { padding: 0.25rem 0.6rem; border-radius: 6px; border: none; font-size: 0.72rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-sm.confirmar { background: #fef3c7; color: #92400e; }
.btn-sm.checkin   { background: #d1fae5; color: #065f46; }
.btn-sm.checkout  { background: #dbeafe; color: #1e40af; }

/* Responsive */
@media (max-width: 1100px) { .alertas-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 768px)  { .sidebar { display: none; } .main-content { margin-left: 0; padding: 1rem; } .alertas-grid { grid-template-columns: 1fr; } .stats-grid { grid-template-columns: repeat(2, 1fr); } }
</style>