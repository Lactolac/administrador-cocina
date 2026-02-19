const pool = require('../config/database');

// Crear tablas en la base de datos
const createTables = async () => {
  const schema = process.env.DB_SCHEMA || 'administradorcocina';
  
  try {
    // Crear schema si no existe
    await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    
    // Tabla de empleados
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.empleados (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(20) UNIQUE,
        nombres VARCHAR(100),
        apellidos VARCHAR(100),
        salario_base DECIMAL(10,2),
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de productos/inventario
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.productos (
        id SERIAL PRIMARY KEY,
        descripcion VARCHAR(255),
        unidad_medida VARCHAR(50),
        precio_unitario DECIMAL(10,4),
        categoria VARCHAR(100),
        proveedor VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Agregar columna proveedor si no existe
    try {
      await pool.query(`ALTER TABLE ${schema}.productos ADD COLUMN IF NOT EXISTS proveedor VARCHAR(100)`);
    } catch (err) {
      // Column already exists, ignore error
    }

    // Tabla de inventario/movimientos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.inventario (
        id SERIAL PRIMARY KEY,
        producto_id INTEGER REFERENCES ${schema}.productos(id),
        fecha DATE,
        inv_inicial DECIMAL(10,2),
        ingresos DECIMAL(10,2),
        consumo DECIMAL(10,2),
        inv_final DECIMAL(10,2),
        total_ingresos DECIMAL(10,2),
        total_consumo DECIMAL(10,2),
        total_inventario DECIMAL(10,2),
        precio_unitario DECIMAL(10,4),
        mes VARCHAR(20),
        anio INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de alimentación servida
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.alimentacion_servida (
        id SERIAL PRIMARY KEY,
        fecha DATE,
        descripcion VARCHAR(50),
        desayunos INTEGER DEFAULT 0,
        almuerzos INTEGER DEFAULT 0,
        cenas INTEGER DEFAULT 0,
        refrigerios INTEGER DEFAULT 0,
        costo_desayunos DECIMAL(10,2),
        costo_almuerzos DECIMAL(10,2),
        costo_cenas DECIMAL(10,2),
        total DECIMAL(10,2),
        mes VARCHAR(20),
        anio INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de planilla/pagos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.planilla (
        id SERIAL PRIMARY KEY,
        empleado_id INTEGER REFERENCES ${schema}.empleados(id),
        periodo VARCHAR(50),
        quincena INTEGER,
        mes VARCHAR(20),
        anio INTEGER,
        dias_trabajados INTEGER,
        he_diurnas DECIMAL(5,2),
        he_diurnas_asueto DECIMAL(5,2),
        he_extraordinarias DECIMAL(5,2),
        he_nocturnas DECIMAL(5,2),
        salario DECIMAL(10,2),
        pago_he_diurnas DECIMAL(10,2),
        pago_he_asueto DECIMAL(10,2),
        pago_he_extraordinarias DECIMAL(10,2),
        pago_he_nocturnas DECIMAL(10,2),
        total_salario_he DECIMAL(10,2),
        isss DECIMAL(10,2),
        afp DECIMAL(10,2),
        isre DECIMAL(10,2),
        total_descuentos DECIMAL(10,2),
        total_recibir DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de compras
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.compras (
        id SERIAL PRIMARY KEY,
        producto_id INTEGER REFERENCES ${schema}.productos(id),
        fecha DATE,
        cantidad DECIMAL(10,2),
        precio_unitario DECIMAL(10,4),
        total DECIMAL(10,2),
        proveedor VARCHAR(100),
        mes VARCHAR(20),
        anio INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de usuarios del sistema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.usuarios (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nombre VARCHAR(100),
        rol VARCHAR(20) DEFAULT 'usuario',
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

module.exports = { createTables };
