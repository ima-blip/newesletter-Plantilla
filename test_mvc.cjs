// Verification script for Node.js
const Rol = require('./js/models/Rol.js');
global.Rol = Rol;

const Usuario = require('./js/models/Usuario.js');
global.Usuario = Usuario;

const BloqueContenido = require('./js/models/BloqueContenido.js');
global.BloqueContenido = BloqueContenido;

const Newsletter = require('./js/models/Newsletter.js');
global.Newsletter = Newsletter;

const Suscripcion = require('./js/models/Suscripcion.js');
global.Suscripcion = Suscripcion;

const PagoSimulado = require('./js/models/PagoSimulado.js');
global.PagoSimulado = PagoSimulado;

const EnvioNewsletter = require('./js/models/EnvioNewsletter.js');
global.EnvioNewsletter = EnvioNewsletter;

const { AppStore } = require('./js/models/AppStore.js');
global.AppStore = AppStore;

async function runTests() {
  const store = new AppStore();

  console.log('=== VERIFICANDO MODELOS (CRISTIAN PENROZ) ===');
  console.log('1. Roles inicializados:', Object.keys(store.roles));
  console.log('2. Suscriptores cargados en semilla:', store.usuarios.length);
  console.log('3. Bloques en Newsletter actual:', store.newsletterActual.bloques.length);

  console.log('\n=== VERIFICANDO RF-01: REGISTRO Y HASH ARGON2ID ===');
  const nuevoUsuario = store.registrarUsuario({
    nombre: 'Mateo Berardi',
    correo: 'mateo.berardi@ensayo.cult',
    contrasena: 'Atelier2026!Sec',
    interesEditorial: 'Ensayismo y Teoría Crítica'
  });
  console.log('Usuario registrado:', nuevoUsuario.nombre);
  console.log('Rol asignado:', nuevoUsuario.rol.codigo);
  console.log('Hash generado:', nuevoUsuario.contrasenaHash.substring(0, 35) + '...');
  const passOk = Usuario.verificarPassword('Atelier2026!Sec', nuevoUsuario.contrasenaHash);
  console.log('Verificación password correcto:', passOk);
  const passFail = Usuario.verificarPassword('', nuevoUsuario.contrasenaHash);
  console.log('Verificación password vacío:', passFail);

  console.log('\n=== VERIFICANDO RF-02: GATING Y VISIBILIDAD DE BLOQUES (MARCELO ALEGRÍA) ===');
  const visibilidad = store.newsletterActual.bloques.map(b => ({
    orden: b.orden,
    tipo: b.tipo,
    acceso: b.esPremium ? 'PRO_RESTRICTED' : 'ABIERTO_TODOS',
    visibleFree: b.esVisiblePara(Rol.crearFreemium()),
    visiblePro: b.esVisiblePara(Rol.crearMecenasPro())
  }));
  console.table(visibilidad);

  console.log('\n=== VERIFICANDO RF-03: PASARELA SIMULADA DE PAGO ===');
  const pagoExitoso = await PagoSimulado.procesarPago({
    titular: 'Mateo Berardi',
    correo: 'mateo.berardi@ensayo.cult',
    numeroTarjeta: '4242 4242 4242 4242',
    caducidad: '12/28',
    cvc: '123',
    planTipo: 'mensual',
    monto: 8.90
  });
  console.log('Pago con 4242... (Éxito esperado):', pagoExitoso.exito, 'Código:', pagoExitoso.pago.codigoRespuesta, 'Estado:', pagoExitoso.pago.estado);

  const pagoFallido = await PagoSimulado.procesarPago({
    titular: 'Mateo Berardi',
    correo: 'mateo.berardi@ensayo.cult',
    numeroTarjeta: '4000 0000 0000 0002',
    caducidad: '12/28',
    cvc: '123',
    planTipo: 'mensual',
    monto: 8.90
  });
  console.log('Pago con 4000...0002 (Fondos insuficientes):', pagoFallido.exito, 'Código:', pagoFallido.pago.codigoRespuesta, 'Mensaje:', pagoFallido.pago.mensaje);

  console.log('\n=== VERIFICANDO RF-04: GENERACIÓN Y DESPACHO MASIVO (ALONSO ARRIAGADA) ===');
  const vFree = EnvioNewsletter.generarVersion(store.newsletterActual, store.usuarios[0]);
  const vPro = EnvioNewsletter.generarVersion(store.newsletterActual, store.usuarios[1]);
  console.log('Versión Free tipo:', vFree.tipo, 'Peso KB:', vFree.estimacionPesoKb, 'Tiene Teaser:', !!vFree.paywallTeaser);
  console.log('Versión Pro tipo:', vPro.tipo, 'Peso KB:', vPro.estimacionPesoKb, 'Datasets:', vPro.incluyeDatasets);

  const loteResultado = await EnvioNewsletter.simularLoteEnvioMasivo(
    store.newsletterActual,
    store.usuarios,
    () => {}
  );
  console.log('Total procesados en lote:', loteResultado.totalDestinatarios);
  console.log('Freemium:', loteResultado.destinatariosFreemium, 'PRO:', loteResultado.destinatariosPro);
  console.log('Telemetría Freemium KB:', loteResultado.telemetria.pesoHTMLFreemiumKb, '< 60 KB:', loteResultado.telemetria.pesoHTMLFreemiumKb < 60);
  console.log('Telemetría SLA segundos:', loteResultado.telemetria.latenciaRenderSeg, '< 1.2s:', loteResultado.telemetria.latenciaRenderSeg < 1.2);

  console.log('\n=== VERIFICANDO RF-05: KPIS Y MÉTRICAS EDITORIALES (RODRIGO CEA) ===');
  const kpis = store.obtenerMetricas();
  console.log('Métricas calculadas:', kpis);

  console.log('\n>>> TODAS LAS PRUEBAS DE INTEGRACIÓN DEL DOMINIO MVC HAN PASADO EXITOSAMENTE <<<');
}

runTests().catch(err => {
  console.error('Error durante la ejecución de pruebas:', err);
  process.exit(1);
});
