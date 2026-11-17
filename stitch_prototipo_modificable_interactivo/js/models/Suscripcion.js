/**
 * MODELO: Suscripcion
 * Representa la membresía del usuario en Atelier Dispatch.
 * Cumple con RF-03 y el Diagrama de Clases.
 * 
 * Atributos (Diagrama de Clases):
 * - idSuscripcion: int
 * - tipo: String ('Mensual' | 'Anual')
 * - estado: String ('Activa' | 'Cancelada')
 * - fechaInicio: Date
 * 
 * Métodos:
 * - actualizarPlan()
 * - verificarAcceso()
 */

class Suscripcion {
  constructor({
    idSuscripcion = Date.now(),
    idUsuario = null,
    tipo = 'Anual', // 'Mensual' | 'Anual'
    estado = 'Activa',
    fechaInicio = new Date(),
    fechaRenovacion = null,
    monto = 89.00,
    moneda = 'EUR',
    pagos = []
  }) {
    this.idSuscripcion = idSuscripcion;
    this.idUsuario = idUsuario;
    this.tipo = tipo;
    this.estado = estado;
    this.fechaInicio = fechaInicio instanceof Date ? fechaInicio : new Date(fechaInicio);
    this.monto = Number(monto);
    this.moneda = moneda;
    this.pagos = pagos;

    if (!fechaRenovacion) {
      const nextDate = new Date(this.fechaInicio);
      if (tipo === 'Anual') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      this.fechaRenovacion = nextDate;
    } else {
      this.fechaRenovacion = fechaRenovacion instanceof Date ? fechaRenovacion : new Date(fechaRenovacion);
    }
  }

  actualizarPlan(nuevoTipo, nuevoMonto) {
    this.tipo = nuevoTipo;
    this.monto = Number(nuevoMonto);
    const nextDate = new Date();
    if (nuevoTipo === 'Anual') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    this.fechaRenovacion = nextDate;
    this.estado = 'Activa';
  }

  verificarAcceso() {
    return this.estado === 'Activa' && new Date() <= this.fechaRenovacion;
  }

  cancelar() {
    this.estado = 'Cancelada';
  }

  toJSON() {
    return {
      idSuscripcion: this.idSuscripcion,
      idUsuario: this.idUsuario,
      tipo: this.tipo,
      estado: this.estado,
      fechaInicio: this.fechaInicio.toISOString(),
      fechaRenovacion: this.fechaRenovacion.toISOString(),
      monto: this.monto,
      moneda: this.moneda,
      pagos: this.pagos
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Suscripcion;
}
