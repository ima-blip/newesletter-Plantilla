# Criterios de Aceptación Detallados (Gherkin / BDD) — Requisitos Funcionales (RF-01 a RF-05)
## Plataforma Editorial y Newsletter Modular "Atelier Dispatch"

Este documento complementa el PRD y Brief de Proyecto estableciendo la batería formal de pruebas de aceptación en formato **Gherkin / Behavior-Driven Development (BDD)** para el Sprint 1 (MVP). Cada requisito funcional cuenta con escenarios estándar (*Happy Path*), escenarios de excepción/borde (*Alternative/Edge Paths*) y condiciones de validación para QA y automatización de pruebas.

---

### RF-01: Registro de Usuarios y Asignación de Roles

> **Objetivo:** Garantizar que todo nuevo visitante que complete el formulario de registro adquiera de manera inmediata y unívoca el rol de `Suscriptor Freemium`, con credenciales cifradas y acceso a los contenidos abiertos y despachos semanales.

#### Escenario 1.1: Registro exitoso con asignación automática de rol Freemium (Happy Path)
```gherkin
Característica: Registro de nuevos usuarios y asignación de rol inicial
  Como visitante no autenticado de Atelier Dispatch
  Quiero registrar una nueva cuenta con mi correo electrónico y contraseña
  Para acceder a las lecturas abiertas y recibir el boletín dominical en mi bandeja de entrada

  Escenario: Registro satisfactorio de suscriptor con rol predeterminado Freemium
    Dado que me encuentro en la pantalla de "Registro de Suscriptor y Acceso" (SCREEN_8)
    Y no poseo una sesión activa en el navegador
    Cuando ingreso el nombre "Mateo Berardi" en el campo "Nombre Completo o Alias"
    Y completo el campo "Correo Electrónico" con "mateo.berardi@politecnico.it"
    Y defino una "Contraseña Maestra" válida de al menos 8 caracteres alfanuméricos
    Y reingreso la misma clave en "Confirmar Contraseña"
    Y marco la casilla obligatoria "Acepto el Manifiesto Editorial y la Política de Cero Rastreadores"
    Y hago clic en el botón "Crear Cuenta Gratis (Asignar Rol Freemium)"
    Entonces el sistema debe crear mi registro en la base de datos de suscriptores
    Y debe asignar automáticamente el rol "Suscriptor Freemium" (código RBAC: ROLE_FREEMIUM)
    Y la contraseña debe almacenarse cifrada unidireccionalmente mediante Argon2id con salt aleatorio
    Y debo ser redirigido a la "Portada de Noticias" (SCREEN_4) con una notificación de bienvenida: "Cuenta activada con rol Freemium"
    Y el encabezado de navegación debe mostrar mi sesión activa con avatar y opción de "Cerrar Sesión".
```

#### Escenario 1.2: Validación de contraseñas no coincidentes o débiles (Edge Case)
```gherkin
  Escenario: Intento de registro con contraseñas discordantes
    Dado que estoy en el formulario de registro (SCREEN_8)
    Cuando ingreso un correo válido "laura.vidal@estudio.es"
    Y defino en "Contraseña Maestra" la cadena "AlphaOmega2026!"
    Y en "Confirmar Contraseña" ingreso "AlphaOmegaDiferente!"
    Y pulso "Crear Cuenta Gratis"
    Entonces el formulario debe bloquear el envío hacia el servidor
    Y debe resaltar el campo "Confirmar Contraseña" con borde de advertencia en color semántico de error
    Y debe mostrar el mensaje en línea: "Las contraseñas ingresadas no coinciden. Por favor verifíquelas."
    Y ningún usuario debe ser insertado en la base de datos.
```

#### Escenario 1.3: Conmutación rápida mediante Sandbox QA para pruebas de desarrollo (Testability)
```gherkin
  Escenario: Inicio de sesión instantáneo con Sandbox QA de Roles
    Dado que el desarrollador o revisor se encuentra en la caja "Sandbox QA • Prueba de Roles" de SCREEN_8
    Cuando hace clic en el chip de rol preconfigurado "Lector Freemium (mateo.berardi@politecnico.it)"
    Entonces los campos del formulario deben autorellenarse de inmediato con las credenciales de prueba
    Y la sesión debe quedar autenticada con nivel de privilegios "Suscriptor Freemium"
    Y debe permitir la navegación inmediata simulando la perspectiva de dicho perfil sin recargar manualmente.
```

---

### RF-02: Diferenciación y Composición Modular de Contenido

> **Objetivo:** Permitir al equipo editorial clasificar bloques de contenido con visibilidad selectiva (`Abierto a Todos` vs. `PRO Restricted`), delimitar la compuerta de corte (paywall) y alternar estilos de transición (difuminado o corte seco).

#### Escenario 2.1: Marcado de bloque analítico como exclusivo PRO e inserción de paywall (Happy Path)
```gherkin
Característica: Editor modular por bloques y gobernanza de compuertas de acceso
  Como Editor Jefe o Curador de Contenidos de Atelier Dispatch
  Quiero marcar bloques específicos dentro de un dossier como exclusivos para Mecenas PRO
  Para incentivar la conversión orgánica protegiendo el análisis de mayor valor sin degradar la experiencia

  Escenario: Configuración de compuerta tras el párrafo 3 con difuminado progresivo
    Dado que el editor ha iniciado sesión con privilegios editoriales en la "Consola Redacción" (SCREEN_19)
    Y se encuentra editando el despacho activo "Nº 149 // Dossier: Hegemonía del Algoritmo"
    Cuando selecciona el bloque "Bloque 02 - Desglose Técnico de Infraestructura"
    Y en el "Inspector de Permisos" marca el criterio de acceso en "Solo PRO"
    Y selecciona el "Estilo de Transición del Paywall" como "Difuminado Progresivo"
    Y establece el delimitador visual "Límite Freemium • Inicio de Zona PRO" tras el tercer párrafo
    Y hace clic en "Guardar Cambios"
    Entonces el bloque 02 debe mostrar en el canvas editorial la insignia "PRO RESTRICTED"
    Y la vista pública para lectores Freemium no debe enviar al navegador el contenido íntegro de la zona restringida
    Y el texto del párrafo 3 debe renderizar un gradiente CSS en difuminado hacia el fondo antes de la tarjeta teaser.
```

#### Escenario 2.2: Lector Freemium frente a un bloque restringido (Paywall Teaser)
```gherkin
  Escenario: Visualización de un artículo con paywall por parte de un suscriptor Freemium
    Dado que un usuario autenticado con rol "Suscriptor Freemium" accede a "Experiencia de Lectura" (SCREEN_15)
    Cuando hace scroll y supera el párrafo #3 del ensayo
    Entonces el texto subsiguiente no debe ser legible y debe mostrar el gradiente de difuminado
    Y debe visualizarse la tarjeta de conversión "Este ensayo continúa para la comunidad de mecenas"
    Y la tarjeta debe detallar los beneficios exclusivos (ensayo completo de 3.200 palabras, podcast confidencial y datasets crudos)
    Y debe presentar el botón de acción principal "Unirme como Mecenas (8,90 € / mes)"
    Y el pie del ensayo debe deshabilitar la caja de comentarios del Ágora mostrando la etiqueta "Debate Exclusivo Comunidad PRO".
```

#### Escenario 2.3: Desbloqueo irrestricto de contenido para Mecenas PRO
```gherkin
  Escenario: Acceso completo sin cortes para suscriptor con membresía activa PRO
    Dado que un usuario autenticado con rol "Mecenas PRO" ingresa a la misma URL del despacho (SCREEN_15)
    Cuando visualiza el artículo
    Entonces ningún párrafo debe contener gradiente de opacidad ni difuminado
    Y no debe mostrarse la tarjeta de interrupción de Paywall
    Y el bloque interactivo "Análisis Cuantitativo: Costos de Inferencia Marginal vs Calidad" debe mostrarse al 100%
    Y los botones de descarga de recursos ("Toolkit de Auditoría de Modelos v2.4 .tar.gz") deben estar habilitados y funcionales
    Y el usuario debe tener habilitado el editor del "Ágora de Mecenas" para publicar respuestas.
```

---

### RF-03: Simulación de Upgrade y Pasarela de Pago

> **Objetivo:** Proporcionar al lector Freemium un embudo fluido para subir de categoría a `Mecenas PRO`, conmutar entre facturación mensual/anual, validar tarjetas en entorno simulado y promover su rol en tiempo real sin recargar la sesión.

#### Escenario 3.1: Upgrade exitoso mediante checkout interactivo con tarjeta simulada (Happy Path)
```gherkin
Característica: Pasarela de suscripción y simulación de upgrade
  Como lector Freemium convencido del valor editorial de la plataforma
  Quiero seleccionar un plan de mecenazgo y completar el pago simulado con tarjeta
  Para desbloquear de inmediato todas las monografías, datasets y debates sin fricción

  Escenario: Suscripción anual exitosa con chip de prueba rápido en Sandbox
    Dado que me encuentro autenticado como lector Freemium en el "Portal de Mecenazgo" (SCREEN_13)
    Cuando selecciono el conmutador de periodicidad "Anual (89 €/año • 2 Meses Gratis)"
    Y hago clic en la tarjeta "Mecenas PRO" en el botón "Unirme como Mecenas PRO Ahora"
    Y en el formulario "Método de Pago Seguro" hago clic en el chip de prueba "Tarjeta Válida"
    Entonces el campo número de tarjeta se autocompleta con "4242 •••• •••• 4242"
    Y la fecha de caducidad se fija en "12/28" con CVC "888"
    Cuando pulso en el botón "Confirmar Aportación y Acceder a Todo el Contenido"
    Entonces el sistema debe simular la llamada al gateway de pago con respuesta HTTP 200 OK en menos de 500 ms
    Y el rol del usuario en la sesión debe cambiar de forma instantánea de "ROLE_FREEMIUM" a "ROLE_MECENAS_PRO"
    Y debe mostrarse un modal o banner de confirmación: "¡Gracias por blindar nuestra redacción! Eres Mecenas PRO"
    Y el usuario debe poder acceder a los artículos bloqueados previamente sin requerir un nuevo inicio de sesión.
```

#### Escenario 3.2: Rechazo simulado de transacción por fondos insuficientes (Alternative Path)
```gherkin
  Escenario: Rechazo de pago simulado por fondos insuficientes
    Dado que un usuario se encuentra en el formulario de pasarela de pago (SCREEN_13)
    Cuando selecciona el chip de prueba rápida "Tarjeta Sin Fondos"
    Y pulsa "Confirmar Aportación y Acceder a Todo el Contenido"
    Entonces el sistema debe simular una respuesta de rechazo bancario (código: `insufficient_funds`)
    Y debe mantener al usuario en el formulario de pago sin modificar su rol de Freemium
    Y debe mostrar un banner de alerta con el texto: "La transacción fue declinada por fondos insuficientes en la tarjeta simulada. Por favor utiliza una tarjeta de prueba válida."
    Y el botón de pago debe reactivarse para un nuevo intento.
```

---

### RF-04: Envío Personalizado y Vista Previa Diferenciada

> **Objetivo:** Permitir al equipo editorial inspeccionar de forma previa y simultánea cómo se estructurará y despachará el boletín para cada segmento de la audiencia (Freemium con teaser vs. Premium íntegro), verificando además los límites de rendimiento técnico (RNF-01).

#### Escenario 4.1: Comparador simultáneo Freemium vs. Premium antes del envío masivo (Happy Path)
```gherkin
Característica: Previsualización simultánea y envío segmentado del boletín
  Como Curador o Director Editorial
  Quiero previsualizar en pantalla dividida la versión Freemium y la versión Premium del boletín antes de enviarlo
  Para cerciorarme de que el paywall teaser es atractivo y que los mecenas reciben la versión completa con anexos

  Escenario: Validación de despacho diferenciado y telemetría de entrega
    Dado que el curador se encuentra en la consola de "Vista Previa de Envíos" (SCREEN_25 / SCREEN_33)
    Y ha cargado el borrador del "Despacho Semanal Nº 149"
    Cuando activa el comparador con el toggle "Vista Dividida (Freemium vs. Premium)"
    Entonces la columna izquierda debe desplegar la plantilla adaptada a Freemium con el teaser en el párrafo #3 y el botón de upgrade
    Y la columna derecha debe desplegar la versión PRO completa incluyendo el gráfico de latencia, el bloque de entrevista y el toolkit descargable
    Y el panel de telemetría debe certificar que el peso HTML de la versión abierta es de 54 KB (cumpliendo RNF-01 < 60 KB)
    Y la estimación de latencia de renderizado de plantilla debe marcar 0.84 segundos (cumpliendo RNF-01 SLA < 1.2s)
    Cuando el curador pulsa "Confirmar y Simular Lote de Envío Masivo"
    Entonces el sistema debe segmentar la cola de salida en 1.840 destinatarios Freemium y 342 destinatarios Mecenas PRO
    Y debe emitir el reporte de entrega con 100% de éxito en entorno de simulación.
```

---

### RF-05: Panel de Administración, Cohortes y Métricas

> **Objetivo:** Proporcionar al administrador y analista de negocio una visión en tiempo real de los indicadores clave de rendimiento (KPIs), el comportamiento de retención por cohortes, el embudo de impacto en el muro de pago y un directorio paginado con control granular de accesos (RBAC).

#### Escenario 5.1: Verificación de KPIs en tiempo real y embudo del paywall (Happy Path)
```gherkin
Característica: Panel de administración, métricas y directorio de suscriptores
  Como Administrador o Analista de Negocio de Atelier Dispatch
  Quiero supervisar las métricas de suscriptores, tasa de conversión y embudo de colisión del paywall
  Para evaluar la viabilidad financiera del modelo y el rendimiento de las reglas de corte

  Escenario: Consulta de métricas globales y embudo de conversión
    Dado que el usuario inicia sesión con rol "Administrador" (código RBAC: ROLE_ROOT_ADMIN)
    Y accede a la pantalla "Consola Admin — Audiencias, Cohortes y Métricas" (SCREEN_17)
    Cuando visualiza el tablero principal de analítica
    Entonces los contadores de métricas deben reflejar el estado actual sincronizado de la base de datos:
      | Métrica               | Valor Esperado |
      | Total Suscriptores    | 2.182          |
      | Audiencia Freemium    | 1.840 (84.3%)  |
      | Mecenas PRO Activos   | 342 (15.7%)    |
      | Tasa Conv. a Pago     | 4.8%           |
      | MRR Facturado         | $3,078 USD     |
    Y la tarjeta de "Embudo Paywall" debe desglosar con precisión las etapas del ciclo activo:
      | Etapa de Embudo            | Volumen Registrado | Tasa de Paso |
      | 1. Impacto con Paywall     | 1.420 lecturas     | 100%         |
      | 2. Clics en Desbloqueo     | 284 clics          | 20.0% CTR    |
      | 3. Upgrades Completados    | 68 nuevos mecenas  | 23.9% conv.  |
    Y el gráfico de cohortes semestrales (Ene - Jun) debe mostrar la retención comparada entre Freemium y Mecenas PRO.
```

#### Escenario 5.2: Búsqueda, filtrado y auditoría en el directorio RBAC de suscriptores
```gherkin
  Escenario: Filtrado de usuarios por rol y suspensión de cuenta desde el directorio
    Dado que el administrador está en la sección "Directorio de Suscriptores" en SCREEN_17
    Cuando selecciona el chip de filtro de rol "Freemium"
    Entonces la tabla debe listar únicamente los registros con etiqueta "FREEMIUM"
    Cuando escribe "Julián T. Valdés" en el campo de búsqueda rápida
    Entonces la lista debe filtrarse instantáneamente mostrando el registro coincidente:
      | Suscriptor | Correo                 | Rol Asignado | Open Rate | Último Boletín |
      | JT Valdés  | jvaldes@universitas.edu| FREEMIUM     | 42%       | Nº 148 // Rebotó en Paywall |
    Cuando el administrador hace clic en el menú contextual de acciones (tres puntos) y pulsa "Auditar Trazas de Lectura"
    Entonces el sistema debe desplegar el historial de accesos y colisiones frente al muro sin exponer contraseñas ni datos sensibles.
```

---

### Resumen de Cobertura de Criterios BDD

| Requisito Funcional | Escenarios Gherkin Especificados | Cobertura de Pruebas |
| :--- | :--- | :--- |
| **RF-01** Registro y Roles | • Registro feliz con asignación Freemium (1.1)<br>• Validación de contraseñas discordantes (1.2)<br>• Autenticación rápida vía Sandbox QA (1.3) | Happy Path, Validación Frontend/Backend, Seguridad de credenciales (Argon2id). |
| **RF-02** Diferenciación de Módulos | • Configuración de bloque PRO y difuminado (2.1)<br>• Bloqueo con Paywall Teaser para Freemium (2.2)<br>• Acceso irrestricto y toolkits para Mecenas PRO (2.3) | Permisos RBAC, Gradiente CSS, Renderizado condicional de contenido y descargas. |
| **RF-03** Simulación de Upgrade | • Upgrade anual con chip Sandbox exitoso (3.1)<br>• Simulación de rechazo por fondos insuficientes (3.2) | Pasarela simulada, Actualización reactiva de estado de usuario, SLA de respuesta. |
| **RF-04** Envío Personalizado | • Comparador simultáneo Freemium vs. PRO (4.1)<br>• Validación de peso HTML (<60 KB) y latencia (<1.2s) | Segmentación de destinatarios, Optimización de plantilla (RNF-01). |
| **RF-05** Panel de Administración | • Verificación de métricas de negocio y embudo (5.1)<br>• Búsqueda, filtro y auditoría en directorio RBAC (5.2) | Integridad de base de datos, Trazabilidad, Gobernanza administrativa. |
