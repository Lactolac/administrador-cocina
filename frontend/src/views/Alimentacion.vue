<template>
  <div>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex justify-space-between align-center">
          <h2 class="text-h5">
            <v-icon start>mdi-food</v-icon>
            Alimentación Servida
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
              :items="[{ value: '', label: 'Todos' }, ...meses]"
              label="Mes"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              @update:modelValue="loadData"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.anio"
              :items="anios"
              label="Año"
              variant="outlined"
              density="compact"
              @update:modelValue="loadData"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.descripcion"
              :items="[{ value: '', title: 'Todas' }, { value: 'Administración', title: 'Administración' }, { value: 'Producción', title: 'Producción' }]"
              label="Área"
              variant="outlined"
              density="compact"
              @update:modelValue="loadData"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Resumen Cards -->
    <v-row class="mb-4">
      <v-col cols="6" md="3">
        <v-card color="primary" class="elevation-2">
          <v-card-text class="text-center">
            <v-icon size="32">mdi-weather-sunny</v-icon>
            <div class="text-caption">Desayunos</div>
            <div class="text-h5">{{ formatNumber(resumen.total_desayunos) }}</div>
            <div class="text-caption">${{ formatNumber(resumen.total_desayunos * 0.24) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card color="success" class="elevation-2">
          <v-card-text class="text-center">
            <v-icon size="32">mdi-food</v-icon>
            <div class="text-caption">Almuerzos</div>
            <div class="text-h5">{{ formatNumber(resumen.total_almuerzos) }}</div>
            <div class="text-caption">${{ formatNumber(resumen.total_almuerzos * 0.48) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card color="warning" class="elevation-2">
          <v-card-text class="text-center">
            <v-icon size="32">mdi-weather-night</v-icon>
            <div class="text-caption">Cenas</div>
            <div class="text-h5">{{ formatNumber(resumen.total_cenas) }}</div>
            <div class="text-caption">${{ formatNumber(resumen.total_cenas * 0.24) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card color="info" class="elevation-2">
          <v-card-text class="text-center">
            <v-icon size="32">mdi-coffee</v-icon>
            <div class="text-caption">Refrigerios</div>
            <div class="text-h5">{{ formatNumber(resumen.total_refrigerios) }}</div>
            <div class="text-caption">${{ formatNumber(resumen.total_refrigerios * 0.24) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Table -->
    <v-card class="elevation-2">
      <v-data-table
        :headers="headers"
        :items="alimentacion"
        :items-per-page="15"
        class="elevation-1"
      >
        <template v-slot:item.fecha="{ item }">
          {{ formatDate(item.fecha) }}
        </template>
        <template v-slot:item.descripcion="{ item }">
          <v-chip :color="item.descripcion === 'Administración' ? 'primary' : 'success'" size="small">
            {{ item.descripcion }}
          </v-chip>
        </template>
        <template v-slot:item.total="{ item }">
          ${{ formatNumber(item.total) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon size="small" variant="text" @click="openModal(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon size="small" variant="text" color="error" @click="deleteItem(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <template v-slot:bottom>
          <v-divider></v-divider>
          <div class="pa-3 bg-primary">
            <v-row>
              <v-col cols="3"><strong>TOTALES</strong></v-col>
              <v-col cols="2" class="text-right"><strong>{{ resumen.total_desayunos }}</strong></v-col>
              <v-col cols="2" class="text-right"><strong>{{ resumen.total_almuerzos }}</strong></v-col>
              <v-col cols="2" class="text-right"><strong>{{ resumen.total_cenas }}</strong></v-col>
              <v-col cols="2" class="text-right"><strong>${{ formatNumber(resumen.total_general) }}</strong></v-col>
            </v-row>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon start>mdi-food</v-icon>
          {{ editingItem ? 'Editar' : 'Nuevo' }} Registro
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveItem">
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
                  v-model="form.descripcion"
                  :items="['Administración', 'Producción']"
                  label="Área"
                  variant="outlined"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-select
                  v-model="form.mes"
                  :items="meses"
                  label="Mes"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="form.anio"
                  label="Año"
                  type="number"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="form.desayunos"
                  label="Desayunos"
                  type="number"
                  variant="outlined"
                  @update:modelValue="calculateTotal"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="form.almuerzos"
                  label="Almuerzos"
                  type="number"
                  variant="outlined"
                  @update:modelValue="calculateTotal"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="form.cenas"
                  label="Cenas"
                  type="number"
                  variant="outlined"
                  @update:modelValue="calculateTotal"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="form.refrigerios"
                  label="Refrigerios"
                  type="number"
                  variant="outlined"
                  @update:modelValue="calculateTotal"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-text-field
              :model-value="'$' + formatNumber(form.total)"
              label="Total Calculado"
              variant="outlined"
              readonly
            ></v-text-field>
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
import { alimentacionService } from '../services/api'
import Swal from 'sweetalert2'

export default {
  name: 'Alimentacion',
  data() {
    return {
      dialog: false,
      alimentacion: [],
      resumen: {
        total_desayunos: 0,
        total_almuerzos: 0,
        total_cenas: 0,
        total_refrigerios: 0,
        total_general: 0
      },
      filters: { mes: '', anio: 2026, descripcion: '' },
      form: {
        fecha: '',
        descripcion: 'Administración',
        desayunos: 0,
        almuerzos: 0,
        cenas: 0,
        refrigerios: 0,
        costo_desayunos: 0,
        costo_almuerzos: 0,
        costo_cenas: 0,
        total: 0,
        mes: 'Enero',
        anio: 2026
      },
      editingItem: null,
      headers: [
        { title: 'Fecha', key: 'fecha' },
        { title: 'Área', key: 'descripcion' },
        { title: 'Desayunos', key: 'desayunos', align: 'end' },
        { title: 'Almuerzos', key: 'almuerzos', align: 'end' },
        { title: 'Cenas', key: 'cenas', align: 'end' },
        { title: 'Refrigerios', key: 'refrigerios', align: 'end' },
        { title: 'Total ($)', key: 'total', align: 'end' },
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
  methods: {
    formatNumber(num) {
      if (!num) return '0.00'
      return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('es-SV')
    },
    calculateTotal() {
      this.form.costo_desayunos = this.form.desayunos * 0.24
      this.form.costo_almuerzos = this.form.almuerzos * 0.48
      this.form.costo_cenas = this.form.cenas * 0.24
      this.form.total = this.form.costo_desayunos + this.form.costo_almuerzos + this.form.costo_cenas
    },
    async loadData() {
      try {
        const res = await alimentacionService.getAll(this.filters)
        this.alimentacion = res.data
        this.calculateResumen()
      } catch (error) {
        console.error('Error loading alimentacion:', error)
      }
    },
    calculateResumen() {
      this.resumen = {
        total_desayunos: this.alimentacion.reduce((sum, i) => sum + parseInt(i.desayunos || 0), 0),
        total_almuerzos: this.alimentacion.reduce((sum, i) => sum + parseInt(i.almuerzos || 0), 0),
        total_cenas: this.alimentacion.reduce((sum, i) => sum + parseInt(i.cenas || 0), 0),
        total_refrigerios: this.alimentacion.reduce((sum, i) => sum + parseInt(i.refrigerios || 0), 0),
        total_general: this.alimentacion.reduce((sum, i) => sum + parseFloat(i.total || 0), 0)
      }
    },
    openModal(item = null) {
      this.editingItem = item
      if (item) {
        this.form = { ...item }
      } else {
        this.form = {
          fecha: new Date().toISOString().split('T')[0],
          descripcion: 'Administración',
          desayunos: 0,
          almuerzos: 0,
          cenas: 0,
          refrigerios: 0,
          costo_desayunos: 0,
          costo_almuerzos: 0,
          costo_cenas: 0,
          total: 0,
          mes: 'Enero',
          anio: 2026
        }
      }
      this.dialog = true
    },
    async saveItem() {
      try {
        if (this.editingItem) {
          await alimentacionService.update(this.editingItem.id, this.form)
          Swal.fire('¡Actualizado!', 'Registro de alimentación actualizado correctamente', 'success')
        } else {
          await alimentacionService.create(this.form)
          Swal.fire('¡Creado!', 'Registro de alimentación creado correctamente', 'success')
        }
        this.dialog = false
        this.loadData()
      } catch (error) {
        console.error('Error saving item:', error)
        Swal.fire('Error', 'Error al guardar el registro de alimentación', 'error')
      }
    },
    async deleteItem(id) {
      const result = await Swal.fire({
        title: '¿Está seguro?',
        text: '¿Desea eliminar este registro de alimentación?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      })
      if (result.isConfirmed) {
        try {
          await alimentacionService.delete(id)
          Swal.fire('¡Eliminado!', 'Registro de alimentación eliminado correctamente', 'success')
          this.loadData()
        } catch (error) {
          console.error('Error deleting item:', error)
          Swal.fire('Error', 'Error al eliminar el registro de alimentación', 'error')
        }
      }
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>