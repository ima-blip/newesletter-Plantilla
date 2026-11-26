/**
 * VISTA: ArticleView
 * Renderiza la experiencia inmersiva de lectura y la diferenciación de paywall (RF-02).
 * Escenarios 2.2 (Paywall Teaser para Freemium) y 2.3 (Acceso irrestricto para Mecenas PRO).
 */

window.views = window.views || {};

window.views.ArticleView = {
  _escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  /**
   * Segmenta los párrafos de un artículo con paywall según el umbral configurado (RF-02),
   * garantizando que incluso artículos cortos (1 o 2 párrafos) queden truncados y
   * nunca expongan el texto completo en el DOM para lectores Freemium o visitantes.
   */
  _segmentarContenidoParaPaywall(parrafos, umbralPaywall = 'p3') {
    const lista = Array.isArray(parrafos) ? parrafos.filter(Boolean) : [];
    if (lista.length === 0) {
      return {
        abiertos: [],
        difuminados: [
          'Este análisis continúa en la edición reservada para Mecenas PRO con desglose metodológico completo.'
        ]
      };
    }

    if (lista.length === 1) {
      const textoUnico = lista[0];
      const oraciones = textoUnico.split(/(?<=[.!?])\s+/).filter(Boolean);
      let apertura = '';
      let resto = '';

      if (oraciones.length >= 2) {
        apertura = oraciones[0];
        resto = oraciones.slice(1).join(' ');
      } else {
        const palabras = textoUnico.split(/\s+/);
        const cortePalabras = Math.max(8, Math.floor(palabras.length * 0.45));
        apertura = palabras.slice(0, cortePalabras).join(' ') + '…';
        resto = palabras.slice(cortePalabras).join(' ');
      }

      const teaser = resto.length > 260 ? resto.slice(0, 260) + '…' : resto;
      return {
        abiertos: [apertura],
        difuminados: teaser ? [teaser] : ['Contenido exclusivo reservado para la comunidad de Mecenas PRO.']
      };
    }

    let limiteUmbral = 3;
    if (umbralPaywall === 'p5') limiteUmbral = 5;
    else if (umbralPaywall === 'data') limiteUmbral = Math.max(1, Math.floor(lista.length / 2));

    // Siempre dejar al menos 1 párrafo detrás de la compuerta de paywall
    const indiceCorte = Math.max(1, Math.min(limiteUmbral, lista.length - 1));
    const abiertos = lista.slice(0, indiceCorte);
    const restantes = lista.slice(indiceCorte, indiceCorte + 2).map(p =>
      p.length > 220 ? p.slice(0, 220) + '…' : p
    );

    return {
      abiertos,
      difuminados: restantes
    };
  },

  _renderPaywallGate({ difuminados, estiloTransicion, umbralPaywall, precioMensualDisplay }) {
    const esCorteSeco = estiloTransicion === 'corte_seco';
    const precioMostrar = precioMensualDisplay || '$8.990 CLP';
    const etiquetaUmbral = umbralPaywall === 'p5' ? 'Párrafo #5' : (umbralPaywall === 'data' ? 'Bloque de Datos' : 'Párrafo #3');
    const previewParrafos = (difuminados && difuminados.length)
      ? difuminados
      : ['En los datos internos del informe de audiencia se percibe una correlación directa entre la autonomía editorial y el mecenazgo directo.'];

    return `
      <!-- VISTA FREEMIUM CON DIFUMINADO PROGRESIVO O CORTE SECO Y TARJETA TEASER (RF-02 Escenario 2.2) -->
      <div class="relative mt-space-md" id="freemium-paywall-gate" data-estilo="${esCorteSeco ? 'corte_seco' : 'difuminado'}">
        ${esCorteSeco ? `
          <div class="flex items-center gap-3 my-space-md">
            <div class="flex-1 border-t-2 border-dashed border-primary/40"></div>
            <span class="font-label-badge text-label-badge uppercase px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-bold tracking-wider">
              Límite Freemium (${etiquetaUmbral}) • Corte Seco
            </span>
            <div class="flex-1 border-t-2 border-dashed border-primary/40"></div>
          </div>
        ` : `
          <!-- Texto con difuminado CSS progresivo (ilegible para lectores Freemium) -->
          <div class="paywall-blur-container max-h-48 select-none pointer-events-none" aria-hidden="true">
            ${previewParrafos.slice(0, 2).map((p, idx) => `
              <p class="font-body-md text-body-md text-on-surface ${idx === 0 ? 'paywall-blur-layer-1 blur-[5px]' : 'paywall-blur-layer-2 blur-[7px] mt-4'}">
                ${this._escapeHtml(p)}
              </p>
            `).join('')}
            <!-- Gradiente de Difuminado hacia el fondo -->
            <div class="absolute inset-0 paywall-blur-gradient bg-gradient-to-b from-surface/10 via-surface/80 to-surface"></div>
          </div>
        `}

        <!-- Tarjeta de Conversión Teaser de Paywall de Alto Contraste -->
        <div class="relative z-10 ${esCorteSeco ? 'mt-space-sm' : '-mt-8'} rounded-2xl bg-inverse-surface text-inverse-on-surface p-space-lg shadow-xl overflow-hidden border border-outline/30">
          <div class="absolute -right-16 -top-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-lg relative z-10">
            <div class="flex flex-col gap-space-xs max-w-xl">
              <div class="flex items-center gap-space-xs">
                <span class="material-symbols-outlined text-primary text-[20px]">lock</span>
                <span class="font-label-badge text-label-badge uppercase text-inverse-primary tracking-widest font-bold">
                  Pase Exclusivo de Mecenas PRO
                </span>
              </div>
              <h3 class="font-headline-md text-headline-md text-surface-container-lowest">
                Este ensayo continúa para la comunidad de mecenas.
              </h3>
              <p class="font-body-sm text-body-sm text-outline-variant">
                Desbloquea de inmediato las 3.200 palabras restantes de la monografía, los gráficos de inferencia de GPU y el toolkit técnico descargable.
              </p>

              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2 text-xs font-metadata text-inverse-on-surface">
                <li class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-primary text-[15px]">check_circle</span>
                  <span>Monografía completa (3.200 palabras)</span>
                </li>
                <li class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-primary text-[15px]">check_circle</span>
                  <span>Podcast confidencial con autores</span>
                </li>
                <li class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-primary text-[15px]">check_circle</span>
                  <span>Datasets crudos y benchmarks</span>
                </li>
                <li class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-primary text-[15px]">check_circle</span>
                  <span>Toolkit de Auditoría de Modelos v2.4</span>
                </li>
              </ul>
            </div>

            <div class="flex flex-col gap-space-xs shrink-0 items-center md:items-end">
              <button onclick="window.app.navegarA('portal-suscripcion')" class="w-full md:w-auto px-space-lg py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-badge text-label-badge uppercase font-bold tracking-wider transition-all shadow-md text-center">
                Unirme como Mecenas (${precioMostrar} / mes)
              </button>
              <span class="font-metadata text-[11px] text-outline-variant">Sin permanencia • Cancela en un clic</span>
            </div>
          </div>
        </div>

        ${this._renderAgoraBloqueado()}
      </div>
    `;
  },

  _renderAgoraBloqueado() {
    return `
      <!-- Pie con comentarios bloqueados -->
      <div class="mt-space-md p-space-md bg-surface-container-low rounded-2xl flex items-center justify-between border border-outline-variant/30">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-outline text-[20px]">lock</span>
          <span class="font-headline-sm text-sm text-on-surface-variant font-medium">Debate Exclusivo Comunidad PRO</span>
        </div>
        <button onclick="window.app.navegarA('portal-suscripcion')" class="font-metadata text-xs uppercase text-primary font-bold hover:underline">
          Desbloquear Ágora
        </button>
      </div>
    `;
  },

  render(estadoLectura) {
    const {
      newsletter,
      ultimaNoticia,
      esPro,
      esSandbox,
      bloques = [],
      umbralPaywall = 'p3',
      estiloTransicion = 'difuminado',
      precioMensualDisplay = '$8.990 CLP'
    } = estadoLectura;

    const usaNoticiaPublicada = Boolean(ultimaNoticia && ultimaNoticia.titulo);
    const tituloMostrar = usaNoticiaPublicada ? this._escapeHtml(ultimaNoticia.titulo) : this._escapeHtml(newsletter.titulo);
    const subtituloMostrar = usaNoticiaPublicada
      ? this._escapeHtml(ultimaNoticia.subtitulo || ultimaNoticia.extracto || '')
      : this._escapeHtml(newsletter.descripcion);
    const categoriaMostrar = usaNoticiaPublicada ? this._escapeHtml(ultimaNoticia.categoria || 'Actualidad') : 'Crítica Estructural';
    const autorMostrar = usaNoticiaPublicada ? this._escapeHtml(ultimaNoticia.autor_nombre || 'Equipo Atelier') : this._escapeHtml(newsletter.autorPrincipal);
    const fechaMostrar = usaNoticiaPublicada && ultimaNoticia.fecha_publicacion
      ? new Date(ultimaNoticia.fecha_publicacion).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'Noviembre 2026';
    const imagenMostrar = (usaNoticiaPublicada && ultimaNoticia.imagen_url)
      ? this._escapeHtml(ultimaNoticia.imagen_url)
      : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAu_l7hPIwZYlDeOT1TkESDG3IO-kUxYu3vaYIfiz4VOTfJ4LQRz_wxv2tqjKjwvtCXYxRjkphqQh7-jBYJ6Ch_mnygl2-LvsVyV2V-MGKGhFxjTUfJVU9SUfm-eU9_Hp2qOdO56viogIMiOTEJ0wEYEYJqlE3qXVItx05HnNMamdEwWQZx8Hw4wQngVxPmiL5k8roByLO0GpcDzfikX-wOccyhBoQa3QYaOt-OscY';

    const parrafosNoticia = usaNoticiaPublicada
      ? String(ultimaNoticia.contenido || '').split(/\n+/).map(p => p.trim()).filter(Boolean)
      : [];

    const bloquesAbiertos = bloques.filter(b => !b.esPremium);
    const bloquesPro = bloques.filter(b => b.esPremium);
    const esArticuloPremium = usaNoticiaPublicada
      ? Boolean(ultimaNoticia.es_premium)
      : bloquesPro.length > 0;
    const requierePaywall = esArticuloPremium && !esPro;

    let parrafosVisibles = [];
    let parrafosDifuminados = [];

    if (usaNoticiaPublicada) {
      if (requierePaywall) {
        const seg = this._segmentarContenidoParaPaywall(parrafosNoticia, umbralPaywall);
        parrafosVisibles = seg.abiertos;
        parrafosDifuminados = seg.difuminados;
      } else {
        parrafosVisibles = parrafosNoticia;
      }
    } else {
      const fuenteAbierta = bloquesAbiertos.length ? bloquesAbiertos : bloques.slice(0, 1);
      const parrafosDesdeBloques = fuenteAbierta
        .flatMap(b => String(b.contenido || '').split(/\n+/).map(p => p.trim()).filter(Boolean));

      if (requierePaywall) {
        if (bloquesAbiertos.length === 0) {
          const seg = this._segmentarContenidoParaPaywall(parrafosDesdeBloques, umbralPaywall);
          parrafosVisibles = seg.abiertos;
          parrafosDifuminados = seg.difuminados;
        } else {
          parrafosVisibles = parrafosDesdeBloques;
          const primerBloquePro = bloquesPro[0];
          const proTexto = primerBloquePro ? String(primerBloquePro.contenido || '').split(/\n+/).map(p => p.trim()).filter(Boolean) : [];
          parrafosDifuminados = proTexto.slice(0, 2).map(p => p.length > 220 ? p.slice(0, 220) + '…' : p);
        }
      } else {
        parrafosVisibles = parrafosDesdeBloques;
      }
    }

    // Bloques 2, 3, 4 (PRO) para vista newsletter / recursos PRO
    const b2 = bloquesPro[0] || bloques[1] || {};
    const b3 = bloquesPro[1] || bloques[2] || {};

    const estadoAccesoTexto = esPro
      ? 'ACCESO TOTAL PRO'
      : (requierePaywall ? 'BLOQUEADO CON PAYWALL' : 'LECTURA ABIERTA (FREEMIUM)');

    return `
      <div class="flex flex-col w-full pt-28">
        ${esSandbox ? `
        <!-- BARRA SIMULADORA DE MODO DE LECTURA (Solo visible en Sandbox) -->
        <div class="sticky top-28 z-40 w-full bg-surface-container-lowest/95 backdrop-blur-md shadow-sm border-b border-outline-variant/30">
          <div class="max-w-4xl mx-auto px-margin py-space-xs flex flex-wrap items-center justify-between gap-space-sm">
            <div class="flex items-center gap-space-sm min-w-0">
              <span class="w-2.5 h-2.5 rounded-full ${esPro ? 'bg-primary' : 'bg-tertiary'} animate-pulse"></span>
              <span class="font-metadata text-metadata uppercase tracking-wider text-on-surface-variant truncate">
                Estado de Acceso: <strong class="${esPro ? 'text-primary' : 'text-tertiary'}">${estadoAccesoTexto}</strong>
              </span>
              <span class="hidden sm:inline text-outline-variant">•</span>
              <span class="hidden sm:inline font-metadata text-metadata text-outline">
                (Regla RF-02: Umbral ${umbralPaywall.toUpperCase()} • Estilo: ${estiloTransicion.toUpperCase()})
              </span>
            </div>

            <!-- Conmutador de Modo de Lectura -->
            <div class="flex items-center bg-surface-container-high p-1 rounded-full shadow-inner">
              <button id="btn-mode-freemium" class="px-space-md py-1 rounded-full font-label-badge text-label-badge uppercase transition-all ${!esPro ? 'bg-surface text-on-surface shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}">
                Vista Freemium
              </button>
              <button id="btn-mode-pro" class="px-space-md py-1 rounded-full font-label-badge text-label-badge uppercase transition-all ${esPro ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}">
                Modo Mecenas PRO
              </button>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- ARTÍCULO PRINCIPAL -->
        <article class="max-w-4xl mx-auto px-margin pt-space-lg w-full flex flex-col pb-space-xl">
          <!-- Cabecera del Ensayo -->
          <header class="flex flex-col gap-space-md mb-space-lg">
            <div class="flex flex-wrap items-center gap-space-sm">
              <span class="font-label-badge text-label-badge uppercase px-space-sm py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold tracking-widest">
                ${usaNoticiaPublicada ? 'Última Noticia Publicada' : 'Despacho #' + newsletter.numeroEdicion}
              </span>
              <span class="font-metadata text-metadata uppercase text-primary font-bold">
                ${categoriaMostrar}
              </span>
              <span class="text-outline-variant font-metadata">•</span>
              <span class="font-metadata text-metadata text-on-surface-variant">
                ${fechaMostrar}
              </span>
              <span class="text-outline-variant font-metadata">•</span>
              <div class="flex items-center gap-1 font-metadata text-metadata text-on-surface-variant">
                <span class="material-symbols-outlined text-[15px]">schedule</span>
                <span>${esArticuloPremium ? 'Edición Mecenas PRO' : 'Lectura Abierta'}</span>
              </div>
            </div>

            <h1 class="font-display-hero text-display-hero tracking-tight text-on-surface">
              ${tituloMostrar}
            </h1>
            <p class="font-body-lead text-body-lead text-on-surface-variant italic max-w-2xl">
              ${subtituloMostrar}
            </p>

            <div class="flex items-center justify-between pt-space-sm border-t border-outline-variant/20 gap-space-md">
              <div class="flex items-center gap-space-sm">
                <div class="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center font-headline-sm text-headline-sm text-primary">
                  AD
                </div>
                <div class="flex flex-col">
                  <span class="font-body-sm text-body-sm font-bold text-on-surface">${autorMostrar}</span>
                  <span class="font-metadata text-metadata text-on-surface-variant uppercase">Redacción Editorial Atelier Dispatch</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button class="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-highest flex items-center justify-center text-on-surface transition-colors" title="Guardar ensayo">
                  <span class="material-symbols-outlined text-[20px]">bookmark</span>
                </button>
                <button id="btn-share-article" class="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-highest flex items-center justify-center text-on-surface transition-colors" title="Compartir despacho">
                  <span class="material-symbols-outlined text-[20px]">share</span>
                </button>
              </div>
            </div>
          </header>

          <!-- Imagen Principal de Cabecera -->
          <div class="relative w-full rounded-2xl overflow-hidden bg-surface-container-low shadow-md mb-space-lg">
            <img class="w-full h-[380px] object-cover" alt="Fotografía editorial" src="${imagenMostrar}" />
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/40 to-transparent p-space-md text-surface-container-lowest">
              <p class="font-metadata text-metadata italic opacity-90">
                ${usaNoticiaPublicada ? `${categoriaMostrar} — Publicado el ${fechaMostrar}` : 'Fig. 1.0 — Concentración analógica en los archivos centrales. Documentación de resistencia cognitiva Atelier 2026.'}
              </p>
            </div>
          </div>

          <!-- BLOQUE 1: CONTENIDO ABIERTO / EXTRACTO INICIAL -->
          <div class="font-body-md text-body-md text-on-surface space-y-space-md leading-relaxed">
            <div class="flex items-center gap-2 mb-2">
              <span class="font-label-badge text-label-badge uppercase px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-bold">
                ${esArticuloPremium ? 'BLOQUE 01 • EXTRACTO INICIAL' : 'ARTÍCULO COMPLETO • ACCESO ABIERTO'}
              </span>
            </div>

            ${parrafosVisibles.map((p, idx) => `
              <p class="${idx === 0 ? 'first-letter:text-5xl first-letter:font-headline-lg first-letter:float-left first-letter:mr-3 first-letter:text-primary' : ''}">
                ${this._escapeHtml(p)}
              </p>
            `).join('')}

            ${!usaNoticiaPublicada && parrafosVisibles.length >= 2 ? `
              <!-- Cita Tipográfica Inspirada en Anait & Draugr -->
              <figure class="my-space-lg p-space-lg rounded-2xl bg-surface-container-low shadow-sm border-l-4 border-primary">
                <span class="material-symbols-outlined text-tertiary-container text-4xl mb-space-xs block">format_quote</span>
                <blockquote class="font-headline-md text-headline-md text-on-surface leading-tight tracking-tight">
                  «El regreso a la lectura lenta y austera no es nostalgia elitista: es una trinchera de soberanía cognitiva frente al asalto de la plataforma rentista.»
                </blockquote>
                <figcaption class="mt-space-sm font-metadata text-metadata uppercase tracking-widest text-primary font-bold">
                  — Fragmento del Manifiesto Editorial Atelier, 2026
                </figcaption>
              </figure>
            ` : ''}
          </div>

          <!-- COMPUERTA DE PAYWALL / ZONA PRO DIFERENCIADA (RF-02) -->
          ${requierePaywall ? this._renderPaywallGate({
            difuminados: parrafosDifuminados,
            estiloTransicion,
            umbralPaywall,
            precioMensualDisplay
          }) : (esPro ? `
            <!-- VISTA MECENAS PRO: ACCESO COMPLETO SIN CORTES (Escenario 2.3) -->
            <div class="mt-space-lg space-y-space-md border-t-2 border-primary/30 pt-space-lg">
              <div class="flex items-center justify-between p-space-sm bg-primary-fixed/30 rounded-xl border border-primary/20">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-[20px]">verified</span>
                  <span class="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wide">
                    Zona PRO Desbloqueada • Mecenas con Membresía Activa
                  </span>
                </div>
                <span class="font-label-badge text-label-badge uppercase px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-bold">
                  PRO UNRESTRICTED
                </span>
              </div>

              ${!usaNoticiaPublicada ? `
              <!-- Bloque 02 PRO -->
              <div class="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20">
                <span class="font-label-badge text-label-badge uppercase px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold mb-2 inline-block">
                  BLOQUE 02 • PRO RESTRICTED
                </span>
                <h3 class="font-headline-sm text-headline-sm text-on-surface mb-2">${this._escapeHtml(b2.titulo || 'Desglose Técnico de Infraestructura')}</h3>
                <p class="font-body-md text-body-md text-on-surface leading-relaxed">
                  ${this._escapeHtml(b2.contenido || 'En los datos internos del informe de audiencia de septiembre, se percibe una correlación directa entre el abandono de plataformas centralizadas y la adhesión al boletín monográfico.')}
                </p>
              </div>

              <!-- Bloque 03 PRO: Análisis Cuantitativo -->
              <div class="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20">
                <span class="font-label-badge text-label-badge uppercase px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold mb-2 inline-block">
                  BLOQUE 03 • ANÁLISIS CUANTITATIVO
                </span>
                <h3 class="font-headline-sm text-headline-sm text-on-surface mb-2">${this._escapeHtml(b3.titulo || 'Costos de Inferencia Marginal vs Calidad')}</h3>
                <p class="font-body-md text-body-md text-on-surface leading-relaxed mb-space-md">
                  ${this._escapeHtml(b3.contenido || 'Evaluamos más de 45 millones de tokens en arquitecturas densas frente a modelos de mezcla de expertos (MoE).')}
                </p>

                <!-- Mini Gráfico de Latencia y Costos -->
                <div class="p-space-sm bg-surface-container-low rounded-xl">
                  <span class="font-metadata text-metadata uppercase tracking-wider text-outline block mb-2 font-bold">Throughput de Inferencia ($/1k tokens vs Latencia en ms)</span>
                  <div class="space-y-2">
                    <div>
                      <div class="flex justify-between text-xs font-metadata mb-1">
                        <span>Dense Transformer 70B (Base)</span>
                        <span class="font-bold text-tertiary">382 ms / 0.042 $</span>
                      </div>
                      <div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div class="bg-tertiary h-full rounded-full" style="width: 85%"></div>
                      </div>
                    </div>
                    <div>
                      <div class="flex justify-between text-xs font-metadata mb-1">
                        <span>Mixture of Experts 8x7B (Opt)</span>
                        <span class="font-bold text-primary">124 ms / 0.014 $</span>
                      </div>
                      <div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div class="bg-primary h-full rounded-full" style="width: 32%"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ` : ''}

              <!-- Bloque 04 PRO: Toolkit de Descargas -->
              <div class="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20">
                <span class="font-label-badge text-label-badge uppercase px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold mb-2 inline-block">
                  RECURSOS CONFIDENCIALES PRO
                </span>
                <h3 class="font-headline-sm text-headline-sm text-on-surface mb-2">Descargas y Archivos de Investigación</h3>
                <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                  Material reproducible para miembros mecenas. Scripts de benchmarking y cuaderno de pesos crudos.
                </p>
                <div class="flex flex-wrap gap-space-sm">
                  <button onclick="window.app.showToast('Descarga iniciada: Toolkit de Auditoría de Modelos v2.4 .tar.gz (4.8 MB)', 'success')" class="inline-flex items-center gap-2 px-space-md py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary-container font-headline-sm text-xs font-bold transition-all shadow-sm">
                    <span class="material-symbols-outlined text-[16px]">download</span>
                    <span>Toolkit de Auditoría de Modelos v2.4 .tar.gz</span>
                  </button>
                  <button onclick="window.app.showToast('Descarga iniciada: Dataset Crudo de Latencia (CSV - 1.2 MB)', 'success')" class="inline-flex items-center gap-2 px-space-md py-2.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-headline-sm text-xs font-bold transition-all">
                    <span class="material-symbols-outlined text-[16px]">table_chart</span>
                    <span>Dataset Crudo de Latencia (CSV)</span>
                  </button>
                </div>
              </div>

              <!-- Ágora de Mecenas (Comentarios Habilitados) -->
              <div class="p-space-lg bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 mt-space-lg">
                <div class="flex items-center justify-between pb-space-sm border-b border-outline-variant/20 mb-space-md">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-[20px]">forum</span>
                    <h3 class="font-headline-sm text-headline-sm text-on-surface">Ágora de Mecenas PRO</h3>
                  </div>
                  <span class="font-label-badge text-label-badge uppercase px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">
                    DEBATE ABIERTO
                  </span>
                </div>
                <div class="flex flex-col gap-space-sm">
                  <textarea id="agora-comment-input" rows="3" placeholder="Publica tu respuesta crítica o reflexión técnica..." class="w-full p-space-sm bg-surface-container-low border border-outline-variant/40 rounded-xl text-on-surface font-body-sm text-body-sm outline-none focus:border-primary"></textarea>
                  <div class="flex justify-end">
                    <button onclick="window.views.ArticleView.publicarComentario()" class="px-space-md py-2 rounded-full bg-primary text-on-primary hover:bg-primary-container font-headline-sm text-xs font-bold transition-all">
                      Publicar en el Ágora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ` : `
            <!-- ARTÍCULO ABIERTO LEÍDO POR VISITANTE O FREEMIUM (Sin acceso a Zona PRO ni Ágora) -->
            <div class="mt-space-lg border-t border-outline-variant/20 pt-space-md">
              ${this._renderAgoraBloqueado()}
            </div>
          `)}
        </article>
      </div>
    `;
  },

  attachEvents(app) {
    const btnFreemium = document.getElementById('btn-mode-freemium');
    const btnPro = document.getElementById('btn-mode-pro');
    const btnShare = document.getElementById('btn-share-article');

    if (btnFreemium) {
      btnFreemium.addEventListener('click', () => {
        app.articleController.setReaderMode('freemium');
        app.reRenderRutaActual();
        app.showToast('Simulador: Vista ajustada a perspectiva Suscriptor Freemium.', 'info');
      });
    }

    if (btnPro) {
      btnPro.addEventListener('click', () => {
        app.articleController.setReaderMode('pro');
        app.reRenderRutaActual();
        app.showToast('Simulador: Vista ajustada a perspectiva Mecenas PRO (desbloqueado).', 'success');
      });
    }

    if (btnShare) {
      btnShare.addEventListener('click', () => {
        app.articleController.copiarEnlaceCompartir();
        app.showToast('Enlace del despacho copiado al portapapeles.', 'info');
      });
    }
  },

  publicarComentario() {
    const input = document.getElementById('agora-comment-input');
    if (input && input.value.trim()) {
      window.app.showToast('Comentario publicado en el Ágora de Mecenas PRO con éxito.', 'success');
      input.value = '';
    } else {
      window.app.showToast('Por favor redacta tu comentario antes de publicar.', 'error');
    }
  }
};
