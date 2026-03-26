<template>
  <div class="usuarios">

    <!-- TABS -->
    <div class="tabs">
      <button :class="['tab', { active: vistaActiva === 'lista' }]" @click="vistaActiva = 'lista'">
        Usuarios
      </button>
      <button :class="['tab', { active: vistaActiva === 'crear' }]" @click="vistaActiva = 'crear'">
        + Nuevo
      </button>
    </div>

    <!-- ======================== LISTA ======================== -->
    <div v-if="vistaActiva === 'lista'">
      <div v-if="cargando" class="estado-cargando">Cargando usuarios...</div>

      <div v-else class="usuarios-lista">
        <div
          v-for="u in usuarios"
          :key="u.id"
          class="usuario-card"
          :class="{ bloqueado: !u.activo }"
        >
          <div class="usuario-header">
            <div class="usuario-avatar">{{ iniciales(u.nombre) }}</div>
            <div class="usuario-info">
              <div class="usuario-nombre">{{ u.nombre }}</div>
              <div class="usuario-email">{{ u.email }}</div>
            </div>
            <div class="usuario-badges">
              <span :class="['rol-badge', u.rol]">{{ u.rol }}</span>
              <span v-if="!u.activo" class="badge-bloqueado">Bloqueado</span>
            </div>
          </div>

          <!-- Acciones -->
          <div class="usuario-acciones">
            <button class="btn-accion editar" @click="abrirEditar(u)">
              Editar
            </button>
            <button
              class="btn-accion"
              :class="u.activo ? 'bloquear' : 'activar'"
              @click="toggleEstado(u)"
            >
              {{ u.activo ? 'Bloquear' : 'Activar' }}
            </button>
            <button
              class="btn-accion eliminar"
              @click="confirmarEliminar(u)"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================== CREAR ======================== -->
    <div v-if="vistaActiva === 'crear'" class="form-card">
      <div class="form-titulo">Crear nuevo usuario</div>
      <form @submit.prevent="handleCrear">
        <div class="field">
          <label>Nombre</label>
          <input v-model="formCrear.nombre" type="text" placeholder="Juan Pérez" required :disabled="creando"/>
        </div>
        <div class="field">
          <label>Email</label>
          <input v-model="formCrear.email" type="email" placeholder="juan@hotelmanager.co" required :disabled="creando"/>
        </div>
        <div class="field">
          <label>Contraseña</label>
          <input v-model="formCrear.password" type="password" placeholder="Mínimo 6 caracteres" required :disabled="creando"/>
        </div>
        <div class="field">
          <label>Rol</label>
          <select v-model="formCrear.rol">
            <option value="empleado">Empleado</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div v-if="errorCrear" class="error-msg">{{ errorCrear }}</div>
        <div v-if="exitoCrear" class="exito-msg">Usuario creado correctamente</div>
        <button type="submit" class="btn-submit" :disabled="creando">
          {{ creando ? 'Creando...' : 'Crear usuario' }}
        </button>
      </form>
    </div>

    <!-- ======================== MODAL EDITAR ======================== -->
    <div v-if="usuarioEditando" class="modal-overlay" @click.self="cerrarEditar">
      <div class="modal">
        <div class="modal-titulo">Editar — {{ usuarioEditando.nombre }}</div>

        <form @submit.prevent="handleEditar">
          <div class="field">
            <label>Nombre</label>
            <input v-model="formEditar.nombre" type="text" placeholder="Dejar vacío para no cambiar"/>
          </div>
          <div class="field">
            <label>Email</label>
            <input v-model="formEditar.email" type="email" placeholder="Dejar vacío para no cambiar"/>
          </div>
          <div class="field">
            <label>Nueva contraseña</label>
            <input v-model="formEditar.password" type="password" placeholder="Dejar vacío para no cambiar"/>
          </div>

          <div v-if="errorEditar" class="error-msg">{{ errorEditar }}</div>

          <div class="modal-botones">
            <button type="button" class="btn-cancelar" @click="cerrarEditar">Cancelar</button>
            <button type="submit" class="btn-submit" :disabled="editando">
              {{ editando ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ======================== MODAL ELIMINAR ======================== -->
    <div v-if="usuarioAEliminar" class="modal-overlay" @click.self="usuarioAEliminar = null">
      <div class="modal">
        <div class="modal-titulo">Eliminar usuario</div>
        <p class="modal-texto">
          ¿Estás seguro de eliminar a <strong>{{ usuarioAEliminar.nombre }}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div class="modal-botones">
          <button class="btn-cancelar" @click="usuarioAEliminar = null">Cancelar</button>
          <button class="btn-eliminar-confirm" @click="handleEliminar" :disabled="eliminando">
            {{ eliminando ? 'Eliminando...' : 'Sí, eliminar' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/axios'

const vistaActiva    = ref('lista')
const usuarios       = ref([])
const cargando       = ref(true)

// Crear
const formCrear  = ref({ nombre: '', email: '', password: '', rol: 'empleado' })
const creando    = ref(false)
const errorCrear = ref('')
const exitoCrear = ref(false)

// Editar
const usuarioEditando = ref(null)
const formEditar      = ref({ nombre: '', email: '', password: '' })
const editando        = ref(false)
const errorEditar     = ref('')

// Eliminar
const usuarioAEliminar = ref(null)
const eliminando       = ref(false)

onMounted(cargarUsuarios)

async function cargarUsuarios() {
  cargando.value = true
  try {
    const res = await api.get('/usuarios')
    usuarios.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

// CREAR
async function handleCrear() {
  creando.value    = true
  errorCrear.value = ''
  exitoCrear.value = false
  try {
    await api.post('/usuarios', formCrear.value)
    exitoCrear.value = true
    formCrear.value  = { nombre: '', email: '', password: '', rol: 'empleado' }
    await cargarUsuarios()
    setTimeout(() => {
      exitoCrear.value = false
      vistaActiva.value = 'lista'
    }, 1500)
  } catch (e) {
    errorCrear.value = e.response?.data?.error || 'Error al crear el usuario'
  } finally {
    creando.value = false
  }
}

// EDITAR
function abrirEditar(u) {
  usuarioEditando.value = u
  formEditar.value = { nombre: '', email: '', password: '' }
  errorEditar.value = ''
}

function cerrarEditar() {
  usuarioEditando.value = null
}

async function handleEditar() {
  editando.value    = true
  errorEditar.value = ''

  // Solo envía campos que no estén vacíos
  const cambios = {}
  if (formEditar.value.nombre.trim())   cambios.nombre   = formEditar.value.nombre.trim()
  if (formEditar.value.email.trim())    cambios.email    = formEditar.value.email.trim()
  if (formEditar.value.password.trim()) cambios.password = formEditar.value.password.trim()

  if (Object.keys(cambios).length === 0) {
    errorEditar.value = 'No hay cambios para guardar'
    editando.value = false
    return
  }

  try {
    await api.patch(`/usuarios/${usuarioEditando.value.id}`, cambios)
    await cargarUsuarios()
    cerrarEditar()
  } catch (e) {
    errorEditar.value = e.response?.data?.error || 'Error al editar el usuario'
  } finally {
    editando.value = false
  }
}

// BLOQUEAR / ACTIVAR
async function toggleEstado(u) {
  try {
    await api.patch(`/usuarios/${u.id}/estado`, null, {
      params: { activo: !u.activo }
    })
    await cargarUsuarios()
  } catch (e) {
    alert('Error al cambiar estado del usuario')
  }
}

// ELIMINAR
function confirmarEliminar(u) {
  usuarioAEliminar.value = u
}

async function handleEliminar() {
  eliminando.value = true
  try {
    await api.delete(`/usuarios/${usuarioAEliminar.value.id}`)
    usuarioAEliminar.value = null
    await cargarUsuarios()
  } catch (e) {
    alert('Error al eliminar el usuario')
  } finally {
    eliminando.value = false
  }
}

function iniciales(nombre) {
  return nombre
    ? nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'
}
</script>

<style scoped>
.usuarios { padding: 1rem 1rem 0; }

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab {
  flex: 1;
  padding: 0.55rem;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.tab.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.estado-cargando {
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
}

.usuarios-lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.usuario-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: opacity 0.2s;
}

.usuario-card.bloqueado { opacity: 0.65; }

.usuario-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
}

.usuario-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
}

.usuario-info { flex: 1; min-width: 0; }

.usuario-nombre {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.usuario-email {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.usuario-badges {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.rol-badge {
  padding: 0.18rem 0.5rem;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 700;
}

.rol-badge.admin    { background: #ede9fe; color: #5b21b6; }
.rol-badge.empleado { background: #dbeafe; color: #1e40af; }

.badge-bloqueado {
  background: #fee2e2;
  color: var(--danger);
  padding: 0.18rem 0.5rem;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 700;
}

.usuario-acciones {
  display: flex;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border-top: 1px solid #f1f5f9;
}

.btn-accion {
  flex: 1;
  padding: 0.45rem;
  border-radius: var(--radius);
  font-size: 0.775rem;
  font-weight: 600;
  color: #fff;
  transition: opacity 0.2s;
}

.btn-accion:active { opacity: 0.75; }
.btn-accion.editar   { background: var(--primary); }
.btn-accion.bloquear { background: var(--warning); }
.btn-accion.activar  { background: var(--success); }
.btn-accion.eliminar { background: var(--danger); }

/* FORM CREAR */
.form-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow);
}

.form-titulo {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.85rem;
}

.field label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
}

.field input,
.field select {
  padding: 0.7rem 0.9rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.95rem;
  color: var(--text);
  background: var(--bg);
  outline: none;
}

.field input:focus,
.field select:focus { border-color: var(--primary); }

.error-msg {
  background: #fef2f2;
  color: var(--danger);
  border: 1px solid #fecaca;
  border-radius: var(--radius);
  padding: 0.6rem 0.9rem;
  font-size: 0.825rem;
  margin-bottom: 0.75rem;
}

.exito-msg {
  background: #f0fdf4;
  color: var(--success);
  border: 1px solid #bbf7d0;
  border-radius: var(--radius);
  padding: 0.6rem 0.9rem;
  font-size: 0.825rem;
  margin-bottom: 0.75rem;
}

.btn-submit {
  width: 100%;
  background: var(--primary);
  color: #fff;
  border-radius: var(--radius);
  padding: 0.8rem;
  font-size: 0.95rem;
  font-weight: 700;
}

.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

/* MODALES */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  padding: 0 0 env(safe-area-inset-bottom);
}

.modal {
  background: var(--bg-card);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: 1.5rem 1.25rem;
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.modal-texto {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 1.25rem;
}

.modal-botones {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-cancelar {
  flex: 1;
  padding: 0.75rem;
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  background: var(--bg);
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
}

.btn-eliminar-confirm {
  flex: 1;
  padding: 0.75rem;
  border-radius: var(--radius);
  background: var(--danger);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
}

.btn-eliminar-confirm:disabled { opacity: 0.6; }
</style>