/**
 * VISTA: AdminPaywallView
 * Vista Previa de Envíos, Comparador Simultáneo Freemium vs PRO y Despacho Masivo (SCREEN_25 / SCREEN_33 / RF-04).
 * Implementa Escenario 4.1 y el Diagrama de Actividades de Envío.
 */

window.views = window.views || {};

window.views.AdminPaywallView = {
  render(previewData) {
    const { newsletter, versionFreemium, versionPro, telemetria } = previewData;

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
                      Unirme como Mecenas (8,90 € / mes)
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
  }
};
