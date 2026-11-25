/**
 * RUTAS API: NOTICIAS — CRUD COMPLETO
 * Crear, Leer, Actualizar, Eliminar y Publicar noticias.
 * 
 * Endpoints:
 *   GET    /api/noticias              → Listar todas las noticias (con filtros opcionales)
 *   GET    /api/noticias/:id          → Obtener una noticia por ID
 *   POST   /api/noticias              → Crear nueva noticia (borrador)
 *   PUT    /api/noticias/:id          → Actualizar noticia existente
 *   PATCH  /api/noticias/:id/publicar → Publicar una noticia (cambiar estado a 'publicado')
 *   PATCH  /api/noticias/:id/archivar → Archivar una noticia
 *   DELETE /api/noticias/:id          → Eliminar noticia
 *   GET    /api/noticias/stats/resumen → Estadísticas de noticias
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// ─── GET /api/noticias — Listar todas las noticias ──────────────────────────

router.get('/', async (req, res) => {
  try {
    const { estado, categoria, es_premium, busqueda, limite, pagina } = req.query;

    let sql = 'SELECT * FROM noticias WHERE 1=1';
    const params = [];

    // Filtro por estado
    if (estado && ['borrador', 'publicado', 'archivado'].includes(estado)) {
      sql += ' AND estado = ?';
      params.push(estado);
    }

    // Filtro por categoría
    if (categoria) {
      sql += ' AND categoria = ?';
      params.push(categoria);
    }

    // Filtro por premium
    if (es_premium !== undefined) {
      sql += ' AND es_premium = ?';
      params.push(es_premium === 'true' || es_premium === '1' ? 1 : 0);
    }

    // Búsqueda por título o contenido
    if (busqueda) {
      sql += ' AND (titulo LIKE ? OR contenido LIKE ? OR autor_nombre LIKE ?)';
      const term = `%${busqueda}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY created_at DESC';

    // Paginación
    const lim = parseInt(limite) || 50;
    const pag = parseInt(pagina) || 1;
    const offset = (pag - 1) * lim;
    sql += ' LIMIT ? OFFSET ?';
    params.push(lim, offset);

    const [rows] = await pool.execute(sql, params);

    // Contar total para paginación
    let countSql = 'SELECT COUNT(*) as total FROM noticias WHERE 1=1';
    const countParams = [];
    if (estado && ['borrador', 'publicado', 'archivado'].includes(estado)) {
      countSql += ' AND estado = ?';
      countParams.push(estado);
    }
    if (busqueda) {
      countSql += ' AND (titulo LIKE ? OR contenido LIKE ?)';
      const term = `%${busqueda}%`;
      countParams.push(term, term);
    }
    const [countResult] = await pool.execute(countSql, countParams);

    res.json({
      exito: true,
      datos: rows,
      paginacion: {
        total: countResult[0].total,
        pagina: pag,
        limite: lim,
        totalPaginas: Math.ceil(countResult[0].total / lim)
      }
    });
  } catch (error) {
    console.error('Error al listar noticias:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al obtener las noticias.', error: error.message });
  }
});

// ─── GET /api/noticias/stats/resumen — Estadísticas ─────────────────────────

router.get('/stats/resumen', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'publicado' THEN 1 ELSE 0 END) as publicadas,
        SUM(CASE WHEN estado = 'borrador' THEN 1 ELSE 0 END) as borradores,
        SUM(CASE WHEN estado = 'archivado' THEN 1 ELSE 0 END) as archivadas,
        SUM(CASE WHEN es_premium = 1 THEN 1 ELSE 0 END) as premium,
        SUM(CASE WHEN es_premium = 0 THEN 1 ELSE 0 END) as abiertas
      FROM noticias
    `);

    const [categorias] = await pool.execute(`
      SELECT categoria, COUNT(*) as cantidad 
      FROM noticias 
      GROUP BY categoria 
      ORDER BY cantidad DESC
    `);

    res.json({
      exito: true,
      datos: {
        resumen: stats[0],
        categorias
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al obtener estadísticas.', error: error.message });
  }
});

// ─── GET /api/noticias/:id — Obtener una noticia ────────────────────────────

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM noticias WHERE id_noticia = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Noticia no encontrada.' });
    }

    res.json({ exito: true, datos: rows[0] });
  } catch (error) {
    console.error('Error al obtener noticia:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al obtener la noticia.', error: error.message });
  }
});

// ─── POST /api/noticias — Crear nueva noticia ───────────────────────────────

router.post('/', async (req, res) => {
  try {
    const {
      titulo,
      subtitulo,
      contenido,
      extracto,
      imagen_url,
      categoria,
      es_premium,
      estado,
      autor_id,
      autor_nombre
    } = req.body;

    // Validaciones
    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ exito: false, mensaje: 'El título de la noticia es obligatorio.' });
    }
    if (!contenido || !contenido.trim()) {
      return res.status(400).json({ exito: false, mensaje: 'El contenido de la noticia es obligatorio.' });
    }

    const estadoFinal = estado || 'borrador';
    const fechaPublicacion = estadoFinal === 'publicado' ? new Date() : null;

    const [result] = await pool.execute(
      `INSERT INTO noticias (titulo, subtitulo, contenido, extracto, imagen_url, categoria, es_premium, estado, autor_id, autor_nombre, fecha_publicacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo.trim(),
        subtitulo || null,
        contenido.trim(),
        extracto || null,
        imagen_url || null,
        categoria || 'General',
        es_premium ? 1 : 0,
        estadoFinal,
        autor_id || null,
        autor_nombre || null,
        fechaPublicacion
      ]
    );

    // Obtener la noticia recién creada
    const [newRow] = await pool.execute('SELECT * FROM noticias WHERE id_noticia = ?', [result.insertId]);

    res.status(201).json({
      exito: true,
      mensaje: `Noticia "${titulo.trim()}" creada con éxito como ${estadoFinal}.`,
      datos: newRow[0]
    });
  } catch (error) {
    console.error('Error al crear noticia:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al crear la noticia.', error: error.message });
  }
});

// ─── PUT /api/noticias/:id — Actualizar noticia ─────────────────────────────

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      subtitulo,
      contenido,
      extracto,
      imagen_url,
      categoria,
      es_premium,
      estado,
      autor_nombre
    } = req.body;

    // Verificar existencia
    const [existing] = await pool.execute('SELECT * FROM noticias WHERE id_noticia = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Noticia no encontrada.' });
    }

    // Validaciones
    if (titulo !== undefined && !titulo.trim()) {
      return res.status(400).json({ exito: false, mensaje: 'El título no puede estar vacío.' });
    }

    // Determinar si se acaba de publicar
    let fechaPublicacion = existing[0].fecha_publicacion;
    if (estado === 'publicado' && existing[0].estado !== 'publicado') {
      fechaPublicacion = new Date();
    }

    const [result] = await pool.execute(
      `UPDATE noticias SET
        titulo = COALESCE(?, titulo),
        subtitulo = COALESCE(?, subtitulo),
        contenido = COALESCE(?, contenido),
        extracto = COALESCE(?, extracto),
        imagen_url = COALESCE(?, imagen_url),
        categoria = COALESCE(?, categoria),
        es_premium = COALESCE(?, es_premium),
        estado = COALESCE(?, estado),
        autor_nombre = COALESCE(?, autor_nombre),
        fecha_publicacion = ?
      WHERE id_noticia = ?`,
      [
        titulo || null,
        subtitulo !== undefined ? subtitulo : null,
        contenido || null,
        extracto !== undefined ? extracto : null,
        imagen_url !== undefined ? imagen_url : null,
        categoria || null,
        es_premium !== undefined ? (es_premium ? 1 : 0) : null,
        estado || null,
        autor_nombre !== undefined ? autor_nombre : null,
        fechaPublicacion,
        id
      ]
    );

    const [updated] = await pool.execute('SELECT * FROM noticias WHERE id_noticia = ?', [id]);

    res.json({
      exito: true,
      mensaje: `Noticia #${id} actualizada con éxito.`,
      datos: updated[0]
    });
  } catch (error) {
    console.error('Error al actualizar noticia:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al actualizar la noticia.', error: error.message });
  }
});

// ─── PATCH /api/noticias/:id/publicar — Publicar noticia ────────────────────

router.patch('/:id/publicar', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute('SELECT * FROM noticias WHERE id_noticia = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Noticia no encontrada.' });
    }

    if (existing[0].estado === 'publicado') {
      return res.status(400).json({ exito: false, mensaje: 'La noticia ya está publicada.' });
    }

    await pool.execute(
      'UPDATE noticias SET estado = ?, fecha_publicacion = ? WHERE id_noticia = ?',
      ['publicado', new Date(), id]
    );

    const [updated] = await pool.execute('SELECT * FROM noticias WHERE id_noticia = ?', [id]);

    res.json({
      exito: true,
      mensaje: `Noticia "${existing[0].titulo}" publicada con éxito.`,
      datos: updated[0]
    });
  } catch (error) {
    console.error('Error al publicar noticia:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al publicar la noticia.', error: error.message });
  }
});

// ─── PATCH /api/noticias/:id/archivar — Archivar noticia ────────────────────

router.patch('/:id/archivar', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute('SELECT * FROM noticias WHERE id_noticia = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Noticia no encontrada.' });
    }

    await pool.execute('UPDATE noticias SET estado = ? WHERE id_noticia = ?', ['archivado', id]);

    res.json({
      exito: true,
      mensaje: `Noticia "${existing[0].titulo}" archivada con éxito.`
    });
  } catch (error) {
    console.error('Error al archivar noticia:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al archivar la noticia.', error: error.message });
  }
});

// ─── DELETE /api/noticias/:id — Eliminar noticia ────────────────────────────

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute('SELECT * FROM noticias WHERE id_noticia = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Noticia no encontrada.' });
    }

    await pool.execute('DELETE FROM noticias WHERE id_noticia = ?', [id]);

    res.json({
      exito: true,
      mensaje: `Noticia "${existing[0].titulo}" eliminada permanentemente.`
    });
  } catch (error) {
    console.error('Error al eliminar noticia:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al eliminar la noticia.', error: error.message });
  }
});

module.exports = router;
