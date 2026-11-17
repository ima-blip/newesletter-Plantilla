/**
 * CONTROLADOR: ArticleController
 * Orquesta la experiencia de lectura inmersiva y la diferenciación de bloques modular.
 * Implementa RF-02 (Escenarios 2.2 y 2.3).
 */

class ArticleController {
  constructor(store) {
    this.store = store;
    this.simulatedReaderMode = null; // null = use actual user role; 'freemium' | 'pro'
  }

  obtenerEstadoLectura() {
    const usuario = this.store.usuarioActual;
    const newsletter = this.store.newsletterActual;

    // Determina el modo de renderizado (simulado o según rol de usuario)
    let esPro = false;
    if (this.simulatedReaderMode) {
      esPro = this.simulatedReaderMode === 'pro';
    } else {
      esPro = usuario && (usuario.esMecenasPro() || usuario.esAdmin());
    }

    return {
      usuario,
      newsletter,
      esPro,
      modoSimulado: this.simulatedReaderMode,
      bloques: newsletter.bloques,
      umbralPaywall: newsletter.umbralPaywall,
      estiloTransicion: newsletter.estiloTransicion,
      porcentajeBloqueado: newsletter.obtenerPorcentajeBloqueado()
    };
  }

  setReaderMode(mode) {
    this.simulatedReaderMode = mode; // 'freemium' | 'pro'
    return this.obtenerEstadoLectura();
  }

  resetReaderMode() {
    this.simulatedReaderMode = null;
    return this.obtenerEstadoLectura();
  }

  copiarEnlaceCompartir() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      return true;
    }
    return false;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ArticleController;
}
