import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/acesso'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/acesso',
    name: 'Acesso',
    component: () => import('@/views/AcessoView.vue'),
    meta: { public: true }
  },
  {
    path: '/acesso/visitante',
    name: 'Visitante',
    component: () => import('@/views/VisitanteView.vue'),
    meta: { public: true }
  },
  {
    path: '/morador/solicitar-visitante',
    name: 'SolicitarVisitante',
    component: () => import('@/views/SolicitarVisitanteView.vue'),
    meta: { requiresAuth: true, role: 'MORADOR' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'Login' }
  }

  if (to.meta.role && auth.role !== to.meta.role) {
    if (!auth.isLoggedIn) return { name: 'Login' }
    // Wrong role redirect
    if (auth.role === 'ADMIN') return { name: 'Admin' }
    if (auth.role === 'MORADOR') return { name: 'SolicitarVisitante' }
  }
})

export default router
