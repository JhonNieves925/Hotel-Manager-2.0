<template>
  <div class="dashboard">

    <!-- SALUDO -->
    <div class="saludo">
      <div class="saludo-texto">
        <span class="saludo-sub">{{ saludo }}</span>
        <span class="saludo-nombre">{{ authStore.nombreUsuario }}</span>
      </div>
      <div class="saludo-fecha">{{ fechaHoy }}</div>
    </div>

    <div v-if="cargando" class="estado-cargando">Cargando...</div>

    <template v-else>

      <!-- TARJETAS MÉTRICAS -->
      <div class="seccion-titulo">Resumen de hoy</div>
      <div class="cards-grid">
        <div class="card card-ingresos">
          <div class="card-label">Ingresos hoy</div>
          <div class="card-valor">${{ formatPrecio(reporte?.total) }}</div>
          <div class="card-sub">{{ reporte?.transacciones || 0 }} pagos</div>
        </div>
        <div class="card card-ocupadas">
          <div class="card-label">Ocupadas</div>
          <div class="card-valor">{{ reporte?.habitacionesOcupadas || 0 }}</div>
          <div class="card-sub">habitaciones</div>
        </div>
        <div class="card card-disponibles">
          <div class="card-label">Disponibles</div>
          <div class="card-valor">{{ reporte?.habitacionesDisponibles || 0 }}</div>
          <div class="card-sub">habitaciones</div>
        </div>
        <div class="card card-mantenimiento">
          <div class="card-label">Mantenimiento</div>
          <div class="card-valor">{{ reporte?.habitacionesMantenimiento || 0 }}</div>
          <div class="card-sub">habitaciones</div>
        </div>
      </div>

      <!-- BARRA OCUPACIÓN -->
      <div class="ocupacion-card">
        <div class="ocupacion-row">
          <span class="ocupacion-label">Ocupación actual</span>
          <span class="ocupacion-pct" :class="colorBarra">{{ pctOcupacion }}%</span>
        </div>
        <div class="barra-fondo">
          <div class="barra-relleno" :class="colorBarra" :style="{ width: pctOcupacion + '%' }"></div>
        </div>
      </div>

      <!-- ── ALERTAS DEL DÍA ── -->
      <div class="seccion-titulo">Alertas del día</div>

      <!-- Check-ins pendientes -->
      <div class="alerta-card" :class="checkinsPendientes.length > 0 ? 'urgente' : 'ok'">
        <div class="alerta-header">
          <div class="alerta-titulo-wrap">
            <span class="alerta-ico checkin">↓</span>
            <span class="alerta-titulo">Check-ins hoy</span>
          </div>
          <span class="alerta-badge" :class="checkinsPendientes.length > 0 ? 'rojo' : 'gris'">
            {{ checkinsPendientes.length }} pendiente{{ checkinsPendientes.length !== 1 ? 's' : '' }}
          </span>
        </div>
        <div v-if="checkinsPendientes.length === 0" class="alerta-vacia">Sin check-ins pendientes</div>
        <div v-else class="alerta-lista">
          <div v-for="r in checkinsPendientes" :key="r.id" class="alerta-item">
            <div class="alerta-info">
              <span class="alerta-nombre">{{ r.nombreHuesped }} {{ r.apellidoHuesped }}</span>
              <span class="alerta-sub">{{ r.tipoHabitacion }} — Hab. {{ r.numeroHabitacion }}</span>
            </div>
            <button class="btn-accion verde" @click="cambiarEstado(r.id, 'en_curso')">Check-in</button>
          </div>
        </div>
      </div>

      <!-- Check-outs pendientes -->
      <div class="alerta-card" :class="checkoutsPendientes.length > 0 ? 'urgente' : 'ok'">
        <div class="alerta-header">
          <div class="alerta-titulo-wrap">
            <span class="alerta-ico checkout">↑</span>
            <span class="alerta-titulo">Check-outs hoy</span>
          </div>
          <span class="alerta-badge" :class="checkoutsPendientes.length > 0 ? 'rojo' : 'gris'">
            {{ checkoutsPendientes.length }} pendiente{{ checkoutsPendientes.length !== 1 ? 's' : '' }}
          </span>
        </div>
        <div v-if="checkoutsPendientes.length === 0" class="alerta-vacia">Sin check-outs pendientes</div>
        <div v-else class="alerta-lista">
          <div v-for="r in checkoutsPendientes" :key="r.id" class="alerta-item">
            <div class="alerta-info">
              <span class="alerta-nombre">{{ r.nombreHuesped }} {{ r.apellidoHuesped }}</span>
              <span class="alerta-sub">{{ r.tipoHabitacion }} — Hab. {{ r.numeroHabitacion }}</span>
            </div>
            <button class="btn-accion azul" @click="cambiarEstado(r.id, 'completada')">Check-out</button>
          </div>
        </div>
      </div>

      <!-- Sin confirmar -->
      <div class="alerta-card" :class="reservasSinConfirmar.length > 0 ? 'urgente' : 'ok'">
        <div class="alerta-header">
          <div class="alerta-titulo-wrap">
            <span class="alerta-ico pendiente">!</span>
            <span class="alerta-titulo">Sin confirmar</span>
          </div>
          <span class="alerta-badge" :class="reservasSinConfirmar.length > 0 ? 'rojo' : 'gris'">
            {{ reservasSinConfirmar.length }} reserva{{ reservasSinConfirmar.length !== 1 ? 's' : '' }}
          </span>
        </div>
        <div v-if="reservasSinConfirmar.length === 0" class="alerta-vacia">No hay reservas pendientes</div>
        <div v-else class="alerta-lista">
          <div v-for="r in reservasSinConfirmar" :key="r.id" class="alerta-item">
            <div class="alerta-info">
              <span class="alerta-nombre">{{ r.nombreHuesped }} {{ r.apellidoHuesped }}</span>
              <span class="alerta-sub">Check-in: {{ formatFechaCorta(r.fechaEntrada) }}</span>
            </div>
            <button class="btn-accion amarillo" @click="cambiarEstado(r.id, 'confirmada')">Confirmar</button>
          </div>
        </div>
      </div>

      <!-- RESERVAS ACTIVAS HOY -->
      <div class="seccion-titulo">Reservas activas hoy</div>
      <div v-if="reservasHoy.length === 0" class="estado-vacio">No hay reservas activas hoy</div>
      <div v-else class="reservas-lista">
        <div v-for="r in reservasHoy" :key="r.id" class="reserva-item">
          <div class="reserva-header-row">
            <div class="reserva-id">#{{ r.id }}</div>
            <span :class="['badge', r.estadoReserva]">{{ labelEstado(r.estadoReserva) }}</span>
          </div>
          <div class="reserva-nombre">{{ r.nombreHuesped }} {{ r.apellidoHuesped }}</div>
          <div class="reserva-hab">{{ r.tipoHabitacion }} — Hab. {{ r.numeroHabitacion }}</div>
          <div class="reserva-fechas">
            <span>{{ formatFechaCorta(r.fechaEntrada) }}</span>
            <span class="flecha">→</span>
            <span>{{ formatFechaCorta(r.fechaSalida) }}</span>
          </div>
          <div class="reserva-acciones" v-if="r.estadoReserva !== 'completada' && r.estadoReserva !== 'cancelada'">
            <button class="btn-accion verde" @click="cambiarEstado(r.id, 'en_curso')"   v-if="r.estadoReserva === 'confirmada'">Check-in</button>
            <button class="btn-accion azul"  @click="cambiarEstado(r.id, 'completada')" v-if="r.estadoReserva === 'en_curso'">Check-out</button>
            <button class="btn-accion amarillo" @click="cambiarEstado(r.id, 'confirmada')" v-if="r.estadoReserva === 'pendiente'">Confirmar</button>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { reporteAdminService, reservaService } from '../api/services'

const authStore = useAuthStore()
const reporte      = ref(null)
const reservasHoy  = ref([])
const todasReservas = ref([])
const cargando     = ref(true)

const fechaHoy = computed(() =>
  new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
)
const saludo = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días,'
  if (h < 18) return 'Buenas tardes,'
  return 'Buenas noches,'
})
const pctOcupacion = computed(() => {
  if (!reporte.value) return 0
  const total = (reporte.value.habitacionesOcupadas || 0) +
                (reporte.value.habitacionesDisponibles || 0) +
                (reporte.value.habitacionesMantenimiento || 0)
  return total > 0 ? Math.round((reporte.value.habitacionesOcupadas / total) * 100) : 0
})
const colorBarra = computed(() => {
  if (pctOcupacion.value >= 80) return 'alta'
  if (pctOcupacion.value >= 50) return 'media'
  return 'baja'
})

function parsearFecha(valor) {
  if (!valor) return null
  if (Array.isArray(valor)) { const [y,m,d]=valor; return new Date(y,m-1,d) }
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
  return d.getDate()===hoy.getDate() && d.getMonth()===hoy.getMonth() && d.getFullYear()===hoy.getFullYear()
}

const checkinsPendientes   = computed(() => todasReservas.value.filter(r => r.estadoReserva==='confirmada' && esFechaHoy(r.fechaEntrada)))
const checkoutsPendientes  = computed(() => todasReservas.value.filter(r => r.estadoReserva==='en_curso'   && esFechaHoy(r.fechaSalida)))
const reservasSinConfirmar = computed(() => todasReservas.value.filter(r => r.estadoReserva==='pendiente'))

onMounted(async () => {
  try {
    const [resReporte, resHoy, resTodas] = await Promise.all([
      reporteAdminService.ingresosHoy(),
      reservaService.reservasDeHoy(),
      reservaService.listarTodas()
    ])
    reporte.value       = resReporte.data
    reservasHoy.value   = resHoy.data
    todasReservas.value = resTodas.data
  } catch (e) { console.error(e) }
  finally { cargando.value = false }
})

async function cambiarEstado(id, nuevoEstado) {
  try {
    await reservaService.cambiarEstado(id, nuevoEstado)
    const [resHoy, resTodas] = await Promise.all([
      reservaService.reservasDeHoy(),
      reservaService.listarTodas()
    ])
    reservasHoy.value   = resHoy.data
    todasReservas.value = resTodas.data
  } catch { alert('Error al cambiar estado') }
}

function formatPrecio(v) {
  return Number(v || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
function formatFechaCorta(valor) {
  if (!valor) return '—'
  const d = parsearFecha(valor)
  if (!d || isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function labelEstado(e) {
  return { pendiente:'Pendiente', confirmada:'Confirmada', en_curso:'En curso', completada:'Completada', cancelada:'Cancelada' }[e] || e
}
</script>

<style scoped>
.dashboard { padding: 1rem 1rem 0; }

.saludo { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; }
.saludo-texto { display: flex; flex-direction: column; gap: 0.1rem; }
.saludo-sub { font-size: 0.8rem; color: var(--text-muted); }
.saludo-nombre { font-size: 1.1rem; font-weight: 700; color: var(--text); }
.saludo-fecha { font-size: 0.72rem; color: var(--text-light); text-align: right; max-width: 110px; }

.seccion-titulo { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.07em; margin: 1.1rem 0 0.65rem; }

.estado-cargando { text-align: center; padding: 2rem; color: var(--text-light); }
.estado-vacio { text-align: center; padding: 1.5rem; color: var(--text-light); font-size: 0.875rem; background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow); margin-bottom: 0.75rem; }

/* Cards métricas */
.cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-bottom: 0.75rem; }
.card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 0.9rem 1rem; box-shadow: var(--shadow); border-left: 3px solid; }
.card-ingresos    { border-left-color: var(--primary); }
.card-ocupadas    { border-left-color: var(--danger); }
.card-disponibles { border-left-color: var(--success); }
.card-mantenimiento { border-left-color: var(--warning); }
.card-label { font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.3rem; }
.card-valor { font-size: 1.4rem; font-weight: 800; color: var(--text); line-height: 1; }
.card-sub { font-size: 0.68rem; color: var(--text-light); margin-top: 0.2rem; }

/* Barra ocupación */
.ocupacion-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 1rem 1.1rem; box-shadow: var(--shadow); margin-bottom: 0.25rem; }
.ocupacion-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; }
.ocupacion-label { font-size: 0.875rem; font-weight: 500; color: var(--text); }
.ocupacion-pct { font-size: 1rem; font-weight: 800; }
.ocupacion-pct.alta  { color: var(--danger); }
.ocupacion-pct.media { color: var(--warning); }
.ocupacion-pct.baja  { color: var(--success); }
.barra-fondo { height: 8px; background: rgba(255,255,255,0.08); border-radius: 8px; overflow: hidden; }
.barra-relleno { height: 100%; border-radius: 8px; transition: width 0.5s ease; }
.barra-relleno.alta  { background: var(--danger); }
.barra-relleno.media { background: var(--warning); }
.barra-relleno.baja  { background: var(--success); }

/* Alertas */
.alerta-card { background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow); margin-bottom: 0.65rem; overflow: hidden; border-left: 3px solid; }
.alerta-card.urgente { border-left-color: var(--danger); }
.alerta-card.ok { border-left-color: rgba(255,255,255,0.1); }
.alerta-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.alerta-titulo-wrap { display: flex; align-items: center; gap: 0.5rem; }
.alerta-ico { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; flex-shrink: 0; }
.alerta-ico.checkin  { background: rgba(22,163,74,0.2); color: #4ade80; }
.alerta-ico.checkout { background: rgba(37,99,235,0.2); color: #60a5fa; }
.alerta-ico.pendiente{ background: rgba(217,119,6,0.2);  color: #fbbf24; }
.alerta-titulo { font-size: 0.85rem; font-weight: 600; color: var(--text); }
.alerta-badge { font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
.alerta-badge.rojo  { background: rgba(220,38,38,0.2); color: #fca5a5; }
.alerta-badge.gris  { background: rgba(255,255,255,0.08); color: var(--text-muted); }
.alerta-vacia { padding: 0.75rem 1rem; font-size: 0.78rem; color: var(--text-light); }
.alerta-lista { display: flex; flex-direction: column; max-height: 180px; overflow-y: auto; }
.alerta-item { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04); gap: 0.5rem; }
.alerta-item:last-child { border-bottom: none; }
.alerta-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.alerta-nombre { font-size: 0.82rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.alerta-sub { font-size: 0.7rem; color: var(--text-muted); }

/* Botones de acción */
.btn-accion { padding: 0.3rem 0.75rem; border: none; border-radius: 6px; font-size: 0.72rem; font-weight: 700; cursor: pointer; flex-shrink: 0; white-space: nowrap; }
.btn-accion.verde   { background: rgba(22,163,74,0.2); color: #4ade80; }
.btn-accion.azul    { background: rgba(37,99,235,0.2); color: #60a5fa; }
.btn-accion.amarillo{ background: rgba(217,119,6,0.2);  color: #fbbf24; }

/* Reservas lista */
.reservas-lista { display: flex; flex-direction: column; gap: 0.6rem; padding-bottom: 1rem; }
.reserva-item { background: var(--bg-card); border-radius: var(--radius-lg); padding: 0.9rem 1rem; box-shadow: var(--shadow); }
.reserva-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; }
.reserva-id { font-size: 0.72rem; color: var(--text-muted); }
.reserva-nombre { font-size: 0.9rem; font-weight: 600; color: var(--text); margin-bottom: 0.2rem; }
.reserva-hab { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.35rem; }
.reserva-fechas { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--text-light); margin-bottom: 0.6rem; }
.flecha { color: var(--text-muted); }
.reserva-acciones { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.68rem; font-weight: 600; white-space: nowrap; }
.badge.pendiente  { background: rgba(217,119,6,0.2); color: #fbbf24; }
.badge.confirmada { background: rgba(37,99,235,0.2); color: #60a5fa; }
.badge.en_curso   { background: rgba(22,163,74,0.2); color: #4ade80; }
.badge.completada { background: rgba(255,255,255,0.1); color: var(--text-muted); }
.badge.cancelada  { background: rgba(220,38,38,0.2); color: #fca5a5; }
</style>