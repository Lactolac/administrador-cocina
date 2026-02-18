<template>
  <div>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex justify-space-between align-center">
          <h2 class="text-h5">
            <v-icon start>mdi-tag-multiple</v-icon>
            Gestión de Productos
          </h2>
          <v-btn color="primary" @click="openModal()" prepend-icon="mdi-plus">
            Nuevo Producto
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              label="Buscar"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              @update:modelValue="filterProductos"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="filters.categoria"
              :items="[{ value: '', title: 'Todas' }, ...categorias]"
              label="Categoría"
              variant="outlined"
              density="compact"
              @update:modelValue="loadProductos"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Table -->
    <v-card class="elevation-2">
      <v-data-table
        :headers="headers"
        :items="filteredProductos"
        :items-per-page="10"
        class="elevation-1"
      >
        <template v-slot:item.precio_unitario="{ item }">
          ${{ formatNumber(item.precio_unitario) }}
        </template>
        <template v-slot:item.categoria="{ item }">
          <v-chip size="small" color="secondary">{{ item.categoria || 'Sin categoría' }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon size="small" variant="text" @click="openModal(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon size="small" variant="text" color="error" @click="deleteProducto(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon start>mdi-tag</v-icon>
          {{ editingItem ? 'Editar' : 'Nuevo' }} Producto
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveProducto">
            <v-text-field
              v-model="form.descripcion"
              label="Descripción"
              variant="outlined"
              class="mb-3"
            ></v-text-field>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="form.unidad_medida"
                  label="Unidad de Medida"
                  variant="outlined"
                  hint="LIBRA, UNIDAD, CAJA..."
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="form.precio_unitario"
                  label="Precio Unitario"
                  type="number"
                  step="0.0001"
                  variant="outlined"
                  prefix="$"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-combobox
              v-model="form.categoria"
              :items="categorias"
              label="Categoría"
              variant="outlined"
            ></v-combobox>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveProducto">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { productosService } from '../services/api'
import Swal from 'sweetalert2'

export default {
  name: 'Productos',
  data() {
    return {
      dialog: false,
      productos: [],
      filteredProductos: [],
      categorias: [],
      search: '',
      filters: { categoria: '' },
      form: {
        descripcion: '',
        unidad_medida: '',
        precio_unitario: 0,
        categoria: ''
      },
      editingItem: null,
      headers: [
        { title: 'Descripción', key: 'descripcion' },
        { title: 'Unidad', key: 'unidad_medida' },
        { title: 'Precio Unit.', key: 'precio_unitario', align: 'end' },
        { title: 'Categoría', key: 'categoria' },
        { title: 'Acciones', key: 'actions', sortable: false }
      ]
    }
  },
  methods: {
    formatNumber(num) {
      if (!num) return '0.00'
      return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
    },
    async loadProductos() {
      try {
        const res = await productosService.getAll(this.filters)
        this.productos = res.data
        this.filteredProductos = this.productos
      } catch (error) {
        console.error('Error loading productos:', error)
      }
    },
    async loadCategorias() {
      try {
        const res = await productosService.getCategorias()
        this.categorias = res.data
      } catch (error) {
        console.error('Error loading categorias:', error)
      }
    },
    filterProductos() {
      if (!this.search) {
        this.filteredProductos = this.productos
        return
      }
      const searchLower = this.search.toLowerCase()
      this.filteredProductos = this.productos.filter(p => 
        p.descripcion.toLowerCase().includes(searchLower)
      )
    },
    openModal(item = null) {
      this.editingItem = item
      if (item) {
        this.form = { ...item }
      } else {
        this.form = {
          descripcion: '',
          unidad_medida: '',
          precio_unitario: 0,
          categoria: ''
        }
      }
      this.dialog = true
    },
    async saveProducto() {
      try {
        if (this.editingItem) {
          await productosService.update(this.editingItem.id, this.form)
          Swal.fire('¡Actualizado!', 'Producto actualizado correctamente', 'success')
        } else {
          await productosService.create(this.form)
          Swal.fire('¡Creado!', 'Producto creado correctamente', 'success')
        }
        this.dialog = false
        this.loadProductos()
        this.loadCategorias()
      } catch (error) {
        console.error('Error saving producto:', error)
        Swal.fire('Error', 'Error al guardar producto', 'error')
      }
    },
    async deleteProducto(id) {
      const result = await Swal.fire({
        title: '¿Está seguro?',
        text: '¿Desea eliminar este producto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      })
      if (result.isConfirmed) {
        try {
          await productosService.delete(id)
          Swal.fire('¡Eliminado!', 'Producto eliminado correctamente', 'success')
          this.loadProductos()
        } catch (error) {
          console.error('Error deleting producto:', error)
          Swal.fire('Error', 'Error al eliminar producto', 'error')
        }
      }
    }
  },
  mounted() {
    this.loadProductos()
    this.loadCategorias()
  }
}
</script>