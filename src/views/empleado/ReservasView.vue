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
        <h1>Reservas</h1>
        <button class="btn-primary" @click="abrirModalNueva">+ Nueva reserva</button>
      </div>

      <div class="filtros">
        <select v-model="filtroEstado" class="filtro-select">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="en_curso">En curso</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <span class="total-label">{{ reservasFiltradas.length }} reservas</span>
      </div>

      <div v-if="cargando" class="estado-cargando">Cargando reservas...</div>

      <div v-else class="tabla-wrapper">
        <table class="tabla">
          <thead>
            <tr>
              <th>#</th>
              <th>Habitación</th>
              <th>Huésped</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Noches</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Factura</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="reservasFiltradas.length === 0">
              <td colspan="10" class="estado-vacio">No hay reservas</td>
            </tr>
            <tr v-for="r in reservasFiltradas" :key="r.id">
              <td class="col-id">#{{ r.id }}</td>
              <td>{{ r.tipoHabitacion }}<br><span class="sub-txt">Nro. {{ r.numeroHabitacion }}</span></td>
              <td>{{ r.nombreHuesped }} {{ r.apellidoHuesped }}<br><span class="sub-txt">{{ r.emailHuesped }}</span></td>
              <td>{{ formatFechaCorta(r.fechaEntrada) }}</td>
              <td>{{ formatFechaCorta(r.fechaSalida) }}</td>
              <td class="col-center">{{ r.noches }}</td>
              <td class="col-total">${{ formatPrecio(r.valorTotal) }}</td>
              <td><span :class="['badge', r.estadoReserva]">{{ labelEstado(r.estadoReserva) }}</span></td>
              <td>
                <div class="factura-btns">
                  <button class="btn-factura" @click="verFactura(r)" title="Ver factura">👁</button>
                  <button class="btn-factura descargar" @click="descargarFactura(r)" title="Descargar PDF" :disabled="descargando === r.id">
                    <span v-if="descargando === r.id" class="mini-spinner"></span>
                    <span v-else>↓</span>
                  </button>
                </div>
              </td>
              <td>
                <div class="acciones">
                  <!-- Editar — solo en pendiente o confirmada -->
                  <button
                    class="btn-sm editar"
                    @click="abrirModalEditar(r)"
                    v-if="['pendiente','confirmada'].includes(r.estadoReserva)"
                    title="Editar reserva"
                  >✎</button>
                  <button class="btn-sm confirmar" @click="cambiarEstado(r.id, 'confirmada')"  v-if="r.estadoReserva === 'pendiente'">Confirmar</button>
                  <button class="btn-sm checkin"   @click="cambiarEstado(r.id, 'en_curso')"   v-if="r.estadoReserva === 'confirmada'">Check-in</button>
                  <button class="btn-sm checkout"  @click="cambiarEstado(r.id, 'completada')" v-if="r.estadoReserva === 'en_curso'">Check-out</button>
                  <button class="btn-sm cancelar"  @click="cambiarEstado(r.id, 'cancelada')"  v-if="['pendiente','confirmada'].includes(r.estadoReserva)">Cancelar</button>
                  <button class="btn-sm eliminar"  @click="eliminarReserva(r.id)"             v-if="authStore.isAdmin && r.estadoReserva === 'cancelada'">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- ══════════════════════════════════════
         MODAL — PREVIEW FACTURA
    ══════════════════════════════════════ -->
    <div v-if="reservaFactura" class="modal-overlay" @click.self="reservaFactura = null">
      <div class="modal-factura">
        <div class="modal-header">
          <span class="modal-titulo">Factura #FAC-{{ new Date().getFullYear() }}-{{ String(reservaFactura.id).padStart(6,'0') }}</span>
          <button class="modal-close" @click="reservaFactura = null">✕</button>
        </div>
        <div class="modal-body-scroll">
          <div v-html="previewHTML" class="factura-preview-inner"></div>
        </div>
        <div class="modal-footer">
          <button class="btn-secundario" @click="reservaFactura = null">Cerrar</button>
          <button class="btn-primario" @click="descargarFactura(reservaFactura)" :disabled="descargando === reservaFactura?.id">
            <span v-if="descargando === reservaFactura?.id" class="mini-spinner blanco"></span>
            <span v-else>↓ Descargar PDF</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         MODAL — NUEVA RESERVA
    ══════════════════════════════════════ -->
    <div v-if="modalNueva" class="modal-overlay" @click.self="modalNueva = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Nueva reserva presencial</h2>
          <button class="modal-close" @click="modalNueva = false">✕</button>
        </div>
        <div class="modal-body-scroll">
          <div class="modal-seccion">
            <h3 class="seccion-titulo">1. Seleccionar habitación</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Check-in</label>
                <input type="date" v-model="nueva.fechaEntrada" :min="hoy" @change="buscarHabitaciones('nueva')" />
              </div>
              <div class="form-group">
                <label>Check-out</label>
                <input type="date" v-model="nueva.fechaSalida" :min="nueva.fechaEntrada || hoy" @change="buscarHabitaciones('nueva')" />
              </div>
            </div>
            <div v-if="buscandoHabs" class="buscando-texto">Buscando habitaciones disponibles...</div>
            <div v-if="habitacionesDisponibles.length > 0" class="habitaciones-lista">
              <div v-for="hab in habitacionesDisponibles" :key="hab.id"
                class="hab-opcion" :class="{ seleccionada: nueva.idHabitacion === hab.id }"
                @click="seleccionarHabitacion(hab, 'nueva')">
                <div class="hab-opcion-info">
                  <span class="hab-tipo">{{ hab.tipo }} — Hab. {{ hab.numero }}</span>
                  <span class="sub-txt">Piso {{ hab.piso }} · {{ hab.capacidad }} persona(s)</span>
                </div>
                <span class="hab-precio">${{ formatPrecio(hab.precioNoche) }}/noche</span>
              </div>
            </div>
            <div v-if="nueva.fechaEntrada && nueva.fechaSalida && habitacionesDisponibles.length === 0 && !buscandoHabs" class="sin-disponibilidad">
              No hay habitaciones disponibles para esas fechas
            </div>
            <div v-if="nueva.idHabitacion && totalNueva > 0" class="resumen-seleccion">
              <span>{{ habSeleccionadaNueva?.tipo }} — Hab. {{ habSeleccionadaNueva?.numero }}</span>
              <span>Total: <strong>${{ formatPrecio(totalNueva) }}</strong></span>
            </div>
          </div>

          <div class="modal-seccion" v-if="nueva.idHabitacion">
            <h3 class="seccion-titulo">2. Datos del huésped</h3>
            <div class="form-row">
              <div class="form-group"><label>Nombre *</label><input type="text" v-model="nueva.huesped.nombre" placeholder="Juan" /></div>
              <div class="form-group"><label>Apellido *</label><input type="text" v-model="nueva.huesped.apellido" placeholder="Pérez" /></div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Tipo de documento *</label>
                <select v-model="nueva.huesped.tipoDocumento">
                  <option value="cc">Cédula de ciudadanía</option>
                  <option value="ce">Cédula de extranjería</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="nit">NIT</option>
                </select>
              </div>
              <div class="form-group"><label>Número de documento *</label><input type="text" v-model="nueva.huesped.numeroDocumento" /></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Fecha de nacimiento *</label><input type="date" v-model="nueva.huesped.fechaNacimiento" /></div>
              <div class="form-group"><label>Nacionalidad *</label><input type="text" v-model="nueva.huesped.nacionalidad" placeholder="Colombiano/a" /></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Teléfono *</label><input type="tel" v-model="nueva.huesped.telefono" placeholder="3001234567" /></div>
              <div class="form-group"><label>Email (opcional)</label><input type="email" v-model="nueva.huesped.email" placeholder="juan@email.com" /></div>
            </div>
          </div>

          <div class="modal-seccion" v-if="nueva.idHabitacion">
            <h3 class="seccion-titulo">3. Forma de pago</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Método de pago *</label>
                <select v-model="nueva.formaPago">
                  <option value="">Selecciona una opción</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta_credito">Tarjeta de crédito</option>
                  <option value="tarjeta_debito">Tarjeta de débito</option>
                  <option value="transferencia">Transferencia bancaria</option>
                  <option value="pse">PSE</option>
                  <option value="nequi">Nequi</option>
                  <option value="daviplata">Daviplata</option>
                </select>
              </div>
              <div class="form-group"><label>Observaciones (opcional)</label><input type="text" v-model="nueva.observaciones" placeholder="Llegada tarde, cama extra..." /></div>
            </div>
          </div>
          <div v-if="errorNueva" class="error-msg">⚠ {{ errorNueva }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn-secundario" @click="modalNueva = false">Cancelar</button>
          <button class="btn-primario" @click="crearReserva" :disabled="guardandoNueva || !formularioNuevaValido">
            {{ guardandoNueva ? 'Guardando...' : `Confirmar reserva — $${formatPrecio(totalNueva)}` }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         MODAL — EDITAR RESERVA
    ══════════════════════════════════════ -->
    <div v-if="modalEditar" class="modal-overlay" @click.self="modalEditar = false">
      <div class="modal">
        <div class="modal-header">
          <div>
            <h2>Editar reserva <span class="id-tag">#{{ editar.id }}</span></h2>
            <p class="modal-subtitulo">Solo puedes editar reservas pendientes o confirmadas</p>
          </div>
          <button class="modal-close" @click="modalEditar = false">✕</button>
        </div>
        <div class="modal-body-scroll">

          <!-- Sección 1: Fechas y habitación -->
          <div class="modal-seccion">
            <h3 class="seccion-titulo">1. Fechas y habitación</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Check-in</label>
                <input type="date" v-model="editar.fechaEntrada" @change="buscarHabitaciones('editar')" />
              </div>
              <div class="form-group">
                <label>Check-out</label>
                <input type="date" v-model="editar.fechaSalida" :min="editar.fechaEntrada" @change="buscarHabitaciones('editar')" />
              </div>
            </div>

            <!-- Habitación actual -->
            <div class="hab-actual">
              <span class="hab-actual-label">Habitación actual:</span>
              <span class="hab-actual-valor">{{ editar.tipoHabitacionActual }} — Hab. {{ editar.numeroHabitacionActual }}</span>
              <button class="btn-cambiar-hab" @click="mostrarCambioHab = !mostrarCambioHab">
                {{ mostrarCambioHab ? 'Mantener habitación' : 'Cambiar habitación' }}
              </button>
            </div>

            <!-- Lista de disponibles (solo si quiere cambiar) -->
            <template v-if="mostrarCambioHab">
              <div v-if="buscandoHabsEditar" class="buscando-texto">Buscando habitaciones disponibles...</div>
              <div v-if="habitacionesDisponiblesEditar.length > 0" class="habitaciones-lista" style="margin-top:0.75rem">
                <div v-for="hab in habitacionesDisponiblesEditar" :key="hab.id"
                  class="hab-opcion" :class="{ seleccionada: editar.idHabitacion === hab.id }"
                  @click="seleccionarHabitacion(hab, 'editar')">
                  <div class="hab-opcion-info">
                    <span class="hab-tipo">{{ hab.tipo }} — Hab. {{ hab.numero }}</span>
                    <span class="sub-txt">Piso {{ hab.piso }} · {{ hab.capacidad }} persona(s)</span>
                  </div>
                  <span class="hab-precio">${{ formatPrecio(hab.precioNoche) }}/noche</span>
                </div>
              </div>
              <div v-if="editar.fechaEntrada && editar.fechaSalida && habitacionesDisponiblesEditar.length === 0 && !buscandoHabsEditar" class="sin-disponibilidad">
                No hay otras habitaciones disponibles para esas fechas
              </div>
            </template>

            <!-- Total recalculado -->
            <div v-if="totalEditar > 0" class="resumen-seleccion" style="margin-top:0.75rem">
              <span>{{ habSeleccionadaEditar?.tipo || editar.tipoHabitacionActual }} — Hab. {{ habSeleccionadaEditar?.numero || editar.numeroHabitacionActual }}</span>
              <span>Nuevo total: <strong>${{ formatPrecio(totalEditar) }}</strong></span>
            </div>
          </div>

          <!-- Sección 2: Datos del huésped -->
          <div class="modal-seccion">
            <h3 class="seccion-titulo">2. Datos del huésped</h3>
            <div class="form-row">
              <div class="form-group"><label>Nombre</label><input type="text" v-model="editar.nombreHuesped" /></div>
              <div class="form-group"><label>Apellido</label><input type="text" v-model="editar.apellidoHuesped" /></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Teléfono</label><input type="tel" v-model="editar.telefonoHuesped" /></div>
              <div class="form-group"><label>Email</label><input type="email" v-model="editar.emailHuesped" /></div>
            </div>
          </div>

          <!-- Sección 3: Pago -->
          <div class="modal-seccion">
            <h3 class="seccion-titulo">3. Forma de pago</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Método de pago</label>
                <select v-model="editar.formaPago">
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta_credito">Tarjeta de crédito</option>
                  <option value="tarjeta_debito">Tarjeta de débito</option>
                  <option value="transferencia">Transferencia bancaria</option>
                  <option value="pse">PSE</option>
                  <option value="nequi">Nequi</option>
                  <option value="daviplata">Daviplata</option>
                </select>
              </div>
              <div class="form-group"><label>Observaciones</label><input type="text" v-model="editar.observaciones" /></div>
            </div>
          </div>

          <div v-if="errorEditar" class="error-msg">⚠ {{ errorEditar }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn-secundario" @click="modalEditar = false">Cancelar</button>
          <button class="btn-primario" @click="guardarEdicion" :disabled="guardandoEditar">
            {{ guardandoEditar ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { reservaService, habitacionService } from '../../api/services'
import { useFacturaPDF } from '../../composables/useFacturaPDF'

const router    = useRouter()
const authStore = useAuthStore()
const { descargarPDF, obtenerHTMLPreview, parsearFecha } = useFacturaPDF()

// ── Estado principal ─────────────────────────────────────────
const reservas       = ref([])
const cargando       = ref(true)
const filtroEstado   = ref('')
const descargando    = ref(null)
const reservaFactura = ref(null)
const previewHTML    = ref('')

// ── Estado modal nueva ───────────────────────────────────────
const modalNueva              = ref(false)
const buscandoHabs            = ref(false)
const habitacionesDisponibles = ref([])
const habSeleccionadaNueva    = ref(null)
const guardandoNueva          = ref(false)
const errorNueva              = ref('')
const nueva                   = ref(resetFormNueva())

// ── Estado modal editar ──────────────────────────────────────
const modalEditar                  = ref(false)
const buscandoHabsEditar           = ref(false)
const habitacionesDisponiblesEditar = ref([])
const habSeleccionadaEditar        = ref(null)
const mostrarCambioHab             = ref(false)
const guardandoEditar              = ref(false)
const errorEditar                  = ref('')
const editar                       = ref({})

// ── Computadas ───────────────────────────────────────────────
const hoy = computed(() => new Date().toISOString().split('T')[0])

const reservasFiltradas = computed(() => {
  if (!filtroEstado.value) return reservas.value
  return reservas.value.filter(r => r.estadoReserva === filtroEstado.value)
})

const totalNueva = computed(() => {
  if (!habSeleccionadaNueva.value || !nueva.value.fechaEntrada || !nueva.value.fechaSalida) return 0
  const noches = Math.max(0,
    (new Date(nueva.value.fechaSalida) - new Date(nueva.value.fechaEntrada)) / 86400000
  )
  return habSeleccionadaNueva.value.precioNoche * noches
})

const formularioNuevaValido = computed(() => {
  const h = nueva.value.huesped
  return nueva.value.idHabitacion && nueva.value.fechaEntrada &&
    nueva.value.fechaSalida && nueva.value.formaPago &&
    h.nombre && h.apellido && h.numeroDocumento &&
    h.fechaNacimiento && h.nacionalidad && h.telefono
})

const totalEditar = computed(() => {
  const hab = habSeleccionadaEditar.value
  const precioNoche = hab?.precioNoche ?? editar.value.precioNocheActual ?? 0
  if (!editar.value.fechaEntrada || !editar.value.fechaSalida) return 0
  const noches = Math.max(0,
    (new Date(editar.value.fechaSalida) - new Date(editar.value.fechaEntrada)) / 86400000
  )
  return precioNoche * noches
})

// ── Lifecycle ────────────────────────────────────────────────
onMounted(cargarReservas)

// ── Métodos reservas ─────────────────────────────────────────
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
  } catch (e) {
    alert('Error al cambiar estado: ' + (e.response?.data?.error || e.message))
  }
}

async function eliminarReserva(id) {
  if (!confirm('¿Eliminar esta reserva? Esta acción no se puede deshacer.')) return
  try {
    await reservaService.eliminar(id)
    await cargarReservas()
  } catch { alert('Error al eliminar la reserva') }
}

// ── Métodos factura ──────────────────────────────────────────
function verFactura(reserva) {
  reservaFactura.value = reserva
  previewHTML.value    = obtenerHTMLPreview(reserva)
}

async function descargarFactura(reserva) {
  descargando.value = reserva.id
  try { await descargarPDF(reserva) }
  catch (e) { alert('Error al generar el PDF'); console.error(e) }
  finally { descargando.value = null }
}

// ── Métodos modal nueva ──────────────────────────────────────
function resetFormNueva() {
  return {
    idHabitacion: null, fechaEntrada: '', fechaSalida: '',
    formaPago: '', observaciones: '',
    huesped: {
      nombre: '', apellido: '', fechaNacimiento: '',
      nacionalidad: '', telefono: '', email: '',
      tipoDocumento: 'cc', numeroDocumento: ''
    }
  }
}

function abrirModalNueva() {
  nueva.value                   = resetFormNueva()
  habitacionesDisponibles.value = []
  habSeleccionadaNueva.value    = null
  errorNueva.value              = ''
  modalNueva.value              = true
}

async function buscarHabitaciones(modo) {
  const form = modo === 'nueva' ? nueva.value : editar.value
  if (!form.fechaEntrada || !form.fechaSalida) return
  if (form.fechaSalida <= form.fechaEntrada) return

  if (modo === 'nueva') {
    buscandoHabs.value            = true
    nueva.value.idHabitacion      = null
    habSeleccionadaNueva.value    = null
    habitacionesDisponibles.value = []
  } else {
    buscandoHabsEditar.value            = true
    habitacionesDisponiblesEditar.value = []
    habSeleccionadaEditar.value         = null
    editar.value.idHabitacion           = null
  }

  try {
    const res = await habitacionService.listarDisponibles(form.fechaEntrada, form.fechaSalida)
    if (modo === 'nueva') {
      habitacionesDisponibles.value = res.data
    } else {
      // Excluir la habitación actual de la lista de opciones
      habitacionesDisponiblesEditar.value = res.data.filter(
        h => h.numero !== editar.value.numeroHabitacionActual
      )
    }
  } catch (e) { console.error(e) }
  finally {
    if (modo === 'nueva') buscandoHabs.value = false
    else buscandoHabsEditar.value = false
  }
}

function seleccionarHabitacion(hab, modo) {
  if (modo === 'nueva') {
    nueva.value.idHabitacion   = hab.id
    habSeleccionadaNueva.value = hab
  } else {
    editar.value.idHabitacion  = hab.id
    habSeleccionadaEditar.value = hab
  }
}

async function crearReserva() {
  if (!formularioNuevaValido.value) return
  guardandoNueva.value = true
  errorNueva.value     = ''
  try {
    await reservaService.crear(nueva.value)
    modalNueva.value = false
    await cargarReservas()
  } catch (e) {
    errorNueva.value = e.response?.data?.error || 'Error al crear la reserva'
  } finally { guardandoNueva.value = false }
}

// ── Métodos modal editar ─────────────────────────────────────
function parsearFechaISO(valor) {
  if (!valor) return ''
  const d = parsearFecha(valor)
  if (!d || isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function abrirModalEditar(reserva) {
  mostrarCambioHab.value              = false
  habSeleccionadaEditar.value         = null
  habitacionesDisponiblesEditar.value = []
  errorEditar.value                   = ''

  editar.value = {
    id:                   reserva.id,
    idHabitacion:         null,               // null = mantener la actual
    fechaEntrada:         parsearFechaISO(reserva.fechaEntrada),
    fechaSalida:          parsearFechaISO(reserva.fechaSalida),
    formaPago:            reserva.formaPago,
    observaciones:        reserva.observaciones || '',
    nombreHuesped:        reserva.nombreHuesped || '',
    apellidoHuesped:      reserva.apellidoHuesped || '',
    telefonoHuesped:      reserva.telefonoHuesped || '',
    emailHuesped:         reserva.emailHuesped || '',
    // Datos de referencia (solo lectura)
    tipoHabitacionActual:   reserva.tipoHabitacion,
    numeroHabitacionActual: reserva.numeroHabitacion,
    precioNocheActual:      reserva.noches > 0
      ? Math.round(Number(reserva.valorTotal) / reserva.noches)
      : 0
  }
  modalEditar.value = true
}

async function guardarEdicion() {
  guardandoEditar.value = true
  errorEditar.value     = ''
  try {
    const payload = {
      fechaEntrada:    editar.value.fechaEntrada  || null,
      fechaSalida:     editar.value.fechaSalida   || null,
      formaPago:       editar.value.formaPago     || null,
      observaciones:   editar.value.observaciones || null,
      idHabitacion:    editar.value.idHabitacion  || null,
      nombreHuesped:   editar.value.nombreHuesped   || null,
      apellidoHuesped: editar.value.apellidoHuesped || null,
      telefonoHuesped: editar.value.telefonoHuesped || null,
      emailHuesped:    editar.value.emailHuesped    || null,
    }
    await reservaService.editar(editar.value.id, payload)
    modalEditar.value = false
    await cargarReservas()
  } catch (e) {
    errorEditar.value = e.response?.data?.error || 'Error al guardar los cambios'
  } finally { guardandoEditar.value = false }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

// ── Formateo ─────────────────────────────────────────────────
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

.main-content { margin-left: 200px; flex: 1; padding: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.35rem; font-weight: 700; color: var(--color-gray-800); }
.btn-primary { background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius); padding: 0.55rem 1.25rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
.btn-primary:hover { background: #1d4ed8; }

.filtros { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; }
.filtro-select { padding: 0.45rem 0.85rem; border: 1px solid var(--color-gray-200); border-radius: var(--radius); font-size: 0.875rem; background: #fff; outline: none; cursor: pointer; }
.total-label { font-size: 0.82rem; color: var(--color-gray-400); }

.tabla-wrapper { background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow-x: auto; }
.tabla { width: 100%; border-collapse: collapse; font-size: 0.83rem; min-width: 1000px; }
.tabla thead th { text-align: left; padding: 0.75rem 0.9rem; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-gray-400); background: var(--color-gray-50); border-bottom: 1px solid var(--color-gray-100); white-space: nowrap; }
.tabla tbody td { padding: 0.7rem 0.9rem; border-bottom: 1px solid var(--color-gray-50); color: var(--color-gray-700); vertical-align: middle; }
.tabla tbody tr:last-child td { border-bottom: none; }
.tabla tbody tr:hover { background: #f8fafc; }
.col-id { color: var(--color-gray-400) !important; font-size: 0.75rem; }
.col-center { text-align: center; }
.col-total { font-weight: 600; color: var(--color-primary); }
.sub-txt { font-size: 0.72rem; color: var(--color-gray-400); }
.estado-cargando, .estado-vacio { text-align: center; padding: 3rem; color: var(--color-gray-400); }

.badge { display: inline-block; padding: 0.2rem 0.65rem; border-radius: 20px; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
.badge.pendiente  { background: #fef3c7; color: #92400e; }
.badge.confirmada { background: #dbeafe; color: #1e40af; }
.badge.en_curso   { background: #d1fae5; color: #065f46; }
.badge.completada { background: #f3f4f6; color: #374151; }
.badge.cancelada  { background: #fee2e2; color: #991b1b; }

.factura-btns { display: flex; gap: 4px; }
.btn-factura { width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--color-gray-200); background: #fff; color: var(--color-gray-600); font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.btn-factura:hover { border-color: var(--color-primary); color: var(--color-primary); }
.btn-factura.descargar { background: var(--color-primary); color: #fff; border-color: var(--color-primary); font-weight: 700; }
.btn-factura:disabled { opacity: 0.5; cursor: not-allowed; }

.acciones { display: flex; gap: 4px; flex-wrap: wrap; }
.btn-sm { padding: 0.25rem 0.6rem; border-radius: 6px; border: none; font-size: 0.72rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-sm.editar    { background: #f3e8ff; color: #7c3aed; font-size: 0.85rem; padding: 0.2rem 0.55rem; }
.btn-sm.editar:hover { background: #ede9fe; }
.btn-sm.confirmar { background: #dbeafe; color: #1e40af; }
.btn-sm.checkin   { background: #d1fae5; color: #065f46; }
.btn-sm.checkout  { background: #f3f4f6; color: #374151; }
.btn-sm.cancelar  { background: #fee2e2; color: #991b1b; }
.btn-sm.eliminar  { background: #1e293b; color: #fff; }

/* Modales */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-factura { background: #fff; border-radius: 16px; width: 100%; max-width: 720px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 680px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.1rem 1.5rem; border-bottom: 1px solid var(--color-gray-100); flex-shrink: 0; }
.modal-header h2 { font-size: 1rem; font-weight: 700; color: var(--color-gray-800); margin: 0 0 2px; }
.modal-subtitulo { font-size: 0.75rem; color: var(--color-gray-400); margin: 0; }
.modal-titulo { font-size: 1rem; font-weight: 700; color: var(--color-gray-800); }
.modal-close { background: none; border: none; font-size: 1.1rem; color: var(--color-gray-400); cursor: pointer; padding: 4px 8px; border-radius: 6px; flex-shrink: 0; }
.modal-close:hover { background: var(--color-gray-100); }
.id-tag { font-size: 0.85rem; font-weight: 500; color: var(--color-primary); background: #dbeafe; padding: 2px 8px; border-radius: 6px; margin-left: 6px; }
.modal-body-scroll { flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid var(--color-gray-100); flex-shrink: 0; }

.modal-seccion { margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--color-gray-100); }
.modal-seccion:last-of-type { border-bottom: none; margin-bottom: 0; }
.seccion-titulo { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-800); margin-bottom: 1rem; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0.85rem; }
.form-group { display: flex; flex-direction: column; gap: 0.3rem; }
.form-group label { font-size: 0.78rem; font-weight: 600; color: var(--color-gray-600); }
.form-group input, .form-group select { padding: 0.5rem 0.75rem; border: 1px solid var(--color-gray-200); border-radius: var(--radius); font-size: 0.875rem; color: var(--color-gray-800); background: #fff; outline: none; transition: border-color 0.15s; }
.form-group input:focus, .form-group select:focus { border-color: var(--color-primary); }

/* Habitación actual en editar */
.hab-actual { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0.9rem; background: var(--color-gray-50); border: 1px solid var(--color-gray-200); border-radius: var(--radius); margin-top: 0.75rem; flex-wrap: wrap; }
.hab-actual-label { font-size: 0.75rem; color: var(--color-gray-400); }
.hab-actual-valor { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-800); flex: 1; }
.btn-cambiar-hab { padding: 0.3rem 0.75rem; background: #f3e8ff; color: #7c3aed; border: none; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
.btn-cambiar-hab:hover { background: #ede9fe; }

.habitaciones-lista { display: flex; flex-direction: column; gap: 0.5rem; max-height: 180px; overflow-y: auto; }
.hab-opcion { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 1rem; border: 1px solid var(--color-gray-200); border-radius: var(--radius); cursor: pointer; transition: all 0.15s; }
.hab-opcion:hover { border-color: var(--color-primary); background: #eff6ff; }
.hab-opcion.seleccionada { border-color: var(--color-primary); background: #dbeafe; }
.hab-opcion-info { display: flex; flex-direction: column; gap: 2px; }
.hab-tipo { font-size: 0.875rem; font-weight: 500; color: var(--color-gray-800); }
.hab-precio { font-size: 0.875rem; font-weight: 700; color: var(--color-primary); }
.resumen-seleccion { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.9rem; background: #f0fdf4; border: 1px solid #86efac; border-radius: var(--radius); font-size: 0.82rem; color: #166534; }
.resumen-seleccion strong { color: var(--color-primary); }
.buscando-texto { font-size: 0.82rem; color: var(--color-gray-400); padding: 0.5rem 0; }
.sin-disponibilidad { font-size: 0.82rem; color: var(--color-danger); padding: 0.5rem 0; }

.error-msg { padding: 0.65rem 1rem; background: #fee2e2; border: 1px solid #fca5a5; border-radius: var(--radius); font-size: 0.82rem; color: #991b1b; margin-top: 0.75rem; }
.factura-preview-inner { padding: 0; }

.btn-secundario { padding: 0.55rem 1.25rem; border: 1px solid var(--color-gray-200); background: #fff; color: var(--color-gray-600); border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; }
.btn-primario { padding: 0.55rem 1.5rem; background: var(--color-primary); color: #fff; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
.btn-primario:hover { background: #1d4ed8; }
.btn-primario:disabled { opacity: 0.5; cursor: not-allowed; }

.mini-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.7s linear infinite; }
.mini-spinner.blanco { border-color: rgba(255,255,255,0.3); border-top-color: #fff; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) { .sidebar { display: none; } .main-content { margin-left: 0; padding: 1rem; } .form-row { grid-template-columns: 1fr; } }
</style>