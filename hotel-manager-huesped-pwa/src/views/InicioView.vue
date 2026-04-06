<template>
  <div class="inicio">

    <!-- NAVBAR -->
    <nav class="navbar">
      <div class="brand">
        <span class="brand-icon">🏨</span>
        <span class="brand-name">Hotel Manager</span>
      </div>
      <div class="nav-links">
        <RouterLink to="/app" class="btn-nav app">📱 Descarga la app</RouterLink>
        <RouterLink v-if="!auth.isLoggedIn" to="/login"   class="btn-nav outline">Iniciar sesión</RouterLink>
        <RouterLink v-if="!auth.isLoggedIn" to="/registro" class="btn-nav solid">Registrarse</RouterLink>
        <template v-if="auth.isLoggedIn">
          <RouterLink to="/mis-reservas" class="btn-nav outline">Mis reservas</RouterLink>
          <RouterLink to="/perfil"       class="btn-nav solid">{{ auth.nombreCompleto.split(' ')[0] }}</RouterLink>
        </template>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge">🌟 Cali, Valle del Cauca</div>
        <h1 class="hero-title">Vive una experiencia<br><span class="hero-accent">inolvidable</span></h1>
        <p class="hero-sub">Habitaciones confortables · Atención personalizada · Ubicación privilegiada</p>

        <!-- BUSCADOR -->
        <div class="buscador">
          <div class="buscador-titulo">¿Cuándo quieres hospedarte?</div>
          <div class="buscador-campos">
            <div class="campo-grupo">
              <label class="campo-label">📅 Check-in</label>
              <input type="date" v-model="fechaEntrada" :min="hoy" class="campo-input" @change="onFechaChange" />
            </div>
            <div class="campo-grupo">
              <label class="campo-label">🕐 Hora llegada</label>
              <select v-model="horaEntrada" class="campo-input">
                <option v-for="h in horasDisponibles" :key="h.value" :value="h.value">{{ h.label }}</option>
              </select>
            </div>
            <div class="buscador-sep">→</div>
            <div class="campo-grupo">
              <label class="campo-label">📅 Check-out</label>
              <input type="date" v-model="fechaSalida" :min="fechaEntrada || hoy" class="campo-input" @change="onFechaChange" />
            </div>
            <div class="campo-grupo">
              <label class="campo-label">🕐 Hora salida</label>
              <select v-model="horaSalida" class="campo-input">
                <option v-for="h in horasDisponibles" :key="h.value" :value="h.value">{{ h.label }}</option>
              </select>
            </div>
            <button class="btn-buscar" @click="buscar" :disabled="cargando || !fechaEntrada || !fechaSalida">
              <span v-if="cargando" class="spinner-btn"></span>
              <span v-else>🔍 Buscar</span>
            </button>
          </div>
          <p v-if="error" class="buscador-error">⚠ {{ error }}</p>
        </div>
      </div>
    </section>

    <!-- CARACTERÍSTICAS -->
    <section class="features">
      <div class="features-container">
        <div class="feature-item">
          <span class="feature-ico">🛏️</span>
          <span class="feature-txt">Habitaciones premium</span>
        </div>
        <div class="feature-item">
          <span class="feature-ico">🍳</span>
          <span class="feature-txt">Desayuno incluido</span>
        </div>
        <div class="feature-item">
          <span class="feature-ico">📶</span>
          <span class="feature-txt">WiFi de alta velocidad</span>
        </div>
        <div class="feature-item">
          <span class="feature-ico">🅿️</span>
          <span class="feature-txt">Parqueadero gratuito</span>
        </div>
        <div class="feature-item">
          <span class="feature-ico">🔒</span>
          <span class="feature-txt">Seguridad 24/7</span>
        </div>
        <div class="feature-item">
          <span class="feature-ico">❄️</span>
          <span class="feature-txt">Aire acondicionado</span>
        </div>
      </div>
    </section>

    <!-- RESULTADOS DE BÚSQUEDA -->
    <section v-if="buscado" class="resultados" id="resultados">
      <div class="resultados-container">

        <div v-if="cargando" class="estado-cargando">
          <div class="spinner-grande"></div>
          <p>Buscando habitaciones disponibles...</p>
        </div>

        <template v-else>
          <div class="resultados-header">
            <h2 v-if="habitaciones.length > 0">
              🏠 {{ habitaciones.length }} habitación{{ habitaciones.length !== 1 ? 'es' : '' }} disponible{{ habitaciones.length !== 1 ? 's' : '' }}
            </h2>
            <h2 v-else>😔 Sin disponibilidad</h2>
            <p class="resultados-fechas">
              {{ formatFechaCorta(fechaEntrada) }} {{ horaEntrada }} → {{ formatFechaCorta(fechaSalida) }} {{ horaSalida }}
              · {{ noches }} noche{{ noches !== 1 ? 's' : '' }}
            </p>
          </div>

          <div v-if="habitaciones.length === 0" class="sin-disponibilidad">
            <div class="sin-disp-ico">🔍</div>
            <p>No encontramos habitaciones disponibles para esas fechas.</p>
            <p class="sin-disp-sub">Intenta con otras fechas o contáctanos directamente.</p>
          </div>

          <div v-else class="habitaciones-grid">
            <div v-for="hab in habitaciones" :key="hab.id" class="hab-card">
              <div class="hab-card-img">
                <div class="hab-tipo-badge">{{ hab.tipo }}</div>
                <div class="hab-emoji">{{ iconoTipo(hab.tipo) }}</div>
              </div>
              <div class="hab-card-body">
                <div class="hab-card-header">
                  <h3 class="hab-nombre">{{ hab.tipo }}</h3>
                  <span class="hab-numero">Hab. {{ hab.numero }}</span>
                </div>
                <p class="hab-descripcion">{{ hab.descripcion || descripcionDefault(hab.tipo) }}</p>
                <div class="hab-detalles">
                  <span class="hab-detalle">🏢 Piso {{ hab.piso }}</span>
                  <span class="hab-detalle">👥 {{ hab.capacidad }} persona{{ hab.capacidad !== 1 ? 's' : '' }}</span>
                </div>
                <div class="hab-card-footer">
                  <div class="hab-precio">
                    <span class="precio-monto">${{ formatPrecio(hab.precioNoche) }}</span>
                    <span class="precio-noche">/ noche</span>
                  </div>
                  <div class="precio-total">Total: <strong>${{ formatPrecio(hab.precioNoche * noches) }}</strong></div>
                  <button class="btn-reservar" @click="irAReservar(hab)">
                    Reservar ahora →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

      </div>
    </section>

    <!-- SECCIÓN INFO HOTEL -->
    <section class="info-hotel">
      <div class="info-container">
        <div class="info-texto">
          <h2>¿Por qué elegirnos?</h2>
          <p>En Hotel Manager te ofrecemos una experiencia de hospedaje excepcional en el corazón de Cali. Nuestras instalaciones combinan confort, seguridad y atención personalizada para hacer de tu estadía un momento memorable.</p>
          <div class="info-stats">
            <div class="stat">
              <span class="stat-num">500+</span>
              <span class="stat-lbl">Huéspedes satisfechos</span>
            </div>
            <div class="stat">
              <span class="stat-num">4.9★</span>
              <span class="stat-lbl">Calificación promedio</span>
            </div>
            <div class="stat">
              <span class="stat-num">24/7</span>
              <span class="stat-lbl">Atención al cliente</span>
            </div>
          </div>
        </div>
        <div class="info-visual">
          <div class="info-card-stack">
            <div class="info-card azul">
              <span class="info-card-ico">📍</span>
              <div>
                <div class="info-card-titulo">Ubicación</div>
                <div class="info-card-sub">Cali, Valle del Cauca</div>
              </div>
            </div>
            <div class="info-card naranja">
              <span class="info-card-ico">🕐</span>
              <div>
                <div class="info-card-titulo">Check-in desde</div>
                <div class="info-card-sub">Tu hora elegida</div>
              </div>
            </div>
            <div class="info-card verde">
              <span class="info-card-ico">📞</span>
              <div>
                <div class="info-card-titulo">Contacto</div>
                <div class="info-card-sub">(2) 123-4567</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SOCIAL PROOF TOAST -->
<Transition name="toast">
  <div v-if="toastVisible" class="toast-notif">
    <div class="toast-avatar">{{ toast.inicial }}</div>
    <div class="toast-body">
      <p class="toast-nombre">{{ toast.nombre }} acaba de reservar</p>
      <p class="toast-hab">{{ toast.tipo }} · Hab. {{ toast.numero }}</p>
      <p class="toast-tiempo">Hace {{ toast.tiempo }}</p>
    </div>
    <button class="toast-close" @click="toastVisible = false">×</button>
  </div>
</Transition>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-brand">🏨 Hotel Manager</div>
      <p class="footer-sub">Cali, Valle del Cauca · Colombia</p>
      <p class="footer-sub">© {{ new Date().getFullYear() }} Hotel Manager. Todos los derechos reservados.</p>
    </footer>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHuespedAuthStore } from '../stores/auth'
import { habitacionService } from '../api/services'

const router = useRouter()
const auth   = useHuespedAuthStore()

const fechaEntrada  = ref('')
const fechaSalida   = ref('')
const horaEntrada   = ref('15:00')
const horaSalida    = ref('12:00')
const habitaciones  = ref([])
const cargando      = ref(false)
const buscado       = ref(false)
const error         = ref('')

const hoy = computed(() => new Date().toISOString().split('T')[0])

const noches = computed(() => {
  if (!fechaEntrada.value || !fechaSalida.value) return 0
  return Math.max(0, Math.round(
    (new Date(fechaSalida.value) - new Date(fechaEntrada.value)) / 86400000
  ))
})

// Horas disponibles en intervalos de 30 min
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

function onFechaChange() {
  if (fechaEntrada.value && fechaSalida.value && fechaSalida.value <= fechaEntrada.value) {
    // Auto ajustar check-out al día siguiente del check-in
    const d = new Date(fechaEntrada.value)
    d.setDate(d.getDate() + 1)
    fechaSalida.value = d.toISOString().split('T')[0]
  }
}

async function buscar() {
  if (!fechaEntrada.value || !fechaSalida.value) return
  if (fechaSalida.value <= fechaEntrada.value) {
    error.value = 'La fecha de salida debe ser posterior a la fecha de entrada'
    return
  }
  cargando.value = true
  error.value    = ''
  buscado.value  = true
  try {
    const res = await habitacionService.listarDisponibles(fechaEntrada.value, fechaSalida.value)
    habitaciones.value = res.data
    // Scroll suave a resultados
    setTimeout(() => {
      document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  } catch {
    error.value = 'Error al buscar habitaciones. Intenta nuevamente.'
  } finally {
    cargando.value = false
  }
}

function irAReservar(hab) {
  router.push({
    name: 'reservar',
    query: {
      idHabitacion: hab.id,
      entrada:      fechaEntrada.value,
      salida:       fechaSalida.value,
      horaEntrada:  horaEntrada.value,
      horaSalida:   horaSalida.value
    }
  })
}

function formatPrecio(v) {
  return Number(v || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatFechaCorta(valor) {
  if (!valor) return ''
  return new Date(valor + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

function iconoTipo(tipo) {
  return { 'Suite': '🛏️', 'Doble': '🛏', 'Triple': '🏠', 'Sencilla': '🪑' }[tipo] || '🛏️'
}

function descripcionDefault(tipo) {
  return {
    'Suite':    'Amplia suite con vista panorámica, jacuzzi y sala de estar privada.',
    'Doble':    'Habitación cómoda con cama doble, TV y baño privado.',
    'Triple':   'Espaciosa habitación para grupos, con tres camas y todas las comodidades.',
    'Sencilla': 'Acogedora habitación individual, perfecta para viajeros de negocios.'
  }[tipo] || 'Habitación cómoda con todas las comodidades necesarias para tu estadía.'
}

// ── SOCIAL PROOF TOAST ─────────────────────────────────────
const toastVisible = ref(false)
const toast = ref({})

const reservasRecientes = [
  { nombre: 'Marcela R.',   inicial: 'M', tipo: 'Suite',    numero: '201', tiempo: '2 min' },
  { nombre: 'Carlos M.',    inicial: 'C', tipo: 'Doble',    numero: '105', tiempo: '5 min' },
  { nombre: 'Sofía L.',     inicial: 'S', tipo: 'Sencilla', numero: '302', tiempo: '8 min' },
  { nombre: 'Andrés P.',    inicial: 'A', tipo: 'Triple',   numero: '410', tiempo: '12 min' },
  { nombre: 'Valentina G.', inicial: 'V', tipo: 'Suite',    numero: '501', tiempo: '15 min' },
  { nombre: 'Juan D.',      inicial: 'J', tipo: 'Doble',    numero: '207', tiempo: '18 min' },
  { nombre: 'Camila T.',    inicial: 'C', tipo: 'Sencilla', numero: '118', tiempo: '20 min' },
]

let toastIndex = 0

function mostrarToast() {
  toast.value = reservasRecientes[toastIndex % reservasRecientes.length]
  toastIndex++
  toastVisible.value = true
  // Se oculta solo a los 4 segundos
  setTimeout(() => { toastVisible.value = false }, 4000)
}

// Primera aparición a los 3 segundos, luego cada 9 segundos
onMounted(() => {
  setTimeout(() => {
    mostrarToast()
    setInterval(mostrarToast, 9000)
  }, 3000)
})

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; }

.inicio {
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  background: #fffbf5;
  color: #1a1a2e;
}

/* ── NAVBAR ───────────────────────────────────────────────── */
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 2rem;
  background: rgba(19, 23, 24, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
}

.brand { display: flex; align-items: center; gap: 0.5rem; }
.brand-icon { font-size: 1.4rem; }
.brand-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem; font-weight: 700;
  color: #e85d04;
}

.nav-links { display: flex; align-items: center; gap: 0.75rem; }

.btn-nav {
  padding: 0.45rem 1.1rem; border-radius: 25px;
  font-size: 0.85rem; font-weight: 600;
  text-decoration: none; transition: all 0.2s; cursor: pointer;
}
.btn-nav.outline {
  border: 2px solid #e85d04; color: #e85d04; background: transparent;
}
.btn-nav.outline:hover { background: #e85d04; color: #fff; }
.btn-nav.solid { background: #e85d04; color: #fff; border: 2px solid #e85d04; }
.btn-nav.solid:hover { background: #c44d02; border-color: #c44d02; }

/* ── HERO ─────────────────────────────────────────────────── */
.hero {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%);
  display: flex; align-items: center; justify-content: center;
  position: relative; padding: 7rem 2rem 4rem;
}

.hero-overlay {
  position: absolute; inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.hero-content {
  position: relative; z-index: 1;
  max-width: 900px; width: 100%; text-align: center;
}

.hero-badge {
  display: inline-block;
  background: rgba(232,93,4,0.2); border: 1px solid rgba(232,93,4,0.4);
  color: #ffb347; padding: 0.4rem 1.2rem; border-radius: 25px;
  font-size: 0.82rem; font-weight: 600; letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 700; color: #fff;
  line-height: 1.15; margin-bottom: 1rem;
}
.hero-accent { color: #ffb347; font-style: italic; }

.hero-sub {
  font-size: 1rem; color: rgba(255,255,255,0.7);
  margin-bottom: 2.5rem; line-height: 1.6;
}

/* ── BUSCADOR ─────────────────────────────────────────────── */
.buscador {
  background: rgba(255,255,255,0.97);
  border-radius: 20px;
  padding: 1.75rem 2rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  text-align: left;
}

.buscador-titulo {
  font-size: 1rem; font-weight: 700;
  color: #1a1a2e; margin-bottom: 1.25rem;
  text-align: center;
}

.buscador-campos {
  display: flex; align-items: flex-end;
  gap: 0.75rem; flex-wrap: wrap;
}

.campo-grupo {
  display: flex; flex-direction: column; gap: 0.35rem;
  flex: 1; min-width: 130px;
}

.campo-label {
  font-size: 0.72rem; font-weight: 700;
  color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;
}

.campo-input {
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 0.875rem; color: #1a1a2e; background: #f8fafc;
  outline: none; transition: border-color 0.2s;
  font-family: 'Inter', sans-serif;
}
.campo-input:focus { border-color: #e85d04; background: #fff; }

.buscador-sep {
  font-size: 1.2rem; color: #94a3b8;
  padding-bottom: 0.65rem; flex-shrink: 0;
}

.btn-buscar {
  padding: 0.7rem 1.75rem;
  background: linear-gradient(135deg, #e85d04, #c44d02);
  color: #fff; border: none; border-radius: 10px;
  font-size: 0.95rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  white-space: nowrap; flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(232,93,4,0.4);
}
.btn-buscar:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(232,93,4,0.5); }
.btn-buscar:disabled { opacity: 0.6; cursor: not-allowed; }

.buscador-error {
  margin-top: 0.75rem; font-size: 0.82rem;
  color: #dc2626; text-align: center;
}

/* ── FEATURES ─────────────────────────────────────────────── */
.features {
  background: #1a1a2e;
  padding: 1.25rem 2rem;
}

.features-container {
  max-width: 1100px; margin: 0 auto;
  display: flex; justify-content: center;
  gap: 2rem; flex-wrap: wrap;
}

.feature-item {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.82rem; color: rgba(255,255,255,0.7);
  font-weight: 500;
}
.feature-ico { font-size: 1.1rem; }

/* ── RESULTADOS ───────────────────────────────────────────── */
.resultados { padding: 4rem 2rem; background: #fffbf5; }
.resultados-container { max-width: 1100px; margin: 0 auto; }

.resultados-header { text-align: center; margin-bottom: 2rem; }
.resultados-header h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem; font-weight: 700; color: #1a1a2e; margin-bottom: 0.5rem;
}
.resultados-fechas { font-size: 0.9rem; color: #64748b; }

.estado-cargando {
  text-align: center; padding: 4rem;
  color: #64748b; font-size: 1rem;
}

.spinner-grande {
  width: 48px; height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #e85d04;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

.spinner-btn {
  display: inline-block; width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.sin-disponibilidad {
  text-align: center; padding: 4rem;
  background: #fff; border-radius: 16px;
  border: 2px dashed #e2e8f0;
}
.sin-disp-ico { font-size: 3rem; margin-bottom: 1rem; }
.sin-disp-sub { color: #94a3b8; font-size: 0.9rem; margin-top: 0.5rem; }

/* ── HABITACIONES GRID ────────────────────────────────────── */
.habitaciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.hab-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: transform 0.25s, box-shadow 0.25s;
  border: 1px solid rgba(0,0,0,0.06);
}
.hab-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.hab-card-img {
  height: 160px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f64f59 100%);
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.hab-card-img:nth-child(2n) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #fda085 100%);
}

.hab-tipo-badge {
  position: absolute; top: 1rem; left: 1rem;
  background: rgba(255,255,255,0.2); backdrop-filter: blur(8px);
  color: #fff; padding: 0.3rem 0.8rem; border-radius: 20px;
  font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em;
  border: 1px solid rgba(255,255,255,0.3);
}
.hab-emoji { font-size: 3.5rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); }

.hab-card-body { padding: 1.25rem; }

.hab-card-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 0.6rem;
}
.hab-nombre {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem; font-weight: 700; color: #1a1a2e; margin: 0;
}
.hab-numero {
  font-size: 0.75rem; background: #f1f5f9;
  color: #64748b; padding: 0.2rem 0.6rem;
  border-radius: 6px; font-weight: 600;
}

.hab-descripcion {
  font-size: 0.82rem; color: #64748b;
  line-height: 1.6; margin-bottom: 0.75rem;
}

.hab-detalles {
  display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap;
}
.hab-detalle {
  font-size: 0.75rem; color: #475569;
  background: #f8fafc; padding: 0.25rem 0.65rem;
  border-radius: 6px; border: 1px solid #e2e8f0;
}

.hab-card-footer {
  border-top: 1px solid #f1f5f9;
  padding-top: 1rem;
}

.hab-precio {
  display: flex; align-items: baseline; gap: 0.3rem; margin-bottom: 0.25rem;
}
.precio-monto {
  font-size: 1.5rem; font-weight: 800; color: #e85d04;
}
.precio-noche { font-size: 0.8rem; color: #94a3b8; }
.precio-total { font-size: 0.82rem; color: #64748b; margin-bottom: 0.85rem; }
.precio-total strong { color: #1a1a2e; }

.btn-reservar {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #e85d04, #c44d02);
  color: #fff; border: none; border-radius: 10px;
  font-size: 0.9rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(232,93,4,0.3);
}
.btn-reservar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(232,93,4,0.45);
}

/* ── INFO HOTEL ───────────────────────────────────────────── */
.info-hotel {
  padding: 5rem 2rem;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: #fff;
}

.info-container {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;
  align-items: center;
}

.info-texto h2 {
  font-family: 'Playfair Display', serif;
  font-size: 2rem; font-weight: 700;
  margin-bottom: 1rem; color: #ffb347;
}
.info-texto p { color: rgba(255,255,255,0.75); line-height: 1.8; margin-bottom: 2rem; }

.info-stats { display: flex; gap: 2rem; flex-wrap: wrap; }
.stat { display: flex; flex-direction: column; gap: 0.25rem; }
.stat-num { font-size: 1.8rem; font-weight: 800; color: #ffb347; }
.stat-lbl { font-size: 0.78rem; color: rgba(255,255,255,0.55); }


.info-card-stack { display: flex; flex-direction: column; gap: 1rem; }

.info-card {
  display: flex; align-items: center; gap: 1rem;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px; padding: 1rem 1.25rem;
  transition: transform 0.2s;
}
.info-card:hover { transform: translateX(6px); }
.info-card.azul   { border-left: 4px solid #60a5fa; }
.info-card.naranja{ border-left: 4px solid #fb923c; }
.info-card.verde  { border-left: 4px solid #4ade80; }
.info-card-ico { font-size: 1.75rem; flex-shrink: 0; }
.info-card-titulo { font-size: 0.9rem; font-weight: 600; color: #fff; }
.info-card-sub { font-size: 0.78rem; color: rgba(255,255,255,0.55); }

/* ── FOOTER ───────────────────────────────────────────────── */
.footer {
  background: #0f0f1a; text-align: center;
  padding: 2rem; color: rgba(255,255,255,0.5);
}
.footer-brand {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem; color: #ffb347; margin-bottom: 0.5rem;
}
.footer-sub { font-size: 0.8rem; line-height: 1.8; }

/* ── RESPONSIVE ───────────────────────────────────────────── */
@media (max-width: 900px) {
  .info-container { grid-template-columns: 1fr; gap: 2rem; }
}

@media (max-width: 768px) {
  .navbar { padding: 0.75rem 1rem; gap: 0.5rem; }
  .nav-links { gap: 0.4rem; }
  .btn-nav { padding: 0.35rem 0.75rem; font-size: 0.78rem; }
  /* En móvil el botón "Descarga la app" ocupa espacio innecesario */
  .btn-nav.app { display: none; }
  .hero { padding: 6rem 1rem 3rem; }
  .buscador { padding: 1.25rem; }
  .buscador-campos { flex-direction: column; }
  .buscador-sep { display: none; }
  .campo-grupo { min-width: auto; }
  .btn-buscar { width: 100%; }
  .features-container { gap: 1rem; }
  .habitaciones-grid { grid-template-columns: 1fr; }
  .resultados { padding: 2.5rem 1rem; }
  .info-hotel { padding: 3rem 1rem; }
  .info-stats { gap: 1.25rem; }
}

/* ── SOCIAL PROOF TOAST ───────────────────────────────────── */
.toast-notif {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 14px;
  padding: 0.85rem 1rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  max-width: 280px;
  min-width: 240px;
}

.toast-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e85d04, #c44d02);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.toast-body { flex: 1; }

.toast-nombre {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.15rem;
}

.toast-hab {
  font-size: 0.75rem;
  color: #e85d04;
  font-weight: 600;
  margin: 0 0 0.15rem;
}

.toast-tiempo {
  font-size: 0.7rem;
  color: #94a3b8;
  margin: 0;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.2s;
}
.toast-close:hover { color: #1a1a2e; }

/* Animación entrada/salida */
.toast-enter-active {
  animation: slideInLeft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  animation: slideOutLeft 0.3s ease-in forwards;
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-110%); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes slideOutLeft {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(-110%); }
}

@media (max-width: 380px) {
  .brand-name { display: none; }
  .btn-nav { padding: 0.3rem 0.6rem; font-size: 0.73rem; }
}

@media (max-width: 480px) {
  .toast-notif {
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
}

.btn-nav.app {
  border: 2px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.75);
  background: transparent;
  font-size: 0.8rem;
}
.btn-nav.app:hover { border-color: #E8773A; color: #E8773A; }
</style>