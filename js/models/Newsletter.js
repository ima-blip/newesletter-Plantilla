/**
 * MODELO: Newsletter
 * Representa la edición monográfica o boletín modular.
 * Cumple con RF-02 y el Diagrama de Clases.
 * 
 * Atributos (Diagrama de Clases):
 * - idNewsletter: int
 * - titulo: String
 * - descripcion: String
 * - fechaCreacion: Date
 * - contiene: 1..* BloqueContenido
 * - genera: 0..* EnvioNewsletter
 * 
 * Métodos:
 * - crear()
 * - publicar()
 * - agregarBloque()
 * - modificarBloque()
 */

class Newsletter {
  constructor({
    idNewsletter = 149,
    numeroEdicion = 149,
    titulo = 'Nº 149 // Dossier: Hegemonía del Algoritmo',
    subtitulo = 'Tendencias de IA Generativa, Latencia de Inferencia & Estrategia Digital',
    descripcion = 'Las tensiones estructurales de cómputo, liquidez y mercantilización del clic frente a la resistencia del texto reposado.',
    fechaCreacion = new Date(),
    autorPrincipal = 'Carlos Domínguez (Editor Jefe)',
    estado = 'publicado', // 'borrador' | 'programado' | 'publicado'
    bloques = [],
    umbralPaywall = 'p3', // 'p3' | 'p5' | 'data'
    estiloTransicion = 'difuminado' // 'difuminado' | 'corte_seco'
  }) {
    this.idNewsletter = idNewsletter;
    this.numeroEdicion = numeroEdicion;
    this.titulo = titulo;
    this.subtitulo = subtitulo;
    this.descripcion = descripcion;
    this.fechaCreacion = fechaCreacion instanceof Date ? fechaCreacion : new Date(fechaCreacion);
    this.autorPrincipal = autorPrincipal;
    this.estado = estado;
    this.bloques = bloques.map(b => (b instanceof BloqueContenido ? b : new BloqueContenido(b)));
    this.umbralPaywall = umbralPaywall;
    this.estiloTransicion = estiloTransicion;
  }

  agregarBloque(bloque) {
    const nuevo = bloque instanceof BloqueContenido ? bloque : new BloqueContenido(bloque);
    nuevo.orden = this.bloques.length + 1;
    this.bloques.push(nuevo);
    return nuevo;
  }

  modificarBloque(idBloque, datos) {
    const bloque = this.bloques.find(b => b.idBloque === idBloque);
    if (bloque) {
      bloque.modificarBloque(datos);
    }
    return bloque;
  }

  eliminarBloque(idBloque) {
    this.bloques = this.bloques.filter(b => b.idBloque !== idBloque);
  }

  reordenarBloques(idsEnOrden) {
    const ordenados = [];
    idsEnOrden.forEach((id, idx) => {
      const b = this.bloques.find(item => item.idBloque === id);
      if (b) {
        b.orden = idx + 1;
        ordenados.push(b);
      }
    });
    this.bloques = ordenados;
  }

  publicar() {
    this.estado = 'publicado';
  }

  obtenerBloquesGratuitos() {
    return this.bloques.filter(b => !b.esPremium);
  }

  obtenerBloquesPremium() {
    return this.bloques.filter(b => b.esPremium);
  }

  obtenerPorcentajeBloqueado() {
    if (this.bloques.length === 0) return 0;
    const premium = this.obtenerBloquesPremium().length;
    return Math.round((premium / this.bloques.length) * 100);
  }

  toJSON() {
    return {
      idNewsletter: this.idNewsletter,
      numeroEdicion: this.numeroEdicion,
      titulo: this.titulo,
      subtitulo: this.subtitulo,
      descripcion: this.descripcion,
      fechaCreacion: this.fechaCreacion.toISOString(),
      autorPrincipal: this.autorPrincipal,
      estado: this.estado,
      bloques: this.bloques.map(b => b.toJSON()),
      umbralPaywall: this.umbralPaywall,
      estiloTransicion: this.estiloTransicion
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Newsletter;
}
