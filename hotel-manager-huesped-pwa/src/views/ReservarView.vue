<template>
  <div class="page">

    <header class="header">
      <button class="btn-volver" @click="router.back()">←</button>
      <div class="brand">Hotel Manager</div>
      <div style="width:32px"></div>
    </header>

    <main class="main">

      <!-- RESUMEN HABITACIÓN -->
      <div v-if="habitacion" class="resumen-card">
        <div class="resumen-hab">
          <div class="hab-icon">{{ iconoTipo(habitacion.tipo) }}</div>
          <div>
            <div class="hab-tipo">{{ habitacion.tipo }}</div>
            <div class="hab-num">Habitación {{ habitacion.numero }}</div>
          </div>
        </div>

        <div class="resumen-items">
          <div class="resumen-item">
            <span class="resumen-label">📅 Check-in</span>
            <span class="resumen-valor">{{ formatFecha(form.fechaEntrada) }}</span>
            <span class="resumen-hora">🕐 {{ formatHora(form.horaEntrada) }}</span>
          </div>
          <div class="resumen-sep">→</div>
          <div class="resumen-item">
            <span class="resumen-label">📅 Check-out</span>
            <span class="resumen-valor">{{ formatFecha(form.fechaSalida) }}</span>
            <span class="resumen-hora">🕐 {{ formatHora(form.horaSalida) }}</span>
          </div>
        </div>

        <div class="resumen-footer">
          <span class="resumen-noches">{{ noches }} noche{{ noches !== 1 ? 's' : '' }}</span>
          <div class="resumen-total">
            <span class="total-label">Total</span>
            <span class="total-monto">${{ formatPrecio(total) }}</span>
          </div>
        </div>
      </div>

      <div v-if="errorCarga" class="error-msg">⚠ {{ errorCarga }}</div>

      <!-- FORMULARIO -->
      <form @submit.prevent="confirmar" class="form" v-if="habitacion">

        <!-- DATOS DEL HUÉSPED -->
        <div class="form-seccion">
          <div class="seccion-header">
            <span class="seccion-num">01</span>
            <span class="seccion-titulo">Datos del huésped</span>
          </div>

          <div v-if="auth.isLoggedIn" class="datos-guardados">
            ✅ Usando tus datos registrados
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
                  <option value="nit">NIT</option>
                </select>
              </div>
              <div class="form-group">
                <label>N° documento *</label>
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
                <label>Email</label>
                <input v-model="form.huesped.email" type="email" placeholder="juan@email.com" />
              </div>
            </div>
          </template>
        </div>

        <!-- HORARIOS -->
        <div class="form-seccion">
          <div class="seccion-header">
            <span class="seccion-num">02</span>
            <span class="seccion-titulo">Horarios de llegada y salida</span>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>🕐 Hora de llegada (check-in)</label>
              <select v-model="form.horaEntrada">
                <option v-for="h in horasDisponibles" :key="h.value" :value="h.value">{{ h.label }}</option>
              </select>
              <span class="campo-hint">Hora estimada de llegada al hotel</span>
            </div>
            <div class="form-group">
              <label>🕐 Hora de salida (check-out)</label>
              <select v-model="form.horaSalida">
                <option v-for="h in horasDisponibles" :key="h.value" :value="h.value">{{ h.label }}</option>
              </select>
              <span class="campo-hint">Hora estimada de salida del hotel</span>
            </div>
          </div>
        </div>

        <!-- PAGO -->
        <div class="form-seccion">
          <div class="seccion-header">
            <span class="seccion-num">03</span>
            <span class="seccion-titulo">Forma de pago</span>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Método de pago *</label>
              <select v-model="form.formaPago" required>
                <option value="">Selecciona...</option>
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
              <label>Observaciones</label>
              <textarea v-model="form.observaciones" rows="2" placeholder="Llegada tarde, cama extra, etc."></textarea>
            </div>
          </div>
        </div>

        <div v-if="error" class="error-msg">⚠ {{ error }}</div>

        <button type="submit" class="btn-confirmar" :disabled="cargando">
          <span v-if="cargando" class="spinner"></span>
          <span v-else>✅ Confirmar reserva · ${{ formatPrecio(total) }}</span>
        </button>

        <p class="form-nota">🔒 Reserva segura y confirmada al instante</p>

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
  horaEntrada:   '15:00',
  horaSalida:    '12:00',
  formaPago:     '',
  observaciones: '',
  huesped: {
    nombre: '', apellido: '', fechaNacimiento: '',
    nacionalidad: '', telefono: '', email: '',
    tipoDocumento: 'cc', numeroDocumento: ''
  }
})

// Horas en intervalos de 30 min
const horasDisponibles = computed(() => {
  const horas = []
  for (let h = 0; h < 24; h++) {
    for (let m of [0, 30]) {
      const hStr = String(h).padStart(2, '0')
      const mStr = String(m).padStart(2, '0')
      const val  = `${hStr}:${mStr}`
      const periodo = h < 12 ? 'AM' : 'PM'
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      horas.push({ value: val, label: `${h12}:${mStr} ${periodo}` })
    }
  }
  return horas
})

onMounted(async () => {
  const { idHabitacion, entrada, salida, horaEntrada, horaSalida } = route.query
  if (!idHabitacion || !entrada || !salida) { router.push('/inicio'); return }

  form.value.idHabitacion = Number(idHabitacion)
  form.value.fechaEntrada = entrada
  form.value.fechaSalida  = salida
  // Usar horas elegidas en el buscador si vienen
  if (horaEntrada) form.value.horaEntrada = horaEntrada
  if (horaSalida)  form.value.horaSalida  = horaSalida

  // Prellenar datos del usuario logueado
  if (auth.isLoggedIn && auth.usuario) {
    form.value.huesped.nombre    = auth.usuario.nombre    || ''
    form.value.huesped.apellido  = auth.usuario.apellido  || ''
    form.value.huesped.email     = auth.usuario.email     || ''
    form.value.huesped.telefono  = auth.usuario.telefono  || ''
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
  return Math.max(0,
    Math.round((new Date(form.value.fechaSalida) - new Date(form.value.fechaEntrada)) / 86400000)
  )
})

const total = computed(() => {
  if (!habitacion.value || !noches.value) return 0
  return habitacion.value.precioNoche * noches.value
})

async function confirmar() {
  cargando.value = true
  error.value    = ''
  try {
    if (auth.isLoggedIn && auth.usuario?.id) {
      form.value.idHuespedUsuario = auth.usuario.id
    }
    const res = await reservaService.crear(form.value)
    router.push({ name: 'reservas' })
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al crear la reserva'
  } finally {
    cargando.value = false
  }
}

function iconoTipo(tipo) {
  return { 'Suite': '🛏️', 'Doble': '🛏', 'Triple': '🏠', 'Sencilla': '🪑' }[tipo] || '🛏️'
}

function formatFecha(f) {
  if (!f) return ''
  return new Date(f + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

function formatHora(h) {
  if (!h) return ''
  const [hh, mm] = h.split(':')
  const hNum = parseInt(hh)
  const periodo = hNum < 12 ? 'AM' : 'PM'
  const h12 = hNum === 0 ? 12 : hNum > 12 ? hNum - 12 : hNum
  return `${h12}:${mm} ${periodo}`
}

function formatPrecio(v) {
  return Number(v || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; }
.page { min-height: 100vh; background: #0A1628; font-family: 'Inter', sans-serif; }

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.95); backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.btn-volver {
  background: none; border: none; font-size: 1.3rem;
  color: #64748b; cursor: pointer;
}
.btn-volver:hover { color: #e8b13a; }
.brand {
  font-family: "Georgia", "Times New Roman", serif;
  font-size: 28px;
  font-weight: 500;
  letter-spacing: 1px;
  text-align: center;
}

.main { padding: 5rem 1.25rem 3rem; max-width: 600px; margin: 0 auto; }

/* RESUMEN */
.resumen-card {
  background: linear-gradient(135deg, #2f2f55, #1c2642);
  border-radius: 16px; padding: 1.5rem;
  margin-bottom: 1.75rem; color: #000000;
  box-shadow: 0 8px 30px rgba(26,26,46,0.3);
}

.resumen-hab {
  display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem;
}
.hab-icon { font-size: 2rem; }
.hab-tipo {
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem; font-weight: 700; color: #ffb347;
}
.hab-num { font-size: 0.8rem; color: rgba(255,255,255,0.6); }

.resumen-items {
  display: flex; align-items: flex-start; gap: 0.75rem;
  background: rgba(255,255,255,0.08); border-radius: 10px;
  padding: 1rem; margin-bottom: 1rem;
}
.resumen-sep { color: rgba(255,255,255,0.4); padding-top: 0.5rem; font-size: 1.2rem; }
.resumen-item { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.resumen-label { font-size: 0.7rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.05em; }
.resumen-valor { font-size: 0.9rem; font-weight: 600; color: #fff; }
.resumen-hora  { font-size: 0.78rem; color: #ffb347; }

.resumen-footer {
  display: flex; justify-content: space-between; align-items: center;
}
.resumen-noches { font-size: 0.82rem; color: rgba(255,255,255,0.5); }
.total-label { font-size: 0.72rem; color: rgba(255,255,255,0.5); margin-right: 0.5rem; }
.total-monto { font-size: 1.4rem; font-weight: 800; color: #ffb347; }

/* FORMULARIO */
.form { display: flex; flex-direction: column; gap: 1.25rem; }

.form-seccion {
  background: #1f232b; border-radius: 14px;
  padding: 1.25rem; border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.seccion-header {
  display: flex; align-items: center; gap: 0.65rem;
  margin-bottom: 1.1rem; padding-bottom: 0.75rem;
  border-bottom: 1px solid #e8b13a;
}
.seccion-num {
  background: #e8b13a; color: #fff;
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; font-weight: 800; flex-shrink: 0;
}
.seccion-titulo { font-size: 0.9rem; font-weight: 700; color: #e7e7e7; }

.datos-guardados {
  padding: 0.75rem 1rem; background: #84ce47;
  border: 1px solid #504b4b; border-radius: 8px;
  font-size: 0.85rem; color: #3b3a3a; font-weight: 500;
}

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 0.85rem; }
.form-row:last-child { margin-bottom: 0; }

.form-group { display: flex; flex-direction: column; gap: 0.3rem; }
.form-group label { font-size: 0.75rem; font-weight: 600; color: #e2e2e2; }
.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.55rem 0.8rem;
  border: 1.5px solid #e8b13a; border-radius: 8px;
  font-size: 0.875rem; color: #ffffff; background: #35373b;
  outline: none; transition: border-color 0.2s;
  font-family: 'Inter', sans-serif;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { border-color: #e8b13a; background: #686565; }
.form-group textarea { resize: none; }
.campo-hint { font-size: 0.7rem; color: #ffffff; }

.error-msg {
  padding: 0.75rem 1rem; background: #fef2f2;
  border: 1px solid #fecaca; border-radius: 10px;
  font-size: 0.85rem; color: #dc2626;
}

.btn-confirmar {
  padding: 1rem;
  background: linear-gradient(135deg, #1fe804, #29c402);
  color: #fff; border: none; border-radius: 12px;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s; display: flex; align-items: center;
  justify-content: center; gap: 0.5rem;
  box-shadow: 0 6px 20px rgba(4, 232, 34, 0.35);
}
.btn-confirmar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(42, 232, 4, 0.582);
}
.btn-confirmar:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #444242; border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.form-nota {
  text-align: center; font-size: 0.78rem;
  color: #f0f0f0; margin-top: -0.5rem;
}

@media (max-width: 500px) {
  .form-row { grid-template-columns: 1fr; }
  .resumen-items { flex-direction: column; gap: 0.5rem; }
  .resumen-sep { display: none; }
}
</style>