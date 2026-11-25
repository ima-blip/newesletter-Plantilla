# Script SQL Completo para MySQL — Atelier Dispatch

Este documento contiene el script SQL completo listo para copiar y ejecutar en **MySQL 8.0+** (MySQL Workbench, DBeaver, phpMyAdmin o consola `mysql`). También se encuentra guardado como archivo ejecutable en [`database/schema.sql`](database/schema.sql).

---

## Cómo ejecutar el script

### Opción A: Desde consola MySQL
```bash
mysql -u root -p < database/schema.sql
```

### Opción B: Desde MySQL Workbench / DBeaver
1. Copia todo el bloque SQL de abajo.
2. Pégalo en una nueva pestaña de consulta (*Query Tab*).
3. Ejecuta el script completo (`Ctrl + Shift + Enter` en Workbench).

---

## Script SQL (`atelier_dispatch`)

```sql
-- =============================================================================
-- ATELIER DISPATCH — ESQUEMA DE BASE DE DATOS MYSQL
-- Plataforma Modular Freemium/Premium — Arquitectura MVC + Python Django
-- Precios configurados en Pesos Chilenos (CLP)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS atelier_dispatch
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE atelier_dispatch;

-- -----------------------------------------------------------------------------
-- 1. TABLA DE ROLES (RBAC) — RF-01
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id_rol        INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100)   NOT NULL,
  codigo        VARCHAR(50)    NOT NULL UNIQUE,
  permisos      JSON           DEFAULT NULL,
  created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO roles (nombre, codigo, permisos) VALUES
  ('Suscriptor Freemium', 'ROLE_FREEMIUM', '["leer_articulos_abiertos","recibir_boletin_parcial","acceso_sandbox_qa"]'),
  ('Mecenas PRO', 'ROLE_MECENAS_PRO', '["leer_articulos_abiertos","leer_articulos_pro","descargar_datasets","participar_agora_comentarios","recibir_boletin_completo","feed_rss_privado"]'),
  ('Administrador Editorial', 'ROLE_ROOT_ADMIN', '["*","gestionar_boletines","crear_bloques","marcar_bloques_premium","configurar_paywall","consultar_estadisticas","auditar_usuarios","enviar_boletin_masivo","gestionar_noticias"]')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- -----------------------------------------------------------------------------
-- 2. TABLA DE USUARIOS — RF-01 y Audiencias RF-05
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario       INT AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(200)   NOT NULL,
  correo           VARCHAR(255)   NOT NULL UNIQUE,
  contrasena_hash  VARCHAR(500)   NOT NULL,
  estado           ENUM('activo','suspendido') DEFAULT 'activo',
  id_rol           INT            NOT NULL DEFAULT 1,
  open_rate        DECIMAL(5,2)   DEFAULT 45.00,
  ultimo_boletin   VARCHAR(200)   DEFAULT NULL,
  fecha_registro   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Usuarios semilla para QA / BDD
INSERT INTO usuarios (nombre, correo, contrasena_hash, estado, id_rol, open_rate, ultimo_boletin) VALUES
  ('Mateo Berardi',       'mateo.berardi@politecnico.it',       '$argon2id$v=19$m=65536,t=3,p=4$seed1$demo', 'activo', 1, 64.00, 'Nº 148 // Rebotó en Paywall'),
  ('Helena Sampedro',     'helena.sampedro@editorial-libre.org','$argon2id$v=19$m=65536,t=3,p=4$seed2$demo', 'activo', 2, 92.00, 'Nº 148 // Lectura Completa PRO'),
  ('Carlos Domínguez',    'carlos.dominguez@atelier.press',     '$argon2id$v=19$m=65536,t=3,p=4$seed3$demo', 'activo', 3, 100.00, 'Nº 149 // Autor Editor'),
  ('Julián T. Valdés',    'jvaldes@universitas.edu',            '$argon2id$v=19$m=65536,t=3,p=4$seed4$demo', 'activo', 1, 42.00, 'Nº 148 // Rebotó en Paywall'),
  ('Laura Vidal',         'laura.vidal@estudio.es',             '$argon2id$v=19$m=65536,t=3,p=4$seed5$demo', 'activo', 1, 58.00, 'Nº 148 // Leído (Freemium)'),
  ('Beatriz De la Serna', 'bdelaserna@disenso.cat',             '$argon2id$v=19$m=65536,t=3,p=4$seed6$demo', 'activo', 2, 88.00, 'Nº 148 // Descargó Dataset'),
  ('Sandbox Admin',       'sandboxadmin@evaluacion.ipvg',       '$argon2id$v=19$m=65536,t=3,p=4$seed7$Evaluacion3', 'activo', 3, 100.00, 'Cuenta Evaluador Sandbox')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- -----------------------------------------------------------------------------
-- 3. TABLA DE NOTICIAS (CRUD COMPLETO + ENSAYO & LECTURA)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS noticias (
  id_noticia        INT AUTO_INCREMENT PRIMARY KEY,
  titulo            VARCHAR(500)   NOT NULL,
  subtitulo         VARCHAR(500)   DEFAULT NULL,
  contenido         LONGTEXT       NOT NULL,
  extracto          TEXT           DEFAULT NULL,
  imagen_url        VARCHAR(1000)  DEFAULT NULL,
  categoria         VARCHAR(100)   DEFAULT 'General',
  es_premium        TINYINT(1)     DEFAULT 0,
  estado            ENUM('borrador','publicado','archivado') DEFAULT 'borrador',
  autor_id          INT            DEFAULT NULL,
  autor_nombre      VARCHAR(200)   DEFAULT NULL,
  fecha_publicacion TIMESTAMP      NULL DEFAULT NULL,
  created_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Noticias semilla de ejemplo
INSERT INTO noticias (titulo, subtitulo, contenido, extracto, categoria, es_premium, estado, autor_id, autor_nombre, fecha_publicacion) VALUES
(
  'La economía de la atención y el retorno al texto',
  'Tendencias de IA Generativa & Estrategia Digital',
  'Hemos aceptado con una docilidad alarmante que el pensamiento debe sincronizarse con los impulsos nerviosos de un feed algorítmico. Durante la última década, las interfaces no han sido diseñadas para expandir la comprensión del sujeto contemporáneo, sino para drenar metódicamente su capacidad de sostener una sola idea compleja durante más de cuatro minutos seguidos.\n\nEl diseño de la persuasión —heredero bastardo del conductismo skinneriano y afinado en los laboratorios de Silicon Valley— no busca informar ni suscitar deleite intelectual; su único vector de optimización es la permanencia desasosegada.',
  'Las tensiones estructurales de cómputo, liquidez y mercantilización del clic frente a la resistencia del texto reposado.',
  'Crítica Cultural',
  0,
  'publicado',
  3,
  'Carlos Domínguez',
  NOW()
),
(
  'El coste computacional real de los modelos fundacionales',
  'Desglose técnico de clusters de GPU e inferencia',
  'En los datos internos del informe de audiencia de septiembre, se percibe una correlación directa entre el abandono de plataformas centralizadas y la adhesión al boletín monográfico. Los lectores que sostienen este espacio no buscan primicias de gabinete de prensa ni notas prefabricadas.\n\nLa desintermediación algorítmica exige un pacto directo de mecenazgo cultural.',
  'Un desglose pormenorizado del gasto en clusters de aceleración, latencia de inferencia y la viabilidad unitaria de los grandes modelos.',
  'Análisis Técnico',
  1,
  'publicado',
  3,
  'Carlos Domínguez',
  NOW()
),
(
  'Toolkit de Auditoría de Modelos v2.4 disponible',
  'Material confidencial para miembros mecenas',
  'Descarga el script de benchmark reproducible en PyTorch, el cuaderno de Jupyter con los pesos crudos y la matriz de cálculo en formato SQLite. Este kit completo permite reproducir los hallazgos del Dossier 149 sobre costos de inferencia marginal.',
  'Scripts, notebooks y datasets descargables para mecenas PRO.',
  'Recursos PRO',
  1,
  'publicado',
  3,
  'Carlos Domínguez',
  NOW()
);

-- -----------------------------------------------------------------------------
-- 4. TABLA DE NEWSLETTERS — RF-02
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletters (
  id_newsletter     INT AUTO_INCREMENT PRIMARY KEY,
  numero_edicion    INT            NOT NULL,
  titulo            VARCHAR(500)   NOT NULL,
  subtitulo         VARCHAR(500)   DEFAULT NULL,
  descripcion       TEXT           DEFAULT NULL,
  autor_principal   VARCHAR(200)   DEFAULT NULL,
  estado            ENUM('borrador','programado','publicado') DEFAULT 'borrador',
  umbral_paywall    VARCHAR(20)    DEFAULT 'p3',
  estilo_transicion VARCHAR(50)    DEFAULT 'difuminado',
  created_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 5. TABLA DE BLOQUES DE CONTENIDO — RF-02
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bloques_contenido (
  id_bloque         INT AUTO_INCREMENT PRIMARY KEY,
  id_newsletter     INT            NOT NULL,
  titulo            VARCHAR(500)   NOT NULL,
  subtitulo         VARCHAR(500)   DEFAULT NULL,
  contenido         LONGTEXT       DEFAULT NULL,
  es_premium        TINYINT(1)     DEFAULT 0,
  tipo              VARCHAR(100)   DEFAULT 'texto',
  orden             INT            DEFAULT 1,
  recursos_adjuntos JSON           DEFAULT NULL,
  created_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_newsletter) REFERENCES newsletters(id_newsletter) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 6. TABLA DE SUSCRIPCIONES (EN CLP) — RF-03
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suscripciones (
  id_suscripcion   INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario       INT            NOT NULL,
  tipo             ENUM('Mensual','Anual') DEFAULT 'Anual',
  estado           ENUM('Activa','Cancelada') DEFAULT 'Activa',
  monto            DECIMAL(12,0)  DEFAULT 89900,
  moneda           VARCHAR(10)    DEFAULT 'CLP',
  fecha_inicio     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  fecha_renovacion TIMESTAMP      NULL DEFAULT NULL,
  created_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Suscripciones semilla en CLP
INSERT INTO suscripciones (id_suscripcion, id_usuario, tipo, estado, monto, moneda) VALUES
  (1, 2, 'Anual', 'Activa', 89900, 'CLP'),
  (2, 6, 'Mensual', 'Activa', 8990, 'CLP')
ON DUPLICATE KEY UPDATE estado = VALUES(estado);

-- -----------------------------------------------------------------------------
-- 7. TABLA DE TRAZAS DE AUDITORÍA — RF-05 Escenario 5.2
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trazas_auditoria (
  id_traza        INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT            NOT NULL,
  evento          TEXT           NOT NULL,
  ip_simulada     VARCHAR(50)    DEFAULT '192.168.1.1',
  created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Trazas semilla para Julián T. Valdés
INSERT INTO trazas_auditoria (id_usuario, evento, ip_simulada, created_at) VALUES
  (4, 'Inicio de sesión exitoso (Freemium)', '190.22.45.101', '2026-11-14 18:22:10'),
  (4, 'Lectura Despacho Nº 148: Párrafos 1 a 3 leídos', '190.22.45.101', '2026-11-14 18:24:35'),
  (4, 'Colisión con Paywall Teaser en párrafo 3 (Bloque 02 PRO)', '190.22.45.101', '2026-11-14 18:25:02'),
  (4, 'Clic en CTA: Unirme como Mecenas (Rebotó antes de pagar)', '190.22.45.101', '2026-11-14 18:25:40');

-- -----------------------------------------------------------------------------
-- 8. TABLA DE CONFIGURACIÓN DE PLATAFORMA (META PRO Y PRECIOS CLP)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS configuracion_plataforma (
  clave         VARCHAR(100) PRIMARY KEY,
  valor         VARCHAR(500) NOT NULL,
  descripcion   VARCHAR(500) DEFAULT NULL,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO configuracion_plataforma (clave, valor, descripcion) VALUES
  ('meta_suscripciones_premium', '500', 'Meta objetivo de suscripciones Mecenas PRO'),
  ('precio_mensual_clp', '8990', 'Precio mensual Mecenas PRO en pesos chilenos (CLP)'),
  ('precio_anual_clp', '89900', 'Precio anual Mecenas PRO en pesos chilenos (CLP)')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);

-- -----------------------------------------------------------------------------
-- 9. TABLA DE DESCUENTOS Y CÓDIGOS PROMOCIONALES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS descuentos (
  id_descuento         INT AUTO_INCREMENT PRIMARY KEY,
  tipo                 ENUM('codigo','temporal') NOT NULL DEFAULT 'codigo',
  codigo               VARCHAR(50)    DEFAULT NULL UNIQUE,
  nombre               VARCHAR(200)   NOT NULL,
  porcentaje_descuento INT            NOT NULL,
  fecha_inicio         TIMESTAMP      NULL DEFAULT NULL,
  fecha_fin            TIMESTAMP      NULL DEFAULT NULL,
  activo               TINYINT(1)     DEFAULT 1,
  created_at           TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO descuentos (tipo, codigo, nombre, porcentaje_descuento, fecha_inicio, fecha_fin, activo) VALUES
  ('codigo', 'ATELIER20', 'Bienvenida Mecenas 20%', 20, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
```
