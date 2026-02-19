<template>
  <v-app>
    <!-- Show navbar only if authenticated AND not on platos route -->
    <template v-if="authStore.isAuthenticated && !isPlatosRoute">
      <!-- Modern Navigation Drawer -->
      <v-navigation-drawer
        v-model="drawer"
        :rail="rail"
        permanent
        @click="rail = false"
        color="primary"
        theme="dark"
        elevation="6"
        class="modern-drawer"
      >
        <div class="text-center pa-6 pt-8">
          <img src="./images/lactolac-logo.png" alt="Lactolac" style="width: 120px; height: auto; margin-bottom: 8px;" />
          <h3 class="text-white font-weight-bold text-h5">Cocina</h3>
          <p class="text-white-50 text-caption">Administración</p>
        </div>

        <v-divider class="mb-4"></v-divider>

        <!-- Menu Items -->
        <v-list density="comfortable" nav class="menu-items">
          <v-list-item
            v-for="item in filteredMenuItems"
            :key="item.title"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.route"
            :value="item.route"
            color="white"
            class="mb-2 menu-item"
            variant="tonal"
          >
            <template v-slot:append>
              <v-icon class="text-white-50" size="16">mdi-chevron-right</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <!-- Modern App Bar -->
      <v-app-bar 
        color="surface"
        elevation="0"
        class="modern-app-bar"
      >
        <v-app-bar-nav-icon @click="drawer = !drawer" class="text-primary"></v-app-bar-nav-icon>
        <v-toolbar-title class="text-primary font-weight-bold">
          {{ currentPageTitle }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div class="d-flex align-center">
          <span class="text-body-1 mr-2">{{ userName }}</span>
          <v-chip 
            color="primary" 
            variant="tonal" 
            size="small"
            class="mr-2"
          >
            {{ userRoleLabel }}
          </v-chip>
          <v-btn 
            color="error" 
            variant="text"
            size="small"
            @click="handleLogout"
            prepend-icon="mdi-logout"
          >
            Cerrar Sesión
          </v-btn>
        </div>
      </v-app-bar>

      <v-main>
        <v-container fluid class="pa-0" style="min-height: 100vh;">
          <!-- Background Design -->
          <div class="background-design">
            <div class="bg-gradient"></div>
            <div class="bg-pattern"></div>
          </div>
          
          <!-- Content Area -->
          <v-card 
            elevation="0"
            class="content-card"
            style="min-height: calc(100vh - 100px);"
          >
            <v-card-text class="pa-8">
              <router-view />
            </v-card-text>
          </v-card>
        </v-container>
      </v-main>
    </template>

    <!-- Show only router-view for login page and platos route -->
    <template v-else>
      <v-main>
        <router-view />
      </v-main>
    </template>
  </v-app>
</template>

<script>
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'
import { computed, onMounted, onUnmounted } from 'vue'
import Swal from 'sweetalert2'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    let sessionCheckInterval = null

    const handleLogout = async () => {
      const result = await Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Está seguro que desea cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar'
      })
      if (result.isConfirmed) {
        await authStore.logout()
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Hasta pronto',
          timer: 1500,
          showConfirmButton: false
        })
        // Use window.location to force a full page reload and ensure login page shows
        window.location.href = '/login'
      }
    }

    // Check session expiry every minute
    const checkSessionExpiry = () => {
      if (authStore.isAuthenticated && authStore.isSessionExpired()) {
        Swal.fire({
          icon: 'warning',
          title: 'Sesión expirada',
          text: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          authStore.logout()
          window.location.href = '/login'
        })
      }
    }

    onMounted(() => {
      // Check session every minute
      sessionCheckInterval = setInterval(checkSessionExpiry, 60000)
      // Also check immediately
      checkSessionExpiry()
    })

    onUnmounted(() => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval)
      }
    })

    return {
      authStore,
      handleLogout
    }
  },
  data() {
    return {
      drawer: true,
      rail: false,
      allMenuItems: [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', route: '/dashboard', adminOnly: true },
        { title: 'Inventario', icon: 'mdi-package-variant', route: '/inventario', adminOnly: true },
        { title: 'Alimentación', icon: 'mdi-food', route: '/alimentacion', adminOnly: true },
        { title: 'Planilla', icon: 'mdi-cash-multiple', route: '/planilla', adminOnly: true },
        { title: 'Empleados', icon: 'mdi-account-group', route: '/empleados', adminOnly: true },
        { title: 'Productos', icon: 'mdi-tag-multiple', route: '/productos', adminOnly: true },
        { title: 'Reportes', icon: 'mdi-chart-box', route: '/reportes', adminOnly: true },
        { title: 'Usuarios', icon: 'mdi-account-cog', route: '/usuarios', adminOnly: true },
      ]
    }
  },
  computed: {
    currentPageTitle() {
      const route = this.$route
      return route.meta.title || 'Dashboard'
    },
    userName() {
      if (this.authStore.user && this.authStore.user.username) {
        return this.authStore.user.username
      }
      return 'Usuario'
    },
    userRole() {
      if (this.authStore.user && this.authStore.user.rol) {
        return this.authStore.user.rol
      }
      return 'usuario'
    },
    userRoleLabel() {
      return this.userRole === 'admin' ? 'Administrador' : 'Usuario'
    },
    filteredMenuItems() {
      // Los usuarios no admin no ven menú (solo ven la vista de platos)
      if (this.userRole !== 'admin') {
        return []
      }
      return this.allMenuItems
    },
    isPlatosRoute() {
      return this.$route.path === '/platos'
    }
  }
}
</script>

<style>
.v-navigation-drawer .v-list-item--active {
  background-color: rgba(255, 255, 255, 0.15);
}
</style>
