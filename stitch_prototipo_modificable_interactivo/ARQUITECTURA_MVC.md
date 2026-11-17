# Plataforma Atelier Dispatch — Arquitectura Modelo–Vista–Controlador (MVC)
## Boletín Modular con Paywall Progresivo y Despacho Diferenciado

Este documento describe la arquitectura, diseño técnico y trazabilidad metodológica de la plataforma **Atelier Dispatch**, implementada estrictamente bajo el patrón **Modelo–Vista–Controlador (MVC)**, cumpliendo con los requisitos funcionales **RF-01 a RF-05**, no funcionales **RNF-01 a RNF-03** y los criterios de aceptación **Gherkin / BDD**.

---

## 1. Distribución del Equipo y Asignación Metodológica (Scrum / XP)

| Integrante | Rol Metodológico | Capa / Responsabilidad Técnica | Módulos y Entregables |
| :--- | :--- | :--- | :--- |
| **Rodrigo Cea** | Frontend Developer & Arquitecto | **Controlador (Controllers)** / Enrutamiento y Orquestación | `AppController.js`, `AuthController.js`, `ArticleController.js`, `SubscriptionController.js`, `EditorController.js`, `AdminController.js`, Router SPA, Toasts y Navegación Reactiva. |
| **Cristian Penroz** | Backend Developer & Modelador | **Modelo (Models)** / Lógica de Dominio y Persistencia | `Rol.js`, `Usuario.js`, `BloqueContenido.js`, `Newsletter.js`, `Suscripcion.js`, `PagoSimulado.js`, `EnvioNewsletter.js`, `AppStore.js`. Hashing Argon2id, persistencia `localStorage`. |
| **Marcelo Alegría** | UI/UX & Paywall Specialist | **Vista (Views)** / Interfaz y Barrera de Acceso | `NavbarView.js`, `HomeView.js`, `ArticleView.js`, `SubscriptionView.js`, `AuthView.js`, `AdminEditorView.js`, `AdminAudienciasView.js`, `AdminPaywallView.js`. Paywall difuminado/corte, tokens CSS Tailwind. |
| **Alonso Arriagada** | QA Engineer & Motor de Despacho | **Testing BDD & Despacho** / Telemetría y SLA | Criterios Gherkin BDD, simulación de despacho masivo por lotes, verificación de telemetría (<60 KB, <1.2s SLA), Sandbox de Roles para pruebas QA. |

---

## 2. Correspondencia con los Diagramas de Ingeniería

### 2.1. Diagrama de Casos de Uso (Diagrama 1)
- **Actor Administrador (`ROLE_ROOT_ADMIN`):**
  - *Gestionar Boletín:* `EditorController.js` y `AdminEditorView.js` permiten la curación en vivo, ordenamiento de bloques y ajuste de metadatos.
  - *Configurar Paywall:* `actualizarPoliticaPaywall({ umbral, estilo })` en `AppStore.js`.
  - *Marcar Bloque como Premium:* Toggle reactivo en `AdminEditorView.js`.
  - *Enviar Boletín Masivo:* `AdminController.ejecutarEnvioMasivo()` y `AdminPaywallView.js` con barra de progreso.
  - *Consultar Estadísticas:* `AdminController.obtenerMetricas()` y Bento Cards en `AdminAudienciasView.js`.
  - *Auditar Usuarios:* Modal de trazas forenses en `AdminAudienciasView.js` (Escenario 5.2).
- **Actor Suscriptor Freemium (`ROLE_FREEMIUM`):**
  - *Leer Artículos Abiertos:* Bloque 01 accesible en `ArticleView.js`.
  - *Visualizar Paywall:* Barrera difuminada tras el párrafo 3 con llamado a la acción.
  - *Suscribirse a Plan Premium:* `SubscriptionController.procesarCheckout()` en `SubscriptionView.js`.
- **Actor Suscriptor Premium (`ROLE_MECENAS_PRO`):**
  - *Leer Artículos Completos:* Acceso irrestricto sin cortes.
  - *Descargar Recursos Adjuntos:* Botón de descarga de datasets y Toolkit v2.4 (.tar.gz).
  - *Participar en Discusiones:* Sección interactiva del Ágora de comentarios.

### 2.2. Diagrama de Clases — Capa de Dominio / Modelo (Diagrama 2)
Todas las clases del diagrama han sido implementadas en `js/models/`:
- **`Usuario`**: Atributos `idUsuario`, `nombre`, `correo`, `contrasenaHash`, `estado`, `rol`. Métodos: `verificarPassword()`, `actualizarRol()`, `registrarTraza()`.
- **`Rol`**: Atributos `idRol`, `nombre`, `codigo`, `permisos`. Métodos: `obtenerPermisos()`, `tienePermiso()`, `esPremium()`. Roles: `ROLE_FREEMIUM`, `ROLE_MECENAS_PRO`, `ROLE_ROOT_ADMIN`.
- **`Newsletter`**: Atributos `idNewsletter`, `titulo`, `fechaPublicacion`, `estado`, `umbralPaywall`, `estiloTransicion`. Métodos: `agregarBloque()`, `modificarBloque()`, `eliminarBloque()`, `obtenerBloquesGratuitos()`, `obtenerBloquesPremium()`.
- **`BloqueContenido`**: Atributos `idBloque`, `titulo`, `subtitulo`, `contenido`, `esPremium`, `tipo`, `orden`, `recursosAdjuntos`. Métodos: `esVisiblePara(usuarioORol)`.
- **`Suscripcion`**: Atributos `idSuscripcion`, `fechaInicio`, `fechaFin`, `estado`, `planTipo`, `precio`. Métodos: `activar()`, `cancelar()`, `esActiva()`.
- **`PagoSimulado`**: Atributos `idPago`, `monto`, `moneda`, `fecha`, `estado`, `codigoRespuesta`. Métodos: `procesarPago()`, `confirmarPago()`.
- **`EnvioNewsletter`**: Atributos `idEnvio`, `fechaEnvio`, `tipoContenido`, `estado`, `telemetria`. Métodos: `generarVersion(newsletter, usuario)`, `simularLoteEnvioMasivo()`.

### 2.3. Diagrama de Actividades — Despacho Masivo Diferenciado (Diagrama 3)
Modelado rigurosamente en `EnvioNewsletter.js` y consumido por `AdminController.js`:
```
[Inicio: Administrador solicita envío]
       │
       ▼
[Clasificar Bloques: Abiertos vs PRO]
       │
       ▼
[Publicar Boletín en Edición Activa]
       │
       ▼
[Iterar Colección de Suscriptores]
       │
   ┌───┴────────────────────────┐
   ▼                            ▼
[¿Es Premium?]            [¿Es Premium?]
  NO -> Freemium            SÍ -> PRO
   │                            │
   ▼                            ▼
[Generar Versión Gratuita] [Generar Versión Completa]
- Bloques Gratuitos        - Bloques Gratuitos y PRO
- Paywall Teaser           - Datasets e Informes adjuntos
- HTML optimizado <60 KB   - Feed RSS privado
   │                            │
   └───────────┬────────────────┘
               ▼
   [Simular Despacho de Correo]
               │
               ▼
   [Registrar Entrega y Telemetría]
               │
               ▼
   [SLA Render < 1.2s Cumplido]
```

---

## 3. Matriz de Requisitos Funcionales (RF-01 a RF-05)

### RF-01: Gestión de Usuarios y Roles (RBAC)
- **Registro:** Formulario en `#iniciar-sesion` que asigna por defecto `ROLE_FREEMIUM`.
- **Seguridad (RNF-03):** Simulación de derivación de claves con salt dinámico y formato estándar `Argon2id` (`$argon2id$v=19$m=65536,t=3,p=4$...`).
- **Medidor de Entropía:** Cálculo dinámico de complejidad en tiempo real (longitud, mayúsculas, números, caracteres especiales).
- **QA Sandbox:** Barra superior flotante para conmutación inmediata de perfiles:
  - *Mateo Berardi* (Suscriptor Freemium)
  - *Helena Sampedro* (Mecenas PRO)
  - *Carlos Domínguez* (Administrador Editorial)

### RF-02: Bloques Modulares y Reglas de Visualización
- **Diferenciación de Contenido:** 
  - Bloque 1: Abierto a todos los lectores.
  - Bloques 2, 3 y 4: Exclusivos para Mecenas PRO (análisis cuantitativo, gráficos de latencia y toolkit v2.4).
- **Compuerta de Paywall:** Implementación de corte tras el párrafo 3 con difuminado progresivo (`backdrop-blur`) o corte seco.
- **Editor en Consola:** Panel en `#consola-editor` para reordenar bloques, cambiar tipo y ajustar umbral.

### RF-03: Simulación de Upgrade y Pasarela de Pago
- **Planes:** Conmutador mensual (9 € / mes) vs. anual (89 € / año con 2 meses de ahorro).
- **Tarjetas de Prueba:**
  - `4242 4242 4242 4242` → **200 OK (Aprobada):** Eleva de inmediato la sesión a `ROLE_MECENAS_PRO`, activa acceso sin paywall y actualiza el MRR.
  - `4000 0000 0000 0002` → **402 Declinada (Fondos Insuficientes):** Muestra alerta de error contextual y mantiene intacto el rol Freemium.
- **SLA de Respuesta:** Procesamiento simulado con latencia controlada (< 500 ms).

### RF-04: Envío Personalizado y Despacho Masivo
- **Generación Diferenciada:**
  - *Plantilla Freemium:* 54 KB (cumple RNF-01 < 60 KB), incluye teaser y beneficios de mecenazgo.
  - *Plantilla PRO:* 89 KB, incluye monografía íntegra y enlaces a datasets.
- **Simulador de Despacho:** Modal con barra de progreso reactiva en `#consola-paywall`, procesando los 2.182 suscriptores con SLA global de 0.84s (< 1.2s).

### RF-05: Analítica de Audiencia y Métricas de Conversión
- **5 Bento Cards de Impacto:**
  1. *Total Suscriptores:* 2.182 (+14%)
  2. *Audiencia Freemium:* 1.840 (84.3%)
  3. *Mecenas PRO:* 342 (15.7%)
  4. *Conversión a Pago:* 4.8% (+0.7pp vs 3.2% cultural)
  5. *MRR Facturado:* $3,078 USD
- **Embudo de Paywall:** 1.420 impactos → 284 clics (20% CTR) → 68 altas (23.9% conv).
- **Retención por Cohortes:** Evolución semestral Ene–Jun (Freemium 92%→68%, PRO 98%→89%) con exportador de CSV descargable.
- **Directorio de Suscriptores:** Búsqueda en vivo por nombre/email, filtrado por rol y modal de auditoría de trazas forenses.

---

## 4. Requisitos No Funcionales (RNF)

- **RNF-01 (Rendimiento):** 
  - Renderizado inicial en DOM < 2 segundos.
  - Peso HTML de plantilla Freemium en 54 KB (< 60 KB límite para email).
  - SLA de procesamiento por lote de 0.84s (< 1.2s para 100 usuarios concurrentes).
- **RNF-02 (Usabilidad y Responsive):**
  - Diseño adaptable de 360px a 1920px sin desbordamiento ni scroll horizontal.
  - Tipografías legibles optimizadas: *Space Grotesk* para titulares e interfaces, *Newsreader* para lectura larga.
- **RNF-03 (Seguridad):**
  - Hash de contraseñas con salt criptográfico simulando Argon2id / SHA-256.
  - Validación de roles RBAC en cada cambio de vista y acción del controlador.

---

## 5. Estructura de Archivos del Proyecto

```
stitch_prototipo_modificable_interactivo/
├── index.html                                 # Punto de entrada principal SPA (MVC reactivo)
├── test_mvc.cjs                               # Suite de verificación automatizada del dominio MVC
├── ARQUITECTURA_MVC.md                        # Documentación técnica y trazabilidad
├── js/
│   ├── app.js                                 # Bootstrap e inicialización del sistema
│   ├── models/                                # CAPA MODELO (Cristian Penroz)
│   │   ├── Rol.js                             # Entidad RBAC
│   │   ├── Usuario.js                         # Entidad de usuario y hashing Argon2id
│   │   ├── BloqueContenido.js                 # Bloques modulares y reglas de acceso
│   │   ├── Newsletter.js                      # Boletín, bloques y políticas de paywall
│   │   ├── Suscripcion.js                     # Ciclo de vida de membresía
│   │   ├── PagoSimulado.js                    # Pasarela de pago simulada (200 vs 402)
│   │   ├── EnvioNewsletter.js                 # Motor de generación y despacho masivo
│   │   └── AppStore.js                        # Repositorio central, reactividad y persistencia
│   ├── controllers/                           # CAPA CONTROLADOR (Rodrigo Cea)
│   │   ├── AppController.js                   # Orquestador maestro y enrutador por hash
│   │   ├── AuthController.js                  # Lógica de registro, login y QA switcher
│   │   ├── ArticleController.js               # Lógica de lectura y conmutación Freemium/PRO
│   │   ├── SubscriptionController.js          # Lógica de checkout y upgrade a PRO
│   │   ├── EditorController.js                # Lógica del canvas editorial y bloques
│   │   └── AdminController.js                 # Lógica de KPIs, filtros y despacho masivo
│   └── views/                                 # CAPA VISTA (Marcelo Alegría)
│       ├── NavbarView.js                      # Barra superior, badge RBAC y QA bar
│       ├── HomeView.js                        # Portada editorial y captura de boletín
│       ├── ArticleView.js                     # Lectura inmersiva y difuminado de paywall
│       ├── SubscriptionView.js                # Portal de mecenazgo y pasarela
│       ├── AuthView.js                        # Pantalla de acceso y registro con entropía
│       ├── AdminEditorView.js                 # Editor modular de bloques
│       ├── AdminAudienciasView.js             # Dashboard de audiencias, cohortes y directorio
│       └── AdminPaywallView.js                # Comparador de envíos Freemium vs PRO y lote
├── views/                                     # Vistas estáticas de diseño (con banner interactivo)
│   ├── inicio.html
│   ├── noticia.html
│   ├── portal_subcripcion.html
│   ├── login.html
│   ├── consola_admin_audiencias.html
│   ├── consola_admin_editor.html
│   └── consola_admin_paywall.html
└── reglas/                                    # Especificaciones de diseño y BDD
    ├── DESIGN.md
    └── criterios_de_aceptaci_n_gherkin_bdd_requisitos_funcionales_rf_01_a_rf_05.md
```

---

## 6. Guía Rápida de Uso y Demostración

1. **Abrir la Aplicación:** Abre `index.html` en cualquier navegador web moderno.
2. **Navegación:** Utiliza la barra superior o los botones del pie de página para explorar las vistas:
   - `#portada-noticias` (Portada)
   - `#noticia` (Ensayo con Paywall activo)
   - `#portal-suscripcion` (Portal de Mecenas PRO)
   - `#iniciar-sesion` (Registro / Login)
   - `#consola-audiencias` (Métricas RF-05 y Cohortes)
   - `#consola-editor` (Curación de Bloques RF-02)
   - `#consola-paywall` (Simulador de Envío Masivo RF-04)
3. **Probar Paywall (RF-02):** En `#noticia`, usa la barra de simulador superior para alternar entre *Vista Freemium* (con difuminado tras el párrafo 3) y *Modo Mecenas PRO* (con desbloqueo completo, gráfico de inferencia y descarga del Toolkit).
4. **Probar Checkout Simulado (RF-03):** En `#portal-suscripcion`, haz clic en el chip de tarjeta válida (`4242...`) y pulsa *Confirmar Aportación*; la sesión se elevará de inmediato a `ROLE_MECENAS_PRO`. Prueba luego con la tarjeta de fondos insuficientes (`4000...0002`) para verificar el error HTTP 402.
5. **Probar Envío Masivo (RF-04):** En `#consola-paywall`, pulsa *Confirmar y Simular Lote de Envío Masivo* para presenciar la generación segmentada en tiempo real.
6. **Ejecutar Pruebas Automatizadas del Dominio:**
   ```bash
   node test_mvc.cjs
   ```
   Todas las pruebas pasarán con código de salida 0.
