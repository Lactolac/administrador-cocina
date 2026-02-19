import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Servicios de Inventario
export const inventarioService = {
  getAll: (params) => api.get('/inventario', { params }),
  getResumen: (anio) => api.get('/inventario/resumen', { params: { anio } }),
  create: (data) => api.post('/inventario', data),
  update: (id, data) => api.put(`/inventario/${id}`, data),
  delete: (id) => api.delete(`/inventario/${id}`)
}

// Servicios de Alimentación
export const alimentacionService = {
  getAll: (params) => api.get('/alimentacion', { params }),
  getResumen: (anio) => api.get('/alimentacion/resumen', { params: { anio } }),
  getResumenArea: (params) => api.get('/alimentacion/resumen-area', { params }),
  create: (data) => api.post('/alimentacion', data),
  update: (id, data) => api.put(`/alimentacion/${id}`, data),
  delete: (id) => api.delete(`/alimentacion/${id}`)
}

// Servicios de Planilla
export const planillaService = {
  getAll: (params) => api.get('/planilla', { params }),
  getResumen: (anio) => api.get('/planilla/resumen', { params: { anio } }),
  getHorasExtras: (params) => api.get('/planilla/horas-extras', { params }),
  getDescuentos: (params) => api.get('/planilla/descuentos', { params }),
  calcular: (data) => api.post('/planilla/calcular', data),
  create: (data) => api.post('/planilla', data),
  update: (id, data) => api.put(`/planilla/${id}`, data),
  delete: (id) => api.delete(`/planilla/${id}`)
}

// Servicios de Empleados
export const empleadosService = {
  getAll: (params) => api.get('/empleados', { params }),
  getById: (id) => api.get(`/empleados/${id}`),
  create: (data) => api.post('/empleados', data),
  update: (id, data) => api.put(`/empleados/${id}`, data),
  delete: (id) => api.delete(`/empleados/${id}`)
}

// Servicios de Productos
export const productosService = {
  getAll: (params) => api.get('/productos', { params }),
  getById: (id) => api.get(`/productos/${id}`),
  getCategorias: () => api.get('/productos/categorias'),
  getProveedores: () => api.get('/productos/proveedores'),
  create: (data) => api.post('/productos', data),
  update: (id, data) => api.put(`/productos/${id}`, data),
  delete: (id) => api.delete(`/productos/${id}`)
}

// Servicios de Reportes
export const reportesService = {
  getConsolidadoMensual: (params) => api.get('/reportes/consolidado-mensual', { params }),
  getCostosArea: (params) => api.get('/reportes/costos-area', { params }),
  getTendenciaGastos: (anio) => api.get('/reportes/tendencia-gastos', { params: { anio } }),
  getEficienciaEmpleados: (params) => api.get('/reportes/eficiencia-empleados', { params }),
  getProductosConsumo: (params) => api.get('/reportes/productos-consumo', { params }),
  getGastosProveedor: (params) => api.get('/reportes/gastos-proveedor', { params })
}

// Servicios de Usuarios
export const usuariosService = {
  getAll: () => api.get('/usuarios'),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`),
  changePassword: (id, data) => api.put(`/usuarios/${id}/password`, data)
}

// Health check
export const healthCheck = () => api.get('/health')

export default api