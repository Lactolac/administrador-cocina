import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: 'Login', requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: 'Dashboard', requiresAuth: true }
  },
  {
    path: '/inventario',
    name: 'Inventario',
    component: () => import('../views/Inventario.vue'),
    meta: { title: 'Inventario', requiresAuth: true }
  },
  {
    path: '/alimentacion',
    name: 'Alimentacion',
    component: () => import('../views/Alimentacion.vue'),
    meta: { title: 'Alimentación Servida', requiresAuth: true }
  },
  {
    path: '/planilla',
    name: 'Planilla',
    component: () => import('../views/Planilla.vue'),
    meta: { title: 'Planilla', requiresAuth: true }
  },
  {
    path: '/empleados',
    name: 'Empleados',
    component: () => import('../views/Empleados.vue'),
    meta: { title: 'Empleados', requiresAuth: true }
  },
  {
    path: '/productos',
    name: 'Productos',
    component: () => import('../views/Productos.vue'),
    meta: { title: 'Productos', requiresAuth: true }
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: () => import('../views/Reportes.vue'),
    meta: { title: 'Reportes', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'Cocina Planilla'} - Cocina Planilla`
  
  const token = localStorage.getItem('token')
  const sessionExpiry = localStorage.getItem('sessionExpiry')
  const requiresAuth = to.meta.requiresAuth !== false

  // Check if session has expired or token is missing
  let isSessionExpired = false
  let hasValidSession = false
  
  if (token && sessionExpiry) {
    const expiryTime = parseInt(sessionExpiry)
    if (!isNaN(expiryTime) && Date.now() < expiryTime) {
      hasValidSession = true
    } else {
      isSessionExpired = true
    }
  }

  // If session expired or no valid token, clear storage
  if (!hasValidSession) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('sessionExpiry')
  }

  // If going to root, redirect appropriately
  if (to.path === '/') {
    if (hasValidSession) {
      next('/dashboard')
    } else {
      next('/login')
    }
    return
  }

  // Protect routes that require auth
  if (requiresAuth && !hasValidSession) {
    next('/login')
  } else if (to.path === '/login' && hasValidSession) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router