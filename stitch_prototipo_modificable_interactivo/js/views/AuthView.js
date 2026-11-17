/**
 * VISTA: AuthView
 * Pantalla de Registro de Suscriptor y Acceso (SCREEN_8).
 * Implementa RF-01 (Registro y Roles), RNF-03 (Cifrado seguro) y Escenarios 1.1, 1.2, 1.3.
 */

window.views = window.views || {};

window.views.AuthView = {
  render(usuarioActual) {
    return `
      <div class="flex flex-col w-full pt-28 pb-space-xl">
        <div class="w-full max-w-7xl mx-auto px-margin py-space-lg">
          <!-- HEADER EDITORIAL DE AUTENTICACIÓN -->
          <div class="max-w-3xl mb-space-xl">
            <div class="flex items-center gap-space-xs mb-space-xs">
              <span class="inline-flex items-center gap-1 font-label-badge text-label-badge uppercase px-space-sm py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-bold tracking-widest">
                <span class="material-symbols-outlined text-[13px]">verified_user</span>
                Control de Acceso • RF-01 &amp; RNF-03
              </span>
              <span class="font-metadata text-metadata text-secondary tracking-widest uppercase">Protocolo Seguro</span>
            </div>
            <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight leading-none mb-space-sm">
              Únete a la lectura sin ruido ni algoritmos.
            </h1>
            <p class="font-body-lead text-body-lead text-on-surface-variant max-w-2xl">
              Crea tu cuenta de lector libre de rastreo. Acceso inmediato asignado con rol Freemium para la edición semanal y ensayos de apertura.
            </p>
          </div>

          <!-- CONTENEDOR PRINCIPAL ASIMÉTRICO (BENTO EDITORIAL) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <!-- COLUMNA PRINCIPAL: TABS REGISTRO / INICIAR SESIÓN (7 Cols) -->
            <div class="lg:col-span-7 flex flex-col bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm border border-outline-variant/30">
              <!-- SELECTOR DE PESTAÑAS -->
              <div class="flex items-center p-1 bg-surface-container-low rounded-full mb-space-md max-w-md">
                <button id="tab-register-btn" class="flex-1 py-space-xs px-space-md rounded-full font-headline-sm text-[13px] tracking-wider uppercase transition-all duration-200 bg-primary text-on-primary shadow-sm flex items-center justify-center gap-1 font-bold">
                  <span class="material-symbols-outlined text-[16px]">person_add</span>
                  <span>Crear Cuenta (Registro)</span>
                </button>
                <button id="tab-login-btn" class="flex-1 py-space-xs px-space-md rounded-full font-headline-sm text-[13px] tracking-wider uppercase transition-all duration-200 text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">login</span>
                  <span>Iniciar Sesión</span>
                </button>
              </div>

              <!-- FORMULARIO 1: CREAR CUENTA FREEMIUM (RF-01 + RNF-03) -->
              <div id="panel-register" class="flex flex-col">
                <div class="flex items-start gap-space-sm p-space-sm bg-surface-container-low rounded-xl mb-space-md border border-outline-variant/30">
                  <span class="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
                  <div class="flex flex-col">
                    <span class="font-headline-sm text-[13px] text-on-surface uppercase tracking-wider font-bold">
                      Rol inicial asignado automáticamente: Suscriptor Freemium (RF-01)
                    </span>
                    <span class="font-body-sm text-body-sm text-on-surface-variant">
                      Tu perfil obtendrá pase ilimitado a notas abiertas, despachos dominicales e hilos de discusión moderados.
                    </span>
                  </div>
                </div>

                <form id="form-register-user" class="flex flex-col gap-space-sm">
                  <!-- ALIAS / NOMBRE -->
                  <div class="flex flex-col gap-1">
                    <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="reg-name">
                      Nombre completo o Alias de lector *
                    </label>
                    <div class="relative flex items-center">
                      <span class="material-symbols-outlined absolute left-3 text-secondary text-[18px]">badge</span>
                      <input id="reg-name" type="text" required placeholder="Ej. Mateo Berardi o @m_arch" value="Mateo Berardi" class="w-full pl-10 pr-4 py-space-xs bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-xl border border-outline-variant/40 outline-none focus:border-primary transition-all" />
                    </div>
                  </div>

                  <!-- CORREO ELECTRÓNICO -->
                  <div class="flex flex-col gap-1">
                    <div class="flex justify-between items-baseline">
                      <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="reg-email">
                        Correo electrónico *
                      </label>
                      <span class="font-metadata text-metadata text-secondary">Donde recibirás el boletín</span>
                    </div>
                    <div class="relative flex items-center">
                      <span class="material-symbols-outlined absolute left-3 text-secondary text-[18px]">mail</span>
                      <input id="reg-email" type="email" required placeholder="tu.nombre@editorial.org" value="mateo.berardi@politecnico.it" class="w-full pl-10 pr-4 py-space-xs bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-xl border border-outline-variant/40 outline-none focus:border-primary transition-all" />
                    </div>
                  </div>

                  <!-- CONTRASEÑA CON INDICADOR RNF-03 -->
                  <div class="flex flex-col gap-1">
                    <div class="flex justify-between items-baseline">
                      <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="reg-password">
                        Contraseña maestra *
                      </label>
                      <span class="font-label-badge text-[9px] uppercase px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-bold tracking-widest">
                        RNF-03 • Argon2id / Salt
                      </span>
                    </div>
                    <div class="relative flex items-center">
                      <span class="material-symbols-outlined absolute left-3 text-secondary text-[18px]">lock</span>
                      <input id="reg-password" type="password" required placeholder="Mínimo 8 caracteres, alfanumérica" value="MateoAlpha2026!" class="w-full pl-10 pr-10 py-space-xs bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-xl border border-outline-variant/40 outline-none focus:border-primary transition-all" />
                    </div>
                    <!-- Medidor de entropía de contraseña -->
                    <div class="flex items-center gap-2 mt-1">
                      <div class="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden flex gap-0.5">
                        <div id="bar-1" class="h-full w-1/4 bg-primary-container transition-colors"></div>
                        <div id="bar-2" class="h-full w-1/4 bg-primary-container transition-colors"></div>
                        <div id="bar-3" class="h-full w-1/4 bg-primary-container transition-colors"></div>
                        <div id="bar-4" class="h-full w-1/4 bg-primary-container transition-colors"></div>
                      </div>
                      <span id="strength-label" class="font-metadata text-metadata text-secondary w-28 text-right">Excelente (Argon2id)</span>
                    </div>
                  </div>

                  <!-- CONFIRMAR CONTRASEÑA (Escenario 1.2) -->
                  <div class="flex flex-col gap-1" id="group-reg-confirm">
                    <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="reg-password-confirm">
                      Confirmar Contraseña *
                    </label>
                    <div class="relative flex items-center">
                      <span class="material-symbols-outlined absolute left-3 text-secondary text-[18px]">lock_reset</span>
                      <input id="reg-password-confirm" type="password" required placeholder="Reingresa tu contraseña" value="MateoAlpha2026!" class="w-full pl-10 pr-4 py-space-xs bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-xl border border-outline-variant/40 outline-none focus:border-primary transition-all" />
                    </div>
                    <span id="reg-password-error" class="hidden text-xs text-error font-metadata font-bold mt-1"></span>
                  </div>

                  <!-- CASILLA MANIFIESTO -->
                  <div class="flex items-start gap-space-xs pt-space-xs">
                    <input id="reg-terms" type="checkbox" required checked class="mt-1 w-4 h-4 rounded border-outline text-primary focus:ring-primary" />
                    <label for="reg-terms" class="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                      Acepto el <a class="text-primary underline font-bold" href="#">Manifiesto Editorial</a> y la <a class="text-primary underline font-bold" href="#">Política de Cero Rastreadores</a>.
                    </label>
                  </div>

                  <!-- BOTÓN REGISTRARSE -->
                  <button type="submit" id="btn-submit-register" class="w-full py-3.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-body-sm font-bold uppercase tracking-wider transition-all shadow-md mt-space-xs flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">person_add</span>
                    <span>Crear Cuenta Gratis (Asignar Rol Freemium)</span>
                  </button>
                </form>
              </div>

              <!-- FORMULARIO 2: INICIAR SESIÓN -->
              <div id="panel-login" class="hidden flex flex-col">
                <form id="form-login-user" class="flex flex-col gap-space-sm">
                  <div class="flex flex-col gap-1">
                    <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="login-email">
                      Correo Electrónico *
                    </label>
                    <input id="login-email" type="email" required placeholder="tu.correo@editorial.org" class="w-full px-space-md py-space-xs bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl border border-outline-variant/40 outline-none focus:border-primary" />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="font-metadata text-metadata uppercase tracking-wider text-on-surface font-bold" for="login-pass">
                      Contraseña *
                    </label>
                    <input id="login-pass" type="password" required placeholder="Tu contraseña maestra" class="w-full px-space-md py-space-xs bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl border border-outline-variant/40 outline-none focus:border-primary" />
                  </div>
                  <button type="submit" class="w-full py-3.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-body-sm font-bold uppercase tracking-wider transition-all shadow-md mt-space-xs flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">login</span>
                    <span>Entrar a mi Cuenta</span>
                  </button>
                </form>
              </div>
            </div>

            <!-- COLUMNA LATERAL: SANDBOX QA DE ROLES (Escenario 1.3) -->
            <div class="lg:col-span-5 flex flex-col gap-space-md">
              <div class="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-sm flex flex-col gap-space-sm">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-[20px]">tune</span>
                  <h3 class="font-headline-sm text-headline-sm text-on-surface">Sandbox QA • Prueba de Roles (RF-01)</h3>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant">
                  Escenario 1.3: Haz clic en cualquiera de los roles de prueba preconfigurados para iniciar sesión instantáneamente y evaluar el comportamiento del sistema:
                </p>

                <div class="space-y-2 pt-space-xs">
                  <!-- Chip 1: Mateo (Freemium) -->
                  <div onclick="window.app.authController.handleQALogin('ROLE_FREEMIUM')" class="p-space-sm bg-surface-container-lowest hover:bg-surface-container-high rounded-xl cursor-pointer transition-all border border-outline-variant/30 flex items-center justify-between">
                    <div class="flex flex-col">
                      <span class="font-headline-sm text-xs font-bold text-on-surface">Mateo Berardi</span>
                      <span class="font-metadata text-[11px] text-outline">mateo.berardi@politecnico.it</span>
                    </div>
                    <span class="font-label-badge text-[10px] uppercase px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-bold">
                      FREEMIUM
                    </span>
                  </div>

                  <!-- Chip 2: Helena (PRO) -->
                  <div onclick="window.app.authController.handleQALogin('ROLE_MECENAS_PRO')" class="p-space-sm bg-surface-container-lowest hover:bg-surface-container-high rounded-xl cursor-pointer transition-all border border-outline-variant/30 flex items-center justify-between">
                    <div class="flex flex-col">
                      <span class="font-headline-sm text-xs font-bold text-on-surface">Helena Sampedro</span>
                      <span class="font-metadata text-[11px] text-outline">helena.sampedro@editorial-libre.org</span>
                    </div>
                    <span class="font-label-badge text-[10px] uppercase px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">
                      MECENAS PRO
                    </span>
                  </div>

                  <!-- Chip 3: Carlos (Admin) -->
                  <div onclick="window.app.authController.handleQALogin('ROLE_ROOT_ADMIN')" class="p-space-sm bg-surface-container-lowest hover:bg-surface-container-high rounded-xl cursor-pointer transition-all border border-outline-variant/30 flex items-center justify-between">
                    <div class="flex flex-col">
                      <span class="font-headline-sm text-xs font-bold text-on-surface">Carlos Domínguez</span>
                      <span class="font-metadata text-[11px] text-outline">carlos.dominguez@atelier.press</span>
                    </div>
                    <span class="font-label-badge text-[10px] uppercase px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                      ROOT ADMIN
                    </span>
                  </div>
                </div>
              </div>

              <!-- Garantía Cero Rastreo -->
              <div class="p-space-md bg-inverse-surface text-inverse-on-surface rounded-2xl flex items-center gap-space-sm border border-outline/30">
                <span class="material-symbols-outlined text-primary text-[28px]">shield</span>
                <div class="flex flex-col">
                  <span class="font-headline-sm text-sm text-surface-container-lowest">Política de Cero Rastreadores</span>
                  <span class="font-body-sm text-xs text-outline-variant">Tus credenciales nunca se comparten con terceros ni redes de publicidad.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  attachEvents(app) {
    const tabRegister = document.getElementById('tab-register-btn');
    const tabLogin = document.getElementById('tab-login-btn');
    const panelRegister = document.getElementById('panel-register');
    const panelLogin = document.getElementById('panel-login');
    const regPassword = document.getElementById('reg-password');
    const regPasswordConfirm = document.getElementById('reg-password-confirm');
    const formRegister = document.getElementById('form-register-user');
    const formLogin = document.getElementById('form-login-user');

    if (tabRegister && tabLogin) {
      tabRegister.addEventListener('click', () => {
        panelRegister.classList.remove('hidden');
        panelLogin.classList.add('hidden');
        tabRegister.className = 'flex-1 py-space-xs px-space-md rounded-full font-headline-sm text-[13px] tracking-wider uppercase transition-all duration-200 bg-primary text-on-primary shadow-sm flex items-center justify-center gap-1 font-bold';
        tabLogin.className = 'flex-1 py-space-xs px-space-md rounded-full font-headline-sm text-[13px] tracking-wider uppercase transition-all duration-200 text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-1';
      });

      tabLogin.addEventListener('click', () => {
        panelRegister.classList.add('hidden');
        panelLogin.classList.remove('hidden');
        tabLogin.className = 'flex-1 py-space-xs px-space-md rounded-full font-headline-sm text-[13px] tracking-wider uppercase transition-all duration-200 bg-primary text-on-primary shadow-sm flex items-center justify-center gap-1 font-bold';
        tabRegister.className = 'flex-1 py-space-xs px-space-md rounded-full font-headline-sm text-[13px] tracking-wider uppercase transition-all duration-200 text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-1';
      });
    }

    if (regPassword) {
      regPassword.addEventListener('input', (e) => {
        const val = e.target.value;
        const res = app.authController.evaluarPassword(val);
        const b1 = document.getElementById('bar-1');
        const b2 = document.getElementById('bar-2');
        const b3 = document.getElementById('bar-3');
        const b4 = document.getElementById('bar-4');
        const label = document.getElementById('strength-label');

        [b1, b2, b3, b4].forEach((b, idx) => {
          if (idx < res.score) {
            b.className = `h-full w-1/4 ${res.color} transition-colors`;
          } else {
            b.className = 'h-full w-1/4 bg-surface-variant transition-colors';
          }
        });
        if (label) label.textContent = res.label;
      });
    }

    if (formRegister) {
      formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('reg-name').value;
        const correo = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const passwordConfirm = document.getElementById('reg-password-confirm').value;
        const aceptaTerminos = document.getElementById('reg-terms').checked;

        const errSpan = document.getElementById('reg-password-error');
        const confirmInput = document.getElementById('reg-password-confirm');

        const resultado = app.authController.handleRegistro({
          nombre,
          correo,
          password,
          passwordConfirm,
          aceptaTerminos
        });

        if (resultado.exito) {
          if (errSpan) errSpan.classList.add('hidden');
          confirmInput.classList.remove('border-error', 'ring-1', 'ring-error');
          app.showToast(resultado.mensaje, 'success');
          app.navegarA('portada-noticias');
        } else {
          if (resultado.campoError === 'passwordConfirm' && errSpan && confirmInput) {
            confirmInput.classList.add('border-error', 'ring-1', 'ring-error');
            errSpan.textContent = resultado.mensaje;
            errSpan.classList.remove('hidden');
          }
          app.showToast(resultado.mensaje, 'error');
        }
      });
    }

    if (formLogin) {
      formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const correo = document.getElementById('login-email').value;
        const password = document.getElementById('login-pass').value;

        const resultado = app.authController.handleLogin({ correo, password });
        if (resultado.exito) {
          app.showToast(resultado.mensaje, 'success');
          app.navegarA('portada-noticias');
        } else {
          app.showToast(resultado.mensaje, 'error');
        }
      });
    }
  }
};
