/**
 * VISTA: NoticiasAdminView
 * Consola Admin — CRUD de Noticias: Crear, Editar, Publicar, Archivar y Eliminar.
 * Conecta con el backend MySQL a través del NoticiasController y ApiService.
 */

window.views = window.views || {};

window.views.NoticiasAdminView = {
  _tabActiva: 'noticias', // 'noticias' | 'bloques'

  cambiarTab(tab) {
    this._tabActiva = tab;
    if (window.app) {
      window.app.reRenderRutaActual();
    }
  },

  render(noticias, stats, noticiaEditando, editorData = null) {
    const listaItems = (noticias || []);
    const resumen = stats || { total: 0, publicadas: 0, borradores: 0, archivadas: 0 };
    const editando = noticiaEditando || null;
    const esTabBloques = this._tabActiva === 'bloques';

    return `
      <div class="flex flex-col w-full pt-28 pb-space-xl">
        <div class="w-full max-w-7xl mx-auto px-margin py-space-md">
          <!-- BARRA DE PESTAÑAS UNIFICADA: NOTICIAS & EDITOR DE BLOQUES -->
          <div class="flex flex-wrap items-center justify-between gap-space-sm mb-space-lg p-2 bg-surface-container-low rounded-2xl border border-outline-variant/30">
            <div class="flex items-center gap-2 flex-wrap">
              <button onclick="window.views.NoticiasAdminView.cambiarTab('noticias')" class="inline-flex items-center gap-2 px-space-md py-2 rounded-xl font-headline-sm text-xs uppercase font-bold transition-all ${!esTabBloques ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'}">
                <span class="material-symbols-outlined text-[16px]">newspaper</span>
                <span>1. Gestión de Noticias (CRUD)</span>
              </button>
              <button onclick="window.views.NoticiasAdminView.cambiarTab('bloques')" class="inline-flex items-center gap-2 px-space-md py-2 rounded-xl font-headline-sm text-xs uppercase font-bold transition-all ${esTabBloques ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'}">
                <span class="material-symbols-outlined text-[16px]">view_agenda</span>
                <span>2. Editor Modular de Bloques &amp; Paywall</span>
              </button>
            </div>
            <span class="font-metadata text-[11px] uppercase tracking-wider text-outline px-2">
              Consola Editorial Unificada
            </span>
          </div>

          ${esTabBloques && editorData ? `
            <!-- SELECTOR DE NOTICIA A EDITAR EN EL EDITOR DE BLOQUES -->
            <div class="mb-space-md p-space-md bg-surface-container-lowest rounded-2xl border border-primary/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[22px]">article</span>
                <div>
                  <h3 class="font-headline-sm text-sm font-bold text-on-surface uppercase">Selector de Noticia a Editar en Bloques</h3>
                  <p class="font-metadata text-[11px] text-outline">Elige una noticia del catálogo para dividirla y editar sus bloques modulares y reglas de paywall.</p>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <select id="select-noticia-bloques" class="min-w-[260px] max-w-md px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-xs outline-none focus:border-primary">
                  <option value="">-- Seleccionar noticia para editar bloques --</option>
                  ${listaItems.map(n => `
                    <option value="${n.id_noticia}" ${window.app && window.app.editorController && window.app.editorController.noticiaSeleccionada && window.app.editorController.noticiaSeleccionada.id_noticia === n.id_noticia ? 'selected' : ''}>
                      [#${n.id_noticia}] ${this._escapeHtml(n.titulo)} (${n.estado.toUpperCase()})
                    </option>
                  `).join('')}
                </select>
                <button type="button" id="btn-cargar-noticia-bloques" class="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-badge uppercase text-xs font-bold shadow-sm transition-all">
                  Cargar Noticia
                </button>
              </div>
            </div>
            <div class="-mt-28">
              ${window.views.AdminEditorView.render(editorData.newsletter, editorData.notas)}
            </div>
          ` : `
          <!-- CABECERA -->
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg">
            <div class="flex flex-col gap-space-xs">
              <div class="flex items-center gap-space-xs">
                <span class="font-label-badge text-label-badge uppercase tracking-wider px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                  Módulo CRUD • Gestión de Noticias
                </span>
                <span class="font-metadata text-metadata text-outline uppercase tracking-wider">
                  • Conexión ${window.apiService && !window.apiService.modoOffline ? '<span class="text-primary font-bold">MySQL Activo</span>' : '<span class="text-tertiary font-bold">Offline (localStorage)</span>'}
                </span>
              </div>
              <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Gestión de Noticias Editoriales
              </h1>
              <p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Crear, editar, publicar y archivar noticias del boletín editorial. Las noticias publicadas aparecen en la portada.
              </p>
            </div>

            <button id="btn-nueva-noticia" class="flex items-center gap-space-xs px-space-lg py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-sm font-bold tracking-wide shadow-md transition-all shrink-0">
              <span class="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Nueva Noticia</span>
            </button>
          </div>

          <!-- ESTADÍSTICAS RÁPIDAS -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-space-md mb-space-lg">
            <div class="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 text-center">
              <span class="font-metadata text-metadata uppercase tracking-wider text-on-surface-variant font-bold block">Total</span>
              <span class="font-headline-lg text-headline-lg text-on-surface font-bold" id="stat-total">${resumen.total}</span>
            </div>
            <div class="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 text-center">
              <span class="font-metadata text-metadata uppercase tracking-wider text-primary font-bold block">Publicadas</span>
              <span class="font-headline-lg text-headline-lg text-primary font-bold" id="stat-publicadas">${resumen.publicadas}</span>
            </div>
            <div class="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 text-center">
              <span class="font-metadata text-metadata uppercase tracking-wider text-on-surface-variant font-bold block">Borradores</span>
              <span class="font-headline-lg text-headline-lg text-secondary font-bold" id="stat-borradores">${resumen.borradores}</span>
            </div>
            <div class="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 text-center">
              <span class="font-metadata text-metadata uppercase tracking-wider text-outline font-bold block">Archivadas</span>
              <span class="font-headline-lg text-headline-lg text-outline font-bold" id="stat-archivadas">${resumen.archivadas}</span>
            </div>
          </div>

          <!-- CONTENIDO PRINCIPAL: FORMULARIO + LISTA -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            
            <!-- FORMULARIO DE CREACIÓN / EDICIÓN (5 COLS) -->
            <div class="lg:col-span-5">
              <div class="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-sm">
                <div class="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-[20px]">${editando ? 'edit_note' : 'post_add'}</span>
                    <h3 class="font-headline-sm text-body-sm font-bold text-on-surface uppercase tracking-wide" id="form-title-label">
                      ${editando ? 'Editar Noticia #' + editando.id_noticia : 'Crear Nueva Noticia'}
                    </h3>
                  </div>
                  ${editando ? `
                    <button id="btn-cancelar-edicion" class="text-xs font-label-badge uppercase text-tertiary hover:text-error font-bold">
                      Cancelar
                    </button>
                  ` : ''}
                </div>

                <form id="form-noticia" class="flex flex-col gap-space-sm">
                  <input type="hidden" id="noticia-id" value="${editando ? editando.id_noticia : ''}" />

                  <!-- Título -->
                  <div class="flex flex-col gap-1">
                    <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="noticia-titulo">Título *</label>
                    <input id="noticia-titulo" type="text" required placeholder="Título de la noticia..." value="${editando ? this._escapeHtml(editando.titulo) : ''}" class="w-full px-space-md py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm outline-none focus:border-primary" />
                  </div>

                  <!-- Subtítulo -->
                  <div class="flex flex-col gap-1">
                    <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="noticia-subtitulo">Subtítulo</label>
                    <input id="noticia-subtitulo" type="text" placeholder="Subtítulo o bajada editorial..." value="${editando ? this._escapeHtml(editando.subtitulo || '') : ''}" class="w-full px-space-md py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm outline-none focus:border-primary" />
                  </div>

                  <!-- Contenido -->
                  <div class="flex flex-col gap-1">
                    <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="noticia-contenido">Contenido *</label>
                    <textarea id="noticia-contenido" required rows="6" placeholder="Escribe el cuerpo de la noticia aquí..." class="w-full px-space-md py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm outline-none focus:border-primary resize-y">${editando ? this._escapeHtml(editando.contenido) : ''}</textarea>
                  </div>

                  <!-- Extracto -->
                  <div class="flex flex-col gap-1">
                    <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="noticia-extracto">Extracto / Resumen</label>
                    <input id="noticia-extracto" type="text" placeholder="Breve resumen para la portada..." value="${editando ? this._escapeHtml(editando.extracto || '') : ''}" class="w-full px-space-md py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm outline-none focus:border-primary" />
                  </div>

                  <!-- URL de Imagen -->
                  <div class="flex flex-col gap-1">
                    <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="noticia-imagen">URL de Imagen</label>
                    <input id="noticia-imagen" type="url" placeholder="https://ejemplo.com/imagen.jpg" value="${editando ? this._escapeHtml(editando.imagen_url || '') : ''}" class="w-full px-space-md py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm outline-none focus:border-primary" />
                  </div>

                  <!-- Categoría y Premium -->
                  <div class="grid grid-cols-2 gap-space-sm">
                    <div class="flex flex-col gap-1">
                      <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="noticia-categoria">Categoría</label>
                      <select id="noticia-categoria" class="w-full px-space-md py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-xs outline-none focus:border-primary">
                        <option value="General" ${editando && editando.categoria === 'General' ? 'selected' : ''}>General</option>
                        <option value="Crítica Cultural" ${editando && editando.categoria === 'Crítica Cultural' ? 'selected' : ''}>Crítica Cultural</option>
                        <option value="Análisis Técnico" ${editando && editando.categoria === 'Análisis Técnico' ? 'selected' : ''}>Análisis Técnico</option>
                        <option value="Recursos PRO" ${editando && editando.categoria === 'Recursos PRO' ? 'selected' : ''}>Recursos PRO</option>
                        <option value="Investigación" ${editando && editando.categoria === 'Investigación' ? 'selected' : ''}>Investigación</option>
                        <option value="Opinión" ${editando && editando.categoria === 'Opinión' ? 'selected' : ''}>Opinión</option>
                      </select>
                    </div>
                    <div class="flex flex-col gap-1">
                      <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold">Acceso</label>
                      <div class="flex items-center gap-2 h-[42px]">
                        <input type="checkbox" id="noticia-premium" ${editando && editando.es_premium ? 'checked' : ''} class="w-4 h-4 rounded border-outline text-primary focus:ring-primary" />
                        <label for="noticia-premium" class="font-body-sm text-body-sm text-on-surface-variant">Solo PRO</label>
                      </div>
                    </div>
                  </div>

                  <!-- Botones de Acción -->
                  <div class="flex flex-col sm:flex-row gap-space-xs pt-space-xs">
                    <button type="submit" name="accion" value="borrador" class="flex-1 py-2.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-badge uppercase font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm">
                      <span class="material-symbols-outlined text-[16px]">save</span>
                      <span>${editando ? 'Guardar Cambios' : 'Guardar como Borrador'}</span>
                    </button>
                    <button type="button" id="btn-guardar-publicar" class="flex-1 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-badge uppercase font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md">
                      <span class="material-symbols-outlined text-[16px]">publish</span>
                      <span>${editando ? 'Guardar y Publicar' : 'Crear y Publicar'}</span>
                    </button>
                  </div>
                  <button type="button" id="btn-previsualizar-noticia" class="w-full py-2 rounded-full bg-surface-container-low hover:bg-secondary-container text-on-surface font-label-badge uppercase font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-outline-variant/40">
                    <span class="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Previsualizar Noticia Completa</span>
                  </button>
                </form>
              </div>

              <!-- PREVISUALIZACIÓN EN VIVO DE LA NOTICIA A PUBLICAR -->
              <div class="mt-space-md p-space-md bg-surface-container-lowest rounded-2xl shadow-sm border border-primary/30 flex flex-col gap-2">
                <div class="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-primary text-[18px]">preview</span>
                    <span class="font-headline-sm text-xs font-bold uppercase text-on-surface tracking-wide">Previsualización en Vivo</span>
                  </div>
                  <span id="preview-badge-acceso" class="font-label-badge text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${editando && editando.es_premium ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-primary-fixed text-on-primary-fixed'}">
                    ${editando && editando.es_premium ? 'SOLO PRO' : 'ABIERTO'}
                  </span>
                </div>
                <div id="preview-noticia-imagen-wrap" class="${editando && editando.imagen_url ? '' : 'hidden'} rounded-xl overflow-hidden bg-surface-container h-36">
                  <img id="preview-noticia-imagen" src="${editando && editando.imagen_url ? this._escapeHtml(editando.imagen_url) : ''}" alt="Vista previa" class="w-full h-full object-cover" />
                </div>
                <span id="preview-noticia-categoria" class="font-metadata text-[10px] uppercase font-bold text-primary">
                  ${editando ? this._escapeHtml(editando.categoria || 'General') : 'General'}
                </span>
                <h4 id="preview-noticia-titulo" class="font-headline-sm text-base font-bold text-on-surface leading-snug">
                  ${editando ? this._escapeHtml(editando.titulo) : 'Título de tu noticia...'}
                </h4>
                <p id="preview-noticia-subtitulo" class="font-body-sm text-xs italic text-on-surface-variant">
                  ${editando ? this._escapeHtml(editando.subtitulo || '') : 'Subtítulo o bajada editorial...'}
                </p>
                <p id="preview-noticia-contenido" class="font-body-md text-xs text-on-surface/80 line-clamp-4 pt-1 border-t border-outline-variant/20">
                  ${editando ? this._escapeHtml(editando.contenido) : 'El cuerpo de la noticia aparecerá aquí en tiempo real mientras escribes...'}
                </p>
              </div>
            </div>

            <!-- LISTA DE NOTICIAS (7 COLS) -->
            <div class="lg:col-span-7 flex flex-col gap-space-md">
              <!-- Filtros -->
              <div class="flex flex-col sm:flex-row items-center justify-between gap-space-sm p-space-sm bg-surface-container-low rounded-xl border border-outline-variant/30">
                <div class="flex items-center gap-1 bg-surface-container p-1 rounded-full text-xs font-label-badge uppercase">
                  <button onclick="window.views.NoticiasAdminView.filtrar('todos')" class="px-2.5 py-0.5 rounded-full transition-all ${this._filtroActivo === 'todos' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant'}">Todas</button>
                  <button onclick="window.views.NoticiasAdminView.filtrar('publicado')" class="px-2.5 py-0.5 rounded-full transition-all ${this._filtroActivo === 'publicado' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant'}">Publicadas</button>
                  <button onclick="window.views.NoticiasAdminView.filtrar('borrador')" class="px-2.5 py-0.5 rounded-full transition-all ${this._filtroActivo === 'borrador' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant'}">Borradores</button>
                  <button onclick="window.views.NoticiasAdminView.filtrar('archivado')" class="px-2.5 py-0.5 rounded-full transition-all ${this._filtroActivo === 'archivado' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant'}">Archivadas</button>
                </div>

                <div class="relative flex items-center">
                  <span class="material-symbols-outlined absolute left-2.5 text-secondary text-[16px]">search</span>
                  <input type="text" id="noticias-search" placeholder="Buscar noticias..." value="${this._busquedaActiva || ''}" class="pl-8 pr-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/40 text-on-surface font-body-sm text-xs outline-none focus:border-primary w-48" />
                </div>
              </div>

              <!-- Lista dinámica de noticias -->
              <div id="noticias-list-container" class="space-y-space-sm">
                ${listaItems.length > 0 ? listaItems.map(n => `
                  <div class="group p-space-md bg-surface-container-lowest rounded-2xl shadow-sm border ${n.estado === 'publicado' ? 'border-primary/30' : n.estado === 'archivado' ? 'border-outline-variant/20 opacity-70' : 'border-outline-variant/30'} transition-all hover:shadow-md">
                    <div class="flex items-start justify-between gap-space-sm mb-space-xs">
                      <div class="flex items-center gap-space-xs flex-wrap">
                        <span class="font-label-badge text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${
                          n.estado === 'publicado' ? 'bg-primary-fixed text-on-primary-fixed' :
                          n.estado === 'archivado' ? 'bg-surface-container text-outline' :
                          'bg-secondary-container text-on-secondary-container'
                        }">${n.estado.toUpperCase()}</span>
                        ${n.es_premium ? '<span class="font-label-badge text-[10px] uppercase px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold">PRO</span>' : ''}
                        <span class="font-label-badge text-[10px] uppercase px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-bold">${n.categoria || 'General'}</span>
                      </div>
                      <span class="font-metadata text-[10px] text-outline shrink-0">${n.fecha_publicacion ? new Date(n.fecha_publicacion).toLocaleDateString('es-CL') : 'Sin publicar'}</span>
                    </div>

                    <h4 class="font-headline-sm text-sm text-on-surface font-bold mb-1 line-clamp-2">${this._escapeHtml(n.titulo)}</h4>
                    ${n.extracto ? `<p class="font-body-sm text-xs text-on-surface-variant line-clamp-2 mb-space-xs">${this._escapeHtml(n.extracto)}</p>` : ''}
                    
                    <div class="flex items-center justify-between pt-space-xs border-t border-outline-variant/20">
                      <span class="font-metadata text-[10px] text-outline">${n.autor_nombre || 'Sin autor'}</span>
                      <div class="flex items-center gap-1">
                        ${n.estado === 'borrador' ? `
                          <button onclick="window.views.NoticiasAdminView.publicar(${n.id_noticia})" class="inline-flex items-center gap-0.5 px-2 py-1 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-badge uppercase text-[9px] font-bold transition-all shadow-sm" title="Publicar">
                            <span class="material-symbols-outlined text-[13px]">publish</span>
                            <span>Publicar</span>
                          </button>
                        ` : ''}
                        <button onclick="window.views.NoticiasAdminView.editar(${n.id_noticia})" class="inline-flex items-center gap-0.5 px-2 py-1 rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-badge uppercase text-[9px] font-bold transition-all" title="Editar">
                          <span class="material-symbols-outlined text-[13px]">edit</span>
                          <span>Editar</span>
                        </button>
                        ${n.estado !== 'archivado' ? `
                          <button onclick="window.views.NoticiasAdminView.archivar(${n.id_noticia})" class="p-1 rounded-full hover:bg-secondary-container text-outline hover:text-on-secondary-container transition-all" title="Archivar">
                            <span class="material-symbols-outlined text-[15px]">archive</span>
                          </button>
                        ` : ''}
                        <button onclick="window.views.NoticiasAdminView.eliminar(${n.id_noticia})" class="p-1 rounded-full hover:bg-error-container text-outline hover:text-on-error-container transition-all" title="Eliminar">
                          <span class="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                `).join('') : `
                  <div class="p-space-lg text-center text-outline font-metadata bg-surface-container-low rounded-2xl border border-outline-variant/30">
                    <span class="material-symbols-outlined text-[40px] text-outline-variant block mb-2">newspaper</span>
                    <p class="text-sm">No hay noticias que mostrar.</p>
                    <p class="text-xs mt-1">Crea tu primera noticia usando el formulario de la izquierda.</p>
                  </div>
                `}
              </div>
            </div>
          </div>
          `}
        </div>
      </div>

      <!-- MODAL DE PREVISUALIZACIÓN COMPLETA DE LA NOTICIA -->
      <div id="modal-preview-noticia" class="hidden fixed inset-0 z-50 bg-inverse-surface/70 backdrop-blur-sm flex items-center justify-center p-margin">
        <div class="bg-surface-container-lowest rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-space-lg shadow-2xl border border-outline-variant/40 flex flex-col gap-space-md">
          <div class="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[22px]">visibility</span>
              <h3 class="font-headline-sm text-headline-sm text-on-surface">Previsualización de Publicación</h3>
            </div>
            <button type="button" id="btn-cerrar-preview-noticia" class="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div id="modal-preview-noticia-body" class="space-y-space-md"></div>
          <div class="flex justify-end gap-2 pt-space-sm border-t border-outline-variant/20">
            <button type="button" id="btn-cerrar-preview-noticia-footer" class="px-4 py-2 rounded-full bg-surface-container-high text-on-surface font-label-badge uppercase text-xs font-bold">
              Seguir Editando
            </button>
            <button type="button" id="btn-publicar-desde-preview" class="px-5 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-badge uppercase text-xs font-bold shadow-md flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">publish</span>
              <span>Publicar Ahora</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  _filtroActivo: 'todos',
  _busquedaActiva: '',

  _escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  attachEvents(app) {
    if (this._tabActiva === 'bloques' && window.views.AdminEditorView) {
      const btnCargarBloques = document.getElementById('btn-cargar-noticia-bloques');
      const selectBloques = document.getElementById('select-noticia-bloques');
      const cargarSeleccionada = async () => {
        const id = selectBloques ? parseInt(selectBloques.value, 10) : NaN;
        if (!id) {
          app.showToast('Selecciona una noticia de la lista.', 'info');
          return;
        }
        const res = await window.apiService.obtenerNoticia(id);
        if (res && res.exito && res.datos) {
          app.editorController.cargarNoticiaEnBloques(res.datos);
          app.showToast(`Noticia "${res.datos.titulo}" cargada en el editor de bloques.`, 'success');
          app.reRenderRutaActual();
        } else {
          app.showToast('No se pudo cargar la noticia seleccionada.', 'error');
        }
      };

      if (btnCargarBloques) {
        btnCargarBloques.addEventListener('click', cargarSeleccionada);
      }
      if (selectBloques) {
        selectBloques.addEventListener('change', cargarSeleccionada);
      }

      window.views.AdminEditorView.attachEvents(app);
      return;
    }

    const form = document.getElementById('form-noticia');
    const btnPublicar = document.getElementById('btn-guardar-publicar');
    const btnPreview = document.getElementById('btn-previsualizar-noticia');
    const modalPreview = document.getElementById('modal-preview-noticia');
    const btnCerrarPreview = document.getElementById('btn-cerrar-preview-noticia');
    const btnCerrarPreviewFooter = document.getElementById('btn-cerrar-preview-noticia-footer');
    const btnPublicarPreview = document.getElementById('btn-publicar-desde-preview');

    // Actualización en tiempo real de la previsualización
    const actualizarPreviewVivo = () => {
      const titulo = document.getElementById('noticia-titulo')?.value || 'Título de tu noticia...';
      const subtitulo = document.getElementById('noticia-subtitulo')?.value || '';
      const contenido = document.getElementById('noticia-contenido')?.value || 'El cuerpo de la noticia aparecerá aquí en tiempo real mientras escribes...';
      const imagen = document.getElementById('noticia-imagen')?.value || '';
      const categoria = document.getElementById('noticia-categoria')?.value || 'General';
      const esPremium = document.getElementById('noticia-premium')?.checked || false;

      const elTitulo = document.getElementById('preview-noticia-titulo');
      const elSub = document.getElementById('preview-noticia-subtitulo');
      const elCont = document.getElementById('preview-noticia-contenido');
      const elCat = document.getElementById('preview-noticia-categoria');
      const elBadge = document.getElementById('preview-badge-acceso');
      const elImgWrap = document.getElementById('preview-noticia-imagen-wrap');
      const elImg = document.getElementById('preview-noticia-imagen');

      if (elTitulo) elTitulo.textContent = titulo;
      if (elSub) elSub.textContent = subtitulo;
      if (elCont) elCont.textContent = contenido;
      if (elCat) elCat.textContent = categoria;
      if (elBadge) {
        elBadge.textContent = esPremium ? 'SOLO PRO' : 'ABIERTO';
        elBadge.className = `font-label-badge text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${esPremium ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-primary-fixed text-on-primary-fixed'}`;
      }
      if (elImgWrap && elImg) {
        if (imagen.trim()) {
          elImg.src = imagen.trim();
          elImgWrap.classList.remove('hidden');
        } else {
          elImgWrap.classList.add('hidden');
        }
      }
    };

    ['noticia-titulo', 'noticia-subtitulo', 'noticia-contenido', 'noticia-imagen', 'noticia-categoria', 'noticia-premium'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', actualizarPreviewVivo);
        el.addEventListener('change', actualizarPreviewVivo);
      }
    });

    if (btnPreview && modalPreview) {
      btnPreview.addEventListener('click', () => {
        const titulo = this._escapeHtml(document.getElementById('noticia-titulo')?.value || 'Sin título');
        const subtitulo = this._escapeHtml(document.getElementById('noticia-subtitulo')?.value || '');
        const extracto = this._escapeHtml(document.getElementById('noticia-extracto')?.value || '');
        const contenido = document.getElementById('noticia-contenido')?.value || '';
        const imagen = this._escapeHtml(document.getElementById('noticia-imagen')?.value || '');
        const categoria = this._escapeHtml(document.getElementById('noticia-categoria')?.value || 'General');
        const esPremium = document.getElementById('noticia-premium')?.checked || false;
        const parrafos = contenido.split(/\n+/).map(p => p.trim()).filter(Boolean);

        const body = document.getElementById('modal-preview-noticia-body');
        if (body) {
          body.innerHTML = `
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-label-badge text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">${categoria}</span>
              ${esPremium ? '<span class="font-label-badge text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold">EXCLUSIVO MECENAS PRO</span>' : '<span class="font-label-badge text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-bold">LECTURA ABIERTA</span>'}
            </div>
            <h2 class="font-display-hero-mobile text-display-hero-mobile text-on-surface">${titulo}</h2>
            ${subtitulo ? `<p class="font-body-lead text-base italic text-on-surface-variant">${subtitulo}</p>` : ''}
            ${extracto ? `<div class="p-3 rounded-xl bg-surface-container-low text-xs font-body-sm text-on-surface-variant border-l-4 border-primary">${extracto}</div>` : ''}
            ${imagen ? `<img src="${imagen}" alt="Portada" class="w-full h-56 object-cover rounded-xl shadow-sm" />` : ''}
            <div class="font-body-md text-body-md text-on-surface space-y-3 leading-relaxed">
              ${parrafos.length ? parrafos.map((p, i) => `<p class="${i === 0 ? 'first-letter:text-4xl first-letter:font-headline-lg first-letter:float-left first-letter:mr-2 first-letter:text-primary' : ''}">${this._escapeHtml(p)}</p>`).join('') : '<p class="text-outline italic">Sin contenido aún.</p>'}
            </div>
          `;
        }
        modalPreview.classList.remove('hidden');
      });
    }

    const cerrarModal = () => modalPreview && modalPreview.classList.add('hidden');
    if (btnCerrarPreview) btnCerrarPreview.addEventListener('click', cerrarModal);
    if (btnCerrarPreviewFooter) btnCerrarPreviewFooter.addEventListener('click', cerrarModal);
    if (btnPublicarPreview) {
      btnPublicarPreview.addEventListener('click', async () => {
        cerrarModal();
        await this._guardarNoticia(app, 'publicado');
      });
    }
    const btnNueva = document.getElementById('btn-nueva-noticia');
    const btnCancelar = document.getElementById('btn-cancelar-edicion');
    const searchInput = document.getElementById('noticias-search');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this._guardarNoticia(app, 'borrador');
      });
    }

    if (btnPublicar) {
      btnPublicar.addEventListener('click', async () => {
        await this._guardarNoticia(app, 'publicado');
      });
    }

    if (btnNueva) {
      btnNueva.addEventListener('click', () => {
        app.noticiasController.limpiarFormulario();
        app.reRenderRutaActual();
      });
    }

    if (btnCancelar) {
      btnCancelar.addEventListener('click', () => {
        app.noticiasController.limpiarFormulario();
        app.reRenderRutaActual();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this._busquedaActiva = e.target.value;
        app.noticiasController.busqueda = e.target.value;
        // Debounce de 300ms
        clearTimeout(this._searchTimeout);
        this._searchTimeout = setTimeout(() => app.reRenderRutaActual(), 300);
      });
    }
  },

  async _guardarNoticia(app, estado) {
    const id = document.getElementById('noticia-id').value;
    const datos = {
      titulo: document.getElementById('noticia-titulo').value,
      subtitulo: document.getElementById('noticia-subtitulo').value,
      contenido: document.getElementById('noticia-contenido').value,
      extracto: document.getElementById('noticia-extracto').value,
      imagen_url: document.getElementById('noticia-imagen').value,
      categoria: document.getElementById('noticia-categoria').value,
      es_premium: document.getElementById('noticia-premium').checked,
      estado: estado
    };

    let resultado;
    if (id) {
      resultado = await app.noticiasController.actualizarNoticia(parseInt(id), datos);
    } else {
      resultado = await app.noticiasController.crearNoticia(datos);
    }

    if (resultado.exito) {
      app.showToast(resultado.mensaje, 'success');
      app.noticiasController.limpiarFormulario();
      app.reRenderRutaActual();
    } else {
      app.showToast(resultado.mensaje, 'error');
    }
  },

  async filtrar(estado) {
    this._filtroActivo = estado;
    window.app.noticiasController.filtroEstado = estado;
    window.app.reRenderRutaActual();
  },

  async editar(id) {
    try {
      const resultado = await window.apiService.obtenerNoticia(id);
      if (resultado.exito) {
        window.app.noticiasController.setNoticiaEditando(resultado.datos);
        window.app.reRenderRutaActual();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      window.app.showToast('Error al cargar la noticia para edición.', 'error');
    }
  },

  async publicar(id) {
    const resultado = await window.app.noticiasController.publicarNoticia(id);
    if (resultado.exito) {
      window.app.showToast(resultado.mensaje, 'success');
      window.app.reRenderRutaActual();
    } else {
      window.app.showToast(resultado.mensaje, 'error');
    }
  },

  async archivar(id) {
    if (confirm('¿Deseas archivar esta noticia?')) {
      const resultado = await window.app.noticiasController.archivarNoticia(id);
      if (resultado.exito) {
        window.app.showToast(resultado.mensaje, 'success');
        window.app.reRenderRutaActual();
      } else {
        window.app.showToast(resultado.mensaje, 'error');
      }
    }
  },

  async eliminar(id) {
    if (confirm('¿Estás seguro de eliminar esta noticia permanentemente? Esta acción no se puede deshacer.')) {
      const resultado = await window.app.noticiasController.eliminarNoticia(id);
      if (resultado.exito) {
        window.app.showToast(resultado.mensaje, 'success');
        window.app.reRenderRutaActual();
      } else {
        window.app.showToast(resultado.mensaje, 'error');
      }
    }
  }
};
