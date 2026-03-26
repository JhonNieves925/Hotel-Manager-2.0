<template>
  <div class="dashboard">

    <!-- Saludo -->
    <div class="saludo">
      <div class="saludo-texto">
        <span class="saludo-sub">{{ saludo }}</span>
        <span class="saludo-nombre">{{ authStore.nombreUsuario }}</span>
      </div>
      <div class="saludo-fecha">{{ fechaHoy }}</div>
    </div>

    <!-- TARJETAS FINANCIERAS -->
    <div class="seccion-titulo">Resumen de hoy</div>
    <div v-if="cargando" class="estado-cargando">Cargando...</div>
    <div v-else class="cards-grid">

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
        <span class="ocupacion-pct" :class="colorPct">{{ pctOcupacion }}%</span>
      </div>
      <div class="barra-fondo">
        <div
          class="barra-relleno"
          :class="colorBarra"
          :style="{ width: pctOcupacion + '%' }"
        ></div>
      </div>
    </div>

    <!-- RESERVAS ACTIVAS HOY -->
    <div class="seccion-titulo">Reservas activas hoy</div>
    <div v-if="reservasHoy.length === 0" class="estado-vacio">
      No hay reservas activas hoy
    </div>
    <div v-else class="reservas-lista">
      <div
        v-for="r in reservasHoy"
        :key="r.id"
        class="reserva-item"
      >
        <div class="reserva-left">
          <div class="reserva-nombre">{{ r.nombreHuesped }} {{ r.apellidoHuesped }}</div>
          <div class="reserva-hab">{{ r.tipoHabitacion }} — Hab. {{ r.numeroHabitacion }}</div>
          <div class="reserva-fechas">{{ r.fechaEntrada }} → {{ r.fechaSalida }}</div>
        </div>
        <div class="reserva-right">
          <span :class="['badge', r.estadoReserva]">{{ r.estadoReserva }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { reporteAdminService, reservaService } from '../api/services'

const authStore   = useAuthStore()
const reporte     = ref(null)
const reservasHoy = ref([])
const cargando    = ref(true)

const fechaHoy = computed(() =>
  new Date().toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
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
  return total > 0
    ? Math.round((reporte.value.habitacionesOcupadas / total) * 100)
    : 0
})

const colorBarra = computed(() => {
  if (pctOcupacion.value >= 80) return 'alta'
  if (pctOcupacion.value >= 50) return 'media'
  return 'baja'
})

const colorPct = computed(() => colorBarra.value)

onMounted(async () => {
  try {
    const [resReporte, resReservas] = await Promise.all([
      reporteAdminService.ingresosHoy(),
      reservaService.reservasDeHoy()
    ])
    reporte.value     = resReporte.data
    reservasHoy.value = resReservas.data
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
})

function formatPrecio(v) {
  return Number(v || 0).toLocaleString('es-CO', {
    minimumFractionDigits: 0, maximumFractionDigits: 0
  })
}
</script>

<style scoped>
.dashboard { padding: 1rem 1rem 0; }

.saludo {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.saludo-texto {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.saludo-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.saludo-nombre {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
}

.saludo-fecha {
  font-size: 0.75rem;
  color: var(--text-light);
  text-align: right;
  max-width: 120px;
}

.seccion-titulo {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 1.25rem 0 0.75rem;
}

.estado-cargando {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
  font-size: 0.9rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 1rem 1.1rem;
  box-shadow: var(--shadow);
  border-left: 4px solid;
}

.card-ingresos     { border-left-color: var(--primary); }
.card-ocupadas     { border-left-color: var(--danger); }
.card-disponibles  { border-left-color: var(--success); }
.card-mantenimiento { border-left-color: var(--warning); }

.card-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.35rem;
}

.card-valor {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.card-sub {
  font-size: 0.72rem;
  color: var(--text-light);
}

.ocupacion-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 1rem 1.1rem;
  box-shadow: var(--shadow);
  margin-top: 0.75rem;
}

.ocupacion-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.ocupacion-label { font-size: 0.825rem; font-weight: 500; color: var(--text); }

.ocupacion-pct {
  font-size: 1rem;
  font-weight: 800;
}

.ocupacion-pct.alta  { color: var(--danger); }
.ocupacion-pct.media { color: var(--warning); }
.ocupacion-pct.baja  { color: var(--success); }

.barra-fondo {
  height: 8px;
  background: #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
}

.barra-relleno {
  height: 100%;
  border-radius: 8px;
  transition: width 0.6s ease;
}

.barra-relleno.alta  { background: var(--danger); }
.barra-relleno.media { background: var(--warning); }
.barra-relleno.baja  { background: var(--success); }

.estado-vacio {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-light);
  font-size: 0.875rem;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.reservas-lista {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.reserva-item {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 0.9rem 1rem;
  box-shadow: var(--shadow);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.reserva-nombre {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.2rem;
}

.reserva-hab {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-bottom: 0.15rem;
}

.reserva-fechas {
  font-size: 0.72rem;
  color: var(--text-light);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge.pendiente   { background:#fef3c7; color:#92400e; }
.badge.confirmada  { background:#dbeafe; color:#1e40af; }
.badge.en_curso    { background:#dcfce7; color:#166534; }
.badge.completada  { background:#f1f5f9; color:#475569; }
.badge.cancelada   { background:#fee2e2; color:#991b1b; }
</style>