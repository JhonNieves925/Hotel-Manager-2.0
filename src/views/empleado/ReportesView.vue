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
        <div class="usuario-nombre">{{ authStore.nombreUsuario }}</div>
        <div class="usuario-rol">{{ authStore.usuario?.rol }}</div>
        <button class="btn-logout" @click="handleLogout">Cerrar sesión</button>
      </div>
    </aside>

    <main class="main-content">
      <div class="page-header">
        <h1>Reportes {{ authStore.isAdmin ? 'financieros' : 'de ocupación' }}</h1>
        <span class="fecha-hoy">{{ fechaHoy }}</span>
      </div>

      <!-- SELECTOR DE PERÍODO -->
      <div class="periodo-tabs">
        <button
          v-for="p in periodos"
          :key="p.key"
          :class="['tab', { active: periodoActivo === p.key }]"
          @click="cambiarPeriodo(p.key)"
        >{{ p.label }}</button>

        <div v-if="periodoActivo === 'anual'" class="anio-selector">
          <select v-model="anioSeleccionado" @change="cargarReporte">
            <option v-for="a in aniosDisponibles" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
      </div>

      <div v-if="cargando" class="estado-cargando">Cargando reporte...</div>

      <div v-else-if="reporte" class="reporte-contenido">

        <!-- TARJETAS ADMIN — incluye dinero -->
        <div v-if="authStore.isAdmin" class="stats-grid">
          <div class="stat-card ingresos">
            <div class="stat-icono">$</div>
            <div class="stat-numero">${{ formatPrecio(reporte.total) }}</div>
            <div class="stat-label">Total ingresos — {{ labelPeriodo }}</div>
          </div>
          <div class="stat-card transacciones">
            <div class="stat-icono">#</div>
            <div class="stat-numero">{{ reporte.transacciones }}</div>
            <div class="stat-label">Pagos procesados</div>
          </div>
          <div class="stat-card ocupadas">
            <div class="stat-numero">{{ reporte.habitacionesOcupadas }}</div>
            <div class="stat-label">Habitaciones ocupadas</div>
          </div>
          <div class="stat-card disponibles">
            <div class="stat-numero">{{ reporte.habitacionesDisponibles }}</div>
            <div class="stat-label">Disponibles</div>
          </div>
        </div>

        <!-- TARJETAS EMPLEADO — solo ocupación -->
        <div v-else class="stats-grid">
          <div class="stat-card ocupadas">
            <div class="stat-numero">{{ reporte.habitacionesOcupadas }}</div>
            <div class="stat-label">Habitaciones ocupadas</div>
          </div>
          <div class="stat-card disponibles">
            <div class="stat-numero">{{ reporte.habitacionesDisponibles }}</div>
            <div class="stat-label">Disponibles</div>
          </div>
          <div class="stat-card mantenimiento">
            <div class="stat-numero">{{ reporte.habitacionesMantenimiento }}</div>
            <div class="stat-label">En mantenimiento</div>
          </div>
          <div class="stat-card total-habs">
            <div class="stat-numero">{{ reporte.totalHabitaciones }}</div>
            <div class="stat-label">Total habitaciones</div>
          </div>
        </div>

        <!-- BARRA DE OCUPACIÓN — visible para todos -->
        <div class="ocupacion-card">
          <div class="ocupacion-header">
            <span class="ocupacion-titulo">Ocupación actual</span>
            <span class="ocupacion-pct">{{ pctOcupacion }}%</span>
          </div>
          <div class="barra-fondo">
            <div
              class="barra-relleno"
              :style="{ width: pctOcupacion + '%' }"
              :class="colorBarra"
            ></div>
          </div>
          <div class="ocupacion-detalle">
            <span class="dot ocupada"></span> {{ reporte.habitacionesOcupadas }} ocupadas &nbsp;
            <span class="dot disponible"></span> {{ reporte.habitacionesDisponibles }} disponibles &nbsp;
            <span class="dot mantenimiento"></span> {{ reporte.habitacionesMantenimiento }} mantenimiento
          </div>
        </div>

        <!-- RESUMEN ADMIN — incluye dinero -->
        <div v-if="authStore.isAdmin" class="resumen-card">
          <h3>Resumen financiero — {{ labelPeriodo }}</h3>
          <div class="resumen-fila">
            <span class="resumen-label">Total ingresos</span>
            <span class="resumen-valor destacado">${{ formatPrecio(reporte.total) }}</span>
          </div>
          <div class="resumen-fila">
            <span class="resumen-label">Número de pagos</span>
            <span class="resumen-valor">{{ reporte.transacciones }}</span>
          </div>
          <div class="resumen-fila">
            <span class="resumen-label">Promedio por pago</span>
            <span class="resumen-valor">
              ${{ reporte.transacciones > 0
                ? formatPrecio(reporte.total / reporte.transacciones)
                : '0' }}
            </span>
          </div>
          <div class="resumen-fila">
            <span class="resumen-label">Ocupación</span>
            <span class="resumen-valor">{{ pctOcupacion }}%</span>
          </div>
        </div>

        <!-- RESUMEN EMPLEADO — solo ocupación -->
        <div v-else class="resumen-card">
          <h3>Resumen de ocupación — {{ labelPeriodo }}</h3>
          <div class="resumen-fila">
            <span class="resumen-label">Habitaciones ocupadas</span>
            <span class="resumen-valor destacado">{{ reporte.habitacionesOcupadas }}</span>
          </div>
          <div class="resumen-fila">
            <span class="resumen-label">Habitaciones disponibles</span>
            <span class="resumen-valor">{{ reporte.habitacionesDisponibles }}</span>
          </div>
          <div class="resumen-fila">
            <span class="resumen-label">En mantenimiento</span>
            <span class="resumen-valor">{{ reporte.habitacionesMantenimiento }}</span>
          </div>
          <div class="resumen-fila">
            <span class="resumen-label">Porcentaje de ocupación</span>
            <span class="resumen-valor">{{ reporte.porcentajeOcupacion }}%</span>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { reporteAdminService, reporteOcupacionService } from '../../api/services'

const router    = useRouter()
const authStore = useAuthStore()

const periodos = [
  { key: 'hoy',    label: 'Hoy' },
  { key: 'semana', label: 'Esta semana' },
  { key: 'mes',    label: 'Este mes' },
  { key: 'anual',  label: 'Anual' }
]

const periodoActivo    = ref('hoy')
const reporte          = ref(null)
const cargando         = ref(false)
const anioSeleccionado = ref(new Date().getFullYear())

const aniosDisponibles = computed(() => {
  const actual = new Date().getFullYear()
  return [actual, actual - 1, actual - 2, actual - 3]
})

const fechaHoy = computed(() =>
  new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
)

const labelPeriodo = computed(() => {
  const map = {
    hoy:    'Hoy — ' + new Date().toLocaleDateString('es-CO'),
    semana: 'Semana actual',
    mes:    'Mes de ' + new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
    anual:  'Año ' + anioSeleccionado.value
  }
  return map[periodoActivo.value]
})

const pctOcupacion = computed(() => {
  if (!reporte.value) return 0
  // Admin usa habitacionesOcupadas / suma total
  // Empleado tiene porcentajeOcupacion calculado en el backend
  if (authStore.isAdmin) {
    const total = (reporte.value.habitacionesOcupadas || 0) +
                  (reporte.value.habitacionesDisponibles || 0) +
                  (reporte.value.habitacionesMantenimiento || 0)
    return total > 0
      ? Math.round((reporte.value.habitacionesOcupadas / total) * 100)
      : 0
  }
  return reporte.value.porcentajeOcupacion || 0
})

const colorBarra = computed(() => {
  if (pctOcupacion.value >= 80) return 'alta'
  if (pctOcupacion.value >= 50) return 'media'
  return 'baja'
})

onMounted(cargarReporte)

async function cargarReporte() {
  cargando.value = true
  reporte.value  = null
  try {
    let res
    // Admin llama a /reportes/admin/... que incluye datos financieros
    // Empleado llama a /reportes/ocupacion/... que solo tiene ocupación
    if (authStore.isAdmin) {
      switch (periodoActivo.value) {
        case 'hoy':    res = await reporteAdminService.ingresosHoy(); break
        case 'semana': res = await reporteAdminService.ingresosSemana(); break
        case 'mes':    res = await reporteAdminService.ingresosMes(); break
        case 'anual':  res = await reporteAdminService.ingresosAnual(anioSeleccionado.value); break
      }
    } else {
      switch (periodoActivo.value) {
        case 'hoy':    res = await reporteOcupacionService.hoy(); break
        case 'semana': res = await reporteOcupacionService.semana(); break
        case 'mes':    res = await reporteOcupacionService.mes(); break
        case 'anual':  res = await reporteOcupacionService.anual(anioSeleccionado.value); break
      }
    }
    reporte.value = res.data
  } catch (e) {
    console.error('Error cargando reporte:', e)
  } finally {
    cargando.value = false
  }
}

function cambiarPeriodo(key) {
  periodoActivo.value = key
  cargarReporte()
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function formatPrecio(valor) {
  return Number(valor || 0).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
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
.sidebar-footer { padding:1rem 1.25rem; border-top:1px solid rgba(255,255,255,0.1); }
.usuario-nombre { font-size:0.875rem; font-weight:500; color:#fff; }
.usuario-rol { font-size:0.75rem; color:rgba(255,255,255,0.5); text-transform:capitalize; margin-bottom:0.75rem; }
.btn-logout { width:100%; background:rgba(220,38,38,0.15); color:#fca5a5; border:1px solid rgba(220,38,38,0.3); border-radius:var(--radius); padding:0.5rem; font-size:0.825rem; }
.btn-logout:hover { background:rgba(220,38,38,0.3); }
.main-content { flex:1; padding:2rem; overflow-y:auto; background:var(--color-gray-50); }
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
.page-header h1 { font-size:1.5rem; font-weight:700; color:var(--color-gray-800); }
.fecha-hoy { font-size:0.875rem; color:var(--color-gray-400); text-transform:capitalize; }
.periodo-tabs { display:flex; gap:0.5rem; align-items:center; margin-bottom:1.75rem; flex-wrap:wrap; }
.tab { padding:0.5rem 1.25rem; border-radius:20px; border:1px solid var(--color-gray-200); background:#fff; color:var(--color-gray-600); font-size:0.875rem; font-weight:500; transition:all 0.2s; }
.tab:hover { border-color:var(--color-primary); color:var(--color-primary); }
.tab.active { background:var(--color-primary); color:#fff; border-color:var(--color-primary); }
.anio-selector select { padding:0.45rem 0.85rem; border:1px solid var(--color-gray-200); border-radius:var(--radius); font-size:0.875rem; color:var(--color-gray-800); background:#fff; outline:none; }
.estado-cargando { text-align:center; padding:3rem; color:var(--color-gray-400); }
.reporte-contenido { display:flex; flex-direction:column; gap:1.25rem; }
.stats-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(200px,1fr)); gap:1rem; }
.stat-card { background:#fff; border-radius:var(--radius-lg); padding:1.25rem 1.5rem; box-shadow:var(--shadow-sm); border-left:4px solid; display:flex; flex-direction:column; gap:0.4rem; }
.stat-card.ingresos      { border-left-color:var(--color-primary); }
.stat-card.transacciones { border-left-color:#8b5cf6; }
.stat-card.ocupadas      { border-left-color:var(--color-danger); }
.stat-card.disponibles   { border-left-color:var(--color-success); }
.stat-card.mantenimiento { border-left-color:var(--color-warning); }
.stat-card.total-habs    { border-left-color:var(--color-gray-400); }
.stat-icono { font-size:0.75rem; font-weight:700; color:var(--color-gray-400); text-transform:uppercase; letter-spacing:0.05em; }
.stat-numero { font-size:1.6rem; font-weight:700; color:var(--color-gray-800); line-height:1; }
.stat-label  { font-size:0.78rem; color:var(--color-gray-400); }
.ocupacion-card { background:#fff; border-radius:var(--radius-lg); padding:1.5rem; box-shadow:var(--shadow-sm); }
.ocupacion-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; }
.ocupacion-titulo { font-size:0.95rem; font-weight:600; color:var(--color-gray-800); }
.ocupacion-pct    { font-size:1.1rem; font-weight:700; color:var(--color-primary); }
.barra-fondo { height:10px; background:var(--color-gray-100); border-radius:10px; overflow:hidden; margin-bottom:0.75rem; }
.barra-relleno { height:100%; border-radius:10px; transition:width 0.5s ease; }
.barra-relleno.alta  { background:var(--color-danger); }
.barra-relleno.media { background:var(--color-warning); }
.barra-relleno.baja  { background:var(--color-success); }
.ocupacion-detalle { display:flex; align-items:center; gap:0.25rem; font-size:0.8rem; color:var(--color-gray-400); flex-wrap:wrap; }
.dot { display:inline-block; width:8px; height:8px; border-radius:50%; }
.dot.ocupada      { background:var(--color-danger); }
.dot.disponible   { background:var(--color-success); }
.dot.mantenimiento { background:var(--color-warning); }
.resumen-card { background:#fff; border-radius:var(--radius-lg); padding:1.5rem; box-shadow:var(--shadow-sm); }
.resumen-card h3 { font-size:0.95rem; font-weight:600; color:var(--color-gray-800); margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid var(--color-gray-100); }
.resumen-fila { display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0; border-bottom:1px solid var(--color-gray-100); }
.resumen-fila:last-child { border-bottom:none; }
.resumen-label { font-size:0.85rem; color:var(--color-gray-400); }
.resumen-valor { font-size:0.9rem; font-weight:500; color:var(--color-gray-800); }
.resumen-valor.destacado { font-size:1rem; font-weight:700; color:var(--color-primary); }
</style>