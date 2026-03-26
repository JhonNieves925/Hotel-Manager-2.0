<template>
  <div class="reportes">

    <!-- TABS DE PERÍODO -->
    <div class="periodo-tabs">
      <button
        v-for="p in periodos"
        :key="p.key"
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

    <div v-if="cargando" class="estado-cargando">Cargando reporte...</div>

    <div v-else-if="reporte" class="reporte-contenido">

      <!-- Ingreso principal -->
      <div class="card-ingreso-principal">
        <div class="ingreso-label">Total ingresos — {{ labelPeriodo }}</div>
        <div class="ingreso-monto">${{ formatPrecio(reporte.total) }}</div>
        <div class="ingreso-pagos">{{ reporte.transacciones }} pagos procesados</div>
      </div>

      <!-- Cards secundarias -->
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
        <div class="card-mini promedio">
          <div class="mini-valor">
            ${{ reporte.transacciones > 0
              ? formatPrecio(reporte.total / reporte.transacciones)
              : '0' }}
          </div>
          <div class="mini-label">Promedio/pago</div>
        </div>
      </div>

      <!-- Barra ocupación -->
      <div class="ocupacion-card">
        <div class="ocupacion-row">
          <span class="ocupacion-label">Ocupación</span>
          <span class="ocupacion-pct" :class="colorBarra">{{ pctOcupacion }}%</span>
        </div>
        <div class="barra-fondo">
          <div
            class="barra-relleno"
            :class="colorBarra"
            :style="{ width: pctOcupacion + '%' }"
          ></div>
        </div>
        <div class="ocupacion-leyenda">
          <span><i class="dot rojo"></i> {{ reporte.habitacionesOcupadas }} ocupadas</span>
          <span><i class="dot verde"></i> {{ reporte.habitacionesDisponibles }} libres</span>
          <span><i class="dot amarillo"></i> {{ reporte.habitacionesMantenimiento }} mant.</span>
        </div>
      </div>

      <!-- Resumen detalle -->
      <div class="resumen-card">
        <div class="resumen-titulo">Detalle del período</div>
        <div class="resumen-fila">
          <span>Período</span>
          <span>{{ labelPeriodo }}</span>
        </div>
        <div class="resumen-fila">
          <span>Total ingresos</span>
          <span class="destacado">${{ formatPrecio(reporte.total) }}</span>
        </div>
        <div class="resumen-fila">
          <span>Pagos procesados</span>
          <span>{{ reporte.transacciones }}</span>
        </div>
        <div class="resumen-fila">
          <span>Ticket promedio</span>
          <span>
            ${{ reporte.transacciones > 0
              ? formatPrecio(reporte.total / reporte.transacciones)
              : '0' }}
          </span>
        </div>
        <div class="resumen-fila">
          <span>% Ocupación</span>
          <span :class="['pct', colorBarra]">{{ pctOcupacion }}%</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { reporteAdminService } from '../api/services'

const periodos = [
  { key: 'hoy',    label: 'Hoy' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes',    label: 'Mes' },
  { key: 'anual',  label: 'Año' }
]

const periodoActivo    = ref('hoy')
const reporte          = ref(null)
const cargando         = ref(false)
const anioSeleccionado = ref(new Date().getFullYear())

const aniosDisponibles = computed(() => {
  const a = new Date().getFullYear()
  return [a, a - 1, a - 2, a - 3]
})

const labelPeriodo = computed(() => {
  const map = {
    hoy:    'Hoy',
    semana: 'Esta semana',
    mes:    new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
    anual:  'Año ' + anioSeleccionado.value
  }
  return map[periodoActivo.value]
})

const pctOcupacion = computed(() => {
  if (!reporte.value) return 0
  const total = (reporte.value.habitacionesOcupadas || 0) +
                (reporte.value.habitacionesDisponibles || 0) +
                (reporte.value.habitacionesMantenimiento || 0)
  return total > 0
    ? Math.round((reporte.value.habitacionesOcupadas / total) * 100)
    : 0
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
    switch (periodoActivo.value) {
      case 'hoy':    res = await reporteAdminService.ingresosHoy(); break
      case 'semana': res = await reporteAdminService.ingresosSemana(); break
      case 'mes':    res = await reporteAdminService.ingresosMes(); break
      case 'anual':  res = await reporteAdminService.ingresosAnual(anioSeleccionado.value); break
    }
    reporte.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

function cambiarPeriodo(key) {
  periodoActivo.value = key
  cargarReporte()
}

function formatPrecio(v) {
  return Number(v || 0).toLocaleString('es-CO', {
    minimumFractionDigits: 0, maximumFractionDigits: 0
  })
}
</script>

<style scoped>
.reportes { padding: 1rem 1rem 0; }

.periodo-tabs {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.tab {
  flex: 1;
  padding: 0.55rem 0;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 0.825rem;
  font-weight: 500;
  transition: all 0.2s;
}

.tab.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.anio-row {
  margin-bottom: 0.75rem;
}

.anio-row select {
  padding: 0.5rem 0.85rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.875rem;
  color: var(--text);
  background: var(--bg-card);
  outline: none;
}

.estado-cargando {
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
}

.reporte-contenido {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-ingreso-principal {
  background: var(--primary);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  color: #fff;
}

.ingreso-label {
  font-size: 0.78rem;
  opacity: 0.8;
  margin-bottom: 0.4rem;
}

.ingreso-monto {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 0.4rem;
}

.ingreso-pagos {
  font-size: 0.78rem;
  opacity: 0.75;
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.card-mini {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 0.85rem 1rem;
  box-shadow: var(--shadow);
  border-left: 3px solid;
}

.card-mini.ocupadas     { border-left-color: var(--danger); }
.card-mini.disponibles  { border-left-color: var(--success); }
.card-mini.mantenimiento { border-left-color: var(--warning); }
.card-mini.promedio     { border-left-color: var(--purple); }

.mini-valor {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.mini-label {
  font-size: 0.7rem;
  color: var(--text-light);
  font-weight: 500;
}

.ocupacion-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 1rem 1.1rem;
  box-shadow: var(--shadow);
}

.ocupacion-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.ocupacion-label { font-size: 0.875rem; font-weight: 500; color: var(--text); }

.ocupacion-pct { font-size: 1rem; font-weight: 800; }
.ocupacion-pct.alta  { color: var(--danger); }
.ocupacion-pct.media { color: var(--warning); }
.ocupacion-pct.baja  { color: var(--success); }

.barra-fondo {
  height: 8px;
  background: #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.6rem;
}

.barra-relleno {
  height: 100%;
  border-radius: 8px;
  transition: width 0.6s ease;
}

.barra-relleno.alta  { background: var(--danger); }
.barra-relleno.media { background: var(--warning); }
.barra-relleno.baja  { background: var(--success); }

.ocupacion-leyenda {
  display: flex;
  gap: 0.75rem;
  font-size: 0.72rem;
  color: var(--text-light);
  flex-wrap: wrap;
}

.dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 3px;
  font-style: normal;
}

.dot.rojo    { background: var(--danger); }
.dot.verde   { background: var(--success); }
.dot.amarillo { background: var(--warning); }

.resumen-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 1rem 1.1rem;
  box-shadow: var(--shadow);
}

.resumen-titulo {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--border);
}

.resumen-fila {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.55rem 0;
  border-bottom: 1px solid #f8fafc;
  font-size: 0.875rem;
}

.resumen-fila:last-child { border-bottom: none; }
.resumen-fila span:first-child { color: var(--text-muted); }
.resumen-fila span:last-child  { font-weight: 500; color: var(--text); }

.destacado { font-weight: 800 !important; color: var(--primary) !important; font-size: 1rem !important; }

.pct.alta  { color: var(--danger) !important; font-weight: 700 !important; }
.pct.media { color: var(--warning) !important; font-weight: 700 !important; }
.pct.baja  { color: var(--success) !important; font-weight: 700 !important; }
</style>