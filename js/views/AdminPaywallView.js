/**
 * VISTA: AdminPaywallView
 * Vista Previa de Envíos, Comparador Simultáneo Freemium vs PRO y Despacho Masivo (SCREEN_25 / SCREEN_33 / RF-04).
 * Implementa Escenario 4.1 y el Diagrama de Actividades de Envío.
 */

window.views = window.views || {};

window.views.AdminPaywallView = {
  render(previewData, metaData = {}) {
    const { newsletter, versionFreemium, versionPro, telemetria } = previewData;
    const mecenasActivos = metaData.mecenasActivos ?? telemetria.colaPro ?? 342;
    const metaPremium = metaData.metaPremium ?? 500;
    const porcentajeMeta = Math.min(100, Math.round((mecenasActivos / Math.max(metaPremium, 1)) * 100));
    const precios = metaData.precios || { precio_mensual_clp: 8990, precio_anual_clp: 89900 };
    const descuentos = metaData.descuentos || [];

    return `
      <div class="flex flex-col w-full pt-28 pb-space-xl">
        <div class="w-full max-w-7xl mx-auto px-margin py-space-md">
          <!-- CABECERA DE LA CONSOLA DE ENVÍOS -->
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg">
            <div class="flex flex-col gap-space-xs">
              <div class="flex items-center gap-space-xs">
                <span class="font-label-badge text-label-badge uppercase tracking-wider px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                  Módulo RF-04 &amp; RNF-01 • Envío Personalizado
                </span>
                <span class="font-metadata text-metadata text-outline uppercase tracking-wider">• Despacho Segmentado</span>
              </div>
              <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Vista Previa de Envíos &amp; Comparador Diferenciado
              </h1>
              <p class="font-body-md text-body-md text-on-surface-variant max-w-3xl">
                Previsualización simultánea de la plantilla segmentada antes del envío masivo. Compara cómo recibirá el boletín un suscriptor Freemium frente a un Mecenas PRO.
              </p>
            </div>

            <!-- Botón de Envío Masivo -->
            <button id="btn-trigger-mass-mail" class="flex items-center gap-space-xs px-space-lg py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-sm font-bold tracking-wide shadow-md transition-all shrink-0">
              <span class="material-symbols-outlined text-[18px]">send</span>
              <span>Confirmar y Simular Lote de Envío Masivo</span>
            </button>
          </div>

          <!-- META DE SUSCRIPCIONES PREMIUM (CONFIGURABLE Y PERSISTIDA EN MYSQL) -->
          <div class="p-space-md rounded-2xl bg-surface-container-lowest border border-primary/30 shadow-sm mb-space-lg flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div class="flex-1 flex flex-col gap-2">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">flag</span>
                <h2 class="font-headline-sm text-headline-sm text-on-surface">Meta de Suscripciones Premium (Mecenas PRO)</h2>
                <span class="font-label-badge text-[10px] uppercase px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">
                  ${porcentajeMeta}% cumplido
                </span>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface-variant">
                Actualmente hay <strong class="text-primary">${mecenasActivos.toLocaleString('es-CL')}</strong> mecenas PRO activos de una meta de <strong class="text-on-surface">${metaPremium.toLocaleString('es-CL')}</strong> suscripciones ($8.990 CLP/mes o $89.900 CLP/año).
              </p>
              <div class="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div class="bg-primary h-full rounded-full transition-all duration-500" style="width: ${porcentajeMeta}%"></div>
              </div>
            </div>

            <form id="form-meta-premium" class="flex items-center gap-2 shrink-0 bg-surface-container-low p-2 rounded-xl border border-outline-variant/30">
              <label for="input-meta-premium" class="font-metadata text-xs uppercase font-bold text-on-surface px-2">Nueva Meta:</label>
              <input id="input-meta-premium" type="number" min="1" step="1" required value="${metaPremium}" class="w-28 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-on-surface font-mono text-sm font-bold outline-none focus:border-primary" />
              <button type="submit" class="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-badge uppercase text-xs font-bold transition-all shadow-sm">
                Guardar Meta
              </button>
            </form>
          </div>

          <!-- GESTIÓN DE PRECIOS CLP Y DESCUENTOS / CÓDIGOS PROMOCIONALES -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-md mb-space-lg items-start">
            <!-- Modificar Precios de Suscripción (5 cols) -->
            <div class="lg:col-span-5 p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col gap-space-sm">
              <div class="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
                <span class="material-symbols-outlined text-primary text-[20px]">payments</span>
                <h3 class="font-headline-sm text-sm font-bold uppercase text-on-surface">Precios de Suscripción (CLP)</h3>
              </div>
              <form id="form-precios-clp" class="flex flex-col gap-space-sm">
                <div class="grid grid-cols-2 gap-space-sm">
                  <div class="flex flex-col gap-1">
                    <label for="input-precio-mensual" class="font-metadata text-[11px] uppercase font-bold text-on-surface">Plan Mensual (CLP)</label>
                    <input id="input-precio-mensual" type="number" min="100" step="10" required value="${precios.precio_mensual_clp}" class="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-mono text-sm font-bold outline-none focus:border-primary" />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label for="input-precio-anual" class="font-metadata text-[11px] uppercase font-bold text-on-surface">Plan Anual (CLP)</label>
                    <input id="input-precio-anual" type="number" min="100" step="10" required value="${precios.precio_anual_clp}" class="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-mono text-sm font-bold outline-none focus:border-primary" />
                  </div>
                </div>
                <button type="submit" class="w-full py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-badge uppercase text-xs font-bold shadow-sm transition-all">
                  Actualizar Precios de Suscripción
                </button>
              </form>
            </div>

            <!-- Crear Códigos de Descuento o Descuentos Temporales (7 cols) -->
            <div class="lg:col-span-7 p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col gap-space-sm">
              <div class="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-tertiary text-[20px]">sell</span>
                  <h3 class="font-headline-sm text-sm font-bold uppercase text-on-surface">Códigos de Descuento &amp; Promociones Temporales</h3>
                </div>
                <span class="font-metadata text-[11px] text-outline">${descuentos.length} configurados</span>
              </div>

              <form id="form-crear-descuento" class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                <div class="sm:col-span-3 flex flex-col gap-1">
                  <label class="font-metadata text-[10px] uppercase font-bold text-on-surface">Tipo</label>
                  <select id="desc-tipo" class="px-2.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-body-sm text-on-surface outline-none focus:border-primary">
                    <option value="codigo">Código Promo</option>
                    <option value="temporal">Desc. Temporal</option>
                  </select>
                </div>
                <div class="sm:col-span-3 flex flex-col gap-1" id="wrap-desc-codigo">
                  <label class="font-metadata text-[10px] uppercase font-bold text-on-surface">Código</label>
                  <input id="desc-codigo" type="text" placeholder="EJ: CYBER25" class="px-2.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono uppercase text-on-surface outline-none focus:border-primary" />
                </div>
                <div class="sm:col-span-4 flex flex-col gap-1">
                  <label class="font-metadata text-[10px] uppercase font-bold text-on-surface">Nombre / Campaña</label>
                  <input id="desc-nombre" type="text" required placeholder="Ej: Cyber Editorial" class="px-2.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-body-sm text-on-surface outline-none focus:border-primary" />
                </div>
                <div class="sm:col-span-2 flex flex-col gap-1">
                  <label class="font-metadata text-[10px] uppercase font-bold text-on-surface">% Desc.</label>
                  <input id="desc-porcentaje" type="number" min="1" max="90" required value="20" class="px-2.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono font-bold text-on-surface outline-none focus:border-primary" />
                </div>
                <div class="sm:col-span-4 flex flex-col gap-1">
                  <label class="font-metadata text-[10px] uppercase font-bold text-on-surface">Inicio (Opcional)</label>
                  <input id="desc-inicio" type="date" class="px-2.5 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface outline-none focus:border-primary" />
                </div>
                <div class="sm:col-span-4 flex flex-col gap-1">
                  <label class="font-metadata text-[10px] uppercase font-bold text-on-surface">Vence (Opcional)</label>
                  <input id="desc-fin" type="date" class="px-2.5 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface outline-none focus:border-primary" />
                </div>
                <div class="sm:col-span-4">
                  <button type="submit" class="w-full py-2 rounded-xl bg-tertiary hover:bg-tertiary-container text-on-tertiary font-label-badge uppercase text-xs font-bold shadow-sm transition-all">
                    Crear Descuento
                  </button>
                </div>
              </form>

              <!-- Lista de descuentos -->
              <div class="space-y-1.5 max-h-40 overflow-y-auto pt-2 border-t border-outline-variant/20">
                ${descuentos.length ? descuentos.map(d => `
                  <div class="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-surface-container-low text-xs">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-label-badge text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${d.tipo === 'codigo' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed'}">
                        ${d.tipo === 'codigo' ? (d.codigo || 'CÓDIGO') : 'TEMPORAL'}
                      </span>
                      <strong class="text-on-surface">${d.nombre}</strong>
                      <span class="font-mono font-bold text-primary">-${d.porcentaje_descuento}%</span>
                      ${d.fecha_fin ? `<span class="text-[10px] text-outline">Hasta ${new Date(d.fecha_fin).toLocaleDateString('es-CL')}</span>` : ''}
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" onclick="window.views.AdminPaywallView.toggleDescuento(${d.id_descuento})" class="px-2 py-0.5 rounded-full font-label-badge text-[9px] uppercase font-bold ${d.activo ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'}">
                        ${d.activo ? 'Activo' : 'Pausado'}
                      </button>
                      <button type="button" onclick="window.views.AdminPaywallView.eliminarDescuento(${d.id_descuento})" class="p-1 text-outline hover:text-error" title="Eliminar">
                        <span class="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                  </div>
                `).join('') : '<p class="text-xs text-outline text-center py-2">No hay códigos ni descuentos creados.</p>'}
              </div>
            </div>
          </div>

          <!-- PANEL DE TELEMETRÍA TÉCNICA (RNF-01) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
            <!-- Telemetría 1: Peso HTML Freemium -->
            <div class="p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
              <span class="font-metadata text-xs font-bold uppercase text-on-surface-variant">Peso Plantilla Freemium</span>
              <div class="my-2">
                <span class="text-3xl font-display-hero text-primary font-bold">${telemetria.pesoHtmlFreemiumKb} KB</span>
                <span class="font-label-badge text-[9px] uppercase px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold ml-2">Cumple RNF-01 (&lt;60 KB)</span>
              </div>
              <span class="font-metadata text-[11px] text-outline">Optimizado para bandejas de correo</span>
            </div>

            <!-- Telemetría 2: Latencia de Renderizado -->
            <div class="p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
              <span class="font-metadata text-xs font-bold uppercase text-on-surface-variant">Latencia de Renderizado</span>
              <div class="my-2">
                <span class="text-3xl font-display-hero text-primary font-bold">${telemetria.latenciaRenderSeg} s</span>
                <span class="font-label-badge text-[9px] uppercase px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold ml-2">SLA &lt;1.2s</span>
              </div>
              <span class="font-metadata text-[11px] text-outline">Medición con 100 usuarios concurrentes</span>
            </div>

            <!-- Telemetría 3: Cola de Salida Freemium -->
            <div class="p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
              <span class="font-metadata text-xs font-bold uppercase text-on-surface-variant">Destinatarios Freemium</span>
              <div class="my-2">
                <span class="text-3xl font-display-hero text-on-surface font-bold">${telemetria.colaFreemium}</span>
                <span class="text-xs font-metadata text-outline ml-1">lectores (84.3%)</span>
              </div>
              <span class="font-metadata text-[11px] text-outline">Versión con Paywall Teaser</span>
            </div>

            <!-- Telemetría 4: Cola de Salida PRO -->
            <div class="p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
              <span class="font-metadata text-xs font-bold uppercase text-on-surface-variant">Destinatarios Mecenas PRO</span>
              <div class="my-2">
                <span class="text-3xl font-display-hero text-primary font-bold">${telemetria.colaPro}</span>
                <span class="text-xs font-metadata text-outline ml-1">mecenas (15.7%)</span>
              </div>
              <span class="font-metadata text-[11px] text-outline">Versión Completa + Datasets</span>
            </div>
          </div>

          <!-- COMPARADOR SIMULTÁNEO EN PANTALLA DIVIDIDA (RF-04 Escenario 4.1) -->
          <div class="flex items-center justify-between pb-space-xs mb-space-sm">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">splitscreen</span>
              <h2 class="font-headline-sm text-headline-sm text-on-surface">Comparador Simultáneo Freemium vs. Premium</h2>
            </div>
            <span class="font-metadata text-xs text-outline">Borrador: Despacho Semanal Nº ${newsletter.numeroEdicion}</span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-space-lg items-start">
            <!-- COLUMNA IZQUIERDA: PLANTILLA FREEMIUM CON TEASER -->
            <div class="flex flex-col bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-outline-variant/40">
              <div class="flex items-center justify-between pb-space-xs border-b border-outline-variant/20 mb-space-sm">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-secondary"></span>
                  <span class="font-headline-sm text-sm font-bold text-on-surface uppercase">1. Plantilla Freemium (Abierta)</span>
                </div>
                <span class="font-label-badge text-label-badge uppercase px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-bold">
                  ${versionFreemium.estimacionPesoKb} KB
                </span>
              </div>

              <!-- Vista previa de correo / asunto -->
              <div class="p-2.5 rounded-xl bg-surface-container-low text-xs font-metadata mb-space-sm space-y-0.5">
                <div><strong>Asunto:</strong> ${versionFreemium.asunto}</div>
                <div><strong>Para:</strong> ${versionFreemium.destinatario} (${versionFreemium.rol})</div>
              </div>

              <!-- Contenido renderizado -->
              <div class="font-body-md text-xs space-y-2 p-3 bg-surface-container-low rounded-xl text-on-surface leading-relaxed">
                <h4 class="font-headline-sm text-sm text-on-surface font-bold">${newsletter.titulo}</h4>
                <p>Hemos aceptado con una docilidad alarmante que el pensamiento debe sincronizarse con los impulsos nerviosos de un feed algorítmico...</p>
                <p>El diseño de la persuasión —heredero bastardo del conductismo skinneriano— busca la permanencia desasosegada...</p>
                
                <!-- Corte de Paywall Teaser -->
                <div class="relative overflow-hidden pt-1 pb-3 text-center border-t-2 border-dashed border-primary/40 mt-3">
                  <span class="font-label-badge text-[9px] uppercase px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold inline-block mb-2">
                    Límite Freemium • Umbral Párrafo #3
                  </span>
                  <div class="p-3 bg-inverse-surface text-inverse-on-surface rounded-xl text-left space-y-1.5 shadow-md">
                    <span class="font-metadata text-[10px] uppercase text-inverse-primary font-bold block">Contenido Restringido</span>
                    <strong class="font-headline-sm text-xs text-surface-container-lowest block">Este ensayo continúa para la comunidad de mecenas</strong>
                    <ul class="text-[10px] font-metadata space-y-0.5 opacity-90">
                      <li>✓ Monografía completa de 3.200 palabras</li>
                      <li>✓ Toolkit de Auditoría de Modelos v2.4</li>
                    </ul>
                    <a href="#portal-suscripcion" class="inline-block mt-1 px-3 py-1 bg-primary text-on-primary rounded-full text-[10px] font-label-badge uppercase font-bold">
                      Unirme como Mecenas ($8.990 CLP / mes)
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- COLUMNA DERECHA: VERSIÓN PRO COMPLETA -->
            <div class="flex flex-col bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border-2 border-primary/40">
              <div class="flex items-center justify-between pb-space-xs border-b border-outline-variant/20 mb-space-sm">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-primary"></span>
                  <span class="font-headline-sm text-sm font-bold text-primary uppercase">2. Plantilla Mecenas PRO (Íntegra)</span>
                </div>
                <span class="font-label-badge text-label-badge uppercase px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">
                  ${versionPro.estimacionPesoKb} KB • COMPLETA
                </span>
              </div>

              <!-- Vista previa de correo / asunto -->
              <div class="p-2.5 rounded-xl bg-surface-container-low text-xs font-metadata mb-space-sm space-y-0.5">
                <div><strong>Asunto:</strong> ${versionPro.asunto}</div>
                <div><strong>Para:</strong> ${versionPro.destinatario} (${versionPro.rol})</div>
              </div>

              <!-- Contenido renderizado -->
              <div class="font-body-md text-xs space-y-2 p-3 bg-surface-container-low rounded-xl text-on-surface leading-relaxed">
                <h4 class="font-headline-sm text-sm text-on-surface font-bold">${newsletter.titulo}</h4>
                <p>Hemos aceptado con una docilidad alarmante que el pensamiento debe sincronizarse con los impulsos nerviosos de un feed algorítmico...</p>
                <p>El diseño de la persuasión —heredero bastardo del conductismo skinneriano— busca la permanencia desasosegada...</p>
                
                <!-- Bloques PRO Desbloqueados -->
                <div class="p-2.5 bg-primary-fixed/20 rounded-xl border border-primary/20 space-y-1">
                  <span class="font-label-badge text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-primary text-on-primary font-bold">ZONA PRO ACTIVA</span>
                  <strong class="font-headline-sm text-xs text-on-surface block">Desglose Técnico de Infraestructura &amp; Costos de Inferencia</strong>
                  <p class="text-[11px] text-on-surface-variant">Evaluamos más de 45 millones de tokens en clusters de GPU. Rendimientos decrecientes comprobados.</p>
                </div>

                <div class="p-2.5 bg-surface-container rounded-xl flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-primary text-[16px]">attachment</span>
                    <span class="font-metadata text-[11px] font-bold">Toolkit de Auditoría de Modelos v2.4 .tar.gz (4.8 MB)</span>
                  </div>
                  <span class="font-label-badge text-[9px] uppercase px-2 py-0.5 rounded-full bg-primary text-on-primary font-bold">Habilitado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL DE PROGRESO DE ENVÍO MASIVO (DIAGRAMA DE ACTIVIDADES) -->
        <div id="modal-mail-progress" class="hidden fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-margin">
          <div class="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-2xl border border-outline-variant/40 flex flex-col gap-space-md">
            <div class="flex items-center gap-2 pb-space-xs border-b border-outline-variant/20">
              <span class="material-symbols-outlined text-primary text-[24px]">forward_to_inbox</span>
              <h3 class="font-headline-sm text-headline-sm text-on-surface">Motor de Envío Masivo Segmentado (RF-04)</h3>
            </div>

            <div class="space-y-space-sm text-xs font-body-sm">
              <p class="text-on-surface-variant" id="mail-modal-status-text">
                Ejecutando algoritmo de personalización según el Diagrama de Actividades...
              </p>

              <!-- Barra de Progreso -->
              <div class="w-full bg-surface-container-high h-3 rounded-full overflow-hidden p-0.5">
                <div id="mail-progress-bar" class="bg-primary h-full rounded-full transition-all duration-100 ease-out" style="width: 0%"></div>
              </div>

              <div class="flex justify-between font-metadata text-[11px] text-outline">
                <span id="mail-progress-count">0 / ${telemetria.totalDestinatarios}</span>
                <span id="mail-progress-pct">0%</span>
              </div>

              <!-- Registro de entrega (Logs) -->
              <div id="mail-delivery-logs" class="p-space-xs rounded-xl bg-surface-container-low max-h-40 overflow-y-auto font-mono text-[11px] space-y-1">
                <div>[00:00.01] Consultando lista de suscriptores (Total: ${telemetria.totalDestinatarios})...</div>
              </div>
            </div>

            <div class="flex justify-end pt-space-xs border-t border-outline-variant/20" id="mail-modal-actions">
              <button disabled id="btn-close-mail-modal" onclick="window.views.AdminPaywallView.cerrarModalProgreso()" class="px-space-md py-2 rounded-full bg-surface-container-high text-on-surface font-label-badge uppercase font-bold text-xs opacity-50 cursor-not-allowed">
                Cerrar Reporte
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  attachEvents(app) {
    const formMeta = document.getElementById('form-meta-premium');
    if (formMeta) {
      formMeta.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('input-meta-premium');
        const valor = input ? parseInt(input.value, 10) : 0;
        const res = await app.adminController.guardarMetaPremium(valor);
        if (res && res.exito) {
          app.showToast(res.mensaje || 'Meta de suscripciones premium actualizada.', 'success');
          app.reRenderRutaActual();
        } else {
          app.showToast((res && res.mensaje) || 'No se pudo actualizar la meta.', 'error');
        }
      });
    }

    const formPrecios = document.getElementById('form-precios-clp');
    if (formPrecios) {
      formPrecios.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mensual = document.getElementById('input-precio-mensual')?.value;
        const anual = document.getElementById('input-precio-anual')?.value;
        const res = await app.adminController.guardarPrecios(mensual, anual);
        if (res && res.exito) {
          app.showToast(res.mensaje, 'success');
          app.reRenderRutaActual();
        } else {
          app.showToast((res && res.mensaje) || 'Error al actualizar precios.', 'error');
        }
      });
    }

    const selectTipoDesc = document.getElementById('desc-tipo');
    const wrapCodigo = document.getElementById('wrap-desc-codigo');
    if (selectTipoDesc && wrapCodigo) {
      selectTipoDesc.addEventListener('change', () => {
        wrapCodigo.classList.toggle('opacity-40', selectTipoDesc.value === 'temporal');
      });
    }

    const formDescuento = document.getElementById('form-crear-descuento');
    if (formDescuento) {
      formDescuento.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tipo = document.getElementById('desc-tipo')?.value || 'codigo';
        const codigo = document.getElementById('desc-codigo')?.value || '';
        const nombre = document.getElementById('desc-nombre')?.value || '';
        const porcentaje = document.getElementById('desc-porcentaje')?.value || 10;
        const fecha_inicio = document.getElementById('desc-inicio')?.value || null;
        const fecha_fin = document.getElementById('desc-fin')?.value || null;

        const res = await app.adminController.crearDescuento({
          tipo,
          codigo,
          nombre,
          porcentaje_descuento: parseInt(porcentaje, 10),
          fecha_inicio: fecha_inicio ? `${fecha_inicio}T00:00:00` : null,
          fecha_fin: fecha_fin ? `${fecha_fin}T23:59:59` : null
        });
        if (res && res.exito) {
          app.showToast(res.mensaje, 'success');
          app.reRenderRutaActual();
        } else {
          app.showToast((res && res.mensaje) || 'No se pudo crear el descuento.', 'error');
        }
      });
    }

    const btnTrigger = document.getElementById('btn-trigger-mass-mail');
    if (btnTrigger) {
      btnTrigger.addEventListener('click', async () => {
        const modal = document.getElementById('modal-mail-progress');
        const progressBar = document.getElementById('mail-progress-bar');
        const progressCount = document.getElementById('mail-progress-count');
        const progressPct = document.getElementById('mail-progress-pct');
        const logs = document.getElementById('mail-delivery-logs');
        const btnClose = document.getElementById('btn-close-mail-modal');
        const statusText = document.getElementById('mail-modal-status-text');

        if (!modal) return;
        modal.classList.remove('hidden');

        progressBar.style.width = '0%';
        progressPct.textContent = '0%';
        progressCount.textContent = `0 / ${app.store.metricas.totalSuscriptores}`;
        logs.innerHTML = '<div>[00:00.01] Consultando lista de suscriptores (Total: ' + app.store.metricas.totalSuscriptores + ')...</div>';
        logs.innerHTML += '<div>[00:00.04] Segmentando cola: ' + app.store.metricas.audienciaFreemium + ' Freemium + ' + app.store.metricas.mecenasProActivos + ' Mecenas PRO...</div>';

        const resultado = await app.adminController.ejecutarEnvioMasivo((pct, actual, total) => {
          progressBar.style.width = pct + '%';
          progressPct.textContent = pct + '%';
          progressCount.textContent = `${actual} / ${total}`;
          if (pct === 50) {
            logs.innerHTML += '<div>[00:00.52] Despachando lote Freemium (Plantilla con Paywall Teaser)...</div>';
          }
          if (pct === 80) {
            logs.innerHTML += '<div>[00:00.84] Despachando lote PRO (Edición completa + Datasets)...</div>';
          }
        });

        logs.innerHTML += '<div class="text-primary font-bold">[00:01.08] Proceso finalizado: 100% éxito en entorno simulado.</div>';
        statusText.textContent = resultado.mensaje;
        btnClose.disabled = false;
        btnClose.classList.remove('opacity-50', 'cursor-not-allowed');
        btnClose.classList.add('hover:bg-primary', 'hover:text-on-primary', 'cursor-pointer');
      });
    }
  },

  cerrarModalProgreso() {
    const modal = document.getElementById('modal-mail-progress');
    if (modal) modal.classList.add('hidden');
    window.app.showToast('Reporte de envío masivo archivado con 100% de éxito.', 'success');
  },

  async toggleDescuento(id) {
    const res = await window.app.adminController.toggleDescuento(id);
    if (res && res.exito) {
      window.app.showToast(res.mensaje, 'info');
      window.app.reRenderRutaActual();
    }
  },

  async eliminarDescuento(id) {
    if (confirm('¿Eliminar este descuento?')) {
      const res = await window.app.adminController.eliminarDescuento(id);
      if (res && res.exito) {
        window.app.showToast(res.mensaje, 'success');
        window.app.reRenderRutaActual();
      }
    }
  }
};
