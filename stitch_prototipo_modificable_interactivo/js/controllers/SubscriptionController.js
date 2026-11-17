/**
 * CONTROLADOR: SubscriptionController
 * Gestiona el embudo de suscripción, pasarela de pago simulada y upgrade a Mecenas PRO.
 * Implementa RF-03 (Escenarios 3.1 y 3.2).
 */

class SubscriptionController {
  constructor(store) {
    this.store = store;
    this.isAnnual = true;
  }

  setPeriodoFacturacion(esAnual) {
    this.isAnnual = Boolean(esAnual);
    return this.obtenerPrecios();
  }

  obtenerPrecios() {
    if (this.isAnnual) {
      return {
        isAnnual: true,
        precioDisplay: '89 €',
        periodoDisplay: '/ año (ahorro equivalente a 2 meses)',
        planNombre: 'Mecenas PRO Anual (+ Anuario Impreso)',
        subtotal: '73,55 €',
        iva: '15,45 €',
        total: '89,00 €',
        montoNumerico: 89.00,
        mesesAhorro: 2
      };
    } else {
      return {
        isAnnual: false,
        precioDisplay: '9 €',
        periodoDisplay: '/ mes facturado mensualmente',
        planNombre: 'Mecenas PRO Mensual',
        subtotal: '7,44 €',
        iva: '1,56 €',
        total: '9,00 €',
        montoNumerico: 9.00,
        mesesAhorro: 0
      };
    }
  }

  /**
   * Ejecuta el checkout simulado con la pasarela (Escenario 3.1 y 3.2)
   */
  async procesarCheckout({ titular, correo, numeroTarjeta, caducidad, cvc }) {
    if (!titular || !correo || !numeroTarjeta) {
      return {
        exito: false,
        mensaje: 'Por favor completa el nombre del titular, correo y número de tarjeta.'
      };
    }

    const precios = this.obtenerPrecios();

    const resultado = await PagoSimulado.procesarPago({
      titular: titular.trim(),
      correo: correo.trim(),
      numeroTarjeta,
      caducidad,
      cvc,
      planTipo: this.isAnnual ? 'anual' : 'mensual',
      monto: precios.montoNumerico
    });

    if (resultado.exito) {
      // Escenario 3.1: Actualiza el rol del usuario a ROLE_MECENAS_PRO
      const usuarioActual = this.store.usuarioActual;
      if (usuarioActual) {
        this.store.promoverUsuarioAPro(usuarioActual.idUsuario, {
          planTipo: this.isAnnual ? 'anual' : 'mensual',
          monto: precios.montoNumerico,
          pago: resultado.pago
        });
      }

      return {
        exito: true,
        mensaje: `¡Aportación confirmada con éxito! Bienvenido como Mecenas PRO. Tus accesos y el feed RSS confidencial han sido remitidos a ${correo}.`,
        pago: resultado.pago,
        usuario: this.store.usuarioActual
      };
    } else {
      // Escenario 3.2: Rechazo por fondos insuficientes u otro motivo
      return {
        exito: false,
        codigo: resultado.codigo,
        mensaje: resultado.mensaje,
        pago: resultado.pago
      };
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SubscriptionController;
}
