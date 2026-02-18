<template>
  <div>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex justify-space-between align-center">
          <h2 class="text-h5">
            <v-icon start>mdi-package-variant</v-icon>
            Gestión de Inventario
          </h2>
          <v-btn color="primary" @click="openModal()" prepend-icon="mdi-plus">
            Nuevo Registro
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.mes"
              :items="mesesSelect"
              label="Mes"
              variant="outlined"
              density="compact"
              @update:modelValue="loadInventario"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.anio"
              :items="anios"
              label="Año"
              variant="outlined"
              density="compact"
              @update:modelValue="loadInventario"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.categoria"
              :items="[{ value: '', title: 'Todas' }, ...categorias]"
              label="Categoría"
              variant="outlined"
              density="compact"
              @update:modelValue="loadInventario"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Resumen Cards -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card color="success" class="elevation-2">
          <v-card-text class="text-center">
            <v-icon size="40">mdi-cash-multiple</v-icon>
            <div class="text-h6 mt-2">Costo de Inventario Total</div>
            <div class="text-h4">${{ formatNumber(resumen.costo_total) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Table -->
    <v-card class="elevation-2">
      <v-data-table
        :headers="headers"
        :items="inventario"
        :items-per-page="10"
        class="elevation-1"
      >
        <template v-slot:item.categoria="{ item }">
          <v-chip size="small" color="secondary">{{ item.categoria }}</v-chip>
        </template>
        <template v-slot:item.precio_unitario="{ item }">
          ${{ formatNumber(item.precio_unitario) }}
        </template>
        <template v-slot:item.total_inventario="{ item }">
          ${{ formatNumber(item.total_inventario) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon size="small" variant="text" @click="openModal(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon size="small" variant="text" color="error" @click="deleteItem(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon start>mdi-package-variant</v-icon>
          {{ editingItem ? 'Editar' : 'Nuevo' }} Registro
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveItem">
            <v-select
              v-model="form.producto_id"
              :items="productos"
              item-title="descripcion"
              item-value="id"
              label="Producto"
              variant="outlined"
              class="mb-3"
            ></v-select>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="form.fecha"
                  label="Fecha"
                  type="date"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="form.mes"
                  :items="mesesSelect"
                  label="Mes"
                  variant="outlined"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="form.anio"
                  label="Año"
                  type="number"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="form.inv_inicial"
                  label="Inv. Inicial (Cantidad)"
                  type="number"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="form.inv_final"
                  label="Inv. Final (Cantidad)"
                  type="number"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="form.precio_unitario"
                  label="Precio Unitario ($)"
                  type="number"
                  step="0.0001"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.total_inventario"
                  label="Total Inventario ($)"
                  type="number"
                  variant="outlined"
                  hint="Se calcula automáticamente: Inv. Final × Precio Unitario"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveItem">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { inventarioService, productosService } from '../services/api'
import Swal from 'sweetalert2'

export default {
  name: 'Inventario',
  data() {
    return {
      dialog: false,
      inventario: [],
      productos: [],
      categorias: [],
      resumen: { costo_total: 0 },
      filters: { mes: '', anio: 2026, categoria: '' },
      form: {
        producto_id: '',
        fecha: '',
        mes: 'Enero',
        anio: 2026,
        inv_inicial: 0,
        inv_final: 0,
        precio_unitario: 0,
        total_inventario: 0
      },
      editingItem: null,
      headers: [
        { title: 'Producto', key: 'descripcion' },
        { title: 'Unidad', key: 'unidad_medida' },
        { title: 'Categoría', key: 'categoria' },
        { title: 'Inv. Inicial', key: 'inv_inicial', align: 'end' },
        { title: 'Inv. Final', key: 'inv_final', align: 'end' },
        { title: 'Precio Unit.', key: 'precio_unitario', align: 'end' },
        { title: 'Total ($)', key: 'total_inventario', align: 'end' },
        { title: 'Acciones', key: 'actions', sortable: false }
      ],
      meses: [
        { value: 'Enero', label: 'Enero' },
        { value: 'Febrero', label: 'Febrero' },
        { value: 'Marzo', label: 'Marzo' },
        { value: 'Abril', label: 'Abril' },
        { value: 'Mayo', label: 'Mayo' },
        { value: 'Junio', label: 'Junio' },
        { value: 'Julio', label: 'Julio' },
        { value: 'Agosto', label: 'Agosto' },
        { value: 'Septiembre', label: 'Septiembre' },
        { value: 'Octubre', label: 'Octubre' },
        { value: 'Noviembre', label: 'Noviembre' },
        { value: 'Diciembre', label: 'Diciembre' }
      ],
      anios: [2026, 2025, 2024]
    }
  },
  computed: {
    mesesSelect() {
      return [
        { value: '', title: 'Todos' },
        ...this.meses.map(m => ({ value: m.value, title: m.label }))
      ]
    }
  },
  methods: {
    formatNumber(num) {
      if (!num) return '0.00'
      return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    async loadInventario() {
      try {
        const res = await inventarioService.getAll(this.filters)
        this.inventario = res.data
        this.calculateResumen()
      } catch (error) {
        console.error('Error loading inventario:', error)
      }
    },
    async loadProductos() {
      try {
        const res = await productosService.getAll({})
        this.productos = res.data
        const catRes = await productosService.getCategorias()
        this.categorias = catRes.data
      } catch (error) {
        console.error('Error loading productos:', error)
      }
    },
    calculateResumen() {
      this.resumen = {
        costo_total: this.inventario.reduce((sum, i) => {
          const total = parseFloat(i.total_inventario) || 0;
          return sum + (isNaN(total) ? 0 : total);
        }, 0)
      }
    },
    openModal(item = null) {
      this.editingItem = item
      if (item) {
        this.form = { ...item }
      } else {
        this.form = {
          producto_id: '',
          fecha: new Date().toISOString().split('T')[0],
          mes: 'Enero',
          anio: 2026,
          inv_inicial: 0,
          inv_final: 0,
          precio_unitario: 0,
          total_inventario: 0
        }
      }
      this.dialog = true
    },
    async saveItem() {
      try {
        if (this.editingItem) {
          await inventarioService.update(this.editingItem.id, this.form)
          Swal.fire('¡Actualizado!', 'Registro actualizado correctamente', 'success')
        } else {
          await inventarioService.create(this.form)
          Swal.fire('¡Creado!', 'Registro creado correctamente', 'success')
        }
        this.dialog = false
        this.loadInventario()
      } catch (error) {
        console.error('Error saving item:', error)
        Swal.fire('Error', 'Error al guardar el registro', 'error')
      }
    },
    async deleteItem(id) {
      const result = await Swal.fire({
        title: '¿Está seguro?',
        text: '¿Desea eliminar este registro?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      })
      if (result.isConfirmed) {
        try {
          await inventarioService.delete(id)
          Swal.fire('¡Eliminado!', 'Registro eliminado correctamente', 'success')
          this.loadInventario()
        } catch (error) {
          console.error('Error deleting item:', error)
          Swal.fire('Error', 'Error al eliminar el registro', 'error')
        }
      }
    }
  },
  mounted() {
    this.loadInventario()
    this.loadProductos()
  }
}
</script>