<template>
  <div class="inicio">

    <!-- NAVBAR -->
    <nav class="navbar">
      <div class="brand">
        <span class="brand-icon">✦</span>
        <span class="brand-name">Hotel Manager</span>
      </div>
      <div class="nav-links">
        <RouterLink v-if="!auth.isLoggedIn" to="/login" class="btn-login">Iniciar sesión</RouterLink>
        <RouterLink v-if="!auth.isLoggedIn" to="/registro" class="btn-registro">Registrarse</RouterLink>
        <template v-if="auth.isLoggedIn">
          <RouterLink to="/mis-reservas" class="btn-login">Mis reservas</RouterLink>
          <RouterLink to="/perfil" class="btn-registro">{{ auth.nombreCompleto }}</RouterLink>
        </template>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-particles">
          <span v-for="i in 15" :key="i" class="particle" :style="particleStyle(i)"></span>
        </div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">✦ Experiencia de lujo</div>
        <h1 class="hero-title">
          Tu estadía perfecta<br/>
          <span class="hero-accent">te está esperando</span>
        </h1>
        <p class="hero-sub">Reserva en minutos · Gestiona desde tu celular</p>
        <div class="estrellas">★★★★★</div>

        <div class="buscador">
          <div class="buscador-campo">
            <label>◈ Check-in</label>
            <input type="date" v-model="fechaEntrada" :min="hoy" @change="buscar" />
          </div>
          <div class="buscador-div"></div>
          <div class="buscador-campo">
            <label>◈ Check-out</label>
            <input type="date" v-model="fechaSalida" :min="fechaEntrada || hoy" @change="buscar" />
          </div>
          <button class="btn-buscar" @click="buscar" :disabled="cargando">
            <span v-if="cargando" class="spinner"></span>
            <span v-else>Buscar</span>
          </button>
        </div>
      </div>
    </section>

    <!-- HABITACIONES -->
    <section class="habitaciones-section" v-if="buscado">
      <div class="container">
        <div v-if="error" class="error-msg">⚠ {{ error }}</div>

        <div v-if="habitaciones.length === 0 && !cargando" class="vacio">
          <div class="vacio-icon">○</div>
          <p>No hay habitaciones disponibles para esas fechas</p>
        </div>

        <template v-else>
          <div class="seccion-header">
            <div class="linea"></div>
            <h2>Habitaciones disponibles</h2>
            <div class="linea"></div>
          </div>

          <div class="hab-grid">
            <div
              v-for="hab in habitaciones"
              :key="hab.id"
              class="hab-card"
              @click="irAReservar(hab)"
            >
              <div class="card-badge">{{ hab.tipo }}</div>
              <div class="card-icon">{{ iconoTipo(hab.tipo) }}</div>
              <div class="card-body">
                <h3>{{ hab.tipo }}</h3>
                <span class="card-num">Hab. {{ hab.numero }}</span>
                <p class="card-desc">{{ hab.descripcionTipo }}</p>
                <div class="card-detalles">
                  <span>▲ Piso {{ hab.piso }}</span>
                  <span>◉ {{ hab.capacidad }} persona(s)</span>
                </div>
                <div class="card-estrellas">★★★★★</div>
              </div>
              <div class="card-footer">
                <div class="precio">
                  <span class="precio-desde">desde</span>
                  <span class="precio-monto">${{ formatPrecio(hab.precioNoche) }}</span>
                  <span class="precio-label">/noche</span>
                </div>
                <button class="btn-reservar">Reservar</button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- ESTADO INICIAL -->
    <section class="inicio-estado" v-if="!buscado">
      <div class="container">
        <div class="vacio">
          <div class="vacio-icon">◈</div>
          <p class="vacio-titulo">Selecciona tus fechas</p>
          <p class="vacio-sub">Descubre nuestras habitaciones disponibles</p>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHuespedAuthStore } from '../stores/auth'
import { habitacionService } from '../api/services'

const router = useRouter()
const auth   = useHuespedAuthStore()

const fechaEntrada  = ref('')
const fechaSalida   = ref('')
const habitaciones  = ref([])
const cargando      = ref(false)
const error         = ref('')
const buscado       = ref(false)

const hoy = computed(() => new Date().toISOString().split('T')[0])

function particleStyle(i) {
  return {
    left: `${(i * 17 + 5) % 100}%`,
    top:  `${(i * 23 + 10) % 100}%`,
    animationDelay: `${(i * 0.4) % 4}s`,
    width:  i % 3 === 0 ? '3px' : '2px',
    height: i % 3 === 0 ? '3px' : '2px',
  }
}

function iconoTipo(tipo) {
  return { 'Suite': '◆', 'Doble': '◈', 'Triple': '⬡', 'Sencilla': '○' }[tipo] || '◈'
}

async function buscar() {
  if (!fechaEntrada.value || !fechaSalida.value) return
  if (fechaSalida.value <= fechaEntrada.value) {
    error.value = 'La fecha de salida debe ser posterior a la entrada'
    return
  }
  cargando.value = true
  error.value    = ''
  buscado.value  = true
  try {
    const res = await habitacionService.listarDisponibles(fechaEntrada.value, fechaSalida.value)
    habitaciones.value = res.data
  } catch {
    error.value = 'Error al buscar habitaciones'
  } finally {
    cargando.value = false
  }
}

function irAReservar(hab) {
  router.push({
    name: 'reservar',
    query: { idHabitacion: hab.id, entrada: fechaEntrada.value, salida: fechaSalida.value }
  })
}

function formatPrecio(v) {
  return Number(v).toLocaleString('es-CO')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Montserrat:wght@300;400;500;600&display=swap');

.inicio { min-height: 100vh; background: var(--dark); }

/* NAVBAR */
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(10,10,10,0.9);
  border-bottom: 1px solid rgba(201,168,76,0.1);
  backdrop-filter: blur(20px);
}

.brand { display: flex; align-items: center; gap: 0.5rem; }
.brand-icon { color: var(--gold); font-size: 0.85rem; }
.brand-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1rem; letter-spacing: 0.15em;
  text-transform: uppercase; color: var(--text);
}

.nav-links { display: flex; align-items: center; gap: 0.75rem; }

.btn-login {
  font-size: 0.7rem; font-weight: 500; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--gold);
  border: 1px solid rgba(201,168,76,0.3);
  padding: 0.45rem 1rem; border-radius: 4px; transition: all 0.2s;
}
.btn-login:hover { background: rgba(201,168,76,0.1); }

.btn-registro {
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--dark);
  background: var(--gold); padding: 0.45rem 1rem;
  border-radius: 4px; transition: all 0.2s;
}
.btn-registro:hover { background: var(--gold-light); }

/* HERO */
.hero {
  min-height: 100vh; position: relative;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; padding-top: 60px;
}

.hero-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,168,76,0.05) 0%, transparent 70%),
              linear-gradient(160deg, #080808 0%, #111108 50%, #080808 100%);
}

.hero-particles { position: absolute; inset: 0; pointer-events: none; }
.particle {
  position: absolute; background: var(--gold); border-radius: 50%;
  animation: float 6s ease-in-out infinite; opacity: 0.2;
}
@keyframes float {
  0%,100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.4); }
}

.hero-content {
  position: relative; z-index: 2;
  text-align: center; padding: 2rem 1.5rem; max-width: 700px;
  animation: fadeUp 0.8s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.hero-badge {
  display: inline-block; font-size: 0.62rem; font-weight: 500;
  letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold);
  border: 1px solid rgba(201,168,76,0.3); padding: 0.35rem 1rem;
  border-radius: 20px; margin-bottom: 1.5rem;
}

.hero-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 8vw, 3.5rem);
  font-weight: 300; line-height: 1.15; color: var(--text);
  margin-bottom: 1rem;
}
.hero-accent { color: var(--gold); font-style: italic; }

.hero-sub {
  font-size: 0.78rem; color: var(--text-muted);
  letter-spacing: 0.15em; text-transform: uppercase;
  margin-bottom: 1.25rem;
}

.estrellas {
  font-size: 0.85rem; color: var(--gold);
  letter-spacing: 0.3em; margin-bottom: 2.5rem; opacity: 0.8;
}

/* BUSCADOR */
.buscador {
  display: flex; align-items: stretch;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 8px; overflow: hidden;
  flex-wrap: wrap;
}

.buscador-campo {
  flex: 1; min-width: 140px; padding: 1rem 1.25rem;
  display: flex; flex-direction: column; gap: 0.35rem;
}

.buscador-campo label {
  font-size: 0.6rem; font-weight: 500; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--gold);
}

.buscador-campo input {
  background: transparent; border: none; outline: none;
  color: var(--text); font-family: 'Montserrat', sans-serif;
  font-size: 0.875rem; font-weight: 300; color-scheme: dark;
}

.buscador-div { width: 1px; background: rgba(201,168,76,0.15); margin: 0.75rem 0; }

.btn-buscar {
  background: var(--gold); color: var(--dark); border: none;
  padding: 1rem 1.5rem; font-family: 'Montserrat', sans-serif;
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.2em;
  text-transform: uppercase; cursor: pointer; transition: all 0.2s;
  min-width: 120px; display: flex; align-items: center;
  justify-content: center; gap: 0.5rem;
}
.btn-buscar:hover:not(:disabled) { background: var(--gold-light); }
.btn-buscar:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(0,0,0,0.3); border-top-color: var(--dark);
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* HABITACIONES */
.habitaciones-section { padding: 4rem 1.5rem; background: #141210; }
.inicio-estado { padding: 4rem 1.5rem; background: #141210; }
.container { max-width: 900px; margin: 0 auto; }

.seccion-header {
  display: flex; align-items: center; gap: 1.25rem; margin-bottom: 2.5rem;
}
.linea { flex: 1; height: 1px; background: rgba(201,168,76,0.2); }
.seccion-header h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem; font-weight: 300; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--text); white-space: nowrap;
}

.vacio { text-align: center; padding: 4rem 2rem; }
.vacio-icon { font-size: 2rem; color: var(--gold); opacity: 0.4; margin-bottom: 1rem; }
.vacio-titulo {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem; font-weight: 300; color: var(--text); margin-bottom: 0.5rem;
}
.vacio-sub { font-size: 0.8rem; color: var(--text-muted); }

.error-msg {
  background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.2);
  border-radius: 4px; padding: 0.75rem 1rem; font-size: 0.85rem;
  color: #FCA5A5; margin-bottom: 1.5rem;
}

.hab-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}

.hab-card {
  background: #1C1A17; border: 1px solid rgba(201,168,76,0.12);
  border-radius: 8px; overflow: hidden; cursor: pointer;
  transition: all 0.3s; position: relative;
}
.hab-card:hover {
  border-color: rgba(201,168,76,0.4); transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.5);
}

.card-badge {
  position: absolute; top: 0.75rem; right: 0.75rem;
  font-size: 0.58rem; font-weight: 600; letter-spacing: 0.15em;
  text-transform: uppercase; color: var(--gold);
  background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.2);
  padding: 0.25rem 0.6rem; border-radius: 20px;
}

.card-icon {
  padding: 1.5rem 1.25rem 0.75rem;
  font-size: 1.5rem; color: var(--gold);
  border-bottom: 1px solid rgba(201,168,76,0.08);
  width: 52px; height: 52px;
  background: rgba(201,168,76,0.08); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 1.5rem 1.25rem 0.75rem;
}

.card-body { padding: 0.75rem 1.25rem 0; }
.card-body h3 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem; font-weight: 400; color: var(--text);
}
.card-num { font-size: 0.7rem; color: var(--text-muted); }
.card-desc { font-size: 0.78rem; color: #7A7060; line-height: 1.6; margin: 0.5rem 0; }
.card-detalles { display: flex; gap: 1rem; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.5rem; }
.card-estrellas { font-size: 0.6rem; color: var(--gold); letter-spacing: 0.15em; opacity: 0.6; }

.card-footer {
  padding: 0.85rem 1.25rem;
  border-top: 1px solid rgba(201,168,76,0.08);
  display: flex; justify-content: space-between; align-items: center;
}

.precio { display: flex; align-items: baseline; gap: 0.25rem; }
.precio-desde { font-size: 0.62rem; color: var(--text-muted); }
.precio-monto {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.3rem; font-weight: 600; color: var(--gold);
}
.precio-label { font-size: 0.65rem; color: var(--text-muted); }

.btn-reservar {
  background: transparent; color: var(--gold);
  border: 1px solid rgba(201,168,76,0.35);
  border-radius: 2px; padding: 0.45rem 1rem;
  font-size: 0.62rem; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; transition: all 0.2s;
}
.btn-reservar:hover { background: var(--gold); color: var(--dark); }
</style>