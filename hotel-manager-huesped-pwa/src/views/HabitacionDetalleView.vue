<template>
  <div class="page">

    <header class="header">
      <button class="btn-volver" @click="router.back()">←</button>
      <div class="brand">Hotel Manager</div>
      <div style="width:32px"></div>
    </header>

    <div v-if="cargando" class="estado-cargando">
      <div class="spinner"></div>
      <p>Cargando habitación...</p>
    </div>

    <div v-else-if="habitacion" class="detalle">

      <!-- FOTO HERO -->
      <div class="foto-hero">
        <img :src="imagenTipo(habitacion.tipo)" :alt="habitacion.tipo" />
        <div class="foto-overlay"></div>
        <div class="foto-badge">{{ habitacion.tipo }}</div>
      </div>

      <div class="detalle-body">

        <!-- TITULO Y PRECIO -->
        <div class="detalle-header">
          <div class="detalle-titulo-grupo">
            <h1 class="detalle-titulo">Habitación {{ habitacion.numero }}</h1>
            <div class="detalle-estrellas">★★★★★</div>
          </div>
          <div class="detalle-precio-grupo">
            <span class="precio-valor">${{ formatPrecio(habitacion.precioNoche) }}</span>
            <span class="precio-label">/ noche</span>
          </div>
        </div>

        <!-- DESCRIPCIÓN -->
        <div class="seccion">
          <h3 class="seccion-titulo">Descripción</h3>
          <p class="detalle-desc">{{ habitacion.descripcion || descripcionPorTipo(habitacion.tipo) }}</p>
        </div>

        <!-- AMENIDADES -->
        <div class="seccion">
          <h3 class="seccion-titulo">Incluye</h3>
          <div class="amenidades-grid">
            <div v-for="a in amenidadesPorTipo(habitacion.tipo)" :key="a.label" class="amenidad">
              <span class="amenidad-ico">{{ a.ico }}</span>
              <span class="amenidad-lbl">{{ a.label }}</span>
            </div>
          </div>
        </div>

        <!-- RESUMEN RESERVA -->
        <div class="seccion">
          <h3 class="seccion-titulo">Tu reserva</h3>
          <div class="resumen-card">
            <div class="resumen-fila">
              <div class="resumen-bloque">
                <span class="resumen-label">🌅 Llegada</span>
                <span class="resumen-valor">{{ formatFecha(entrada) }}</span>
                <span class="resumen-hora">{{ formatHora(horaEntrada) }}</span>
              </div>
              <div class="resumen-sep">→</div>
              <div class="resumen-bloque">
                <span class="resumen-label">🌙 Salida</span>
                <span class="resumen-valor">{{ formatFecha(salida) }}</span>
                <span class="resumen-hora">{{ formatHora(horaSalida) }}</span>
              </div>
            </div>
            <div class="resumen-noches">
              <span>{{ noches }} noche{{ noches !== 1 ? 's' : '' }}</span>
              <span class="resumen-total">${{ formatPrecio(habitacion.precioNoche * noches) }}</span>
            </div>
          </div>
        </div>

        <!-- BOTÓN RESERVAR -->
        <button class="btn-confirmar" @click="irAReservar">
          Reservar esta habitación →
        </button>

      </div>
    </div>

    <div v-else class="estado-error">
      <p>No se pudo cargar la habitación.</p>
      <button @click="router.back()">Volver</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { habitacionService } from '../api/services'

const route  = useRoute()
const router = useRouter()

const habitacion = ref(null)
const cargando   = ref(true)

const entrada    = route.query.entrada    || ''
const salida     = route.query.salida     || ''
const horaEntrada = route.query.horaEntrada || '15:00'
const horaSalida  = route.query.horaSalida  || '12:00'

const noches = computed(() => {
  if (!entrada || !salida) return 1
  return Math.max(1, Math.round((new Date(salida) - new Date(entrada)) / 86400000))
})

onMounted(async () => {
  try {
    const res = await habitacionService.obtener(route.params.id)
    habitacion.value = res.data
  } catch {
    habitacion.value = null
  } finally {
    cargando.value = false
  }
})

function irAReservar() {
  router.push({
    name: 'reservar',
    query: {
      idHabitacion: habitacion.value.id,
      entrada,
      salida,
      horaEntrada,
      horaSalida,
    }
  })
}

function imagenTipo(tipo) {
  const fotos = {
    Suite:    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80&auto=format&fit=crop',
    Doble:    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=80&auto=format&fit=crop',
    Triple:   'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80&auto=format&fit=crop',
    Sencilla: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80&auto=format&fit=crop',
  }
  return fotos[tipo] || fotos.Doble
}

function descripcionPorTipo(tipo) {
  const desc = {
    Suite:    'Nuestra suite premium ofrece el máximo confort con acabados de lujo, vista panorámica y espacios amplios para una estadía inolvidable.',
    Doble:    'Habitación doble con camas confortables, diseño moderno y todos los servicios necesarios para una estancia perfecta en Cali.',
    Triple:   'Ideal para familias o grupos de amigos. Amplia habitación con tres camas, espacio generoso y todas las comodidades del hogar.',
    Sencilla: 'Habitación individual acogedora, perfecta para viajeros de negocios o solo. Práctica, cómoda y con excelente relación calidad-precio.',
  }
  return desc[tipo] || 'Habitación confortable con todos los servicios incluidos.'
}

function amenidadesPorTipo(tipo) {
  const base = [
    { ico: '📶', label: 'WiFi gratis' },
    { ico: '❄️', label: 'Aire acondicionado' },
    { ico: '📺', label: 'TV cable' },
    { ico: '🍳', label: 'Desayuno incluido' },
    { ico: '🔒', label: 'Caja fuerte' },
    { ico: '🅿️', label: 'Parqueadero' },
  ]
  const extra = {
    Suite:    [{ ico: '🛁', label: 'Jacuzzi' }, { ico: '🍾', label: 'Mini bar' }, { ico: '🛎️', label: 'Room service' }],
    Doble:    [{ ico: '🪟', label: 'Vista exterior' }],
    Triple:   [{ ico: '👨‍👩‍👧', label: 'Apto familias' }],
    Sencilla: [],
  }
  return [...base, ...(extra[tipo] || [])]
}

function formatPrecio(n) {
  return Number(n).toLocaleString('es-CO')
}

function formatFecha(f) {
  if (!f) return '—'
  return new Date(f + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatHora(h) {
  if (!h) return ''
  const [hh, mm] = h.split(':')
  const hora = parseInt(hh)
  const periodo = hora >= 12 ? 'PM' : 'AM'
  const h12 = hora > 12 ? hora - 12 : hora === 0 ? 12 : hora
  return `${h12}:${mm} ${periodo}`
}
</script>

<style scoped>
* { box-sizing: border-box; }

.page {
  min-height: 100vh;
  background: #0A0A0A;
  font-family: 'Inter', sans-serif;
  color: #fff;
}

/* ── HEADER ── */
.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center;
  height: 64px; padding: 0 1.25rem;
  background: rgba(10,10,10,0.92);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(201,168,76,0.15);
}
.btn-volver {
  background: none; border: none; color: rgba(255,255,255,0.6);
  font-size: 1.3rem; cursor: pointer; padding: 0.25rem 0.5rem;
  transition: color 0.2s;
}
.btn-volver:hover { color: #C9A84C; }
.brand {
  font-family: 'Playfair Display', serif;
  font-size: 1rem; font-weight: 600; color: #C9A84C;
}

/* ── FOTO HERO ── */
.foto-hero {
  position: relative; height: 320px; margin-top: 64px;
}
.foto-hero img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.foto-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 40%, rgba(10,10,10,0.8));
}
.foto-badge {
  position: absolute; bottom: 1rem; left: 1.25rem;
  background: rgba(201,168,76,0.15);
  border: 1px solid rgba(201,168,76,0.4);
  color: #C9A84C; font-size: 0.75rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  padding: 0.35rem 0.85rem; border-radius: 20px;
  backdrop-filter: blur(8px);
}

/* ── CUERPO ── */
.detalle-body {
  padding: 1.5rem 1.25rem 3rem;
  max-width: 700px; margin: 0 auto;
}

.detalle-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 2rem;
}
.detalle-titulo {
  font-family: 'Playfair Display', serif;
  font-size: 1.7rem; font-weight: 700; color: #fff; margin-bottom: 0.3rem;
}
.detalle-estrellas { color: #C9A84C; font-size: 0.8rem; letter-spacing: 0.1em; }
.precio-valor { font-size: 1.6rem; font-weight: 800; color: #C9A84C; }
.precio-label { font-size: 0.72rem; color: rgba(255,255,255,0.4); display: block; text-align: right; }

/* ── SECCIONES ── */
.seccion { margin-bottom: 2rem; }
.seccion-titulo {
  font-size: 0.72rem; font-weight: 700; color: rgba(255,255,255,0.4);
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.85rem;
  padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.06);
}
.detalle-desc {
  font-size: 0.9rem; color: rgba(255,255,255,0.6); line-height: 1.8;
}

/* ── AMENIDADES ── */
.amenidades-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem;
}
.amenidad {
  display: flex; align-items: center; gap: 0.65rem;
  padding: 0.65rem 0.85rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
}
.amenidad-ico { font-size: 1.1rem; }
.amenidad-lbl { font-size: 0.78rem; color: rgba(255,255,255,0.7); }

/* ── RESUMEN ── */
.resumen-card {
  background: rgba(201,168,76,0.06);
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 16px; padding: 1.25rem;
}
.resumen-fila {
  display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;
}
.resumen-bloque { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
.resumen-label { font-size: 0.65rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.06em; }
.resumen-valor { font-size: 0.9rem; font-weight: 600; color: #fff; }
.resumen-hora  { font-size: 0.75rem; color: #C9A84C; }
.resumen-sep   { color: rgba(201,168,76,0.4); font-size: 1rem; flex-shrink: 0; }
.resumen-noches {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 0.85rem; border-top: 1px solid rgba(201,168,76,0.15);
  font-size: 0.82rem; color: rgba(255,255,255,0.5);
}
.resumen-total { font-size: 1.2rem; font-weight: 800; color: #C9A84C; }

/* ── BOTÓN ── */
.btn-confirmar {
  width: 100%; padding: 1rem;
  background: linear-gradient(135deg, #C9A84C, #A8882A);
  color: #0A0A0A; border: none; border-radius: 14px;
  font-size: 1rem; font-weight: 800; cursor: pointer;
  letter-spacing: 0.02em; transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(201,168,76,0.35);
  margin-top: 0.5rem;
}
.btn-confirmar:hover { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(201,168,76,0.5); }

/* ── ESTADOS ── */
.estado-cargando, .estado-error {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 60vh; gap: 1rem;
  color: rgba(255,255,255,0.4);
}
.spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid rgba(201,168,76,0.2);
  border-top-color: #C9A84C;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── DESKTOP ── */
@media (min-width: 769px) {
  .foto-hero { height: 480px; }
  .detalle-body { padding: 2.5rem 2rem 4rem; }
  .amenidades-grid { grid-template-columns: repeat(3, 1fr); }
  .resumen-fila { gap: 2rem; }
}
</style>
