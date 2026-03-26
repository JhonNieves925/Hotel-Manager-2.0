<template>
  <div class="dashboard-layout">

    <!-- SIDEBAR reutilizado -->
    <aside class="sidebar">
      <div class="sidebar-brand">Hotel Manager</div>
      <nav class="sidebar-nav">
        <RouterLink to="/reportes" class="nav-item" active-class="active">Reportes</RouterLink>
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
        <RouterLink to="/" class="btn-primary">+ Nueva reserva</RouterLink>
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
                <button
                  class="btn-sm"
                  @click="cambiarEstado(r.id, 'confirmada')"
                  v-if="r.estadoReserva === 'pendiente'"
                >Confirmar</button>
                <button
                  class="btn-sm"
                  @click="cambiarEstado(r.id, 'en_curso')"
                  v-if="r.estadoReserva === 'confirmada'"
                >Check-in</button>
                <button
                  class="btn-sm btn-success"
                  @click="cambiarEstado(r.id, 'completada')"
                  v-if="r.estadoReserva === 'en_curso'"
                >Check-out</button>
                <button
                  class="btn-sm btn-danger"
                  @click="cambiarEstado(r.id, 'cancelada')"
                  v-if="['pendiente','confirmada'].includes(r.estadoReserva)"
                >Cancelar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { reservaService } from '../../api/services'

const router    = useRouter()
const authStore = useAuthStore()

const reservas     = ref([])
const cargando     = ref(true)
const filtroEstado = ref('')

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
.btn-primary { background:var(--color-primary); color:#fff; border-radius:var(--radius); padding:0.6rem 1.25rem; font-size:0.875rem; font-weight:500; }
.btn-primary:hover { background:var(--color-primary-dark); color:#fff; }
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
.btn-sm { background:var(--color-primary); color:#fff; border:none; border-radius:var(--radius); padding:0.3rem 0.65rem; font-size:0.775rem; font-weight:500; }
.btn-sm:hover { background:var(--color-primary-dark); }
.btn-sm.btn-success { background:var(--color-success); }
.btn-sm.btn-success:hover { background:#15803d; }
.btn-sm.btn-danger { background:var(--color-danger); }
.btn-sm.btn-danger:hover { background:#b91c1c; }
</style>