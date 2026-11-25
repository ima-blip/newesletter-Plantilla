/**
 * CONTROLADOR: NoticiasController
 * Gestiona el CRUD de noticias: crear, editar, publicar, archivar y eliminar.
 * Conecta con el ApiService que se comunica con el backend MySQL.
 */

class NoticiasController {
  constructor(store) {
    this.store = store;
    this.filtroEstado = 'todos'; // 'todos' | 'borrador' | 'publicado' | 'archivado'
    this.busqueda = '';
    this.noticiaEditando = null; // noticia en edición activa
  }

  /**
   * Obtener todas las noticias con filtros aplicados
   */
  async listarNoticias() {
    const filtros = {};
    if (this.filtroEstado && this.filtroEstado !== 'todos') {
      filtros.estado = this.filtroEstado;
    }
    if (this.busqueda) {
      filtros.busqueda = this.busqueda;
    }

    try {
      const resultado = await window.apiService.listarNoticias(filtros);
      return resultado;
    } catch (error) {
      return { exito: false, datos: [], mensaje: error.message };
    }
  }

  /**
   * Crear una nueva noticia
   */
  async crearNoticia(datos) {
    if (!datos.titulo || !datos.titulo.trim()) {
      return { exito: false, mensaje: 'El título de la noticia es obligatorio.' };
    }
    if (!datos.contenido || !datos.contenido.trim()) {
      return { exito: false, mensaje: 'El contenido de la noticia es obligatorio.' };
    }

    // Asignar el autor actual si está en sesión
    const usuario = this.store.usuarioActual;
    if (usuario) {
      datos.autor_id = usuario.idUsuario;
      datos.autor_nombre = usuario.nombre;
    }

    try {
      const resultado = await window.apiService.crearNoticia(datos);
      if (resultado.exito) {
        this.store.emit('noticias:actualizado', resultado.datos);
      }
      return resultado;
    } catch (error) {
      return { exito: false, mensaje: error.message };
    }
  }

  /**
   * Actualizar noticia existente
   */
  async actualizarNoticia(id, datos) {
    try {
      const resultado = await window.apiService.actualizarNoticia(id, datos);
      if (resultado.exito) {
        this.store.emit('noticias:actualizado', resultado.datos);
      }
      return resultado;
    } catch (error) {
      return { exito: false, mensaje: error.message };
    }
  }

  /**
   * Publicar una noticia (cambiar estado de borrador a publicado)
   */
  async publicarNoticia(id) {
    try {
      const resultado = await window.apiService.publicarNoticia(id);
      if (resultado.exito) {
        this.store.emit('noticias:actualizado', resultado.datos);
      }
      return resultado;
    } catch (error) {
      return { exito: false, mensaje: error.message };
    }
  }

  /**
   * Archivar una noticia
   */
  async archivarNoticia(id) {
    try {
      const resultado = await window.apiService.archivarNoticia(id);
      if (resultado.exito) {
        this.store.emit('noticias:actualizado', null);
      }
      return resultado;
    } catch (error) {
      return { exito: false, mensaje: error.message };
    }
  }

  /**
   * Eliminar una noticia permanentemente
   */
  async eliminarNoticia(id) {
    try {
      const resultado = await window.apiService.eliminarNoticia(id);
      if (resultado.exito) {
        this.store.emit('noticias:actualizado', null);
      }
      return resultado;
    } catch (error) {
      return { exito: false, mensaje: error.message };
    }
  }

  /**
   * Obtener estadísticas de noticias
   */
  async obtenerEstadisticas() {
    try {
      return await window.apiService.obtenerEstadisticas();
    } catch (error) {
      return { exito: false, datos: null, mensaje: error.message };
    }
  }

  /**
   * Preparar noticia para edición
   */
  setNoticiaEditando(noticia) {
    this.noticiaEditando = noticia ? { ...noticia } : null;
  }

  /**
   * Limpiar formulario
   */
  limpiarFormulario() {
    this.noticiaEditando = null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NoticiasController;
}
