<template>
  <div class="dashboard-layout">

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-brand">Hotel Manager</div>
      <nav class="sidebar-nav">
        <RouterLink to="/reportes"     class="nav-item" active-class="active">Reportes</RouterLink>
        <RouterLink to="/dashboard"    class="nav-item" active-class="active">Dashboard</RouterLink>
        <RouterLink to="/reservas"     class="nav-item" active-class="active">Reservas</RouterLink>
        <RouterLink to="/huespedes"    class="nav-item" active-class="active">Huéspedes</RouterLink>
        <RouterLink to="/habitaciones" class="nav-item" active-class="active">Habitaciones</RouterLink>
      </nav>
      <div class="sidebar-footer">
        <div class="usuario-nombre">{{ authStore.nombreUsuario }}</div>
        <button class="btn-logout" @click="handleLogout">Cerrar sesión</button>
      </div>
    </aside>

    <main class="main-content">
      <div class="page-header">
        <h1>Reservas</h1>
        <button class="btn-primary" @click="abrirModal">+ Nueva reserva</button>
      </div>

      <!-- FILTROS -->
      <div class="filtros">
        <select v-model="filtroEstado" @change="filtrar">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="en_curso">En curso</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="reservasFiltradas.length === 0">
              <td colspan="9" class="estado-vacio">No hay reservas</td>
            </tr>
            <tr v-for="r in reservasFiltradas" :key="r.id">
              <td>#{{ r.id }}</td>
              <td>{{ r.tipoHabitacion }} — {{ r.numeroHabitacion }}</td>
              <td>{{ r.nombreHuesped }} {{ r.apellidoHuesped }}</td>
              <td>{{ r.fechaEntrada }}</td>
              <td>{{ r.fechaSalida }}</td>
              <td>{{ r.noches }}</td>
              <td>${{ formatPrecio(r.valorTotal) }}</td>
              <td><span :class="['badge', r.estadoReserva]">{{ r.estadoReserva }}</span></td>
              <td class="acciones">
                <button class="btn-sm" @click="cambiarEstado(r.id, 'confirmada')" v-if="r.estadoReserva === 'pendiente'">Confirmar</button>
                <button class="btn-sm" @click="cambiarEstado(r.id, 'en_curso')" v-if="r.estadoReserva === 'confirmada'">Check-in</button>
                <button class="btn-sm btn-success" @click="cambiarEstado(r.id, 'completada')" v-if="r.estadoReserva === 'en_curso'">Check-out</button>
                <button class="btn-sm btn-danger" @click="cambiarEstado(r.id, 'cancelada')" v-if="['pendiente','confirmada'].includes(r.estadoReserva)">Cancelar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- ─── MODAL NUEVA RESERVA ─── -->
    <div v-if="modalAbierto" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal">

        <div class="modal-header">
          <h2>Nueva reserva presencial</h2>
          <button class="modal-cerrar" @click="cerrarModal">✕</button>
        </div>

        <div class="modal-body">

          <!-- PASO 1: Buscar habitación -->
          <div class="modal-seccion">
            <h3 class="seccion-titulo">1. Seleccionar habitación</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Check-in</label>
                <input type="date" v-model="nueva.fechaEntrada" :min="hoy" @change="buscarHabitaciones" />
              </div>
              <div class="form-group">
                <label>Check-out</label>
                <input type="date" v-model="nueva.fechaSalida" :min="nueva.fechaEntrada || hoy" @change="buscarHabitaciones" />
              </div>
            </div>

            <div v-if="buscandoHabs" class="buscando-texto">Buscando habitaciones...</div>

            <div v-if="habitacionesDisponibles.length > 0" class="habitaciones-lista">
              <div
                v-for="hab in habitacionesDisponibles"
                :key="hab.id"
                class="hab-opcion"
                :class="{ seleccionada: nueva.idHabitacion === hab.id }"
                @click="seleccionarHabitacion(hab)"
              >
                <div class="hab-opcion-info">
                  <span class="hab-tipo">{{ hab.tipo }} — Hab. {{ hab.numero }}</span>
                  <span class="hab-piso">Piso {{ hab.piso }} · {{ hab.capacidad }} persona(s)</span>
                </div>
                <span class="hab-precio">${{ formatPrecio(hab.precioNoche) }}/noche</span>
              </div>
            </div>

            <div v-if="nueva.fechaEntrada && nueva.fechaSalida && habitacionesDisponibles.length === 0 && !buscandoHabs" class="sin-disponibilidad">
              No hay habitaciones disponibles para esas fechas
            </div>
          </div>

          <!-- Resumen selección -->
          <div v-if="nueva.idHabitacion && totalNueva > 0" class="resumen-seleccion">
            <span>{{ habitacionSeleccionada?.tipo }} — Hab. {{ habitacionSeleccionada?.numero }}</span>
            <span class="resumen-total">Total: <strong>${{ formatPrecio(totalNueva) }}</strong></span>
          </div>

          <!-- PASO 2: Datos del huésped -->
          <div class="modal-seccion" v-if="nueva.idHabitacion">
            <h3 class="seccion-titulo">2. Datos del huésped</h3>

            <div class="form-row">
              <div class="form-group">
                <label>Nombre *</label>
                <input type="text" v-model="nueva.huesped.nombre" placeholder="Juan" required />
              </div>
              <div class="form-group">
                <label>Apellido *</label>
                <input type="text" v-model="nueva.huesped.apellido" placeholder="Pérez" required />
              </div>
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
              <div class="form-group">
                <label>Número de documento *</label>
                <input type="text" v-model="nueva.huesped.numeroDocumento" placeholder="1234567890" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Fecha de nacimiento *</label>
                <input type="date" v-model="nueva.huesped.fechaNacimiento" />
              </div>
              <div class="form-group">
                <label>Nacionalidad *</label>
                <input type="text" v-model="nueva.huesped.nacionalidad" placeholder="Colombiano/a" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Teléfono *</label>
                <input type="tel" v-model="nueva.huesped.telefono" placeholder="3001234567" />
              </div>
              <div class="form-group">
                <label>Email (opcional)</label>
                <input type="email" v-model="nueva.huesped.email" placeholder="juan@email.com" />
              </div>
            </div>
          </div>

          <!-- PASO 3: Pago -->
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
              <div class="form-group">
                <label>Observaciones (opcional)</label>
                <input type="text" v-model="nueva.observaciones" placeholder="Llegada tarde, cama extra..." />
              </div>
            </div>
          </div>

          <div v-if="errorModal" class="error-msg">⚠ {{ errorModal }}</div>

        </div>

        <div class="modal-footer">
          <button class="btn-cancelar" @click="cerrarModal">Cancelar</button>
          <button
            class="btn-primary"
            @click="crearReserva"
            :disabled="guardando || !formularioValido"
          >
            {{ guardando ? 'Guardando...' : `Confirmar reserva — $${formatPrecio(totalNueva)}` }}
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

const router    = useRouter()
const authStore = useAuthStore()

const reservas     = ref([])
const cargando     = ref(true)
const filtroEstado = ref('')

// Modal
const modalAbierto           = ref(false)
const buscandoHabs           = ref(false)
const habitacionesDisponibles = ref([])
const habitacionSeleccionada  = ref(null)
const guardando              = ref(false)
const errorModal             = ref('')

const hoy = computed(() => new Date().toISOString().split('T')[0])

const nueva = ref(resetForm())

function resetForm() {
  return {
    idHabitacion:  null,
    fechaEntrada:  '',
    fechaSalida:   '',
    formaPago:     '',
    observaciones: '',
    huesped: {
      nombre: '', apellido: '', fechaNacimiento: '',
      nacionalidad: '', telefono: '', email: '',
      tipoDocumento: 'cc', numeroDocumento: ''
    }
  }
}

const totalNueva = computed(() => {
  if (!habitacionSeleccionada.value || !nueva.value.fechaEntrada || !nueva.value.fechaSalida) return 0
  const noches = Math.max(0,
    (new Date(nueva.value.fechaSalida) - new Date(nueva.value.fechaEntrada)) / 86400000
  )
  return habitacionSeleccionada.value.precioNoche * noches
})

const formularioValido = computed(() => {
  const h = nueva.value.huesped
  return (
    nueva.value.idHabitacion &&
    nueva.value.fechaEntrada &&
    nueva.value.fechaSalida &&
    nueva.value.formaPago &&
    h.nombre && h.apellido &&
    h.numeroDocumento && h.fechaNacimiento &&
    h.nacionalidad && h.telefono
  )
})

const reservasFiltradas = computed(() => {
  if (!filtroEstado.value) return reservas.value
  return reservas.value.filter(r => r.estadoReserva === filtroEstado.value)
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
    alert('Error al cambiar estado: ' + (e.response?.data?.error || e.message))
  }
}

function filtrar() {}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function formatPrecio(v) {
  return Number(v || 0).toLocaleString('es-CO')
}

// ─── MODAL ───
function abrirModal() {
  nueva.value    = resetForm()
  habitacionesDisponibles.value = []
  habitacionSeleccionada.value  = null
  errorModal.value = ''
  modalAbierto.value = true
}

function cerrarModal() {
  modalAbierto.value = false
}

async function buscarHabitaciones() {
  if (!nueva.value.fechaEntrada || !nueva.value.fechaSalida) return
  if (nueva.value.fechaSalida <= nueva.value.fechaEntrada) return

  buscandoHabs.value = true
  nueva.value.idHabitacion = null
  habitacionSeleccionada.value = null
  try {
    const res = await habitacionService.listarDisponibles(
      nueva.value.fechaEntrada,
      nueva.value.fechaSalida
    )
    habitacionesDisponibles.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    buscandoHabs.value = false
  }
}

function seleccionarHabitacion(hab) {
  nueva.value.idHabitacion = hab.id
  habitacionSeleccionada.value = hab
}

async function crearReserva() {
  if (!formularioValido.value) return
  guardando.value  = true
  errorModal.value = ''
  try {
    await reservaService.crear(nueva.value)
    cerrarModal()
    await cargarReservas()
  } catch (e) {
    errorModal.value = e.response?.data?.error || 'Error al crear la reserva'
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
.dashboard-layout { display: flex; min-height: 100vh; }
.sidebar { width:240px; background:#1e293b; color:#fff; display:flex; flex-direction:column; flex-shrink:0; }
.sidebar-brand { padding:1.5rem 1.25rem; font-size:1.1rem; font-weight:700; border-bottom:1px solid rgba(255,255,255,0.1); }
.sidebar-nav { flex:1; padding:1rem 0; display:flex; flex-direction:column; gap:0.25rem; }
.nav-item { display:block; padding:0.7rem 1.25rem; color:rgba(255,255,255,0.7); font-size:0.9rem; transition:all 0.2s; border-left:3px solid transparent; }
.nav-item:hover { background:rgba(255,255,255,0.08); color:#fff; }
.nav-item.active { background:rgba(37,99,235,0.3); color:#fff; border-left-color:var(--color-primary); }
.sidebar-footer { padding:1rem 1.25rem; border-top:1px solid rgba(255,255,255,0.1); }
.usuario-nombre { font-size:0.875rem; font-weight:500; color:#fff; margin-bottom:0.75rem; }
.btn-logout { width:100%; background:rgba(220,38,38,0.15); color:#fca5a5; border:1px solid rgba(220,38,38,0.3); border-radius:var(--radius); padding:0.5rem; font-size:0.825rem; }
.btn-logout:hover { background:rgba(220,38,38,0.3); }
.main-content { flex:1; padding:2rem; overflow-y:auto; }
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
.page-header h1 { font-size:1.5rem; font-weight:700; color:var(--color-gray-800); }
.btn-primary { background:var(--color-primary); color:#fff; border:none; border-radius:var(--radius); padding:0.6rem 1.25rem; font-size:0.875rem; font-weight:500; cursor:pointer; }
.btn-primary:hover:not(:disabled) { background:var(--color-primary-dark); }
.btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
.filtros { margin-bottom:1.25rem; }
.filtros select { padding:0.5rem 0.85rem; border:1px solid var(--color-gray-200); border-radius:var(--radius); font-size:0.875rem; color:var(--color-gray-800); background:#fff; outline:none; }
.estado-cargando { text-align:center; padding:2rem; color:var(--color-gray-400); }
.tabla-wrapper { background:#fff; border-radius:var(--radius-lg); box-shadow:var(--shadow-sm); overflow-x:auto; }
.tabla { width:100%; border-collapse:collapse; font-size:0.875rem; }
.tabla th { text-align:left; padding:0.6rem 0.75rem; background:var(--color-gray-50); color:var(--color-gray-600); font-weight:500; font-size:0.8rem; border-bottom:1px solid var(--color-gray-200); }
.tabla td { padding:0.75rem; border-bottom:1px solid var(--color-gray-100); color:var(--color-gray-800); }
.estado-vacio { text-align:center; color:var(--color-gray-400); padding:2rem; }
.badge { display:inline-block; padding:0.25rem 0.6rem; border-radius:20px; font-size:0.75rem; font-weight:500; }
.badge.pendiente { background:#fef3c7; color:#92400e; }
.badge.confirmada { background:#dbeafe; color:#1e40af; }
.badge.en_curso { background:#dcfce7; color:#166534; }
.badge.completada { background:#f1f5f9; color:#475569; }
.badge.cancelada { background:#fee2e2; color:#991b1b; }
.acciones { display:flex; gap:0.4rem; flex-wrap:wrap; }
.btn-sm { background:var(--color-primary); color:#fff; border:none; border-radius:var(--radius); padding:0.3rem 0.65rem; font-size:0.775rem; font-weight:500; cursor:pointer; }
.btn-sm:hover { background:var(--color-primary-dark); }
.btn-sm.btn-success { background:var(--color-success); }
.btn-sm.btn-success:hover { background:#15803d; }
.btn-sm.btn-danger { background:var(--color-danger); }
.btn-sm.btn-danger:hover { background:#b91c1c; }

/* ─── MODAL ─── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: #fff;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-gray-200);
  flex-shrink: 0;
}

.modal-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-gray-800);
}

.modal-cerrar {
  background: transparent;
  border: none;
  font-size: 1rem;
  color: var(--color-gray-400);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius);
}

.modal-cerrar:hover { background: var(--color-gray-100); color: var(--color-gray-800); }

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-seccion {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.seccion-titulo {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gray-800);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-gray-100);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-group label {
  font-size: 0.775rem;
  font-weight: 500;
  color: var(--color-gray-600);
}

.form-group input,
.form-group select {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius);
  font-size: 0.875rem;
  color: var(--color-gray-800);
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus { border-color: var(--color-primary); }

/* Habitaciones disponibles */
.buscando-texto { font-size:0.85rem; color:var(--color-gray-400); text-align:center; padding:0.5rem; }

.habitaciones-lista {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.hab-opcion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
}

.hab-opcion:hover { border-color: var(--color-primary); background: #f0f7ff; }

.hab-opcion.seleccionada {
  border-color: var(--color-primary);
  background: #eff6ff;
}

.hab-opcion-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.hab-tipo { font-size:0.875rem; font-weight:600; color:var(--color-gray-800); }
.hab-piso { font-size:0.75rem; color:var(--color-gray-400); }
.hab-precio { font-size:0.875rem; font-weight:700; color:var(--color-primary); }

.sin-disponibilidad { font-size:0.85rem; color:var(--color-danger); text-align:center; padding:0.5rem; }

.resumen-seleccion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: var(--radius);
  font-size: 0.875rem;
  color: var(--color-gray-800);
}

.resumen-total strong { color: var(--color-primary); font-size:1rem; }

.error-msg {
  background: #fef2f2;
  color: var(--color-danger);
  border: 1px solid #fecaca;
  border-radius: var(--radius);
  padding: 0.6rem 1rem;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-gray-200);
  flex-shrink: 0;
}

.btn-cancelar {
  background: transparent;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius);
  padding: 0.6rem 1.25rem;
  font-size: 0.875rem;
  color: var(--color-gray-600);
  cursor: pointer;
}

.btn-cancelar:hover { background: var(--color-gray-100); }

@media (max-width: 600px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>