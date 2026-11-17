/**
 * VISTA: AdminAudienciasView
 * Consola Admin — Audiencias, Cohortes, Métricas y Directorio RBAC (SCREEN_17 / RF-05).
 * Implementa Escenario 5.1 (KPIs y Embudo) y Escenario 5.2 (Filtro, Búsqueda y Auditoría).
 */

window.views = window.views || {};

window.views.AdminAudienciasView = {
  render(metricas, suscriptores) {
    return `
      <div class="flex flex-col w-full pt-28 pb-space-xl">
        <div class="w-full max-w-7xl mx-auto px-margin py-space-md">
          <!-- CABECERA DE SECCIÓN ADMIN -->
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg">
            <div class="flex flex-col gap-space-xs">
              <div class="flex items-center gap-space-xs">
                <span class="font-label-badge text-label-badge uppercase tracking-wider px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                  Módulo RF-05 • Control Administrativo
                </span>
                <span class="font-metadata text-metadata text-outline uppercase tracking-wider">• Auditoría Cuatrimestral</span>
              </div>
              <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">Audiencias, Rendimiento &amp; Cohortes</h1>
              <p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Monitorización en tiempo real del embudo de monetización, retención de lectores de fondo y gobernanza granular de mecenazgo cultural.
              </p>
            </div>
            
            <div class="flex items-center gap-space-sm flex-wrap">
              <button onclick="window.views.AdminAudienciasView.exportarCSV()" class="flex items-center gap-space-xs px-space-md py-space-sm rounded-full bg-primary text-on-primary font-headline-sm text-[13px] tracking-wide shadow-md hover:bg-primary-container transition-all">
                <span class="material-symbols-outlined text-[18px]">download</span>
                <span>Exportar CSV Cohortes</span>
              </button>
            </div>
          </div>

          <!-- BENTO GRID DE KPIS GLOBALES (RF-05 Escenario 5.1) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md mb-space-lg">
            <!-- Card 1: Total Suscriptores -->
            <div class="flex flex-col justify-between p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
              <div class="flex items-start justify-between">
                <span class="font-metadata text-metadata uppercase tracking-wider text-on-surface-variant font-bold">Total Suscriptores</span>
                <span class="flex items-center text-primary font-metadata text-metadata font-bold bg-primary-fixed px-1.5 py-0.5 rounded-full">
                  <span class="material-symbols-outlined text-[13px] mr-0.5">trending_up</span>+14%
                </span>
              </div>
              <div class="my-space-sm">
                <div class="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">${metricas.totalSuscriptores}</div>
                <p class="font-metadata text-metadata text-outline mt-0.5">Base activa verificada</p>
              </div>
              <div class="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div class="bg-primary h-1.5 rounded-full" style="width: 100%"></div>
              </div>
            </div>

            <!-- Card 2: Audiencia Freemium -->
            <div class="flex flex-col justify-between p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
              <div class="flex items-start justify-between">
                <span class="font-metadata text-metadata uppercase tracking-wider text-on-surface-variant font-bold">Audiencia Freemium</span>
                <span class="font-label-badge text-label-badge bg-surface-container-high text-on-secondary-fixed-variant px-1.5 py-0.5 rounded-full font-bold">
                  ${metricas.porcentajeFreemium}%
                </span>
              </div>
              <div class="my-space-sm">
                <div class="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">${metricas.audienciaFreemium}</div>
                <p class="font-metadata text-metadata text-outline mt-0.5">Lectores de entrada libre</p>
              </div>
              <div class="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div class="bg-secondary h-1.5 rounded-full" style="width: ${metricas.porcentajeFreemium}%"></div>
              </div>
            </div>

            <!-- Card 3: Mecenas PRO Activos -->
            <div class="flex flex-col justify-between p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
              <div class="flex items-start justify-between">
                <span class="font-metadata text-metadata uppercase tracking-wider text-primary font-bold">Mecenas PRO</span>
                <span class="font-label-badge text-label-badge bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded-full font-bold">
                  ${metricas.porcentajePro}%
                </span>
              </div>
              <div class="my-space-sm">
                <div class="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">${metricas.mecenasProActivos}</div>
                <p class="font-metadata text-metadata text-outline mt-0.5">Acceso irrestricto + Dossiers</p>
              </div>
              <div class="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div class="bg-primary h-1.5 rounded-full" style="width: ${metricas.porcentajePro}%"></div>
              </div>
            </div>

            <!-- Card 4: Tasa Conversión -->
            <div class="flex flex-col justify-between p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
              <div class="flex items-start justify-between">
                <span class="font-metadata text-metadata uppercase tracking-wider text-on-surface-variant font-bold">Conv. a Pago</span>
                <span class="flex items-center text-primary font-metadata text-metadata font-bold bg-primary-fixed px-1.5 py-0.5 rounded-full">
                  +0.7pp
                </span>
              </div>
              <div class="my-space-sm">
                <div class="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">${metricas.tasaConversion}%</div>
                <p class="font-metadata text-metadata text-outline mt-0.5">Benchmark editorial: 3.2%</p>
              </div>
              <div class="flex items-center gap-1.5 text-primary text-xs font-metadata font-medium">
                <span class="material-symbols-outlined text-[15px]">verified</span>
                <span>Sobre promedio cultural</span>
              </div>
            </div>

            <!-- Card 5: MRR Facturado -->
            <div class="flex flex-col justify-between p-space-md rounded-2xl bg-inverse-surface text-inverse-on-surface shadow-sm border border-outline/30">
              <div class="flex items-start justify-between">
                <span class="font-metadata text-metadata uppercase tracking-wider text-inverse-primary font-bold">MRR Facturado</span>
                <span class="font-label-badge text-label-badge bg-tertiary text-on-tertiary px-1.5 py-0.5 rounded-full font-bold">STRIPE LIVE</span>
              </div>
              <div class="my-space-sm">
                <div class="font-headline-lg text-headline-lg text-surface-container-lowest font-bold tracking-tight">$${metricas.mrrFacturado} USD</div>
                <p class="font-metadata text-metadata text-outline-variant mt-0.5">Ingreso mensual recurrente</p>
              </div>
              <div class="flex items-center gap-1.5 text-inverse-primary text-xs font-metadata font-medium">
                <span class="material-symbols-outlined text-[15px]">security</span>
                <span>Soberanía comunitaria</span>
              </div>
            </div>
          </div>

          <!-- FILA SECUNDARIA: EMBUDO DEL PAYWALL (RF-05.1) + GRÁFICO DE COHORTES -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-md mb-space-lg">
            <!-- Embudo de Conversión Paywall (6 Cols) -->
            <div class="lg:col-span-6 p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div class="flex items-center justify-between pb-space-xs border-b border-outline-variant/20 mb-space-sm">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-[20px]">filter_alt</span>
                  <h3 class="font-headline-sm text-headline-sm text-on-surface">Embudo Paywall (Ciclo Activo)</h3>
                </div>
                <span class="font-label-badge text-label-badge px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                  RF-05.1
                </span>
              </div>

              <div class="space-y-space-sm">
                <!-- Etapa 1 -->
                <div class="p-space-xs rounded-xl bg-surface-container-low flex flex-col gap-1">
                  <div class="flex justify-between items-baseline font-metadata text-xs">
                    <span class="font-bold text-on-surface">1. Impacto con Paywall</span>
                    <strong class="text-on-surface">${metricas.embudoPaywall.impactos.volumen} lecturas (100%)</strong>
                  </div>
                  <div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div class="bg-secondary h-full rounded-full" style="width: 100%"></div>
                  </div>
                </div>

                <!-- Etapa 2 -->
                <div class="p-space-xs rounded-xl bg-surface-container-low flex flex-col gap-1">
                  <div class="flex justify-between items-baseline font-metadata text-xs">
                    <span class="font-bold text-primary">2. Clics en Desbloqueo</span>
                    <strong class="text-primary">${metricas.embudoPaywall.clicsDesbloqueo.volumen} clics (${metricas.embudoPaywall.clicsDesbloqueo.tasa})</strong>
                  </div>
                  <div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div class="bg-primary h-full rounded-full" style="width: 20%"></div>
                  </div>
                </div>

                <!-- Etapa 3 -->
                <div class="p-space-xs rounded-xl bg-surface-container-low flex flex-col gap-1">
                  <div class="flex justify-between items-baseline font-metadata text-xs">
                    <span class="font-bold text-tertiary">3. Upgrades Completados</span>
                    <strong class="text-tertiary">${metricas.embudoPaywall.upgradesCompletados.volumen} nuevos mecenas (${metricas.embudoPaywall.upgradesCompletados.tasa})</strong>
                  </div>
                  <div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div class="bg-tertiary h-full rounded-full" style="width: 23.9%"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Gráfico de Retención por Cohortes Semestrales (6 Cols) -->
            <div class="lg:col-span-6 p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div class="flex items-center justify-between pb-space-xs border-b border-outline-variant/20 mb-space-sm">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-[20px]">show_chart</span>
                  <h3 class="font-headline-sm text-headline-sm text-on-surface">Retención Semestral (Ene - Jun)</h3>
                </div>
                <div class="flex items-center gap-3 text-xs font-metadata">
                  <span class="flex items-center gap-1 text-primary font-bold"><span class="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span> PRO</span>
                  <span class="flex items-center gap-1 text-secondary font-bold"><span class="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span> Freemium</span>
                </div>
              </div>

              <!-- Barras de cohortes comparadas -->
              <div class="grid grid-cols-6 gap-2 items-end h-40 pt-space-xs px-2">
                ${(metricas.cohortes || []).map(c => `
                  <div class="flex flex-col items-center gap-1 h-full justify-end">
                    <div class="flex items-end gap-1 h-28 w-full justify-center">
                      <div class="w-3.5 bg-secondary rounded-t transition-all" style="height: ${c.freemium}%" title="Freemium: ${c.freemium}%"></div>
                      <div class="w-3.5 bg-primary rounded-t transition-all" style="height: ${c.pro}%" title="Mecenas PRO: ${c.pro}%"></div>
                    </div>
                    <span class="font-metadata text-[10px] uppercase font-bold text-outline">${c.mes}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- TABLA: DIRECTORIO DE SUSCRIPTORES Y AUDITORÍA RBAC (RF-05 Escenario 5.2) -->
          <div class="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-xs border-b border-outline-variant/20">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">contacts</span>
                <h3 class="font-headline-sm text-headline-sm text-on-surface">Directorio de Suscriptores (RBAC)</h3>
              </div>

              <!-- Filtros de Rol & Búsqueda (Escenario 5.2) -->
              <div class="flex items-center gap-space-sm flex-wrap">
                <!-- Filtros de Chips -->
                <div class="flex items-center gap-1 bg-surface-container-low p-1 rounded-full text-xs font-label-badge uppercase">
                  <button onclick="window.views.AdminAudienciasView.filtrarPorRol('todos')" class="px-2.5 py-0.5 rounded-full transition-all ${window.app.adminController.filtroRolActivo === 'todos' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant'}">
                    Todos
                  </button>
                  <button onclick="window.views.AdminAudienciasView.filtrarPorRol('freemium')" class="px-2.5 py-0.5 rounded-full transition-all ${window.app.adminController.filtroRolActivo === 'freemium' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant'}">
                    Freemium
                  </button>
                  <button onclick="window.views.AdminAudienciasView.filtrarPorRol('pro')" class="px-2.5 py-0.5 rounded-full transition-all ${window.app.adminController.filtroRolActivo === 'pro' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant'}">
                    Mecenas PRO
                  </button>
                </div>

                <!-- Input de Búsqueda Rápida (Escenario 5.2: Julián T. Valdés) -->
                <div class="relative flex items-center">
                  <span class="material-symbols-outlined absolute left-2.5 text-secondary text-[16px]">search</span>
                  <input type="text" id="directory-search-input" placeholder="Buscar por nombre o correo..." value="${window.app.adminController.busquedaActiva || ''}" class="pl-8 pr-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-xs outline-none focus:border-primary w-52" />
                </div>
              </div>
            </div>

            <!-- Tabla de Suscriptores -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs font-body-sm border-collapse">
                <thead>
                  <tr class="border-b border-outline-variant/30 text-outline font-metadata uppercase text-[11px]">
                    <th class="py-2.5 px-3">Suscriptor</th>
                    <th class="py-2.5 px-3">Correo Electrónico</th>
                    <th class="py-2.5 px-3">Rol Asignado</th>
                    <th class="py-2.5 px-3">Open Rate</th>
                    <th class="py-2.5 px-3">Último Boletín</th>
                    <th class="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/20">
                  ${suscriptores.length ? suscriptores.map(u => `
                    <tr class="hover:bg-surface-container-low transition-colors">
                      <td class="py-3 px-3 font-bold text-on-surface">${u.nombre}</td>
                      <td class="py-3 px-3 text-on-surface-variant font-mono">${u.correo}</td>
                      <td class="py-3 px-3">
                        <span class="font-label-badge text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${
                          u.esAdmin() ? 'bg-secondary-container text-on-secondary-container' :
                          u.esMecenasPro() ? 'bg-primary-fixed text-on-primary-fixed' :
                          'bg-surface-container text-on-surface'
                        }">
                          ${u.rol.nombre}
                        </span>
                      </td>
                      <td class="py-3 px-3 font-bold ${u.openRate >= 60 ? 'text-primary' : 'text-on-surface-variant'}">
                        ${u.openRate}%
                      </td>
                      <td class="py-3 px-3 text-on-surface-variant truncate max-w-xs">${u.ultimoBoletin}</td>
                      <td class="py-3 px-3 text-right">
                        <button onclick="window.views.AdminAudienciasView.abrirModalAuditoria(${u.idUsuario})" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-badge uppercase text-[10px] font-bold transition-all shadow-sm">
                          <span class="material-symbols-outlined text-[13px]">history</span>
                          <span>Auditar Trazas</span>
                        </button>
                      </td>
                    </tr>
                  `).join('') : `
                    <tr>
                      <td colspan="6" class="py-6 text-center text-outline font-metadata text-sm">
                        No se encontraron suscriptores con los criterios de búsqueda aplicados.
                      </td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- MODAL DE AUDITORÍA DE TRAZAS DE LECTURA (Escenario 5.2) -->
        <div id="modal-audit" class="hidden fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-margin">
          <div class="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-space-lg shadow-2xl border border-outline-variant/40 flex flex-col gap-space-sm max-h-[85vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">shield</span>
                <h3 class="font-headline-sm text-headline-sm text-on-surface">Auditoría de Trazas de Lectura (RBAC)</h3>
              </div>
              <button onclick="window.views.AdminAudienciasView.cerrarModalAuditoria()" class="text-outline hover:text-on-surface">
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div id="modal-audit-body" class="space-y-space-sm text-xs font-body-sm">
              <!-- Inyectado dinámicamente -->
            </div>

            <div class="flex justify-end pt-space-xs border-t border-outline-variant/20">
              <button onclick="window.views.AdminAudienciasView.cerrarModalAuditoria()" class="px-space-md py-2 rounded-full bg-surface-container-high text-on-surface font-label-badge uppercase font-bold text-xs">
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  attachEvents(app) {
    const searchInput = document.getElementById('directory-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        app.adminController.busquedaActiva = e.target.value;
        app.reRenderRutaActual();
        // Mantiene el foco en el input tras re-renderizar
        setTimeout(() => {
          const reInput = document.getElementById('directory-search-input');
          if (reInput) {
            reInput.focus();
            reInput.setSelectionRange(reInput.value.length, reInput.value.length);
          }
        }, 50);
      });
    }
  },

  filtrarPorRol(rol) {
    window.app.adminController.filtroRolActivo = rol;
    window.app.reRenderRutaActual();
  },

  abrirModalAuditoria(idUsuario) {
    const data = window.app.adminController.obtenerTrazasAuditoriaUsuario(idUsuario);
    if (!data) return;

    const modal = document.getElementById('modal-audit');
    const body = document.getElementById('modal-audit-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="p-space-sm bg-surface-container-low rounded-xl">
        <div class="flex justify-between items-baseline font-metadata text-xs mb-1">
          <strong class="text-on-surface font-bold text-sm">${data.usuario.nombre}</strong>
          <span class="font-label-badge px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed uppercase font-bold">${data.usuario.rol}</span>
        </div>
        <div class="text-outline text-xs font-mono">${data.usuario.correo}</div>
      </div>

      <div class="space-y-2 mt-2">
        <span class="font-metadata text-xs font-bold uppercase text-on-surface tracking-wider block">Historial de Accesos y Colisiones con Paywall:</span>
        ${data.trazas.length ? data.trazas.map(t => `
          <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col gap-0.5 border border-outline-variant/20">
            <div class="flex justify-between text-[11px] font-metadata text-outline">
              <span>${t.fecha}</span>
              <span class="font-mono">${t.ipSimulada}</span>
            </div>
            <p class="font-body-sm text-on-surface font-medium">${t.evento}</p>
          </div>
        `).join('') : `
          <p class="text-outline italic p-3 text-center">Sin colisiones ni bloqueos de paywall registrados recientemente.</p>
        `}
      </div>
    `;

    modal.classList.remove('hidden');
  },

  cerrarModalAuditoria() {
    const modal = document.getElementById('modal-audit');
    if (modal) modal.classList.add('hidden');
  },

  exportarCSV() {
    try {
      const csvContent = "data:text/csv;charset=utf-8,Mes,Retencion_Freemium,Retencion_Pro\nEne,92%,98%\nFeb,86%,95%\nMar,79%,93%\nAbr,74%,91%\nMay,71%,90%\nJun,68%,89%\n";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "cohortes_atelier_2026.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn('Descarga nativa CSV no disponible en este entorno:', e);
    }
    window.app.showToast('Exportación de Cohortes generada con éxito (cohortes_atelier_2026.csv)', 'success');
  }
};
