const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const schema = process.env.DB_SCHEMA || 'administradorcocina';

// Obtener toda la planilla
router.get('/', async (req, res) => {
  try {
    const { mes, anio, quincena, empleado_id } = req.query;
    let query = `
      SELECT p.*, e.codigo, e.nombres, e.apellidos, e.salario_base
      FROM ${schema}.planilla p
      JOIN ${schema}.empleados e ON p.empleado_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (mes) {
      params.push(mes);
      query += ` AND p.mes = $${params.length}`;
    }
    if (anio) {
      params.push(anio);
      query += ` AND p.anio = $${params.length}`;
    }
    if (quincena) {
      params.push(quincena);
      query += ` AND p.quincena = $${params.length}`;
    }
    if (empleado_id) {
      params.push(empleado_id);
      query += ` AND p.empleado_id = $${params.length}`;
    }

    query += ' ORDER BY p.anio DESC, p.mes, p.quincena, e.apellidos';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching planilla:', error);
    res.status(500).json({ error: 'Error al obtener planilla' });
  }
});

// Obtener resumen de planilla por mes
router.get('/resumen', async (req, res) => {
  try {
    const { anio } = req.query;
    const anioParam = anio || new Date().getFullYear();

    const query = `
      SELECT 
        mes,
        anio,
        SUM(total_salario_he) as total_salarios,
        SUM(total_descuentos) as total_descuentos,
        SUM(total_recibir) as total_pagar,
        COUNT(DISTINCT empleado_id) as total_empleados
      FROM ${schema}.planilla
      WHERE anio = $1
      GROUP BY mes, anio
      ORDER BY 
        CASE mes
          WHEN 'ENERO' THEN 1
          WHEN 'FEBRERO' THEN 2
          WHEN 'MARZO' THEN 3
          WHEN 'ABRIL' THEN 4
          WHEN 'MAYO' THEN 5
          WHEN 'JUNIO' THEN 6
          WHEN 'JULIO' THEN 7
          WHEN 'AGOSTO' THEN 8
          WHEN 'SEPTIEMBRE' THEN 9
          WHEN 'OCTUBRE' THEN 10
          WHEN 'NOVIEMBRE' THEN 11
          WHEN 'DICIEMBRE' THEN 12
        END
    `;

    const result = await pool.query(query, [anioParam]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching resumen planilla:', error);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
});

// Obtener resumen de horas extras
router.get('/horas-extras', async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const anioParam = anio || new Date().getFullYear();

    let query = `
      SELECT 
        mes,
        SUM(he_diurnas) as total_he_diurnas,
        SUM(he_diurnas_asueto) as total_he_diurnas_asueto,
        SUM(he_extraordinarias) as total_he_extraordinarias,
        SUM(he_nocturnas) as total_he_nocturnas,
        SUM(pago_he_diurnas) as total_pago_he_diurnas,
        SUM(pago_he_asueto) as total_pago_he_asueto,
        SUM(pago_he_extraordinarias) as total_pago_he_extraordinarias,
        SUM(pago_he_nocturnas) as total_pago_he_nocturnas
      FROM ${schema}.planilla
      WHERE anio = $1
    `;
    const params = [anioParam];

    if (mes) {
      params.push(mes);
      query += ` AND mes = $${params.length}`;
    }

    query += ' GROUP BY mes ORDER BY mes';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching horas extras:', error);
    res.status(500).json({ error: 'Error al obtener horas extras' });
  }
});

// Obtener resumen de descuentos
router.get('/descuentos', async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const anioParam = anio || new Date().getFullYear();

    let query = `
      SELECT 
        mes,
        SUM(isss) as total_isss,
        SUM(afp) as total_afp,
        SUM(isre) as total_isre,
        SUM(total_descuentos) as total_descuentos
      FROM ${schema}.planilla
      WHERE anio = $1
    `;
    const params = [anioParam];

    if (mes) {
      params.push(mes);
      query += ` AND mes = $${params.length}`;
    }

    query += ' GROUP BY mes ORDER BY mes';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching descuentos:', error);
    res.status(500).json({ error: 'Error al obtener descuentos' });
  }
});

// Crear registro de planilla
router.post('/', async (req, res) => {
  try {
    const {
      empleado_id, periodo, quincena, mes, anio, dias_trabajados,
      he_diurnas, he_diurnas_asueto, he_extraordinarias, he_nocturnas,
      salario, pago_he_diurnas, pago_he_asueto, pago_he_extraordinarias, pago_he_nocturnas,
      total_salario_he, isss, afp, isre, total_descuentos, total_recibir
    } = req.body;

    const query = `
      INSERT INTO ${schema}.planilla 
      (empleado_id, periodo, quincena, mes, anio, dias_trabajados,
       he_diurnas, he_diurnas_asueto, he_extraordinarias, he_nocturnas,
       salario, pago_he_diurnas, pago_he_asueto, pago_he_extraordinarias, pago_he_nocturnas,
       total_salario_he, isss, afp, isre, total_descuentos, total_recibir)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `;

    const result = await pool.query(query, [
      empleado_id, periodo, quincena, mes, anio, dias_trabajados,
      he_diurnas, he_diurnas_asueto, he_extraordinarias, he_nocturnas,
      salario, pago_he_diurnas, pago_he_asueto, pago_he_extraordinarias, pago_he_nocturnas,
      total_salario_he, isss, afp, isre, total_descuentos, total_recibir
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating planilla:', error);
    res.status(500).json({ error: 'Error al crear registro de planilla' });
  }
});

// Calcular planilla automáticamente
router.post('/calcular', async (req, res) => {
  try {
    const { empleado_id, dias_trabajados, he_diurnas, he_diurnas_asueto, he_extraordinarias, he_nocturnas, mes, anio, quincena } = req.body;

    // Obtener salario base del empleado
    const empleadoResult = await pool.query(
      `SELECT salario_base FROM ${schema}.empleados WHERE id = $1`,
      [empleado_id]
    );

    if (empleadoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const salario_mensual = parseFloat(empleadoResult.rows[0].salario_base);
    
    // Salario base es MENSUAL, se divide entre 30 días
    const salario_diario = salario_mensual / 30;
    const salario_quincenal = salario_mensual / 2;
    
    // Hora normal basada en salario diario
    const hora_normal = salario_diario / 8;

    // Salario proporcional a días trabajados (máximo 15 días por quincena)
    const salario = dias_trabajados * salario_diario;
    
    // Horas extras con sus respectivos multiplicadores
    const pago_he_diurnas = he_diurnas * hora_normal * 2;
    const pago_he_asueto = he_diurnas_asueto * hora_normal * 2.5;
    const pago_he_extraordinarias = he_extraordinarias * hora_normal * 1.25;
    const pago_he_nocturnas = he_nocturnas * hora_normal * 2.5;

    const total_salario_he = salario + pago_he_diurnas + pago_he_asueto + pago_he_extraordinarias + pago_he_nocturnas;

    // Los descuentos se calculan sobre el SALARIO MENSUAL
    // ISSS: 3% con tope máximo de $30 mensual
    const isssMensual = Math.min(salario_mensual * 0.03, 30);
    const isss = isssMensual / 2; // ISSS quincenal
    
    // AFP: 7.25% del salario mensual
    const afpMensual = salario_mensual * 0.0725;
    const afp = afpMensual / 2; // AFP quincenal
    
    // ISR: Tabla progresiva de renta de El Salvador
    // Se calcula sobre el salario mensual MENOS el ISSS
    const salarioParaISR = salario_mensual - isssMensual;
    let isrMensual = 0;
    
    // Tabla de ISR 2024 (mensual) - Valores oficiales MH El Salvador
    // Tramo I: $0.01 - $472.00 = Exento
    // Tramo II: $472.01 - $895.24 = 10% sobre el exceso de $472.00
    // Tramo III: $895.25 - $2,038.10 = $42.60 + 20% sobre el exceso de $895.24
    // Tramo IV: Más de $2,038.10 = $271.40 + 30% sobre el exceso de $2,038.10
    if (salarioParaISR > 2038.10) {
      isrMensual = 271.40 + (salarioParaISR - 2038.10) * 0.30;
    } else if (salarioParaISR > 895.24) {
      isrMensual = 42.60 + (salarioParaISR - 895.24) * 0.20;
    } else if (salarioParaISR > 472.00) {
      isrMensual = (salarioParaISR - 472.00) * 0.10;
    }
    
    const isre = isrMensual / 2; // ISR quincenal
    
    const total_descuentos = isss + afp + isre;
    const total_recibir = total_salario_he - total_descuentos;

    res.json({
      salario,
      pago_he_diurnas,
      pago_he_asueto,
      pago_he_extraordinarias,
      pago_he_nocturnas,
      total_salario_he,
      isss,
      afp,
      isre,
      total_descuentos,
      total_recibir
    });
  } catch (error) {
    console.error('Error calculating planilla:', error);
    res.status(500).json({ error: 'Error al calcular planilla' });
  }
});

// Actualizar registro de planilla
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      dias_trabajados, he_diurnas, he_diurnas_asueto, he_extraordinarias, he_nocturnas,
      salario, pago_he_diurnas, pago_he_asueto, pago_he_extraordinarias, pago_he_nocturnas,
      total_salario_he, isss, afp, isre, total_descuentos, total_recibir
    } = req.body;

    const query = `
      UPDATE ${schema}.planilla 
      SET dias_trabajados = $1, he_diurnas = $2, he_diurnas_asueto = $3, he_extraordinarias = $4, he_nocturnas = $5,
          salario = $6, pago_he_diurnas = $7, pago_he_asueto = $8, pago_he_extraordinarias = $9, pago_he_nocturnas = $10,
          total_salario_he = $11, isss = $12, afp = $13, isre = $14, total_descuentos = $15, total_recibir = $16
      WHERE id = $17
      RETURNING *
    `;

    const result = await pool.query(query, [
      dias_trabajados, he_diurnas, he_diurnas_asueto, he_extraordinarias, he_nocturnas,
      salario, pago_he_diurnas, pago_he_asueto, pago_he_extraordinarias, pago_he_nocturnas,
      total_salario_he, isss, afp, isre, total_descuentos, total_recibir, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating planilla:', error);
    res.status(500).json({ error: 'Error al actualizar planilla' });
  }
});

// Eliminar registro de planilla
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM ${schema}.planilla WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    res.json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting planilla:', error);
    res.status(500).json({ error: 'Error al eliminar planilla' });
  }
});

module.exports = router;