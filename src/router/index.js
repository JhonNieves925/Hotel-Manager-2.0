// src/router/index.js
// Configuración de rutas con protección por rol.
// Las rutas con meta.requiresAuth redirigen al login
// si el usuario no está autenticado.

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    // --------------------------------------------------------
    // RUTAS PÚBLICAS — accesibles sin login
    // --------------------------------------------------------
    
    {
      path: '/app',
      name: 'descargar-app',
  component: () => import('../views/publico/DescargarAppView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      // Si ya está logueado redirige al dashboard
      beforeEnter: (to, from, next) => {
        const auth = useAuthStore()
        if (auth.isLoggedIn) {
          next({ name: 'dashboard' })
        } else {
          next()
        }
      }
    },

    // --------------------------------------------------------
    // RUTAS PRIVADAS — requieren login
    // --------------------------------------------------------
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/empleado/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reservas',
      name: 'reservas',
      component: () => import('../views/empleado/ReservasView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/huespedes',
      name: 'huespedes',
      component: () => import('../views/empleado/HuespedView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/habitaciones',
      name: 'habitaciones',
      component: () => import('../views/empleado/HabitacionesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reportes',
      name: 'reportes',
      component: () => import('../views/empleado/ReportesView.vue'),
      meta: { requiresAuth: true }
    },

    // Ruta raíz — redirige al portal público de huéspedes
    {
      path: '/',
      beforeEnter: () => {
        window.location.href = '/huesped/inicio'
      },
      component: { render: () => null }
    },

    // Ruta 404
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ]
})

// Guard global — verifica autenticación antes de cada navegación
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    // No está logueado — redirige al login guardando la ruta destino
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router