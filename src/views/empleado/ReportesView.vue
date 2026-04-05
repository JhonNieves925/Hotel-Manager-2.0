<template>
  <div class="dashboard-layout">

    <!-- SIDEBAR -->
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

    <!-- CONTENIDO PRINCIPAL -->
    <main class="main-content">

      <!-- ENCABEZADO -->
      <div class="page-header">
        <h1>{{ authStore.isAdmin ? 'Reportes financieros' : 'Reportes de ocupación' }}</h1>
        <span class="fecha-hoy">{{ fechaHoy }}</span>
      </div>

      <!-- TABS DE PERÍODO -->
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

      <!-- PANEL RANGO PERSONALIZADO -->
      <div v-if="periodoActivo === 'personalizado'" class="rango-panel">
        <div class="rango-campos">
          <div class="rango-campo">
            <label class="rango-label">Desde</label>
            <input type="date" v-model="rangoDesde" class="rango-input" :max="rangoHasta || hoyISO" />
          </div>
          <span class="rango-sep">→</span>
          <div class="rango-campo">
            <label class="rango-label">Hasta</label>
            <input type="date" v-model="rangoHasta" class="rango-input" :min="rangoDesde" :max="hoyISO" />
          </div>
          <button class="btn-aplicar" @click="aplicarRango" :disabled="!rangoDesde || !rangoHasta">
            Aplicar
          </button>
          <button v-if="rangoAplicado" class="btn-limpiar" @click="limpiarRango">✕ Limpiar</button>
        </div>
        <p v-if="rangoAplicado" class="rango-info">
          Mostrando reservas del <strong>{{ formatFechaCorta(rangoDesde) }}</strong>
          al <strong>{{ formatFechaCorta(rangoHasta) }}</strong>
          — {{ reservasPeriodo.length }} resultado(s)
        </p>
        <p v-else class="rango-info muted">Selecciona un rango de fechas y presiona Aplicar</p>
      </div>

      <!-- CARGANDO -->
      <div v-if="cargando" class="estado-cargando">Cargando reporte...</div>

      <!-- MENSAJE RANGO NO APLICADO -->
      <div v-else-if="periodoActivo === 'personalizado' && !rangoAplicado" class="estado-espera">
        <div class="espera-icono">📅</div>
        <p>Selecciona el rango de fechas y presiona <strong>Aplicar</strong> para ver los resultados</p>
      </div>

      <!-- CONTENIDO DEL REPORTE -->
      <div v-else-if="reporte || periodoActivo === 'personalizado'" class="reporte-contenido">

        <!-- ── TARJETAS STATS — se ocultan en modo personalizado (no hay endpoint para rangos arbitrarios) ── -->
        <template v-if="periodoActivo !== 'personalizado'">
          <div v-if="authStore.isAdmin" class="stats-grid">
            <div class="stat-card ingresos">
              <div class="stat-icono">ingresos</div>
              <div class="stat-numero">${{ formatPrecio(reporte.total) }}</div>
              <div class="stat-label">{{ labelPeriodo }}</div>
            </div>
            <div class="stat-card transacciones">
              <div class="stat-icono">pagos</div>
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

          <!-- ── BARRA DE OCUPACIÓN ── -->
          <div class="ocupacion-card">
            <div class="ocupacion-header">
              <span class="ocupacion-titulo">Ocupación actual</span>
              <span class="ocupacion-pct" :class="colorBarra">{{ pctOcupacion }}%</span>
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
              <span class="dot mantenimiento"></span> {{ reporte.habitacionesMantenimiento ?? 0 }} mantenimiento
            </div>
          </div>
        </template>

        <!-- ── SPLIT: Resumen + Tabla de reservas ── -->
        <div class="split-layout">

          <!-- Resumen numérico -->
          <div class="resumen-card">
            <h3 class="card-title">
              {{ periodoActivo === 'personalizado' ? 'Resumen del rango' : 'Resumen — ' + labelPeriodo }}
            </h3>

            <template v-if="authStore.isAdmin && periodoActivo !== 'personalizado'">
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
            </template>

            <!-- Resumen calculado desde las reservas filtradas (funciona para todos los modos) -->
            <div class="resumen-fila">
              <span class="resumen-label">Reservas encontradas</span>
              <span class="resumen-valor destacado">{{ reservasPeriodo.length }}</span>
            </div>
            <div v-if="authStore.isAdmin" class="resumen-fila">
              <span class="resumen-label">Ingresos del período</span>
              <span class="resumen-valor destacado">${{ formatPrecio(totalIngresosReservas) }}</span>
            </div>
            <div class="resumen-fila">
              <span class="resumen-label">Noches vendidas</span>
              <span class="resumen-valor">{{ totalNochesReservas }}</span>
            </div>
            <template v-if="periodoActivo !== 'personalizado'">
              <div class="resumen-fila">
                <span class="resumen-label">Hab. ocupadas</span>
                <span class="resumen-valor">{{ reporte.habitacionesOcupadas }}</span>
              </div>
              <div class="resumen-fila">
                <span class="resumen-label">Disponibles</span>
                <span class="resumen-valor">{{ reporte.habitacionesDisponibles }}</span>
              </div>
              <div class="resumen-fila">
                <span class="resumen-label">% Ocupación</span>
                <span class="resumen-valor" :class="colorBarra">{{ pctOcupacion }}%</span>
              </div>
            </template>
          </div>

          <!-- Tabla de reservas del período -->
          <div class="reservas-card">
            <div class="reservas-card-header">
              <h3 class="card-title">Reservas del período</h3>
              <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
                <!-- Filtro por estado -->
                <select v-model="filtroEstado" class="filtro-select">
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="en_curso">En curso</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
                <span class="reservas-count">{{ reservasPeriodo.length }} reservas</span>
              </div>
            </div>

            <div v-if="cargandoReservas" class="estado-mini">Cargando...</div>

            <div v-else-if="reservasPeriodo.length === 0" class="estado-mini vacio">
              No hay reservas en este período
            </div>

            <div v-else class="tabla-wrapper">
              <table class="tabla-reservas">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Registrada</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Huésped</th>
                    <th>Habitación</th>
                    <th>Noches</th>
                    <th v-if="authStore.isAdmin">Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in reservasPeriodo" :key="r.id">
                    <td class="col-id">#{{ r.id }}</td>
                    <td class="col-fecha">
                      <div>{{ formatFechaCorta(r.createdAt) }}</div>
                      <div class="hora-txt">{{ formatHora(r.createdAt) }}</div>
                    </td>
                    <td>{{ formatFechaCorta(r.fechaEntrada) }}</td>
                    <td>{{ formatFechaCorta(r.fechaSalida) }}</td>
                    <td class="col-huesped">{{ r.nombreHuesped }} {{ r.apellidoHuesped }}</td>
                    <td class="col-hab">
                      {{ r.tipoHabitacion }}<br>
                      <span class="num-hab">Nro. {{ r.numeroHabitacion }}</span>
                    </td>
                    <td class="col-noches">{{ r.noches }}</td>
                    <td v-if="authStore.isAdmin" class="col-total">${{ formatPrecio(r.valorTotal) }}</td>
                    <td>
                      <span :class="['badge', r.estadoReserva]">{{ labelEstado(r.estadoReserva) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
        <!-- /split-layout -->

      </div>
      <!-- /reporte-contenido -->

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import {
  reporteAdminService,
  reporteOcupacionService,
  reservaService
} from '../../api/services'

const router    = useRouter()
const authStore = useAuthStore()

const periodos = [
  { key: 'hoy',          label: 'Hoy' },
  { key: 'semana',       label: 'Esta semana' },
  { key: 'mes',          label: 'Este mes' },
  { key: 'anual',        label: 'Anual' },
  { key: 'personalizado', label: '📅 Personalizado' }
]

const periodoActivo    = ref('hoy')
const anioSeleccionado = ref(new Date().getFullYear())
const reporte          = ref(null)
const todasLasReservas = ref([])
const cargando         = ref(false)
const cargandoReservas = ref(false)
const filtroEstado     = ref('')

// Rango personalizado
const rangoDesde   = ref('')
const rangoHasta   = ref('')
const rangoAplicado = ref(false)

// ── Computadas ──────────────────────────────────────────────
const hoyISO = computed(() => new Date().toISOString().slice(0, 10))

const aniosDisponibles = computed(() => {
  const y = new Date().getFullYear()
  return [y, y - 1, y - 2, y - 3, y - 4]
})

const fechaHoy = computed(() =>
  new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
)

const labelPeriodo = computed(() => {
  const map = {
    hoy:          'Hoy — ' + new Date().toLocaleDateString('es-CO'),
    semana:       'Semana actual',
    mes:          'Mes de ' + new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
    anual:        'Año ' + anioSeleccionado.value,
    personalizado: rangoAplicado.value
      ? formatFechaCorta(rangoDesde.value) + ' al ' + formatFechaCorta(rangoHasta.value)
      : 'Rango personalizado'
  }
  return map[periodoActivo.value]
})

const pctOcupacion = computed(() => {
  if (!reporte.value) return 0
  if (authStore.isAdmin) {
    const total = (reporte.value.habitacionesOcupadas    || 0)
                + (reporte.value.habitacionesDisponibles || 0)
                + (reporte.value.habitacionesMantenimiento || 0)
    return total > 0 ? Math.round((reporte.value.habitacionesOcupadas / total) * 100) : 0
  }
  return reporte.value.porcentajeOcupacion || 0
})

const colorBarra = computed(() => {
  if (pctOcupacion.value >= 80) return 'alta'
  if (pctOcupacion.value >= 50) return 'media'
  return 'baja'
})

const reservasPeriodo = computed(() => {
  const filtradas = filtrarPorPeriodo(todasLasReservas.value)
  if (!filtroEstado.value) return filtradas
  return filtradas.filter(r => r.estadoReserva === filtroEstado.value)
})

// Calculados desde las reservas filtradas (útiles en modo personalizado)
const totalIngresosReservas = computed(() =>
  reservasPeriodo.value.reduce((sum, r) => sum + Number(r.valorTotal || 0), 0)
)
const totalNochesReservas = computed(() =>
  reservasPeriodo.value.reduce((sum, r) => sum + Number(r.noches || 0), 0)
)

// ── Lifecycle ────────────────────────────────────────────────
onMounted(() => {
  cargarReporte()
  cargarTodasLasReservas()
})

// ── Métodos ──────────────────────────────────────────────────
async function cargarReporte() {
  if (periodoActivo.value === 'personalizado') return  // no hay endpoint para rangos libres
  cargando.value = true
  reporte.value  = null
  try {
    let res
    if (authStore.isAdmin) {
      switch (periodoActivo.value) {
        case 'hoy':    res = await reporteAdminService.ingresosHoy();    break
        case 'semana': res = await reporteAdminService.ingresosSemana(); break
        case 'mes':    res = await reporteAdminService.ingresosMes();    break
        case 'anual':  res = await reporteAdminService.ingresosAnual(anioSeleccionado.value); break
      }
    } else {
      switch (periodoActivo.value) {
        case 'hoy':    res = await reporteOcupacionService.hoy();    break
        case 'semana': res = await reporteOcupacionService.semana(); break
        case 'mes':    res = await reporteOcupacionService.mes();    break
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

async function cargarTodasLasReservas() {
  cargandoReservas.value = true
  try {
    const res = await reservaService.listarTodas()
    todasLasReservas.value = res.data
  } catch (e) {
    console.error('Error cargando reservas:', e)
  } finally {
    cargandoReservas.value = false
  }
}

// Parsea cualquier formato de fecha que devuelva Spring/Jackson
function parsearFecha(valor) {
  if (!valor) return null
  if (Array.isArray(valor)) {
    const [y, m, d, h = 0, min = 0, s = 0] = valor
    return new Date(y, m - 1, d, h, min, s)
  }
  if (typeof valor === 'string') {
    if (valor.length === 10) return new Date(valor + 'T00:00:00')
    return new Date(valor)
  }
  return new Date(valor)
}

function filtrarPorPeriodo(reservas) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  return reservas.filter(r => {
    const fecha = parsearFecha(r.createdAt) ?? parsearFecha(r.fechaEntrada)
    if (!fecha || isNaN(fecha.getTime())) return true

    switch (periodoActivo.value) {
      case 'hoy': {
        const fin = new Date(hoy); fin.setDate(fin.getDate() + 1)
        return fecha >= hoy && fecha < fin
      }
      case 'semana': {
        const lunes = new Date(hoy)
        const diasDesde = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1
        lunes.setDate(hoy.getDate() - diasDesde)
        const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 7)
        return fecha >= lunes && fecha < domingo
      }
      case 'mes': {
        return fecha.getMonth()    === hoy.getMonth() &&
               fecha.getFullYear() === hoy.getFullYear()
      }
      case 'anual': {
        return fecha.getFullYear() === Number(anioSeleccionado.value)
      }
      case 'personalizado': {
        if (!rangoAplicado.value || !rangoDesde.value || !rangoHasta.value) return false
        const desde = new Date(rangoDesde.value + 'T00:00:00')
        const hasta = new Date(rangoHasta.value + 'T23:59:59')
        return fecha >= desde && fecha <= hasta
      }
      default: return true
    }
  })
}

function cambiarPeriodo(key) {
  periodoActivo.value = key
  filtroEstado.value  = ''
  if (key === 'personalizado') {
    // No cargamos reporte, solo esperamos que el usuario configure el rango
    rangoAplicado.value = false
    return
  }
  cargarReporte()
}

function aplicarRango() {
  if (!rangoDesde.value || !rangoHasta.value) return
  rangoAplicado.value = true
  // reservasPeriodo se recalcula automáticamente vía computed
}

function limpiarRango() {
  rangoDesde.value    = ''
  rangoHasta.value    = ''
  rangoAplicado.value = false
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

function formatFechaCorta(dt) {
  if (!dt) return '—'
  const d = parsearFecha(dt)
  if (!d || isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatHora(dt) {
  if (!dt) return ''
  const d = parsearFecha(dt)
  if (!d || isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function labelEstado(estado) {
  const map = {
    pendiente:  'Pendiente',
    confirmada: 'Confirmada',
    en_curso:   'En curso',
    completada: 'Completada',
    cancelada:  'Cancelada'
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
.nav-item.active { background: var(--color-primary); color: #fff; }
.sidebar-footer { padding: 1rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.08); }
.usuario-nombre { color: #fff; font-size: 0.85rem; font-weight: 600; }
.usuario-rol { color: rgba(255,255,255,0.45); font-size: 0.75rem; margin-bottom: 0.75rem; text-transform: capitalize; }
.btn-logout { width: 100%; padding: 0.45rem; background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); border-radius: var(--radius); font-size: 0.8rem; cursor: pointer; transition: background 0.15s; }
.btn-logout:hover { background: rgba(239,68,68,0.25); }

/* Contenido */
.main-content { margin-left: 200px; flex: 1; padding: 2rem; min-height: 100vh; }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.35rem; font-weight: 700; color: var(--color-gray-800); }
.fecha-hoy { font-size: 0.8rem; color: var(--color-gray-400); text-transform: capitalize; }

/* Tabs */
.periodo-tabs { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; }
.tab { padding: 0.45rem 1rem; border-radius: 20px; border: 1px solid var(--color-gray-200); background: #fff; color: var(--color-gray-600); font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.15s; }
.tab:hover { border-color: var(--color-primary); color: var(--color-primary); }
.tab.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
.anio-selector select { padding: 0.45rem 0.85rem; border: 1px solid var(--color-gray-200); border-radius: var(--radius); font-size: 0.875rem; color: var(--color-gray-800); background: #fff; outline: none; }

/* Panel rango personalizado */
.rango-panel {
  background: #fff;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: 1.1rem 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: var(--shadow-sm);
}
.rango-campos {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.rango-campo {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.rango-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-gray-400);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.rango-input {
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius);
  font-size: 0.875rem;
  color: var(--color-gray-800);
  background: var(--color-gray-50);
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}
.rango-input:focus { border-color: var(--color-primary); background: #fff; }
.rango-sep { color: var(--color-gray-400); font-size: 1.1rem; padding-bottom: 0.3rem; }
.btn-aplicar {
  padding: 0.5rem 1.25rem;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-aplicar:hover { background: var(--color-primary-dark); }
.btn-aplicar:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-limpiar {
  padding: 0.5rem 0.9rem;
  background: none;
  border: 1px solid var(--color-gray-200);
  color: var(--color-gray-400);
  border-radius: var(--radius);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-limpiar:hover { border-color: var(--color-danger); color: var(--color-danger); }
.rango-info {
  margin-top: 0.75rem;
  font-size: 0.82rem;
  color: var(--color-gray-600);
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-gray-100);
}
.rango-info.muted { color: var(--color-gray-400); font-style: italic; }
.rango-info strong { color: var(--color-primary); }

/* Estado espera */
.estado-espera {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--color-gray-400);
}
.espera-icono { font-size: 2.5rem; margin-bottom: 0.75rem; }
.estado-espera p { font-size: 0.9rem; }
.estado-espera strong { color: var(--color-primary); }

/* Filtro estado */
.filtro-select {
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius);
  font-size: 0.8rem;
  color: var(--color-gray-600);
  background: var(--color-gray-50);
  outline: none;
  cursor: pointer;
}

.estado-cargando { text-align: center; padding: 3rem; color: var(--color-gray-400); }
.reporte-contenido { display: flex; flex-direction: column; gap: 1.25rem; }

/* Stats grid */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
.stat-card { background: #fff; border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; box-shadow: var(--shadow-sm); border-left: 4px solid; display: flex; flex-direction: column; gap: 0.35rem; }
.stat-card.ingresos      { border-left-color: var(--color-primary); }
.stat-card.transacciones { border-left-color: #8b5cf6; }
.stat-card.ocupadas      { border-left-color: var(--color-danger); }
.stat-card.disponibles   { border-left-color: var(--color-success); }
.stat-card.mantenimiento { border-left-color: var(--color-warning); }
.stat-card.total-habs    { border-left-color: var(--color-gray-400); }
.stat-icono  { font-size: 0.7rem; font-weight: 700; color: var(--color-gray-400); text-transform: uppercase; letter-spacing: 0.05em; }
.stat-numero { font-size: 1.6rem; font-weight: 700; color: var(--color-gray-800); line-height: 1; }
.stat-label  { font-size: 0.78rem; color: var(--color-gray-400); }

/* Barra ocupación */
.ocupacion-card { background: #fff; border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; box-shadow: var(--shadow-sm); }
.ocupacion-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.ocupacion-titulo { font-size: 0.95rem; font-weight: 600; color: var(--color-gray-800); }
.ocupacion-pct { font-size: 1.1rem; font-weight: 700; }
.ocupacion-pct.alta  { color: var(--color-danger); }
.ocupacion-pct.media { color: var(--color-warning); }
.ocupacion-pct.baja  { color: var(--color-success); }
.barra-fondo { height: 10px; background: var(--color-gray-100); border-radius: 10px; overflow: hidden; margin-bottom: 0.75rem; }
.barra-relleno { height: 100%; border-radius: 10px; transition: width 0.5s ease; }
.barra-relleno.alta  { background: var(--color-danger); }
.barra-relleno.media { background: var(--color-warning); }
.barra-relleno.baja  { background: var(--color-success); }
.ocupacion-detalle { display: flex; align-items: center; gap: 0.25rem; font-size: 0.8rem; color: var(--color-gray-400); flex-wrap: wrap; }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
.dot.ocupada      { background: var(--color-danger); }
.dot.disponible   { background: var(--color-success); }
.dot.mantenimiento { background: var(--color-warning); }

/* Split layout */
.split-layout { display: grid; grid-template-columns: 300px 1fr; gap: 1.25rem; align-items: start; }

/* Resumen */
.resumen-card { background: #fff; border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; box-shadow: var(--shadow-sm); }
.card-title { font-size: 0.9rem; font-weight: 600; color: var(--color-gray-800); margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--color-gray-100); }
.resumen-fila { display: flex; justify-content: space-between; align-items: center; padding: 0.55rem 0; border-bottom: 1px solid var(--color-gray-100); }
.resumen-fila:last-child { border-bottom: none; }
.resumen-label { font-size: 0.82rem; color: var(--color-gray-400); }
.resumen-valor { font-size: 0.875rem; font-weight: 500; color: var(--color-gray-800); }
.resumen-valor.destacado { font-size: 1rem; font-weight: 700; color: var(--color-primary); }
.resumen-valor.alta  { color: var(--color-danger); }
.resumen-valor.media { color: var(--color-warning); }
.resumen-valor.baja  { color: var(--color-success); }

/* Reservas card */
.reservas-card { background: #fff; border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; box-shadow: var(--shadow-sm); overflow: hidden; }
.reservas-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--color-gray-100); flex-wrap: wrap; gap: 0.5rem; }
.reservas-card-header .card-title { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
.reservas-count { font-size: 0.75rem; color: var(--color-gray-400); background: var(--color-gray-50); border: 1px solid var(--color-gray-200); border-radius: 20px; padding: 0.2rem 0.65rem; }
.estado-mini { text-align: center; padding: 1.5rem; color: var(--color-gray-400); font-size: 0.875rem; }
.estado-mini.vacio { padding: 2.5rem; }

/* Tabla */
.tabla-wrapper { overflow-x: auto; }
.tabla-reservas { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.tabla-reservas th { text-align: left; color: var(--color-gray-400); font-weight: 500; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--color-gray-100); white-space: nowrap; }
.tabla-reservas td { padding: 0.65rem 0.75rem; border-bottom: 1px solid var(--color-gray-50); color: var(--color-gray-700); vertical-align: top; }
.tabla-reservas tbody tr:last-child td { border-bottom: none; }
.tabla-reservas tbody tr:hover { background: var(--color-gray-50); }
.col-id    { color: var(--color-gray-400) !important; font-size: 0.75rem; white-space: nowrap; }
.col-fecha { white-space: nowrap; }
.hora-txt  { color: var(--color-gray-400); font-size: 0.72rem; margin-top: 2px; }
.num-hab   { color: var(--color-gray-400); font-size: 0.72rem; }
.col-noches { text-align: center; }
.col-total  { font-weight: 600; color: var(--color-gray-800); white-space: nowrap; }

/* Badges */
.badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.72rem; font-weight: 500; white-space: nowrap; }
.badge.pendiente  { background: #fef3c7; color: #92400e; }
.badge.confirmada { background: #dcfce7; color: #166534; }
.badge.en_curso   { background: #dbeafe; color: #1e40af; }
.badge.completada { background: #f0fdf4; color: #15803d; }
.badge.cancelada  { background: #fee2e2; color: #991b1b; }

/* Responsive */
@media (max-width: 1100px) { .split-layout { grid-template-columns: 1fr; } }
@media (max-width: 768px) {
  .sidebar { display: none; }
  .main-content { margin-left: 0; padding: 1rem; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .rango-campos { flex-direction: column; align-items: stretch; }
  .rango-sep { display: none; }
}
</style>