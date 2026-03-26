<template>
  <div class="dashboard-layout">
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
        <h1>Huéspedes</h1>
      </div>

      <!-- BUSCADOR -->
      <div class="buscador">
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por nombre o apellido..."
          @input="buscar"
        />
      </div>

      <div v-if="cargando" class="estado-cargando">Cargando...</div>

      <div v-else class="tabla-wrapper">
        <table class="tabla">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Nacionalidad</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Reserva</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="huespedes.length === 0">
              <td colspan="7" class="estado-vacio">No se encontraron huéspedes</td>
            </tr>
            <tr v-for="h in huespedes" :key="h.id">
              <td>#{{ h.id }}</td>
              <td>{{ h.nombre }} {{ h.apellido }}</td>
              <td>{{ h.tipoDocumento?.toUpperCase() }} {{ h.numeroDocumento }}</td>
              <td>{{ h.nacionalidad }}</td>
              <td>{{ h.telefono }}</td>
              <td>{{ h.email || '—' }}</td>
              <td>#{{ h.reserva?.id || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { huespedService } from '../../api/services'

const router    = useRouter()
const authStore = useAuthStore()

const huespedes = ref([])
const cargando  = ref(true)
const busqueda  = ref('')
let   timer     = null

onMounted(async () => {
  try {
    const res = await huespedService.listarTodos()
    huespedes.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
})

function buscar() {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    cargando.value = true
    try {
      if (busqueda.value.trim()) {
        const res = await huespedService.buscar(busqueda.value)
        huespedes.value = res.data
      } else {
        const res = await huespedService.listarTodos()
        huespedes.value = res.data
      }
    } catch (e) {
      console.error(e)
    } finally {
      cargando.value = false
    }
  }, 400)
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard-layout { display:flex; min-height:100vh; }
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
.page-header { margin-bottom:1.5rem; }
.page-header h1 { font-size:1.5rem; font-weight:700; color:var(--color-gray-800); }
.buscador { margin-bottom:1.25rem; }
.buscador input { width:100%; max-width:400px; padding:0.6rem 1rem; border:1px solid var(--color-gray-200); border-radius:var(--radius); font-size:0.9rem; outline:none; color:var(--color-gray-800); }
.buscador input:focus { border-color:var(--color-primary); }
.estado-cargando { text-align:center; padding:3rem; color:var(--color-gray-400); }
.tabla-wrapper { background:#fff; border-radius:var(--radius-lg); box-shadow:var(--shadow-sm); overflow-x:auto; }
.tabla { width:100%; border-collapse:collapse; font-size:0.875rem; }
.tabla th { text-align:left; padding:0.6rem 0.75rem; background:var(--color-gray-50); color:var(--color-gray-600); font-weight:500; font-size:0.8rem; border-bottom:1px solid var(--color-gray-200); }
.tabla td { padding:0.75rem; border-bottom:1px solid var(--color-gray-100); color:var(--color-gray-800); }
.estado-vacio { text-align:center; color:var(--color-gray-400); padding:2rem; }
</style>