/**
 * Suite de Pruebas Unitarias y de Renderizado DOM (Controladores y Vistas MVC)
 * Ejecutar con Node.js (>= 18):
 *   node --test test_controllers_views.cjs
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

/**
 * Crea un contexto aislado simulando `window`, `document` y `localStorage`
 * para cargar los modelos, controladores y vistas del proyecto sin navegador.
 */
function crearContextoMVC() {
  const storage = new Map();
  const sandbox = {
    console,
    Date,
    Math,
    JSON,
    Promise,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Error,
    parseInt,
    parseFloat,
    isNaN,
    encodeURIComponent,
    btoa: (str) => Buffer.from(str, 'binary').toString('base64'),
    localStorage: {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k),
      clear: () => storage.clear()
    },
    navigator: {
      clipboard: {
        lastCopied: null,
        writeText(text) {
          this.lastCopied = text;
          return Promise.resolve();
        }
      }
    },
    document: {
      _elements: new Map(),
      getElementById(id) {
        return this._elements.get(id) || null;
      },
      querySelectorAll() {
        return [];
      },
      addEventListener() {}
    },
    module: { exports: {} }
  };

  sandbox.window = sandbox;
  sandbox.window.location = { hash: '#portada-noticias', href: 'http://localhost/#portada-noticias' };
  sandbox.window.scrollTo = () => {};
  sandbox.window.addEventListener = () => {};
  sandbox.window.views = {};
  sandbox.window.apiService = {
    modoOffline: true,
    verificarConexion: async () => false,
    obtenerUltimaNoticiaPublicada: async () => ({ exito: false, datos: null }),
    obtenerNoticia: async () => ({ exito: false, datos: null }),
    listarNoticias: async () => ({ exito: true, datos: [] }),
    obtenerPreciosConfig: async () => ({ exito: true, datos: { precio_mensual_clp: 8990, precio_anual_clp: 89900 } }),
    listarDescuentos: async () => ({
      exito: true,
      datos: [
        {
          id_descuento: 1,
          tipo: 'codigo',
          codigo: 'ATELIER20',
          nombre: 'Bienvenida Mecenas 20%',
          porcentaje_descuento: 20,
          activo: true
        }
      ]
    }),
    obtenerMetaPremium: async () => ({ exito: true, datos: { meta_suscripciones_premium: 500 } })
  };

  vm.createContext(sandbox);

  const scripts = [
    'js/models/Rol.js',
    'js/models/Usuario.js',
    'js/models/BloqueContenido.js',
    'js/models/Newsletter.js',
    'js/models/Suscripcion.js',
    'js/models/PagoSimulado.js',
    'js/models/EnvioNewsletter.js',
    'js/models/AppStore.js',
    'js/controllers/AuthController.js',
    'js/controllers/ArticleController.js',
    'js/controllers/SubscriptionController.js',
    'js/controllers/EditorController.js',
    'js/controllers/AdminController.js',
    'js/controllers/NoticiasController.js',
    'js/controllers/AppController.js',
    'js/views/NavbarView.js',
    'js/views/ArticleView.js',
    'js/views/AccessDeniedView.js',
    'js/views/AuthView.js',
    'js/views/SubscriptionView.js',
    'js/views/AdminEditorView.js'
  ];

  for (const relPath of scripts) {
    const code = fs.readFileSync(path.join(__dirname, relPath), 'utf8');
    vm.runInContext(code, sandbox, { filename: relPath });
  }

  const store = new sandbox.AppStore();
  const app = new sandbox.AppController(store);
  sandbox.window.app = app;

  return { sandbox, store, app };
}

describe('Controladores MVC (Atelier Dispatch)', () => {
  let ctx;

  beforeEach(() => {
    ctx = crearContextoMVC();
  });

  it('AuthController: registra nuevo usuario como ROLE_FREEMIUM y rechaza contraseñas discordantes', () => {
    const { app } = ctx;

    const fallo = app.authController.handleRegistro({
      nombre: 'Laura Vidal',
      correo: 'laura.nueva@estudio.es',
      password: 'AlphaOmega2026!',
      passwordConfirm: 'Diferente2026!',
      aceptaTerminos: true
    });
    assert.equal(fallo.exito, false);
    assert.equal(fallo.campoError, 'passwordConfirm');

    const ok = app.authController.handleRegistro({
      nombre: 'Laura Nueva',
      correo: 'laura.nueva@estudio.es',
      password: 'AlphaOmega2026!',
      passwordConfirm: 'AlphaOmega2026!',
      aceptaTerminos: true
    });
    assert.equal(ok.exito, true);
    assert.equal(ok.usuario.rol.codigo, 'ROLE_FREEMIUM');
  });

  it('AuthController: restringe handleQALogin únicamente cuando Sandbox QA está activo', () => {
    const { app, store } = ctx;

    const bloqueado = app.authController.handleQALogin('ROLE_ROOT_ADMIN');
    assert.equal(bloqueado.exito, false);

    store.iniciarSesion({ correo: 'sandboxadmin@evaluacion.ipvg', password: 'Evaluacion3' });
    assert.equal(store.esSandboxActivo(), true);

    const conmutado = app.authController.handleQALogin('ROLE_FREEMIUM');
    assert.equal(conmutado.exito, true);
    assert.equal(conmutado.usuario.rol.codigo, 'ROLE_FREEMIUM');
  });

  it('AppController: guardia RBAC bloquea consolas admin (403) a Visitante, Freemium y PRO', () => {
    const { app, store } = ctx;

    // Visitante anónimo
    assert.equal(app.verificarAccesoRuta('consola-audiencias').permitido, false);
    assert.equal(app.verificarAccesoRuta('noticia').permitido, true);

    // Suscriptor Freemium
    store.iniciarSesion({ correo: 'mateo.berardi@politecnico.it', password: 'MateoAlpha2026!' });
    const resFree = app.verificarAccesoRuta('consola-noticias');
    assert.equal(resFree.permitido, false);
    assert.ok(store.usuarioActual.trazasAuditoria.some(t => t.evento.includes('403 Forbidden')));

    // Mecenas PRO tampoco debe entrar a consolas admin
    store.iniciarSesion({ correo: 'helena.sampedro@editorial-libre.org', password: 'HelenaPro2026!' });
    assert.equal(app.verificarAccesoRuta('consola-paywall').permitido, false);

    // Root Admin sí tiene acceso
    store.iniciarSesion({ correo: 'carlos.dominguez@atelier.press', password: 'RootAdminMaster2026!' });
    assert.equal(app.verificarAccesoRuta('consola-audiencias').permitido, true);
    assert.equal(app.verificarAccesoRuta('consola-noticias').permitido, true);
  });

  it('ArticleController: determina acceso estricto Freemium vs PRO y modo simulado Sandbox', () => {
    const { app, store } = ctx;

    // Visitante -> esPro debe ser booleano false
    assert.strictEqual(app.articleController.obtenerEstadoLectura().esPro, false);

    // Freemium -> esPro false
    store.iniciarSesion({ correo: 'mateo.berardi@politecnico.it', password: 'MateoAlpha2026!' });
    assert.strictEqual(app.articleController.obtenerEstadoLectura().esPro, false);

    // Mecenas PRO -> esPro true
    store.iniciarSesion({ correo: 'helena.sampedro@editorial-libre.org', password: 'HelenaPro2026!' });
    assert.strictEqual(app.articleController.obtenerEstadoLectura().esPro, true);

    // Sandbox Admin alternando vista
    store.iniciarSesion({ correo: 'sandboxadmin@evaluacion.ipvg', password: 'Evaluacion3' });
    app.articleController.setReaderMode('freemium');
    assert.strictEqual(app.articleController.obtenerEstadoLectura().esPro, false);
    app.articleController.setReaderMode('pro');
    assert.strictEqual(app.articleController.obtenerEstadoLectura().esPro, true);
  });

  it('SubscriptionController: aplica código ATELIER20, rechaza 402 y promueve a PRO con 4242', async () => {
    const { app, store } = ctx;
    store.iniciarSesion({ correo: 'mateo.berardi@politecnico.it', password: 'MateoAlpha2026!' });

    await app.subscriptionController.sincronizarPreciosYDescuentos();
    const resCupon = app.subscriptionController.aplicarCodigoDescuento('ATELIER20');
    assert.equal(resCupon.exito, true);

    const precios = app.subscriptionController.obtenerPrecios();
    assert.equal(precios.porcentajeDescuento, 20);
    assert.equal(precios.montoNumerico, Math.round(89900 * 0.8));

    const rechazo = await app.subscriptionController.procesarCheckout({
      titular: 'Mateo Berardi',
      correo: 'mateo.berardi@politecnico.it',
      numeroTarjeta: '4000 0000 0000 0002',
      caducidad: '12/28',
      cvc: '123'
    });
    assert.equal(rechazo.exito, false);
    assert.equal(rechazo.codigo, 402);
    assert.equal(store.usuarioActual.rol.codigo, 'ROLE_FREEMIUM');

    const aprobado = await app.subscriptionController.procesarCheckout({
      titular: 'Mateo Berardi',
      correo: 'mateo.berardi@politecnico.it',
      numeroTarjeta: '4242 4242 4242 4242',
      caducidad: '12/28',
      cvc: '888'
    });
    assert.equal(aprobado.exito, true);
    assert.equal(store.usuarioActual.rol.codigo, 'ROLE_MECENAS_PRO');
  });

  it('EditorController: conmuta bloques y actualiza política de paywall (umbral y estilo)', () => {
    const { app, store } = ctx;
    const bloque1 = store.newsletterActual.bloques[0];
    assert.equal(bloque1.esPremium, false);

    app.editorController.conmutarVisibilidadBloque(bloque1.idBloque);
    assert.equal(bloque1.esPremium, true);

    const res = app.editorController.configurarPaywall({ umbral: 'p5', estilo: 'corte_seco' });
    assert.equal(res.exito, true);
    assert.equal(store.newsletterActual.umbralPaywall, 'p5');
    assert.equal(store.newsletterActual.estiloTransicion, 'corte_seco');
  });
});

describe('Vistas MVC (Renderizado HTML y Paywall)', () => {
  let ctx;

  beforeEach(() => {
    ctx = crearContextoMVC();
  });

  it('ArticleView: bloquea con difuminado real a Freemium en noticia premium multipárrafo y oculta Zona PRO', () => {
    const { sandbox, app, store } = ctx;
    store.iniciarSesion({ correo: 'mateo.berardi@politecnico.it', password: 'MateoAlpha2026!' });

    const estado = app.articleController.obtenerEstadoLectura();
    estado.ultimaNoticia = {
      id_noticia: 99,
      titulo: 'Dossier IA 2026',
      subtitulo: 'Análisis PRO',
      contenido: [
        'Párrafo uno de apertura.',
        'Párrafo dos de contexto.',
        'Párrafo tres de análisis.',
        'Párrafo cuatro SECRETO_PRO_NO_EXPUESTO_EN_CLARO.',
        'Párrafo cinco SECRETO_FINAL_OCULTO.'
      ].join('\n\n'),
      categoria: 'Análisis Técnico',
      es_premium: true,
      fecha_publicacion: new Date().toISOString()
    };

    const html = sandbox.window.views.ArticleView.render(estado);

    assert.match(html, /id="freemium-paywall-gate"/);
    assert.match(html, /paywall-blur-layer-1/);
    assert.match(html, /Este ensayo continúa para la comunidad de mecenas/);
    assert.match(html, /Debate Exclusivo Comunidad PRO/);
    assert.doesNotMatch(html, /Zona PRO Desbloqueada/);
    assert.doesNotMatch(html, /id="agora-comment-input"/);
    assert.match(html, /Párrafo tres de análisis/);
    assert.doesNotMatch(html, /Párrafo cinco SECRETO_FINAL_OCULTO/);
  });

  it('ArticleView: trunca y difumina incluso artículos premium cortos (1 o 2 párrafos)', () => {
    const { sandbox, app } = ctx;
    const estadoBase = app.articleController.obtenerEstadoLectura();

    // Caso 1 párrafo
    estadoBase.ultimaNoticia = {
      id_noticia: 10,
      titulo: 'Nota Premium Corta',
      contenido: 'Primera oración visible para todos. Segunda oración exclusiva que debe quedar oculta tras el muro.',
      es_premium: true
    };
    const html1 = sandbox.window.views.ArticleView.render(estadoBase);
    assert.match(html1, /id="freemium-paywall-gate"/);
    assert.match(html1, /Primera oración visible/);

    // Caso 2 párrafos
    estadoBase.ultimaNoticia = {
      id_noticia: 11,
      titulo: 'Nota Premium Dos Párrafos',
      contenido: 'Primer párrafo abierto.\n\nSegundo párrafo reservado.',
      es_premium: true
    };
    const html2 = sandbox.window.views.ArticleView.render(estadoBase);
    assert.match(html2, /id="freemium-paywall-gate"/);
    assert.match(html2, /Primer párrafo abierto/);
  });

  it('ArticleView: respeta estilo corte_seco sin capas de difuminado', () => {
    const { sandbox, app } = ctx;
    app.editorController.configurarPaywall({ umbral: 'p3', estilo: 'corte_seco' });
    const estado = app.articleController.obtenerEstadoLectura();
    estado.ultimaNoticia = {
      id_noticia: 12,
      titulo: 'Dossier Corte Seco',
      contenido: 'P1.\n\nP2.\n\nP3.\n\nP4 restringido.',
      es_premium: true
    };

    const html = sandbox.window.views.ArticleView.render(estado);
    assert.match(html, /data-estilo="corte_seco"/);
    assert.match(html, /Corte Seco/);
    assert.doesNotMatch(html, /class="[^"]*paywall-blur-layer-1/);
  });

  it('ArticleView: en artículo abierto (es_premium: false) NO filtra Zona PRO a lectores Freemium', () => {
    const { sandbox, app, store } = ctx;
    store.iniciarSesion({ correo: 'mateo.berardi@politecnico.it', password: 'MateoAlpha2026!' });

    const estado = app.articleController.obtenerEstadoLectura();
    estado.ultimaNoticia = {
      id_noticia: 1,
      titulo: 'Artículo Abierto',
      contenido: 'Texto libre 1.\n\nTexto libre 2.',
      es_premium: false
    };

    const html = sandbox.window.views.ArticleView.render(estado);
    assert.doesNotMatch(html, /id="freemium-paywall-gate"/);
    assert.doesNotMatch(html, /Zona PRO Desbloqueada/);
    assert.doesNotMatch(html, /id="agora-comment-input"/);
    assert.match(html, /Texto libre 2\./);
    assert.match(html, /Debate Exclusivo Comunidad PRO/);
  });

  it('ArticleView: Mecenas PRO accede al texto completo, Zona PRO y Ágora sin paywall', () => {
    const { sandbox, app, store } = ctx;
    store.iniciarSesion({ correo: 'helena.sampedro@editorial-libre.org', password: 'HelenaPro2026!' });

    const estado = app.articleController.obtenerEstadoLectura();
    estado.ultimaNoticia = {
      id_noticia: 99,
      titulo: 'Dossier IA 2026',
      contenido: 'P1.\n\nP2.\n\nP3.\n\nP4 exclusivo completo.\n\nP5 final.',
      es_premium: true
    };

    const html = sandbox.window.views.ArticleView.render(estado);
    assert.doesNotMatch(html, /id="freemium-paywall-gate"/);
    assert.match(html, /P4 exclusivo completo\./);
    assert.match(html, /P5 final\./);
    assert.match(html, /Zona PRO Desbloqueada/);
    assert.match(html, /id="agora-comment-input"/);
  });

  it('ArticleView.attachEvents: conmutar Vista Freemium / Modo Mecenas PRO en Sandbox actualiza el controlador', () => {
    const { sandbox, document } = { ...ctx, document: ctx.sandbox.document };
    const listeners = {};
    const makeBtn = (id) => ({
      id,
      addEventListener: (ev, fn) => {
        listeners[id] = fn;
      }
    });
    document._elements.set('btn-mode-freemium', makeBtn('btn-mode-freemium'));
    document._elements.set('btn-mode-pro', makeBtn('btn-mode-pro'));

    let modoElegido = null;
    let reRendered = false;
    const mockApp = {
      articleController: { setReaderMode: (m) => { modoElegido = m; } },
      reRenderRutaActual: () => { reRendered = true; },
      showToast: () => {}
    };

    sandbox.window.views.ArticleView.attachEvents(mockApp);
    listeners['btn-mode-freemium']();
    assert.equal(modoElegido, 'freemium');
    assert.equal(reRendered, true);

    listeners['btn-mode-pro']();
    assert.equal(modoElegido, 'pro');
  });

  it('NavbarView y AccessDeniedView: muestran navegación admin y barra Sandbox según rol RBAC', () => {
    const { sandbox, store } = ctx;

    // Freemium: sin links admin ni sandbox
    store.iniciarSesion({ correo: 'mateo.berardi@politecnico.it', password: 'MateoAlpha2026!' });
    const navFree = sandbox.window.views.NavbarView.render(store);
    assert.doesNotMatch(navFree, /consola-audiencias/);
    assert.doesNotMatch(navFree, /Sandbox QA/);

    // Sandbox Admin: con links admin y barra Sandbox
    store.iniciarSesion({ correo: 'sandboxadmin@evaluacion.ipvg', password: 'Evaluacion3' });
    const navAdmin = sandbox.window.views.NavbarView.render(store);
    assert.match(navAdmin, /consola-audiencias/);
    assert.match(navAdmin, /Sandbox QA/);

    // AccessDeniedView 403
    const html403 = sandbox.window.views.AccessDeniedView.render({
      ruta: 'consola-audiencias',
      consolaNombre: 'Audiencias, Cohortes & Métricas',
      usuario: null,
      motivo: 'Permisos insuficientes',
      esSandbox: false
    });
    assert.match(html403, /403/);
    assert.match(html403, /consola-audiencias/);
  });
});
