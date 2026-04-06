<template>
  <div class="reservas">

    <!-- FILTROS -->
    <div class="filtros">
      <button v-for="f in filtros" :key="f.key"
        :class="['filtro-btn', { active: filtroActivo === f.key }]"
        @click="filtroActivo = f.key"
      >{{ f.label }}</button>
    </div>

    <div v-if="cargando" class="estado-cargando">Cargando reservas...</div>

    <div v-else-if="reservasFiltradas.length === 0" class="estado-vacio">
      No hay reservas {{ filtroActivo !== 'todas' ? 'con estado ' + filtroActivo : '' }}
    </div>

    <div v-else class="reservas-lista">
      <div v-for="r in reservasFiltradas" :key="r.id" class="reserva-card">

        <div class="reserva-header">
          <div class="reserva-id">#{{ r.id }}</div>
          <span :class="['badge', r.estadoReserva]">{{ formatEstado(r.estadoReserva) }}</span>
        </div>

        <div class="reserva-body">
          <div class="reserva-nombre">{{ r.nombreHuesped }} {{ r.apellidoHuesped }}</div>
          <div class="reserva-hab">{{ r.tipoHabitacion }} — Habitación {{ r.numeroHabitacion }}</div>
          <div class="reserva-fechas">
            <span>{{ formatFechaCorta(r.fechaEntrada) }}</span>
            <span class="flecha">→</span>
            <span>{{ formatFechaCorta(r.fechaSalida) }}</span>
            <span class="noches">{{ r.noches }} noche{{ r.noches !== 1 ? 's' : '' }}</span>
          </div>
          <div class="reserva-total">${{ formatPrecio(r.valorTotal) }}</div>
        </div>

        <!-- Acciones de estado -->
        <div class="reserva-acciones">
          <button class="btn-accion confirmar" @click="cambiarEstado(r.id, 'confirmada')" v-if="r.estadoReserva === 'pendiente'">Confirmar</button>
          <button class="btn-accion checkin"   @click="cambiarEstado(r.id, 'en_curso')"   v-if="r.estadoReserva === 'confirmada'">Check-in</button>
          <button class="btn-accion checkout"  @click="cambiarEstado(r.id, 'completada')" v-if="r.estadoReserva === 'en_curso'">Check-out</button>
          <button class="btn-accion cancelar"  @click="cambiarEstado(r.id, 'cancelada')"  v-if="['pendiente','confirmada'].includes(r.estadoReserva)">Cancelar</button>

          <!-- Editar — solo pendiente o confirmada -->
          <button class="btn-accion editar" @click="abrirEditar(r)" v-if="['pendiente','confirmada'].includes(r.estadoReserva)">✎ Editar</button>

          <!-- Factura -->
          <button class="btn-accion factura" @click="descargarFactura(r)" :disabled="descargando === r.id">
            <span v-if="descargando === r.id">...</span>
            <span v-else>↓ Factura</span>
          </button>
        </div>

      </div>
    </div>

    <!-- ══ MODAL EDITAR ══ -->
    <div v-if="modalEditar" class="modal-overlay" @click.self="modalEditar = false">
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div class="modal-titulo">Editar reserva <span class="id-tag">#{{ editar.id }}</span></div>
        <div class="modal-scroll">

          <div class="form-seccion">
            <div class="form-label">Fechas</div>
            <div class="form-row">
              <div class="form-group">
                <label>Check-in</label>
                <input type="date" v-model="editar.fechaEntrada" />
              </div>
              <div class="form-group">
                <label>Check-out</label>
                <input type="date" v-model="editar.fechaSalida" :min="editar.fechaEntrada" />
              </div>
            </div>
          </div>

          <div class="form-seccion">
            <div class="form-label">Datos del huésped</div>
            <div class="form-row">
              <div class="form-group"><label>Nombre</label><input type="text" v-model="editar.nombreHuesped" /></div>
              <div class="form-group"><label>Apellido</label><input type="text" v-model="editar.apellidoHuesped" /></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Teléfono</label><input type="tel" v-model="editar.telefonoHuesped" /></div>
              <div class="form-group"><label>Email</label><input type="email" v-model="editar.emailHuesped" /></div>
            </div>
          </div>

          <div class="form-seccion">
            <div class="form-label">Forma de pago</div>
            <select v-model="editar.formaPago" class="select-full">
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta_credito">Tarjeta de crédito</option>
              <option value="tarjeta_debito">Tarjeta de débito</option>
              <option value="transferencia">Transferencia bancaria</option>
              <option value="pse">PSE</option>
              <option value="nequi">Nequi</option>
              <option value="daviplata">Daviplata</option>
            </select>
          </div>

          <div class="form-seccion">
            <div class="form-label">Observaciones</div>
            <input type="text" v-model="editar.observaciones" class="select-full" placeholder="Opcional..." />
          </div>

          <div v-if="errorEditar" class="error-msg">⚠ {{ errorEditar }}</div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancelar" @click="modalEditar = false">Cancelar</button>
          <button class="btn-guardar" @click="guardarEdicion" :disabled="guardando">
            {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { reservaService } from '../api/services'
import { useFacturaPDF } from '../composables/useFacturaPDF'

const { descargarPDF, parsearFecha } = useFacturaPDF()

const reservas     = ref([])
const cargando     = ref(true)
const filtroActivo = ref('todas')
const descargando  = ref(null)
const modalEditar  = ref(false)
const guardando    = ref(false)
const errorEditar  = ref('')
const editar       = ref({})

const filtros = [
  { key: 'todas',     label: 'Todas' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'confirmada',label: 'Confirmadas' },
  { key: 'en_curso',  label: 'En curso' },
  { key: 'completada',label: 'Completadas' }
]

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
  } catch (e) { console.error(e) }
  finally { cargando.value = false }
}

async function cambiarEstado(id, nuevoEstado) {
  try {
    await reservaService.cambiarEstado(id, nuevoEstado)
    await cargarReservas()
  } catch { alert('Error al cambiar estado') }
}

async function descargarFactura(reserva) {
  descargando.value = reserva.id
  try { await descargarPDF(reserva) }
  catch (e) { alert('Error al generar PDF') }
  finally { descargando.value = null }
}

function parsearFechaISO(valor) {
  if (!valor) return ''
  const d = parsearFecha(valor)
  if (!d || isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function abrirEditar(r) {
  errorEditar.value = ''
  editar.value = {
    id:              r.id,
    fechaEntrada:    parsearFechaISO(r.fechaEntrada),
    fechaSalida:     parsearFechaISO(r.fechaSalida),
    formaPago:       r.formaPago,
    observaciones:   r.observaciones || '',
    nombreHuesped:   r.nombreHuesped || '',
    apellidoHuesped: r.apellidoHuesped || '',
    telefonoHuesped: r.telefonoHuesped || '',
    emailHuesped:    r.emailHuesped || ''
  }
  modalEditar.value = true
}

async function guardarEdicion() {
  guardando.value   = true
  errorEditar.value = ''
  try {
    await reservaService.editar(editar.value.id, {
      fechaEntrada:    editar.value.fechaEntrada    || null,
      fechaSalida:     editar.value.fechaSalida     || null,
      formaPago:       editar.value.formaPago       || null,
      observaciones:   editar.value.observaciones   || null,
      nombreHuesped:   editar.value.nombreHuesped   || null,
      apellidoHuesped: editar.value.apellidoHuesped || null,
      telefonoHuesped: editar.value.telefonoHuesped || null,
      emailHuesped:    editar.value.emailHuesped    || null
    })
    modalEditar.value = false
    await cargarReservas()
  } catch (e) {
    errorEditar.value = e.response?.data?.error || 'Error al guardar'
  } finally { guardando.value = false }
}

function formatEstado(e) {
  return { pendiente:'Pendiente', confirmada:'Confirmada', en_curso:'En curso', completada:'Completada', cancelada:'Cancelada' }[e] || e
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
</script>

<style scoped>
.reservas { padding: 1rem 1rem 0; }

.filtros { display: flex; gap: 0.4rem; overflow-x: auto; padding-bottom: 0.5rem; margin-bottom: 0.75rem; scrollbar-width: none; }
.filtros::-webkit-scrollbar { display: none; }
.filtro-btn { flex-shrink: 0; padding: 0.4rem 0.9rem; border-radius: 20px; border: 1.5px solid var(--border); background: var(--bg-card); color: var(--text-muted); font-size: 0.78rem; font-weight: 500; white-space: nowrap; transition: all 0.2s; cursor: pointer; }
.filtro-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }

.estado-cargando, .estado-vacio { text-align: center; padding: 3rem 1rem; color: var(--text-light); }

.reservas-lista { display: flex; flex-direction: column; gap: 0.65rem; padding-bottom: 1rem; }
.reserva-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 1rem; box-shadow: var(--shadow); }
.reserva-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
.reserva-id { font-size: 0.72rem; color: var(--text-muted); }
.reserva-nombre { font-size: 0.95rem; font-weight: 700; color: var(--text); margin-bottom: 0.2rem; }
.reserva-hab { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.35rem; }
.reserva-fechas { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--text-light); margin-bottom: 0.35rem; flex-wrap: wrap; }
.flecha { color: var(--text-muted); }
.noches { margin-left: auto; background: rgba(255,255,255,0.08); padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; }
.reserva-total { font-size: 1rem; font-weight: 800; color: var(--primary); margin-bottom: 0.65rem; }
.reserva-acciones { display: flex; gap: 0.4rem; flex-wrap: wrap; }

.btn-accion { padding: 0.3rem 0.75rem; border: none; border-radius: 6px; font-size: 0.72rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
.btn-accion.confirmar { background: rgba(37,99,235,0.2);  color: #60a5fa; }
.btn-accion.checkin   { background: rgba(22,163,74,0.2);  color: #4ade80; }
.btn-accion.checkout  { background: rgba(255,255,255,0.1); color: var(--text-muted); }
.btn-accion.cancelar  { background: rgba(220,38,38,0.2);  color: #fca5a5; }
.btn-accion.editar    { background: rgba(139,92,246,0.2); color: #c4b5fd; }
.btn-accion.factura   { background: rgba(217,119,6,0.2);  color: #fbbf24; }
.btn-accion:disabled  { opacity: 0.5; cursor: not-allowed; }

.badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.68rem; font-weight: 600; white-space: nowrap; }
.badge.pendiente  { background: rgba(217,119,6,0.2); color: #fbbf24; }
.badge.confirmada { background: rgba(37,99,235,0.2); color: #60a5fa; }
.badge.en_curso   { background: rgba(22,163,74,0.2); color: #4ade80; }
.badge.completada { background: rgba(255,255,255,0.1); color: var(--text-muted); }
.badge.cancelada  { background: rgba(220,38,38,0.2); color: #fca5a5; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; display: flex; align-items: flex-end; }
.modal-sheet { background: var(--bg-card); border-radius: 20px 20px 0 0; width: 100%; max-height: 88vh; display: flex; flex-direction: column; padding-bottom: env(safe-area-inset-bottom, 0); }
.modal-handle { width: 36px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin: 0.75rem auto 0; }
.modal-titulo { font-size: 1rem; font-weight: 700; color: var(--text); padding: 0.75rem 1.25rem; border-bottom: 1px solid var(--border); }
.id-tag { font-size: 0.82rem; color: var(--primary); background: rgba(37,99,235,0.15); padding: 2px 8px; border-radius: 6px; margin-left: 6px; }
.modal-scroll { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
.modal-footer { display: flex; gap: 0.75rem; padding: 0.75rem 1.25rem; border-top: 1px solid var(--border); }
.btn-cancelar { flex: 1; padding: 0.7rem; background: rgba(255,255,255,0.08); color: var(--text-muted); border: none; border-radius: var(--radius); font-size: 0.875rem; cursor: pointer; }
.btn-guardar { flex: 2; padding: 0.7rem; background: var(--primary); color: #fff; border: none; border-radius: var(--radius); font-size: 0.875rem; font-weight: 700; cursor: pointer; }
.btn-guardar:disabled { opacity: 0.5; cursor: not-allowed; }

.form-seccion { display: flex; flex-direction: column; gap: 0.5rem; }
.form-label { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
.form-group { display: flex; flex-direction: column; gap: 0.25rem; }
.form-group label { font-size: 0.72rem; color: var(--text-muted); }
.form-group input { padding: 0.5rem 0.7rem; background: rgba(255,255,255,0.06); border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.85rem; color: var(--text); outline: none; }
.form-group input:focus { border-color: var(--primary); }
.select-full { width: 100%; padding: 0.5rem 0.7rem; background: rgba(255,255,255,0.06); border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.85rem; color: var(--text); outline: none; }
.error-msg { padding: 0.6rem 0.9rem; background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.3); border-radius: var(--radius); font-size: 0.8rem; color: #fca5a5; }
</style>