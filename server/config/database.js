/**
 * CONFIGURACIÓN DE CONEXIÓN A MYSQL
 * Pool de conexiones con mysql2/promise para operaciones asíncronas.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306', 10),
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'atelier_dispatch',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Verificación de conexión al iniciar
async function verificarConexion() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente.');
    console.log(`   Base de datos: ${process.env.DB_NAME || 'atelier_dispatch'}`);
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a MySQL:', error.message);
    console.error('   Verifica que MySQL esté ejecutándose y que las credenciales en .env sean correctas.');
    return false;
  }
}

module.exports = { pool, verificarConexion };
