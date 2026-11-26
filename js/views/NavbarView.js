/**
 * VISTA: NavbarView
 * Renderiza la barra superior de navegación unificada, el estado de sesión RBAC,
 * y la barra flotante de Sandbox QA para pruebas de conmutación de roles.
 */

window.views = window.views || {};

window.views.NavbarView = {
  render(store) {
    const user = store.usuarioActual;
    const rolNombre = user ? user.rol.nombre : 'Visitante Anónimo';
    const inicial = user ? user.nombre.charAt(0).toUpperCase() : '?';

    let rolBadgeClass = 'bg-surface-container text-on-surface font-bold';
    if (user && user.esAdmin()) {
      rolBadgeClass = 'bg-secondary-container text-on-secondary-container font-bold';
    } else if (user && user.esMecenasPro()) {
      rolBadgeClass = 'bg-primary-fixed text-on-primary-fixed font-bold';
    }

    return `
      <!-- BARRA SUPERIOR EDITORIAL -->
      <header class="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/20">
        <div class="h-20 max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-md">
          <!-- Logo & Lema -->
          <div class="flex items-center gap-space-lg">
            <a class="flex flex-col cursor-pointer" onclick="window.app.navegarA('portada-noticias')">
              <span class="font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface">Atelier Dispatch</span>
              <span class="font-metadata text-metadata uppercase tracking-widest text-primary">Crítica Cultural &amp; Análisis Lúdico</span>
            </a>

            <!-- Navegación Primaria con Separación de Visibilidad por Rol (RBAC) -->
            <nav class="hidden lg:flex items-center gap-1" id="main-nav-links">
              <a class="font-body-sm text-body-sm px-space-sm py-space-xs rounded-full cursor-pointer transition-colors" data-path="portada-noticias" onclick="window.app.navegarA('portada-noticias')">Portada / Noticias</a>
              <a class="font-body-sm text-body-sm px-space-sm py-space-xs rounded-full cursor-pointer transition-colors" data-path="noticia" onclick="window.app.articleController.limpiarNoticiaEspecifica(); window.app.navegarA('noticia')">Ensayo &amp; Lectura</a>
              <a class="font-body-sm text-body-sm px-space-sm py-space-xs rounded-full cursor-pointer transition-colors" data-path="portal-suscripcion" onclick="window.app.navegarA('portal-suscripcion')">
                ${user && user.esMecenasPro() ? '★ Membresía PRO' : 'Hazte Mecenas PRO'}
              </a>

              ${user && user.esAdmin() ? `
                <!-- VISIBLE EXCLUSIVAMENTE PARA ADMINISTRADORES (ROLE_ROOT_ADMIN) -->
                <div class="h-4 w-[1px] bg-outline-variant/40 mx-1"></div>
                <div class="flex items-center bg-secondary-container/50 px-1.5 py-0.5 rounded-full border border-secondary-container gap-1">
                  <span class="font-label-badge text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-primary text-on-primary font-bold">ADMIN</span>
                  <a class="font-body-sm text-body-sm px-2.5 py-1 rounded-full cursor-pointer transition-colors hover:bg-surface-container-high" data-path="consola-audiencias" onclick="window.app.navegarA('consola-audiencias')">Audiencias</a>
                  <a class="font-body-sm text-body-sm px-2.5 py-1 rounded-full cursor-pointer transition-colors hover:bg-surface-container-high" data-path="consola-noticias" onclick="window.app.navegarA('consola-noticias')">Noticias &amp; Bloques</a>
                  <a class="font-body-sm text-body-sm px-2.5 py-1 rounded-full cursor-pointer transition-colors hover:bg-surface-container-high" data-path="consola-paywall" onclick="window.app.navegarA('consola-paywall')">Envío &amp; Meta PRO</a>
                </div>
              ` : `
                <!-- Para lectores (Freemium o PRO), se ocultan las consolas administrativas y se muestra un distintivo de lectura segura -->
                <div class="h-4 w-[1px] bg-outline-variant/30 mx-1"></div>
                <span class="font-metadata text-[10px] text-outline uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-surface-container-low hidden xl:inline-flex items-center gap-1.5 border border-outline-variant/20">
                  <span class="material-symbols-outlined text-[13px] text-primary">menu_book</span>
                  <span>Modo Lector • Sin publicidad</span>
                </span>
              `}
            </nav>
          </div>

          <!-- Perfil & Autenticación -->
          <div class="flex items-center gap-space-sm">
            <!-- Badge de Rol Activo RBAC -->
            <div class="hidden sm:flex flex-col items-end">
              <span class="font-metadata text-[10px] uppercase text-outline tracking-wider">Rol de Sesión (RBAC)</span>
              <span id="navbar-user-role-badge" class="font-label-badge text-label-badge uppercase px-2.5 py-0.5 rounded-full ${rolBadgeClass}">
                ${rolNombre}
              </span>
            </div>

            <!-- Avatar -->
            <div class="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-sm text-sm font-bold shadow-sm" id="navbar-user-avatar">
              ${inicial}
            </div>

            <!-- Botón Auth Dinámico -->
            <button id="navbar-auth-action" class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface px-space-sm py-space-xs transition-colors rounded-full border border-outline-variant/30 hover:border-outline">
              ${user ? 'Cerrar Sesión' : 'Iniciar Sesión'}
            </button>
          </div>
        </div>

        ${store.esSandboxActivo() ? `
        <!-- CINTILLO / SANDBOX QA BARRA DE CONMUTACIÓN DE ROLES (Solo activo para sandboxadmin@evaluacion.ipvg) -->
        <div class="w-full bg-surface-container-low px-margin py-1.5 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-space-xs text-xs">
          <div class="flex items-center gap-space-xs">
            <span class="inline-flex w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span class="font-metadata font-bold uppercase tracking-wider text-on-surface">Sandbox QA • Conmutador de Roles:</span>
            <span class="text-on-surface-variant hidden md:inline">Prueba la perspectiva de cada actor en tiempo real:</span>
          </div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <button onclick="window.app.authController.handleQALogin('ROLE_FREEMIUM')" class="px-2.5 py-0.5 rounded-full font-label-badge uppercase transition-all ${user && user.esFreemium() ? 'bg-primary text-on-primary font-bold shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}">
              1. Lector Freemium (Mateo)
            </button>
            <button onclick="window.app.authController.handleQALogin('ROLE_MECENAS_PRO')" class="px-2.5 py-0.5 rounded-full font-label-badge uppercase transition-all ${user && user.esMecenasPro() ? 'bg-primary text-on-primary font-bold shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}">
              2. Mecenas PRO (Helena)
            </button>
            <button onclick="window.app.authController.handleQALogin('ROLE_ROOT_ADMIN')" class="px-2.5 py-0.5 rounded-full font-label-badge uppercase transition-all ${user && user.esAdmin() ? 'bg-primary text-on-primary font-bold shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}">
              3. Root Admin (Carlos)
            </button>
            <button onclick="window.app.authController.handleQALogin('GUEST')" class="px-2.5 py-0.5 rounded-full font-label-badge uppercase transition-all ${!user ? 'bg-inverse-surface text-inverse-on-surface font-bold shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-outline'}">
              4. Visitante
            </button>
          </div>
        </div>
        ` : ''}
      </header>
    `;
  },

  attachEvents(controller) {
    const btnAuth = document.getElementById('navbar-auth-action');
    if (btnAuth) {
      btnAuth.onclick = () => {
        if (controller.store.usuarioActual) {
          controller.authController.handleLogout();
          controller.showToast('Sesión cerrada correctamente.', 'info');
        } else {
          controller.navegarA('iniciar-sesion');
        }
      };
    }
  }
};
