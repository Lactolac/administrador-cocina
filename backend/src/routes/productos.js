const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const schema = process.env.DB_SCHEMA || 'administradorcocina';

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;
    let query = `SELECT * FROM ${schema}.productos WHERE 1=1`;
    const params = [];

    if (categoria) {
      params.push(`%${categoria}%`);
      query += ` AND categoria ILIKE $${params.length}`;
    }

    query += ' ORDER BY descripcion';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Obtener categorías únicas
router.get('/categorias', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT categoria FROM ${schema}.productos WHERE categoria IS NOT NULL ORDER BY categoria`
    );
    res.json(result.rows.map(row => row.categoria));
  } catch (error) {
    console.error('Error fetching categorias:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM ${schema}.productos WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Crear producto
router.post('/', async (req, res) => {
  try {
    const { descripcion, unidad_medida, precio_unitario, categoria } = req.body;

    const query = `
      INSERT INTO ${schema}.productos (descripcion, unidad_medida, precio_unitario, categoria)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [descripcion, unidad_medida, precio_unitario, categoria]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, unidad_medida, precio_unitario, categoria } = req.body;

    const query = `
      UPDATE ${schema}.productos 
      SET descripcion = $1, unidad_medida = $2, precio_unitario = $3, categoria = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const result = await pool.query(query, [descripcion, unidad_medida, precio_unitario, categoria, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM ${schema}.productos WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;