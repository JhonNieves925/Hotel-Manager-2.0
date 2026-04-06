<template>
  <div class="reportes">

    <!-- TABS DE PERÍODO -->
    <div class="periodo-tabs">
      <button v-for="p in periodos" :key="p.key"
        :class="['tab', { active: periodoActivo === p.key }]"
        @click="cambiarPeriodo(p.key)"
      >{{ p.label }}</button>
    </div>

    <!-- Selector año -->
    <div v-if="periodoActivo === 'anual'" class="anio-row">
      <select v-model="anioSeleccionado" @change="cargarReporte">
        <option v-for="a in aniosDisponibles" :key="a" :value="a">{{ a }}</option>
      </select>
    </div>

    <!-- Panel rango personalizado -->
    <div v-if="periodoActivo === 'personalizado'" class="rango-panel">
      <div class="rango-row">
        <div class="form-group-inline">
          <label>Desde</label>
          <input type="date" v-model="rangoDesde" :max="rangoHasta || hoyISO" />
        </div>
        <div class="form-group-inline">
          <label>Hasta</label>
          <input type="date" v-model="rangoHasta" :min="rangoDesde" :max="hoyISO" />
        </div>
      </div>
      <button class="btn-aplicar" @click="aplicarRango" :disabled="!rangoDesde || !rangoHasta">Aplicar</button>
      <button v-if="rangoAplicado" class="btn-limpiar" @click="limpiarRango">✕ Limpiar</button>
      <p v-if="rangoAplicado" class="rango-info">{{ reservasPeriodo.length }} resultado(s)</p>
      <p v-else class="rango-info muted">Selecciona fechas y presiona Aplicar</p>
    </div>

    <div v-if="cargando" class="estado-cargando">Cargando reporte...</div>

    <div v-else-if="periodoActivo === 'personalizado' && !rangoAplicado" class="estado-cargando">
      Selecciona un rango de fechas
    </div>

    <div v-else-if="reporte || periodoActivo === 'personalizado'" class="reporte-contenido">

      <!-- INGRESO PRINCIPAL (admin, no personalizado) -->
      <div v-if="authStore.isAdmin && periodoActivo !== 'personalizado'" class="card-ingreso-principal">
        <div class="ingreso-label">Total ingresos — {{ labelPeriodo }}</div>
        <div class="ingreso-monto">${{ formatPrecio(reporte.total) }}</div>
        <div class="ingreso-pagos">{{ reporte.transacciones }} pagos procesados</div>
      </div>

      <!-- CARDS SECUNDARIAS (no personalizado) -->
      <template v-if="periodoActivo !== 'personalizado'">
        <div class="cards-grid">
          <div class="card-mini ocupadas">
            <div class="mini-valor">{{ reporte.habitacionesOcupadas }}</div>
            <div class="mini-label">Ocupadas</div>
          </div>
          <div class="card-mini disponibles">
            <div class="mini-valor">{{ reporte.habitacionesDisponibles }}</div>
            <div class="mini-label">Disponibles</div>
          </div>
          <div class="card-mini mantenimiento">
            <div class="mini-valor">{{ reporte.habitacionesMantenimiento }}</div>
            <div class="mini-label">Mantenimiento</div>
          </div>
          <div class="card-mini promedio" v-if="authStore.isAdmin">
            <div class="mini-valor">
              ${{ reporte.transacciones > 0 ? formatPrecio(reporte.total / reporte.transacciones) : '0' }}
            </div>
            <div class="mini-label">Promedio/pago</div>
          </div>
        </div>

        <!-- BARRA OCUPACIÓN -->
        <div class="ocupacion-card">
          <div class="ocupacion-row">
            <span class="ocupacion-label">Ocupación</span>
            <span class="ocupacion-pct" :class="colorBarra">{{ pctOcupacion }}%</span>
          </div>
          <div class="barra-fondo">
            <div class="barra-relleno" :class="colorBarra" :style="{ width: pctOcupacion + '%' }"></div>
          </div>
          <div class="ocupacion-leyenda">
            <span><i class="dot rojo"></i> {{ reporte.habitacionesOcupadas }} ocupadas</span>
            <span><i class="dot verde"></i> {{ reporte.habitacionesDisponibles }} libres</span>
            <span><i class="dot amarillo"></i> {{ reporte.habitacionesMantenimiento }} mant.</span>
          </div>
        </div>
      </template>

      <!-- GRÁFICA (semana, mes, anual, personalizado con datos) -->
      <div class="grafica-card" v-if="periodoActivo !== 'hoy' && datosGrafica.labels.length > 1">
        <div class="grafica-header">
          <span class="grafica-titulo">Tendencia de reservas</span>
          <div class="grafica-leyenda">
            <span class="leyenda-dot azul"></span><span class="leyenda-txt">Reservas</span>
            <span v-if="authStore.isAdmin" class="leyenda-dot verde"></span>
            <span v-if="authStore.isAdmin" class="leyenda-txt">Ingresos</span>
          </div>
        </div>
        <div class="grafica-wrap">
          <canvas ref="canvasGrafica" height="130"></canvas>
        </div>
      </div>

      <!-- RESUMEN + LISTA RESERVAS -->
      <div class="resumen-card">
        <div class="resumen-titulo">{{ periodoActivo === 'personalizado' ? 'Resumen del rango' : 'Resumen — ' + labelPeriodo }}</div>

        <template v-if="authStore.isAdmin && periodoActivo !== 'personalizado'">
          <div class="resumen-fila">
            <span>Total ingresos</span>
            <span class="destacado">${{ formatPrecio(reporte.total) }}</span>
          </div>
          <div class="resumen-fila">
            <span>Pagos procesados</span>
            <span>{{ reporte.transacciones }}</span>
          </div>
        </template>

        <div class="resumen-fila">
          <span>Reservas del período</span>
          <span class="destacado">{{ reservasPeriodo.length }}</span>
        </div>
        <div v-if="authStore.isAdmin" class="resumen-fila">
          <span>Ingresos del período</span>
          <span class="destacado">${{ formatPrecio(totalIngresos) }}</span>
        </div>
        <div class="resumen-fila">
          <span>Noches vendidas</span>
          <span>{{ totalNoches }}</span>
        </div>
        <template v-if="periodoActivo !== 'personalizado'">
          <div class="resumen-fila">
            <span>% Ocupación</span>
            <span :class="['pct', colorBarra]">{{ pctOcupacion }}%</span>
          </div>
        </template>
      </div>

      <!-- LISTA RESERVAS DEL PERÍODO -->
      <div class="seccion-titulo">Reservas del período</div>

      <!-- Filtro estado -->
      <div class="filtros">
        <button v-for="f in filtrosEstado" :key="f.key"
          :class="['filtro-btn', { active: filtroEstado === f.key }]"
          @click="filtroEstado = f.key"
        >{{ f.label }}</button>
      </div>

      <div v-if="cargandoReservas" class="estado-cargando">Cargando...</div>
      <div v-else-if="reservasPeriodo.length === 0" class="estado-vacio">No hay reservas en este período</div>
      <div v-else class="reservas-lista">
        <div v-for="r in reservasPeriodo" :key="r.id" class="reserva-item">
          <div class="reserva-header-row">
            <div class="reserva-id">#{{ r.id }} · {{ formatFechaCorta(r.createdAt) }}</div>
            <span :class="['badge', r.estadoReserva]">{{ labelEstado(r.estadoReserva) }}</span>
          </div>
          <div class="reserva-nombre">{{ r.nombreHuesped }} {{ r.apellidoHuesped }}</div>
          <div class="reserva-hab">{{ r.tipoHabitacion }} — Hab. {{ r.numeroHabitacion }}</div>
          <div class="reserva-footer">
            <span class="reserva-fechas">{{ formatFechaCorta(r.fechaEntrada) }} → {{ formatFechaCorta(r.fechaSalida) }}</span>
            <span v-if="authStore.isAdmin" class="reserva-total">${{ formatPrecio(r.valorTotal) }}</span>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import { reporteAdminService, reservaService } from '../api/services'

const authStore = useAuthStore()

const periodos = [
  { key: 'hoy',          label: 'Hoy' },
  { key: 'semana',       label: 'Semana' },
  { key: 'mes',          label: 'Mes' },
  { key: 'anual',        label: 'Anual' },
  { key: 'personalizado', label: '📅' }
]

const filtrosEstado = [
  { key: '', label: 'Todas' },
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'confirmada', label: 'Confirmada' },
  { key: 'completada', label: 'Completada' },
  { key: 'cancelada', label: 'Cancelada' }
]

const periodoActivo    = ref('hoy')
const anioSeleccionado = ref(new Date().getFullYear())
const reporte          = ref(null)
const todasLasReservas = ref([])
const cargando         = ref(false)
const cargandoReservas = ref(false)
const filtroEstado     = ref('')
const rangoDesde       = ref('')
const rangoHasta       = ref('')
const rangoAplicado    = ref(false)
const canvasGrafica    = ref(null)
let   chartInstance    = null

const hoyISO = computed(() => new Date().toISOString().slice(0, 10))
const aniosDisponibles = computed(() => { const y=new Date().getFullYear(); return [y,y-1,y-2,y-3,y-4] })

const labelPeriodo = computed(() => ({
  hoy: 'Hoy', semana: 'Semana', mes: 'Mes',
  anual: 'Año ' + anioSeleccionado.value,
  personalizado: rangoAplicado.value ? rangoDesde.value + ' al ' + rangoHasta.value : 'Rango'
})[periodoActivo.value])

const pctOcupacion = computed(() => {
  if (!reporte.value) return 0
  const total = (reporte.value.habitacionesOcupadas||0) + (reporte.value.habitacionesDisponibles||0) + (reporte.value.habitacionesMantenimiento||0)
  return total > 0 ? Math.round((reporte.value.habitacionesOcupadas/total)*100) : 0
})
const colorBarra = computed(() => pctOcupacion.value >= 80 ? 'alta' : pctOcupacion.value >= 50 ? 'media' : 'baja')

const reservasPeriodo = computed(() => {
  const f = filtrarPorPeriodo(todasLasReservas.value)
  if (!filtroEstado.value) return f
  return f.filter(r => r.estadoReserva === filtroEstado.value)
})
const totalIngresos = computed(() => reservasPeriodo.value.reduce((s,r) => s + Number(r.valorTotal||0), 0))
const totalNoches   = computed(() => reservasPeriodo.value.reduce((s,r) => s + Number(r.noches||0), 0))

const datosGrafica = computed(() => {
  const reservas = filtrarPorPeriodo(todasLasReservas.value)
  if (!reservas.length) return { labels: [], reservasData: [], ingresosData: [] }
  const agrupado = {}
  reservas.forEach(r => {
    const fecha = parsearFecha(r.createdAt || r.fechaEntrada)
    if (!fecha || isNaN(fecha.getTime())) return
    let clave = ''
    if (periodoActivo.value === 'semana') clave = fecha.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit' })
    else if (periodoActivo.value === 'mes') clave = fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
    else if (periodoActivo.value === 'anual') clave = fecha.toLocaleDateString('es-CO', { month: 'short' })
    else if (periodoActivo.value === 'personalizado' && rangoAplicado.value) clave = fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
    if (!clave) return
    if (!agrupado[clave]) agrupado[clave] = { count: 0, ingresos: 0 }
    agrupado[clave].count++
    agrupado[clave].ingresos += Number(r.valorTotal || 0)
  })
  const labels = Object.keys(agrupado)
  return { labels, reservasData: labels.map(k => agrupado[k].count), ingresosData: labels.map(k => agrupado[k].ingresos) }
})

onMounted(() => { cargarReporte(); cargarTodasLasReservas() })
watch(datosGrafica, () => nextTick(dibujarGrafica))

async function cargarReporte() {
  if (periodoActivo.value === 'personalizado') return
  cargando.value = true; reporte.value = null
  try {
    let res
    switch (periodoActivo.value) {
      case 'hoy':    res = await reporteAdminService.ingresosHoy();    break
      case 'semana': res = await reporteAdminService.ingresosSemana(); break
      case 'mes':    res = await reporteAdminService.ingresosMes();    break
      case 'anual':  res = await reporteAdminService.ingresosAnual(anioSeleccionado.value); break
    }
    reporte.value = res.data
  } catch (e) { console.error(e) }
  finally { cargando.value = false }
}

async function cargarTodasLasReservas() {
  cargandoReservas.value = true
  try { const res = await reservaService.listarTodas(); todasLasReservas.value = res.data }
  catch (e) { console.error(e) }
  finally { cargandoReservas.value = false }
}

function parsearFecha(valor) {
  if (!valor) return null
  if (Array.isArray(valor)) { const [y,m,d,h=0,min=0,s=0]=valor; return new Date(y,m-1,d,h,min,s) }
  if (typeof valor === 'string') { if (valor.length===10) return new Date(valor+'T00:00:00'); return new Date(valor) }
  return new Date(valor)
}

function filtrarPorPeriodo(reservas) {
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  return reservas.filter(r => {
    const fecha = parsearFecha(r.createdAt) ?? parsearFecha(r.fechaEntrada)
    if (!fecha || isNaN(fecha.getTime())) return true
    switch (periodoActivo.value) {
      case 'hoy': { const fin=new Date(hoy); fin.setDate(fin.getDate()+1); return fecha>=hoy && fecha<fin }
      case 'semana': { const l=new Date(hoy); l.setDate(hoy.getDate()-(hoy.getDay()===0?6:hoy.getDay()-1)); const d=new Date(l); d.setDate(l.getDate()+7); return fecha>=l && fecha<d }
      case 'mes': return fecha.getMonth()===hoy.getMonth() && fecha.getFullYear()===hoy.getFullYear()
      case 'anual': return fecha.getFullYear()===Number(anioSeleccionado.value)
      case 'personalizado': if (!rangoAplicado.value||!rangoDesde.value||!rangoHasta.value) return false; return fecha>=new Date(rangoDesde.value+'T00:00:00') && fecha<=new Date(rangoHasta.value+'T23:59:59')
      default: return true
    }
  })
}

function cambiarPeriodo(key) {
  periodoActivo.value = key; filtroEstado.value = ''
  if (key === 'personalizado') { rangoAplicado.value = false; return }
  cargarReporte()
}
function aplicarRango() { if (!rangoDesde.value || !rangoHasta.value) return; rangoAplicado.value = true }
function limpiarRango() { rangoDesde.value=''; rangoHasta.value=''; rangoAplicado.value=false }

async function cargarChartJS() {
  if (window.Chart) return
  await new Promise((res,rej) => { const s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'; s.onload=res; s.onerror=rej; document.head.appendChild(s) })
}

async function dibujarGrafica() {
  const { labels, reservasData, ingresosData } = datosGrafica.value
  if (!labels.length || !canvasGrafica.value) return
  await cargarChartJS()
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }
  const datasets = [{
    label: 'Reservas', data: reservasData,
    backgroundColor: 'rgba(37,99,235,0.2)', borderColor: '#3b82f6',
    borderWidth: 2, borderRadius: 3, tension: 0.3, fill: true, yAxisID: 'yR'
  }]
  if (authStore.isAdmin) datasets.push({
    label: 'Ingresos', data: ingresosData, type: 'line',
    borderColor: '#4ade80', borderWidth: 2, tension: 0.3, fill: false, yAxisID: 'yI', pointRadius: 3
  })
  const scales = {
    x: { grid:{display:false}, ticks:{font:{size:9},color:'#64748b',maxRotation:45} },
    yR: { type:'linear',position:'left',beginAtZero:true, ticks:{font:{size:9},color:'#3b82f6',stepSize:1,callback:v=>Number.isInteger(v)?v:''}, grid:{color:'rgba(255,255,255,0.05)'} }
  }
  if (authStore.isAdmin) scales.yI = { type:'linear',position:'right',beginAtZero:true, ticks:{font:{size:9},color:'#4ade80',callback:v=>'$'+Number(v).toLocaleString('es-CO',{maximumFractionDigits:0})}, grid:{display:false} }
  chartInstance = new window.Chart(canvasGrafica.value, {
    type: 'bar', data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend:{display:false}, tooltip:{callbacks:{label:ctx=>ctx.dataset.label==='Ingresos'?'$'+Number(ctx.raw).toLocaleString('es-CO',{maximumFractionDigits:0}):'Reservas: '+ctx.raw}} },
      scales
    }
  })
}

function formatPrecio(v) { return Number(v||0).toLocaleString('es-CO',{minimumFractionDigits:0,maximumFractionDigits:0}) }
function formatFechaCorta(valor) {
  if (!valor) return '—'
  const d = parsearFecha(valor)
  if (!d||isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-CO',{day:'2-digit',month:'2-digit',year:'numeric'})
}
function labelEstado(e) { return {pendiente:'Pendiente',confirmada:'Confirmada',en_curso:'En curso',completada:'Completada',cancelada:'Cancelada'}[e]||e }
</script>

<style scoped>
.reportes { padding: 1rem 1rem 0; }

.periodo-tabs { display: flex; gap: 0.4rem; overflow-x: auto; padding-bottom: 0.5rem; margin-bottom: 0.5rem; scrollbar-width: none; }
.periodo-tabs::-webkit-scrollbar { display: none; }
.tab { flex-shrink: 0; padding: 0.4rem 0.9rem; border-radius: 20px; border: 1.5px solid var(--border); background: var(--bg-card); color: var(--text-muted); font-size: 0.78rem; font-weight: 500; cursor: pointer; white-space: nowrap; }
.tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }

.anio-row { margin-bottom: 0.75rem; }
.anio-row select { padding: 0.4rem 0.8rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.85rem; color: var(--text); outline: none; }

/* Rango personalizado */
.rango-panel { background: var(--bg-card); border-radius: var(--radius-lg); padding: 0.9rem 1rem; margin-bottom: 0.75rem; box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 0.6rem; }
.rango-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
.form-group-inline { display: flex; flex-direction: column; gap: 0.2rem; }
.form-group-inline label { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
.form-group-inline input { padding: 0.4rem 0.6rem; background: rgba(255,255,255,0.06); border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.82rem; color: var(--text); outline: none; }
.btn-aplicar { padding: 0.5rem 1rem; background: var(--primary); color: #fff; border: none; border-radius: var(--radius); font-size: 0.82rem; font-weight: 700; cursor: pointer; }
.btn-limpiar { padding: 0.45rem 0.85rem; background: none; border: 1px solid var(--border); color: var(--text-muted); border-radius: var(--radius); font-size: 0.78rem; cursor: pointer; }
.rango-info { font-size: 0.75rem; color: var(--text-muted); }
.rango-info.muted { font-style: italic; }

.estado-cargando { text-align: center; padding: 2rem; color: var(--text-light); }
.estado-vacio { text-align: center; padding: 1.5rem; color: var(--text-light); font-size: 0.875rem; background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow); margin-bottom: 0.65rem; }
.reporte-contenido { display: flex; flex-direction: column; gap: 0.75rem; padding-bottom: 1rem; }

.card-ingreso-principal { background: var(--primary); border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; color: #fff; }
.ingreso-label { font-size: 0.75rem; opacity: 0.8; margin-bottom: 0.3rem; }
.ingreso-monto { font-size: 2rem; font-weight: 800; line-height: 1; margin-bottom: 0.3rem; }
.ingreso-pagos { font-size: 0.75rem; opacity: 0.7; }

.cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
.card-mini { background: var(--bg-card); border-radius: var(--radius); padding: 0.85rem 1rem; box-shadow: var(--shadow); border-left: 3px solid; }
.card-mini.ocupadas     { border-left-color: var(--danger); }
.card-mini.disponibles  { border-left-color: var(--success); }
.card-mini.mantenimiento{ border-left-color: var(--warning); }
.card-mini.promedio     { border-left-color: var(--purple, #8b5cf6); }
.mini-valor { font-size: 1.3rem; font-weight: 800; color: var(--text); line-height: 1; margin-bottom: 0.2rem; }
.mini-label { font-size: 0.68rem; color: var(--text-light); font-weight: 500; }

.ocupacion-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 1rem 1.1rem; box-shadow: var(--shadow); }
.ocupacion-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; }
.ocupacion-label { font-size: 0.875rem; font-weight: 500; color: var(--text); }
.ocupacion-pct { font-size: 1rem; font-weight: 800; }
.ocupacion-pct.alta  { color: var(--danger); }
.ocupacion-pct.media { color: var(--warning); }
.ocupacion-pct.baja  { color: var(--success); }
.barra-fondo { height: 8px; background: rgba(255,255,255,0.08); border-radius: 8px; overflow: hidden; margin-bottom: 0.6rem; }
.barra-relleno { height: 100%; border-radius: 8px; transition: width 0.5s; }
.barra-relleno.alta  { background: var(--danger); }
.barra-relleno.media { background: var(--warning); }
.barra-relleno.baja  { background: var(--success); }
.ocupacion-leyenda { display: flex; gap: 0.75rem; font-size: 0.72rem; color: var(--text-light); flex-wrap: wrap; }
.dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 3px; font-style: normal; }
.dot.rojo    { background: var(--danger); }
.dot.verde   { background: var(--success); }
.dot.amarillo{ background: var(--warning); }

/* Gráfica */
.grafica-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 0.9rem 1rem; box-shadow: var(--shadow); }
.grafica-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.grafica-titulo { font-size: 0.85rem; font-weight: 600; color: var(--text); }
.grafica-leyenda { display: flex; align-items: center; gap: 0.35rem; }
.leyenda-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.leyenda-dot.azul  { background: #3b82f6; }
.leyenda-dot.verde { background: #4ade80; }
.leyenda-txt { font-size: 0.68rem; color: var(--text-muted); margin-right: 0.3rem; }
.grafica-wrap { position: relative; height: 160px; }

/* Resumen */
.resumen-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 1rem 1.1rem; box-shadow: var(--shadow); }
.resumen-titulo { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.75rem; padding-bottom: 0.6rem; border-bottom: 1px solid var(--border); }
.resumen-fila { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 0.85rem; }
.resumen-fila:last-child { border-bottom: none; }
.resumen-fila span:first-child { color: var(--text-muted); }
.resumen-fila span:last-child { font-weight: 500; color: var(--text); }
.destacado { color: var(--primary) !important; font-weight: 800 !important; }
.pct.alta  { color: var(--danger) !important; }
.pct.media { color: var(--warning) !important; }
.pct.baja  { color: var(--success) !important; }

/* Lista reservas */
.seccion-titulo { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.07em; margin: 0.5rem 0 0.4rem; }
.filtros { display: flex; gap: 0.4rem; overflow-x: auto; padding-bottom: 0.4rem; margin-bottom: 0.5rem; scrollbar-width: none; }
.filtros::-webkit-scrollbar { display: none; }
.filtro-btn { flex-shrink: 0; padding: 0.3rem 0.75rem; border-radius: 20px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-muted); font-size: 0.72rem; font-weight: 500; cursor: pointer; white-space: nowrap; }
.filtro-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.reservas-lista { display: flex; flex-direction: column; gap: 0.5rem; padding-bottom: 1rem; }
.reserva-item { background: var(--bg-card); border-radius: var(--radius); padding: 0.75rem 1rem; box-shadow: var(--shadow); }
.reserva-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; }
.reserva-id { font-size: 0.68rem; color: var(--text-muted); }
.reserva-nombre { font-size: 0.875rem; font-weight: 600; color: var(--text); margin-bottom: 0.15rem; }
.reserva-hab { font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.35rem; }
.reserva-footer { display: flex; justify-content: space-between; align-items: center; }
.reserva-fechas { font-size: 0.72rem; color: var(--text-light); }
.reserva-total { font-size: 0.875rem; font-weight: 700; color: var(--primary); }
.badge { display: inline-block; padding: 0.15rem 0.55rem; border-radius: 20px; font-size: 0.65rem; font-weight: 600; white-space: nowrap; }
.badge.pendiente  { background: rgba(217,119,6,0.2); color: #fbbf24; }
.badge.confirmada { background: rgba(37,99,235,0.2); color: #60a5fa; }
.badge.en_curso   { background: rgba(22,163,74,0.2); color: #4ade80; }
.badge.completada { background: rgba(255,255,255,0.1); color: var(--text-muted); }
.badge.cancelada  { background: rgba(220,38,38,0.2); color: #fca5a5; }
</style>