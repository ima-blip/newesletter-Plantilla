/**
 * VISTA: SubscriptionView
 * Portal de Mecenazgo y Pasarela de Pago Simulada (RF-03).
 * Implementa Escenarios 3.1 (Upgrade Exitoso) y 3.2 (Rechazo por Fondos Insuficientes).
 */

window.views = window.views || {};

window.views.SubscriptionView = {
  render(precios, usuarioActual) {
    const isAnnual = precios.isAnnual;
    const esPro = usuarioActual && usuarioActual.esMecenasPro();

    return `
      <div class="flex flex-col w-full pt-28 pb-space-xl">
        <!-- BARRA DE TRANSPARENCIA EDITORIAL -->
        <section class="w-full bg-surface-container-high py-space-sm px-margin border-b border-outline-variant/20">
          <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-surface">
            <div class="flex items-center gap-space-sm">
              <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-tertiary text-on-tertiary font-label-badge text-label-badge uppercase tracking-wider">
                <span class="w-1.5 h-1.5 rounded-full bg-surface-container-lowest animate-ping"></span>
                Independencia Real
              </span>
              <p class="font-metadata text-metadata uppercase tracking-wider text-on-surface-variant">
                Pacto Editorial 2026: Cero publicidad, patrocinios opacos o trackers de retención
              </p>
            </div>
            <div class="flex items-center gap-space-md font-metadata text-metadata text-primary uppercase font-bold">
              <span>Auditoría abierta trimestral</span>
              <span class="text-outline-variant">•</span>
              <span>Cancelación en 1 clic</span>
            </div>
          </div>
        </section>

        <!-- SECCIÓN HERO DEL PORTAL -->
        <section class="w-full px-margin py-space-xl max-w-7xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            <div class="lg:col-span-8 flex flex-col gap-space-md">
              <div class="flex items-center gap-space-sm">
                <span class="font-metadata text-metadata uppercase tracking-widest text-primary font-bold">Mapeo Comunitario • Temporada V</span>
                <span class="text-outline-variant">/</span>
                <span class="font-metadata text-metadata uppercase tracking-wider text-on-surface-variant">Suscripción &amp; Mecenazgo (RF-03)</span>
              </div>
              <h1 class="font-display-hero text-display-hero text-on-surface tracking-tight">
                Hazte mecenas de un periodismo <span class="italic font-body-lead font-normal text-primary">sosegado</span> e independiente.
              </h1>
              <p class="font-body-lead text-body-lead text-on-surface-variant max-w-3xl">
                Creemos que la única manera de analizar la tecnología, el poder y la cultura sin compromisos es que nos pagues tú. Sin banners parpadeantes, sin métricas infladas y sin titulares fabricados para el algoritmo.
              </p>

              <!-- BARRA DE SOSTENIBILIDAD COMUNITARIA -->
              <div class="mt-space-md bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
                <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-xs">
                  <div>
                    <span class="font-metadata text-metadata uppercase tracking-widest text-on-surface-variant block mb-1">Estado de Sostenibilidad Comunitaria</span>
                    <div class="flex items-baseline gap-space-xs">
                      <span class="font-headline-lg text-headline-lg text-on-surface font-bold">1.428</span>
                      <span class="font-headline-sm text-headline-sm text-on-surface-variant">mecenas activos</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="font-label-badge text-label-badge uppercase bg-surface-container text-primary px-3 py-1 rounded-full font-bold">
                      82% del objetivo 2026
                    </span>
                    <p class="font-metadata text-metadata text-on-surface-variant mt-1">Meta: 1.750 mecenas para costear 2 corresponsalías de campo</p>
                  </div>
                </div>
                <div class="w-full bg-surface-container-high h-3 rounded-full overflow-hidden p-0.5">
                  <div class="bg-gradient-to-r from-primary to-primary-container h-full rounded-full transition-all duration-1000 ease-out" style="width: 82%"></div>
                </div>
              </div>
            </div>

            <!-- TARJETA LATERAL MANIFIESTO -->
            <div class="lg:col-span-4 flex flex-col gap-space-md">
              <div class="relative overflow-hidden rounded-2xl bg-inverse-surface text-inverse-on-surface p-space-lg shadow-xl border border-outline/30">
                <div class="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-primary/20 blur-2xl"></div>
                <span class="font-metadata text-metadata text-inverse-primary uppercase tracking-widest block mb-space-sm font-bold">Declaración de Autonomía</span>
                <h3 class="font-headline-md text-headline-md text-surface-container-lowest mb-space-sm">Por qué repudiamos la monetización tradicional</h3>
                <p class="font-body-md text-body-md text-outline-variant mb-space-md">
                  «Cuando una cabecera acepta que su nómina dependa del clic compulsivo o de las agencias de medios, el lector deja de ser el cliente y se convierte en el ganado que se entrega al anunciante.»
                </p>
                <div class="flex items-center gap-3 pt-space-sm border-t border-outline/30">
                  <div class="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center font-headline-sm text-primary font-bold">AD</div>
                  <div class="flex flex-col">
                    <span class="font-headline-sm text-sm text-surface-container-lowest">Consejo Editorial Atelier</span>
                    <span class="font-metadata text-[10px] text-outline-variant">Madrid • Berlín • Santiago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- SELECTOR DE PLANES & PERIODICIDAD (RF-03) -->
        <section class="w-full bg-surface-container-low py-space-xl px-margin border-t border-outline-variant/20">
          <div class="max-w-7xl mx-auto flex flex-col items-center">
            <!-- Conmutador Mensual / Anual -->
            <div class="flex items-center justify-center mb-space-xl">
              <div class="flex items-center bg-surface-container-high p-1.5 rounded-full shadow-inner">
                <button id="toggle-freq-monthly" class="px-space-md py-space-xs rounded-full font-headline-sm text-sm uppercase transition-all ${!isAnnual ? 'bg-surface-container-lowest text-on-surface shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}">
                  Facturación Mensual
                </button>
                <button id="toggle-freq-annual" class="px-space-md py-space-xs rounded-full font-headline-sm text-sm uppercase transition-all ${isAnnual ? 'bg-surface-container-lowest text-on-surface shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'} flex items-center gap-2">
                  <span>Anual (89 €/año)</span>
                  <span class="font-label-badge text-[9px] bg-primary text-on-primary px-2 py-0.5 rounded-full font-bold">2 Meses Gratis</span>
                </button>
              </div>
            </div>

            <!-- GRILLA DE PLANES (FREEMIUM VS MECENAS PRO) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-space-lg w-full max-w-4xl mb-space-xl">
              <!-- Plan 1: Suscriptor Freemium -->
              <div class="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm flex flex-col justify-between">
                <div>
                  <span class="font-label-badge text-label-badge uppercase px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-bold inline-block mb-space-sm">
                    Plan Inicial Gratuito
                  </span>
                  <h3 class="font-headline-md text-headline-md text-on-surface mb-1">Lector Freemium</h3>
                  <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">Acceso abierto a notas semanales, despachos de apertura y manifiesto.</p>
                  
                  <div class="text-3xl font-display-hero text-on-surface font-bold mb-space-md">
                    0 € <span class="text-xs font-metadata text-outline">/ siempre gratis</span>
                  </div>

                  <ul class="space-y-2 text-sm font-body-sm text-on-surface-variant mb-space-md">
                    <li class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[16px]">check</span> Boletín dominical abierto</li>
                    <li class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[16px]">check</span> Acceso a lecturas de portada</li>
                    <li class="flex items-center gap-2 text-outline"><span class="material-symbols-outlined text-outline text-[16px]">close</span> Monografías completas con paywall</li>
                    <li class="flex items-center gap-2 text-outline"><span class="material-symbols-outlined text-outline text-[16px]">close</span> Datasets y toolkits descargables</li>
                  </ul>
                </div>

                <div class="p-space-sm bg-surface-container-low rounded-xl text-center text-xs font-metadata text-on-surface-variant">
                  ${usuarioActual && usuarioActual.esFreemium() ? '✓ Tu plan activo actual' : 'Incluido al registrarte'}
                </div>
              </div>

              <!-- Plan 2: Mecenas PRO (Destacado) -->
              <div class="p-space-lg rounded-2xl bg-surface-container-lowest border-2 border-primary shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div class="absolute top-0 right-0 bg-primary text-on-primary font-label-badge text-[10px] uppercase font-bold px-4 py-1 rounded-bl-xl tracking-wider">
                  Recomendado
                </div>

                <div>
                  <span class="font-label-badge text-label-badge uppercase px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-bold inline-block mb-space-sm">
                    Pase de Acceso Total
                  </span>
                  <h3 class="font-headline-md text-headline-md text-on-surface mb-1">Mecenas PRO</h3>
                  <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">Sin compuertas, sin cortes y con acceso a todo el archivo confidencial.</p>
                  
                  <div class="text-4xl font-display-hero text-primary font-bold mb-space-md">
                    ${precios.precioDisplay} <span class="text-xs font-metadata text-outline font-normal">${precios.periodoDisplay}</span>
                  </div>

                  <ul class="space-y-2 text-sm font-body-sm text-on-surface mb-space-md">
                    <li class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[18px]">check_circle</span> Acceso irrestricto a todos los dossiers</li>
                    <li class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[18px]">check_circle</span> Descarga de datasets crudos y toolkits</li>
                    <li class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[18px]">check_circle</span> Participación en el Ágora de debate</li>
                    <li class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[18px]">check_circle</span> Feed RSS privado sin intermediarios</li>
                  </ul>
                </div>

                <button id="btn-select-pro" class="w-full py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-badge uppercase font-bold tracking-wider transition-all shadow-md text-center">
                  ${esPro ? '✓ Eres Mecenas PRO (Activo)' : 'Unirme como Mecenas PRO Ahora'}
                </button>
              </div>
            </div>

            <!-- FORMULARIO DE PAGO SIMULADO (RF-03) -->
            <div id="checkout-container" class="w-full max-w-2xl bg-surface-container-lowest p-space-lg rounded-2xl shadow-md border border-outline-variant/30">
              <div class="flex items-center justify-between pb-space-sm border-b border-outline-variant/20 mb-space-md">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-[22px]">credit_card</span>
                  <h3 class="font-headline-sm text-headline-sm text-on-surface">Método de Pago Seguro (Simulado)</h3>
                </div>
                <span class="font-label-badge text-label-badge uppercase px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                  SANDBOX SEGURO
                </span>
              </div>

              <!-- CHIPS DE PRUEBA RÁPIDA SANDBOX (Escenarios 3.1 y 3.2) -->
              <div class="p-space-sm bg-surface-container-low rounded-xl mb-space-md">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="font-metadata text-metadata font-bold uppercase text-on-surface">Chips de Prueba Rápida QA:</span>
                  <span class="font-metadata text-[10px] text-outline">Simula respuestas de pasarela</span>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                  <button type="button" id="chip-card-valid" class="px-3 py-1 rounded-full bg-primary-fixed hover:bg-primary text-on-primary-fixed hover:text-on-primary font-label-badge uppercase text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm">
                    <span class="material-symbols-outlined text-[13px]">check_circle</span>
                    <span>Tarjeta Válida (4242 • 200 OK)</span>
                  </button>
                  <button type="button" id="chip-card-declined" class="px-3 py-1 rounded-full bg-error-container hover:bg-error text-on-error-container hover:text-on-error font-label-badge uppercase text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm">
                    <span class="material-symbols-outlined text-[13px]">cancel</span>
                    <span>Tarjeta Sin Fondos (4000 • 402 Error)</span>
                  </button>
                </div>
              </div>

              <!-- Feedback Banner -->
              <div id="payment-feedback-banner" class="hidden p-space-sm rounded-xl mb-space-md text-sm font-body-sm transition-all"></div>

              <!-- Formulario de Checkout -->
              <form id="form-checkout" class="flex flex-col gap-space-sm">
                <!-- Nombre del Titular -->
                <div class="flex flex-col gap-1">
                  <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="cardholder-name">
                    Nombre del Titular de la Tarjeta *
                  </label>
                  <input type="text" id="cardholder-name" required value="${usuarioActual ? usuarioActual.nombre : 'Mateo Berardi'}" class="w-full px-space-md py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm outline-none focus:border-primary" />
                </div>

                <!-- Correo Electrónico del Suscriptor -->
                <div class="flex flex-col gap-1">
                  <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="checkout-email">
                    Correo para Remitir Credenciales PRO *
                  </label>
                  <input type="email" id="checkout-email" required value="${usuarioActual ? usuarioActual.correo : 'mateo.berardi@politecnico.it'}" class="w-full px-space-md py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm outline-none focus:border-primary" />
                </div>

                <!-- Número de Tarjeta -->
                <div class="flex flex-col gap-1">
                  <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="card-number">
                    Número de Tarjeta de Prueba *
                  </label>
                  <div class="relative flex items-center">
                    <span class="material-symbols-outlined absolute left-3 text-secondary text-[18px]">credit_card</span>
                    <input type="text" id="card-number" required placeholder="4242 4242 4242 4242" value="4242 4242 4242 4242" class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm outline-none focus:border-primary font-mono tracking-wider" />
                  </div>
                </div>

                <!-- Caducidad y CVC -->
                <div class="grid grid-cols-2 gap-space-sm">
                  <div class="flex flex-col gap-1">
                    <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="card-expiry">
                      Caducidad (MM/AA) *
                    </label>
                    <input type="text" id="card-expiry" required placeholder="12/28" value="12/28" class="w-full px-space-md py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm outline-none focus:border-primary font-mono" />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="card-cvc">
                      CVC / Código de Seguridad *
                    </label>
                    <input type="text" id="card-cvc" required placeholder="888" value="888" class="w-full px-space-md py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm outline-none focus:border-primary font-mono" />
                  </div>
                </div>

                <!-- Resumen de Facturación -->
                <div class="p-space-sm bg-surface-container-low rounded-xl text-xs font-metadata space-y-1 my-space-xs">
                  <div class="flex justify-between text-on-surface-variant">
                    <span>Plan Seleccionado:</span>
                    <strong class="text-on-surface" id="summary-plan">${precios.planNombre}</strong>
                  </div>
                  <div class="flex justify-between text-on-surface-variant">
                    <span>Base Imponible:</span>
                    <span id="summary-subtotal">${precios.subtotal}</span>
                  </div>
                  <div class="flex justify-between text-on-surface-variant">
                    <span>IVA (21%):</span>
                    <span id="summary-iva">${precios.iva}</span>
                  </div>
                  <div class="flex justify-between font-bold text-sm text-primary pt-1 border-t border-outline-variant/30">
                    <span>Total a Confirmar:</span>
                    <span id="summary-total">${precios.total}</span>
                  </div>
                </div>

                <!-- Botón de Confirmación -->
                <button type="submit" id="btn-submit-payment" class="w-full py-3.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-badge uppercase font-bold tracking-wider transition-all shadow-md flex items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">lock</span>
                  <span id="btn-payment-text">Confirmar Aportación y Acceder a Todo el Contenido</span>
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    `;
  },

  attachEvents(app) {
    const toggleMonthly = document.getElementById('toggle-freq-monthly');
    const toggleAnnual = document.getElementById('toggle-freq-annual');
    const chipValid = document.getElementById('chip-card-valid');
    const chipDeclined = document.getElementById('chip-card-declined');
    const form = document.getElementById('form-checkout');
    const btnSubmit = document.getElementById('btn-submit-payment');
    const btnText = document.getElementById('btn-payment-text');
    const feedback = document.getElementById('payment-feedback-banner');

    if (toggleMonthly) {
      toggleMonthly.addEventListener('click', () => {
        app.subscriptionController.setPeriodoFacturacion(false);
        app.reRenderRutaActual();
      });
    }

    if (toggleAnnual) {
      toggleAnnual.addEventListener('click', () => {
        app.subscriptionController.setPeriodoFacturacion(true);
        app.reRenderRutaActual();
      });
    }

    if (chipValid) {
      chipValid.addEventListener('click', () => {
        document.getElementById('card-number').value = '4242 4242 4242 4242';
        document.getElementById('card-expiry').value = '12/28';
        document.getElementById('card-cvc').value = '888';
        document.getElementById('cardholder-name').value = 'Helena Sampedro';
        document.getElementById('checkout-email').value = 'helena.sampedro@editorial-libre.org';
        if (feedback) feedback.classList.add('hidden');
      });
    }

    if (chipDeclined) {
      chipDeclined.addEventListener('click', () => {
        document.getElementById('card-number').value = '4000 0000 0000 0002';
        document.getElementById('card-expiry').value = '09/26';
        document.getElementById('card-cvc').value = '005';
        document.getElementById('cardholder-name').value = 'Usuario Test Declinado';
        document.getElementById('checkout-email').value = 'fondos.insuficientes@sandbox.test';
        if (feedback) feedback.classList.add('hidden');
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titular = document.getElementById('cardholder-name').value;
        const correo = document.getElementById('checkout-email').value;
        const numeroTarjeta = document.getElementById('card-number').value;
        const caducidad = document.getElementById('card-expiry').value;
        const cvc = document.getElementById('card-cvc').value;

        btnSubmit.disabled = true;
        btnText.textContent = 'Verificando con pasarela simulada (<500ms)...';

        const resultado = await app.subscriptionController.procesarCheckout({
          titular,
          correo,
          numeroTarjeta,
          caducidad,
          cvc
        });

        btnSubmit.disabled = false;
        btnText.textContent = 'Confirmar Aportación y Acceder a Todo el Contenido';

        if (feedback) {
          feedback.classList.remove('hidden');
          if (resultado.exito) {
            feedback.className = 'p-space-sm rounded-xl mb-space-md text-sm font-body-sm bg-primary-fixed text-on-primary-fixed block border border-primary';
            feedback.innerHTML = `<strong>¡Pago 200 OK Confirmado!</strong> ${resultado.mensaje} <br><a onclick="window.app.navegarA('noticia')" class="underline font-bold cursor-pointer mt-1 inline-block">Ir a leer el ensayo completo desbloqueado →</a>`;
          } else {
            feedback.className = 'p-space-sm rounded-xl mb-space-md text-sm font-body-sm bg-error-container text-on-error-container block border border-error';
            feedback.innerHTML = `<strong>Error de Pasarela (Código 402):</strong> ${resultado.mensaje}`;
          }
        }
      });
    }
  }
};
