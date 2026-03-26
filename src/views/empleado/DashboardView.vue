<template>
  <div class="dashboard-layout">

    <aside class="sidebar">
      <div class="sidebar-brand">Hotel Manager</div>
      <nav class="sidebar-nav">
        <RouterLink to="/reportes" class="nav-item" active-class="active">Reportes</RouterLink>
        <RouterLink to="/dashboard"    class="nav-item" active-class="active">Dashboard</RouterLink>
        <RouterLink to="/reservas"     class="nav-item" active-class="active">Reservas</RouterLink>
        <RouterLink to="/huespedes"    class="nav-item" active-class="active">Huéspedes</RouterLink>
        <RouterLink to="/habitaciones" class="nav-item" active-class="active">Habitaciones</RouterLink>
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

      <!-- TARJETAS DE ESTADO -->
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
        <!-- Ingresos solo visible para admin -->
        <div class="stat-card ingresos" v-if="authStore.isAdmin">
          <div class="stat-numero">${{ formatPrecio(stats.ingresosHoy) }}</div>
          <div class="stat-label">Ingresos hoy</div>
        </div>
      </div>

      <!-- RESERVAS DE HOY -->
      <div class="seccion">
        <h2>Reservas activas hoy</h2>
        <div v-if="cargando" class="estado-cargando">Cargando...</div>
        <div v-else-if="reservasHoy.length === 0" class="estado-vacio">
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
                <td>{{ r.id }}</td>
                <td>{{ r.tipoHabitacion }} — {{ r.numeroHabitacion }}</td>
                <td>{{ r.nombreHuesped }} {{ r.apellidoHuesped }}</td>
                <td>{{ r.fechaEntrada }}</td>
                <td>{{ r.fechaSalida }}</td>
                <td>
                  <span :class="['badge', r.estadoReserva]">
                    {{ r.estadoReserva }}
                  </span>
                </td>
                <td>
                  <button
                    class="btn-sm"
                    @click="cambiarEstado(r.id, 'en_curso')"
                    v-if="r.estadoReserva === 'confirmada'"
                  >Check-in</button>
                  <button
                    class="btn-sm btn-success"
                    @click="cambiarEstado(r.id, 'completada')"
                    v-if="r.estadoReserva === 'en_curso'"
                  >Check-out</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { reservaService, reporteAdminService, habitacionService } from '../../api/services'

const router    = useRouter()
const authStore = useAuthStore()

const reservasHoy = ref([])
const cargando    = ref(true)
const stats = ref({
  ocupadas: 0,
  disponibles: 0,
  mantenimiento: 0,
  ingresosHoy: 0
})

const fechaHoy = computed(() => {
  return new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
})

onMounted(async () => {
  try {
    // Todos cargan habitaciones para los conteos
    const [resReservas, resHabitaciones] = await Promise.all([
      reservaService.reservasDeHoy(),
      habitacionService.listarTodas()
    ])

    reservasHoy.value = resReservas.data

    // Contar estados desde la lista de habitaciones
    const habs = resHabitaciones.data
    stats.value.ocupadas      = habs.filter(h => h.estado === 'ocupada').length
    stats.value.disponibles   = habs.filter(h => h.estado === 'disponible').length
    stats.value.mantenimiento = habs.filter(h => h.estado === 'mantenimiento').length

    // Ingresos solo para admin
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

async function cambiarEstado(id, nuevoEstado) {
  try {
    await reservaService.cambiarEstado(id, nuevoEstado)
    const res = await reservaService.reservasDeHoy()
    reservasHoy.value = res.data
  } catch (e) {
    alert('Error al cambiar estado')
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function formatPrecio(valor) {
  return Number(valor || 0).toLocaleString('es-CO')
}
</script>

<style scoped>
.dashboard-layout { display:flex; min-height:100vh; }
.sidebar { width:240px; background:#1e293b; color:#fff; display:flex; flex-direction:column; flex-shrink:0; }
.sidebar-brand { padding:1.5rem 1.25rem; font-size:1.1rem; font-weight:700; border-bottom:1px solid rgba(255,255,255,0.1); }
.sidebar-nav { flex:1; padding:1rem 0; display:flex; flex-direction:column; gap:0.25rem; }
.nav-item { display:block; padding:0.7rem 1.25rem; color:rgba(255,255,255,0.7); font-size:0.9rem; transition:all 0.2s; border-left:3px solid transparent; }
.nav-item:hover { background:rgba(255,255,255,0.08); color:#fff; }
.nav-item.active { background:rgba(37,99,235,0.3); color:#fff; border-left-color:var(--color-primary); }
.nav-icon { font-size:8px; }
.sidebar-footer { padding:1rem 1.25rem; border-top:1px solid rgba(255,255,255,0.1); }
.usuario-nombre { font-size:0.875rem; font-weight:500; color:#fff; }
.usuario-rol { font-size:0.75rem; color:rgba(255,255,255,0.5); text-transform:capitalize; margin-bottom:0.75rem; }
.btn-logout { width:100%; background:rgba(220,38,38,0.15); color:#fca5a5; border:1px solid rgba(220,38,38,0.3); border-radius:var(--radius); padding:0.5rem; font-size:0.825rem; }
.btn-logout:hover { background:rgba(220,38,38,0.3); }
.main-content { flex:1; padding:2rem; overflow-y:auto; }
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.75rem; }
.page-header h1 { font-size:1.5rem; font-weight:700; color:var(--color-gray-800); }
.fecha-hoy { font-size:0.875rem; color:var(--color-gray-400); text-transform:capitalize; }
.stats-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(180px,1fr)); gap:1rem; margin-bottom:2rem; }
.stat-card { background:#fff; border-radius:var(--radius-lg); padding:1.25rem 1.5rem; box-shadow:var(--shadow-sm); border-left:4px solid; }
.stat-card.ocupadas    { border-left-color:var(--color-danger); }
.stat-card.disponibles { border-left-color:var(--color-success); }
.stat-card.mantenimiento { border-left-color:var(--color-warning); }
.stat-card.ingresos    { border-left-color:var(--color-primary); }
.stat-numero { font-size:1.75rem; font-weight:700; color:var(--color-gray-800); line-height:1; margin-bottom:0.4rem; }
.stat-label  { font-size:0.8rem; color:var(--color-gray-400); }
.seccion { background:#fff; border-radius:var(--radius-lg); padding:1.5rem; box-shadow:var(--shadow-sm); }
.seccion h2 { font-size:1rem; font-weight:600; color:var(--color-gray-800); margin-bottom:1rem; }
.estado-cargando, .estado-vacio { text-align:center; padding:2rem; color:var(--color-gray-400); font-size:0.9rem; }
.tabla-wrapper { overflow-x:auto; }
.tabla { width:100%; border-collapse:collapse; font-size:0.875rem; }
.tabla th { text-align:left; padding:0.6rem 0.75rem; background:var(--color-gray-50); color:var(--color-gray-600); font-weight:500; font-size:0.8rem; border-bottom:1px solid var(--color-gray-200); }
.tabla td { padding:0.75rem; border-bottom:1px solid var(--color-gray-100); color:var(--color-gray-800); }
.badge { display:inline-block; padding:0.25rem 0.6rem; border-radius:20px; font-size:0.75rem; font-weight:500; }
.badge.pendiente   { background:#fef3c7; color:#92400e; }
.badge.confirmada  { background:#dbeafe; color:#1e40af; }
.badge.en_curso    { background:#dcfce7; color:#166534; }
.badge.completada  { background:#f1f5f9; color:#475569; }
.badge.cancelada   { background:#fee2e2; color:#991b1b; }
.btn-sm { background:var(--color-primary); color:#fff; border:none; border-radius:var(--radius); padding:0.35rem 0.75rem; font-size:0.775rem; font-weight:500; }
.btn-sm:hover { background:var(--color-primary-dark); }
.btn-sm.btn-success { background:var(--color-success); }
.btn-sm.btn-success:hover { background:#15803d; }
</style>