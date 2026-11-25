/**
 * VISTA: AdminEditorView
 * Consola de Redacción y Editor Modular por Bloques (SCREEN_19 / RF-02 Escenario 2.1).
 */

window.views = window.views || {};

window.views.AdminEditorView = {
  render(newsletter, notasEquipo) {
    const bloques = newsletter.bloques || [];
    const umbral = newsletter.umbralPaywall || 'p3';
    const estilo = newsletter.estiloTransicion || 'difuminado';

    return `
      <div class="flex flex-col w-full pt-28 pb-space-xl">
        <div class="w-full max-w-7xl mx-auto px-margin py-space-md">
          <!-- CABECERA DE CONTROL EDITORIAL -->
          <div class="flex flex-col gap-space-sm mb-space-lg">
            <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-outline-variant/30">
              <div class="flex flex-col sm:flex-row sm:items-center gap-space-md min-w-0">
                <div class="flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-badge text-label-badge uppercase tracking-wider shrink-0">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                  <span>Curación en Vivo • RF-02</span>
                </div>
                <div class="flex flex-col min-w-0">
                  <h2 class="font-headline-sm text-headline-sm text-on-surface truncate">
                    ${newsletter.titulo}
                  </h2>
                  <div class="flex items-center gap-space-sm font-metadata text-metadata text-on-surface-variant mt-0.5">
                    <span class="text-primary font-bold">Estado: ${newsletter.estado.toUpperCase()}</span>
                    <span>•</span>
                    <span class="text-tertiary font-bold">Paywall Activo: ${newsletter.obtenerPorcentajeBloqueado()}% Bloqueado</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-space-sm shrink-0 flex-wrap">
                <button onclick="window.app.navegarA('noticia')" class="flex items-center gap-space-xs px-space-md py-2.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-badge text-label-badge uppercase transition-all shadow-sm">
                  <span class="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Ver en Lector</span>
                </button>
                <button id="btn-save-draft" class="flex items-center gap-space-xs px-space-md py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-xs transition-all shadow-md">
                  <span class="material-symbols-outlined text-[18px]">save</span>
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>
          </div>

          <!-- CONTENEDOR MAESTRO: EDITOR CENTRAL (8 COLS) + PANEL CONFIGURACIÓN LATERAL (4 COLS) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            <!-- CANVAS CENTRAL DE BLOQUES MODULARES (8 COLS) -->
            <div class="lg:col-span-8 flex flex-col gap-space-md">
              <div class="flex items-center justify-between px-space-md py-2.5 bg-surface-container-low rounded-xl border border-outline-variant/30">
                <div class="flex items-center gap-2">
                  <span class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold">Canvas de Bloques Modulares:</span>
                  <span class="font-metadata text-xs text-outline">${bloques.length} bloques activos</span>
                </div>
                <button id="btn-add-block" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-on-primary hover:bg-primary-container font-label-badge uppercase text-[10px] font-bold shadow-sm transition-all">
                  <span class="material-symbols-outlined text-[14px]">add</span>
                  <span>Agregar Bloque</span>
                </button>
              </div>

              <!-- Lista Dinámica de Bloques -->
              <div id="blocks-container" class="space-y-space-md">
                ${bloques.map((b, idx) => `
                  <section class="group relative flex flex-col bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border ${b.esPremium ? 'border-primary/40 ring-1 ring-primary/20' : 'border-outline-variant/40'} transition-all">
                    <div class="flex items-center justify-between mb-space-sm pb-space-xs border-b border-outline-variant/20">
                      <div class="flex items-center gap-space-xs">
                        <span class="font-label-badge text-label-badge px-space-xs py-0.5 rounded-full bg-surface-container text-on-surface uppercase tracking-wider font-bold">
                          Bloque 0${idx + 1}
                        </span>
                        <span class="font-headline-sm text-sm text-on-surface font-bold">${b.titulo}</span>
                      </div>
                      <div class="flex items-center gap-space-sm">
                        <!-- Toggle de Visibilidad (RF-02) -->
                        <button onclick="window.views.AdminEditorView.toggleVisibilidad(${b.idBloque})" class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-label-badge uppercase font-bold transition-all ${b.esPremium ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container text-on-surface'}">
                          <span class="material-symbols-outlined text-[14px]">${b.esPremium ? 'lock' : 'public'}</span>
                          <span>${b.esPremium ? 'SOLO PRO (RESTRICTED)' : 'ABIERTO A TODOS'}</span>
                        </button>
                        <button onclick="window.views.AdminEditorView.eliminarBloque(${b.idBloque})" class="text-outline-variant hover:text-error transition-colors" title="Eliminar bloque">
                          <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>

                    <div class="flex flex-col gap-2">
                      <span class="font-metadata text-xs font-bold text-outline">${b.subtitulo || 'Sin subtítulo'}</span>
                      <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 bg-surface-container-low p-space-sm rounded-xl">
                        ${b.contenido}
                      </p>
                    </div>
                  </section>
                `).join('')}
              </div>
            </div>

            <!-- PANEL DE CONFIGURACIÓN LATERAL (4 COLS) -->
            <div class="lg:col-span-4 flex flex-col gap-space-md">
              <!-- INSPECTOR DE PERMISOS & COMPUERTA DE PAYWALL (Escenario 2.1) -->
              <div class="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-sm">
                <div class="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
                  <span class="material-symbols-outlined text-primary text-[20px]">tune</span>
                  <h3 class="font-headline-sm text-body-sm font-bold text-on-surface uppercase tracking-wide">Inspector de Permisos (RF-02)</h3>
                </div>

                <!-- Estilo de Transición del Paywall -->
                <div class="flex flex-col gap-1">
                  <label class="font-metadata text-xs uppercase font-bold text-on-surface">Estilo de Transición:</label>
                  <div class="flex items-center gap-1 bg-surface-container-low p-1 rounded-full text-xs font-metadata">
                    <button id="btn-style-fade" class="flex-1 py-1 px-2 rounded-full uppercase transition-all ${estilo === 'difuminado' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant'}">
                      Difuminado
                    </button>
                    <button id="btn-style-hard" class="flex-1 py-1 px-2 rounded-full uppercase transition-all ${estilo === 'corte_seco' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant'}">
                      Corte Seco
                    </button>
                  </div>
                </div>

                <!-- Delimitador Visual / Límite Freemium -->
                <div class="flex flex-col gap-1 mt-2">
                  <label class="font-metadata text-xs uppercase font-bold text-on-surface">Umbral de Corte del Paywall:</label>
                  <select id="select-threshold" class="w-full p-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-xs outline-none focus:border-primary">
                    <option value="p3" ${umbral === 'p3' ? 'selected' : ''}>Tras el tercer párrafo (Recomendado)</option>
                    <option value="p5" ${umbral === 'p5' ? 'selected' : ''}>Tras el quinto párrafo (Lectura profunda)</option>
                    <option value="data" ${umbral === 'data' ? 'selected' : ''}>Justo antes del bloque de datos</option>
                  </select>
                </div>
              </div>

              <!-- NOTAS INTERNAS DEL EQUIPO EDITORIAL (Equipo del Proyecto) -->
              <div class="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-sm">
                <div class="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-[20px]">forum</span>
                    <h3 class="font-headline-sm text-body-sm font-bold text-on-surface uppercase tracking-wide">Notas del Equipo</h3>
                  </div>
                  <span class="font-label-badge text-label-badge px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                    4 Autores
                  </span>
                </div>

                <!-- Hilo de notas -->
                <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
                  ${notasEquipo.map(n => `
                    <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col gap-1 text-xs">
                      <div class="flex justify-between items-baseline font-metadata">
                        <strong class="text-primary font-bold">${n.autor}</strong>
                        <span class="text-outline text-[10px]">${n.hora}</span>
                      </div>
                      <p class="font-body-sm text-on-surface">${n.texto}</p>
                    </div>
                  `).join('')}
                </div>

                <!-- Agregar nueva nota -->
                <form id="form-add-team-note" class="flex items-center gap-1.5 mt-2">
                  <input type="text" id="input-team-note" required placeholder="Escribir nota para el equipo..." class="flex-1 px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-xs outline-none focus:border-primary" />
                  <button type="submit" class="p-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container shadow-sm">
                    <span class="material-symbols-outlined text-[16px]">send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  attachEvents(app) {
    const btnAddBlock = document.getElementById('btn-add-block');
    const btnSaveDraft = document.getElementById('btn-save-draft');
    const btnStyleFade = document.getElementById('btn-style-fade');
    const btnStyleHard = document.getElementById('btn-style-hard');
    const selectThreshold = document.getElementById('select-threshold');
    const formNote = document.getElementById('form-add-team-note');

    if (btnAddBlock) {
      btnAddBlock.addEventListener('click', () => {
        const titulo = prompt('Título del nuevo bloque:');
        if (titulo) {
          app.editorController.agregarNuevoBloque({ titulo, esPremium: true });
          app.reRenderRutaActual();
          app.showToast('Bloque creado con éxito.', 'success');
        }
      });
    }

    if (btnSaveDraft) {
      btnSaveDraft.addEventListener('click', async () => {
        if (app.editorController.noticiaSeleccionada && app.noticiasController) {
          const res = await app.editorController.guardarBloquesEnNoticia(app.noticiasController);
          if (res && res.exito) {
            app.showToast(`Bloques guardados en la noticia "${app.editorController.noticiaSeleccionada.titulo}".`, 'success');
            return;
          }
        }
        app.showToast('Cambios del canvas y compuerta guardados con éxito.', 'success');
      });
    }

    if (btnStyleFade && btnStyleHard) {
      btnStyleFade.addEventListener('click', () => {
        app.editorController.configurarPaywall({ estilo: 'difuminado' });
        app.reRenderRutaActual();
      });
      btnStyleHard.addEventListener('click', () => {
        app.editorController.configurarPaywall({ estilo: 'corte_seco' });
        app.reRenderRutaActual();
      });
    }

    if (selectThreshold) {
      selectThreshold.addEventListener('change', (e) => {
        app.editorController.configurarPaywall({ umbral: e.target.value });
        app.reRenderRutaActual();
      });
    }

    if (formNote) {
      formNote.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('input-team-note');
        if (input && input.value.trim()) {
          const user = app.store.usuarioActual;
          app.editorController.agregarNotaEquipo({
            autor: user ? user.nombre : 'Rodrigo Cea',
            rol: user ? user.rol.nombre : 'Editor',
            texto: input.value.trim()
          });
          input.value = '';
          app.reRenderRutaActual();
          app.showToast('Nota de redacción agregada al hilo.', 'info');
        }
      });
    }
  },

  toggleVisibilidad(idBloque) {
    window.app.editorController.conmutarVisibilidadBloque(idBloque);
    window.app.reRenderRutaActual();
    window.app.showToast('Visibilidad de bloque actualizada.', 'info');
  },

  eliminarBloque(idBloque) {
    if (confirm('¿Deseas eliminar este bloque del borrador?')) {
      window.app.editorController.eliminarBloque(idBloque);
      window.app.reRenderRutaActual();
      window.app.showToast('Bloque eliminado.', 'info');
    }
  }
};
