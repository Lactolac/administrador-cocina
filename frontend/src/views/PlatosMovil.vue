<template>
  <div class="platos-movil-container">
    <!-- Header con gradiente -->
    <div class="header-section">
      <div class="header-gradient"></div>
      <div class="header-content">
        <img src="../images/lactolac-logo.png" alt="Lactolac" class="logo" />
        <h1 class="app-title">Platos Servidos</h1>
        <p class="app-date">{{ currentDate }}</p>
        <div class="user-section">
          <div class="user-chip">
            <v-icon icon="mdi-account-circle" color="white" size="small"></v-icon>
            <span>{{ userName }}</span>
          </div>
          <v-btn 
            icon="mdi-logout" 
            size="small" 
            variant="text" 
            color="white"
            @click="handleLogout"
            class="logout-icon"
          ></v-btn>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="main-content">
      <!-- Formulario de registro -->
      <v-card class="form-card elevation-4">
        <v-card-title class="form-title">
          <v-icon start color="primary">mdi-plus-circle</v-icon>
          Nuevo Registro
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="form" v-model="valid">
            <!-- Descripción -->
            <v-select
              v-model="formData.descripcion"
              label="Área"
              :items="areas"
              :rules="[rules.required]"
              variant="outlined"
              class="mb-4 field-styled"
              density="comfortable"
              prepend-inner-icon="mdi-map-marker"
              color="primary"
            ></v-select>

            <!-- Tarjetas de platos -->
            <div class="platos-grid">
              <div class="plato-card desayuno">
                <div class="plato-icon">
                  <v-icon size="32" color="white">mdi-coffee</v-icon>
                </div>
                <div class="plato-content">
                  <span class="plato-label">Desayunos</span>
                  <v-text-field
                    v-model.number="formData.desayunos"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="plato-input"
                    color="orange-darken-2"
                  ></v-text-field>
                </div>
              </div>

              <div class="plato-card almuerzo">
                <div class="plato-icon">
                  <v-icon size="32" color="white">mdi-food</v-icon>
                </div>
                <div class="plato-content">
                  <span class="plato-label">Almuerzos</span>
                  <v-text-field
                    v-model.number="formData.almuerzos"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="plato-input"
                    color="green-darken-2"
                  ></v-text-field>
                </div>
              </div>

              <div class="plato-card cena">
                <div class="plato-icon">
                  <v-icon size="32" color="white">mdi-food-steak</v-icon>
                </div>
                <div class="plato-content">
                  <span class="plato-label">Cenas</span>
                  <v-text-field
                    v-model.number="formData.cenas"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="plato-input"
                    color="blue-darken-2"
                  ></v-text-field>
                </div>
              </div>

              <div class="plato-card refrigerio">
                <div class="plato-icon">
                  <v-icon size="32" color="white">mdi-cookie</v-icon>
                </div>
                <div class="plato-content">
                  <span class="plato-label">Refrigerios</span>
                  <v-text-field
                    v-model.number="formData.refrigerios"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="plato-input"
                    color="purple-darken-2"
                  ></v-text-field>
                </div>
              </div>
            </div>

            <!-- Total -->
            <div class="total-section">
              <div class="total-card">
                <span class="total-label">Total de Platos</span>
                <span class="total-value">{{ totalPlatos }}</span>
              </div>
            </div>

            <!-- Botones -->
            <v-btn
              color="primary"
              size="x-large"
              block
              @click="saveRegistro"
              :loading="saving"
              :disabled="!valid || totalPlatos === 0"
              class="save-btn"
            >
              <v-icon start>mdi-check-circle</v-icon>
              Guardar Registro
            </v-btn>

            <v-btn
              color="grey"
              size="large"
              block
              variant="outlined"
              @click="resetForm"
              class="clear-btn"
            >
              <v-icon start>mdi-refresh</v-icon>
              Limpiar
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>

    </div>
  </div>
</template>

<script>
import { alimentacionService } from '../services/api'
import { useAuthStore } from '../stores/auth'
import Swal from 'sweetalert2'

export default {
  name: 'PlatosMovil',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      valid: false,
      saving: false,
      areas: ['Administración', 'Producción'],
      formData: {
        descripcion: '',
        desayunos: 0,
        almuerzos: 0,
        cenas: 0,
        refrigerios: 0
      },
      rules: {
        required: v => !!v || 'Este campo es requerido'
      }
    }
  },
  computed: {
    currentDate() {
      return new Date().toLocaleDateString('es-SV', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    totalPlatos() {
      return (parseInt(this.formData.desayunos) || 0) +
             (parseInt(this.formData.almuerzos) || 0) +
             (parseInt(this.formData.cenas) || 0) +
             (parseInt(this.formData.refrigerios) || 0)
    },
    userName() {
      return this.authStore.user?.nombre || this.authStore.user?.username || 'Usuario'
    }
  },
  methods: {
    async saveRegistro() {
      const { valid } = await this.$refs.form.validate()
      if (!valid) return

      if (this.totalPlatos === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin platos',
          text: 'Debe ingresar al menos un plato'
        })
        return
      }

      this.saving = true
      try {
        // Siempre usar la fecha actual
        const fecha = new Date()
        const fechaStr = fecha.toISOString().split('T')[0]
        const mes = fecha.toLocaleString('es-ES', { month: 'long' })
        const anio = fecha.getFullYear()

        await alimentacionService.create({
          fecha: fechaStr,
          descripcion: this.formData.descripcion,
          desayunos: this.formData.desayunos,
          almuerzos: this.formData.almuerzos,
          cenas: this.formData.cenas,
          refrigerios: this.formData.refrigerios,
          mes,
          anio
        })

        Swal.fire({
          icon: 'success',
          title: '¡Guardado!',
          text: 'Registro guardado correctamente',
          timer: 1500,
          showConfirmButton: false
        })

        this.resetForm()
      } catch (error) {
        console.error('Error saving:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar el registro'
        })
      } finally {
        this.saving = false
      }
    },
    resetForm() {
      this.formData = {
        descripcion: '',
        desayunos: 0,
        almuerzos: 0,
        cenas: 0,
        refrigerios: 0
      }
      this.$refs.form?.resetValidation()
    },
    async handleLogout() {
      const result = await Swal.fire({
        title: '¿Cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar'
      })
      if (result.isConfirmed) {
        await this.authStore.logout()
        window.location.href = '/login'
      }
    }
  }
}
</script>

<style scoped>
.platos-movil-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #e4e8ec 100%);
}

/* Header Section */
.header-section {
  position: relative;
  padding: 24px 16px 32px;
  overflow: hidden;
}

.header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0056a6 0%, #1E88E5 50%, #42A5F5 100%);
  border-radius: 0 0 32px 32px;
}

.header-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.logo {
  width: 80px;
  height: auto;
  margin-bottom: 8px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.app-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.app-date {
  color: rgba(255,255,255,0.9);
  font-size: 0.85rem;
  margin: 4px 0 12px;
  text-transform: capitalize;
}

.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.2);
  padding: 6px 16px;
  border-radius: 20px;
  color: white;
  font-size: 0.85rem;
}

.user-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logout-icon {
  background: rgba(255,255,255,0.15);
  border-radius: 50%;
}

/* Main Content */
.main-content {
  padding: 0 16px 24px;
  margin-top: -16px;
}

/* Form Card */
.form-card {
  border-radius: 20px !important;
  overflow: hidden;
  margin-bottom: 16px;
}

.form-title {
  background: linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%);
  padding: 16px 20px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1565c0;
}

.field-styled {
  border-radius: 12px;
}

/* Platos Grid */
.platos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.plato-card {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 16px;
  gap: 12px;
}

.plato-card.desayuno {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border: 2px solid #ffb74d;
}

.plato-card.almuerzo {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border: 2px solid #66bb6a;
}

.plato-card.cena {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border: 2px solid #42a5f5;
}

.plato-card.refrigerio {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  border: 2px solid #ab47bc;
}

.plato-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.desayuno .plato-icon { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); }
.almuerzo .plato-icon { background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); }
.cena .plato-icon { background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); }
.refrigerio .plato-icon { background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); }

.plato-content {
  flex: 1;
  min-width: 0;
}

.plato-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 4px;
}

.plato-input {
  border-radius: 8px;
}

.plato-input :deep(.v-field) {
  background: white !important;
  border-radius: 8px !important;
}

/* Total Section */
.total-section {
  margin-bottom: 20px;
}

.total-card {
  background: linear-gradient(135deg, #0056a6 0%, #1E88E5 100%);
  border-radius: 16px;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  color: rgba(255,255,255,0.9);
  font-size: 1rem;
  font-weight: 500;
}

.total-value {
  color: white;
  font-size: 2rem;
  font-weight: 700;
}

/* Buttons */
.save-btn {
  border-radius: 12px;
  height: 52px;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.clear-btn {
  border-radius: 12px;
  height: 44px;
}

/* Responsive */
@media (max-width: 400px) {
  .platos-grid {
    grid-template-columns: 1fr;
  }
  
  .plato-card {
    padding: 10px;
  }
  
  .plato-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
