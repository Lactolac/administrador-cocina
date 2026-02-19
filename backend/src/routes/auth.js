const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'cocina-planilla-secret-key-2026';
const SESSION_DURATION = '1h'; // Sesión de 1 hora
const schema = process.env.DB_SCHEMA || 'administradorcocina';

// Login endpoint - soporta AD y usuarios locales
router.post('/login', async (req, res) => {
  try {
    const { username, password, country, loginType } = req.body;
    
    // Si es login local (para usuarios fuera del dominio)
    if (loginType === 'local') {
      return await localLogin(username, password, res);
    }
    
    // Login con AD (por defecto)
    return await adLogin(username, password, country, res);

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Error de autenticación',
      message: 'Error al procesar la solicitud' 
    });
  }
});

// Función para login con AD
async function adLogin(username, password, country, res) {
  try {
    // Call AD authentication API
    const response = await axios.post('https://ad-auth.yes.com.sv/auth', {
      username,
      password,
      country: country || 'sv'
    });

    const { user_data, groups } = response.data;

    // Check if user belongs to Cocina-Admin group
    const isAdmin = groups && groups.includes('Cocina-Admin');
    const hasAccess = isAdmin || (groups && groups.length > 0);

    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'No tiene permisos para acceder a esta aplicación' 
      });
    }

    // Buscar o crear usuario en la base de datos
    const adUsername = user_data.Username || username;
    let userResult = await pool.query(`
      SELECT id, username, nombre, rol, activo 
      FROM ${schema}.usuarios 
      WHERE username = $1
    `, [adUsername]);

    let user;
    if (userResult.rows.length === 0) {
      // Crear usuario nuevo - admin si tiene grupo Cocina-Admin
      const rol = isAdmin ? 'admin' : 'usuario';
      const insertResult = await pool.query(`
        INSERT INTO ${schema}.usuarios (username, password, nombre, rol, activo)
        VALUES ($1, '', $2, $3, true)
        RETURNING id, username, nombre, rol, activo
      `, [adUsername, user_data.Nombre || adUsername, rol]);
      user = insertResult.rows[0];
    } else {
      user = userResult.rows[0];
      // Actualizar rol si cambió
      const newRol = isAdmin ? 'admin' : 'usuario';
      if (user.rol !== newRol) {
        await pool.query(`
          UPDATE ${schema}.usuarios SET rol = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [newRol, user.id]);
        user.rol = newRol;
      }
    }

    // Generate JWT token with 1 hour expiration
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        rol: user.rol
      },
      JWT_SECRET,
      { expiresIn: SESSION_DURATION }
    );

    // Return user data with access token
    res.json({
      success: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        username: user.username,
        rol: user.rol
      },
      groups: groups,
      token: token,
      expiresIn: 3600 // 1 hora en segundos
    });

  } catch (error) {
    console.error('AD Authentication error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos' 
      });
    }

    res.status(500).json({ 
      error: 'Error de autenticación',
      message: 'Error al conectar con el servidor de autenticación' 
    });
  }
}

// Función para login local
async function localLogin(username, password, res) {
  try {
    // Buscar usuario en la base de datos
    const result = await pool.query(`
      SELECT id, username, password, nombre, rol, activo 
      FROM ${schema}.usuarios 
      WHERE username = $1 AND activo = true
    `, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos' 
      });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos' 
      });
    }

    // Generate JWT token with 1 hour expiration
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        rol: user.rol
      },
      JWT_SECRET,
      { expiresIn: SESSION_DURATION }
    );

    // Return user data with access token
    res.json({
      success: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        username: user.username,
        rol: user.rol
      },
      token: token,
      expiresIn: 3600 // 1 hora en segundos
    });

  } catch (error) {
    console.error('Local authentication error:', error);
    res.status(500).json({ 
      error: 'Error de autenticación',
      message: 'Error al procesar la solicitud' 
    });
  }
}

// Verify token endpoint
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ valid: false, message: 'Token expired' });
    }
    return res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Sesión cerrada correctamente' });
});

module.exports = router;
