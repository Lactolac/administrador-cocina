<template>
  <div class="login-page">
    <!-- Animated Background -->
    <div class="login-background">
      <div class="gradient-overlay"></div>
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
    </div>

    <!-- Login Container -->
    <v-container fluid class="login-container">
      <v-row justify="center" align="center" style="min-height: 100vh;">
        <v-col cols="12" sm="8" md="5" lg="4">
          <!-- Login Card -->
          <v-card class="login-card" elevation="24">
            <!-- Header Section -->
            <div class="login-header">
              <div class="logo-container">
                <img src="../images/lactolac-logo.png" alt="Lactolac Logo" style="width: 200px; height: auto;" />
              </div>
              <h1 class="login-title">Administracion de Cocina</h1>
            </div>

            <!-- Form Section -->
            <v-card-text class="pa-8">
              <v-form @submit.prevent="handleLogin" v-model="valid">
                <!-- Login Type Selector -->
                <v-btn-toggle
                  v-model="form.loginType"
                  mandatory
                  color="primary"
                  variant="outlined"
                  divided
                  class="mb-6"
                  style="width: 100%;"
                >
                  <v-btn value="ad" style="width: 50%;">
                    <v-icon start>mdi-domain</v-icon>
                    Dominio AD
                  </v-btn>
                  <v-btn value="local" style="width: 50%;">
                    <v-icon start>mdi-account</v-icon>
                    Usuario Local
                  </v-btn>
                </v-btn-toggle>

                <!-- Username Field -->
                <v-text-field
                  v-model="form.username"
                  :label="form.loginType === 'ad' ? 'Usuario de Dominio' : 'Usuario'"
                  prepend-inner-icon="mdi-account-circle"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4 login-input"
                  :rules="[rules.required]"
                  :disabled="loading"
                  color="primary"
                ></v-text-field>

                <!-- Password Field -->
                <v-text-field
                  v-model="form.password"
                  :label="form.loginType === 'ad' ? 'Contraseña de Dominio' : 'Contraseña'"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPassword ? 'text' : 'password'"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4 login-input"
                  :rules="[rules.required]"
                  :disabled="loading"
                  color="primary"
                  @click:append-inner="showPassword = !showPassword"
                ></v-text-field>

                <!-- Login Button -->
                <v-btn
                  type="submit"
                  color="primary"
                  size="x-large"
                  block
                  :loading="loading"
                  :disabled="!valid"
                  class="login-button"
                >
                  <v-icon start>mdi-login</v-icon>
                  Iniciar Sesión
                </v-btn>

                <!-- Error Alert -->
                <v-alert
                  v-if="error"
                  type="error"
                  variant="tonal"
                  class="mt-4"
                  prominent
                >
                  <v-icon start>mdi-alert-circle</v-icon>
                  {{ error }}
                </v-alert>
              </v-form>
            </v-card-text>

            <!-- Footer Section -->
            <v-card-actions class="justify-center pa-4">
              <p class="text-caption text-grey">
                © 2026 Cocina Planilla - Todos los derechos reservados
              </p>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Swal from 'sweetalert2'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const valid = ref(false)
    const loading = ref(false)
    const error = ref('')
    const showPassword = ref(false)
    
    const form = ref({
      username: '',
      password: '',
      loginType: 'ad'
    })

    const rules = {
      required: value => !!value || 'Este campo es requerido'
    }

    const handleLogin = async () => {
      if (!valid.value) return
      
      loading.value = true
      error.value = ''

      try {
        const result = await authStore.login(form.value)
        
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Inicio de sesión exitoso',
          timer: 1500,
          showConfirmButton: false
        })
        // Redirect based on user role
        const userRole = result?.user?.rol
        if (userRole === 'admin') {
          router.push('/dashboard')
        } else {
          router.push('/platos')
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response?.data?.message || 'Error al iniciar sesión'
        })
      } finally {
        loading.value = false
      }
    }

    return {
      valid,
      loading,
      error,
      showPassword,
      form,
      rules,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

/* Animated Background */
.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0056a6 0%, #003d73 50%, #001f3f 100%);
  z-index: 0;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 50%, rgba(30, 136, 229, 0.3) 0%, transparent 50%);
}

/* Floating Shapes Animation */
.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  left: -150px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  top: 50%;
  right: -100px;
  animation-delay: 5s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  bottom: -75px;
  left: 30%;
  animation-delay: 10s;
}

.shape-4 {
  width: 250px;
  height: 250px;
  top: 20%;
  left: 60%;
  animation-delay: 15s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
  }
}

/* Login Container */
.login-container {
  position: relative;
  z-index: 1;
}

/* Login Card */
.login-card {
  border-radius: 24px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Header Section */
.login-header {
  background: linear-gradient(135deg, #0056a6 0%, #1E88E5 100%);
  padding: 40px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.login-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.logo-container {
  position: relative;
  z-index: 1;
}

.logo-avatar {
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.logo-avatar:hover {
  transform: scale(1.1);
}

.login-title {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin-top: 20px;
  position: relative;
  z-index: 1;
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin-top: 8px;
  position: relative;
  z-index: 1;
}

/* Form Inputs */
.login-input {
  transition: all 0.3s ease;
}

.login-input:focus-within {
  transform: translateY(-2px);
}

/* Login Button */
.login-button {
  height: 56px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 86, 166, 0.3);
}

/* Responsive Design */
@media (max-width: 600px) {
  .login-title {
    font-size: 1.5rem;
  }
  
  .login-card {
    margin: 20px;
  }
}
</style>
