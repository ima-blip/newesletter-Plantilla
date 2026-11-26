# Documentación de Pruebas — Plataforma Editorial *Atelier Dispatch*
## Pruebas Unitarias, de Renderizado DOM y End-to-End (MVC)

Este documento describe todas las suites de pruebas implementadas en el proyecto, detallando **cómo funcionan**, **qué herramientas utilizan**, **qué valida cada prueba** y **los objetivos esperados** en relación con los requisitos definidos en [`SRS_IEEE830_ATELIER_DISPATCH.md`](SRS_IEEE830_ATELIER_DISPATCH.md) y [`criterios_de_aceptaci_n_gherkin_bdd_requisitos_funcionales_rf_01_a_rf_05.md`](criterios_de_aceptaci_n_gherkin_bdd_requisitos_funcionales_rf_01_a_rf_05.md).

---

## 1. Resumen General de Suites de Prueba

| Archivo de Prueba | Tipo de Prueba | Capa MVC Cubierta | Herramientas / Runtime | Dependencias Externas |
| :--- | :--- | :--- | :--- | :--- |
| [`../test_mvc.cjs`](../test_mvc.cjs) | Unitaria + Integración de Dominio | **Modelos** (`js/models/`) | Node.js + `console.log` / `console.table` | Ninguna |
| [`../test_controllers_views.cjs`](../test_controllers_views.cjs) | Unitaria + Renderizado DOM simulado | **Controladores** (`js/controllers/`) y **Vistas** (`js/views/`) | Node.js (`>= 18`), `node:test`, `node:assert/strict`, `node:vm` | Ninguna |
| [`../test_e2e_browser.py`](../test_e2e_browser.py) | End-to-End (E2E) en navegador real | **Flujo completo** (HTML + CSS + Vistas + Controladores + Modelos) | Python 3 (`unittest`, `http.server`, cliente CDP WebSocket stdlib) + Microsoft Edge Headless | Ninguna (solo Edge instalado) |

---

## 2. Suite 1: Pruebas de Modelos del Dominio ([`test_mvc.cjs`](../test_mvc.cjs))

### 2.1. Herramientas y funcionamiento
- **Runtime:** Node.js (CommonJS).
- **Mecanismo de carga:** Importa con `require()` las clases del dominio (`Rol`, `Usuario`, `BloqueContenido`, `Newsletter`, `Suscripcion`, `PagoSimulado`, `EnvioNewsletter`, `AppStore`) y las asigna al objeto `global` para replicar la carga global del navegador.
- **Ejecución:** Instancia `new AppStore()` (que al no detectar `localStorage` en Node.js inicializa las semillas en memoria mediante `cargarSemillasIniciales()`) y corre la función asíncrona `runTests()`.
- **Interpretación de resultados:** Este script **no utiliza aserciones que lancen error en fallos lógicos**; imprime los resultados en consola y finaliza con código de salida `0` si no hubo excepciones no controladas (o `1` si ocurre algún error en tiempo de ejecución). Por ello, además del código `0`, deben revisarse los valores impresos.

### 2.2. Detalle de pruebas y objetivos esperados

| Prueba / Sección | Qué ejecuta | Objetivo esperado |
| :--- | :--- | :--- |
| **Inicialización de Modelos** | Instancia `AppStore` y consulta `roles`, `usuarios` y `newsletterActual.bloques`. | Verificar la carga correcta de los 3 roles RBAC, los 7 usuarios semilla y los 4 bloques modulares iniciales. |
| **RF-01: Registro y Hash Argon2id** | Llama a `store.registrarUsuario(...)` y luego a `Usuario.verificarPassword(...)` con contraseña válida y contraseña vacía `''`. | El usuario nuevo debe quedar con rol `ROLE_FREEMIUM`, hash con prefijo `$argon2id$...`, verificación `true` para la clave correcta y `false` para cadena vacía. |
| **RF-02: Gating y Visibilidad de Bloques** | Evalúa `b.esVisiblePara(...)` sobre todos los bloques usando `Rol.crearFreemium()` y `Rol.crearMecenasPro()`. | En la tabla impresa, el Bloque 1 (`ABIERTO_TODOS`) debe mostrar `visibleFree: true` y `visiblePro: true`; los Bloques 2, 3 y 4 (`PRO_RESTRICTED`) deben mostrar `visibleFree: false` y `visiblePro: true`. |
| **RF-03: Pasarela Simulada de Pago** | Invoca `PagoSimulado.procesarPago(...)` con tarjeta válida (`4242 4242 4242 4242`) y tarjeta sin fondos (`4000 0000 0000 0002`). | La tarjeta `4242...` debe resolver `exito: true`, `codigoRespuesta: 200` y `estado: 'Exitoso'`. La tarjeta `4000...0002` debe resolver `exito: false`, `codigoRespuesta: 402` y `estado: 'Declinado'`. |
| **RF-04: Generación y Despacho Masivo** | Llama a `EnvioNewsletter.generarVersion(...)` para usuario Freemium y PRO, y ejecuta `EnvioNewsletter.simularLoteEnvioMasivo(...)`. | La versión Freemium debe ser `FREEMIUM_PARCIAL` con `paywallTeaser` y peso `54 KB` (`< 60 KB`); la versión PRO debe ser `PRO_COMPLETO` con `incluyeDatasets: true`. El lote debe reportar latencia `0.84 s` (`< 1.2 s`). |
| **RF-05: KPIs y Métricas** | Invoca `store.obtenerMetricas()`. | Los contadores reflejan el registro previo (`totalSuscriptores: 2183`, `audienciaFreemium: 1841`, `mecenasProActivos: 342`). |

### 2.3. Comando de ejecución
```powershell
node test_mvc.cjs
```

---

## 3. Suite 2: Pruebas Unitarias de Controladores y Renderizado de Vistas ([`test_controllers_views.cjs`](../test_controllers_views.cjs))

### 3.1. Herramientas y funcionamiento
- **Runtime y librerías nativas:** Node.js (`>= 18`) con los módulos estándar `node:test` (`describe`, `it`, `beforeEach`), `node:assert/strict`, `node:fs`, `node:path` y `node:vm`.
- **Aislamiento con `vm`:** La función auxiliar `crearContextoMVC()` construye un entorno JavaScript limpio con implementaciones simuladas (*mocks*) de `window`, `document`, `localStorage`, `navigator.clipboard` y `window.apiService`. Dentro de ese contexto carga en orden los modelos (`js/models/`), los controladores (`js/controllers/`) y las vistas (`js/views/`).
- **Aserciones estrictas:** A diferencia de `test_mvc.cjs`, cada prueba utiliza `assert.equal`, `assert.strictEqual`, `assert.match` y `assert.doesNotMatch`, fallando automáticamente si una condición no se cumple.

### 3.2. Pruebas de Controladores

| Prueba | Controlador / Método | Qué valida | Objetivo esperado |
| :--- | :--- | :--- | :--- |
| **Registro y validación** | `AuthController.handleRegistro()` | Envío con contraseñas distintas y registro válido. | Rechaza contraseñas discordantes indicando `campoError: 'passwordConfirm'` y asigna `ROLE_FREEMIUM` al completar datos válidos. |
| **Aislamiento Sandbox QA** | `AuthController.handleQALogin()` | Conmutación de roles antes y después de autenticar `sandboxadmin@evaluacion.ipvg`. | Retorna `exito: false` fuera del modo Sandbox; permite conmutar roles cuando `esSandboxActivo()` es `true`. |
| **Guardia RBAC (403)** | `AppController.verificarAccesoRuta()` | Acceso a rutas `#consola-audiencias`, `#consola-noticias`, `#consola-paywall` y `#noticia`. | Permite `#noticia` a todos; bloquea las consolas administrativas (`permitido: false`) para Visitante, Freemium (registrando traza `403 Forbidden`) y PRO; permite el acceso solo a `ROLE_ROOT_ADMIN`. |
| **Estado de lectura y Sandbox** | `ArticleController.obtenerEstadoLectura()` | Cálculo de `esPro` según rol real y modo simulado (`setReaderMode`). | `esPro` es estrictamente booleano `false` para Visitante y Freemium, `true` para Mecenas PRO, y responde a `'freemium'` / `'pro'` en Sandbox. |
| **Cupones y Checkout CLP** | `SubscriptionController` (`aplicarCodigoDescuento`, `obtenerPrecios`, `procesarCheckout`) | Aplicación de `ATELIER20` (20% desc.), rechazo `402` y aprobación `200`. | Calcula `Math.round(89900 * 0.8)`; tarjeta `4000...0002` retorna código `402` manteniendo `ROLE_FREEMIUM`; tarjeta `4242...` promueve al usuario a `ROLE_MECENAS_PRO`. |
| **Edición de bloques y política Paywall** | `EditorController` (`conmutarVisibilidadBloque`, `configurarPaywall`) | Cambio de visibilidad de un bloque y configuración de umbral/estilo. | Alterna `bloque.esPremium` de `false` a `true` y persiste `umbralPaywall: 'p5'` y `estiloTransicion: 'corte_seco'`. |

### 3.3. Pruebas de Vistas (Renderizado HTML y Eventos)

| Prueba | Vista / Método | Qué valida | Objetivo esperado |
| :--- | :--- | :--- | :--- |
| **Paywall difuminado en artículo multipárrafo** | `ArticleView.render()` | Lectura de artículo `es_premium: true` (5 párrafos) como usuario Freemium. | Genera `#freemium-paywall-gate`, aplica `.paywall-blur-layer-1`, muestra la tarjeta teaser y `"Debate Exclusivo Comunidad PRO"`, oculta `"Zona PRO Desbloqueada"` y no expone el párrafo final en el HTML. |
| **Truncado de artículos premium cortos** | `ArticleView.render()` | Artículos `es_premium: true` de 1 y 2 párrafos leídos sin membresía PRO. | Ambos casos muestran `#freemium-paywall-gate` y solo exponen la apertura (primera oración o primer párrafo), impidiendo la lectura completa. |
| **Estilo `corte_seco`** | `ArticleView.render()` | Noticia premium cuando `estiloTransicion === 'corte_seco'`. | Renderiza `data-estilo="corte_seco"` y la etiqueta `"Corte Seco"` sin incluir elementos `.paywall-blur-layer-1`. |
| **Artículo abierto sin fuga de Zona PRO** | `ArticleView.render()` | Lectura de artículo con `es_premium: false` como Suscriptor Freemium. | Muestra todo el contenido abierto sin `#freemium-paywall-gate`, pero **no** renderiza `"Zona PRO Desbloqueada"` ni `#agora-comment-input`, manteniendo el Ágora bloqueado. |
| **Acceso irrestricto Mecenas PRO** | `ArticleView.render()` | Lectura del artículo premium autenticado como Mecenas PRO. | Omite `#freemium-paywall-gate`, muestra todos los párrafos, `"Zona PRO Desbloqueada"` y el editor `#agora-comment-input`. |
| **Eventos de conmutador Sandbox** | `ArticleView.attachEvents()` | Simulación de clic sobre `#btn-mode-freemium` y `#btn-mode-pro`. | Invoca `articleController.setReaderMode('freemium' | 'pro')` y `reRenderRutaActual()`. |
| **Navegación RBAC y Vista 403** | `NavbarView.render()`, `AccessDeniedView.render()` | Renderizado de barra superior para Freemium vs. Sandbox Admin y pantalla 403. | Oculta enlaces `consola-audiencias` y `Sandbox QA` para Freemium; los muestra para Sandbox Admin; `AccessDeniedView` exhibe código `403` y la ruta bloqueada. |

### 3.4. Comando de ejecución
```powershell
node --test test_controllers_views.cjs
```

---

## 4. Suite 3: Pruebas End-to-End (E2E) en Navegador Real ([`test_e2e_browser.py`](../test_e2e_browser.py))

### 4.1. Herramientas y funcionamiento
- **Runtime:** Python 3 usando exclusivamente su librería estándar:
  - `unittest` para estructurar y reportar los casos de prueba.
  - `http.server` + `socketserver` + `threading` para servir [`../index.html`](../index.html) y los scripts locales en `127.0.0.1` en un puerto libre.
  - `subprocess` + `tempfile` para iniciar **Microsoft Edge** (`msedge.exe --headless=new`) con un perfil temporal aislado y `--remote-debugging-port`.
  - `_SimpleCDPClient` (implementado con `socket`, `hashlib`, `base64`, `struct` y `json`) para comunicarse con Edge vía **Chrome DevTools Protocol (CDP)** sobre WebSocket (RFC 6455), navegar entre rutas `#hash`, simular formularios/clics y consultar estilos computados (`getComputedStyle`).
- **Limpieza automática:** `tearDownClass()` cierra el socket CDP, finaliza el proceso de Edge, detiene el servidor HTTP y elimina la carpeta temporal del perfil.

### 4.2. Detalle de pruebas y objetivos esperados

| Prueba | Flujo ejecutado en Edge | Objetivo esperado |
| :--- | :--- | :--- |
| **`test_01_visitante_bloqueado_con_difuminado_real_en_noticia`** | Abre `#noticia` como visitante sin sesión (almacenamiento limpio). | `#freemium-paywall-gate` visible; `getComputedStyle` sobre `.paywall-blur-layer-1` contiene `blur(`; `userSelect` es `'none'`; se muestra la tarjeta teaser y `"Debate Exclusivo Comunidad PRO"`; no aparece `"Zona PRO Desbloqueada"`. |
| **`test_02_articulo_abierto_no_expone_zona_pro_a_freemium`** | Abre `#portada-noticias`, hace clic en el artículo público *"La economía de la atención y el retorno al texto"*. | El artículo se lee completo sin `#freemium-paywall-gate`, **no** aparece `"Zona PRO Desbloqueada"` ni `#agora-comment-input`, y sí aparece `"Debate Exclusivo Comunidad PRO"`. |
| **`test_03_registro_freemium_validacion_y_acceso_restringido_403`** | En `#iniciar-sesion` envía contraseñas distintas, luego corrige y registra usuario nuevo; finalmente navega a `#consola-audiencias`. | Primero muestra `#reg-password-error`; tras registrar asigna `Suscriptor Freemium` en `#navbar-user-role-badge`; al intentar entrar a `#consola-audiencias` el guardia RBAC renderiza la vista `403` (*Acceso Denegado*). |
| **`test_04_pasarela_pago_402_vs_200_desbloquea_articulo`** | Inicia sesión como `mateo.berardi@politecnico.it` en `#portal-suscripcion`, aplica `ATELIER20`, envía tarjeta `4000...0002`, luego `4242...` y navega a `#noticia`. | Con `4000...0002` muestra mensaje de fondos insuficientes y conserva `ROLE_FREEMIUM`; con `4242...` promueve en tiempo real a `ROLE_MECENAS_PRO`; en `#noticia` desaparece `#freemium-paywall-gate` y aparecen `"Zona PRO Desbloqueada"` y `#agora-comment-input`. |
| **`test_05_sandbox_y_editor_corte_seco_y_articulo_corto`** | Inicia sesión como `sandboxadmin@evaluacion.ipvg`, configura `corte_seco` vía `EditorController.configurarPaywall`, cambia a modo `freemium` y carga un artículo premium de 1 párrafo. | En `#noticia`, `#freemium-paywall-gate` tiene `data-estilo="corte_seco"`, `0` elementos `.paywall-blur-layer-1`, muestra solo la primera oración y oculta la segunda oración restringida. |

### 4.3. Comando de ejecución y resultado observado
```powershell
python test_e2e_browser.py -v
```
- **Última ejecución registrada:** `Ran 5 tests in 8.117s` — `OK` (5/5 pruebas aprobadas en Microsoft Edge headless).

---

## 5. Estado de Ejecución en el Entorno Actual

- **Python 3.14 + Microsoft Edge Headless (`test_e2e_browser.py`):** Operativo y verificado con **5/5 pruebas aprobadas**.
- **Node.js (`test_mvc.cjs` y `test_controllers_views.cjs`):** Listos para ejecutarse con `node`; requieren tener instalado Node.js (`>= 18`) en el `PATH` del sistema para correr en línea de comandos.
