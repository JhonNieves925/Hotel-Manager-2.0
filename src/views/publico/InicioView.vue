<template>
  <div class="inicio-page">

    <!-- NAVBAR -->
    <nav class="navbar">
      <div class="nav-brand">Hotel Manager</div>
      <div class="nav-links">
        <button class="btn-tema" @click="toggleTema" :title="temaOscuro ?
         'Tema claro' : 'Tema oscuro'">{{ temaOscuro ? '☀' : '☾' }}</button>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <h1>Bienvenido a Hotel Manager</h1>
      <p>Encuentra tu habitación ideal y reserva en minutos</p>

      <!-- Buscador de fechas -->
      <div class="buscador">
        <div class="buscador-campo">
          <label>Check-in</label>
          <input
            type="date"
            v-model="fechaEntrada"
            :min="hoy"
            @change="buscarDisponibles"
          />
        </div>
        <div class="buscador-campo">
          <label>Check-out</label>
          <input
            type="date"
            v-model="fechaSalida"
            :min="fechaEntrada || hoy"
            @change="buscarDisponibles"
          />
        </div>
        <button class="btn-buscar" @click="buscarDisponibles" :disabled="cargando">
          {{ cargando ? 'Buscando...' : 'Buscar' }}
        </button>
      </div>
    </section>

    <!-- HABITACIONES DISPONIBLES -->
    <section class="habitaciones-section">
      <div class="container">

        <div v-if="error" class="error-msg">{{ error }}</div>

        <div v-if="!buscado" class="estado-vacio">
          <p>Selecciona tus fechas para ver las habitaciones disponibles</p>
        </div>

        <div v-else-if="habitaciones.length === 0 && !cargando" class="estado-vacio">
          <p>No hay habitaciones disponibles para esas fechas</p>
        </div>

        <div v-else class="habitaciones-grid">
          <div
            v-for="hab in habitaciones"
            :key="hab.id"
            class="habitacion-card"
          >
            <div class="hab-header">
              <span class="hab-tipo">{{ hab.tipo }}</span>
              <span class="hab-numero">Hab. {{ hab.numero }}</span>
            </div>
            <div class="hab-body">
              <p class="hab-descripcion">{{ hab.descripcionTipo }}</p>
              <div class="hab-detalles">
                <span>Piso {{ hab.piso }}</span>
                <span>{{ hab.capacidad }} persona(s)</span>
              </div>
            </div>
            <div class="hab-footer">
              <div class="hab-precio">
                <span class="precio-monto">
                  ${{ formatPrecio(hab.precioNoche) }}
                </span>
                <span class="precio-label">/ noche</span>
              </div>
              <button
                class="btn-reservar"
                @click="irAReservar(hab)"
              >
                Reservar
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { habitacionService } from '../../api/services'


const router = useRouter()
const temaOscuro = ref(false)

const fechaEntrada  = ref('')
const fechaSalida   = ref('')
const habitaciones  = ref([])
const cargando      = ref(false)
const error         = ref('')
const buscado       = ref(false)

const hoy = computed(() => {
  return new Date().toISOString().split('T')[0]
})

async function buscarDisponibles() {
  if (!fechaEntrada.value || !fechaSalida.value) return
  if (fechaSalida.value <= fechaEntrada.value) {
    error.value = 'La fecha de salida debe ser posterior a la entrada'
    return
  }

  cargando.value = true
  error.value    = ''
  buscado.value  = true

  try {
    const res = await habitacionService.listarDisponibles(
      fechaEntrada.value,
      fechaSalida.value
    )
    habitaciones.value = res.data
  } catch (e) {
    error.value = 'Error al buscar habitaciones. Intenta de nuevo.'
  } finally {
    cargando.value = false
  }
}

function irAReservar(habitacion) {
  router.push({
    name: 'reservar',
    query: {
      idHabitacion: habitacion.id,
      entrada: fechaEntrada.value,
      salida: fechaSalida.value
    }
  })
}

function formatPrecio(valor) {
  return Number(valor).toLocaleString('es-CO')
}

onMounted(() => {
  temaOscuro.value = localStorage.getItem('tema') === 'oscuro'
  aplicarTema()
})

function toggleTema() {
  temaOscuro.value = !temaOscuro.value
  localStorage.setItem('tema', temaOscuro.value ? 'oscuro' : 'claro')
  aplicarTema()
}

function aplicarTema() {
  document.documentElement.setAttribute('data-tema', temaOscuro.value ? 'oscuro' : 'claro')
}
</script>

<style scoped>
.inicio-page {
  min-height: 100vh;
}

.btn-tema {
  background: transparent;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius);
  padding: 0.4rem 0.7rem;
  font-size: 0.95rem;
  cursor: pointer;
  color: var(--color-gray-600);
  transition: all 0.2s;
}

.btn-tema:hover {
  background: var(--color-gray-100);
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #fff;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-brand {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-primary);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-nav-app {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  padding: 0.5rem 1.2rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-nav-app:hover {
  background: var(--color-primary);
  color: #fff;
}

.btn-nav {
  background: var(--color-primary);
  color: #fff;
  padding: 0.5rem 1.2rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-nav:hover {
  background: var(--color-primary-dark);
  color: #fff;
}

.hero {
  background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
  color: #fff;
  text-align: center;
  padding: 4rem 2rem 3rem;
}

.hero h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.hero p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.buscador {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: flex-end;
  flex-wrap: wrap;
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: var(--shadow-md);
}

.buscador-campo {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  min-width: 140px;
}

.buscador-campo label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-gray-400);
}

.buscador-campo input {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius);
  font-size: 0.9rem;
  outline: none;
  color: var(#a3a7ad);
}

.buscador-campo input:focus {
  border-color: var(--color-primary);
}

.btn-buscar {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 0.65rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-buscar:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-buscar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.habitaciones-section {
  padding: 2.5rem 1rem;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

.estado-vacio {
  text-align: center;
  padding: 3rem;
  color: var(--color-gray-400);
  font-size: 1rem;
}

.error-msg {
  background: #fef2f2;
  color: var(--color-danger);
  border: 1px solid #fecaca;
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.habitaciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.habitacion-card {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-200);
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.habitacion-card:hover {
  box-shadow: var(--shadow-md);
}

.hab-header {
  background: var(--color-primary);
  color: #fff;
  padding: 0.9rem 1.1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hab-tipo {
  font-weight: 600;
  font-size: 1rem;
}

.hab-numero {
  font-size: 0.8rem;
  opacity: 0.85;
}

.hab-body {
  padding: 1rem 1.1rem;
}

.hab-descripcion {
  color: var(--color-gray-600);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.hab-detalles {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--color-gray-400);
}

.hab-footer {
  padding: 0.9rem 1.1rem;
  border-top: 1px solid var(--color-gray-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hab-precio {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.precio-monto {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-gray-800);
}

.precio-label {
  font-size: 0.8rem;
  color: var(--color-gray-400);
}

.btn-reservar {
  background: var(--color-success);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 0.5rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-reservar:hover {
  background: #15803d;
}
</style>