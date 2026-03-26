<template>
  <div class="app-layout">

    <!-- HEADER -->
    <header class="app-header">
      <div class="header-left">
        <span class="header-logo">HM</span>
        <span class="header-title">{{ tituloActual }}</span>
      </div>
      <div class="header-right">
        <div class="header-usuario">{{ authStore.nombreUsuario }}</div>
        <button class="btn-logout" @click="handleLogout">Salir</button>
      </div>
    </header>

    <!-- CONTENIDO -->
    <main class="app-main">
      <RouterView />
    </main>

    <!-- BARRA NAVEGACIÓN INFERIOR -->
    <nav class="bottom-nav safe-bottom">
      <RouterLink to="/dashboard" class="nav-item" active-class="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        <span>Inicio</span>
      </RouterLink>

      <RouterLink to="/reservas" class="nav-item" active-class="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8"  y1="2" x2="8"  y2="6"/>
          <line x1="3"  y1="10" x2="21" y2="10"/>
        </svg>
        <span>Reservas</span>
      </RouterLink>

      <RouterLink to="/reportes" class="nav-item" active-class="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6"  y1="20" x2="6"  y2="14"/>
        </svg>
        <span>Reportes</span>
      </RouterLink>

      <RouterLink to="/usuarios" class="nav-item" active-class="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span>Usuarios</span>
      </RouterLink>
    </nav>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const titulos = {
  dashboard: 'Dashboard',
  reservas:  'Reservas',
  reportes:  'Reportes',
  usuarios:  'Usuarios'
}

const tituloActual = computed(() =>
  titulos[route.name] || 'Hotel Manager'
)

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  background: var(--bg);
  position: relative;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--nav-bg);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.25rem;
  height: var(--header-height);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-logo {
  font-size: 0.85rem;
  font-weight: 800;
  background: var(--primary);
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.header-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-usuario {
  font-size: 0.775rem;
  color: rgba(255,255,255,0.6);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-logout {
  background: rgba(220,38,38,0.2);
  color: #fca5a5;
  border: 1px solid rgba(220,38,38,0.3);
  border-radius: 6px;
  padding: 0.3rem 0.65rem;
  font-size: 0.775rem;
  font-weight: 500;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  padding-bottom: calc(var(--nav-height) + 1rem);
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: var(--nav-bg);
  display: flex;
  height: var(--nav-height);
  border-top: 1px solid rgba(255,255,255,0.08);
  z-index: 10;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: rgba(255,255,255,0.45);
  font-size: 0.7rem;
  font-weight: 500;
  transition: color 0.2s;
  padding: 0.5rem 0;
}

.nav-item svg {
  width: 22px;
  height: 22px;
}

.nav-item.active {
  color: #fff;
}

.nav-item.active svg {
  stroke: var(--primary);
}
</style>