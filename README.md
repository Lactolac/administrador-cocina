# Cocina Planilla - Sistema de Gestión

Sistema completo para la gestión de cocina, planilla y alimentación con backend en Express.js y frontend en Vue.js.

## Estructura del Proyecto

```
CocinaPlanilla/
|-- backend/                 # API REST con Express.js
|   |-- src/
|   |   |-- config/         # Configuración de base de datos
|   |   |-- models/         # Modelos y creación de tablas
|   |   |-- routes/         # Rutas de la API
|   |   |-- index.js        # Punto de entrada
|   |-- .env                # Variables de entorno
|   |-- package.json
|
|-- frontend/               # Aplicación Vue.js + Vite
|   |-- src/
|   |   |-- router/         # Configuración de rutas
|   |   |-- services/       # Servicios API
|   |   |-- styles/         # Estilos CSS
|   |   |-- views/          # Componentes/Vistas
|   |   |-- App.vue         # Componente principal
|   |   |-- main.js         # Punto de entrada
|   |-- index.html
|   |-- vite.config.js
|   |-- package.json
|
|-- *.xlsx                  # Archivos Excel originales
```

## Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## Instalación

### 1. Configurar Base de Datos

```sql
-- Crear la base de datos
CREATE DATABASE tomapedidos;

-- Crear el usuario
CREATE USER tomapedidos WITH PASSWORD 'Lac2025+';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE tomapedidos TO tomapedidos;

-- Conectar a la base de datos y crear el schema
\c tomapedidos;
CREATE SCHEMA administradorcocina;
GRANT ALL ON SCHEMA administradorcocina TO tomapedidos;
```

### 2. Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### 3. Configurar Variables de Entorno

Creá `backend/.env` con los datos del entorno. No versiones credenciales ni hosts internos:

```env
DB_NAME=<nombre_base>
DB_USER=<usuario_base>
DB_PASSWORD=<contrasenia_segura>
DB_HOST=<host_base>
DB_PORT=5432
DB_SCHEMA=<schema>
PORT=3001
```

### 4. Inicializar Tablas

Las tablas se crean automáticamente al iniciar el servidor por primera vez.

### 5. Instalar Dependencias del Frontend

```bash
cd ../frontend
npm install
```

## Ejecución

### Iniciar Backend

```bash
cd backend
npm run dev     # Desarrollo con nodemon
# o
npm start       # Producción
```

El servidor estará disponible en: `http://localhost:3001`

### Iniciar Frontend

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

## API Endpoints

### Inventario
- `GET /api/inventario` - Listar inventario
- `GET /api/inventario/resumen` - Resumen por mes
- `POST /api/inventario` - Crear registro
- `PUT /api/inventario/:id` - Actualizar registro
- `DELETE /api/inventario/:id` - Eliminar registro

### Alimentación
- `GET /api/alimentacion` - Listar alimentación servida
- `GET /api/alimentacion/resumen` - Resumen por mes
- `GET /api/alimentacion/resumen-area` - Resumen por área
- `POST /api/alimentacion` - Crear registro
- `PUT /api/alimentacion/:id` - Actualizar registro
- `DELETE /api/alimentacion/:id` - Eliminar registro

### Planilla
- `GET /api/planilla` - Listar planilla
- `GET /api/planilla/resumen` - Resumen por mes
- `GET /api/planilla/horas-extras` - Resumen horas extras
- `GET /api/planilla/descuentos` - Resumen descuentos
- `POST /api/planilla` - Crear registro
- `POST /api/planilla/calcular` - Calcular planilla automáticamente
- `PUT /api/planilla/:id` - Actualizar registro
- `DELETE /api/planilla/:id` - Eliminar registro

### Empleados
- `GET /api/empleados` - Listar empleados
- `GET /api/empleados/:id` - Obtener empleado
- `POST /api/empleados` - Crear empleado
- `PUT /api/empleados/:id` - Actualizar empleado
- `DELETE /api/empleados/:id` - Eliminar empleado

### Productos
- `GET /api/productos` - Listar productos
- `GET /api/productos/categorias` - Listar categorías
- `GET /api/productos/proveedores` - Listar proveedores
- `POST /api/productos` - Crear producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Reportes
- `GET /api/reportes/consolidado-mensual` - Reporte consolidado
- `GET /api/reportes/costos-area` - Costos por área
- `GET /api/reportes/tendencia-gastos` - Tendencia de gastos
- `GET /api/reportes/eficiencia-empleados` - Eficiencia de empleados
- `GET /api/reportes/productos-consumo` - Productos más consumidos

## Funcionalidades

### Dashboard
- Resumen general de compras, planilla y alimentación
- Gráficos de tendencia de gastos
- Distribución de gastos por categoría

### Inventario
- Gestión de inventario de productos
- Control de ingresos y consumo
- Resumen por mes y categoría

### Alimentación Servida
- Registro de desayunos, almuerzos, cenas y refrigerios
- Separación por área (Administración/Producción)
- Cálculo automático de costos

### Planilla
- Gestión de pagos de empleados
- Cálculo automático de horas extras
- Cálculo de descuentos (ISSS, AFP, ISR)
- Calculadora de planilla

### Empleados
- CRUD completo de empleados
- Gestión de salarios base
- Estado activo/inactivo

### Productos
- Catálogo de productos
- Categorización por tipo
- Gestión de proveedores

### Reportes
- Consolidado mensual
- Tendencia de gastos
- Eficiencia de empleados
- Productos más consumidos
- Costos por área

## Cálculos de Planilla

### Horas Extras
- **H.E. Diurnas**: Hora normal × 2 (100% adicional)
- **H.E. Diurnas Asueto**: Hora normal × 2.5 (150% adicional)
- **H.E. Extraordinarias**: Hora normal × 1.25 (25% adicional)
- **H.E. Nocturnas**: Hora normal × 2.25 (100% adicional + 25% nocturna)

### Descuentos
- **ISSS**: 3% del total salario + H.E.
- **AFP**: 7.25% del total salario + H.E.
- **ISR**: 10% del total salario + H.E.

## Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- PostgreSQL (pg)
- xlsx (para lectura de Excel)

### Frontend
- Vue.js 3
- Vite
- Vue Router
- Axios
- Chart.js / vue-chartjs
- Bootstrap 5
- Bootstrap Icons

## Licencia

## Notas operativas verificadas

La API se monta en `backend/src/index.js`: `/api/inventario`, `/api/alimentacion`, `/api/planilla`, `/api/empleados`, `/api/productos`, `/api/reportes`, `/api/auth` y `/api/usuarios`. Las rutas incluyen resúmenes, cálculo de planilla, horas extra/descuentos y reportes consolidados, costos, tendencias, eficiencia, consumo y proveedores. Los archivos de `backend/src/routes/` son la referencia de filtros y payloads.

Variables leídas: `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SCHEMA` y `JWT_SECRET`. No hay `.env.example`; no copies los defaults sensibles del compose a documentación o código nuevo.

`docker-compose.yml` es actualmente un stack de producción (imágenes del registry, red externa, sin build local), pese a su nombre. El backend escucha 3001 y el healthcheck consulta `/api/auth/verify`. No existe suite de pruebas ni migraciones versionadas; el modelo se inicializa desde `backend/src/models/index.js`. Respaldá la DB antes de cambios.

Seguridad: aplicá auth/RBAC a rutas de usuarios y mutaciones, validá números/fechas en servidor y mantené SQL parametrizado. Ante 502 revisá `planilla-back`, puerto 3001 y red; ante cálculos inconsistentes, zona horaria y reglas de `planilla.js`; ante DB, schema/permisos.

Proyecto privado para uso interno.
