/**
 * MODELO: BloqueContenido
 * Representa cada bloque modular dentro de un newsletter o artículo editorial.
 * Cumple con RF-02 (Diferenciación de Módulos de Contenido).
 * 
 * Atributos (Diagrama de Clases):
 * - idBloque: int
 * - titulo: String
 * - contenido: Text
 * - esPremium: Boolean
 * 
 * Métodos:
 * - crearBloque()
 * - modificarBloque()
 * - esVisiblePara(usuario)
 */

class BloqueContenido {
  constructor({
    idBloque = Date.now(),
    titulo = '',
    subtitulo = '',
    contenido = '',
    esPremium = false,
    tipo = 'texto', // 'introduccion', 'texto', 'cita', 'analisis_cuantitativo', 'descarga', 'entrevista'
    orden = 1,
    parrafos = [],
    recursosAdjuntos = []
  }) {
    this.idBloque = idBloque;
    this.titulo = titulo;
    this.subtitulo = subtitulo;
    this.contenido = contenido;
    this.esPremium = Boolean(esPremium);
    this.tipo = tipo;
    this.orden = orden;
    this.parrafos = parrafos.length ? parrafos : (contenido ? contenido.split('\n\n') : []);
    this.recursosAdjuntos = recursosAdjuntos; // { nombre, tamano, url, tipo }
  }

  modificarBloque({ titulo, subtitulo, contenido, esPremium, tipo, parrafos, recursosAdjuntos }) {
    if (titulo !== undefined) this.titulo = titulo;
    if (subtitulo !== undefined) this.subtitulo = subtitulo;
    if (contenido !== undefined) {
      this.contenido = contenido;
      this.parrafos = contenido.split('\n\n');
    }
    if (esPremium !== undefined) this.esPremium = Boolean(esPremium);
    if (tipo !== undefined) this.tipo = tipo;
    if (parrafos !== undefined) this.parrafos = parrafos;
    if (recursosAdjuntos !== undefined) this.recursosAdjuntos = recursosAdjuntos;
  }

  /**
   * Determina si el bloque es completamente visible para el usuario o rol dado
   */
  esVisiblePara(usuarioORol) {
    if (!this.esPremium) return true;
    if (!usuarioORol) return false;
    if (typeof usuarioORol.esPremium === 'function') {
      return usuarioORol.esPremium();
    }
    if (typeof usuarioORol.esMecenasPro === 'function') {
      return usuarioORol.esMecenasPro() || (usuarioORol.esAdmin && usuarioORol.esAdmin());
    }
    if (usuarioORol.rol && typeof usuarioORol.rol.esPremium === 'function') {
      return usuarioORol.rol.esPremium();
    }
    return false;
  }

  toJSON() {
    return {
      idBloque: this.idBloque,
      titulo: this.titulo,
      subtitulo: this.subtitulo,
      contenido: this.contenido,
      esPremium: this.esPremium,
      tipo: this.tipo,
      orden: this.orden,
      parrafos: this.parrafos,
      recursosAdjuntos: this.recursosAdjuntos
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BloqueContenido;
}
