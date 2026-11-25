/**
 * SERVIDOR PRINCIPAL — ATELIER DISPATCH BACKEND
 * API REST con Express + MySQL para la plataforma editorial MVC.
 * 
 * Endpoints principales:
 * - /api/noticias      → CRUD completo de noticias (crear, leer, actualizar, eliminar, publicar)
 * - /api/usuarios      → Gestión de usuarios y autenticación
 * - /api/newsletters   → Gestión de newsletters y bloques
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { verificarConexion } = require('./config/database');
const noticiasRoutes = require('./routes/noticias');
const usuariosRoutes = require('./routes/usuarios');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

// CORS: permite requests desde el frontend (index.html abierto como file:// o desde otro puerto)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parseo de JSON y datos de formulario
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend (index.html, js/, etc.)
app.use(express.static(path.join(__dirname, '..')));

// ─── RUTAS API ───────────────────────────────────────────────────────────────

app.use('/api/noticias', noticiasRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Ruta de salud / estado del servidor
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    plataforma: 'Atelier Dispatch',
    version: '1.0.0',
    arquitectura: 'MVC con MySQL',
    timestamp: new Date().toISOString()
  });
});

// Ruta catch-all: sirve index.html para cualquier ruta no-API (SPA)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
});

// ─── MANEJO DE ERRORES GLOBAL ────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  res.status(500).json({
    exito: false,
    mensaje: 'Error interno del servidor.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ─── ARRANQUE DEL SERVIDOR ───────────────────────────────────────────────────

async function iniciar() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  ATELIER DISPATCH — Servidor Backend MVC + MySQL');
  console.log('  Plataforma Editorial Modular Freemium/Premium');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  const dbConectada = await verificarConexion();

  app.listen(PORT, () => {
    console.log('');
    console.log(`🚀 Servidor activo en: http://localhost:${PORT}`);
    console.log(`📡 API REST disponible en: http://localhost:${PORT}/api`);
    console.log(`📰 CRUD Noticias: http://localhost:${PORT}/api/noticias`);
    console.log(`👥 Usuarios: http://localhost:${PORT}/api/usuarios`);
    console.log(`🔍 Estado: http://localhost:${PORT}/api/status`);
    console.log('');
    if (!dbConectada) {
      console.log('⚠️  El servidor está activo pero sin conexión a MySQL.');
      console.log('   Las operaciones con la base de datos fallarán hasta que MySQL esté disponible.');
      console.log('');
    }
  });
}

iniciar();
