<template>
  <div class="page">

    <header class="header">
      <button class="btn-volver" @click="router.back()">←</button>
      <div class="brand">
        <span class="brand-icon">✦</span>
        <span>Hotel Manager</span>
      </div>
      <div style="width:32px"></div>
    </header>

    <main class="main">

      <!-- Resumen habitación -->
      <div v-if="habitacion" class="resumen-card">
        <div class="resumen-deco">✦</div>
        <div class="resumen-hab">
          <div class="hab-icon">{{ iconoTipo(habitacion.tipo) }}</div>
          <div>
            <div class="hab-tipo">{{ habitacion.tipo }}</div>
            <div class="hab-num">Habitación {{ habitacion.numero }}</div>
          </div>
        </div>
        <div class="resumen-estrellas">★★★★★</div>
        <div class="resumen-items">
          <div class="resumen-item">
            <span>Check-in</span>
            <span>{{ formatFecha(form.fechaEntrada) }}</span>
          </div>
          <div class="resumen-item">
            <span>Check-out</span>
            <span>{{ formatFecha(form.fechaSalida) }}</span>
          </div>
          <div class="resumen-item">
            <span>Noches</span>
            <span>{{ noches }}</span>
          </div>
        </div>
        <div class="resumen-total">
          <span>Total</span>
          <span class="total-monto">${{ formatPrecio(total) }}</span>
        </div>
      </div>

      <div v-if="errorCarga" class="error-msg">⚠ {{ errorCarga }}</div>

      <!-- Formulario -->
      <form @submit.prevent="confirmar" class="form" v-if="habitacion">

        <div class="form-seccion">
          <div class="seccion-label">
            <span class="seccion-num">01</span>
            <span>Datos del huésped</span>
            <div class="seccion-linea"></div>
          </div>

          <!-- Si está logueado usa sus datos -->
          <div v-if="auth.isLoggedIn" class="datos-guardados">
            <span class="datos-icon">◈</span>
            <span>Usando tus datos registrados</span>
          </div>

          <template v-else>
            <div class="form-row">
              <div class="form-group">
                <label>Nombre *</label>
                <input v-model="form.huesped.nombre" type="text" placeholder="Juan" required />
              </div>
              <div class="form-group">
                <label>Apellido *</label>
                <input v-model="form.huesped.apellido" type="text" placeholder="Pérez" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Tipo documento *</label>
                <select v-model="form.huesped.tipoDocumento">
                  <option value="cc">Cédula</option>
                  <option value="ce">C. Extranjería</option>
                  <option value="pasaporte">Pasaporte</option>
                </select>
              </div>
              <div class="form-group">
                <label>Número documento *</label>
                <input v-model="form.huesped.numeroDocumento" type="text" placeholder="1234567890" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Fecha nacimiento *</label>
                <input v-model="form.huesped.fechaNacimiento" type="date" required />
              </div>
              <div class="form-group">
                <label>Nacionalidad *</label>
                <input v-model="form.huesped.nacionalidad" type="text" placeholder="Colombiano/a" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Teléfono *</label>
                <input v-model="form.huesped.telefono" type="tel" placeholder="3001234567" required />
              </div>
              <div class="form-group">
                <label>Email (opcional)</label>
                <input v-model="form.huesped.email" type="email" placeholder="juan@email.com" />
              </div>
            </div>
          </template>
        </div>

        <div class="form-seccion">
          <div class="seccion-label">
            <span class="seccion-num">02</span>
            <span>Forma de pago</span>
            <div class="seccion-linea"></div>
          </div>
          <div class="form-group">
            <label>Método de pago *</label>
            <select v-model="form.formaPago" required>
              <option value="">Selecciona</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta_credito">Tarjeta de crédito</option>
              <option value="tarjeta_debito">Tarjeta de débito</option>
              <option value="transferencia">Transferencia</option>
              <option value="pse">PSE</option>
              <option value="nequi">Nequi</option>
              <option value="daviplata">Daviplata</option>
            </select>
          </div>
          <div class="form-group">
            <label>Observaciones (opcional)</label>
            <textarea v-model="form.observaciones" rows="2" placeholder="Llegada tarde, cama extra..."></textarea>
          </div>
        </div>

        <div v-if="error" class="error-msg">⚠ {{ error }}</div>

        <button type="submit" class="btn-confirmar" :disabled="cargando">
          <span v-if="cargando" class="spinner"></span>
          <span v-else>Confirmar reserva · ${{ formatPrecio(total) }}</span>
        </button>

        <p class="form-nota">✦ Reserva segura y confirmada al instante</p>

      </form>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHuespedAuthStore } from '../stores/auth'
import { habitacionService, reservaService } from '../api/services'

const route  = useRoute()
const router = useRouter()
const auth   = useHuespedAuthStore()

const habitacion = ref(null)
const cargando   = ref(false)
const errorCarga = ref('')
const error      = ref('')

const form = ref({
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
})

onMounted(async () => {
  const { idHabitacion, entrada, salida } = route.query
  if (!idHabitacion || !entrada || !salida) { router.push('/inicio'); return }

  form.value.idHabitacion = Number(idHabitacion)
  form.value.fechaEntrada = entrada
  form.value.fechaSalida  = salida

  // Si está logueado prellenar datos
  if (auth.isLoggedIn && auth.usuario) {
    form.value.huesped.nombre   = auth.usuario.nombre
    form.value.huesped.apellido = auth.usuario.apellido
    form.value.huesped.email    = auth.usuario.email
  }

  try {
    const res = await habitacionService.obtener(idHabitacion)
    habitacion.value = res.data
  } catch {
    errorCarga.value = 'No se pudo cargar la habitación'
  }
})

const noches = computed(() => {
  if (!form.value.fechaEntrada || !form.value.fechaSalida) return 0
  return Math.max(0, (new Date(form.value.fechaSalida) - new Date(form.value.fechaEntrada)) / 86400000)
})

const total = computed(() => {
  if (!habitacion.value || !noches.value) return 0
  return habitacion.value.precioNoche * noches.value
})

function iconoTipo(tipo) {
  return { 'Suite': '◆', 'Doble': '◈', 'Triple': '⬡', 'Sencilla': '○' }[tipo] || '◈'
}

function formatFecha(f) {
  if (!f) return ''
  return new Date(f + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function formatPrecio(v) {
  return Number(v || 0).toLocaleString('es-CO')
}

async function confirmar() {
  cargando.value = true
  error.value    = ''
  try {
    if (auth.isLoggedIn && auth.usuario?.id) {
      form.value.idHuespedUsuario = auth.usuario.id
    }
    await reservaService.crear(form.value)
    router.push({ name: 'reservas' })
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al crear la reserva'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600&family=Montserrat:wght@300;400;500;600&display=swap');

.page { min-height: 100vh; background: var(--dark); }

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(10,10,10,0.95); backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(201,168,76,0.1);
}
.btn-volver { color: var(--text-muted); font-size: 1.1rem; background: transparent; border: none; cursor: pointer; transition: color 0.2s; }
.btn-volver:hover { color: var(--gold); }
.brand { display: flex; align-items: center; gap: 0.4rem;
  font-family: 'Cormorant Garamond', serif; font-size: 1rem;
  letter-spacing: 0.15em; text-transform: uppercase; color: var(--text);
}
.brand-icon { color: var(--gold); font-size: 0.8rem; }

.main { padding: 5rem 1.5rem 3rem; max-width: 500px; margin: 0 auto; }

/* RESUMEN */
.resumen-card {
  background: #1C1A17; border: 1px solid rgba(201,168,76,0.15);
  border-radius: 10px; padding: 1.25rem; margin-bottom: 1.5rem;
}
.resumen-deco { font-size: 0.9rem; color: var(--gold); opacity: 0.4; margin-bottom: 1rem; }
.resumen-hab { display: flex; align-items: center; gap: 0.85rem; margin-bottom: 0.75rem; }
.hab-icon {
  width: 42px; height: 42px; border-radius: 50%;
  background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; color: var(--gold); flex-shrink: 0;
}
.hab-tipo { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; color: var(--text); }
.hab-num { font-size: 0.7rem; color: var(--text-muted); }
.resumen-estrellas { font-size: 0.6rem; color: var(--gold); letter-spacing: 0.25em; opacity: 0.6; margin-bottom: 1rem; }

.resumen-items { border: 1px solid rgba(201,168,76,0.08); border-radius: 6px; overflow: hidden; margin-bottom: 0.75rem; }
.resumen-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.6rem 0.85rem; border-bottom: 1px solid rgba(201,168,76,0.06);
  font-size: 0.78rem;
}
.resumen-item:last-child { border-bottom: none; }
.resumen-item span:first-child { color: var(--text-muted); }
.resumen-item span:last-child { color: var(--text); font-weight: 500; }

.resumen-total {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.85rem; background: rgba(201,168,76,0.06);
  border: 1px solid rgba(201,168,76,0.15); border-radius: 6px;
  font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em;
}
.total-monto { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 600; color: var(--gold); }

/* FORM */
.form { display: flex; flex-direction: column; gap: 2rem; }
.form-seccion { display: flex; flex-direction: column; gap: 0.85rem; }

.seccion-label { display: flex; align-items: center; gap: 0.75rem; }
.seccion-num { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; color: var(--gold); opacity: 0.4; font-weight: 300; line-height: 1; }
.seccion-label span:nth-child(2) { font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); white-space: nowrap; }
.seccion-linea { flex: 1; height: 1px; background: rgba(201,168,76,0.1); }

.datos-guardados {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.78rem; color: var(--gold);
  background: rgba(201,168,76,0.06); border: 1px solid rgba(201,168,76,0.15);
  border-radius: 6px; padding: 0.75rem 1rem;
}
.datos-icon { font-size: 0.6rem; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group label { font-size: 0.6rem; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-muted); }

.form-group input, .form-group select, .form-group textarea {
  background: #1A1A1A; border: 1px solid rgba(201,168,76,0.15);
  border-radius: 4px; padding: 0.75rem 1rem;
  font-family: 'Montserrat', sans-serif; font-size: 0.875rem;
  font-weight: 300; color: var(--text); outline: none; transition: all 0.3s; width: 100%;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: rgba(201,168,76,0.45); }
.form-group input::placeholder, .form-group textarea::placeholder { color: var(--text-dim); }
.form-group select option { background: #1A1A1A; }
.form-group textarea { resize: none; }

.error-msg {
  background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.2);
  border-radius: 4px; padding: 0.7rem 1rem; font-size: 0.8rem; color: #FCA5A5;
}

.btn-confirmar {
  background: var(--gold); color: var(--dark); border: none; border-radius: 4px;
  padding: 1rem; font-family: 'Montserrat', sans-serif; font-size: 0.72rem;
  font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
  transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
}
.btn-confirmar:hover:not(:disabled) { background: var(--gold-light); }
.btn-confirmar:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner { width: 15px; height: 15px; border: 2px solid rgba(0,0,0,0.3); border-top-color: var(--dark); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.form-nota { text-align: center; font-size: 0.65rem; color: var(--text-dim); }

@media (max-width: 400px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>