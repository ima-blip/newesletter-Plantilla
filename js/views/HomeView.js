/**
 * VISTA: HomeView
 * Portada editorial y boletín dominical de Atelier Dispatch (SCREEN_4).
 */

window.views = window.views || {};

window.views.HomeView = {
  render(store) {
    const user = store.usuarioActual;
    const esPro = user && (user.esMecenasPro() || user.esAdmin());

    return `
      <div class="flex flex-col w-full pt-28">
        <!-- SUB-HEADER / CINTILLO SUPERIOR EDITORIAL -->
        <section class="w-full bg-surface-container-low px-margin py-space-sm border-b border-outline-variant/20">
          <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-space-xs text-center md:text-left">
            <div class="flex items-center gap-space-xs">
              <span class="inline-flex w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <p class="font-metadata text-metadata text-on-surface-variant uppercase tracking-wider">
                Periodismo independiente sobre el lado oscuro de la tecnología y los negocios.
                <span class="font-bold text-on-surface ml-1">Más de 2.180 lectores libres de clickbait y algoritmos.</span>
              </p>
            </div>
            <a class="group inline-flex items-center gap-1 font-label-badge text-label-badge text-primary hover:text-primary-container uppercase transition-colors cursor-pointer" onclick="window.app.navegarA('portal-suscripcion')">
              <span>${esPro ? 'Panel de Mecenas Activo' : 'Hazte Mecenas PRO (Desde $8.990 CLP)'}</span>
              <span class="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </a>
          </div>
        </section>

        <!-- CONTENIDO PRINCIPAL: PORTADA & DESTACADOS LATERALES -->
        <section class="w-full max-w-7xl mx-auto px-margin py-space-lg">
          <!-- ENCABEZADO DE SECCIÓN -->
          <div class="flex items-center justify-between mb-space-md">
            <div class="flex items-center gap-space-xs">
              <span class="font-metadata text-metadata font-bold uppercase tracking-widest text-primary">01 // Dossier Central</span>
              <span class="w-8 h-[2px] bg-primary/40"></span>
              <h2 class="font-headline-sm text-headline-sm uppercase text-on-surface">En Portada</h2>
            </div>
            <span class="font-metadata text-metadata text-on-surface-variant hidden sm:inline-block">Tirada N° 149 • Actualización Continua</span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <!-- HERO STORY (8 COLUMNAS) -->
            <article class="lg:col-span-8 flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-md group transition-all duration-300 hover:shadow-xl border border-outline-variant/30">
              <div class="relative w-full h-80 sm:h-[420px] overflow-hidden bg-surface-container">
                <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Fotografía de investigación documental" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9aCaA8iQUBJmqEty_GBZHdunmIKqv3EEZ9__WcBqp4j31Gz6lAw3ImPAq0n8mNA8LlvRa-ol06CfZBDCMl5LGtDo-mj8AZ_e0TzUWESX-UrF7Is3PYv1nGvb1OyvLWj-D_DMO5bCLCPEI_r2LwsTSbQQa7uqR_nY5rVRvS--Q_zWLeUBXKPWdQ2QbZUixyUoR_FRA3MuJ_e_BP8ffjc8MWPJp96WkBExTE0d6OnE"/>
                <div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/20 to-transparent"></div>
                
                <div class="absolute top-space-md left-space-md flex flex-wrap items-center gap-space-xs">
                  <span class="font-label-badge text-label-badge uppercase px-3 py-1 rounded-full bg-inverse-surface text-inverse-on-surface backdrop-blur-md">
                    Suscriptores
                  </span>
                  <span class="font-label-badge text-label-badge uppercase px-3 py-1 rounded-full bg-surface-container-lowest/90 text-on-surface backdrop-blur-md">
                    Noviembre 2026
                  </span>
                  <span class="font-label-badge text-label-badge uppercase px-3 py-1 rounded-full bg-surface-container-lowest/90 text-on-surface backdrop-blur-md flex items-center gap-1">
                    <span class="material-symbols-outlined text-[13px]">schedule</span> 9 min de lectura
                  </span>
                </div>

                <div class="absolute bottom-space-md left-space-md right-space-md text-inverse-on-surface">
                  <span class="font-metadata text-metadata text-inverse-primary uppercase tracking-widest block mb-1">Informe Especial // Estructura Monetaria</span>
                  <h1 onclick="window.app.navegarA('noticia')" class="font-display-hero text-display-hero text-inverse-on-surface tracking-tight leading-none mb-2 hover:text-inverse-primary transition-colors cursor-pointer">
                    La economía de la atención y el retorno al texto
                  </h1>
                </div>
              </div>

              <div class="p-space-lg flex flex-col gap-space-md bg-surface-container-lowest">
                <p class="font-body-lead text-body-lead text-on-surface-variant leading-relaxed">
                  Entre el agotamiento dopamínico del scroll perpetuo y la mercantilización del clic, la palabra escrita en reposo renace como un refugio de resistencia cognitiva y soberanía crítica. Un análisis sobre el modelo modular freemium/premium y la desintermediación del periodismo de fondo.
                </p>
                
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-xs border-t border-outline-variant/20">
                  <div class="flex items-center gap-space-sm">
                    <div class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-metadata font-bold text-primary">
                      AD
                    </div>
                    <div class="flex flex-col">
                      <span class="font-metadata text-metadata font-bold uppercase tracking-wider text-on-surface">Víctor M. Fernández &amp; Equipo Atelier</span>
                      <span class="font-metadata text-metadata text-on-surface-variant">Crítica cultural &amp; finanzas cuantitativas</span>
                    </div>
                  </div>
                  
                  <button onclick="window.app.navegarA('noticia')" class="inline-flex items-center justify-center gap-space-xs font-label-badge text-label-badge uppercase px-space-md py-3 rounded-full bg-primary text-on-primary hover:bg-primary-container transition-all shadow-sm">
                    <span>Leer Reportaje Completo</span>
                    <span class="material-symbols-outlined text-[16px]">menu_book</span>
                  </button>
                </div>
              </div>
            </article>

            <!-- SECCIÓN DESTACADOS / SIDEBAR GRID (4 COLUMNAS) -->
            <aside class="lg:col-span-4 flex flex-col gap-space-md">
              <div class="flex items-center justify-between pb-space-xs">
                <div class="flex items-center gap-space-xs">
                  <span class="material-symbols-outlined text-tertiary text-[18px]">bolt</span>
                  <h3 class="font-headline-sm text-headline-sm uppercase text-on-surface">Destacados PRO</h3>
                </div>
                <span class="font-label-badge text-label-badge uppercase text-tertiary bg-tertiary-fixed px-2 py-0.5 rounded-full font-bold">Exclusivas</span>
              </div>

              <!-- LISTA COMPACTA DE ARTÍCULOS DESTACADOS -->
              <div class="flex flex-col gap-space-sm">
                <!-- Item 1 -->
                <article onclick="window.app.navegarA('noticia')" class="p-space-md bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow group flex flex-col gap-space-xs cursor-pointer border border-outline-variant/20">
                  <div class="flex items-center justify-between">
                    <span class="font-label-badge text-label-badge uppercase px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-bold">
                      PRO • BLOQUE EXCLUSIVO
                    </span>
                    <span class="material-symbols-outlined ${esPro ? 'text-primary' : 'text-outline'} text-[16px]">
                      ${esPro ? 'lock_open' : 'lock'}
                    </span>
                  </div>
                  <h4 class="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                    El coste computacional real de los modelos fundacionales
                  </h4>
                  <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    Un desglose pormenorizado del gasto en clusters de aceleración, latencia de inferencia y la viabilidad unitaria de los grandes modelos.
                  </p>
                </article>

                <!-- Item 2 -->
                <article onclick="window.app.navegarA('noticia')" class="p-space-md bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow group flex flex-col gap-space-xs cursor-pointer border border-outline-variant/20">
                  <div class="flex items-center justify-between">
                    <span class="font-label-badge text-label-badge uppercase px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-bold">
                      PRO • DATASETS CRUDOS
                    </span>
                    <span class="material-symbols-outlined ${esPro ? 'text-primary' : 'text-outline'} text-[16px]">
                      ${esPro ? 'lock_open' : 'lock'}
                    </span>
                  </div>
                  <h4 class="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                    Análisis Cuantitativo: Costos de Inferencia Marginal vs Calidad
                  </h4>
                  <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    Evaluamos más de 45 millones de tokens en arquitecturas densas frente a modelos de mezcla de expertos (MoE).
                  </p>
                </article>

                <!-- Item 3: Caja de Conversión Rápida -->
                <div class="p-space-md bg-inverse-surface text-inverse-on-surface rounded-xl shadow-md flex flex-col gap-space-xs">
                  <span class="font-metadata text-metadata uppercase tracking-widest text-inverse-primary font-bold">Comunidad &amp; Autonomía</span>
                  <h4 class="font-headline-sm text-headline-sm text-surface-container-lowest">Apoya la investigación sin algoritmos</h4>
                  <p class="font-body-sm text-body-sm text-outline-variant">
                    Únete a los más de 340 mecenas activos que financian análisis sin censura ni compromisos comerciales.
                  </p>
                  <button onclick="window.app.navegarA('portal-suscripcion')" class="mt-2 py-2 px-space-md rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-badge uppercase font-bold text-center transition-all shadow-sm">
                    Ver Planes de Mecenazgo
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <!-- SECCIÓN: CAPTURA DE NEWSLETTER (RF-01) -->
        <section id="newsletter-capture" class="w-full bg-surface-container-low py-space-xl px-margin border-t border-outline-variant/20">
          <div class="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-space-lg bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30">
            <div class="flex flex-col gap-1 max-w-lg">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">mark_email_read</span>
                <span class="font-label-badge text-label-badge uppercase font-bold text-primary">Suscripción Gratuita (RF-01)</span>
              </div>
              <h3 class="font-headline-sm text-headline-sm text-on-surface">Recibe el despacho dominical cada semana</h3>
              <p class="font-body-sm text-body-sm text-on-surface-variant">
                Regístrate gratis. Asignación inmediata del rol Freemium para disfrutar de ensayos de apertura y noticias seleccionadas.
              </p>
            </div>
            <form id="home-newsletter-form" class="flex flex-col sm:flex-row items-center gap-space-xs w-full md:w-auto">
              <input type="email" id="home-newsletter-email" required placeholder="tu.correo@ejemplo.com" class="px-space-md py-2.5 rounded-full bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm outline-none focus:border-primary w-full sm:w-64" />
              <button type="submit" class="w-full sm:w-auto px-space-md py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary-container font-label-badge uppercase font-bold transition-all whitespace-nowrap shadow-sm">
                Suscribirme Gratis
              </button>
            </form>
          </div>
        </section>
      </div>
    `;
  },

  attachEvents(app) {
    const form = document.getElementById('home-newsletter-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('home-newsletter-email');
        const email = emailInput ? emailInput.value : '';
        if (email) {
          app.navegarA('iniciar-sesion');
          setTimeout(() => {
            const regEmail = document.getElementById('reg-email');
            if (regEmail) regEmail.value = email;
          }, 100);
        }
      });
    }
  }
};
