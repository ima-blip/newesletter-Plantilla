/**
 * MODELO: AppStore
 * Repositorio central de datos y persistencia del estado (Database en memoria y localStorage).
 * Conecta los modelos de Usuario, Rol, Newsletter, BloqueContenido, Suscripcion,
 * PagoSimulado y EnvioNewsletter. Emite eventos reactivos para el patrón MVC.
 */

class AppStore {
  constructor() {
    this.storageKey = 'atelier_dispatch_mvc_store_v2';
    this.listeners = {};
    this.sandboxActivo = false;
    this.inicializar();
  }

  inicializar() {
    // Intenta restaurar estado persistente desde localStorage
    let saved = null;
    if (typeof localStorage !== 'undefined') {
      try {
        saved = localStorage.getItem(this.storageKey);
      } catch (e) {
        console.warn('localStorage no accesible:', e);
      }
    }
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.cargarDesdeDatos(data);
        return;
      } catch (e) {
        console.warn('Error al restaurar AppStore de localStorage, reiniciando con semillas:', e);
      }
    }
    this.cargarSemillasIniciales();
  }

  cargarSemillasIniciales() {
    // 1. Roles del sistema
    this.roles = {
      freemium: Rol.crearFreemium(),
      pro: Rol.crearMecenasPro(),
      admin: Rol.crearRootAdmin()
    };

    // 2. Usuarios predeterminados para QA y BDD
    this.usuarios = [
      new Usuario({
        idUsuario: 1,
        nombre: 'Mateo Berardi',
        correo: 'mateo.berardi@politecnico.it',
        contrasenaHash: Usuario.simularHashSeguro('MateoAlpha2026!'),
        estado: 'activo',
        rol: this.roles.freemium,
        openRate: 64,
        ultimoBoletin: 'Nº 148 // Rebotó en Paywall'
      }),
      new Usuario({
        idUsuario: 2,
        nombre: 'Helena Sampedro',
        correo: 'helena.sampedro@editorial-libre.org',
        contrasenaHash: Usuario.simularHashSeguro('HelenaPro2026!'),
        estado: 'activo',
        rol: this.roles.pro,
        openRate: 92,
        ultimoBoletin: 'Nº 148 // Lectura Completa PRO'
      }),
      new Usuario({
        idUsuario: 3,
        nombre: 'Carlos Domínguez',
        correo: 'carlos.dominguez@atelier.press',
        contrasenaHash: Usuario.simularHashSeguro('RootAdminMaster2026!'),
        estado: 'activo',
        rol: this.roles.admin,
        openRate: 100,
        ultimoBoletin: 'Nº 149 // Autor Editor'
      }),
      new Usuario({
        idUsuario: 4,
        nombre: 'Julián T. Valdés',
        correo: 'jvaldes@universitas.edu',
        contrasenaHash: Usuario.simularHashSeguro('JulianEdu2026!'),
        estado: 'activo',
        rol: this.roles.freemium,
        openRate: 42,
        ultimoBoletin: 'Nº 148 // Rebotó en Paywall'
      }),
      new Usuario({
        idUsuario: 5,
        nombre: 'Laura Vidal',
        correo: 'laura.vidal@estudio.es',
        contrasenaHash: Usuario.simularHashSeguro('AlphaOmega2026!'),
        estado: 'activo',
        rol: this.roles.freemium,
        openRate: 58,
        ultimoBoletin: 'Nº 148 // Leído (Freemium)'
      }),
      new Usuario({
        idUsuario: 6,
        nombre: 'Beatriz De la Serna',
        correo: 'bdelaserna@disenso.cat',
        contrasenaHash: Usuario.simularHashSeguro('BeatrizMecenas!'),
        estado: 'activo',
        rol: this.roles.pro,
        openRate: 88,
        ultimoBoletin: 'Nº 148 // Descargó Dataset'
      }),
      new Usuario({
        idUsuario: 7,
        nombre: 'Sandbox Admin',
        correo: 'sandboxadmin@evaluacion.ipvg',
        contrasenaHash: Usuario.simularHashSeguro('Evaluacion3'),
        estado: 'activo',
        rol: this.roles.admin,
        openRate: 100,
        ultimoBoletin: 'Cuenta Evaluador Sandbox'
      })
    ];

    // Agrega trazas de auditoría de prueba para Julián T. Valdés (RF-05 Escenario 5.2)
    const julian = this.usuarios.find(u => u.correo === 'jvaldes@universitas.edu');
    if (julian) {
      julian.trazasAuditoria = [
        { fecha: '2026-11-14 18:22:10', evento: 'Inicio de sesión exitoso (Freemium)', ipSimulada: '190.22.45.101' },
        { fecha: '2026-11-14 18:24:35', evento: 'Lectura Despacho Nº 148: Párrafos 1 a 3 leídos', ipSimulada: '190.22.45.101' },
        { fecha: '2026-11-14 18:25:02', evento: 'Colisión con Paywall Teaser en párrafo 3 (Bloque 02 PRO)', ipSimulada: '190.22.45.101' },
        { fecha: '2026-11-14 18:25:40', evento: 'Clic en CTA: Unirme como Mecenas (Rebotó antes de pagar)', ipSimulada: '190.22.45.101' }
      ];
    }

    // 3. Al iniciar la página, no hay sesión activa ni modo sandbox activo
    this.usuarioActual = null;
    this.sandboxActivo = false;

    // 4. Newsletter y Bloques Modulares iniciales (RF-02)
    this.newsletterActual = new Newsletter({
      idNewsletter: 149,
      numeroEdicion: 149,
      titulo: 'Nº 149 // Dossier: Hegemonía del Algoritmo',
      subtitulo: 'Tendencias de IA Generativa & Estrategia Digital',
      descripcion: 'Las tensiones estructurales de cómputo, liquidez y mercantilización del clic frente a la resistencia del texto reposado.',
      autorPrincipal: 'Carlos Domínguez (Editor Jefe)',
      estado: 'publicado',
      umbralPaywall: 'p3',
      estiloTransicion: 'difuminado',
      bloques: [
        new BloqueContenido({
          idBloque: 101,
          titulo: 'Bloque 01 • Introducción & Lead',
          subtitulo: 'Marco Teórico: La economía de la atención y el retorno al texto',
          contenido: `Hemos aceptado con una docilidad alarmante que el pensamiento debe sincronizarse con los impulsos nerviosos de un feed algorítmico. Durante la última década, las interfaces no han sido diseñadas para expandir la comprensión del sujeto contemporáneo, sino para drenar metódicamente su capacidad de sostener una sola idea compleja durante más de cuatro minutos seguidos.

El diseño de la persuasión —heredero bastardo del conductismo skinneriano y afinado en los laboratorios de Silicon Valley— no busca informar ni suscitar deleite intelectual; su único vector de optimización es la permanencia desasosegada. El portal periodístico infestado de balizas rastreadoras y el videoensayo de quince segundos comparten la misma topología carcelaria: la promesa inminente de una epifanía que nunca se materializa.

Cuando la retención se convierte en el único índice de éxito bursátil, el lenguaje se deteriora. El titular deviene en señuelo neuroquímico; el argumento cede el paso al espasmo emocional inmediato. En contraposición, proyectos editoriales de resistencia demuestran que una audiencia crítica no demanda artificios cinéticos: reclama rigor, prosa pausada y una interlocución honesta que no la trate como una métrica de conversión pasiva.`,
          esPremium: false,
          tipo: 'introduccion',
          orden: 1
        }),
        new BloqueContenido({
          idBloque: 102,
          titulo: 'Bloque 02 • Desglose Técnico de Infraestructura',
          subtitulo: 'El coste computacional real y el estrangulamiento de márgenes',
          contenido: `En los datos internos del informe de audiencia de septiembre (véase Cuadro 4.2), se percibe una correlación directa entre el abandono de plataformas centralizadas y la adhesión al boletín monográfico. Los lectores que sostienen este espacio no buscan primicias de gabinete de prensa ni notas prefabricadas. La anatomía del desmantelamiento de los medios tradicionales responde a un estrangulamiento deliberado de márgenes operativos.

La desintermediación algorítmica exige un pacto directo de mecenazgo cultural. Para los desarrolladores de videojuegos y creadores de contenido documental, el modelo de suscripción limpia no es una opción de negocio secundaria, sino la única condición de posibilidad de su autonomía discursiva. El despliegue de clusters de cómputo para modelos fundacionales consume actualmente un 42% del flujo de caja de las principales cabeceras tecnológicas sin haber demostrado viabilidad unitaria sostenible.`,
          esPremium: true,
          tipo: 'ensayo',
          orden: 2
        }),
        new BloqueContenido({
          idBloque: 103,
          titulo: 'Bloque 03 • Análisis Cuantitativo de Inferencia',
          subtitulo: 'Costos de Inferencia Marginal vs Calidad en Modelos de Lenguaje',
          contenido: `Evaluamos más de 45 millones de tokens en arquitecturas densas frente a modelos de mezcla de expertos (MoE). Los resultados desmienten la premisa de la economía de escala ilimitada: la latencia de inferencia en tiempo real experimenta rendimientos decrecientes severos una vez superado el umbral de los 70 mil millones de parámetros activos.`,
          esPremium: true,
          tipo: 'analisis_cuantitativo',
          orden: 3
        }),
        new BloqueContenido({
          idBloque: 104,
          titulo: 'Bloque 04 • Toolkit y Recursos Descargables',
          subtitulo: 'Material confidencial para miembros mecenas',
          contenido: `Descarga el script de benchmark reproducible en PyTorch, el cuaderno de Jupyter con los pesos crudos y la matriz de cálculo en formato SQLite.`,
          esPremium: true,
          tipo: 'descarga',
          orden: 4,
          recursosAdjuntos: [
            { nombre: 'Toolkit de Auditoría de Modelos v2.4 .tar.gz', tamano: '4.8 MB', tipo: 'archive' },
            { nombre: 'Dataset Crudo: Benchmarks Latencia Inferencia (CSV)', tamano: '1.2 MB', tipo: 'csv' }
          ]
        })
      ]
    });

    // 5. Métricas globales y embudo de paywall (RF-05 Escenario 5.1)
    this.metricas = {
      totalSuscriptores: 2182,
      audienciaFreemium: 1840,
      porcentajeFreemium: 84.3,
      mecenasProActivos: 342,
      porcentajePro: 15.7,
      tasaConversion: 4.8,
      mrrFacturado: 3074580, // CLP
      metaSuscripcionesPremium: 500,
      embudoPaywall: {
        impactos: { volumen: 1420, tasa: '100%' },
        clicsDesbloqueo: { volumen: 284, tasa: '20.0% CTR' },
        upgradesCompletados: { volumen: 68, tasa: '23.9% conv.' }
      },
      cohortes: [
        { mes: 'Ene', freemium: 92, pro: 98 },
        { mes: 'Feb', freemium: 86, pro: 95 },
        { mes: 'Mar', freemium: 79, pro: 93 },
        { mes: 'Abr', freemium: 74, pro: 91 },
        { mes: 'May', freemium: 71, pro: 90 },
        { mes: 'Jun', freemium: 68, pro: 89 }
      ]
    };

    // 6. Notas internas de la redacción (Equipo del Proyecto)
    this.notasEquipo = [
      {
        id: 1,
        autor: 'Rodrigo Cea',
        rol: 'Frontend & Controlador',
        hora: '10:42 AM',
        texto: 'Revisé la cita de Valerie Vandevelde. Corregí una imprecisión técnica respecto a la memoria atencional en transformers. Listo para publicar.'
      },
      {
        id: 2,
        autor: 'Cristian Penroz',
        rol: 'Backend & Datos',
        hora: '09:15 AM',
        texto: 'El gráfico de throughput quedó impecable. Confirmar si la descarga del JSON incluye la clave de validación del script.'
      },
      {
        id: 3,
        autor: 'Marcelo Alegría',
        rol: 'Paywall & Vistas',
        hora: 'Ayer',
        texto: 'La línea de corte tras el párrafo 3 está generando buena fricción en las pruebas A/B de retención. Recomiendo mantenerla fija.'
      },
      {
        id: 4,
        autor: 'Alonso Arriagada',
        rol: 'Despacho & QA',
        hora: 'Ayer',
        texto: 'Notifiquen al canal general cuando el despacho pase a estado "Programado". La newsletter de aviso saldrá 15 min después.'
      }
    ];

    // 7. Historial de envíos
    this.historialEnvios = [];

    this.guardarEnStorage();
  }

  cargarDesdeDatos(data) {
    this.roles = {
      freemium: Rol.crearFreemium(),
      pro: Rol.crearMecenasPro(),
      admin: Rol.crearRootAdmin()
    };

    this.usuarios = (data.usuarios || []).map(u => {
      let r = this.roles.freemium;
      if (u.rol && u.rol.codigo === Rol.MECENAS_PRO) r = this.roles.pro;
      if (u.rol && u.rol.codigo === Rol.ROOT_ADMIN) r = this.roles.admin;
      const user = new Usuario({ ...u, rol: r });
      user.trazasAuditoria = u.trazasAuditoria || [];
      return user;
    });

    if (!this.usuarios.some(u => u.correo.toLowerCase() === 'sandboxadmin@evaluacion.ipvg')) {
      this.usuarios.push(new Usuario({
        idUsuario: 7,
        nombre: 'Sandbox Admin',
        correo: 'sandboxadmin@evaluacion.ipvg',
        contrasenaHash: Usuario.simularHashSeguro('Evaluacion3'),
        estado: 'activo',
        rol: this.roles.admin,
        openRate: 100,
        ultimoBoletin: 'Cuenta Evaluador Sandbox'
      }));
    }

    if (data.usuarioActual) {
      this.usuarioActual = this.usuarios.find(u => u.correo === data.usuarioActual.correo) || null;
    } else {
      this.usuarioActual = null;
    }
    this.sandboxActivo = Boolean(data.sandboxActivo);

    this.newsletterActual = new Newsletter(data.newsletterActual || {});
    this.metricas = data.metricas || {};
    this.notasEquipo = data.notasEquipo || [];
    this.historialEnvios = data.historialEnvios || [];
  }

  guardarEnStorage() {
    try {
      const data = {
        usuarios: this.usuarios.map(u => u.toJSON()),
        usuarioActual: this.usuarioActual ? this.usuarioActual.toJSON() : null,
        sandboxActivo: this.sandboxActivo,
        newsletterActual: this.newsletterActual.toJSON(),
        metricas: this.metricas,
        notasEquipo: this.notasEquipo,
        historialEnvios: this.historialEnvios
      };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('No se pudo guardar en localStorage:', e);
    }
  }

  // Event listener pattern (Observable)
  on(evento, callback) {
    if (!this.listeners[evento]) this.listeners[evento] = [];
    this.listeners[evento].push(callback);
  }

  emit(evento, datos) {
    if (this.listeners[evento]) {
      this.listeners[evento].forEach(cb => cb(datos));
    }
    this.guardarEnStorage();
  }

  // Operaciones de Usuario (RF-01)
  registrarUsuario({ nombre, correo, password, contrasena, interesEditorial }) {
    // Valida unicidad de correo
    const existe = this.usuarios.find(u => u.correo.toLowerCase() === correo.toLowerCase());
    if (existe) {
      throw new Error('El correo electrónico ya se encuentra registrado.');
    }

    const rawPassword = password || contrasena || '';
    const contrasenaHash = Usuario.simularHashSeguro(rawPassword);
    const nuevoUsuario = new Usuario({
      idUsuario: Date.now(),
      nombre,
      correo,
      contrasenaHash,
      estado: 'activo',
      rol: this.roles.freemium,
      fechaRegistro: new Date()
    });

    nuevoUsuario.registrarTraza('Registro de cuenta nueva con asignación de Rol Freemium (RF-01)');
    this.usuarios.push(nuevoUsuario);
    this.usuarioActual = nuevoUsuario;

    // Actualiza métricas de audiencia
    this.metricas.totalSuscriptores++;
    this.metricas.audienciaFreemium++;
    this.metricas.porcentajeFreemium = +(
      (this.metricas.audienciaFreemium / this.metricas.totalSuscriptores) * 100
    ).toFixed(1);

    this.emit('usuario:registrado', nuevoUsuario);
    this.emit('sesion:cambiada', nuevoUsuario);
    return nuevoUsuario;
  }

  esSandboxActivo() {
    return Boolean(this.sandboxActivo);
  }

  iniciarSesion({ correo, password }) {
    const usuario = this.usuarios.find(u => u.correo.toLowerCase() === correo.toLowerCase());
    if (!usuario) {
      throw new Error('No existe una cuenta registrada con este correo electrónico.');
    }
    if (!usuario.verificarPassword(password)) {
      throw new Error('Contraseña incorrecta. Por favor verifica tus credenciales.');
    }

    usuario.registrarTraza('Inicio de sesión exitoso (RNF-03 validado)');
    this.usuarioActual = usuario;
    this.sandboxActivo = usuario.correo.toLowerCase() === 'sandboxadmin@evaluacion.ipvg';
    this.guardarEnStorage();
    this.emit('sesion:cambiada', usuario);
    return usuario;
  }

  cerrarSesion() {
    this.usuarioActual = null;
    this.sandboxActivo = false;
    this.guardarEnStorage();
    this.emit('sesion:cambiada', null);
  }

  conmutarRolQA(codigoRol) {
    if (!this.esSandboxActivo()) return this.usuarioActual;
    let target = null;
    if (codigoRol === Rol.FREEMIUM) {
      target = this.usuarios.find(u => u.rol.codigo === Rol.FREEMIUM) || this.usuarios[0];
    } else if (codigoRol === Rol.MECENAS_PRO) {
      target = this.usuarios.find(u => u.rol.codigo === Rol.MECENAS_PRO) || this.usuarios[1];
    } else if (codigoRol === Rol.ROOT_ADMIN) {
      target = this.usuarios.find(u => u.rol.codigo === Rol.ROOT_ADMIN) || this.usuarios[2];
    } else if (codigoRol === 'GUEST') {
      target = null;
    }
    this.usuarioActual = target;
    this.emit('sesion:cambiada', target);
    return target;
  }

  // Operaciones de Suscripción & Upgrade (RF-03)
  promoverUsuarioAPro(usuarioId, datosPago) {
    const usuario = this.usuarios.find(u => u.idUsuario === usuarioId) || this.usuarioActual;
    if (!usuario) return null;

    usuario.actualizarRol(this.roles.pro);
    usuario.suscripcion = new Suscripcion({
      idUsuario: usuario.idUsuario,
      tipo: datosPago.planTipo === 'anual' ? 'Anual' : 'Mensual',
      monto: datosPago.monto,
      pagos: [datosPago.pago]
    });

    usuario.registrarTraza(`Upgrade a Mecenas PRO completado con éxito mediante tarjeta ${datosPago.pago.tarjetaEnmascarada}`);

    // Actualiza métricas de conversión
    this.metricas.audienciaFreemium = Math.max(0, this.metricas.audienciaFreemium - 1);
    this.metricas.mecenasProActivos++;
    this.metricas.porcentajePro = +(
      (this.metricas.mecenasProActivos / this.metricas.totalSuscriptores) * 100
    ).toFixed(1);
    this.metricas.porcentajeFreemium = +(100 - this.metricas.porcentajePro).toFixed(1);
    this.metricas.mrrFacturado += datosPago.planTipo === 'anual' ? Math.round(89900 / 12) : 8990;
    this.metricas.embudoPaywall.upgradesCompletados.volumen++;

    this.emit('usuario:promovido_pro', usuario);
    this.emit('metricas:actualizadas', this.metricas);
    return usuario;
  }

  // Consulta de Métricas (RF-05)
  obtenerMetricas() {
    return { ...this.metricas };
  }

  getKpis() {
    return this.obtenerMetricas();
  }

  // Operaciones de Bloques & Paywall (RF-02)
  actualizarBloqueNewsletter(idBloque, datos) {
    const bloque = this.newsletterActual.modificarBloque(idBloque, datos);
    this.emit('newsletter:actualizado', this.newsletterActual);
    return bloque;
  }

  actualizarPoliticaPaywall({ umbral, estilo }) {
    if (umbral) this.newsletterActual.umbralPaywall = umbral;
    if (estilo) this.newsletterActual.estiloTransicion = estilo;
    this.emit('newsletter:actualizado', this.newsletterActual);
  }

  agregarNotaEquipo({ autor, rol, texto }) {
    const nuevaNota = {
      id: Date.now(),
      autor,
      rol,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      texto
    };
    this.notasEquipo.unshift(nuevaNota);
    this.emit('notas:actualizadas', this.notasEquipo);
    return nuevaNota;
  }

  // Despacho Masivo (RF-04)
  registrarEnvioMasivo(resultadoEnvio) {
    this.historialEnvios.unshift(resultadoEnvio);
    this.emit('envio:completado', resultadoEnvio);
  }
}

// Instancia singleton para compartir en el cliente
let appStoreInstance = null;
if (typeof Rol !== 'undefined') {
  appStoreInstance = new AppStore();
  if (typeof window !== 'undefined') {
    window.appStore = appStoreInstance;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AppStore, appStore: appStoreInstance };
}
