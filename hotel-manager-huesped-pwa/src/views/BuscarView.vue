<template>
  <div class="page">

    <header class="header">
      <RouterLink to="/mis-reservas" class="btn-volver">←</RouterLink>
      <div class="brand">🏨 Hotel Manager</div>
      <div style="width:32px"></div>
    </header>

    <!-- NAV BOTTOM -->
    <nav class="bottom-nav">
      <RouterLink to="/buscar" class="nav-item active">
        <span class="nav-icon">◈</span>
        <span>Reservar</span>
      </RouterLink>
      <RouterLink to="/mis-reservas" class="nav-item">
        <span class="nav-icon">≡</span>
        <span>Mis reservas</span>
      </RouterLink>
      <RouterLink to="/perfil" class="nav-item">
        <span class="nav-icon">◉</span>
        <span>Perfil</span>
      </RouterLink>
    </nav>

    <main class="main">

      <!-- ── PASO 1: FECHAS ── -->
      <Transition name="slide">
        <div v-if="paso === 1" class="paso" key="paso1">

          <div class="paso-header">
            <h1 class="paso-titulo">¿Cuándo te<br><span class="acento">hospedas?</span></h1>
            <p class="paso-sub">Elige tus fechas para ver habitaciones disponibles</p>
          </div>

          <div class="fechas-grid">
            <!-- Check-in -->
            <div class="fecha-card" :class="{ activo: campoActivo === 'entrada' }">
              <div class="fecha-card-label">📅 Check-in</div>
              <input
                type="date"
                v-model="fechaEntrada"
                :min="hoy"
                class="fecha-input"
                @focus="campoActivo = 'entrada'"
                @blur="campoActivo = ''"
                @change="onEntradaChange"
              />
              <div class="fecha-display">{{ fechaEntrada ? formatFechaCorta(fechaEntrada) : 'Seleccionar' }}</div>
            </div>

            <div class="flecha-sep">→</div>

            <!-- Check-out -->
            <div class="fecha-card" :class="{ activo: campoActivo === 'salida' }">
              <div class="fecha-card-label">📅 Check-out</div>
              <input
                type="date"
                v-model="fechaSalida"
                :min="minSalida"
                class="fecha-input"
                @focus="campoActivo = 'salida'"
                @blur="campoActivo = ''"
              />
              <div class="fecha-display">{{ fechaSalida ? formatFechaCorta(fechaSalida) : 'Seleccionar' }}</div>
            </div>
          </div>

          <!-- Noches -->
          <div v-if="noches > 0" class="noches-badge">
            🌙 {{ noches }} noche{{ noches !== 1 ? 's' : '' }}
          </div>

          <!-- Horas -->
          <div class="horas-grid">
            <div class="hora-grupo">
              <label class="hora-label">🕐 Hora llegada</label>
              <select v-model="horaEntrada" class="hora-select">
                <option v-for="h in horas" :key="h.value" :value="h.value">{{ h.label }}</option>
              </select>
            </div>
            <div class="hora-grupo">
              <label class="hora-label">🕐 Hora salida</label>
              <select v-model="horaSalida" class="hora-select">
                <option v-for="h in horas" :key="h.value" :value="h.value">{{ h.label }}</option>
              </select>
            </div>
          </div>

          <p v-if="errorFechas" class="error-msg">⚠ {{ errorFechas }}</p>

          <button
            class="btn-buscar"
            @click="buscar"
            :disabled="!fechaEntrada || !fechaSalida || cargando"
          >
            <span v-if="cargando" class="spinner"></span>
            <span v-else>🔍 Ver habitaciones disponibles</span>
          </button>

        </div>
      </Transition>

      <!-- ── PASO 2: RESULTADOS ── -->
      <Transition name="slide">
        <div v-if="paso === 2" class="paso" key="paso2">

          <div class="resultados-header">
            <button class="btn-cambiar" @click="paso = 1">← Cambiar fechas</button>
            <div class="fechas-resumen">
              <span>{{ formatFechaCorta(fechaEntrada) }}</span>
              <span class="sep">→</span>
              <span>{{ formatFechaCorta(fechaSalida) }}</span>
              <span class="badge-noches">{{ noches }}n</span>
            </div>
          </div>

          <div v-if="habitaciones.length === 0" class="sin-resultados">
            <div class="sin-ico">😔</div>
            <p>No hay habitaciones disponibles para esas fechas</p>
            <button class="btn-cambiar-fechas" @click="paso = 1">Cambiar fechas</button>
          </div>

          <div v-else class="habitaciones-lista">
            <div class="lista-titulo">
              🏠 {{ habitaciones.length }} habitación{{ habitaciones.length !== 1 ? 'es' : '' }} disponible{{ habitaciones.length !== 1 ? 's' : '' }}
            </div>

            <div
              v-for="hab in habitaciones"
              :key="hab.id"
              class="hab-card"
            >
              <div class="hab-card-top">
                <div class="hab-icon">{{ iconoTipo(hab.tipo) }}</div>
                <div class="hab-info">
                  <div class="hab-tipo">{{ hab.tipo }}</div>
                  <div class="hab-num">Habitación {{ hab.numero }}</div>
                  <div v-if="hab.descripcion" class="hab-desc">{{ hab.descripcion }}</div>
                </div>
                <div class="hab-precio">
                  <div class="precio-noche">${{ formatPrecio(hab.precioNoche) }}</div>
                  <div class="precio-label">/ noche</div>
                </div>
              </div>

              <div class="hab-card-bottom">
                <div class="total-info">
                  Total {{ noches }}n: <strong>${{ formatPrecio(hab.precioNoche * noches) }}</strong>
                </div>
                <button class="btn-reservar" @click="seleccionar(hab)">
                  Reservar →
                </button>
              </div>
            </div>
          </div>

        </div>
      </Transition>

    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { habitacionService } from '../api/services'

const router = useRouter()

const paso         = ref(1)
const fechaEntrada = ref('')
const fechaSalida  = ref('')
const horaEntrada  = ref('15:00')
const horaSalida   = ref('12:00')
const habitaciones = ref([])
const cargando     = ref(false)
const errorFechas  = ref('')
const campoActivo  = ref('')

const hoy = new Date().toISOString().split('T')[0]

const minSalida = computed(() => {
  if (!fechaEntrada.value) return hoy
  const d = new Date(fechaEntrada.value)
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

const noches = computed(() => {
  if (!fechaEntrada.value || !fechaSalida.value) return 0
  return Math.max(0,
    Math.round((new Date(fechaSalida.value) - new Date(fechaEntrada.value)) / 86400000)
  )
})

const horas = computed(() => {
  const lista = []
  for (let h = 0; h < 24; h++) {
    for (let m of [0, 30]) {
      const hStr = String(h).padStart(2, '0')
      const mStr = String(m).padStart(2, '0')
      const periodo = h < 12 ? 'AM' : 'PM'
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      lista.push({ value: `${hStr}:${mStr}`, label: `${h12}:${mStr} ${periodo}` })
    }
  }
  return lista
})

function onEntradaChange() {
  if (fechaSalida.value && fechaSalida.value <= fechaEntrada.value) {
    fechaSalida.value = ''
  }
}

async function buscar() {
  errorFechas.value = ''
  if (!fechaEntrada.value || !fechaSalida.value) {
    errorFechas.value = 'Selecciona las dos fechas'
    return
  }
  if (noches.value <= 0) {
    errorFechas.value = 'La salida debe ser después del ingreso'
    return
  }
  cargando.value = true
  try {
    const res = await habitacionService.listarDisponibles(fechaEntrada.value, fechaSalida.value)
    habitaciones.value = res.data
    paso.value = 2
  } catch {
    errorFechas.value = 'Error al buscar habitaciones. Intenta de nuevo.'
  } finally {
    cargando.value = false
  }
}

function seleccionar(hab) {
  router.push({
    name: 'reservar',
    query: {
      idHabitacion: hab.id,
      entrada:      fechaEntrada.value,
      salida:       fechaSalida.value,
      horaEntrada:  horaEntrada.value,
      horaSalida:   horaSalida.value,
    }
  })
}

function iconoTipo(tipo) {
  return { Suite: '🛏️', Doble: '🛏', Triple: '🏠', Sencilla: '🪑' }[tipo] || '🛏️'
}

function formatFechaCorta(f) {
  if (!f) return ''
  return new Date(f + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short'
  })
}

function formatPrecio(v) {
  return Number(v || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; }

.page {
  min-height: 100vh;
  background: #0A1628;
  font-family: 'Inter', sans-serif;
  color: #fff;
}

/* ── HEADER ── */
.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.25rem;
  background: rgba(10,22,40,0.95); backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.btn-volver {
  background: none; border: none; font-size: 1.3rem;
  color: rgba(255,255,255,0.6); cursor: pointer; padding: 0;
}
.btn-volver:hover { color: #E8773A; }
.brand {
  font-family: 'Playfair Display', serif;
  font-size: 1rem; font-weight: 700; color: #E8773A;
}

/* ── BOTTOM NAV ── */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
  display: flex; justify-content: space-around; align-items: center;
  padding: 0.75rem 0 calc(0.75rem + env(safe-area-inset-bottom));
  background: rgba(10,22,40,0.97); backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255,255,255,0.06);
}
.nav-item {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  color: rgba(255,255,255,0.4); font-size: 0.7rem;
  text-decoration: none; transition: color 0.2s; padding: 0 1rem;
}
.nav-item.active, .nav-item:hover { color: #E8773A; }
.nav-icon { font-size: 1.1rem; }

/* ── MAIN ── */
.main {
  padding: 5rem 1.25rem 5.5rem;
  max-width: 480px; margin: 0 auto;
  min-height: 100vh;
}

/* ── PASO HEADER ── */
.paso-header { margin-bottom: 2rem; }
.paso-titulo {
  font-family: 'Playfair Display', serif;
  font-size: 2rem; font-weight: 700; line-height: 1.2;
  color: #fff; margin-bottom: 0.5rem;
}
.acento { color: #E8773A; font-style: italic; }
.paso-sub { font-size: 0.88rem; color: rgba(255,255,255,0.45); }

/* ── FECHAS ── */
.fechas-grid {
  display: flex; align-items: center; gap: 0.75rem;
  margin-bottom: 1rem;
}
.fecha-card {
  flex: 1; position: relative;
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 14px; padding: 1rem;
  transition: border-color 0.2s, background 0.2s;
  cursor: pointer;
}
.fecha-card.activo {
  border-color: #E8773A;
  background: rgba(232,119,58,0.08);
}
.fecha-card-label {
  font-size: 0.7rem; font-weight: 600;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase; letter-spacing: 0.06em;
  margin-bottom: 0.4rem;
}
.fecha-input {
  position: absolute; inset: 0; opacity: 0;
  width: 100%; height: 100%; cursor: pointer;
}
.fecha-display {
  font-size: 1rem; font-weight: 600; color: #fff;
}
.flecha-sep {
  color: rgba(255,255,255,0.3); font-size: 1.2rem; flex-shrink: 0;
}

.noches-badge {
  display: inline-flex; align-items: center;
  background: rgba(232,119,58,0.15);
  border: 1px solid rgba(232,119,58,0.3);
  color: #E8773A; font-size: 0.82rem; font-weight: 600;
  padding: 0.3rem 0.85rem; border-radius: 50px;
  margin-bottom: 1.25rem;
}

/* ── HORAS ── */
.horas-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.hora-grupo { display: flex; flex-direction: column; gap: 0.4rem; }
.hora-label {
  font-size: 0.72rem; font-weight: 600;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase; letter-spacing: 0.05em;
}
.hora-select {
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 10px; padding: 0.65rem 0.85rem;
  color: #fff; font-size: 0.9rem;
  font-family: 'Inter', sans-serif;
  outline: none; transition: border-color 0.2s;
  appearance: none;
}
.hora-select:focus { border-color: #E8773A; }
.hora-select option { background: #0D1B3E; color: #fff; }

/* ── BTN BUSCAR ── */
.btn-buscar {
  width: 100%; padding: 1rem;
  background: linear-gradient(135deg, #E8773A, #C5602A);
  color: #fff; border: none; border-radius: 14px;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  box-shadow: 0 6px 24px rgba(232,119,58,0.35);
  transition: all 0.2s;
}
.btn-buscar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(232,119,58,0.45);
}
.btn-buscar:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── ERROR ── */
.error-msg {
  padding: 0.75rem 1rem;
  background: rgba(220,38,38,0.1);
  border: 1px solid rgba(220,38,38,0.3);
  border-radius: 10px; color: #fca5a5;
  font-size: 0.85rem; margin-bottom: 1rem;
}

/* ── RESULTADOS HEADER ── */
.resultados-header {
  display: flex; flex-direction: column; gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.btn-cambiar {
  background: none; border: none; color: rgba(255,255,255,0.5);
  font-size: 0.85rem; cursor: pointer; padding: 0;
  text-align: left; font-family: 'Inter', sans-serif;
  transition: color 0.2s;
}
.btn-cambiar:hover { color: #E8773A; }
.fechas-resumen {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.9rem; font-weight: 600; color: #fff;
}
.sep { color: rgba(255,255,255,0.3); }
.badge-noches {
  background: rgba(232,119,58,0.2); color: #E8773A;
  font-size: 0.72rem; font-weight: 700;
  padding: 0.15rem 0.55rem; border-radius: 50px;
}

/* ── LISTA HABITACIONES ── */
.lista-titulo {
  font-size: 0.82rem; font-weight: 600;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase; letter-spacing: 0.05em;
  margin-bottom: 1rem;
}
.habitaciones-lista { display: flex; flex-direction: column; gap: 1rem; }

.hab-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; overflow: hidden;
  transition: border-color 0.2s, background 0.2s;
}
.hab-card:hover {
  border-color: rgba(232,119,58,0.3);
  background: rgba(232,119,58,0.04);
}

.hab-card-top {
  display: flex; align-items: flex-start; gap: 1rem;
  padding: 1.1rem 1.1rem 0.85rem;
}
.hab-icon { font-size: 2rem; flex-shrink: 0; }
.hab-info { flex: 1; }
.hab-tipo {
  font-size: 1rem; font-weight: 700; color: #fff;
  margin-bottom: 2px;
}
.hab-num { font-size: 0.78rem; color: rgba(255,255,255,0.45); margin-bottom: 4px; }
.hab-desc { font-size: 0.78rem; color: rgba(255,255,255,0.35); line-height: 1.4; }
.hab-precio { text-align: right; flex-shrink: 0; }
.precio-noche { font-size: 1.1rem; font-weight: 800; color: #E8773A; }
.precio-label { font-size: 0.68rem; color: rgba(255,255,255,0.35); }

.hab-card-bottom {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem 1.1rem;
  background: rgba(255,255,255,0.03);
  border-top: 1px solid rgba(255,255,255,0.05);
}
.total-info { font-size: 0.82rem; color: rgba(255,255,255,0.45); }
.total-info strong { color: #fff; }

.btn-reservar {
  background: #E8773A; color: #fff;
  border: none; border-radius: 50px;
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem; font-weight: 700;
  cursor: pointer; transition: background 0.2s;
  font-family: 'Inter', sans-serif;
}
.btn-reservar:hover { background: #C5602A; }

/* ── SIN RESULTADOS ── */
.sin-resultados {
  text-align: center; padding: 3rem 1rem;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
}
.sin-ico { font-size: 3rem; }
.sin-resultados p { color: rgba(255,255,255,0.5); font-size: 0.95rem; }
.btn-cambiar-fechas {
  background: rgba(232,119,58,0.15);
  border: 1px solid rgba(232,119,58,0.3);
  color: #E8773A; border-radius: 50px;
  padding: 0.6rem 1.5rem; font-size: 0.9rem; font-weight: 600;
  cursor: pointer; font-family: 'Inter', sans-serif;
  transition: background 0.2s;
}
.btn-cambiar-fechas:hover { background: rgba(232,119,58,0.25); }

/* ── SPINNER ── */
.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── TRANSICIÓN ENTRE PASOS ── */
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from { opacity: 0; transform: translateX(30px); }
.slide-leave-to   { opacity: 0; transform: translateX(-30px); }
</style>
