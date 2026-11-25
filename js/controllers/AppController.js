/**
 * CONTROLADOR MAESTRO: AppController
 * Orquestador principal de la arquitectura MVC.
 * Gestiona el enrutamiento por hash, el ciclo de vida de las vistas,
 * la sincronización del estado global, notificaciones y modales.
 */

class AppController {
  constructor(store) {
    this.store = store;
    this.authController = new AuthController(store);
    this.articleController = new ArticleController(store);
    this.subscriptionController = new SubscriptionController(store);
    this.editorController = new EditorController(store);
    this.adminController = new AdminController(store);
    this.noticiasController = new NoticiasController(store);

    // Definición de Rutas y Políticas de Control de Acceso (RBAC)
    this.permisosRutas = {
      'portada-noticias': { publica: true, nombre: 'Portada / Noticias' },
      'noticia': { publica: true, nombre: 'Ensayo & Lectura' },
      'portal-suscripcion': { publica: true, nombre: 'Portal de Mecenazgo' },
      'iniciar-sesion': { publica: true, nombre: 'Acceso y Registro' },
      'consola-audiencias': { soloAdmin: true, nombre: 'Audiencias, Cohortes & Métricas' },
      'consola-noticias': { soloAdmin: true, nombre: 'Gestión de Noticias (CRUD)' },
      'consola-editor': { soloAdmin: true, nombre: 'Editor Modular de Bloques' },
      'consola-paywall': { soloAdmin: true, nombre: 'Despacho Masivo & Telemetría' }
    };

    this.rutasValidas = Object.keys(this.permisosRutas);
    this.rutaActual = 'portada-noticias';
  }

  iniciar() {
    // Escucha cambios de ruta en el hash de la URL
    window.addEventListener('hashchange', () => this.handleHashChange());

    // Escucha cambios de sesión para re-renderizar navbar y vistas activas
    this.store.on('sesion:cambiada', (user) => {
      this.actualizarInterfazSesion(user);
      this.reRenderRutaActual();
    });

    this.store.on('usuario:promovido_pro', (user) => {
      this.showToast(`¡Felicitaciones ${user.nombre}! Tu cuenta ha sido promovida a Mecenas PRO.`, 'success');
      this.actualizarInterfazSesion(user);
    });

    // Renderiza la barra de navegación inicial
    this.renderizarNavbar();

    // Procesa ruta inicial
    this.handleHashChange();
  }

  /**
   * Guardia de Navegación RBAC:
   * Evalúa si el usuario en sesión tiene los permisos necesarios para la ruta solicitada.
   */
  verificarAccesoRuta(ruta) {
    const config = this.permisosRutas[ruta];
    if (!config) return { permitido: true };

    if (config.soloAdmin) {
      const usuario = this.store.usuarioActual;
      if (!usuario || !usuario.esAdmin()) {
        const rolTexto = usuario ? usuario.rol.nombre : 'Visitante Anónimo';
        // Registra traza forense de seguridad si el usuario está autenticado
        if (usuario && typeof usuario.registrarTraza === 'function') {
          usuario.registrarTraza(`Bloqueo de acceso no autorizado (403 Forbidden) a #${ruta}`);
        }
        return {
          permitido: false,
          ruta,
          consolaNombre: config.nombre,
          usuario,
          motivo: `Tu rol actual (${rolTexto}) no tiene privilegios de administración. Esta consola está protegida por la política RBAC de dirección editorial.`
        };
      }
    }

    return { permitido: true };
  }

  handleHashChange() {
    let hash = window.location.hash.replace(/^#\/?/, '').trim();
    if (!hash || !this.rutasValidas.includes(hash)) {
      hash = 'portada-noticias';
    }
    this.rutaActual = hash;

    // GUARDIA DE RUTA RBAC: Bloquea accesos no autorizados a consolas de administración
    const acceso = this.verificarAccesoRuta(this.rutaActual);
    if (!acceso.permitido) {
      this.renderizarAccesoDenegado(acceso);
      this.actualizarNavegacionActiva(null);
      this.showToast(`Acceso denegado (403): Se requieren permisos de Administrador para #${this.rutaActual}`, 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.renderizarVista(this.rutaActual);
    this.actualizarNavegacionActiva(this.rutaActual);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navegarA(ruta) {
    window.location.hash = '#' + ruta;
  }

  reRenderRutaActual() {
    this.handleHashChange();
  }

  async renderizarVista(ruta) {
    const contenedor = document.getElementById('app-main-content');
    if (!contenedor) return;

    switch (ruta) {
      case 'portada-noticias':
        contenedor.innerHTML = window.views.HomeView.render(this.store);
        window.views.HomeView.attachEvents(this);
        break;

      case 'noticia': {
        await this.articleController.cargarUltimaNoticiaPublicada();
        const estadoLectura = this.articleController.obtenerEstadoLectura();
        contenedor.innerHTML = window.views.ArticleView.render(estadoLectura);
        window.views.ArticleView.attachEvents(this);
        break;
      }

      case 'portal-suscripcion': {
        await this.subscriptionController.sincronizarPreciosYDescuentos();
        const precios = this.subscriptionController.obtenerPrecios();
        const usuarioActual = this.store.usuarioActual;
        const metaPremium = await this.adminController.cargarMetaPremium();
        const metricas = this.adminController.obtenerMetricas();
        contenedor.innerHTML = window.views.SubscriptionView.render(precios, usuarioActual, {
          mecenasActivos: metricas.mecenasProActivos,
          metaPremium,
          esSandbox: this.store.esSandboxActivo()
        });
        window.views.SubscriptionView.attachEvents(this);
        break;
      }

      case 'iniciar-sesion':
        contenedor.innerHTML = window.views.AuthView.render(this.store.usuarioActual, this.store.esSandboxActivo());
        window.views.AuthView.attachEvents(this);
        break;

      case 'consola-audiencias': {
        await this.adminController.cargarAudienciasDesdeBD();
        const metricas = this.adminController.obtenerMetricas();
        const suscriptores = this.adminController.obtenerSuscriptoresFiltrados();
        contenedor.innerHTML = window.views.AdminAudienciasView.render(metricas, suscriptores);
        window.views.AdminAudienciasView.attachEvents(this);
        break;
      }

      case 'consola-editor':
        window.views.NoticiasAdminView._tabActiva = 'bloques';
        // Continúa hacia consola-noticias unificada
      case 'consola-noticias': {
        if (window.apiService && typeof window.apiService.verificarConexion === 'function') {
          await window.apiService.verificarConexion();
        }
        const [resNoticias, resStats] = await Promise.all([
          this.noticiasController.listarNoticias(),
          this.noticiasController.obtenerEstadisticas()
        ]);
        const noticias = resNoticias && resNoticias.exito ? resNoticias.datos : [];
        const stats = resStats && resStats.exito && resStats.datos ? resStats.datos.resumen : null;
        const editorData = {
          newsletter: this.editorController.obtenerNewsletter(),
          notas: this.store.notasEquipo
        };
        contenedor.innerHTML = window.views.NoticiasAdminView.render(
          noticias,
          stats,
          this.noticiasController.noticiaEditando,
          editorData
        );
        window.views.NoticiasAdminView.attachEvents(this);
        break;
      }

      case 'consola-paywall': {
        await Promise.all([
          this.adminController.cargarMetaPremium(),
          this.adminController.cargarPreciosYDescuentos()
        ]);
        const preview = this.adminController.obtenerPreviewEnvioDiferenciado();
        const metricas = this.adminController.obtenerMetricas();
        contenedor.innerHTML = window.views.AdminPaywallView.render(preview, {
          mecenasActivos: metricas.mecenasProActivos,
          metaPremium: this.adminController.metaPremium,
          precios: this.adminController.preciosConfig,
          descuentos: this.adminController.descuentos
        });
        window.views.AdminPaywallView.attachEvents(this);
        break;
      }

      default:
        contenedor.innerHTML = window.views.HomeView.render(this.store);
        window.views.HomeView.attachEvents(this);
    }
  }

  actualizarNavegacionActiva(ruta) {
    const links = document.querySelectorAll('[data-path]');
    links.forEach(link => {
      const path = link.getAttribute('data-path');
      if (path === ruta) {
        link.classList.add('text-on-surface', 'font-bold', 'bg-surface-container-high');
        link.classList.remove('text-on-surface-variant');
      } else {
        link.classList.remove('text-on-surface', 'font-bold', 'bg-surface-container-high');
        link.classList.add('text-on-surface-variant');
      }
    });
  }

  renderizarNavbar() {
    const navbarContainer = document.getElementById('app-navbar-container');
    if (navbarContainer && window.views && window.views.NavbarView) {
      navbarContainer.innerHTML = window.views.NavbarView.render(this.store);
      window.views.NavbarView.attachEvents(this);
    }
  }

  renderizarAccesoDenegado(accesoData) {
    const contenedor = document.getElementById('app-main-content');
    if (!contenedor) return;
    if (window.views && window.views.AccessDeniedView) {
      contenedor.innerHTML = window.views.AccessDeniedView.render({
        ...accesoData,
        esSandbox: this.store.esSandboxActivo()
      });
    } else {
      contenedor.innerHTML = `
        <div class="pt-32 text-center p-8">
          <h2 class="text-2xl font-bold text-tertiary">403 Acceso Denegado</h2>
          <p class="text-on-surface-variant">${accesoData.motivo}</p>
        </div>
      `;
    }
  }

  actualizarInterfazSesion(usuario) {
    // 1. Re-renderiza la barra de navegación para actualizar visibilidad según el rol
    this.renderizarNavbar();

    // 2. Controla la visibilidad de los accesos administrativos en el pie de página
    const footerAdminSection = document.getElementById('footer-admin-links');
    if (footerAdminSection) {
      if (usuario && usuario.esAdmin()) {
        footerAdminSection.classList.remove('hidden');
      } else {
        footerAdminSection.classList.add('hidden');
      }
    }
  }

  showToast(mensaje, tipo = 'info') {
    const toast = document.getElementById('global-toast');
    const toastMsg = document.getElementById('global-toast-msg');
    const toastIcon = document.getElementById('global-toast-icon');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = mensaje;
    toast.classList.remove('hidden', 'bg-primary', 'bg-error', 'bg-tertiary-container', 'bg-inverse-surface');

    if (tipo === 'success') {
      toast.classList.add('bg-primary', 'text-on-primary');
      if (toastIcon) toastIcon.textContent = 'check_circle';
    } else if (tipo === 'error') {
      toast.classList.add('bg-error', 'text-on-error');
      if (toastIcon) toastIcon.textContent = 'error';
    } else {
      toast.classList.add('bg-inverse-surface', 'text-inverse-on-surface');
      if (toastIcon) toastIcon.textContent = 'info';
    }

    toast.classList.remove('opacity-0', 'translate-y-4');
    toast.classList.add('opacity-100', 'translate-y-0');

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-4');
      toast.classList.remove('opacity-100', 'translate-y-0');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 4000);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppController;
}
