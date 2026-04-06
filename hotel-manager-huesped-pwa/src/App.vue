<template>
  <Transition name="splash-fade">
    <div v-if="splashVisible" class="splash">
      <div class="splash-contenido">
        <div class="splash-logo">🏨</div>
        <div class="splash-brand">Hotel Manager</div>
        <div class="splash-tagline">Una experiencia inolvidable</div>
        <div class="splash-barra-wrap">
          <div class="splash-barra" :style="{ width: progreso + '%' }"></div>
        </div>
      </div>
    </div>
  </Transition>

  <RouterView v-if="!splashVisible" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'

const splashVisible = ref(true)
const progreso = ref(0)

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
  background: #0A1628;
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
  background: linear-gradient(160deg, #0D1B3E 0%, #0A1628 50%, #1a0a2e 100%);
  display: flex; align-items: center; justify-content: center;
}

.splash-contenido {
  display: flex; flex-direction: column;
  align-items: center; gap: 1rem;
  padding: 2rem; text-align: center;
}

.splash-logo {
  font-size: 4.5rem;
  animation: pulso 1.5s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(232,119,58,0.5));
}
@keyframes pulso {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.08); }
}

.splash-brand {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem; font-weight: 700;
  color: #fff; letter-spacing: 0.02em;
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
</style>