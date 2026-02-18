const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const schema = process.env.DB_SCHEMA || 'administradorcocina';

// Obtener todos los empleados
router.get('/', async (req, res) => {
  try {
    const { activo } = req.query;
    let query = `SELECT * FROM ${schema}.empleados WHERE 1=1`;
    const params = [];

    if (activo !== undefined) {
      params.push(activo === 'true');
      query += ` AND activo = $${params.length}`;
    }

    query += ' ORDER BY apellidos, nombres';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching empleados:', error);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});

// Obtener un empleado por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM ${schema}.empleados WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching empleado:', error);
    res.status(500).json({ error: 'Error al obtener empleado' });
  }
});

// Crear empleado
router.post('/', async (req, res) => {
  try {
    const { codigo, nombres, apellidos, salario_base, activo } = req.body;

    const query = `
      INSERT INTO ${schema}.empleados (codigo, nombres, apellidos, salario_base, activo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [codigo, nombres, apellidos, salario_base, activo ?? true]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating empleado:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El código de empleado ya existe' });
    }
    res.status(500).json({ error: 'Error al crear empleado' });
  }
});

// Actualizar empleado
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombres, apellidos, salario_base, activo } = req.body;

    const query = `
      UPDATE ${schema}.empleados 
      SET codigo = $1, nombres = $2, apellidos = $3, salario_base = $4, activo = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const result = await pool.query(query, [codigo, nombres, apellidos, salario_base, activo, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating empleado:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El código de empleado ya existe' });
    }
    res.status(500).json({ error: 'Error al actualizar empleado' });
  }
});

// Eliminar empleado
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM ${schema}.empleados WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.json({ message: 'Empleado eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting empleado:', error);
    res.status(500).json({ error: 'Error al eliminar empleado' });
  }
});

module.exports = router;