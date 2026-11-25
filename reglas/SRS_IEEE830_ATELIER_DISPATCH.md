# Especificación de Requisitos de Software (SRS)
## Formato Estándar IEEE 830 — Plataforma Editorial *Atelier Dispatch*

**Versión:** 2.0  
**Fecha:** 25 de noviembre de 2026  
**Estándar de Referencia:** IEEE Std 830-1998  

---

## 1. Introducción

### 1.1. Propósito
El presente documento define la Especificación de Requisitos de Software (SRS) bajo el estándar **IEEE 830** para la plataforma editorial **Atelier Dispatch**. Describe de forma completa y verificable los requisitos funcionales, no funcionales, interfaces externas y estructura de datos del sistema actual, compuesto por una aplicación web SPA bajo arquitectura **Modelo–Vista–Controlador (MVC)**, un backend REST en **Python Django** y una base de datos relacional **MySQL**.

### 1.2. Ámbito del Sistema
**Atelier Dispatch** es una plataforma de publicación digital y boletín editorial con modelo *Freemium / Premium* en **Pesos Chilenos (CLP)**. Permite:
- A lectores visitantes y suscriptores leer la última noticia publicada, enfrentar compuertas de *paywall* progresivo en contenido exclusivo y adquirir membresías **Mecenas PRO** aplicando códigos promocionales o descuentos temporales.
- A administradores editoriales (`ROLE_ROOT_ADMIN`) gestionar el ciclo completo (CRUD) de noticias con previsualización en vivo, editar bloques modulares por noticia, consultar audiencias y trazas en vivo desde MySQL, ajustar precios CLP, definir metas de suscripciones PRO, crear promociones y simular despachos masivos diferenciados.
- A evaluadores QA autorizados (`sandboxadmin@evaluacion.ipvg`) activar el **Modo Sandbox** para conmutar roles y simular tarjetas sin afectar la experiencia de producción/despliegue.

### 1.3. Definiciones, Acrónimos y Abreviaturas
| Término | Definición |
| :--- | :--- |
| **SPA** | *Single Page Application* — Aplicación web de una sola página con enrutamiento por hash (`#`). |
| **MVC** | Patrón arquitectónico Modelo–Vista–Controlador. |
| **RBAC** | *Role-Based Access Control* — Control de acceso basado en roles. |
| **CLP** | Peso Chileno (moneda oficial configurada en la plataforma). |
| **MRR** | *Monthly Recurring Revenue* — Ingreso mensual recurrente. |
| **Paywall** | Compuerta de acceso que restringe contenido exclusivo para suscriptores de pago. |
| **Sandbox QA** | Modo de pruebas oculto por defecto que se habilita únicamente con la cuenta evaluadora autorizada. |
| **SLA** | *Service Level Agreement* — Acuerdo de nivel de servicio de rendimiento. |

### 1.4. Referencias
- Estándar IEEE Std 830-1998 (*IEEE Recommended Practice for Software Requirements Specifications*).
- [DOCUMENTACION_COMPLETA.md](DOCUMENTACION_COMPLETA.md) — Documentación técnica de arquitectura y despliegue.
- [ARQUITECTURA_MVC.md](ARQUITECTURA_MVC.md) — Trazabilidad del patrón MVC.
- [SCRIPT_BASE_DATOS_MYSQL.md](SCRIPT_BASE_DATOS_MYSQL.md) y [database/schema.sql](database/schema.sql) — Esquema SQL de MySQL.

### 1.5. Visión General del Documento
La Sección 2 describe el contexto general del sistema, sus usuarios y restricciones. La Sección 3 detalla los requisitos específicos (interfaces, requisitos funcionales `RF-01` a `RF-06`, rendimiento, seguridad y base de datos). La Sección 4 presenta la matriz de trazabilidad entre requisitos y módulos implementados.

---

## 2. Descripción General

### 2.1. Perspectiva del Producto
El sistema opera en una arquitectura cliente-servidor de tres capas:
1. **Capa de Presentación y Lógica de Cliente (Frontend SPA):** Implementada en HTML5, Tailwind CSS y JavaScript ES6+ bajo patrón MVC (`js/models/`, `js/controllers/`, `js/views/`), con capa de servicio `ApiService.js` capaz de operar en **Modo Online (Django + MySQL)** y **Modo Offline (`localStorage`)**.
2. **Capa de Aplicación / API REST (Backend):** Implementada en **Python Django** (`backend_django/`) con `django-cors-headers` y `bcrypt`, exponiendo endpoints JSON bajo `/api/`.
3. **Capa de Persistencia (Base de Datos):** **MySQL 8.0+ / MariaDB** (`atelier_dispatch`), conectada mediante `PyMySQL` y mapeada con modelos ORM Django (`managed = False`).

### 2.2. Funciones del Producto
- **F1:** Registro, autenticación y control de acceso basado en roles (RBAC).
- **F2:** Activación condicional del Modo Sandbox QA exclusivo para `sandboxadmin@evaluacion.ipvg`.
- **F3:** Lectura de la última noticia publicada (`#noticia`) con paywall progresivo configurable.
- **F4:** Portal de suscripción en CLP con soporte de IVA 19%, códigos de descuento, descuentos temporales y pasarela simulada.
- **F5:** Consola editorial unificada (`#consola-noticias`) con CRUD de noticias, previsualización en vivo/modal y editor modular de bloques con selector de noticias.
- **F6:** Consola de audiencias (`#consola-audiencias`) conectada a MySQL con KPIs, embudo, cohortes CSV y auditoría de trazas.
- **F7:** Consola de envío y metas (`#consola-paywall`) con comparador Freemium/PRO, simulador de despacho masivo, configuración de meta PRO, edición de precios CLP y gestión de descuentos.

### 2.3. Características de los Usuarios
| Actor / Rol | Código RBAC | Capacidades y Nivel Técnico |
| :--- | :--- | :--- |
| **Visitante Anónimo** | `GUEST` | Estado inicial por defecto al abrir la web. Lee portada, noticias abiertas y accede a registro/login y portal de mecenazgo. |
| **Suscriptor Freemium** | `ROLE_FREEMIUM` | Usuario registrado gratuito. Accede a contenido abierto y visualiza el teaser de paywall en artículos PRO. |
| **Mecenas PRO** | `ROLE_MECENAS_PRO` | Suscriptor de pago (mensual o anual en CLP). Acceso total sin paywall, datasets, toolkits y Ágora de comentarios. |
| **Administrador Editorial** | `ROLE_ROOT_ADMIN` | Acceso a las 3 consolas administrativas (`#consola-audiencias`, `#consola-noticias`, `#consola-paywall`). |
| **Evaluador Sandbox QA** | `ROLE_ROOT_ADMIN` (`sandboxadmin@evaluacion.ipvg`) | Cuenta específica que habilita la barra conmutadora de roles, simulador de lectura, chips de tarjetas de prueba y acceso rápido 403. |

### 2.4. Restricciones
- **R1:** Al iniciar la aplicación en entorno de despliegue, ningún elemento de Sandbox debe ser visible ni estar activo.
- **R2:** Todos los precios y métricas monetarias deben expresarse en **Pesos Chilenos (CLP)** con cálculo de IVA 19%.
- **R3:** El backend debe estar desarrollado en **Python Django** conectado a **MySQL** (compatible también con MariaDB en entornos XAMPP/Laragon).
- **R4:** El pie de página debe ser genérico y limpio, acorde a un sitio de demostración.

### 2.5. Suposiciones y Dependencias
- Para el modo Online se requiere **Python 3.10+**, **Django 5.x**, **PyMySQL** y un servidor **MySQL/MariaDB** accesible.
- Si el servidor Django no se encuentra en ejecución, `ApiService.js` asume disponibilidad de `localStorage` en el navegador para operar en modo Offline.

---

## 3. Requisitos Específicos

### 3.1. Interfaces Externas

#### 3.1.1. Interfaz de Usuario
- Diseño responsivo (360 px a 1920 px) con tipografías *Space Grotesk* (interfaz/titulares) y *Newsreader* (lectura editorial).
- Barra de navegación fija superior (`NavbarView`) con visibilidad condicionada por rol RBAC.
- Notificaciones globales tipo *Toast* y modales accesibles para previsualización, progreso de envío y auditoría.

#### 3.1.2. Interfaces de Software y Comunicaciones (API REST Django)
Comunicación HTTP/JSON con CORS habilitado (`http://localhost:8000/api` por defecto):
- `GET /api/status` — Verificación de salud de Django y conexión MySQL (`SELECT 1`).
- `GET / POST /api/noticias`, `GET / PUT / DELETE /api/noticias/<id>`, `PATCH /api/noticias/<id>/publicar`, `PATCH /api/noticias/<id>/archivar`, `GET /api/noticias/stats/resumen`, `GET /api/noticias/ultima-publicada`.
- `GET /api/audiencias` — Consulta de suscriptores, trazas y KPIs en CLP desde MySQL.
- `GET / PUT /api/configuracion/meta-premium`, `GET / PUT /api/configuracion/precios`.
- `GET / POST /api/descuentos`, `PATCH / DELETE /api/descuentos/<id>`.
- `GET /api/usuarios`, `POST /api/usuarios/registro`, `POST /api/usuarios/login`.

### 3.2. Requisitos Funcionales

#### RF-01: Gestión de Usuarios, RBAC y Modo Sandbox Condicional
- **RF-01.1:** El sistema debe iniciar sin sesión activa (`Visitante`) y con el modo Sandbox desactivado.
- **RF-01.2:** El registro de nuevos usuarios debe asignar automáticamente `ROLE_FREEMIUM`, validar coincidencia de contraseñas (mínimo 8 caracteres) y calcular entropía en tiempo real.
- **RF-01.3:** El guardia de rutas (`AppController.verificarAccesoRuta`) debe bloquear con vista **403 Forbidden** (`AccessDeniedView`) y registrar traza forense cuando un usuario sin `ROLE_ROOT_ADMIN` intente acceder a rutas administrativas.
- **RF-01.4:** El modo Sandbox QA debe activarse única y exclusivamente cuando se inicie sesión con el correo `sandboxadmin@evaluacion.ipvg` y contraseña `Evaluacion3`, y desactivarse al cerrar sesión.

#### RF-02: Lectura de Última Noticia Publicada y Paywall Progresivo
- **RF-02.1:** Al navegar a `#noticia` (*Ensayo & Lectura*), el sistema debe consultar la última noticia con estado `publicado` desde MySQL (o `localStorage` en modo offline).
- **RF-02.2:** Si la noticia tiene `es_premium = true` y el lector no posee rol `ROLE_MECENAS_PRO` ni `ROLE_ROOT_ADMIN`, el sistema debe truncar el contenido tras los párrafos iniciales, aplicar difuminado progresivo y mostrar el llamado a la acción en CLP (`$8.990 CLP / mes`).
- **RF-02.3:** Si el lector es `ROLE_MECENAS_PRO` o `ROLE_ROOT_ADMIN`, debe acceder al texto íntegro, recursos descargables y Ágora de comentarios.

#### RF-03: Portal de Suscripción CLP, Descuentos y Pasarela Simulada
- **RF-03.1:** El portal `#portal-suscripcion` debe mostrar los precios dinámicos configurados en CLP (por defecto `$8.990 CLP/mes` y `$89.900 CLP/año`) con desglose de Base Imponible e IVA 19%.
- **RF-03.2:** Si existe un descuento temporal vigente, debe aplicarse automáticamente mostrando el precio original tachado y el porcentaje de rebaja.
- **RF-03.3:** El usuario debe poder ingresar un código promocional (ej. `ATELIER20`) para validar su vigencia y recalcular el monto final antes del pago.
- **RF-03.4:** La pasarela simulada debe aprobar tarjetas válidas (`4242...` -> HTTP 200) promoviendo el rol a `ROLE_MECENAS_PRO`, y rechazar tarjetas sin fondos (`4000...0002` -> HTTP 402) manteniendo el rol original.
- **RF-03.5:** El portal debe mostrar la barra de progreso real de mecenas PRO respecto a la meta configurada.

#### RF-04: Consola de Envío, Meta PRO, Precios CLP y Descuentos (`#consola-paywall`)
- **RF-04.1:** Debe permitir visualizar y modificar en vivo la **Meta de Suscripciones Premium**, persistiendo el valor en MySQL (`configuracion_plataforma`).
- **RF-04.2:** Debe permitir modificar los precios **Mensual (CLP)** y **Anual (CLP)** reflejándose de inmediato en el portal de suscripción.
- **RF-04.3:** Debe permitir crear **Códigos de Descuento** y **Descuentos Temporales** (1% a 90%, con fechas opcionales), así como pausarlos, reactivarlos o eliminarlos.
- **RF-04.4:** Debe mostrar el comparador simultáneo Freemium vs PRO y ejecutar la simulación de envío masivo por lotes con barra de progreso y telemetría.

#### RF-05: Analítica de Audiencia Conectada a MySQL (`#consola-audiencias`)
- **RF-05.1:** Al acceder a `#consola-audiencias` o presionar **Sincronizar MySQL**, el sistema debe consultar `GET /api/audiencias` y calcular KPIs reales (Total Suscriptores, Audiencia Freemium, Mecenas PRO, Tasa de Conversión y MRR en CLP).
- **RF-05.2:** Debe mostrar el embudo de paywall, gráfico de retención semestral con exportación a CSV y directorio filtrable por rol y búsqueda con modal de trazas de auditoría por usuario.

#### RF-06: Consola Editorial Unificada — CRUD de Noticias y Editor de Bloques (`#consola-noticias`)
- **RF-06.1:** En la pestaña **1. Gestión de Noticias (CRUD)**, el administrador debe poder crear, editar, publicar, archivar, eliminar, filtrar por estado y buscar noticias en MySQL/offline.
- **RF-06.2:** El formulario de noticias debe incluir **Previsualización en Vivo** (actualizada por cada tecla) y un **Modal de Previsualización Completa** con botón directo de publicación.
- **RF-06.3:** En la pestaña **2. Editor Modular de Bloques & Paywall**, debe existir un **Selector de Noticia a Editar** que cargue los párrafos de la noticia elegida como bloques modulares, permita conmutar visibilidad Abierto/PRO, configurar umbral/estilo de paywall y guardar los cambios de vuelta en la noticia seleccionada.

### 3.3. Requisitos de Rendimiento (RNF-01)
- **RNF-01.1:** El peso estimado de la plantilla de correo Freemium debe mantenerse por debajo de **60 KB**.
- **RNF-01.2:** El SLA de renderizado y simulación de despacho por lote debe ser inferior a **1.2 segundos**.
- **RNF-01.3:** El tiempo de respuesta de los endpoints REST CRUD en entorno local debe ser inferior a **300 ms**.

### 3.4. Restricciones de Diseño (RNF-02)
- Diseño sin desbordamiento horizontal entre `360px` y `1920px`.
- Uso consistente de tokens cromáticos Material Design 3 definidos en `index.html`.
- Pie de página limpio y genérico propio de un sitio de demostración.

### 3.5. Atributos del Sistema de Software (RNF-03 y RNF-04)
- **Seguridad:** Contraseñas almacenadas con `bcrypt` en Django y hash simulado `Argon2id` en cliente; validación estricta RBAC en controlador y vistas; aislamiento completo del modo Sandbox.
- **Disponibilidad y Tolerancia a Fallos:** Operación dual transparente entre MySQL (vía Django) y `localStorage` cuando el backend no está disponible.
- **Portabilidad:** Uso de `PyMySQL` para compatibilidad sin compiladores C en Windows/Linux, y esquema SQL compatible con MySQL 8.0+ y MariaDB (XAMPP/Laragon) usando `TIMESTAMP NULL DEFAULT NULL`.

### 3.6. Requisitos de Base de Datos Lógica
El esquema relacional `atelier_dispatch` (`utf8mb4_unicode_ci`) consta de **9 tablas**:
1. `roles`
2. `usuarios` (FK `id_rol` -> `roles`)
3. `noticias` (FK `autor_id` -> `usuarios`)
4. `newsletters`
5. `bloques_contenido` (FK `id_newsletter` -> `newsletters`)
6. `suscripciones` (FK `id_usuario` -> `usuarios`, montos en `CLP`)
7. `trazas_auditoria` (FK `id_usuario` -> `usuarios`)
8. `configuracion_plataforma` (meta PRO, precio mensual CLP, precio anual CLP)
9. `descuentos` (códigos promocionales y descuentos temporales)

---

## 4. Matriz de Trazabilidad

| Requisito | Controlador / Servicio Frontend | Vista Frontend | Endpoint Django | Tabla(s) MySQL |
| :--- | :--- | :--- | :--- | :--- |
| **RF-01** | `AuthController`, `AppController`, `AppStore` | `AuthView`, `NavbarView`, `AccessDeniedView` | `/api/usuarios/*` | `roles`, `usuarios`, `trazas_auditoria` |
| **RF-02** | `ArticleController`, `ApiService` | `ArticleView` | `/api/noticias/ultima-publicada` | `noticias` |
| **RF-03** | `SubscriptionController`, `PagoSimulado`, `ApiService` | `SubscriptionView` | `/api/configuracion/precios`, `/api/descuentos` | `suscripciones`, `configuracion_plataforma`, `descuentos` |
| **RF-04** | `AdminController`, `EnvioNewsletter`, `ApiService` | `AdminPaywallView` | `/api/configuracion/*`, `/api/descuentos*` | `configuracion_plataforma`, `descuentos` |
| **RF-05** | `AdminController`, `ApiService` | `AdminAudienciasView` | `/api/audiencias` | `usuarios`, `roles`, `suscripciones`, `trazas_auditoria` |
| **RF-06** | `NoticiasController`, `EditorController`, `ApiService` | `NoticiasAdminView`, `AdminEditorView` | `/api/noticias*` | `noticias`, `newsletters`, `bloques_contenido` |
