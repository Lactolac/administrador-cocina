const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const schema = process.env.DB_SCHEMA || 'administradorcocina';

// Obtener toda la alimentación servida
router.get('/', async (req, res) => {
  try {
    const { mes, anio, descripcion } = req.query;
    let query = `SELECT * FROM ${schema}.alimentacion_servida WHERE 1=1`;
    const params = [];

    if (mes) {
      params.push(mes);
      query += ` AND mes = $${params.length}`;
    }
    if (anio) {
      params.push(anio);
      query += ` AND anio = $${params.length}`;
    }
    if (descripcion) {
      params.push(`%${descripcion}%`);
      query += ` AND descripcion ILIKE $${params.length}`;
    }

    query += ' ORDER BY fecha DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching alimentacion:', error);
    res.status(500).json({ error: 'Error al obtener alimentación' });
  }
});

// Obtener resumen de alimentación por mes
router.get('/resumen', async (req, res) => {
  try {
    const { anio } = req.query;
    const anioParam = anio || new Date().getFullYear();

    const query = `
      SELECT 
        mes,
        anio,
        SUM(desayunos) as total_desayunos,
        SUM(almuerzos) as total_almuerzos,
        SUM(cenas) as total_cenas,
        SUM(refrigerios) as total_refrigerios,
        SUM(total) as total_general,
        COUNT(*) as total_registros
      FROM ${schema}.alimentacion_servida
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
    console.error('Error fetching resumen alimentacion:', error);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
});

// Obtener resumen por área (Administración/Producción)
router.get('/resumen-area', async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const anioParam = anio || new Date().getFullYear();

    let query = `
      SELECT 
        descripcion as area,
        SUM(desayunos) as total_desayunos,
        SUM(almuerzos) as total_almuerzos,
        SUM(cenas) as total_cenas,
        SUM(refrigerios) as total_refrigerios,
        SUM(total) as total_general
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
    console.error('Error fetching resumen area:', error);
    res.status(500).json({ error: 'Error al obtener resumen por área' });
  }
});

// Crear registro de alimentación
router.post('/', async (req, res) => {
  try {
    const {
      fecha, descripcion, desayunos, almuerzos, cenas, refrigerios,
      costo_desayunos, costo_almuerzos, costo_cenas, total, mes, anio
    } = req.body;

    const query = `
      INSERT INTO ${schema}.alimentacion_servida 
      (fecha, descripcion, desayunos, almuerzos, cenas, refrigerios,
       costo_desayunos, costo_almuerzos, costo_cenas, total, mes, anio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await pool.query(query, [
      fecha, descripcion, desayunos, almuerzos, cenas, refrigerios,
      costo_desayunos, costo_almuerzos, costo_cenas, total, mes, anio
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating alimentacion:', error);
    res.status(500).json({ error: 'Error al crear registro de alimentación' });
  }
});

// Actualizar registro de alimentación
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      desayunos, almuerzos, cenas, refrigerios,
      costo_desayunos, costo_almuerzos, costo_cenas, total
    } = req.body;

    const query = `
      UPDATE ${schema}.alimentacion_servida 
      SET desayunos = $1, almuerzos = $2, cenas = $3, refrigerios = $4,
          costo_desayunos = $5, costo_almuerzos = $6, costo_cenas = $7, total = $8
      WHERE id = $9
      RETURNING *
    `;

    const result = await pool.query(query, [
      desayunos, almuerzos, cenas, refrigerios,
      costo_desayunos, costo_almuerzos, costo_cenas, total, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating alimentacion:', error);
    res.status(500).json({ error: 'Error al actualizar alimentación' });
  }
});

// Eliminar registro de alimentación
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM ${schema}.alimentacion_servida WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    res.json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting alimentacion:', error);
    res.status(500).json({ error: 'Error al eliminar alimentación' });
  }
});

module.exports = router;