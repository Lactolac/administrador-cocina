<template>
  <div>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex justify-space-between align-center">
          <h2 class="text-h5">
            <v-icon start>mdi-chart-box</v-icon>
            Reportes y Análisis
          </h2>
          <div>
            <v-select
              v-model="selectedAnio"
              :items="anios"
              label="Año"
              variant="outlined"
              density="compact"
              class="d-inline-block"
              style="width: 120px;"
            ></v-select>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Resumen General -->
    <v-row class="mb-6">
      <v-col cols="6" md="3">
        <v-card color="primary" class="elevation-4">
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-package-variant</v-icon>
            <div class="text-caption">Total Compras</div>
            <div class="text-h4">${{ formatNumber(consolidado.resumen_general?.total_compras) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card color="success" class="elevation-4">
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-cash-multiple</v-icon>
            <div class="text-caption">Total Planilla</div>
            <div class="text-h4">${{ formatNumber(consolidado.resumen_general?.total_planilla) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card color="warning" class="elevation-4">
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-food</v-icon>
            <div class="text-caption">Total Alimentación</div>
            <div class="text-h4">${{ formatNumber(consolidado.alimentacion?.total_alimentacion) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card color="info" class="elevation-4">
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-warehouse</v-icon>
            <div class="text-caption">Total Inventario</div>
            <div class="text-h4">${{ formatNumber(totalInventario) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gastos por Proveedor -->
    <v-card class="elevation-2 mb-6">
      <v-card-title>
        <v-icon start>mdi-truck</v-icon>
        Gastos por Proveedor
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="5">
            <div style="height: 300px;">
              <Doughnut :data="proveedorChartData" :options="doughnutOptions" />
            </div>
          </v-col>
          <v-col cols="12" md="7">
            <v-table density="compact" style="max-height: 300px; overflow: auto;">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th class="text-right">Productos</th>
                  <th class="text-right">Total Gasto</th>
                  <th class="text-right">%</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="prov in gastosProveedor.proveedores" :key="prov.proveedor">
                  <td>{{ prov.proveedor }}</td>
                  <td class="text-right">{{ prov.total_productos }}</td>
                  <td class="text-right">${{ formatNumber(prov.total_gasto) }}</td>
                  <td class="text-right">{{ calcularPorcentaje(prov.total_gasto) }}%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style="font-weight: bold; background: #f5f5f5;">
                  <td>TOTAL</td>
                  <td class="text-right">{{ totalProductosProveedor }}</td>
                  <td class="text-right">${{ formatNumber(gastosProveedor.total_general) }}</td>
                  <td class="text-right">100%</td>
                </tr>
              </tfoot>
            </v-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Charts Row -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <v-card class="elevation-2">
          <v-card-title>
            <v-icon start>mdi-chart-line</v-icon>
            Tendencia de Gastos Mensual
          </v-card-title>
          <v-card-text>
            <div style="height: 300px;">
              <Line :data="tendenciaChartData" :options="chartOptions" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="elevation-2">
          <v-card-title>
            <v-icon start>mdi-chart-pie</v-icon>
            Distribución de Gastos
          </v-card-title>
          <v-card-text>
            <div style="height: 300px;">
              <Doughnut :data="doughnutChartData" :options="doughnutOptions" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tables Row -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="elevation-2">
          <v-card-title>
            <v-icon start>mdi-account-group</v-icon>
            Eficiencia de Empleados
          </v-card-title>
          <v-card-text class="pa-0">
            <v-table density="compact" style="max-height: 300px; overflow: auto;">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th class="text-right">Días</th>
                  <th class="text-right">H.E.</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="emp in eficienciaEmpleados" :key="emp.codigo">
                  <td>{{ emp.nombres }} {{ emp.apellidos }}</td>
                  <td class="text-right">{{ emp.total_dias }}</td>
                  <td class="text-right">{{ emp.total_horas_extras }}</td>
                  <td class="text-right">${{ formatNumber(emp.total_pagado) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Costos por Área -->
    <v-card class="elevation-2">
      <v-card-title>
        <v-icon start>mdi-office-building</v-icon>
        Costos por Área
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div style="height: 250px;">
              <Bar :data="areaChartData" :options="barOptions" />
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <v-table density="compact">
              <thead>
                <tr>
                  <th>Área</th>
                  <th class="text-right">Desayunos</th>
                  <th class="text-right">Almuerzos</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="area in costosArea" :key="area.area">
                  <td>{{ area.area }}</td>
                  <td class="text-right">{{ area.total_desayunos }}</td>
                  <td class="text-right">{{ area.total_almuerzos }}</td>
                  <td class="text-right">${{ formatNumber(area.costo_total) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { Line, Doughnut, Bar } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { reportesService, inventarioService } from '../services/api'

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

export default {
  name: 'Reportes',
  components: { Line, Doughnut, Bar },
  data() {
    return {
      selectedAnio: 2026,
      anios: [2026, 2025, 2024],
      consolidado: {
        resumen_general: {},
        alimentacion: {},
        planilla: {}
      },
      tendencia: [],
      eficienciaEmpleados: [],
      costosArea: [],
      gastosProveedor: { proveedores: [], total_general: 0 },
      totalInventario: 0,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } }
      },
      doughnutOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } }
      },
      barOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    }
  },
  computed: {
    tendenciaChartData() {
      return {
        labels: this.tendencia.map(t => t.mes),
        datasets: [
          {
            label: 'Compras',
            data: this.tendencia.map(t => t.compras),
            borderColor: '#1976D2',
            backgroundColor: 'rgba(25, 118, 210, 0.2)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Planilla',
            data: this.tendencia.map(t => t.planilla),
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Alimentación',
            data: this.tendencia.map(t => t.alimentacion),
            borderColor: '#FF9800',
            backgroundColor: 'rgba(255, 152, 0, 0.2)',
            fill: true,
            tension: 0.4
          }
        ]
      }
    },
    doughnutChartData() {
      return {
        labels: ['Compras', 'Planilla', 'Alimentación', 'Inventario'],
        datasets: [{
          data: [
            this.consolidado.resumen_general?.total_compras || 0,
            this.consolidado.resumen_general?.total_planilla || 0,
            this.consolidado.alimentacion?.total_alimentacion || 0,
            this.totalInventario || 0
          ],
          backgroundColor: ['#1976D2', '#4CAF50', '#FF9800', '#9C27B0']
        }]
      }
    },
    areaChartData() {
      return {
        labels: this.costosArea.map(a => a.area),
        datasets: [{
          label: 'Costo Total',
          data: this.costosArea.map(a => a.costo_total),
          backgroundColor: ['#1976D2', '#4CAF50']
        }]
      }
    },
    proveedorChartData() {
      const colores = [
        '#1976D2', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', 
        '#00BCD4', '#FF5722', '#795548', '#607D8B', '#E91E63',
        '#3F51B5', '#009688', '#FFC107', '#673AB7', '#2196F3'
      ]
      return {
        labels: this.gastosProveedor.proveedores.map(p => p.proveedor),
        datasets: [{
          data: this.gastosProveedor.proveedores.map(p => p.total_gasto),
          backgroundColor: colores.slice(0, this.gastosProveedor.proveedores.length)
        }]
      }
    },
    totalProductosProveedor() {
      return this.gastosProveedor.proveedores.reduce((sum, p) => sum + (parseInt(p.total_productos) || 0), 0)
    }
  },
  methods: {
    formatNumber(num) {
      if (!num) return '0.00'
      return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    calcularPorcentaje(valor) {
      if (!this.gastosProveedor.total_general || !valor) return '0.00'
      return ((parseFloat(valor) / parseFloat(this.gastosProveedor.total_general)) * 100).toFixed(1)
    },
    async loadAllReports() {
      await Promise.all([
        this.loadConsolidado(),
        this.loadTendencia(),
        this.loadEficiencia(),
        this.loadCostosArea(),
        this.loadTotalInventario(),
        this.loadGastosProveedor()
      ])
    },
    async loadConsolidado() {
      try {
        const res = await reportesService.getConsolidadoMensual({ anio: this.selectedAnio })
        this.consolidado = res.data
      } catch (error) {
        console.error('Error loading consolidado:', error)
      }
    },
    async loadTendencia() {
      try {
        const res = await reportesService.getTendenciaGastos(this.selectedAnio)
        this.tendencia = res.data
      } catch (error) {
        console.error('Error loading tendencia:', error)
      }
    },
    async loadEficiencia() {
      try {
        const res = await reportesService.getEficienciaEmpleados({ anio: this.selectedAnio })
        this.eficienciaEmpleados = res.data
      } catch (error) {
        console.error('Error loading eficiencia:', error)
      }
    },
    async loadCostosArea() {
      try {
        const res = await reportesService.getCostosArea({ anio: this.selectedAnio })
        this.costosArea = res.data
      } catch (error) {
        console.error('Error loading costos area:', error)
      }
    },
    async loadTotalInventario() {
      try {
        const res = await inventarioService.getAll({ anio: this.selectedAnio })
        const data = res.data
        this.totalInventario = data.reduce((sum, i) => {
          const total = parseFloat(i.total_inventario) || 0
          return sum + (isNaN(total) ? 0 : total)
        }, 0)
      } catch (error) {
        console.error('Error loading inventario total:', error)
      }
    },
    async loadGastosProveedor() {
      try {
        const res = await reportesService.getGastosProveedor({ anio: this.selectedAnio })
        this.gastosProveedor = res.data
      } catch (error) {
        console.error('Error loading gastos proveedor:', error)
      }
    }
  },
  mounted() {
    this.loadAllReports()
  },
  watch: {
    selectedAnio() {
      this.loadAllReports()
    }
  }
}
</script>
