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
    meta: { title: 'Dashboard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/inventario',
    name: 'Inventario',
    component: () => import('../views/Inventario.vue'),
    meta: { title: 'Inventario', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/alimentacion',
    name: 'Alimentacion',
    component: () => import('../views/Alimentacion.vue'),
    meta: { title: 'Alimentación Servida', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/planilla',
    name: 'Planilla',
    component: () => import('../views/Planilla.vue'),
    meta: { title: 'Planilla', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/empleados',
    name: 'Empleados',
    component: () => import('../views/Empleados.vue'),
    meta: { title: 'Empleados', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/productos',
    name: 'Productos',
    component: () => import('../views/Productos.vue'),
    meta: { title: 'Productos', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: () => import('../views/Reportes.vue'),
    meta: { title: 'Reportes', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: () => import('../views/Usuarios.vue'),
    meta: { title: 'Usuarios', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/platos',
    name: 'PlatosMovil',
    component: () => import('../views/PlatosMovil.vue'),
    meta: { title: 'Platos Servidos', requiresAuth: true, requiresAdmin: false }
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
  const userStr = localStorage.getItem('user')
  const requiresAuth = to.meta.requiresAuth !== false
  const requiresAdmin = to.meta.requiresAdmin === true

  // Check if session has expired or token is missing
  let isSessionExpired = false
  let hasValidSession = false
  let userRole = null
  
  if (token && sessionExpiry) {
    const expiryTime = parseInt(sessionExpiry)
    if (!isNaN(expiryTime) && Date.now() < expiryTime) {
      hasValidSession = true
      // Get user role
      if (userStr && userStr !== 'undefined') {
        try {
          const user = JSON.parse(userStr)
          userRole = user.rol
        } catch (e) {
          console.error('Error parsing user:', e)
        }
      }
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

  // If going to root, redirect appropriately based on role
  if (to.path === '/') {
    if (hasValidSession) {
      if (userRole === 'admin') {
        next('/dashboard')
      } else {
        next('/platos')
      }
    } else {
      next('/login')
    }
    return
  }

  // Protect routes that require auth
  if (requiresAuth && !hasValidSession) {
    next('/login')
    return
  }

  // Check admin-only routes
  if (requiresAdmin && userRole !== 'admin') {
    next('/platos')
    return
  }

  // If logged in and trying to access login, redirect based on role
  if (to.path === '/login' && hasValidSession) {
    if (userRole === 'admin') {
      next('/dashboard')
    } else {
      next('/platos')
    }
    return
  }

  next()
})

export default router
