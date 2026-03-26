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
        <h1>Habitaciones</h1>
      </div>

      <div v-if="cargando" class="estado-cargando">Cargando...</div>

      <div v-else class="habitaciones-grid">
        <div
          v-for="hab in habitaciones"
          :key="hab.id"
          class="hab-card"
          :class="hab.estado"
        >
          <div class="hab-card-header">
            <span class="hab-numero">Nro. {{ hab.numero }}</span>
            <span :class="['badge-estado', hab.estado]">{{ hab.estado }}</span>
          </div>
          <div class="hab-card-body">
            <div class="hab-tipo">{{ hab.tipo }}</div>
            <div class="hab-info">Piso {{ hab.piso }} · {{ hab.capacidad }} persona(s)</div>
            <div class="hab-precio">${{ formatPrecio(hab.precioNoche) }} / noche</div>
          </div>
          <div class="hab-card-footer">
            <select
              :value="hab.estado"
              @change="cambiarEstado(hab.id, $event.target.value)"
              class="select-estado"
            >
              <option value="disponible">Disponible</option>
              <option value="ocupada">Ocupada</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="fuera_de_servicio">Fuera de servicio</option>
            </select>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { habitacionService } from '../../api/services'

const router    = useRouter()
const authStore = useAuthStore()
const habitaciones = ref([])
const cargando     = ref(true)

onMounted(async () => {
  try {
    const res = await habitacionService.listarTodas()
    habitaciones.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
})

async function cambiarEstado(id, nuevoEstado) {
  try {
    const res = await habitacionService.cambiarEstado(id, nuevoEstado)
    const idx = habitaciones.value.findIndex(h => h.id === id)
    if (idx !== -1) habitaciones.value[idx] = res.data
  } catch (e) {
    alert('Error al cambiar estado')
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function formatPrecio(v) {
  return Number(v || 0).toLocaleString('es-CO')
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
.estado-cargando { text-align:center; padding:3rem; color:var(--color-gray-400); }
.habitaciones-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(220px,1fr)); gap:1rem; }
.hab-card { background:#fff; border-radius:var(--radius-lg); box-shadow:var(--shadow-sm); border:1px solid var(--color-gray-200); overflow:hidden; }
.hab-card-header { display:flex; justify-content:space-between; align-items:center; padding:0.85rem 1rem; background:var(--color-gray-50); border-bottom:1px solid var(--color-gray-100); }
.hab-numero { font-weight:600; font-size:0.9rem; color:var(--color-gray-800); }
.badge-estado { font-size:0.7rem; padding:0.2rem 0.5rem; border-radius:20px; font-weight:500; }
.badge-estado.disponible   { background:#dcfce7; color:#166534; }
.badge-estado.ocupada      { background:#fee2e2; color:#991b1b; }
.badge-estado.mantenimiento { background:#fef3c7; color:#92400e; }
.badge-estado.fuera_de_servicio { background:#f1f5f9; color:#475569; }
.hab-card-body { padding:1rem; }
.hab-tipo { font-weight:600; font-size:0.95rem; color:var(--color-gray-800); margin-bottom:0.35rem; }
.hab-info { font-size:0.8rem; color:var(--color-gray-400); margin-bottom:0.35rem; }
.hab-precio { font-size:0.875rem; font-weight:500; color:var(--color-primary); }
.hab-card-footer { padding:0.75rem 1rem; border-top:1px solid var(--color-gray-100); }
.select-estado { width:100%; padding:0.45rem 0.75rem; border:1px solid var(--color-gray-200); border-radius:var(--radius); font-size:0.825rem; color:var(--color-gray-800); background:#fff; outline:none; }
.select-estado:focus { border-color:var(--color-primary); }
</style>