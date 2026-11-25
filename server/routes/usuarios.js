/**
 * RUTAS API: USUARIOS
 * Gestión de usuarios, autenticación y roles RBAC.
 * 
 * Endpoints:
 *   GET    /api/usuarios          → Listar usuarios
 *   POST   /api/usuarios/registro → Registrar nuevo usuario
 *   POST   /api/usuarios/login    → Iniciar sesión
 *   GET    /api/usuarios/:id      → Obtener usuario por ID
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

// ─── GET /api/usuarios — Listar todos los usuarios ─────────────────────────

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT u.id_usuario, u.nombre, u.correo, u.estado, u.open_rate, u.ultimo_boletin, 
             u.fecha_registro, r.nombre as rol_nombre, r.codigo as rol_codigo
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id_rol
      ORDER BY u.id_usuario ASC
    `);

    res.json({ exito: true, datos: rows });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al obtener usuarios.', error: error.message });
  }
});

// ─── POST /api/usuarios/registro — Registrar nuevo usuario ──────────────────

router.post('/registro', async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ exito: false, mensaje: 'Nombre, correo y contraseña son obligatorios.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ exito: false, mensaje: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    // Verificar unicidad del correo
    const [existing] = await pool.execute('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ exito: false, mensaje: 'El correo electrónico ya se encuentra registrado.' });
    }

    // Hash seguro con bcrypt
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, correo, contrasena_hash, estado, id_rol) VALUES (?, ?, ?, ?, ?)',
      [nombre.trim(), correo.trim().toLowerCase(), hash, 'activo', 1]
    );

    const [newUser] = await pool.execute(`
      SELECT u.id_usuario, u.nombre, u.correo, u.estado, u.fecha_registro,
             r.nombre as rol_nombre, r.codigo as rol_codigo
      FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = ?
    `, [result.insertId]);

    res.status(201).json({
      exito: true,
      mensaje: 'Cuenta activada con rol Freemium. ¡Bienvenido a Atelier Dispatch!',
      datos: newUser[0]
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al registrar el usuario.', error: error.message });
  }
});

// ─── POST /api/usuarios/login — Iniciar sesión ─────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ exito: false, mensaje: 'Correo y contraseña son obligatorios.' });
    }

    const [rows] = await pool.execute(`
      SELECT u.*, r.nombre as rol_nombre, r.codigo as rol_codigo, r.permisos as rol_permisos
      FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol
      WHERE u.correo = ?
    `, [correo.trim().toLowerCase()]);

    if (rows.length === 0) {
      return res.status(401).json({ exito: false, mensaje: 'No existe una cuenta registrada con este correo electrónico.' });
    }

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.contrasena_hash);

    if (!passwordValida) {
      return res.status(401).json({ exito: false, mensaje: 'Contraseña incorrecta. Por favor verifica tus credenciales.' });
    }

    // Registrar traza de auditoría
    await pool.execute(
      'INSERT INTO trazas_auditoria (id_usuario, evento, ip_simulada) VALUES (?, ?, ?)',
      [usuario.id_usuario, 'Inicio de sesión exitoso (RNF-03 validado)', '192.168.1.' + Math.floor(Math.random() * 254 + 1)]
    );

    res.json({
      exito: true,
      mensaje: `Bienvenido de nuevo, ${usuario.nombre}. Sesión activa con rol: ${usuario.rol_nombre}.`,
      datos: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        estado: usuario.estado,
        rol_nombre: usuario.rol_nombre,
        rol_codigo: usuario.rol_codigo,
        rol_permisos: JSON.parse(usuario.rol_permisos || '[]')
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al procesar el inicio de sesión.', error: error.message });
  }
});

// ─── GET /api/usuarios/:id — Obtener usuario por ID ─────────────────────────

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT u.id_usuario, u.nombre, u.correo, u.estado, u.open_rate, u.ultimo_boletin,
             u.fecha_registro, r.nombre as rol_nombre, r.codigo as rol_codigo
      FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado.' });
    }

    // Obtener trazas de auditoría
    const [trazas] = await pool.execute(
      'SELECT * FROM trazas_auditoria WHERE id_usuario = ? ORDER BY created_at DESC LIMIT 20',
      [req.params.id]
    );

    res.json({
      exito: true,
      datos: { ...rows[0], trazas }
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al obtener el usuario.', error: error.message });
  }
});

module.exports = router;
