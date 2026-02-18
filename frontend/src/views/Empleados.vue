<template>
  <div>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex justify-space-between align-center">
          <h2 class="text-h5">
            <v-icon start>mdi-account-group</v-icon>
            Gestión de Empleados
          </h2>
          <v-btn color="primary" @click="openModal()" prepend-icon="mdi-plus">
            Nuevo Empleado
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Search -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              label="Buscar"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              @update:modelValue="filterEmpleados"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="filters.activo"
              :items="[{ value: '', title: 'Todos' }, { value: 'true', title: 'Activos' }, { value: 'false', title: 'Inactivos' }]"
              label="Estado"
              variant="outlined"
              density="compact"
              @update:modelValue="loadEmpleados"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Table -->
    <v-card class="elevation-2">
      <v-data-table
        :headers="headers"
        :items="filteredEmpleados"
        :items-per-page="10"
        class="elevation-1"
      >
        <template v-slot:item.codigo="{ item }">
          <v-chip size="small" color="primary">{{ item.codigo }}</v-chip>
        </template>
        <template v-slot:item.salario_base="{ item }">
          ${{ formatNumber(item.salario_base) }}
        </template>
        <template v-slot:item.activo="{ item }">
          <v-chip :color="item.activo ? 'success' : 'error'" size="small">
            {{ item.activo ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon size="small" variant="text" @click="openModal(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon size="small" variant="text" color="error" @click="deleteEmpleado(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon start>mdi-account</v-icon>
          {{ editingItem ? 'Editar' : 'Nuevo' }} Empleado
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveEmpleado">
            <v-text-field
              v-model="form.codigo"
              label="Código"
              variant="outlined"
              class="mb-3"
            ></v-text-field>
            <v-text-field
              v-model="form.nombres"
              label="Nombres"
              variant="outlined"
              class="mb-3"
            ></v-text-field>
            <v-text-field
              v-model="form.apellidos"
              label="Apellidos"
              variant="outlined"
              class="mb-3"
            ></v-text-field>
            <v-text-field
              v-model="form.salario_base"
              label="Salario Base"
              type="number"
              step="0.01"
              variant="outlined"
              prefix="$"
              class="mb-3"
            ></v-text-field>
            <v-switch
              v-model="form.activo"
              label="Empleado Activo"
              color="success"
            ></v-switch>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveEmpleado">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { empleadosService } from '../services/api'
import Swal from 'sweetalert2'

export default {
  name: 'Empleados',
  data() {
    return {
      dialog: false,
      empleados: [],
      filteredEmpleados: [],
      search: '',
      filters: { activo: 'true' },
      form: {
        codigo: '',
        nombres: '',
        apellidos: '',
        salario_base: 0,
        activo: true
      },
      editingItem: null,
      headers: [
        { title: 'Código', key: 'codigo' },
        { title: 'Nombres', key: 'nombres' },
        { title: 'Apellidos', key: 'apellidos' },
        { title: 'Salario Base', key: 'salario_base', align: 'end' },
        { title: 'Estado', key: 'activo' },
        { title: 'Acciones', key: 'actions', sortable: false }
      ]
    }
  },
  methods: {
    formatNumber(num) {
      if (!num) return '0.00'
      return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    async loadEmpleados() {
      try {
        const res = await empleadosService.getAll(this.filters)
        this.empleados = res.data
        this.filteredEmpleados = this.empleados
      } catch (error) {
        console.error('Error loading empleados:', error)
      }
    },
    filterEmpleados() {
      if (!this.search) {
        this.filteredEmpleados = this.empleados
        return
      }
      const searchLower = this.search.toLowerCase()
      this.filteredEmpleados = this.empleados.filter(e => 
        e.nombres.toLowerCase().includes(searchLower) ||
        e.apellidos.toLowerCase().includes(searchLower) ||
        e.codigo.toLowerCase().includes(searchLower)
      )
    },
    openModal(item = null) {
      this.editingItem = item
      if (item) {
        this.form = { ...item }
      } else {
        this.form = {
          codigo: '',
          nombres: '',
          apellidos: '',
          salario_base: 0,
          activo: true
        }
      }
      this.dialog = true
    },
    async saveEmpleado() {
      try {
        if (this.editingItem) {
          await empleadosService.update(this.editingItem.id, this.form)
          Swal.fire('¡Actualizado!', 'Empleado actualizado correctamente', 'success')
        } else {
          await empleadosService.create(this.form)
          Swal.fire('¡Creado!', 'Empleado creado correctamente', 'success')
        }
        this.dialog = false
        this.loadEmpleados()
      } catch (error) {
        console.error('Error saving empleado:', error)
        Swal.fire('Error', error.response?.data?.error || 'Error al guardar empleado', 'error')
      }
    },
    async deleteEmpleado(id) {
      const result = await Swal.fire({
        title: '¿Está seguro?',
        text: '¿Desea eliminar este empleado?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      })
      if (result.isConfirmed) {
        try {
          await empleadosService.delete(id)
          Swal.fire('¡Eliminado!', 'Empleado eliminado correctamente', 'success')
          this.loadEmpleados()
        } catch (error) {
          console.error('Error deleting empleado:', error)
          Swal.fire('Error', 'Error al eliminar empleado', 'error')
        }
      }
    }
  },
  mounted() {
    this.loadEmpleados()
  }
}
</script>