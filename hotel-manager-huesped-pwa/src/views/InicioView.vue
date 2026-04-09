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
          <div class="buscador-grid">

            <!-- Check-in -->
            <div class="buscador-bloque">
              <div class="bloque-header">
                <span class="bloque-ico">🌅</span>
                <span class="bloque-etiqueta">Llegada</span>
              </div>
              <div class="bloque-campos">
                <div class="campo-grupo">
                  <label class="campo-label">Fecha</label>
                  <input type="date" v-model="fechaEntrada" :min="hoy" class="campo-input" @change="onFechaChange" />
                </div>
                <div class="campo-grupo">
                  <label class="campo-label">Hora</label>
                  <select v-model="horaEntrada" class="campo-input">
                    <option v-for="h in horasDisponibles" :key="h.value" :value="h.value">{{ h.label }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Divisor -->
            <div class="buscador-divisor">→</div>

            <!-- Check-out -->
            <div class="buscador-bloque">
              <div class="bloque-header">
                <span class="bloque-ico">🌙</span>
                <span class="bloque-etiqueta">Salida</span>
              </div>
              <div class="bloque-campos">
                <div class="campo-grupo">
                  <label class="campo-label">Fecha</label>
                  <input type="date" v-model="fechaSalida" :min="fechaEntrada || hoy" class="campo-input" @change="onFechaChange" />
                </div>
                <div class="campo-grupo">
                  <label class="campo-label">Hora</label>
                  <select v-model="horaSalida" class="campo-input">
                    <option v-for="h in horasDisponibles" :key="h.value" :value="h.value">{{ h.label }}</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          <button class="btn-buscar" @click="buscar" :disabled="cargando || !fechaEntrada || !fechaSalida">
            <span v-if="cargando" class="spinner-btn"></span>
            <span v-else>🔍 Buscar disponibilidad</span>
          </button>
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
    <!-- ¿POR QUÉ ELEGIRNOS? -->
    <section class="porque">
      <div class="porque-container">
        <div class="porque-imagen">
          <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&q=80&auto=format&fit=crop" alt="Hotel Manager" />
          <div class="porque-badge-img">
            <span class="badge-num">4.9★</span>
            <span class="badge-txt">Calificación promedio</span>
          </div>
        </div>
        <div class="porque-contenido">
          <p class="porque-sup">¿Por qué elegirnos?</p>
          <h2 class="porque-titulo">Una experiencia que<br><span class="porque-acento">va más allá</span> del hospedaje</h2>
          <p class="porque-desc">En Hotel Manager combinamos confort, seguridad y atención personalizada para hacer de tu estadía en Cali un momento verdaderamente memorable.</p>
          <div class="porque-grid">
            <div class="porque-item">
              <span class="porque-ico">🛏️</span>
              <div>
                <div class="porque-item-titulo">Habitaciones premium</div>
                <div class="porque-item-sub">Diseño moderno y confortable</div>
              </div>
            </div>
            <div class="porque-item">
              <span class="porque-ico">🔒</span>
              <div>
                <div class="porque-item-titulo">Seguridad 24/7</div>
                <div class="porque-item-sub">Vigilancia permanente</div>
              </div>
            </div>
            <div class="porque-item">
              <span class="porque-ico">🍳</span>
              <div>
                <div class="porque-item-titulo">Desayuno incluido</div>
                <div class="porque-item-sub">Menú variado cada día</div>
              </div>
            </div>
            <div class="porque-item">
              <span class="porque-ico">📶</span>
              <div>
                <div class="porque-item-titulo">WiFi alta velocidad</div>
                <div class="porque-item-sub">Conexión en todo el hotel</div>
              </div>
            </div>
            <div class="porque-item">
              <span class="porque-ico">🅿️</span>
              <div>
                <div class="porque-item-titulo">Parqueadero gratuito</div>
                <div class="porque-item-sub">Espacio seguro para tu vehículo</div>
              </div>
            </div>
            <div class="porque-item">
              <span class="porque-ico">🕐</span>
              <div>
                <div class="porque-item-titulo">Check-in flexible</div>
                <div class="porque-item-sub">Elige tu hora de llegada</div>
              </div>
            </div>
          </div>
          <div class="porque-stats">
            <div class="pstat"><span class="pstat-num">500+</span><span class="pstat-lbl">Huéspedes</span></div>
            <div class="pstat-sep"></div>
            <div class="pstat"><span class="pstat-num">4.9★</span><span class="pstat-lbl">Calificación</span></div>
            <div class="pstat-sep"></div>
            <div class="pstat"><span class="pstat-num">24/7</span><span class="pstat-lbl">Atención</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- UBICACIÓN -->
    <section class="ubicacion">
      <div class="ubicacion-container">
        <div class="ubicacion-mapa">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127589.98456789!2d-76.5725!3d3.4516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e30a6f0a0a0a0a0%3A0x1!2sCali%2C+Valle+del+Cauca!5e0!3m2!1ses!2sco!4v1234567890"
            allowfullscreen="" loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
        <div class="ubicacion-info">
          <p class="ubicacion-sup">Encuéntranos</p>
          <h2 class="ubicacion-titulo">Nuestra <span class="ubicacion-acento">ubicación</span></h2>
          <p class="ubicacion-desc">Estamos en el corazón de Cali, cerca de los principales centros comerciales, restaurantes y atractivos turísticos de la ciudad.</p>
          <div class="ubicacion-datos">
            <div class="ubic-dato">
              <span class="ubic-ico">📍</span>
              <div>
                <div class="ubic-titulo">Dirección</div>
                <div class="ubic-sub">Cali, Valle del Cauca, Colombia</div>
              </div>
            </div>
            <div class="ubic-dato">
              <span class="ubic-ico">📞</span>
              <div>
                <div class="ubic-titulo">Teléfono</div>
                <div class="ubic-sub">(2) 123-4567</div>
              </div>
            </div>
            <div class="ubic-dato">
              <span class="ubic-ico">✉️</span>
              <div>
                <div class="ubic-titulo">Email</div>
                <div class="ubic-sub">info@hotelmanager.co</div>
              </div>
            </div>
            <div class="ubic-dato">
              <span class="ubic-ico">🕐</span>
              <div>
                <div class="ubic-titulo">Recepción</div>
                <div class="ubic-sub">Abierto las 24 horas</div>
              </div>
            </div>
          </div>
          <RouterLink v-if="!auth.isLoggedIn" to="/registro" class="btn-reservar-ubic">Reservar ahora</RouterLink>
          <RouterLink v-else to="/buscar" class="btn-reservar-ubic">Buscar habitación</RouterLink>
        </div>
      </div>
    </section>

    <!-- RESEÑAS -->
    <section class="resenas">
      <div class="resenas-header">
        <p class="resenas-sup">Lo que dicen nuestros huéspedes</p>
        <h2 class="resenas-titulo">Opiniones <span class="resenas-acento">reales</span></h2>
        <div class="resenas-estrellas-global">
          <span class="estrellas-num">4.9</span>
          <span class="estrellas-ico">★★★★★</span>
          <span class="estrellas-base">basado en 500+ reseñas</span>
        </div>
      </div>

      <!-- Carrusel infinito -->
      <div class="carrusel-wrapper">
        <div class="carrusel-track">
          <!-- Duplicamos la lista para el loop infinito -->
          <div v-for="r in [...resenas, ...resenas]" class="resena-item">
            <div class="resena-top">
              <div class="resena-avatar">{{ r.inicial }}</div>
              <div class="resena-autor">
                <div class="resena-nombre">{{ r.nombre }}</div>
                <div class="resena-lugar">{{ r.lugar }}</div>
              </div>
              <div class="resena-stars">{{ '★'.repeat(r.estrellas) }}</div>
            </div>
            <p class="resena-texto">"{{ r.texto }}"</p>
            <div class="resena-meta">
              <span class="resena-tipo">{{ r.tipo }}</span>
              <span class="resena-fecha">{{ r.fecha }}</span>
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
      <div class="footer-top">
        <div class="footer-col footer-col-brand">
          <div class="footer-logo">Hotel Manager</div>
          <p class="footer-tagline">Tu hogar lejos de casa en el corazón de Cali.</p>
          <div class="footer-redes">
            <a href="#" class="red-ico" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="#" class="red-ico" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" class="red-ico" aria-label="TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </a>
            <a href="#" class="red-ico" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>
        <div class="footer-col">
          <h4 class="footer-col-titulo">Navegación</h4>
          <ul class="footer-links">
            <li><RouterLink to="/inicio">Inicio</RouterLink></li>
            <li><RouterLink to="/login">Iniciar sesión</RouterLink></li>
            <li><RouterLink to="/registro">Registrarse</RouterLink></li>
            <li><RouterLink to="/buscar">Buscar habitación</RouterLink></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-col-titulo">Servicios</h4>
          <ul class="footer-links">
            <li><span>Habitaciones</span></li>
            <li><span>Desayuno incluido</span></li>
            <li><span>Parqueadero</span></li>
            <li><span>WiFi gratuito</span></li>
            <li><span>Atención 24/7</span></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-col-titulo">Contacto</h4>
          <ul class="footer-links footer-contacto">
            <li><span>📍 Cali, Valle del Cauca</span></li>
            <li><span>📞 (2) 123-4567</span></li>
            <li><span>✉️ info@hotelmanager.co</span></li>
            <li><span>🕐 Recepción 24h</span></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© {{ new Date().getFullYear() }} Hotel Manager. Todos los derechos reservados.</span>
        <span class="footer-bottom-sep">·</span>
        <span>Cali, Colombia</span>
      </div>
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

const resenas = [
  { id: 1, inicial: 'M', nombre: 'María González', lugar: 'Bogotá, Colombia', estrellas: 5, tipo: 'Suite', fecha: 'Marzo 2025', texto: 'Una experiencia increíble. Las instalaciones son impecables y el personal siempre dispuesto a ayudar. Sin duda el mejor hotel en el que me he hospedado en Cali.' },
  { id: 2, inicial: 'C', nombre: 'Carlos Ramírez', lugar: 'Medellín, Colombia', estrellas: 5, tipo: 'Habitación Doble', fecha: 'Febrero 2025', texto: 'Excelente relación calidad-precio. Desayuno delicioso, habitación muy limpia y cómoda. Volveré sin dudarlo en mi próximo viaje a Cali.' },
  { id: 3, inicial: 'A', nombre: 'Andrea Torres', lugar: 'Cali, Colombia', estrellas: 5, tipo: 'Habitación Triple', fecha: 'Enero 2025', texto: 'Viajé con mi familia y todos quedamos encantados. Los niños se sintieron muy cómodos y el parqueadero gratuito fue un plus enorme. 100% recomendado.' },
  { id: 4, inicial: 'J', nombre: 'Jorge Martínez', lugar: 'Bucaramanga, Colombia', estrellas: 5, tipo: 'Suite', fecha: 'Abril 2025', texto: 'La suite superó todas mis expectativas. Jacuzzi, minibar y una vista espectacular. Perfecto para nuestra luna de miel. Gracias por hacer ese momento tan especial.' },
  { id: 5, inicial: 'L', nombre: 'Laura Pérez', lugar: 'Barranquilla, Colombia', estrellas: 4, tipo: 'Habitación Sencilla', fecha: 'Marzo 2025', texto: 'Muy buena opción para viajes de negocios. WiFi rápido, cama cómoda y ubicación estratégica. El check-in flexible fue justo lo que necesitaba.' },
  { id: 6, inicial: 'R', nombre: 'Ricardo Flores', lugar: 'Pereira, Colombia', estrellas: 5, tipo: 'Habitación Doble', fecha: 'Febrero 2025', texto: 'La atención del personal es excepcional. Desde que llegamos nos hicieron sentir como en casa. Las habitaciones son modernas y muy bien equipadas.' },
]

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
  height: 80px;
  padding: 0 2.5rem;
  background: rgba(5, 5, 5, 0.92);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(201,168,76,0.15);
  overflow: hidden;
}

.brand { display: flex; align-items: center; height: 100%; }
.brand-logo {
  height: 110px;
  width: auto;
  object-fit: contain;
  mix-blend-mode: lighten;
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
  padding: 1.25rem 1.25rem 1rem;
  box-shadow: 0 24px 60px rgba(0,0,0,0.6);
  text-align: left;
}

.buscador-titulo {
  font-size: 0.72rem; font-weight: 700;
  color: #C9A84C; margin-bottom: 0.85rem;
  text-align: center; letter-spacing: 0.07em;
  text-transform: uppercase;
}

/* Nuevo layout: dos bloques lado a lado con divisor */
.buscador-grid {
  display: flex; align-items: stretch; gap: 0;
  margin-bottom: 0.85rem;
}

.buscador-bloque {
  flex: 1;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(201,168,76,0.15);
  border-radius: 12px;
  padding: 0.7rem 0.75rem 0.6rem;
}

.bloque-header {
  display: flex; align-items: center; gap: 0.35rem;
  margin-bottom: 0.55rem;
}
.bloque-ico { font-size: 0.95rem; }
.bloque-etiqueta {
  font-size: 0.72rem; font-weight: 700;
  color: #C9A84C; text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bloque-campos {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem;
}

.buscador-divisor {
  display: flex; align-items: center; justify-content: center;
  width: 1.75rem; flex-shrink: 0;
  font-size: 0.9rem; color: rgba(201,168,76,0.4);
}

/* Mantener buscador-campos por compatibilidad */
.buscador-campos {
  display: flex; align-items: flex-end;
  gap: 0.75rem; flex-wrap: wrap;
}

.campo-grupo {
  display: flex; flex-direction: column; gap: 0.2rem;
}

.campo-label {
  font-size: 0.6rem; font-weight: 600;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase; letter-spacing: 0.05em;
}

.campo-input {
  padding: 0.45rem 0.5rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  font-size: 0.78rem; color: #fff;
  background: rgba(255,255,255,0.06);
  outline: none; transition: border-color 0.2s;
  font-family: 'Inter', sans-serif;
  width: 100%;
}
.campo-input:focus { border-color: #C9A84C; background: rgba(201,168,76,0.06); }
.campo-input option { background: #1a1a1a; color: #fff; }

.buscador-sep { display: none; }

.btn-buscar {
  width: 100%;
  padding: 0.85rem 1.75rem;
  background: linear-gradient(135deg, #C9A84C, #A8882A);
  color: #0A0A0A; border: none; border-radius: 12px;
  font-size: 0.95rem; font-weight: 800;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 18px rgba(201,168,76,0.35);
  letter-spacing: 0.03em;
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
/* ── ¿POR QUÉ ELEGIRNOS? ──────────────────────────────────── */
.porque {
  padding: 5rem 2rem;
  background: #111111;
  border-top: 1px solid rgba(201,168,76,0.1);
}
.porque-container {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1.1fr; gap: 4rem;
  align-items: center;
}
.porque-imagen {
  position: relative; border-radius: 20px; overflow: hidden;
}
.porque-imagen img {
  width: 100%; height: 480px; object-fit: cover;
  border-radius: 20px; display: block;
}
.porque-badge-img {
  position: absolute; bottom: 1.5rem; left: 1.5rem;
  background: rgba(10,10,10,0.88); backdrop-filter: blur(12px);
  border: 1px solid rgba(201,168,76,0.3);
  border-radius: 12px; padding: 0.75rem 1.25rem;
  display: flex; flex-direction: column;
}
.badge-num { font-size: 1.4rem; font-weight: 800; color: #C9A84C; }
.badge-txt { font-size: 0.7rem; color: rgba(255,255,255,0.5); letter-spacing: 0.04em; }

.porque-sup {
  font-size: 0.72rem; font-weight: 700; color: #C9A84C;
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem;
}
.porque-titulo {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 700;
  color: #fff; line-height: 1.25; margin-bottom: 1rem;
}
.porque-acento { color: #C9A84C; font-style: italic; }
.porque-desc { color: rgba(255,255,255,0.55); line-height: 1.8; margin-bottom: 2rem; font-size: 0.95rem; }

.porque-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
  margin-bottom: 2rem;
}
.porque-item {
  display: flex; align-items: flex-start; gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; transition: border-color 0.2s;
}
.porque-item:hover { border-color: rgba(201,168,76,0.2); }
.porque-ico { font-size: 1.3rem; flex-shrink: 0; margin-top: 0.1rem; }
.porque-item-titulo { font-size: 0.82rem; font-weight: 600; color: #fff; margin-bottom: 0.15rem; }
.porque-item-sub { font-size: 0.7rem; color: rgba(255,255,255,0.4); }

.porque-stats {
  display: flex; align-items: center; gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  background: rgba(201,168,76,0.06);
  border: 1px solid rgba(201,168,76,0.15);
  border-radius: 14px;
}
.pstat { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; flex: 1; }
.pstat-num { font-size: 1.5rem; font-weight: 800; color: #C9A84C; }
.pstat-lbl { font-size: 0.65rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; }
.pstat-sep { width: 1px; height: 2.5rem; background: rgba(201,168,76,0.2); }

/* ── UBICACIÓN ────────────────────────────────────────────── */
.ubicacion {
  padding: 5rem 2rem;
  background: #0A0A0A;
  border-top: 1px solid rgba(201,168,76,0.1);
}
.ubicacion-container {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 1.2fr 1fr; gap: 4rem;
  align-items: center;
}
.ubicacion-mapa {
  border-radius: 20px; overflow: hidden;
  border: 1px solid rgba(201,168,76,0.15);
  height: 420px;
}
.ubicacion-mapa iframe { width: 100%; height: 100%; border: none; }

.ubicacion-sup {
  font-size: 0.72rem; font-weight: 700; color: #C9A84C;
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem;
}
.ubicacion-titulo {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 700;
  color: #fff; line-height: 1.25; margin-bottom: 1rem;
}
.ubicacion-acento { color: #C9A84C; font-style: italic; }
.ubicacion-desc { color: rgba(255,255,255,0.55); line-height: 1.8; margin-bottom: 2rem; font-size: 0.95rem; }

.ubicacion-datos { display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 2rem; }
.ubic-dato {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.85rem 1.1rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
}
.ubic-ico { font-size: 1.25rem; flex-shrink: 0; }
.ubic-titulo { font-size: 0.8rem; font-weight: 600; color: #fff; }
.ubic-sub { font-size: 0.73rem; color: rgba(255,255,255,0.4); margin-top: 0.1rem; }

.btn-reservar-ubic {
  display: inline-block;
  padding: 0.85rem 2rem;
  background: linear-gradient(135deg, #C9A84C, #A8882A);
  color: #0A0A0A; border-radius: 12px;
  font-size: 0.9rem; font-weight: 800;
  text-decoration: none; letter-spacing: 0.03em;
  box-shadow: 0 4px 18px rgba(201,168,76,0.3);
  transition: all 0.2s;
}
.btn-reservar-ubic:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(201,168,76,0.45); }

/* ── FOOTER ───────────────────────────────────────────────── */
.footer {
  background: #050505;
  border-top: 1px solid rgba(201,168,76,0.1);
  padding: 3.5rem 2rem 0;
  color: rgba(255,255,255,0.35);
}
.footer-top {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 2.5rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.footer-logo {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem; color: #C9A84C; margin-bottom: 0.75rem;
}
.footer-tagline { font-size: 0.82rem; color: rgba(255,255,255,0.4); line-height: 1.7; margin-bottom: 1.25rem; }

.footer-redes { display: flex; gap: 0.75rem; }
.red-ico {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  transition: all 0.2s; text-decoration: none;
}
.red-ico svg { width: 16px; height: 16px; }
.red-ico:hover { border-color: #C9A84C; color: #C9A84C; background: rgba(201,168,76,0.08); }

.footer-col-titulo {
  font-size: 0.72rem; font-weight: 700; color: rgba(255,255,255,0.7);
  text-transform: uppercase; letter-spacing: 0.08em;
  margin-bottom: 1.1rem;
}
.footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.footer-links li a, .footer-links li span {
  font-size: 0.82rem; color: rgba(255,255,255,0.4);
  text-decoration: none; transition: color 0.2s;
}
.footer-links li a:hover { color: #C9A84C; }

.footer-bottom {
  max-width: 1100px; margin: 0 auto;
  padding: 1.25rem 0;
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 0.75rem; color: rgba(255,255,255,0.25);
  flex-wrap: wrap;
}
.footer-bottom-sep { color: rgba(255,255,255,0.15); }

/* ── RESEÑAS ──────────────────────────────────────────────── */
.resenas {
  padding: 5rem 0;
  background: #0A0A0A;
  border-top: 1px solid rgba(201,168,76,0.1);
  overflow: hidden;
}

.resenas-header {
  text-align: center; margin-bottom: 3rem;
  padding: 0 2rem;
}
.resenas-sup {
  font-size: 0.72rem; font-weight: 700; color: #C9A84C;
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem;
}
.resenas-titulo {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 3vw, 2.5rem); font-weight: 700;
  color: #fff; margin-bottom: 1rem;
}
.resenas-acento { color: #C9A84C; font-style: italic; }
.resenas-estrellas-global {
  display: flex; align-items: center; justify-content: center; gap: 0.75rem;
}
.estrellas-num { font-size: 2rem; font-weight: 800; color: #C9A84C; }
.estrellas-ico { font-size: 1.1rem; color: #C9A84C; letter-spacing: 0.1em; }
.estrellas-base { font-size: 0.78rem; color: rgba(255,255,255,0.4); }

/* Carrusel infinito */
.carrusel-wrapper {
  width: 100%;
  overflow: hidden;
  /* Difuminado en los bordes */
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}
.carrusel-track {
  display: flex;
  gap: 1.5rem;
  width: max-content;
  animation: scroll-resenas 40s linear infinite;
}
.carrusel-track:hover { animation-play-state: paused; }

@keyframes scroll-resenas {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.resena-item {
  width: 320px; flex-shrink: 0;
  display: flex; flex-direction: column; gap: 0.85rem;
  padding: 0 0.5rem;
}

.resena-top {
  display: flex; align-items: center; gap: 0.85rem;
}
.resena-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, #C9A84C, #A8882A);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 700; color: #0A0A0A;
  flex-shrink: 0;
}
.resena-autor { flex: 1; }
.resena-nombre { font-size: 0.88rem; font-weight: 600; color: #fff; }
.resena-lugar  { font-size: 0.72rem; color: rgba(255,255,255,0.4); margin-top: 0.1rem; }
.resena-stars  { font-size: 0.85rem; color: #C9A84C; letter-spacing: 0.05em; flex-shrink: 0; }

.resena-texto {
  font-size: 0.875rem; color: rgba(255,255,255,0.65);
  line-height: 1.75; font-style: italic;
}

.resena-meta {
  display: flex; align-items: center; gap: 0.75rem;
}
.resena-tipo {
  font-size: 0.65rem; font-weight: 700; color: #C9A84C;
  text-transform: uppercase; letter-spacing: 0.06em;
  background: rgba(201,168,76,0.08);
  border: 1px solid rgba(201,168,76,0.2);
  padding: 0.18rem 0.55rem; border-radius: 20px;
}
.resena-fecha { font-size: 0.68rem; color: rgba(255,255,255,0.3); }

/* ── RESPONSIVE ───────────────────────────────────────────── */
@media (max-width: 900px) {
  .porque-container { grid-template-columns: 1fr; gap: 2.5rem; }
  .ubicacion-container { grid-template-columns: 1fr; gap: 2.5rem; }
  .footer-top { grid-template-columns: 1fr 1fr; gap: 2rem; }
}

@media (max-width: 768px) {
  .navbar { height: 64px; padding: 0 1rem; }
  .nav-links { gap: 0.4rem; }
  .btn-nav { padding: 0.35rem 0.75rem; font-size: 0.78rem; }
  .btn-nav.app { display: none; }
  .btn-hero-app { display: inline-flex; }
  .hero { padding: 6rem 1rem 3rem; background-attachment: scroll; }
  .buscador { padding: 1rem; }
  .buscador-grid { flex-direction: column; gap: 0.5rem; }
  .buscador-divisor { display: none; }
  .bloque-campos { grid-template-columns: 1.4fr 1fr; gap: 0.4rem; }
  .features-container { gap: 1.25rem; }
  .habitaciones-grid { grid-template-columns: 1fr; }
  .resultados { padding: 3rem 1rem; }
  .porque { padding: 3rem 1rem; }
  .porque-imagen img { height: 280px; }
  .porque-grid { grid-template-columns: 1fr; }
  .porque-stats { gap: 0.75rem; padding: 1rem; }
  .ubicacion { padding: 3rem 1rem; }
  .resenas { padding: 3rem 0; }
  .ubicacion-mapa { height: 260px; }
  .footer-top { grid-template-columns: 1fr; gap: 2rem; padding-bottom: 2rem; }
  .footer { padding: 2.5rem 1.25rem 0; }
  .footer-bottom { justify-content: center; text-align: center; }
}

@media (max-width: 380px) {
  .brand-logo { height: 52px; }
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
