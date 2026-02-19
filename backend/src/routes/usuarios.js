const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const schema = process.env.DB_SCHEMA || 'administradorcocina';
const JWT_SECRET = process.env.JWT_SECRET || 'cocina-planilla-secret-key-2026';

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware para verificar si es admin
const isAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// Obtener todos los usuarios (solo admin)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, nombre, rol, activo, created_at, updated_at 
      FROM ${schema}.usuarios 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Obtener un usuario por ID (solo admin)
router.get('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT id, username, nombre, rol, activo, created_at, updated_at 
      FROM ${schema}.usuarios 
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// Crear nuevo usuario (solo admin)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { username, password, nombre, rol } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await pool.query(`
      SELECT id FROM ${schema}.usuarios WHERE username = $1
    `, [username]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(`
      INSERT INTO ${schema}.usuarios (username, password, nombre, rol, activo)
      VALUES ($1, $2, $3, $4, true)
      RETURNING id, username, nombre, rol, activo, created_at
    `, [username, hashedPassword, nombre || username, rol || 'usuario']);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Actualizar usuario (solo admin)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, nombre, rol, activo } = req.body;

    let query, params;
    
    if (password) {
      // Si se proporciona nueva contraseña, encriptarla
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `
        UPDATE ${schema}.usuarios 
        SET username = $1, password = $2, nombre = $3, rol = $4, activo = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING id, username, nombre, rol, activo, created_at, updated_at
      `;
      params = [username, hashedPassword, nombre, rol, activo, id];
    } else {
      // Si no hay nueva contraseña, no actualizarla
      query = `
        UPDATE ${schema}.usuarios 
        SET username = $1, nombre = $2, rol = $3, activo = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING id, username, nombre, rol, activo, created_at, updated_at
      `;
      params = [username, nombre, rol, activo, id];
    }

    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
});

// Eliminar usuario (solo admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // No permitir eliminar el propio usuario
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query(`
      DELETE FROM ${schema}.usuarios WHERE id = $1 RETURNING id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
});

// Cambiar contraseña (usuario autenticado)
router.put('/:id/password', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Solo el propio usuario o un admin puede cambiar la contraseña
    if (req.user.id !== parseInt(id) && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Obtener usuario actual
    const userResult = await pool.query(`
      SELECT password FROM ${schema}.usuarios WHERE id = $1
    `, [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Si no es admin, verificar contraseña actual
    if (req.user.rol !== 'admin') {
      const validPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(`
      UPDATE ${schema}.usuarios 
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [hashedPassword, id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Error updating password' });
  }
});

module.exports = router;
