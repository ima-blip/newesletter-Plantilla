# Documentación Técnica Integral — Atelier Dispatch
## Plataforma Editorial Modular MVC • CRUD de Noticias • Backend Python Django + MySQL

Este documento resume la arquitectura técnica, los módulos implementados y las instrucciones de instalación y despliegue de **Atelier Dispatch**. Para la especificación formal de requisitos bajo el estándar **IEEE 830**, consulta [`SRS_IEEE830_ATELIER_DISPATCH.md`](SRS_IEEE830_ATELIER_DISPATCH.md).

---

## 1. Visión General de la Arquitectura

La plataforma combina un frontend SPA en JavaScript puro bajo el patrón **MVC** con un backend RESTful en **Python Django** conectado a **MySQL / MariaDB**:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND SPA (index.html + js/)                      │
│  Vistas (Views)  ──►  Controladores (Controllers)  ──►  Modelos (Models)│
│  • NoticiasAdminView   • NoticiasController             • AppStore      │
│  • AdminAudienciasView • AdminController                • Usuario/Rol   │
│  • AdminPaywallView    • SubscriptionController         • PagoSimulado  │
│  • ArticleView         • ArticleController                              │
│                                │                                        │
│                                ▼                                        │
│                    SERVICIO (js/services/ApiService.js)                 │
│             Modo Online (fetch) ◄──┴──► Modo Offline (localStorage)     │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTP / JSON (CORS habilitado)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                BACKEND PYTHON DJANGO (backend_django/)                  │
│  • Puerto por defecto: http://localhost:8000/api                        │
│  • Endpoints REST: noticias/urls.py + noticias/views.py                 │
│  • ORM Django (managed = False): noticias/models.py                     │
│  • Driver MySQL: PyMySQL (pymysql.install_as_MySQLdb())                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ TCP/IP :3306 (utf8mb4)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS MYSQL (database/schema.sql)            │
│  • Base de datos: atelier_dispatch (9 tablas)                           │
│  • roles, usuarios, noticias, newsletters, bloques_contenido,           │
│    suscripciones, trazas_auditoria, configuracion_plataforma, descuentos│
└─────────────────────────────────────────────────────────────────────────┘
```

### Modo Dual (Online MySQL / Offline `localStorage`)
El servicio [`ApiService.js`](js/services/ApiService.js) verifica la disponibilidad del servidor Django mediante `GET http://localhost:8000/api/status`:
- **Modo Online (Django + MySQL activo):** Todas las operaciones de noticias, audiencias, metas, precios CLP y descuentos se persisten directamente en MySQL.
- **Modo Offline:** Si el backend no responde, `ApiService` opera de forma transparente sobre `localStorage` con datos semilla precargados.

---

## 2. Funcionalidades Principales Implementadas

1. **Acceso Limpio y Modo Sandbox Restringido (Listo para Deploy):**
   - Al abrir la página, el usuario inicia como **Visitante** (`usuarioActual = null`) sin barras de prueba ni chips de sandbox visibles.
   - El **Modo Sandbox QA** se activa únicamente al iniciar sesión con la cuenta evaluadora **`sandboxadmin@evaluacion.ipvg`** (clave **`Evaluacion3`**), habilitando el conmutador de roles, simulador de paywall en lectura, chips de tarjetas de prueba y acceso rápido 403.
2. **Consola Editorial Unificada (`#consola-noticias`):**
   - **Pestaña 1 — Gestión de Noticias (CRUD):** Crear, editar, publicar, archivar, eliminar, filtrar y buscar noticias, con **Previsualización en Vivo** y **Modal de Previsualización Completa** antes de publicar.
   - **Pestaña 2 — Editor Modular de Bloques & Paywall:** Incluye un **Selector de Noticia a Editar** que divide la noticia seleccionada en bloques, permite marcar bloques Abiertos o Solo PRO, ajustar el umbral/estilo de paywall y guardar los cambios de vuelta en la noticia.
3. **Ensayo & Lectura (`#noticia`):**
   - Carga y renderiza automáticamente la **última noticia publicada** desde MySQL (o `localStorage` offline), aplicando paywall progresivo si `es_premium` está activo.
4. **Audiencias Conectadas a MySQL (`#consola-audiencias`):**
   - Consulta `GET /api/audiencias` en Django para obtener suscriptores reales, roles RBAC, trazas de auditoría y KPIs (incluyendo MRR en **CLP**), con botón **Sincronizar MySQL** y exportador CSV de cohortes.
5. **Envío, Meta PRO, Precios CLP y Descuentos (`#consola-paywall` y `#portal-suscripcion`):**
   - Precios configurados en **Pesos Chilenos (CLP)** (por defecto `$8.990 CLP/mes` y `$89.900 CLP/año` con IVA 19%).
   - Panel para modificar la **Meta de Suscripciones Premium**, editar **Precios CLP**, y crear/pausar/eliminar **Códigos de Descuento** (ej. `ATELIER20`) y **Descuentos Temporales**.
   - El portal de suscripción aplica descuentos temporales automáticamente y permite validar códigos promocionales en el checkout.

---

## 3. Endpoints REST API (`backend_django/noticias/`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Verifica salud de Django y conexión MySQL (`SELECT 1`). |
| `GET` / `POST` | `/api/noticias` | Lista noticias (con filtros) o crea una nueva noticia. |
| `GET` | `/api/noticias/ultima-publicada` | Retorna la última noticia publicada para `#noticia`. |
| `GET` / `PUT` / `DELETE` | `/api/noticias/<id>` | Obtiene, actualiza o elimina una noticia por ID. |
| `PATCH` | `/api/noticias/<id>/publicar` | Publica una noticia y registra `fecha_publicacion`. |
| `PATCH` | `/api/noticias/<id>/archivar` | Archiva una noticia. |
| `GET` | `/api/noticias/stats/resumen` | Conteo agregado de noticias por estado y acceso. |
| `GET` | `/api/audiencias` | Suscriptores, trazas y KPIs reales en CLP desde MySQL. |
| `GET` / `PUT` | `/api/configuracion/meta-premium` | Lee o modifica la meta de suscripciones Mecenas PRO. |
| `GET` / `PUT` | `/api/configuracion/precios` | Lee o modifica los precios mensual y anual en CLP. |
| `GET` / `POST` | `/api/descuentos` | Lista o crea códigos promocionales y descuentos temporales. |
| `PATCH` / `DELETE` | `/api/descuentos/<id>` | Activa/pausa o elimina un descuento. |
| `GET` | `/api/usuarios` | Lista usuarios registrados con su rol RBAC. |
| `POST` | `/api/usuarios/registro` | Registra usuario nuevo con `bcrypt` y `ROLE_FREEMIUM`. |
| `POST` | `/api/usuarios/login` | Autentica usuario contra MySQL. |

---

## 4. Guía Rápida de Puesta en Marcha

1. **Base de datos MySQL / MariaDB:**
   - Abre DBeaver, MySQL Workbench o consola y ejecuta completo [`database/schema.sql`](database/schema.sql) (en DBeaver usa `Alt + X`). El script completo también está en [`SCRIPT_BASE_DATOS_MYSQL.md`](SCRIPT_BASE_DATOS_MYSQL.md).
2. **Credenciales Django:**
   - Configura [`backend_django/.env`](backend_django/.env) con `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST` y `DB_PORT`.
3. **Levantar Django:**
   ```powershell
   cd backend_django
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python manage.py runserver 8000
   ```
4. **Verificar:**
   - `http://localhost:8000/api/status` debe responder `"estado": "activo"`.
   - Abre `index.html` en tu navegador. Para habilitar las herramientas de evaluación Sandbox QA, inicia sesión en `#iniciar-sesion` con `sandboxadmin@evaluacion.ipvg` / `Evaluacion3`.
