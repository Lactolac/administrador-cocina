<template>
  <div>
    <!-- Stats Cards -->
    <v-row class="mb-8">
      <v-col cols="12" sm="6" md="2.4">
        <v-card 
          color="primary" 
          class="elevation-6 hover:elevation-8 transition-all duration-300"
          height="100%"
        >
          <v-card-text class="d-flex justify-space-between align-center pa-6">
            <div>
              <div class="text-caption text-white-70">Total Compras</div>
              <div class="text-h5 text-white font-weight-bold">${{ formatNumber(stats.totalCompras) }}</div>
            </div>
            <v-icon size="40" class="opacity-50 text-white">mdi-package-variant</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="2.4">
        <v-card 
          color="success" 
          class="elevation-6 hover:elevation-8 transition-all duration-300"
          height="100%"
        >
          <v-card-text class="d-flex justify-space-between align-center pa-6">
            <div>
              <div class="text-caption text-white-70">Total Planilla</div>
              <div class="text-h5 text-white font-weight-bold">${{ formatNumber(stats.totalPlanilla) }}</div>
            </div>
            <v-icon size="40" class="opacity-50 text-white">mdi-cash-multiple</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="2.4">
        <v-card 
          color="warning" 
          class="elevation-6 hover:elevation-8 transition-all duration-300"
          height="100%"
        >
          <v-card-text class="d-flex justify-space-between align-center pa-6">
            <div>
              <div class="text-caption text-white-70">Platos Servidos</div>
              <div class="text-h5 text-white font-weight-bold">{{ formatNumberInt(stats.totalPlatos) }}</div>
            </div>
            <v-icon size="40" class="opacity-50 text-white">mdi-food</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="2.4">
        <v-card 
          color="purple" 
          class="elevation-6 hover:elevation-8 transition-all duration-300"
          height="100%"
        >
          <v-card-text class="d-flex justify-space-between align-center pa-6">
            <div>
              <div class="text-caption text-white-70">Costo Alimentación</div>
              <div class="text-h5 text-white font-weight-bold">${{ formatNumber(stats.totalAlimentacion) }}</div>
            </div>
            <v-icon size="40" class="opacity-50 text-white">mdi-currency-usd</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="2.4">
        <v-card 
          color="info" 
          class="elevation-6 hover:elevation-8 transition-all duration-300"
          height="100%"
        >
          <v-card-text class="d-flex justify-space-between align-center pa-6">
            <div>
              <div class="text-caption text-white-70">Empleados</div>
              <div class="text-h5 text-white font-weight-bold">{{ stats.totalEmpleados }}</div>
            </div>
            <v-icon size="40" class="opacity-50 text-white">mdi-account-group</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card class="mb-8 elevation-4 rounded-lg">
      <v-card-text class="pa-6">
        <v-row align="center">
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedAnio"
              :items="anios"
              label="Año"
              variant="outlined"
              density="comfortable"
              class="rounded-md"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedMes"
              :items="mesesSelect"
              label="Mes"
              variant="outlined"
              density="comfortable"
              class="rounded-md"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Charts Row -->
    <v-row class="mb-8">
      <v-col cols="12" md="8">
        <v-card class="elevation-4 rounded-lg">
          <v-card-title class="pa-4">
            <v-icon start color="primary">mdi-chart-line</v-icon>
            Tendencia de Gastos
          </v-card-title>
          <v-card-text class="pa-4">
            <div style="height: 300px;">
              <Line :data="chartData" :options="chartOptions" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="elevation-4 rounded-lg">
          <v-card-title class="pa-4">
            <v-icon start color="primary">mdi-chart-pie</v-icon>
            Distribución
          </v-card-title>
          <v-card-text class="pa-4">
            <div style="height: 300px;">
              <Doughnut :data="doughnutData" :options="doughnutOptions" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tables Row -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="elevation-4 rounded-lg">
          <v-card-title class="pa-4">
            <v-icon start color="primary">mdi-office-building</v-icon>
            Alimentación por Área
          </v-card-title>
          <v-card-text class="pa-0">
            <v-table density="comfortable">
              <thead>
                <tr class="bg-primary-lighten-4">
                  <th class="pa-4">Área</th>
                  <th class="text-right pa-4">Desayunos</th>
                  <th class="text-right pa-4">Almuerzos</th>
                  <th class="text-right pa-4">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="area in areasData" :key="area.area" class="hover:bg-grey-lighten-1 transition-all">
                  <td class="pa-4">{{ area.area }}</td>
                  <td class="text-right pa-4">{{ area.total_desayunos }}</td>
                  <td class="text-right pa-4">{{ area.total_almuerzos }}</td>
                  <td class="text-right pa-4">${{ formatNumber(area.costo_total) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="elevation-4 rounded-lg">
          <v-card-title class="pa-4">
            <v-icon start color="primary">mdi-cash</v-icon>
            Resumen de Planilla
          </v-card-title>
          <v-card-text class="pa-0">
            <v-table density="comfortable">
              <thead>
                <tr class="bg-primary-lighten-4">
                  <th class="pa-4">Mes</th>
                  <th class="text-right pa-4">Salarios</th>
                  <th class="text-right pa-4">Descuentos</th>
                  <th class="text-right pa-4">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="planilla in planillaResumen" :key="planilla.mes" class="hover:bg-grey-lighten-1 transition-all">
                  <td class="pa-4">{{ planilla.mes }}</td>
                  <td class="text-right pa-4">${{ formatNumber(planilla.total_salarios) }}</td>
                  <td class="text-right pa-4">${{ formatNumber(planilla.total_descuentos) }}</td>
                  <td class="text-right pa-4">${{ formatNumber(planilla.total_pagar) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { Line, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { reportesService, alimentacionService, planillaService, empleadosService } from '../services/api'

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default {
  name: 'Dashboard',
  components: { Line, Doughnut },
  data() {
    const now = new Date()
    const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return {
      selectedAnio: now.getFullYear(),
      selectedMes: mesesNombres[now.getMonth()],
      anios: [2026, 2025, 2024],
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
      stats: {
        totalCompras: 0,
        totalPlanilla: 0,
        totalPlatos: 0,
        totalAlimentacion: 0,
        totalEmpleados: 0
      },
      areasData: [],
      planillaResumen: [],
      tendenciaData: [],
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            position: 'top',
            labels: {
              font: { size: 12 },
              padding: 15
            }
          },
          title: {
            display: true,
            text: 'Gastos Mensuales',
            font: { size: 14, weight: 'bold' }
          }
        },
        scales: { 
          y: { 
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          x: {
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          }
        }
      },
      doughnutOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            position: 'bottom',
            labels: {
              font: { size: 12 },
              padding: 15
            }
          },
          title: {
            display: true,
            text: 'Distribución de Gastos',
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    }
  },
  computed: {
    mesesSelect() {
      return [
        { value: '', title: 'Todos' },
        ...this.meses.map(m => ({ value: m.value, title: m.label }))
      ]
    },
    chartData() {
      return {
        labels: this.tendenciaData.map(t => t.mes),
        datasets: [
          {
            label: 'Compras',
            data: this.tendenciaData.map(t => t.compras),
            borderColor: '#0056a6',
            backgroundColor: 'rgba(0, 86, 166, 0.2)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
          },
          {
            label: 'Planilla',
            data: this.tendenciaData.map(t => t.planilla),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
          }
        ]
      }
    },
    doughnutData() {
      return {
        labels: ['Compras', 'Planilla', 'Alimentación'],
        datasets: [{
          data: [this.stats.totalCompras || 1, this.stats.totalPlanilla || 1, this.stats.totalAlimentacion || 1],
          backgroundColor: ['#0056a6', '#10B981', '#9C27B0'],
          borderColor: '#ffffff',
          borderWidth: 3
        }]
      }
    }
  },
  methods: {
    formatNumber(num) {
      if (!num) return '0.00'
      return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    formatNumberInt(num) {
      if (!num) return '0'
      return parseInt(num).toLocaleString('en-US')
    },
    async loadData() {
      try {
        const params = { anio: this.selectedAnio }
        if (this.selectedMes) params.mes = this.selectedMes

        const consolidadoRes = await reportesService.getConsolidadoMensual(params)
        const consolidado = consolidadoRes.data
        this.stats.totalCompras = consolidado.resumen_general?.total_compras || 0
        this.stats.totalPlanilla = consolidado.resumen_general?.total_planilla || 0
        this.stats.totalAlimentacion = consolidado.resumen_general?.total_alimentacion || 0
        // Convertir a números antes de sumar para evitar concatenación de strings
        const desayunos = parseInt(consolidado.alimentacion?.total_desayunos) || 0
        const almuerzos = parseInt(consolidado.alimentacion?.total_almuerzos) || 0
        const cenas = parseInt(consolidado.alimentacion?.total_cenas) || 0
        const refrigerios = parseInt(consolidado.alimentacion?.total_refrigerios) || 0
        this.stats.totalPlatos = desayunos + almuerzos + cenas + refrigerios
        
        // Obtener total de empleados activos de la tabla empleados
        const empleadosRes = await empleadosService.getAll()
        const empleadosData = empleadosRes.data
        this.stats.totalEmpleados = empleadosData.filter(e => e.activo).length

        const areasRes = await reportesService.getCostosArea(params)
        this.areasData = areasRes.data

        const planillaRes = await planillaService.getResumen(this.selectedAnio)
        this.planillaResumen = planillaRes.data

        const tendenciaRes = await reportesService.getTendenciaGastos(this.selectedAnio)
        this.tendenciaData = tendenciaRes.data

      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }
  },
  watch: {
    selectedAnio() {
      this.loadData()
    },
    selectedMes() {
      this.loadData()
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>