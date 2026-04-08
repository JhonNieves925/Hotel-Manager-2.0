<template>
  <div class="descarga-page">

    <nav class="navbar">
      <RouterLink to="/inicio" class="brand">
        <div class="brand">
        <img src="/logo.png" alt="Hotel Manager" class="brand-logo" />
      </div>
      </RouterLink>
      <RouterLink to="/inicio" class="btn-volver">← Volver al inicio</RouterLink>
    </nav>

    <main class="main">

      <div class="hero-section">
        <div class="brand">
        <img src="/logo.png" alt="Hotel Manager" class="app-icon" />
      </div>
        <div class="badge">📱 App para Huéspedes</div>
        <h1>Gestiona tus reservas<br><span class="accent">desde tu celular</span></h1>
        <p class="sub">Descarga la app de Hotel Manager y ten el control de tus reservas, check-in y perfil en la palma de tu mano.</p>

        <a :href="urlApp" target="_blank" class="btn-descargar">
          Abrir la app
          <span class="btn-arrow">→</span>
        </a>
      </div>

      <div class="features-section">
        <h2>¿Qué puedes hacer?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-ico">🛏️</div>
            <div class="feature-titulo">Reservas</div>
            <div class="feature-desc">Busca y reserva habitaciones disponibles en segundos</div>
          </div>
          <div class="feature-card">
            <div class="feature-ico">📋</div>
            <div class="feature-titulo">Mis reservas</div>
            <div class="feature-desc">Consulta el historial y estado de todas tus reservas</div>
          </div>
          <div class="feature-card">
            <div class="feature-ico">👤</div>
            <div class="feature-titulo">Tu perfil</div>
            <div class="feature-desc">Actualiza tus datos y preferencias cuando quieras</div>
          </div>
          <div class="feature-card">
            <div class="feature-ico">❌</div>
            <div class="feature-titulo">Cancelaciones</div>
            <div class="feature-desc">Cancela reservas fácilmente desde la app</div>
          </div>
        </div>
      </div>

      <div class="steps-section">
        <h2>¿Cómo empezar?</h2>
        <div class="steps">
          <div class="step">
            <div class="step-num">01</div>
            <div class="step-texto">
              <strong>Abre el enlace</strong>
              <span>Toca el botón "Abrir la app" desde tu celular</span>
            </div>
          </div>
          <div class="step-sep"></div>
          <div class="step">
            <div class="step-num">02</div>
            <div class="step-texto">
              <strong>Instala en tu pantalla</strong>
              <span>Usa "Agregar a pantalla de inicio" en tu navegador</span>
            </div>
          </div>
          <div class="step-sep"></div>
          <div class="step">
            <div class="step-num">03</div>
            <div class="step-texto">
              <strong>Regístrate o inicia sesión</strong>
              <span>Crea tu cuenta y empieza a disfrutar</span>
            </div>
          </div>
        </div>
      </div>

    </main>

    <footer class="footer">
      <span>🏨 Hotel Manager</span>
      <span>Cali, Valle del Cauca · Colombia</span>
    </footer>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const urlApp = computed(() => {
  const host = window.location.hostname
  // ✅ Después — va directo al login
if (host === 'localhost') return 'http://localhost:5175/huesped/login'
return `${window.location.protocol}//${host}/huesped/login`
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

.descarga-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #000000 0%, #080804 45%, #141105 100%);
  font-family: 'Inter', sans-serif;
  color: #fff;
}

/* ── NAVBAR ── */
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
.btn-volver {
  font-size: 0.8rem; color: rgba(255,255,255,0.4);
  text-decoration: none; transition: color 0.2s;
}
.btn-volver:hover { color: #C9A84C; }

/* ── MAIN ── */
.main { max-width: 860px; margin: 0 auto; padding: 4rem 2rem 3rem; }

/* ── HERO ── */
.hero-section {
  text-align: center;
  padding-bottom: 4rem;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  margin-bottom: 4rem;
}
.app-icon {
  display: block;
  margin: 0 auto; 
  height: 220px;
  width: auto;
}
.badge {
  display: inline-block;
  background: rgba(232, 186, 58, 0.1); border: 1px solid rgba(232, 186, 58, 0.3);
  color: #C9A84C; padding: 0.35rem 1rem; border-radius: 20px;
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em;
  margin-bottom: 1.5rem;
}
.hero-section h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700; line-height: 1.2;
  color: #fff; margin-bottom: 1rem;
}
.accent { color: #C9A84C; font-style: italic; }
.sub {
  font-size: 1rem; color: rgba(255,255,255,0.5);
  max-width: 520px; margin: 0 auto 2.5rem; line-height: 1.7;
}

.btn-descargar {
  display: inline-flex; align-items: center; gap: 0.75rem;
  background: #C9A84C; color: #fff;
  padding: 0.9rem 2.5rem; border-radius: 50px;
  font-size: 1rem; font-weight: 700;
  text-decoration: none; transition: all 0.25s;
  box-shadow: 0 8px 24px rgba(232, 177, 58, 0.35);
}
.btn-descargar:hover {
  background: #f2d44e; transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(232,119,58,0.45);
}
.btn-arrow { font-size: 1.2rem; transition: transform 0.2s; }
.btn-descargar:hover .btn-arrow { transform: translateX(4px); }

/* ── FEATURES ── */
.features-section { margin-bottom: 4rem; }
.features-section h2,
.steps-section h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem; font-weight: 700;
  color: #fff; margin-bottom: 2rem; text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.feature-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 1.5rem 1.25rem;
  text-align: center; transition: all 0.2s;
}
.feature-card:hover {
  border-color: rgba(232, 191, 58, 0.3);
  background: rgba(232, 171, 58, 0.05);
  transform: translateY(-3px);
}
.feature-ico { font-size: 2rem; margin-bottom: 0.75rem; }
.feature-titulo {
  font-size: 0.9rem; font-weight: 600;
  color: #fff; margin-bottom: 0.4rem;
}
.feature-desc { font-size: 0.78rem; color: rgba(255,255,255,0.4); line-height: 1.5; }

/* ── STEPS ── */
.steps-section {
  padding-top: 4rem;
  border-top: 1px solid rgba(255,255,255,0.07);
  margin-bottom: 4rem;
}

.steps {
  display: flex; align-items: center;
  gap: 0; flex-wrap: wrap; justify-content: center;
}

.step {
  display: flex; align-items: flex-start; gap: 1rem;
  flex: 1; min-width: 200px; max-width: 240px; padding: 1rem;
}

.step-num {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem; font-weight: 700;
  color: rgba(232, 191, 58, 0.3); line-height: 1; flex-shrink: 0;
}

.step-texto { display: flex; flex-direction: column; gap: 0.3rem; padding-top: 0.4rem; }
.step-texto strong { font-size: 0.9rem; color: #fff; font-weight: 600; }
.step-texto span { font-size: 0.75rem; color: rgba(255,255,255,0.4); line-height: 1.5; }

.step-sep {
  width: 60px; height: 1px;
  background: rgba(232, 177, 58, 0.2); flex-shrink: 0;
}

/* ── FOOTER ── */
.footer {
  display: flex; justify-content: center; gap: 2rem;
  flex-wrap: wrap; padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255,255,255,0.07);
  font-size: 0.78rem; color: rgba(255,255,255,0.25);
}

@media (max-width: 600px) {
  .main { padding: 2.5rem 1rem 2rem; }
  .step-sep { display: none; }
  .steps { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
  .step { max-width: 100%; }
}
</style>