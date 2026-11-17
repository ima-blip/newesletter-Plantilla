/**
 * MODELO: PagoSimulado
 * Simulación de pasarela de pago para actualización a Mecenas PRO.
 * Cumple con RF-03 (Simulación de Upgrade y Pasarela de Pago) y Escenarios 3.1 / 3.2.
 * 
 * Atributos (Diagrama de Clases):
 * - idPago: int
 * - monto: Decimal
 * - fecha: Date
 * - estado: String
 * 
 * Métodos:
 * - procesarPago()
 * - confirmarPago()
 */

class PagoSimulado {
  constructor({
    idPago = Date.now(),
    idSuscripcion = null,
    idUsuario = null,
    monto = 89.00,
    moneda = 'EUR',
    fecha = new Date(),
    estado = 'Exitoso', // 'Exitoso' | 'Declinado'
    codigoRespuesta = 200,
    codigoError = null,
    mensaje = 'Transacción aprobada',
    tarjetaEnmascarada = '4242 •••• •••• 4242',
    titular = ''
  }) {
    this.idPago = idPago;
    this.idSuscripcion = idSuscripcion;
    this.idUsuario = idUsuario;
    this.monto = Number(monto);
    this.moneda = moneda;
    this.fecha = fecha instanceof Date ? fecha : new Date(fecha);
    this.estado = estado;
    this.codigoRespuesta = codigoRespuesta;
    this.codigoError = codigoError;
    this.mensaje = mensaje;
    this.tarjetaEnmascarada = tarjetaEnmascarada;
    this.titular = titular;
  }

  /**
   * Procesa el pago de forma asíncrona simulando una llamada a pasarela (Stripe Sandbox)
   * SLA de respuesta: < 500 ms (cumpliendo RF-03 Escenario 3.1)
   */
  static procesarPago({
    titular,
    correo,
    numeroTarjeta,
    caducidad,
    cvc,
    planTipo,
    monto
  }) {
    return new Promise((resolve) => {
      const limpio = (numeroTarjeta || '').replace(/\s+/g, '');

      // Simulación de latencia de red bancaria (350ms - 450ms, < 500ms SLA)
      const latencia = Math.floor(Math.random() * 100) + 350;

      setTimeout(() => {
        // Escenario 3.2: Tarjeta declinada por fondos insuficientes
        if (limpio.endsWith('0002') || limpio.includes('4000000000000002') || correo.includes('fondos.insuficientes')) {
          const pagoDeclinado = new PagoSimulado({
            monto,
            estado: 'Declinado',
            codigoRespuesta: 402,
            codigoError: 'insufficient_funds',
            mensaje: 'La transacción fue declinada por fondos insuficientes en la tarjeta simulada. Por favor utiliza una tarjeta de prueba válida.',
            tarjetaEnmascarada: '4000 •••• •••• 0002',
            titular
          });
          resolve({
            exito: false,
            pago: pagoDeclinado,
            mensaje: pagoDeclinado.mensaje,
            codigo: 402
          });
        } 
        // Escenario 3.1: Pago exitoso
        else {
          const last4 = limpio.slice(-4) || '4242';
          const pagoExitoso = new PagoSimulado({
            monto,
            estado: 'Exitoso',
            codigoRespuesta: 200,
            codigoError: null,
            mensaje: '¡Aportación confirmada con éxito! Eres Mecenas PRO.',
            tarjetaEnmascarada: `•••• •••• •••• ${last4}`,
            titular
          });
          resolve({
            exito: true,
            pago: pagoExitoso,
            mensaje: pagoExitoso.mensaje,
            codigo: 200
          });
        }
      }, latencia);
    });
  }

  toJSON() {
    return {
      idPago: this.idPago,
      idSuscripcion: this.idSuscripcion,
      idUsuario: this.idUsuario,
      monto: this.monto,
      moneda: this.moneda,
      fecha: this.fecha.toISOString(),
      estado: this.estado,
      codigoRespuesta: this.codigoRespuesta,
      codigoError: this.codigoError,
      mensaje: this.mensaje,
      tarjetaEnmascarada: this.tarjetaEnmascarada,
      titular: this.titular
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PagoSimulado;
}
