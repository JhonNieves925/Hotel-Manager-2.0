<template>
  <Transition name="splash-fade">
    <div v-if="splashVisible" class="splash">
      <div class="splash-contenido">
        <img src="/logo.png" alt="Hotel Manager" class="splash-logo-img" />
        <div class="splash-tagline">Una experiencia inolvidable</div>
        <div class="splash-barra-wrap">
          <div class="splash-barra" :style="{ width: progreso + '%' }"></div>
        </div>
      </div>
    </div>
  </Transition>

  <RouterView v-if="!splashVisible" />

  <!-- Banner de actualización disponible -->
  <Transition name="update-fade">
    <div v-if="needRefresh" class="update-banner">
      <span>🆕 Nueva versión disponible</span>
      <button class="update-btn" @click="actualizar">Actualizar</button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const splashVisible = ref(true)
const progreso = ref(0)

// Detecta nueva versión del service worker
const { needRefresh, updateServiceWorker } = useRegisterSW()

function actualizar() {
  updateServiceWorker(true)
}

onMounted(() => {
  // Barra de carga animada
  const intervalo = setInterval(() => {
    progreso.value += 4
    if (progreso.value >= 100) clearInterval(intervalo)
  }, 60)

  // Ocultar splash a los 2.5 segundos
  setTimeout(() => {
    splashVisible.value = false
  }, 2500)
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: #0A0A0A;
  color: #fff;
  line-height: 1.6;
  overscroll-behavior: none;
}

:root {
  --orange:      #E8773A;
  --orange-light:#F28C4E;
  --orange-dark: #C5602A;
  --navy:        #0D1B3E;
  --navy-2:      #0A1628;
  --navy-3:      #1a0a2e;
  --text:        #ffffff;
  --text-muted:  rgba(255,255,255,0.45);
  --radius:      8px;
  --radius-lg:   14px;
}

a { color: var(--orange); text-decoration: none; }
button { cursor: pointer; font-family: inherit; border: none; }
input, select, textarea { font-family: inherit; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(232,119,58,0.3); border-radius: 4px; }
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

/* ── SPLASH ── */
.splash {
  position: fixed; inset: 0; z-index: 9999;
  background: #0A0A0A;
  display: flex; align-items: center; justify-content: center;
}

.splash-contenido {
  display: flex; flex-direction: column;
  align-items: center; gap: 1rem;
  padding: 2rem; text-align: center;
}

.splash-logo-img {
  width: 220px;
  height: auto;
  object-fit: contain;
  mix-blend-mode: lighten;
  animation: pulso 2s ease-in-out infinite;
  filter: drop-shadow(0 0 30px rgba(201,168,76,0.35));
}
@keyframes pulso {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.04); }
}

.splash-tagline {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.45);
  font-style: italic; letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
}

.splash-barra-wrap {
  width: 180px; height: 3px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px; overflow: hidden;
}

.splash-barra {
  height: 100%;
  background: linear-gradient(90deg, #E8773A, #F28C4E);
  border-radius: 10px;
  transition: width 0.06s linear;
}

/* ── TRANSICIÓN ── */
.splash-fade-leave-active { transition: opacity 0.5s ease; }
.splash-fade-leave-to    { opacity: 0; }

/* ── BANNER ACTUALIZACIÓN ── */
.update-banner {
  position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
  z-index: 9998;
  display: flex; align-items: center; gap: 1rem;
  background: #1a2f5e; border: 1px solid rgba(232,119,58,0.4);
  color: #fff; font-size: 0.9rem;
  padding: 0.75rem 1.25rem; border-radius: 50px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  white-space: nowrap;
}

.update-btn {
  background: #E8773A; color: #fff;
  border: none; border-radius: 50px;
  padding: 0.35rem 1rem; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: background 0.2s;
}
.update-btn:hover { background: #C5602A; }

.update-fade-enter-active, .update-fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.update-fade-enter-from, .update-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(1rem); }
</style>