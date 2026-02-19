<template>
  <div>
    <v-card class="mb-6 elevation-4 rounded-lg">
      <v-card-title class="d-flex align-center pa-6 bg-primary text-white">
        <v-icon size="28" class="mr-3">mdi-account-cog</v-icon>
        <span class="text-h5">Administración de Usuarios</span>
        <v-spacer></v-spacer>
        <v-btn 
          color="white" 
          variant="flat"
          prepend-icon="mdi-plus"
          @click="openDialog()"
          class="text-primary"
        >
          Nuevo Usuario
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Data Table -->
    <v-card class="elevation-4 rounded-lg">
      <v-data-table
        :headers="headers"
        :items="usuarios"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:item.rol="{ item }">
          <v-chip 
            :color="item.rol === 'admin' ? 'primary' : 'secondary'"
            size="small"
          >
            {{ item.rol === 'admin' ? 'Administrador' : 'Usuario' }}
          </v-chip>
        </template>
        
        <template v-slot:item.activo="{ item }">
          <v-chip 
            :color="item.activo ? 'success' : 'error'"
            size="small"
          >
            {{ item.activo ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>
        
        <template v-slot:item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>
        
        <template v-slot:item.actions="{ item }">
          <v-btn 
            icon="mdi-pencil" 
            size="small" 
            variant="text"
            color="primary"
            @click="openDialog(item)"
            class="mr-2"
          ></v-btn>
          <v-btn 
            icon="mdi-delete" 
            size="small" 
            variant="text"
            color="error"
            @click="confirmDelete(item)"
          ></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog para crear/editar usuario -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="bg-primary text-white pa-4">
          {{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="formData.username"
              label="Usuario"
              :rules="[rules.required, rules.username]"
              :disabled="!!editingUser"
              variant="outlined"
              class="mb-4"
            ></v-text-field>
            
            <v-text-field
              v-model="formData.nombre"
              label="Nombre completo"
              :rules="[rules.required]"
              variant="outlined"
              class="mb-4"
            ></v-text-field>
            
            <v-text-field
              v-model="formData.password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPassword = !showPassword"
              :rules="editingUser ? [] : [rules.required, rules.password]"
              :hint="editingUser ? 'Dejar vacío para mantener contraseña actual' : ''"
              variant="outlined"
              class="mb-4"
            ></v-text-field>
            
            <v-select
              v-model="formData.rol"
              label="Rol"
              :items="roles"
              item-title="text"
              item-value="value"
              :rules="[rules.required]"
              variant="outlined"
              class="mb-4"
            ></v-select>
            
            <v-switch
              v-model="formData.activo"
              label="Usuario activo"
              color="primary"
              hide-details
            ></v-switch>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn 
            color="grey" 
            variant="text" 
            @click="closeDialog"
          >
            Cancelar
          </v-btn>
          <v-btn 
            color="primary" 
            variant="flat"
            @click="saveUser"
            :loading="saving"
          >
            {{ editingUser ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmación para eliminar -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 bg-error text-white pa-4">
          Confirmar eliminación
        </v-card-title>
        <v-card-text class="pa-6">
          ¿Está seguro que desea eliminar al usuario <strong>{{ userToDelete?.username }}</strong>?
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn 
            color="grey" 
            variant="text" 
            @click="deleteDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn 
            color="error" 
            variant="flat"
            @click="deleteUser"
            :loading="deleting"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { usuariosService } from '../services/api'
import Swal from 'sweetalert2'

export default {
  name: 'Usuarios',
  data() {
    return {
      usuarios: [],
      loading: false,
      dialog: false,
      deleteDialog: false,
      editingUser: null,
      userToDelete: null,
      valid: false,
      saving: false,
      deleting: false,
      showPassword: false,
      headers: [
        { title: 'Usuario', key: 'username', align: 'start' },
        { title: 'Nombre', key: 'nombre', align: 'start' },
        { title: 'Rol', key: 'rol', align: 'center' },
        { title: 'Estado', key: 'activo', align: 'center' },
        { title: 'Creado', key: 'created_at', align: 'center' },
        { title: 'Acciones', key: 'actions', align: 'center', sortable: false }
      ],
      roles: [
        { text: 'Administrador', value: 'admin' },
        { text: 'Usuario (Solo Platos)', value: 'usuario' }
      ],
      formData: {
        username: '',
        nombre: '',
        password: '',
        rol: 'usuario',
        activo: true
      },
      rules: {
        required: v => !!v || 'Este campo es requerido',
        username: v => (v && v.length >= 3) || 'Mínimo 3 caracteres',
        password: v => (v && v.length >= 6) || 'Mínimo 6 caracteres'
      }
    }
  },
  mounted() {
    this.loadUsuarios()
  },
  methods: {
    async loadUsuarios() {
      this.loading = true
      try {
        const response = await usuariosService.getAll()
        this.usuarios = response.data
      } catch (error) {
        console.error('Error loading users:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los usuarios'
        })
      } finally {
        this.loading = false
      }
    },
    openDialog(user = null) {
      this.editingUser = user
      if (user) {
        this.formData = {
          username: user.username,
          nombre: user.nombre,
          password: '',
          rol: user.rol,
          activo: user.activo
        }
      } else {
        this.formData = {
          username: '',
          nombre: '',
          password: '',
          rol: 'usuario',
          activo: true
        }
      }
      this.dialog = true
    },
    closeDialog() {
      this.dialog = false
      this.editingUser = null
      this.$refs.form?.reset()
    },
    async saveUser() {
      const { valid } = await this.$refs.form.validate()
      if (!valid) return

      this.saving = true
      try {
        if (this.editingUser) {
          await usuariosService.update(this.editingUser.id, this.formData)
          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: 'Usuario actualizado correctamente',
            timer: 1500,
            showConfirmButton: false
          })
        } else {
          await usuariosService.create(this.formData)
          Swal.fire({
            icon: 'success',
            title: 'Creado',
            text: 'Usuario creado correctamente',
            timer: 1500,
            showConfirmButton: false
          })
        }
        this.closeDialog()
        this.loadUsuarios()
      } catch (error) {
        console.error('Error saving user:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.error || 'Error al guardar el usuario'
        })
      } finally {
        this.saving = false
      }
    },
    confirmDelete(user) {
      this.userToDelete = user
      this.deleteDialog = true
    },
    async deleteUser() {
      this.deleting = true
      try {
        await usuariosService.delete(this.userToDelete.id)
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Usuario eliminado correctamente',
          timer: 1500,
          showConfirmButton: false
        })
        this.deleteDialog = false
        this.loadUsuarios()
      } catch (error) {
        console.error('Error deleting user:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.error || 'Error al eliminar el usuario'
        })
      } finally {
        this.deleting = false
      }
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('es-SV', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>
