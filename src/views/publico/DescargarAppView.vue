<template>
  <div class="descarga-page">

    <nav class="navbar">
      <RouterLink to="/" class="nav-brand">Hotel Manager</RouterLink>
      <RouterLink to="/login" class="btn-nav">Acceso empleados</RouterLink>
    </nav>

    <div class="container">
      <div class="hero-app">
        <div class="app-icon">HM</div>
        <h1>App Hotel Manager</h1>
        <p>Panel de administración para tu celular</p>
      </div>

      <!-- BOTÓN DIRECTO -->
      <div class="acceso-directo">
        <p class="acceso-texto">Abre la app directamente en tu navegador:</p>
        <a :href="urlPwa" target="_blank" class="btn-abrir">
          Abrir app del administrador
        </a>
      </div>

      <!-- INSTRUCCIONES ANDROID -->
      <div class="instrucciones-card">
        <div class="plataforma-header android">
          <div class="plataforma-icono">A</div>
          <div>
            <div class="plataforma-nombre">Android</div>
            <div class="plataforma-sub">Chrome / Samsung Internet</div>
          </div>
        </div>
        <ol class="pasos">
          <li class="paso">
            <div class="paso-num">1</div>
            <div class="paso-texto">
              Abre <strong>Chrome</strong> en tu celular Android y ve a la dirección de la app
            </div>
          </li>
          <li class="paso">
            <div class="paso-num">2</div>
            <div class="paso-texto">
              Toca los <strong>tres puntos</strong> (⋮) en la esquina superior derecha
            </div>
          </li>
          <li class="paso">
            <div class="paso-num">3</div>
            <div class="paso-texto">
              Selecciona <strong>"Agregar a pantalla de inicio"</strong>
            </div>
          </li>
          <li class="paso">
            <div class="paso-num">4</div>
            <div class="paso-texto">
              Confirma tocando <strong>"Agregar"</strong> — el ícono aparecerá en tu pantalla
            </div>
          </li>
        </ol>
      </div>

      <!-- INSTRUCCIONES iOS -->
      <div class="instrucciones-card">
        <div class="plataforma-header ios">
          <div class="plataforma-icono">i</div>
          <div>
            <div class="plataforma-nombre">iPhone / iPad</div>
            <div class="plataforma-sub">Safari</div>
          </div>
        </div>
        <ol class="pasos">
          <li class="paso">
            <div class="paso-num">1</div>
            <div class="paso-texto">
              Abre <strong>Safari</strong> — en iOS solo funciona con Safari, no Chrome
            </div>
          </li>
          <li class="paso">
            <div class="paso-num">2</div>
            <div class="paso-texto">
              Ve a la dirección de la app del administrador
            </div>
          </li>
          <li class="paso">
            <div class="paso-num">3</div>
            <div class="paso-texto">
              Toca el ícono de <strong>compartir</strong> (cuadrado con flecha hacia arriba) en la barra inferior
            </div>
          </li>
          <li class="paso">
            <div class="paso-num">4</div>
            <div class="paso-texto">
              Desplázate y toca <strong>"Agregar a pantalla de inicio"</strong>
            </div>
          </li>
          <li class="paso">
            <div class="paso-num">5</div>
            <div class="paso-texto">
              Toca <strong>"Agregar"</strong> en la esquina superior derecha
            </div>
          </li>
        </ol>
      </div>

      <!-- CARACTERÍSTICAS -->
      <div class="features-card">
        <div class="features-titulo">¿Qué incluye la app?</div>
        <div class="features-grid">
          <div class="feature">
            <div class="feature-icono azul">$</div>
            <div class="feature-texto">Reportes financieros en tiempo real</div>
          </div>
          <div class="feature">
            <div class="feature-icono verde">H</div>
            <div class="feature-texto">Ocupación de habitaciones</div>
          </div>
          <div class="feature">
            <div class="feature-icono morado">R</div>
            <div class="feature-texto">Gestión de reservas</div>
          </div>
          <div class="feature">
            <div class="feature-icono naranja">U</div>
            <div class="feature-texto">Administración de usuarios</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Apunta al puerto donde corre la PWA
// En producción esto será la URL real del servidor
const urlPwa = computed(() => {
  const host = window.location.hostname
  // En desarrollo apunta al puerto de la PWA
  // En producción apunta a /admin
  if (host === 'localhost') {
    return 'http://localhost:5174'
  }
  return `${window.location.protocol}//${host}/admin`
})
</script>

<style scoped>
.descarga-page { min-height: 100vh; background: var(--color-gray-50); }

.navbar {
  display: flex;
  justify-content: space-between;
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

.btn-nav {
  background: var(--color-primary);
  color: #fff;
  padding: 0.5rem 1.2rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-nav:hover { background: var(--color-primary-dark); color: #fff; }

.container {
  max-width: 560px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.hero-app {
  text-align: center;
  padding: 1.5rem 0;
}

.app-icon {
  width: 80px;
  height: 80px;
  background: var(--color-primary);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
  margin: 0 auto 1rem;
  letter-spacing: 1px;
}

.hero-app h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-gray-800);
  margin-bottom: 0.4rem;
}

.hero-app p {
  color: var(--color-gray-400);
  font-size: 0.95rem;
}

.acceso-directo {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  border: 1px solid var(--color-gray-200);
  text-align: center;
}

.acceso-texto {
  font-size: 0.875rem;
  color: var(--color-gray-600);
  margin-bottom: 0.85rem;
}

.btn-abrir {
  display: inline-block;
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius);
  padding: 0.75rem 2rem;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.btn-abrir:hover { background: var(--color-primary-dark); color: #fff; }

.instrucciones-card {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
  overflow: hidden;
}

.plataforma-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-gray-100);
}

.plataforma-header.android { background: #f0fdf4; }
.plataforma-header.ios     { background: #f0f9ff; }

.plataforma-icono {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.android .plataforma-icono { background: #16a34a; }
.ios .plataforma-icono     { background: #0284c7; }

.plataforma-nombre {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-gray-800);
}

.plataforma-sub {
  font-size: 0.775rem;
  color: var(--color-gray-400);
}

.pasos {
  list-style: none;
  padding: 0.75rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.paso {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.paso-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
}

.paso-texto {
  font-size: 0.875rem;
  color: var(--color-gray-600);
  line-height: 1.5;
}

.features-card {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
  padding: 1.25rem;
}

.features-titulo {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-gray-800);
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-gray-100);
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.feature-icono {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.feature-icono.azul   { background: var(--color-primary); }
.feature-icono.verde  { background: var(--color-success); }
.feature-icono.morado { background: #7c3aed; }
.feature-icono.naranja { background: var(--color-warning); }

.feature-texto {
  font-size: 0.8rem;
  color: var(--color-gray-600);
  line-height: 1.4;
}
</style>