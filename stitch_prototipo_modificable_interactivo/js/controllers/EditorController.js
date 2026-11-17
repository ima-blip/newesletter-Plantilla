/**
 * CONTROLADOR: EditorController
 * Gestiona el editor modular por bloques y la gobernanza del paywall.
 * Implementa RF-02 (Escenario 2.1) y notas de redacción del equipo.
 */

class EditorController {
  constructor(store) {
    this.store = store;
  }

  obtenerNewsletter() {
    return this.store.newsletterActual;
  }

  actualizarBloque(idBloque, datos) {
    const bloque = this.store.actualizarBloqueNewsletter(idBloque, datos);
    return {
      exito: true,
      bloque,
      mensaje: `Bloque "${bloque.titulo}" actualizado correctamente.`
    };
  }

  conmutarVisibilidadBloque(idBloque) {
    const n = this.store.newsletterActual;
    const bloque = n.bloques.find(b => b.idBloque === idBloque);
    if (!bloque) return { exito: false, mensaje: 'Bloque no encontrado' };

    const nuevoEstado = !bloque.esPremium;
    this.store.actualizarBloqueNewsletter(idBloque, { esPremium: nuevoEstado });

    return {
      exito: true,
      bloque,
      esPremium: nuevoEstado,
      mensaje: `Visibilidad de "${bloque.titulo}" fijada a: ${nuevoEstado ? 'SOLO PRO' : 'ABIERTO A TODOS'}.`
    };
  }

  agregarNuevoBloque({ titulo, subtitulo, contenido, esPremium, tipo }) {
    const n = this.store.newsletterActual;
    const nuevo = n.agregarBloque({
      titulo: titulo || 'Nuevo Bloque Editorial',
      subtitulo: subtitulo || '',
      contenido: contenido || 'Contenido del bloque...',
      esPremium: Boolean(esPremium),
      tipo: tipo || 'texto'
    });
    this.store.guardarEnStorage();
    this.store.emit('newsletter:actualizado', n);

    return {
      exito: true,
      bloque: nuevo,
      mensaje: 'Nuevo bloque modular agregado al canvas.'
    };
  }

  eliminarBloque(idBloque) {
    const n = this.store.newsletterActual;
    n.eliminarBloque(idBloque);
    this.store.guardarEnStorage();
    this.store.emit('newsletter:actualizado', n);

    return {
      exito: true,
      mensaje: 'Bloque eliminado del borrador.'
    };
  }

  configurarPaywall({ umbral, estilo }) {
    this.store.actualizarPoliticaPaywall({ umbral, estilo });
    return {
      exito: true,
      umbral,
      estilo,
      mensaje: `Política de paywall actualizada: Umbral ${umbral.toUpperCase()} con transición ${estilo.toUpperCase()}.`
    };
  }

  agregarNotaEquipo({ autor, rol, texto }) {
    if (!texto || !texto.trim()) {
      return { exito: false, mensaje: 'Por favor escribe el contenido de la nota.' };
    }
    const nota = this.store.agregarNotaEquipo({
      autor: autor || 'Rodrigo Cea',
      rol: rol || 'Editor',
      texto: texto.trim()
    });
    return {
      exito: true,
      nota,
      mensaje: 'Nota de redacción registrada en el hilo.'
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EditorController;
}
