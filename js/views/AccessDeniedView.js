/**
 * VISTA: AccessDeniedView (403 Forbidden)
 * Renderiza la pantalla de bloqueo de acceso por control de acceso basado en roles (RBAC).
 * Impide que suscriptores Freemium, Mecenas PRO o visitantes accedan a consolas administrativas.
 */

window.views = window.views || {};

window.views.AccessDeniedView = {
  render({ ruta, usuario, motivo, consolaNombre, esSandbox = false }) {
    const rolNombre = usuario ? usuario.rol.nombre : 'Visitante Anónimo';
    const codigoRol = usuario ? usuario.rol.codigo : 'GUEST';
    const nombreUsuario = usuario ? usuario.nombre : 'Usuario no identificado';

    return `
      <div class="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] w-full pt-28 pb-space-xl px-margin">
        <div class="max-w-2xl w-full bg-surface-container-lowest rounded-3xl p-space-lg md:p-space-xl shadow-lg border border-outline-variant/30 flex flex-col items-center text-center">
          
          <!-- ÍCONO DE BLOQUEO RBAC -->
          <div class="w-20 h-20 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-tertiary shadow-inner mb-space-md">
            <span class="material-symbols-outlined text-[44px]">shield_lock</span>
          </div>

          <!-- BADGE DE SEGURIDAD -->
          <div class="flex items-center gap-space-xs mb-space-xs">
            <span class="font-label-badge text-label-badge uppercase px-space-sm py-1 rounded-full bg-error-container text-on-error-container font-bold tracking-wider">
              Error 403 • Acceso Prohibido (RBAC)
            </span>
            <span class="font-metadata text-metadata text-outline uppercase tracking-wider">• Política de Seguridad Editorial</span>
          </div>

          <!-- TÍTULO Y DESCRIPCIÓN -->
          <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1 mb-space-xs">
            Consola Editorial Restringida
          </h1>
          <p class="font-body-md text-body-md text-on-surface-variant max-w-lg mb-space-lg leading-relaxed">
            ${motivo || 'No dispones de los privilegios administrativos requeridos para acceder a esta área de gobernanza editorial.'}
          </p>

          <!-- TARJETA INFORMATIVA DE IDENTIDAD Y ROL ACTUAL -->
          <div class="w-full bg-surface-container-low rounded-2xl p-space-md mb-space-lg border border-outline-variant/30 text-left flex flex-col gap-space-xs">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs border-b border-outline-variant/20 pb-space-xs">
              <div>
                <span class="font-metadata text-[10px] uppercase text-outline tracking-wider block">Identidad Activa</span>
                <span class="font-headline-sm text-sm font-bold text-on-surface">${nombreUsuario}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-metadata text-[10px] uppercase text-outline tracking-wider">Rol de Sesión:</span>
                <span class="font-label-badge text-label-badge uppercase px-2.5 py-0.5 rounded-full ${codigoRol === 'ROLE_MECENAS_PRO' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container-high text-on-surface'} font-bold">
                  ${rolNombre}
                </span>
              </div>
            </div>

            <div class="pt-space-xs flex items-start gap-2">
              <span class="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">info</span>
              <p class="font-metadata text-metadata text-on-surface-variant leading-relaxed">
                <strong>Separación de Responsabilidades:</strong> La vista solicitada (<code>#${ruta}</code> — ${consolaNombre}) contiene funciones de administración, métricas confidenciales de ingresos y motor de despacho masivo reservadas exclusivamente al equipo de dirección editorial (<code>ROLE_ROOT_ADMIN</code>).
              </p>
            </div>
          </div>

          <!-- BOTONES DE ACCIÓN RÁPIDA -->
          <div class="flex flex-col sm:flex-row items-center gap-space-sm w-full justify-center">
            <button onclick="window.app.navegarA('portada-noticias')" class="w-full sm:w-auto px-space-lg py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[18px]">home</span>
              <span>Volver a Portada</span>
            </button>
            <button onclick="window.app.navegarA('noticia')" class="w-full sm:w-auto px-space-lg py-3 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-headline-sm text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[18px]">menu_book</span>
              <span>Ir a Lectura de Ensayos</span>
            </button>
          </div>

          ${esSandbox ? `
          <!-- ACCESO DIRECTO SANDBOX QA PARA EL EVALUADOR -->
          <div class="mt-space-lg pt-space-md border-t border-outline-variant/20 w-full flex flex-col sm:flex-row items-center justify-between gap-space-sm">
            <span class="font-metadata text-[11px] text-outline text-center sm:text-left">
              Modo Sandbox activo: Conmuta a Root Admin:
            </span>
            <button onclick="window.app.authController.handleQALogin('ROLE_ROOT_ADMIN'); window.app.navegarA('${ruta}');" class="px-space-md py-1.5 rounded-full bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary font-label-badge text-label-badge uppercase transition-all font-bold shrink-0">
              Desbloquear como Root Admin →
            </button>
          </div>
          ` : ''}

        </div>
      </div>
    `;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.views.AccessDeniedView;
}
