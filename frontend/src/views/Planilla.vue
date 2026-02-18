<template>
  <div>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex justify-space-between align-center">
          <h2 class="text-h5">
            <v-icon start>mdi-cash-multiple</v-icon>
            Gestión de Planilla
          </h2>
          <div>
            <v-btn color="success" class="mr-2" @click="openCalculator()" prepend-icon="mdi-calculator">
              Calculadora
            </v-btn>
            <v-btn color="primary" @click="openModal()" prepend-icon="mdi-plus">
              Nuevo Registro
            </v-btn>
          </div>
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
              v-model="filters.quincena"
              :items="[{ value: '', title: 'Todas' }, { value: 1, title: '1ra Quincena' }, { value: 2, title: '2da Quincena' }]"
              label="Quincena"
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
            <v-icon size="32">mdi-wallet</v-icon>
            <div class="text-caption">Total Salarios</div>
            <div class="text-h5">${{ formatNumber(resumen.total_salarios) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card color="error" class="elevation-2">
          <v-card-text class="text-center">
            <v-icon size="32">mdi-minus-circle</v-icon>
            <div class="text-caption">Total Descuentos</div>
            <div class="text-h5">${{ formatNumber(resumen.total_descuentos) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card color="success" class="elevation-2">
          <v-card-text class="text-center">
            <v-icon size="32">mdi-check-circle</v-icon>
            <div class="text-caption">Total a Pagar</div>
            <div class="text-h5">${{ formatNumber(resumen.total_pagar) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card color="info" class="elevation-2">
          <v-card-text class="text-center">
            <v-icon size="32">mdi-account-group</v-icon>
            <div class="text-caption">Empleados</div>
            <div class="text-h5">{{ resumen.total_empleados }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Table -->
    <v-card class="elevation-2">
      <v-data-table
        :headers="headers"
        :items="planilla"
        :items-per-page="10"
        class="elevation-1"
        density="compact"
      >
        <template v-slot:item.codigo="{ item }">
          <v-chip size="x-small" color="secondary">{{ item.codigo }}</v-chip>
        </template>
        <template v-slot:item.nombre="{ item }">
          {{ item.nombres }} {{ item.apellidos }}
        </template>
        <template v-slot:item.salario="{ item }">
          ${{ formatNumber(item.salario) }}
        </template>
        <template v-slot:item.he="{ item }">
          ${{ formatNumber(item.pago_he_diurnas + item.pago_he_nocturnas) }}
        </template>
        <template v-slot:item.isss="{ item }">
          ${{ formatNumber(item.isss) }}
        </template>
        <template v-slot:item.afp="{ item }">
          ${{ formatNumber(item.afp) }}
        </template>
        <template v-slot:item.isre="{ item }">
          ${{ formatNumber(item.isre) }}
        </template>
        <template v-slot:item.total_recibir="{ item }">
          <strong>${{ formatNumber(item.total_recibir) }}</strong>
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

    <!-- Modal de Registro -->
    <v-dialog v-model="dialog" max-width="800">
      <v-card>
        <v-card-title>
          <v-icon start>mdi-cash-multiple</v-icon>
          {{ editingItem ? 'Editar' : 'Nuevo' }} Registro de Planilla
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveItem">
            <v-row>
              <v-col cols="6">
                <v-select
                  v-model="form.empleado_id"
                  :items="empleados"
                  item-title="nombre"
                  item-value="id"
                  label="Empleado"
                  variant="outlined"
                  @update:modelValue="loadEmpleadoInfo"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  :model-value="'$' + formatNumber(form.salario_base)"
                  label="Salario Base"
                  variant="outlined"
                  readonly
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="3">
                <v-select
                  v-model="form.mes"
                  :items="meses"
                  label="Mes"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                ></v-select>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model="form.anio"
                  label="Año"
                  type="number"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-select
                  v-model="form.quincena"
                  :items="[1, 2]"
                  label="Quincena"
                  variant="outlined"
                ></v-select>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model="form.dias_trabajados"
                  label="Días Trabajados"
                  type="number"
                  variant="outlined"
                  @update:modelValue="calculate"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-divider class="my-3"></v-divider>
            <div class="text-subtitle-1 mb-2">Horas Extras</div>
            <v-row>
              <v-col cols="3">
                <v-text-field
                  v-model="form.he_diurnas"
                  label="H.E. Diurnas"
                  type="number"
                  step="0.5"
                  variant="outlined"
                  @update:modelValue="calculate"
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model="form.he_diurnas_asueto"
                  label="H.E. Diurnas Asueto"
                  type="number"
                  step="0.5"
                  variant="outlined"
                  @update:modelValue="calculate"
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model="form.he_extraordinarias"
                  label="H.E. Extraordinarias"
                  type="number"
                  step="0.5"
                  variant="outlined"
                  @update:modelValue="calculate"
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model="form.he_nocturnas"
                  label="H.E. Nocturnas"
                  type="number"
                  step="0.5"
                  variant="outlined"
                  @update:modelValue="calculate"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-divider class="my-3"></v-divider>
            <div class="text-subtitle-1 mb-2">Resumen de Pagos</div>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  :model-value="'$' + formatNumber(form.salario)"
                  label="Salario"
                  variant="outlined"
                  readonly
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  :model-value="'$' + formatNumber(form.pago_he_total)"
                  label="Total H.E."
                  variant="outlined"
                  readonly
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  :model-value="'$' + formatNumber(form.total_salario_he)"
                  label="Total Salario + H.E."
                  variant="outlined"
                  readonly
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  :model-value="'$' + formatNumber(form.isss)"
                  label="ISSS (3%)"
                  variant="outlined"
                  readonly
                  color="error"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  :model-value="'$' + formatNumber(form.afp)"
                  label="AFP (7.25%)"
                  variant="outlined"
                  readonly
                  color="error"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  :model-value="'$' + formatNumber(form.isre)"
                  label="ISR (10%)"
                  variant="outlined"
                  readonly
                  color="error"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  :model-value="'$' + formatNumber(form.total_descuentos)"
                  label="Total Descuentos"
                  variant="outlined"
                  readonly
                  color="error"
                  bg-color="error"
                  class="text-white"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  :model-value="'$' + formatNumber(form.total_recibir)"
                  label="Total a Recibir"
                  variant="outlined"
                  readonly
                  color="success"
                  bg-color="success"
                  class="text-white"
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

    <!-- Modal Calculadora -->
    <v-dialog v-model="calcDialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon start>mdi-calculator</v-icon>
          Calculadora de Planilla
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="calculatePlanilla">
            <v-select
              v-model="calc.empleado_id"
              :items="empleados"
              item-title="nombre"
              item-value="id"
              label="Empleado"
              variant="outlined"
              class="mb-3"
            ></v-select>
            <v-text-field
              v-model="calc.dias_trabajados"
              label="Días Trabajados"
              type="number"
              variant="outlined"
              class="mb-3"
            ></v-text-field>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="calc.he_diurnas"
                  label="H.E. Diurnas"
                  type="number"
                  step="0.5"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="calc.he_diurnas_asueto"
                  label="H.E. Diurnas Asueto"
                  type="number"
                  step="0.5"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="calc.he_extraordinarias"
                  label="H.E. Extraordinarias"
                  type="number"
                  step="0.5"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="calc.he_nocturnas"
                  label="H.E. Nocturnas"
                  type="number"
                  step="0.5"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-btn color="primary" block type="submit">Calcular</v-btn>
          </v-form>
          
          <div v-if="calcResult" class="mt-4">
            <v-divider class="mb-3"></v-divider>
            <div class="text-subtitle-1">Resultado</div>
            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>Salario:</template>
                <template v-slot:append>${{ formatNumber(calcResult.salario) }}</template>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>H.E. Diurnas:</template>
                <template v-slot:append>${{ formatNumber(calcResult.pago_he_diurnas) }}</template>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>H.E. Asueto:</template>
                <template v-slot:append>${{ formatNumber(calcResult.pago_he_asueto) }}</template>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>H.E. Extraordinarias:</template>
                <template v-slot:append>${{ formatNumber(calcResult.pago_he_extraordinarias) }}</template>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>H.E. Nocturnas:</template>
                <template v-slot:append>${{ formatNumber(calcResult.pago_he_nocturnas) }}</template>
              </v-list-item>
              <v-list-item class="bg-primary">
                <template v-slot:prepend><strong>Total Salario + H.E.:</strong></template>
                <template v-slot:append><strong>${{ formatNumber(calcResult.total_salario_he) }}</strong></template>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>ISSS (3%):</template>
                <template v-slot:append class="text-error">${{ formatNumber(calcResult.isss) }}</template>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>AFP (7.25%):</template>
                <template v-slot:append class="text-error">${{ formatNumber(calcResult.afp) }}</template>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>ISR (10%):</template>
                <template v-slot:append class="text-error">${{ formatNumber(calcResult.isre) }}</template>
              </v-list-item>
              <v-list-item class="bg-error">
                <template v-slot:prepend><strong>Total Descuentos:</strong></template>
                <template v-slot:append><strong>${{ formatNumber(calcResult.total_descuentos) }}</strong></template>
              </v-list-item>
              <v-list-item class="bg-success">
                <template v-slot:prepend><strong>Total a Recibir:</strong></template>
                <template v-slot:append><strong>${{ formatNumber(calcResult.total_recibir) }}</strong></template>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { planillaService, empleadosService } from '../services/api'
import Swal from 'sweetalert2'

export default {
  name: 'Planilla',
  data() {
    return {
      dialog: false,
      calcDialog: false,
      planilla: [],
      empleados: [],
      resumen: {
        total_salarios: 0,
        total_descuentos: 0,
        total_pagar: 0,
        total_empleados: 0,
        total_horas_extras: 0,
        total_isss: 0,
        total_afp: 0,
        total_isr: 0
      },
      filters: { mes: '', anio: 2026, quincena: '' },
      form: {
        empleado_id: '',
        salario_base: 0,
        mes: 'Enero',
        anio: 2026,
        quincena: 1,
        dias_trabajados: 15,
        he_diurnas: 0,
        he_diurnas_asueto: 0,
        he_extraordinarias: 0,
        he_nocturnas: 0,
        salario: 0,
        pago_he_diurnas: 0,
        pago_he_asueto: 0,
        pago_he_extraordinarias: 0,
        pago_he_nocturnas: 0,
        pago_he_total: 0,
        total_salario_he: 0,
        isss: 0,
        afp: 0,
        isre: 0,
        total_descuentos: 0,
        total_recibir: 0
      },
      calc: {
        empleado_id: '',
        dias_trabajados: 15,
        he_diurnas: 0,
        he_diurnas_asueto: 0,
        he_extraordinarias: 0,
        he_nocturnas: 0,
        mes: 'Enero',
        anio: 2026,
        quincena: 1
      },
      calcResult: null,
      editingItem: null,
      headers: [
        { title: 'Código', key: 'codigo' },
        { title: 'Nombre', key: 'nombre' },
        { title: 'Días', key: 'dias_trabajados', align: 'center' },
        { title: 'H.E. D.', key: 'he_diurnas', align: 'center' },
        { title: 'H.E. N.', key: 'he_nocturnas', align: 'center' },
        { title: 'Salario', key: 'salario', align: 'end' },
        { title: 'H.E.', key: 'he', align: 'end' },
        { title: 'ISSS', key: 'isss', align: 'end' },
        { title: 'AFP', key: 'afp', align: 'end' },
        { title: 'ISR', key: 'isre', align: 'end' },
        { title: 'Total', key: 'total_recibir', align: 'end' },
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
    async loadData() {
      try {
        const res = await planillaService.getAll(this.filters)
        this.planilla = res.data
        this.calculateResumen()
      } catch (error) {
        console.error('Error loading planilla:', error)
      }
    },
    async loadEmpleados() {
      try {
        const res = await empleadosService.getAll({ activo: true })
        this.empleados = res.data.map(e => ({
          ...e,
          nombre: `${e.codigo} - ${e.nombres} ${e.apellidos}`
        }))
      } catch (error) {
        console.error('Error loading empleados:', error)
      }
    },
    calculateResumen() {
      this.resumen = {
        total_salarios: this.planilla.reduce((sum, i) => sum + parseFloat(i.salario || 0), 0),
        total_descuentos: this.planilla.reduce((sum, i) => sum + parseFloat(i.total_descuentos || 0), 0),
        total_pagar: this.planilla.reduce((sum, i) => sum + parseFloat(i.total_recibir || 0), 0),
        total_empleados: new Set(this.planilla.map(i => i.empleado_id)).size,
        total_horas_extras: this.planilla.reduce((sum, i) => sum + parseFloat(i.pago_he_diurnas || 0) + parseFloat(i.pago_he_nocturnas || 0), 0),
        total_isss: this.planilla.reduce((sum, i) => sum + parseFloat(i.isss || 0), 0),
        total_afp: this.planilla.reduce((sum, i) => sum + parseFloat(i.afp || 0), 0),
        total_isr: this.planilla.reduce((sum, i) => sum + parseFloat(i.isre || 0), 0)
      }
    },
    loadEmpleadoInfo() {
      const emp = this.empleados.find(e => e.id === this.form.empleado_id)
      if (emp) {
        this.form.salario_base = emp.salario_base
        this.calculate()
      }
    },
    calculate() {
      const salario_mensual = parseFloat(this.form.salario_base) || 0
      const dias = parseInt(this.form.dias_trabajados) || 0
      
      // Salario base es MENSUAL, se divide entre 30 días
      const salario_diario = salario_mensual / 30
      const salario_quincenal = salario_mensual / 2
      
      // Hora normal basada en salario diario
      const hora_normal = salario_diario / 8

      // Salario proporcional a días trabajados (máximo 15 días por quincena)
      this.form.salario = dias * salario_diario
      
      // Horas extras con sus respectivos multiplicadores
      this.form.pago_he_diurnas = (parseFloat(this.form.he_diurnas) || 0) * hora_normal * 2
      this.form.pago_he_asueto = (parseFloat(this.form.he_diurnas_asueto) || 0) * hora_normal * 2.5
      this.form.pago_he_extraordinarias = (parseFloat(this.form.he_extraordinarias) || 0) * hora_normal * 1.25
      this.form.pago_he_nocturnas = (parseFloat(this.form.he_nocturnas) || 0) * hora_normal * 2.5
      
      this.form.pago_he_total = this.form.pago_he_diurnas + this.form.pago_he_asueto + this.form.pago_he_extraordinarias + this.form.pago_he_nocturnas
      this.form.total_salario_he = this.form.salario + this.form.pago_he_total
      
      // Los descuentos se calculan sobre el SALARIO MENSUAL
      // ISSS: 3% con tope máximo de $30 mensual
      const isssMensual = Math.min(salario_mensual * 0.03, 30)
      this.form.isss = isssMensual / 2 // ISSS quincenal
      
      // AFP: 7.25% del salario mensual
      const afpMensual = salario_mensual * 0.0725
      this.form.afp = afpMensual / 2 // AFP quincenal
      
      // ISR: Tabla progresiva de renta de El Salvador
      // Se calcula sobre el salario mensual MENOS el ISSS
      const salarioParaISR = salario_mensual - isssMensual
      let isrMensual = 0
      
      // Tabla de ISR 2024 (mensual) - Valores oficiales MH El Salvador
      // Tramo I: $0.01 - $472.00 = Exento
      // Tramo II: $472.01 - $895.24 = 10% sobre el exceso de $472.00
      // Tramo III: $895.25 - $2,038.10 = $42.60 + 20% sobre el exceso de $895.24
      // Tramo IV: Más de $2,038.10 = $271.40 + 30% sobre el exceso de $2,038.10
      if (salarioParaISR > 2038.10) {
        isrMensual = 271.40 + (salarioParaISR - 2038.10) * 0.30
      } else if (salarioParaISR > 895.24) {
        isrMensual = 42.60 + (salarioParaISR - 895.24) * 0.20
      } else if (salarioParaISR > 472.00) {
        isrMensual = (salarioParaISR - 472.00) * 0.10
      }
      
      this.form.isre = isrMensual / 2 // ISR quincenal
      
      this.form.total_descuentos = this.form.isss + this.form.afp + this.form.isre
      this.form.total_recibir = this.form.total_salario_he - this.form.total_descuentos
    },
    openModal(item = null) {
      this.editingItem = item
      if (item) {
        this.form = { ...item, salario_base: item.salario_base || item.salario / item.dias_trabajados * 15 }
      } else {
        this.form = {
          empleado_id: '',
          salario_base: 0,
          mes: 'Enero',
          anio: 2026,
          quincena: 1,
          dias_trabajados: 15,
          he_diurnas: 0,
          he_diurnas_asueto: 0,
          he_extraordinarias: 0,
          he_nocturnas: 0,
          salario: 0,
          pago_he_diurnas: 0,
          pago_he_asueto: 0,
          pago_he_extraordinarias: 0,
          pago_he_nocturnas: 0,
          pago_he_total: 0,
          total_salario_he: 0,
          isss: 0,
          afp: 0,
          isre: 0,
          total_descuentos: 0,
          total_recibir: 0
        }
      }
      this.dialog = true
    },
    openCalculator() {
      this.calcResult = null
      this.calc = {
        empleado_id: '',
        dias_trabajados: 15,
        he_diurnas: 0,
        he_diurnas_asueto: 0,
        he_extraordinarias: 0,
        he_nocturnas: 0,
        mes: 'Enero',
        anio: 2026,
        quincena: 1
      }
      this.calcDialog = true
    },
    async calculatePlanilla() {
      try {
        const res = await planillaService.calcular({
          ...this.calc,
          mes: this.calc.mes,
          anio: this.calc.anio,
          quincena: this.calc.quincena
        })
        this.calcResult = res.data
      } catch (error) {
        console.error('Error calculating planilla:', error)
      }
    },
    async saveItem() {
      try {
        const data = {
          ...this.form,
          periodo: `${this.form.mes} ${this.form.anio} - Q${this.form.quincena}`
        }
        if (this.editingItem) {
          await planillaService.update(this.editingItem.id, data)
          Swal.fire('¡Actualizado!', 'Registro de planilla actualizado correctamente', 'success')
        } else {
          await planillaService.create(data)
          Swal.fire('¡Creado!', 'Registro de planilla creado correctamente', 'success')
        }
        this.dialog = false
        this.loadData()
      } catch (error) {
        console.error('Error saving item:', error)
        Swal.fire('Error', 'Error al guardar el registro de planilla', 'error')
      }
    },
    async deleteItem(id) {
      const result = await Swal.fire({
        title: '¿Está seguro?',
        text: '¿Desea eliminar este registro de planilla?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      })
      if (result.isConfirmed) {
        try {
          await planillaService.delete(id)
          Swal.fire('¡Eliminado!', 'Registro de planilla eliminado correctamente', 'success')
          this.loadData()
        } catch (error) {
          console.error('Error deleting item:', error)
          Swal.fire('Error', 'Error al eliminar el registro de planilla', 'error')
        }
      }
    }
  },
  mounted() {
    this.loadData()
    this.loadEmpleados()
  }
}
</script>