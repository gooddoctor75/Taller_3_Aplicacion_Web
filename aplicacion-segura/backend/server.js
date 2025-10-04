// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const db = require('./database/database'); // Conexión a la base de datos SQLite

const app = express();
const PORT = process.env.PORT || 3000;

// ============================
// CONFIGURACIÓN DE CORS
// ============================
// Fija aquí el mismo origen que uses en el frontend (con npx serve -l 5000)
const FRONTEND_ORIGIN = 'http://localhost:5000';

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} Origin:${req.headers.origin || 'N/A'}`);
  next();
});

app.use(cors({
  origin: FRONTEND_ORIGIN,   // Origen EXACTO permitido
  credentials: true,         // Permite cookies
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// ============================
// MIDDLEWARES DE SEGURIDAD Y PARSEO
// ============================
app.use(helmet({ contentSecurityPolicy: false })); // Desactiva CSP en dev para evitar bloqueos
app.use(express.json());
app.use(cookieParser());

// ============================
// RUTAS
// ============================
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Ruta simple de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de la aplicación segura funcionando correctamente.' });
});

// ============================
// INICIO DEL SERVIDOR
// ============================
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
