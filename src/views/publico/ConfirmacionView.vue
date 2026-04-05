<template>
  <div class="confirmacion-page">

    <nav class="navbar">
      <RouterLink to="/" class="nav-brand">Hotel Manager</RouterLink>
    </nav>

    <div class="container">

      <div v-if="cargando" class="estado-cargando">
        Cargando tu reserva...
      </div>

      <div v-else-if="reserva" class="confirmacion-card">
        <div class="check-icon">✓</div>
        <h2>¡Reserva confirmada!</h2>
        <p class="subtitulo">Tu reserva ha sido registrada exitosamente</p>

        <div class="detalles">
          <div class="detalle-fila">
            <span class="detalle-label">Número de reserva</span>
            <span class="detalle-valor">#{{ reserva.id }}</span>
          </div>
          <div class="detalle-fila">
            <span class="detalle-label">Habitación</span>
            <span class="detalle-valor">{{ reserva.tipoHabitacion }} — Nro. {{ reserva.numeroHabitacion }}</span>
          </div>
          <div class="detalle-fila">
            <span class="detalle-label">Huésped</span>
            <span class="detalle-valor">{{ reserva.nombreHuesped }} {{ reserva.apellidoHuesped }}</span>
          </div>
          <div class="detalle-fila">
            <span class="detalle-label">Check-in</span>
            <span class="detalle-valor">{{ formatFecha(reserva.fechaEntrada) }}</span>
          </div>
          <div class="detalle-fila">
            <span class="detalle-label">Check-out</span>
            <span class="detalle-valor">{{ formatFecha(reserva.fechaSalida) }}</span>
          </div>
          <div class="detalle-fila">
            <span class="detalle-label">Noches</span>
            <span class="detalle-valor">{{ reserva.noches }}</span>
          </div>
          <div class="detalle-fila">
            <span class="detalle-label">Forma de pago</span>
            <span class="detalle-valor">{{ formatFormaPago(reserva.formaPago) }}</span>
          </div>
          <div class="detalle-fila total">
            <span class="detalle-label">Total a pagar</span>
            <span class="detalle-valor">${{ formatPrecio(reserva.valorTotal) }}</span>
          </div>
        </div>

        <!-- ACCIONES -->
        <div class="acciones">
          <button class="btn-factura" @click="descargarFactura" :disabled="descargando">
            <span v-if="descargando" class="spinner-btn"></span>
            <span v-else>↓ Descargar factura PDF</span>
          </button>
          <RouterLink to="/" class="btn-inicio">Volver al inicio</RouterLink>
        </div>

        <p class="nota-factura">
          También puedes descargar tu factura en cualquier momento desde el panel de reservas
        </p>
      </div>

      <div v-else class="error-msg">
        No se pudo cargar la reserva.
        <RouterLink to="/">Volver al inicio</RouterLink>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { reservaService } from '../../api/services'
import { useFacturaPDF } from '../../composables/useFacturaPDF'

const route   = useRoute()
const reserva = ref(null)
const cargando   = ref(true)
const descargando = ref(false)

const { descargarPDF, formatFecha, formatPrecio, formatFormaPago } = useFacturaPDF()

onMounted(async () => {
  try {
    const res = await reservaService.obtener(route.params.id)
    reserva.value = res.data
  } catch {
    reserva.value = null
  } finally {
    cargando.value = false
  }
})

async function descargarFactura() {
  if (!reserva.value) return
  descargando.value = true
  try {
    await descargarPDF(reserva.value)
  } catch (e) {
    alert('Error al generar el PDF')
    console.error(e)
  } finally {
    descargando.value = false
  }
}
</script>

<style scoped>
.confirmacion-page { min-height: 100vh; background: var(--color-gray-50); }

.navbar {
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  background: #fff;
  box-shadow: var(--shadow-sm);
}
.nav-brand { font-size: 1.2rem; font-weight: 700; color: var(--color-primary); text-decoration: none; }

.container {
  max-width: 520px;
  margin: 3rem auto;
  padding: 0 1rem;
}

.estado-cargando { text-align: center; color: var(--color-gray-400); padding: 3rem; }

.confirmacion-card {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
  padding: 2.5rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.check-icon {
  width: 64px; height: 64px;
  background: #dcfce7;
  color: var(--color-success);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.75rem; font-weight: 700;
  margin: 0 auto 1.25rem;
}

.confirmacion-card h2 {
  font-size: 1.5rem; font-weight: 700;
  color: var(--color-gray-800); margin-bottom: 0.4rem;
}
.subtitulo { color: var(--color-gray-400); font-size: 0.9rem; margin-bottom: 2rem; }

.detalles {
  border: 1px solid var(--color-gray-100);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 1.5rem;
  text-align: left;
}
.detalle-fila {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--color-gray-100);
  font-size: 0.875rem;
}
.detalle-fila:last-child { border-bottom: none; }
.detalle-fila.total { background: var(--color-gray-50); }
.detalle-label { color: var(--color-gray-400); }
.detalle-valor { font-weight: 600; color: var(--color-gray-800); }
.detalle-fila.total .detalle-valor { color: var(--color-primary); font-size: 1rem; font-weight: 700; }

/* Acciones */
.acciones {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.btn-factura {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-factura:hover { background: var(--color-primary-dark); }
.btn-factura:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-inicio {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background: #fff;
  color: var(--color-gray-600);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s;
  text-align: center;
}
.btn-inicio:hover { background: var(--color-gray-50); }

.nota-factura {
  font-size: 0.75rem;
  color: var(--color-gray-400);
  line-height: 1.5;
}

.error-msg { text-align: center; padding: 3rem; color: var(--color-gray-400); }
.error-msg a { color: var(--color-primary); }

/* Spinner */
.spinner-btn {
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>