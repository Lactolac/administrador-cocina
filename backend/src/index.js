const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Initialize database tables
const { createTables } = require('./models');
createTables()
  .then(() => console.log('Database tables created/checked successfully'))
  .catch(error => console.error('Error initializing tables:', error));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/inventario', require('./routes/inventario'));
app.use('/api/alimentacion', require('./routes/alimentacion'));
app.use('/api/planilla', require('./routes/planilla'));
app.use('/api/empleados', require('./routes/empleados'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
