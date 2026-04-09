import { createRouter, createWebHistory } from 'vue-router'
import { useHuespedAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: () => {
      // Si la app está instalada como PWA (modo standalone) va directo al login
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
      return isStandalone ? '/login' : '/inicio'
    }
  },
  {
    path: '/inicio',
    name: 'inicio',
    component: () => import('../views/InicioView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    beforeEnter: (to, from, next) => {
      const auth = useHuespedAuthStore()
      auth.isLoggedIn ? next({ name: 'reservas' }) : next()
    }
  },
  {
    path: '/registro',
    name: 'registro',
    component: () => import('../views/RegistroView.vue'),
    beforeEnter: (to, from) => {
      const auth = useHuespedAuthStore()
      if (auth.isLoggedIn) return { name: 'reservas' }
    }
  },
  {
    path: '/buscar',
    name: 'buscar',
    component: () => import('../views/BuscarView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/habitacion/:id',
    name: 'habitacion-detalle',
    component: () => import('../views/HabitacionDetalleView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reservar',
    name: 'reservar',
    component: () => import('../views/ReservarView.vue')
  },
  {
    path: '/mis-reservas',
    name: 'reservas',
    component: () => import('../views/MisReservasView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: () => import('../views/PerfilView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/inicio'
  },
  {
  path: '/app',
  name: 'descargar-app',
  component: () => import('../views/DescargarAppHuespedView.vue')
},
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useHuespedAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router