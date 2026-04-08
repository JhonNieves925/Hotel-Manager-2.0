<template>
  <div class="inicio">

    <!-- NAVBAR -->
    <nav class="navbar">
      <div class="brand">
        <img src="/logo.png" alt="Hotel Manager" class="brand-logo" />
      </div>
      <div class="nav-links">
        <RouterLink to="/app" class="btn-nav app">📱 <span class="app-txt">Descarga la app</span></RouterLink>
        <RouterLink v-if="!auth.isLoggedIn" to="/login"    class="btn-nav outline">Iniciar sesión</RouterLink>
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

        <!-- Botón descarga app — solo visible en móvil, debajo del badge -->
        <RouterLink to="/app" class="btn-hero-app">📱 Descarga la app</RouterLink>

        <h1 class="hero-title">
          Vive una experiencia<br>
          <span class="hero-accent">inolvidable</span>
        </h1>
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

    <!-- FEATURES BAR -->
    <section class="features">
      <div class="features-container">
        <div class="feature-item"><span class="feature-ico">🛏️</span><span class="feature-txt">Habitaciones premium</span></div>
        <div class="feature-item"><span class="feature-ico">🍳</span><span class="feature-txt">Desayuno incluido</span></div>
        <div class="feature-item"><span class="feature-ico">📶</span><span class="feature-txt">WiFi alta velocidad</span></div>
        <div class="feature-item"><span class="feature-ico">🅿️</span><span class="feature-txt">Parqueadero gratuito</span></div>
        <div class="feature-item"><span class="feature-ico">🔒</span><span class="feature-txt">Seguridad 24/7</span></div>
        <div class="feature-item"><span class="feature-ico">❄️</span><span class="feature-txt">Aire acondicionado</span></div>
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
              <div class="hab-card-img" :style="{ backgroundImage: `url(${imagenTipo(hab.tipo)})` }">
                <div class="hab-card-img-overlay"></div>
                <div class="hab-tipo-badge">{{ hab.tipo }}</div>
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

function imagenTipo(tipo) {
  const imgs = {
    'Suite':    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80&auto=format&fit=crop',
    'Doble':    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80&auto=format&fit=crop',
    'Triple':   'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80&auto=format&fit=crop',
    'Sencilla': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80&auto=format&fit=crop',
  }
  return imgs[tipo] || imgs['Doble']
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
  setTimeout(() => { toastVisible.value = false }, 4000)
}

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
  background: #0A0A0A;
  color: #fff;
}

/* ── NAVBAR ───────────────────────────────────────────────── */
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 2.5rem;
  background: rgba(5, 5, 5, 0.92);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(201,168,76,0.15);
}

.brand { display: flex; align-items: center; }
.brand-logo {
  height: 48px;
  width: auto;
  object-fit: contain;
}

.nav-links { display: flex; align-items: center; gap: 0.75rem; }

.btn-nav {
  padding: 0.45rem 1.2rem; border-radius: 25px;
  font-size: 0.85rem; font-weight: 600;
  text-decoration: none; transition: all 0.25s; cursor: pointer;
  letter-spacing: 0.01em;
}
.btn-nav.app {
  border: 1px solid rgba(201,168,76,0.35);
  color: rgba(201,168,76,0.8);
  background: transparent; font-size: 0.8rem;
}
.btn-nav.app:hover { border-color: #C9A84C; color: #C9A84C; background: rgba(201,168,76,0.08); }
.btn-nav.outline {
  border: 1.5px solid rgba(255,255,255,0.3);
  color: rgba(255,255,255,0.85);
  background: transparent;
}
.btn-nav.outline:hover { border-color: #C9A84C; color: #C9A84C; }
.btn-nav.solid {
  background: #C9A84C; color: #0A0A0A;
  border: 1.5px solid #C9A84C; font-weight: 700;
}
.btn-nav.solid:hover { background: #BFA046; border-color: #BFA046; }

/* ── HERO ─────────────────────────────────────────────────── */
.hero {
  min-height: 100vh;
  background-image: url('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1920&q=85&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex; align-items: center; justify-content: center;
  position: relative; padding: 7rem 2rem 4rem;
}

.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.55) 0%,
    rgba(0,0,0,0.45) 50%,
    rgba(0,0,0,0.75) 100%
  );
}

.hero-content {
  position: relative; z-index: 1;
  max-width: 900px; width: 100%; text-align: center;
}

.hero-badge {
  display: inline-block;
  background: rgba(201,168,76,0.15);
  border: 1px solid rgba(201,168,76,0.4);
  color: #C9A84C; padding: 0.4rem 1.2rem; border-radius: 25px;
  font-size: 0.82rem; font-weight: 600; letter-spacing: 0.06em;
  margin-bottom: 0.75rem;
}

/* Botón descarga app — visible solo en móvil */
.btn-hero-app {
  align-items: center; gap: 0.4rem;
  margin: 0 auto 1.25rem;
  padding: 0.5rem 1.4rem;
  border-radius: 25px;
  border: 1px solid rgba(201,168,76,0.4);
  color: rgba(201,168,76,0.85);
  background: rgba(201,168,76,0.08);
  font-size: 0.85rem; font-weight: 600;
  text-decoration: none; transition: all 0.2s;
}
.btn-hero-app:hover { border-color: #C9A84C; background: rgba(201,168,76,0.15); color: #C9A84C; }

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 700; color: #fff;
  line-height: 1.15; margin-bottom: 1rem;
  text-shadow: 0 2px 20px rgba(0,0,0,0.5);
}
.hero-accent { color: #C9A84C; font-style: italic; }

.hero-sub {
  font-size: 1rem; color: rgba(255,255,255,0.75);
  margin-bottom: 2.5rem; line-height: 1.7;
  letter-spacing: 0.02em;
}

/* ── BUSCADOR ─────────────────────────────────────────────── */
.buscador {
  background: rgba(10,10,10,0.88);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 20px;
  padding: 1.75rem 2rem;
  box-shadow: 0 24px 60px rgba(0,0,0,0.6);
  text-align: left;
}

.buscador-titulo {
  font-size: 0.95rem; font-weight: 600;
  color: #C9A84C; margin-bottom: 1.25rem;
  text-align: center; letter-spacing: 0.04em;
  text-transform: uppercase; font-size: 0.78rem;
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
  font-size: 0.68rem; font-weight: 700;
  color: rgba(201,168,76,0.7);
  text-transform: uppercase; letter-spacing: 0.07em;
}

.campo-input {
  padding: 0.65rem 0.85rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  font-size: 0.875rem; color: #fff;
  background: rgba(255,255,255,0.06);
  outline: none; transition: border-color 0.2s;
  font-family: 'Inter', sans-serif;
}
.campo-input:focus { border-color: #C9A84C; background: rgba(201,168,76,0.06); }
.campo-input option { background: #1a1a1a; color: #fff; }

.buscador-sep {
  font-size: 1.2rem; color: rgba(201,168,76,0.5);
  padding-bottom: 0.65rem; flex-shrink: 0;
}

.btn-buscar {
  padding: 0.7rem 1.75rem;
  background: linear-gradient(135deg, #C9A84C, #A8882A);
  color: #0A0A0A; border: none; border-radius: 10px;
  font-size: 0.95rem; font-weight: 800;
  cursor: pointer; transition: all 0.2s;
  white-space: nowrap; flex-shrink: 0;
  box-shadow: 0 4px 18px rgba(201,168,76,0.35);
  letter-spacing: 0.02em;
}
.btn-buscar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(201,168,76,0.5);
}
.btn-buscar:disabled { opacity: 0.5; cursor: not-allowed; }

.buscador-error {
  margin-top: 0.75rem; font-size: 0.82rem;
  color: #fca5a5; text-align: center;
}

/* ── FEATURES ─────────────────────────────────────────────── */
.features {
  background: #111111;
  border-top: 1px solid rgba(201,168,76,0.1);
  border-bottom: 1px solid rgba(201,168,76,0.1);
  padding: 1.1rem 2rem;
}

.features-container {
  max-width: 1100px; margin: 0 auto;
  display: flex; justify-content: center;
  gap: 2.5rem; flex-wrap: wrap;
}

.feature-item {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.82rem; color: rgba(255,255,255,0.55);
  font-weight: 500; letter-spacing: 0.02em;
}
.feature-ico { font-size: 1rem; }
.feature-txt { white-space: nowrap; }

/* ── RESULTADOS ───────────────────────────────────────────── */
.resultados { padding: 5rem 2rem; background: #0A0A0A; }
.resultados-container { max-width: 1100px; margin: 0 auto; }

.resultados-header { text-align: center; margin-bottom: 2.5rem; }
.resultados-header h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.9rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;
}
.resultados-fechas { font-size: 0.88rem; color: rgba(201,168,76,0.7); letter-spacing: 0.02em; }

.estado-cargando {
  text-align: center; padding: 4rem;
  color: rgba(255,255,255,0.5); font-size: 1rem;
}

.spinner-grande {
  width: 48px; height: 48px;
  border: 3px solid rgba(201,168,76,0.2);
  border-top-color: #C9A84C;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

.spinner-btn {
  display: inline-block; width: 16px; height: 16px;
  border: 2px solid rgba(10,10,10,0.3);
  border-top-color: #0A0A0A;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.sin-disponibilidad {
  text-align: center; padding: 4rem;
  background: rgba(255,255,255,0.03);
  border-radius: 16px;
  border: 1px dashed rgba(201,168,76,0.2);
}
.sin-disp-ico { font-size: 3rem; margin-bottom: 1rem; }
.sin-disponibilidad p { color: rgba(255,255,255,0.6); }
.sin-disp-sub { color: rgba(255,255,255,0.35) !important; font-size: 0.9rem; margin-top: 0.5rem; }

/* ── HABITACIONES GRID ────────────────────────────────────── */
.habitaciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}

.hab-card {
  background: #141414;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(201,168,76,0.12);
  transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
}
.hab-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  border-color: rgba(201,168,76,0.35);
}

.hab-card-img {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}
.hab-card-img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%);
}

.hab-tipo-badge {
  position: absolute; top: 1rem; left: 1rem;
  background: rgba(201,168,76,0.9);
  color: #0A0A0A; padding: 0.3rem 0.85rem; border-radius: 20px;
  font-size: 0.72rem; font-weight: 800; letter-spacing: 0.06em;
  text-transform: uppercase;
}

.hab-card-body { padding: 1.35rem; }

.hab-card-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 0.6rem;
}
.hab-nombre {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem; font-weight: 700; color: #fff; margin: 0;
}
.hab-numero {
  font-size: 0.72rem;
  background: rgba(201,168,76,0.12);
  color: #C9A84C; padding: 0.2rem 0.65rem;
  border-radius: 6px; font-weight: 600;
  border: 1px solid rgba(201,168,76,0.2);
}

.hab-descripcion {
  font-size: 0.82rem; color: rgba(255,255,255,0.5);
  line-height: 1.6; margin-bottom: 0.75rem;
}

.hab-detalles {
  display: flex; gap: 0.65rem; margin-bottom: 1rem; flex-wrap: wrap;
}
.hab-detalle {
  font-size: 0.73rem; color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.05);
  padding: 0.25rem 0.65rem;
  border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);
}

.hab-card-footer {
  border-top: 1px solid rgba(255,255,255,0.07);
  padding-top: 1rem;
}

.hab-precio {
  display: flex; align-items: baseline; gap: 0.3rem; margin-bottom: 0.2rem;
}
.precio-monto { font-size: 1.6rem; font-weight: 800; color: #C9A84C; }
.precio-noche { font-size: 0.8rem; color: rgba(255,255,255,0.35); }
.precio-total { font-size: 0.82rem; color: rgba(255,255,255,0.4); margin-bottom: 0.9rem; }
.precio-total strong { color: rgba(255,255,255,0.8); }

.btn-reservar {
  width: 100%; padding: 0.8rem;
  background: linear-gradient(135deg, #C9A84C, #A8882A);
  color: #0A0A0A; border: none; border-radius: 10px;
  font-size: 0.9rem; font-weight: 800;
  cursor: pointer; transition: all 0.25s;
  letter-spacing: 0.02em;
}
.btn-reservar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(201,168,76,0.4);
}

/* ── INFO HOTEL ───────────────────────────────────────────── */
.info-hotel {
  padding: 5rem 2rem;
  background: #111111;
  border-top: 1px solid rgba(201,168,76,0.1);
}

.info-container {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;
  align-items: center;
}

.info-texto h2 {
  font-family: 'Playfair Display', serif;
  font-size: 2rem; font-weight: 700;
  margin-bottom: 1rem; color: #C9A84C;
}
.info-texto p { color: rgba(255,255,255,0.6); line-height: 1.85; margin-bottom: 2rem; }

.info-stats { display: flex; gap: 2.5rem; flex-wrap: wrap; }
.stat { display: flex; flex-direction: column; gap: 0.25rem; }
.stat-num { font-size: 1.9rem; font-weight: 800; color: #C9A84C; }
.stat-lbl { font-size: 0.76rem; color: rgba(255,255,255,0.4); letter-spacing: 0.03em; }

.info-card-stack { display: flex; flex-direction: column; gap: 1rem; }

.info-card {
  display: flex; align-items: center; gap: 1rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 1rem 1.25rem;
  transition: transform 0.2s, border-color 0.2s;
}
.info-card:hover { transform: translateX(6px); border-color: rgba(201,168,76,0.25); }
.info-card.azul   { border-left: 3px solid #60a5fa; }
.info-card.naranja{ border-left: 3px solid #C9A84C; }
.info-card.verde  { border-left: 3px solid #4ade80; }
.info-card-ico { font-size: 1.75rem; flex-shrink: 0; }
.info-card-titulo { font-size: 0.9rem; font-weight: 600; color: #fff; }
.info-card-sub { font-size: 0.78rem; color: rgba(255,255,255,0.4); }

/* ── FOOTER ───────────────────────────────────────────────── */
.footer {
  background: #050505;
  border-top: 1px solid rgba(201,168,76,0.1);
  text-align: center;
  padding: 2.5rem 2rem;
  color: rgba(255,255,255,0.35);
}
.footer-brand {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem; color: #C9A84C; margin-bottom: 0.5rem;
}
.footer-sub { font-size: 0.78rem; line-height: 2; }

/* ── RESPONSIVE ───────────────────────────────────────────── */
@media (max-width: 900px) {
  .info-container { grid-template-columns: 1fr; gap: 2.5rem; }
}

@media (max-width: 768px) {
  .navbar { padding: 0.75rem 1rem; }
  .nav-links { gap: 0.4rem; }
  .btn-nav { padding: 0.35rem 0.75rem; font-size: 0.78rem; }
  .btn-nav.app { display: none; }
  .btn-hero-app { display: inline-flex; }
  .hero { padding: 6rem 1rem 3rem; background-attachment: scroll; }
  .buscador { padding: 1.25rem; }
  .buscador-campos { flex-direction: column; }
  .buscador-sep { display: none; }
  .campo-grupo { min-width: auto; }
  .btn-buscar { width: 100%; }
  .features-container { gap: 1.25rem; }
  .habitaciones-grid { grid-template-columns: 1fr; }
  .resultados { padding: 3rem 1rem; }
  .info-hotel { padding: 3rem 1rem; }
  .info-stats { gap: 1.5rem; }
}

@media (max-width: 380px) {
  .brand-logo { height: 36px; }
  .btn-nav { padding: 0.3rem 0.55rem; font-size: 0.72rem; }
}

/* ── TOAST ────────────────────────────────────────────────── */
.toast-notif {
  position: fixed; bottom: 2rem; left: 2rem; z-index: 999;
  display: flex; align-items: center; gap: 0.75rem;
  background: #1a1a1a;
  border: 1px solid rgba(201,168,76,0.25);
  border-radius: 14px; padding: 0.85rem 1rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  max-width: 280px; min-width: 240px;
}

.toast-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg, #C9A84C, #A8882A);
  color: #0A0A0A; font-size: 0.85rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.toast-body { flex: 1; }
.toast-nombre { font-size: 0.8rem; font-weight: 700; color: #fff; margin: 0 0 0.15rem; }
.toast-hab { font-size: 0.75rem; color: #C9A84C; font-weight: 600; margin: 0 0 0.15rem; }
.toast-tiempo { font-size: 0.7rem; color: rgba(255,255,255,0.35); margin: 0; }

.toast-close {
  background: none; border: none; font-size: 1.1rem;
  color: rgba(255,255,255,0.3); cursor: pointer; padding: 0;
  line-height: 1; flex-shrink: 0; transition: color 0.2s;
}
.toast-close:hover { color: #C9A84C; }

.toast-enter-active { animation: slideInLeft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { animation: slideOutLeft 0.3s ease-in forwards; }

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-110%); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes slideOutLeft {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(-110%); }
}

@media (max-width: 480px) {
  .toast-notif { bottom: 1rem; left: 1rem; right: 1rem; max-width: none; }
}

/* Botón hero app — desktop oculto */
@media (min-width: 769px) {
  .btn-hero-app { display: none; }
}
</style>
