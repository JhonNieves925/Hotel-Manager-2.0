<template>
  <div class="reservar-page">

    <nav class="navbar">
      <RouterLink to="/" class="nav-brand">Hotel Manager</RouterLink>
      <RouterLink to="/" class="btn-volver">← Volver</RouterLink>
    </nav>

    <div class="container">
      <h2 class="titulo">Completa tu reserva</h2>

      <!-- Resumen de la habitación -->
      <div v-if="habitacion" class="resumen-card">
        <div class="resumen-item">
          <span class="resumen-label">Habitación</span>
          <span class="resumen-valor">{{ habitacion.tipo }} — Nro. {{ habitacion.numero }}</span>
        </div>
        <div class="resumen-item">
          <span class="resumen-label">Check-in</span>
          <span class="resumen-valor">{{ formatFecha(form.fechaEntrada) }}</span>
        </div>
        <div class="resumen-item">
          <span class="resumen-label">Check-out</span>
          <span class="resumen-valor">{{ formatFecha(form.fechaSalida) }}</span>
        </div>
        <div class="resumen-item">
          <span class="resumen-label">Noches</span>
          <span class="resumen-valor">{{ noches }}</span>
        </div>
        <div class="resumen-item total">
          <span class="resumen-label">Total</span>
          <span class="resumen-valor">${{ formatPrecio(total) }}</span>
        </div>
      </div>

      <form @submit.prevent="handleReservar" class="reserva-form">

        <h3>Datos del huésped</h3>

        <div class="form-row">
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="form.huesped.nombre" type="text" required placeholder="Juan" />
          </div>
          <div class="form-group">
            <label>Apellido</label>
            <input v-model="form.huesped.apellido" type="text" required placeholder="Pérez" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Tipo de documento</label>
            <select v-model="form.huesped.tipoDocumento" required>
              <option value="cc">Cédula de ciudadanía</option>
              <option value="ce">Cédula de extranjería</option>
              <option value="pasaporte">Pasaporte</option>
              <option value="nit">NIT</option>
            </select>
          </div>
          <div class="form-group">
            <label>Número de documento</label>
            <input v-model="form.huesped.numeroDocumento" type="text" required placeholder="1234567890" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Fecha de nacimiento</label>
            <input v-model="form.huesped.fechaNacimiento" type="date" required />
          </div>
          <div class="form-group">
            <label>Nacionalidad</label>
            <input v-model="form.huesped.nacionalidad" type="text" required placeholder="Colombiano/a" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Teléfono</label>
            <input v-model="form.huesped.telefono" type="tel" required placeholder="3001234567" />
          </div>
          <div class="form-group">
            <label>Email (opcional)</label>
            <input v-model="form.huesped.email" type="email" placeholder="juan@email.com" />
          </div>
        </div>

        <h3>Forma de pago</h3>
        <div class="form-group">
          <select v-model="form.formaPago" required>
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
          <textarea v-model="form.observaciones" rows="3" placeholder="Llegada tarde, cama extra..."></textarea>
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button type="submit" class="btn-confirmar" :disabled="cargando">
          {{ cargando ? 'Procesando...' : `Confirmar reserva — $${formatPrecio(total)}` }}
        </button>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { habitacionService, reservaService } from '../../api/services'

const route  = useRouter()
const router = useRouter()
const routeQ = useRoute()

const habitacion = ref(null)
const cargando   = ref(false)
const error      = ref('')

const form = ref({
  idHabitacion:  null,
  fechaEntrada:  '',
  fechaSalida:   '',
  formaPago:     '',
  observaciones: '',
  huesped: {
    nombre:          '',
    apellido:        '',
    fechaNacimiento: '',
    nacionalidad:    '',
    telefono:        '',
    email:           '',
    tipoDocumento:   'cc',
    numeroDocumento: ''
  }
})

onMounted(async () => {
  const { idHabitacion, entrada, salida } = routeQ.query
  if (!idHabitacion || !entrada || !salida) {
    router.push('/')
    return
  }
  form.value.idHabitacion = Number(idHabitacion)
  form.value.fechaEntrada = entrada
  form.value.fechaSalida  = salida

  try {
    const res = await habitacionService.obtener(idHabitacion)
    habitacion.value = res.data
  } catch {
    error.value = 'No se pudo cargar la habitación'
  }
})

const noches = computed(() => {
  if (!form.value.fechaEntrada || !form.value.fechaSalida) return 0
  const entrada = new Date(form.value.fechaEntrada)
  const salida  = new Date(form.value.fechaSalida)
  return Math.max(0, (salida - entrada) / (1000 * 60 * 60 * 24))
})

const total = computed(() => {
  if (!habitacion.value || !noches.value) return 0
  return habitacion.value.precioNoche * noches.value
})

async function handleReservar() {
  cargando.value = true
  error.value    = ''
  try {
    const res = await reservaService.crear(form.value)
    router.push({ name: 'confirmacion', params: { id: res.data.id } })
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al crear la reserva'
  } finally {
    cargando.value = false
  }
}

function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

function formatPrecio(valor) {
  return Number(valor).toLocaleString('es-CO')
}
</script>

<style scoped>
.reservar-page { min-height: 100vh; background: var(--color-gray-50); }

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.nav-brand {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.btn-volver {
  font-size: 0.875rem;
  color: var(--color-gray-600);
}

.container {
  max-width: 720px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.titulo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-gray-800);
  margin-bottom: 1.5rem;
}

.resumen-card {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.resumen-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 120px;
}

.resumen-item.total .resumen-valor {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.resumen-label {
  font-size: 0.75rem;
  color: var(--color-gray-400);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.resumen-valor {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-gray-800);
}

.reserva-form {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reserva-form h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-gray-800);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-gray-100);
  margin-top: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.825rem;
  font-weight: 500;
  color: var(--color-gray-600);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius);
  font-size: 0.9rem;
  outline: none;
  color: var(--color-gray-800);
  background: #fff;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--color-primary);
}

.error-msg {
  background: #fef2f2;
  color: var(--color-danger);
  border: 1px solid #fecaca;
  border-radius: var(--radius);
  padding: 0.6rem 1rem;
  font-size: 0.875rem;
}

.btn-confirmar {
  background: var(--color-success);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 0.9rem;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.btn-confirmar:hover:not(:disabled) { background: #15803d; }
.btn-confirmar:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 540px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>