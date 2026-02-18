const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cocina-planilla-secret-key-2026';
const SESSION_DURATION = '1h'; // Sesión de 1 hora

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password, country } = req.body;
    
    // Call AD authentication API
    const response = await axios.post('https://ad-auth.yes.com.sv/auth', {
      username,
      password,
      country: country || 'sv'
    });

    const { user_data, groups } = response.data;

    // Check if user belongs to Cocina-Admin group
    const hasAccess = groups && groups.includes('Cocina-Admin');

    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'No tiene permisos para acceder a esta aplicación' 
      });
    }

    // Generate JWT token with 1 hour expiration
    const token = jwt.sign(
      {
        username: user_data.Username,
        email: user_data.Email,
        nombre: user_data.Nombre,
        apellido: user_data.Apellido
      },
      JWT_SECRET,
      { expiresIn: SESSION_DURATION }
    );

    // Return user data with access token
    res.json({
      success: true,
      user: {
        nombre: user_data.Nombre,
        apellido: user_data.Apellido,
        email: user_data.Email,
        username: user_data.Username,
        departamento: user_data.Departamento,
        extension: user_data.Extension
      },
      groups: groups,
      token: token,
      expiresIn: 3600 // 1 hora en segundos
    });

  } catch (error) {
    console.error('Authentication error:', error.response?.data || error.message);
    
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
});

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
