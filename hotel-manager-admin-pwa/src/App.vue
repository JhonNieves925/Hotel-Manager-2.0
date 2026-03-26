<template>
  <div>

    <!-- SPLASH SCREEN -->
    <Transition name="splash">
      <div v-if="mostrarSplash" class="splash">
        <div class="splash-contenido">

          <!-- Logo animado -->
          <div class="splash-logo" :class="{ visible: logoVisible }">
            <div class="logo-icono">HM</div>
            <div class="logo-nombre">Hotel Manager</div>
            <div class="logo-sub">Panel de administración</div>
          </div>

          <!-- Barra de carga -->
          <div class="splash-barra-fondo" :class="{ visible: logoVisible }">
            <div class="splash-barra-relleno" :style="{ width: progreso + '%' }"></div>
          </div>

          <div class="splash-cargando" :class="{ visible: logoVisible }">
            Cargando...
          </div>

        </div>
      </div>
    </Transition>

    <!-- APP PRINCIPAL -->
    <RouterView v-if="!mostrarSplash" />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'

const mostrarSplash = ref(true)
const logoVisible   = ref(false)
const progreso      = ref(0)

onMounted(() => {
  // Pequeño delay para que el DOM esté listo
  setTimeout(() => {
    logoVisible.value = true
  }, 100)

  // Animar la barra de progreso
  const intervalo = setInterval(() => {
    if (progreso.value < 100) {
      progreso.value += 4
    } else {
      clearInterval(intervalo)
    }
  }, 60)

  // Ocultar splash después de 1.8 segundos
  setTimeout(() => {
    mostrarSplash.value = false
  }, 1800)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f8fafc;
  color: #1e293b;
  line-height: 1.5;
  overscroll-behavior: none;
}

:root {
  --primary:        #2563eb;
  --primary-dark:   #1d4ed8;
  --success:        #16a34a;
  --danger:         #dc2626;
  --warning:        #d97706;
  --purple:         #7c3aed;
  --bg:             #f8fafc;
  --bg-card:        #ffffff;
  --border:         #e2e8f0;
  --text:           #1e293b;
  --text-muted:     #64748b;
  --text-light:     #94a3b8;
  --nav-bg:         #1e293b;
  --nav-height:     64px;
  --header-height:  56px;
  --radius:         10px;
  --radius-lg:      16px;
  --shadow:         0 1px 3px rgba(0,0,0,0.08);
  --shadow-md:      0 4px 12px rgba(0,0,0,0.1);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

a { color: var(--primary); text-decoration: none; }
button { cursor: pointer; font-family: inherit; border: none; }
input, select { font-family: inherit; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
</style>

<style scoped>
/* SPLASH */
.splash {
  position: fixed;
  inset: 0;
  background: linear-gradient(160deg, #0f172a 0%, #1e3a5f 55%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.splash-contenido {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  width: 100%;
  max-width: 320px;
}

/* Logo */
.splash-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.splash-logo.visible {
  opacity: 1;
  transform: translateY(0);
}

.logo-icono {
  width: 90px;
  height: 90px;
  background: rgba(255,255,255,0.12);
  border: 2px solid rgba(255,255,255,0.25);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 2px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.logo-nombre {
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.5px;
}

.logo-sub {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.5px;
}

/* Barra de progreso */
.splash-barra-fondo {
  width: 100%;
  height: 3px;
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.4s ease 0.3s;
}

.splash-barra-fondo.visible { opacity: 1; }

.splash-barra-relleno {
  height: 100%;
  background: rgba(255,255,255,0.8);
  border-radius: 3px;
  transition: width 0.06s linear;
}

/* Texto cargando */
.splash-cargando {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  opacity: 0;
  transition: opacity 0.4s ease 0.4s;
}

.splash-cargando.visible { opacity: 1; }

/* Transición de salida del splash */
.splash-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.splash-leave-to {
  opacity: 0;
  transform: scale(1.05);
}
</style>