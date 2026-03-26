// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      beforeEnter: (to, from, next) => {
        const auth = useAuthStore()
        auth.isLoggedIn ? next({ name: 'dashboard' }) : next()
      }
    },
    {
      path: '/',
      component: () => import('../views/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue')
        },
        {
          path: 'reservas',
          name: 'reservas',
          component: () => import('../views/ReservasView.vue')
        },
        {
          path: 'reportes',
          name: 'reportes',
          component: () => import('../views/ReportesView.vue')
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: () => import('../views/UsuariosView.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router