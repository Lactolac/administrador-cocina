const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const schema = process.env.DB_SCHEMA || 'administradorcocina';

// Reporte consolidado mensual
router.get('/consolidado-mensual', async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const anioParam = anio || new Date().getFullYear();

    // Obtener resumen de inventario
    const inventarioQuery = `
      SELECT 
        COALESCE(SUM(total_ingresos), 0) as total_compras,
        COALESCE(SUM(total_consumo), 0) as total_consumo,
        COALESCE(SUM(total_inventario), 0) as total_inventario
      FROM ${schema}.inventario
      WHERE anio = $1 ${mes ? 'AND mes = $2' : ''}
    `;

    // Obtener resumen de alimentación
    const alimentacionQuery = `
      SELECT 
        COALESCE(SUM(desayunos), 0) as total_desayunos,
        COALESCE(SUM(almuerzos), 0) as total_almuerzos,
        COALESCE(SUM(cenas), 0) as total_cenas,
        COALESCE(SUM(refrigerios), 0) as total_refrigerios,
        COALESCE(SUM(total), 0) as total_alimentacion
      FROM ${schema}.alimentacion_servida
      WHERE anio = $1 ${mes ? 'AND mes = $2' : ''}
    `;

    // Obtener resumen de planilla
    const planillaQuery = `
      SELECT 
        COALESCE(SUM(total_salario_he), 0) as total_salarios,
        COALESCE(SUM(total_descuentos), 0) as total_descuentos,
        COALESCE(SUM(total_recibir), 0) as total_pagar,
        COUNT(DISTINCT empleado_id) as total_empleados
      FROM ${schema}.planilla
      WHERE anio = $1 ${mes ? 'AND mes = $2' : ''}
    `;

    const params = mes ? [anioParam, mes] : [anioParam];

    const [inventario, alimentacion, planilla] = await Promise.all([
      pool.query(inventarioQuery, params),
      pool.query(alimentacionQuery, params),
      pool.query(planillaQuery, params)
    ]);

    res.json({
      mes: mes || 'Anual',
      anio: anioParam,
      inventario: inventario.rows[0],
      alimentacion: alimentacion.rows[0],
      planilla: planilla.rows[0],
      resumen_general: {
        total_compras: parseFloat(inventario.rows[0].total_compras) || 0,
        total_alimentacion: parseFloat(alimentacion.rows[0].total_alimentacion) || 0,
        total_planilla: parseFloat(planilla.rows[0].total_pagar) || 0,
        total_gastos: (parseFloat(inventario.rows[0].total_compras) || 0) + 
                      (parseFloat(planilla.rows[0].total_pagar) || 0)
      }
    });
  } catch (error) {
    console.error('Error generating consolidated report:', error);
    res.status(500).json({ error: 'Error al generar reporte consolidado' });
  }
});

// Reporte de costos por área
router.get('/costos-area', async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const anioParam = anio || new Date().getFullYear();

    let query = `
      SELECT 
        descripcion as area,
        COUNT(*) as dias_trabajados,
        SUM(desayunos) as total_desayunos,
        SUM(almuerzos) as total_almuerzos,
        SUM(cenas) as total_cenas,
        SUM(refrigerios) as total_refrigerios,
        SUM(total) as costo_total
      FROM ${schema}.alimentacion_servida
      WHERE anio = $1
    `;
    const params = [anioParam];

    if (mes) {
      params.push(mes);
      query += ` AND mes = $${params.length}`;
    }

    query += ' GROUP BY descripcion ORDER BY descripcion';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error generating area costs report:', error);
    res.status(500).json({ error: 'Error al generar reporte de costos por área' });
  }
});

// Reporte de tendencia de gastos
router.get('/tendencia-gastos', async (req, res) => {
  try {
    const { anio } = req.query;
    const anioParam = anio || new Date().getFullYear();

    const query = `
      WITH inventario_mensual AS (
        SELECT mes, anio, SUM(total_ingresos) as compras
        FROM ${schema}.inventario
        WHERE anio = $1
        GROUP BY mes, anio
      ),
      planilla_mensual AS (
        SELECT mes, anio, SUM(total_recibir) as planilla
        FROM ${schema}.planilla
        WHERE anio = $1
        GROUP BY mes, anio
      ),
      alimentacion_mensual AS (
        SELECT mes, anio, SUM(total) as alimentacion
        FROM ${schema}.alimentacion_servida
        WHERE anio = $1
        GROUP BY mes, anio
      )
      SELECT 
        COALESCE(i.mes, p.mes, a.mes) as mes,
        COALESCE(i.compras, 0) as compras,
        COALESCE(p.planilla, 0) as planilla,
        COALESCE(a.alimentacion, 0) as alimentacion,
        COALESCE(i.compras, 0) + COALESCE(p.planilla, 0) as total_gastos
      FROM inventario_mensual i
      FULL OUTER JOIN planilla_mensual p ON i.mes = p.mes
      FULL OUTER JOIN alimentacion_mensual a ON i.mes = a.mes
      ORDER BY 
        CASE COALESCE(i.mes, p.mes, a.mes)
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
    console.error('Error generating trend report:', error);
    res.status(500).json({ error: 'Error al generar reporte de tendencia' });
  }
});

// Reporte de eficiencia de empleados
router.get('/eficiencia-empleados', async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const anioParam = anio || new Date().getFullYear();

    let query = `
      SELECT 
        e.codigo,
        e.nombres,
        e.apellidos,
        e.salario_base,
        COUNT(p.id) as quincenas_trabajadas,
        SUM(p.dias_trabajados) as total_dias,
        SUM(p.he_diurnas + p.he_diurnas_asueto + p.he_extraordinarias + p.he_nocturnas) as total_horas_extras,
        SUM(p.total_recibir) as total_pagado,
        AVG(p.total_recibir) as promedio_quincenal
      FROM ${schema}.empleados e
      LEFT JOIN ${schema}.planilla p ON e.id = p.empleado_id AND p.anio = $1 ${mes ? 'AND p.mes = $2' : ''}
      WHERE e.activo = true
      GROUP BY e.id, e.codigo, e.nombres, e.apellidos, e.salario_base
      ORDER BY total_pagado DESC
    `;

    const params = mes ? [anioParam, mes] : [anioParam];
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error generating employee efficiency report:', error);
    res.status(500).json({ error: 'Error al generar reporte de eficiencia' });
  }
});

// Reporte de productos más consumidos
router.get('/productos-consumo', async (req, res) => {
  try {
    const { mes, anio, limite } = req.query;
    const anioParam = anio || new Date().getFullYear();
    const limiteParam = limite || 20;

    let query = `
      SELECT 
        p.descripcion,
        p.unidad_medida,
        p.categoria,
        SUM(i.consumo) as total_consumo,
        SUM(i.total_consumo) as valor_consumo,
        AVG(i.precio_unitario) as precio_promedio
      FROM ${schema}.inventario i
      JOIN ${schema}.productos p ON i.producto_id = p.id
      WHERE i.anio = $1
    `;
    const params = [anioParam];

    if (mes) {
      params.push(mes);
      query += ` AND i.mes = $${params.length}`;
    }

    query += ` 
      GROUP BY p.id, p.descripcion, p.unidad_medida, p.categoria
      ORDER BY total_consumo DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limiteParam);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error generating product consumption report:', error);
    res.status(500).json({ error: 'Error al generar reporte de consumo' });
  }
});

module.exports = router;