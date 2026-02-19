const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const schema = process.env.DB_SCHEMA || 'administradorcocina';

// Obtener todo el inventario
router.get('/', async (req, res) => {
  try {
    const { mes, anio, categoria, proveedor } = req.query;
    let query = `
      SELECT i.*, p.descripcion, p.unidad_medida, p.categoria, p.proveedor
      FROM ${schema}.inventario i
      JOIN ${schema}.productos p ON i.producto_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (mes) {
      params.push(mes.toUpperCase());
      query += ` AND UPPER(i.mes) = $${params.length}`;
    }
    if (anio) {
      params.push(anio);
      query += ` AND i.anio = $${params.length}`;
    }
    if (categoria) {
      params.push(categoria);
      query += ` AND p.categoria = $${params.length}`;
    }
    if (proveedor) {
      params.push(proveedor);
      query += ` AND p.proveedor = $${params.length}`;
    }

    query += ' ORDER BY p.proveedor, i.fecha DESC, p.descripcion';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventario:', error);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

// Obtener resumen de inventario por mes
router.get('/resumen', async (req, res) => {
  try {
    const { anio } = req.query;
    const anioParam = anio || new Date().getFullYear();

    const query = `
      SELECT 
        mes,
        anio,
        SUM(COALESCE(total_inventario, 0)) as costo_total,
        COUNT(*) as total_productos
      FROM ${schema}.inventario
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
    console.error('Error fetching resumen:', error);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
});

// Crear registro de inventario
router.post('/', async (req, res) => {
  try {
    const {
      producto_id, fecha, inv_inicial, inv_final, precio_unitario, 
      total_inventario, mes, anio
    } = req.body;

    const query = `
      INSERT INTO ${schema}.inventario 
      (producto_id, fecha, inv_inicial, inv_final, precio_unitario,
       total_inventario, mes, anio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await pool.query(query, [
      producto_id, fecha, inv_inicial, inv_final, precio_unitario,
      total_inventario, mes, anio
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating inventario:', error);
    res.status(500).json({ error: 'Error al crear registro de inventario' });
  }
});

// Actualizar registro de inventario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      inv_inicial, inv_final, precio_unitario, total_inventario
    } = req.body;

    const query = `
      UPDATE ${schema}.inventario 
      SET inv_inicial = $1, inv_final = $2, precio_unitario = $3,
          total_inventario = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const result = await pool.query(query, [
      inv_inicial, inv_final, precio_unitario, total_inventario, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating inventario:', error);
    res.status(500).json({ error: 'Error al actualizar inventario' });
  }
});

// Eliminar registro de inventario
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM ${schema}.inventario WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    res.json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting inventario:', error);
    res.status(500).json({ error: 'Error al eliminar inventario' });
  }
});

module.exports = router;
