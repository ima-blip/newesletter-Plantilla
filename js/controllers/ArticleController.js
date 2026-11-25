/**
 * CONTROLADOR: ArticleController
 * Orquesta la experiencia de lectura inmersiva y la diferenciación de bloques modular.
 * Implementa RF-02 (Escenarios 2.2 y 2.3).
 */

class ArticleController {
  constructor(store) {
    this.store = store;
    this.simulatedReaderMode = null; // null = use actual user role; 'freemium' | 'pro'
    this.ultimaNoticiaPublicada = null;
    this._noticiaEspecifica = false;
  }

  async abrirNoticia(idNoticia) {
    if (typeof window !== 'undefined' && window.apiService) {
      try {
        const res = await window.apiService.obtenerNoticia(idNoticia);
        if (res && res.exito && res.datos) {
          this.ultimaNoticiaPublicada = res.datos;
          this._noticiaEspecifica = true;
        }
      } catch (e) {}
    }
    if (window.app) {
      window.app.navegarA('noticia');
    }
  }

  async cargarUltimaNoticiaPublicada() {
    if (this._noticiaEspecifica && this.ultimaNoticiaPublicada) {
      this._noticiaEspecifica = false;
      return this.ultimaNoticiaPublicada;
    }
    if (typeof window !== 'undefined' && window.apiService) {
      try {
        const res = await window.apiService.obtenerUltimaNoticiaPublicada();
        if (res && res.exito && res.datos) {
          this.ultimaNoticiaPublicada = res.datos;
          return this.ultimaNoticiaPublicada;
        }
      } catch (e) {}
    }
    this.ultimaNoticiaPublicada = null;
    return null;
  }

  obtenerEstadoLectura() {
    const usuario = this.store.usuarioActual;
    const newsletter = this.store.newsletterActual;

    const esSandbox = this.store.esSandboxActivo();

    // Determina el modo de renderizado (simulado solo en Sandbox, o según rol real de usuario)
    let esPro = false;
    if (esSandbox && this.simulatedReaderMode) {
      esPro = this.simulatedReaderMode === 'pro';
    } else {
      esPro = usuario && (usuario.esMecenasPro() || usuario.esAdmin());
    }

    return {
      usuario,
      newsletter,
      ultimaNoticia: this.ultimaNoticiaPublicada,
      esPro,
      esSandbox,
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
