<template>
  <div class="reservas">

    <!-- Filtro estado -->
    <div class="filtros">
      <button
        v-for="f in filtros"
        :key="f.key"
        :class="['filtro-btn', { active: filtroActivo === f.key }]"
        @click="filtroActivo = f.key"
      >{{ f.label }}</button>
    </div>

    <div v-if="cargando" class="estado-cargando">Cargando reservas...</div>

    <div v-else-if="reservasFiltradas.length === 0" class="estado-vacio">
      No hay reservas {{ filtroActivo !== 'todas' ? 'con estado ' + filtroActivo : '' }}
    </div>

    <div v-else class="reservas-lista">
      <div
        v-for="r in reservasFiltradas"
        :key="r.id"
        class="reserva-card"
      >
        <div class="reserva-header">
          <div class="reserva-id">#{{ r.id }}</div>
          <span :class="['badge', r.estadoReserva]">{{ formatEstado(r.estadoReserva) }}</span>
        </div>

        <div class="reserva-body">
          <div class="reserva-nombre">{{ r.nombreHuesped }} {{ r.apellidoHuesped }}</div>
          <div class="reserva-hab">{{ r.tipoHabitacion }} — Habitación {{ r.numeroHabitacion }}</div>
          <div class="reserva-fechas">
            <span>Check-in: {{ r.fechaEntrada }}</span>
            <span>Check-out: {{ r.fechaSalida }}</span>
          </div>
          <div class="reserva-total">${{ formatPrecio(r.valorTotal) }}</div>
        </div>

        <!-- Acciones -->
        <div class="reserva-acciones">
          <button
            class="btn-accion confirmar"
            @click="cambiarEstado(r.id, 'confirmada')"
            v-if="r.estadoReserva === 'pendiente'"
          >Confirmar</button>
          <button
            class="btn-accion checkin"
            @click="cambiarEstado(r.id, 'en_curso')"
            v-if="r.estadoReserva === 'confirmada'"
          >Check-in</button>
          <button
            class="btn-accion checkout"
            @click="cambiarEstado(r.id, 'completada')"
            v-if="r.estadoReserva === 'en_curso'"
          >Check-out</button>
          <button
            class="btn-accion cancelar"
            @click="cambiarEstado(r.id, 'cancelada')"
            v-if="['pendiente','confirmada'].includes(r.estadoReserva)"
          >Cancelar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { reservaService } from '../api/services'

const filtros = [
  { key: 'todas',     label: 'Todas' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'confirmada', label: 'Confirmadas' },
  { key: 'en_curso',  label: 'En curso' },
  { key: 'completada', label: 'Completadas' }
]

const reservas     = ref([])
const cargando     = ref(true)
const filtroActivo = ref('todas')

const reservasFiltradas = computed(() => {
  if (filtroActivo.value === 'todas') return reservas.value
  return reservas.value.filter(r => r.estadoReserva === filtroActivo.value)
})

onMounted(cargarReservas)

async function cargarReservas() {
  cargando.value = true
  try {
    const res = await reservaService.listarTodas()
    reservas.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

async function cambiarEstado(id, nuevoEstado) {
  try {
    await reservaService.cambiarEstado(id, nuevoEstado)
    await cargarReservas()
  } catch (e) {
    alert('Error al cambiar estado')
  }
}

function formatEstado(e) {
  const map = {
    pendiente: 'Pendiente', confirmada: 'Confirmada',
    en_curso: 'En curso', completada: 'Completada', cancelada: 'Cancelada'
  }
  return map[e] || e
}

function formatPrecio(v) {
  return Number(v || 0).toLocaleString('es-CO', {
    minimumFractionDigits: 0, maximumFractionDigits: 0
  })
}
</script>

<style scoped>
.reservas { padding: 1rem 1rem 0; }

.filtros {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
  scrollbar-width: none;
}
.filtros::-webkit-scrollbar { display: none; }

.filtro-btn {
  flex-shrink: 0;
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
}

.filtro-btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.estado-cargando, .estado-vacio {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-light);
  font-size: 0.9rem;
}

.reservas-lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reserva-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.reserva-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid var(--border);
}

.reserva-id {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
}

.reserva-body {
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.reserva-nombre {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
}

.reserva-hab {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.reserva-fechas {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-light);
}

.reserva-total {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary);
  margin-top: 0.2rem;
}

.reserva-acciones {
  display: flex;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
}

.btn-accion {
  flex: 1;
  min-width: 80px;
  padding: 0.5rem 0.5rem;
  border-radius: var(--radius);
  font-size: 0.78rem;
  font-weight: 600;
  color: #fff;
  transition: opacity 0.2s;
}

.btn-accion:active { opacity: 0.8; }
.btn-accion.confirmar { background: var(--primary); }
.btn-accion.checkin   { background: var(--success); }
.btn-accion.checkout  { background: var(--purple); }
.btn-accion.cancelar  { background: var(--danger); }

.badge { display:inline-block; padding:0.22rem 0.55rem; border-radius:20px; font-size:0.7rem; font-weight:600; }
.badge.pendiente   { background:#fef3c7; color:#92400e; }
.badge.confirmada  { background:#dbeafe; color:#1e40af; }
.badge.en_curso    { background:#dcfce7; color:#166534; }
.badge.completada  { background:#f1f5f9; color:#475569; }
.badge.cancelada   { background:#fee2e2; color:#991b1b; }
</style>