/**
 * CONTROLADOR: SubscriptionController
 * Gestiona el embudo de suscripción, pasarela de pago simulada y upgrade a Mecenas PRO.
 * Implementa RF-03 (Escenarios 3.1 y 3.2).
 */

class SubscriptionController {
  constructor(store) {
    this.store = store;
    this.isAnnual = true;
    this.preciosConfig = { precio_mensual_clp: 8990, precio_anual_clp: 89900 };
    this.descuentosDisponibles = [];
    this.codigoAplicado = null;
  }

  async sincronizarPreciosYDescuentos() {
    if (typeof window !== 'undefined' && window.apiService) {
      const [resP, resD] = await Promise.all([
        window.apiService.obtenerPreciosConfig(),
        window.apiService.listarDescuentos()
      ]);
      if (resP && resP.exito && resP.datos) this.preciosConfig = resP.datos;
      if (resD && resD.exito && Array.isArray(resD.datos)) this.descuentosDisponibles = resD.datos;
    }
  }

  aplicarCodigoDescuento(codigo) {
    const limpio = (codigo || '').trim().toUpperCase();
    if (!limpio) {
      this.codigoAplicado = null;
      return { exito: false, mensaje: 'Ingresa un código de descuento.' };
    }
    const ahora = new Date();
    const match = this.descuentosDisponibles.find(d =>
      d.activo &&
      d.tipo === 'codigo' &&
      (d.codigo || '').toUpperCase() === limpio &&
      (!d.fecha_fin || new Date(d.fecha_fin) >= ahora)
    );
    if (!match) {
      return { exito: false, mensaje: `El código "${limpio}" no es válido o ha expirado.` };
    }
    this.codigoAplicado = match;
    return {
      exito: true,
      mensaje: `Código "${match.codigo}" aplicado: ${match.porcentaje_descuento}% de descuento.`
    };
  }

  setPeriodoFacturacion(esAnual) {
    this.isAnnual = Boolean(esAnual);
    return this.obtenerPrecios();
  }

  obtenerPrecios() {
    const baseMensual = this.preciosConfig.precio_mensual_clp || 8990;
    const baseAnual = this.preciosConfig.precio_anual_clp || 89900;
    const montoBase = this.isAnnual ? baseAnual : baseMensual;

    // Buscar descuento temporal activo o código aplicado
    const ahora = new Date();
    const descuentoTemporal = this.descuentosDisponibles.find(d =>
      d.activo &&
      d.tipo === 'temporal' &&
      (!d.fecha_inicio || new Date(d.fecha_inicio) <= ahora) &&
      (!d.fecha_fin || new Date(d.fecha_fin) >= ahora)
    );

    const descuentoActivo = this.codigoAplicado || descuentoTemporal || null;
    const porcentajeDesc = descuentoActivo ? descuentoActivo.porcentaje_descuento : 0;
    const montoFinal = Math.round(montoBase * (1 - porcentajeDesc / 100));
    const neto = Math.round(montoFinal / 1.19);
    const iva = montoFinal - neto;

    const fmt = (n) => `$${Number(n).toLocaleString('es-CL')} CLP`;

    return {
      isAnnual: this.isAnnual,
      precioAnualDisplay: fmt(baseAnual),
      precioBaseDisplay: fmt(montoBase),
      precioDisplay: fmt(montoFinal),
      periodoDisplay: this.isAnnual ? '/ año (ahorro equivalente a 2 meses)' : '/ mes facturado mensualmente',
      planNombre: this.isAnnual ? 'Mecenas PRO Anual (+ Anuario Impreso)' : 'Mecenas PRO Mensual',
      subtotal: fmt(neto),
      iva: fmt(iva),
      total: fmt(montoFinal),
      montoNumerico: montoFinal,
      porcentajeDescuento: porcentajeDesc,
      etiquetaDescuento: descuentoActivo ? `${descuentoActivo.nombre} (-${porcentajeDesc}%)` : null,
      codigoAplicado: this.codigoAplicado ? this.codigoAplicado.codigo : '',
      mesesAhorro: this.isAnnual ? 2 : 0
    };
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
