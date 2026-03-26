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

        <RouterLink to="/" class="btn-inicio">Volver al inicio</RouterLink>
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

const route   = useRoute()
const reserva = ref(null)
const cargando = ref(true)

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

function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

function formatPrecio(valor) {
  return Number(valor).toLocaleString('es-CO')
}

function formatFormaPago(valor) {
  const map = {
    efectivo: 'Efectivo',
    tarjeta_credito: 'Tarjeta de crédito',
    tarjeta_debito: 'Tarjeta de débito',
    transferencia: 'Transferencia',
    pse: 'PSE',
    nequi: 'Nequi',
    daviplata: 'Daviplata'
  }
  return map[valor] || valor
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

.nav-brand {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.container {
  max-width: 520px;
  margin: 3rem auto;
  padding: 0 1rem;
}

.estado-cargando {
  text-align: center;
  color: var(--color-gray-400);
  padding: 3rem;
}

.confirmacion-card {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
  padding: 2.5rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.check-icon {
  width: 64px;
  height: 64px;
  background: #dcfce7;
  color: var(--color-success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 auto 1.25rem;
}

.confirmacion-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-gray-800);
  margin-bottom: 0.4rem;
}

.subtitulo {
  color: var(--color-gray-400);
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.detalles {
  border: 1px solid var(--color-gray-100);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 1.75rem;
  text-align: left;
}

.detalle-fila {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-gray-100);
}

.detalle-fila:last-child { border-bottom: none; }

.detalle-fila.total {
  background: var(--color-gray-50);
}

.detalle-fila.total .detalle-valor {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
}

.detalle-label {
  font-size: 0.825rem;
  color: var(--color-gray-400);
}

.detalle-valor {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-gray-800);
}

.btn-inicio {
  display: inline-block;
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius);
  padding: 0.75rem 2rem;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.btn-inicio:hover { background: var(--color-primary-dark); color: #fff; }

.error-msg {
  background: #fef2f2;
  color: var(--color-danger);
  border: 1px solid #fecaca;
  border-radius: var(--radius);
  padding: 1rem;
  text-align: center;
}
</style>