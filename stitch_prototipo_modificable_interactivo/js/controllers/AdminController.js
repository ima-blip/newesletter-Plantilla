/**
 * CONTROLADOR: AdminController
 * Gestiona el panel de administración, analítica, directorio de suscriptores
 * y la simulación del despacho masivo segmentado.
 * Implementa RF-04, RF-05 y el Diagrama de Actividades.
 */

class AdminController {
  constructor(store) {
    this.store = store;
    this.filtroRolActivo = 'todos'; // 'todos' | 'freemium' | 'pro' | 'admin'
    this.busquedaActiva = '';
  }

  obtenerMetricas() {
    return {
      ...this.store.metricas,
      newsletterActual: this.store.newsletterActual
    };
  }

  obtenerSuscriptoresFiltrados(busqueda = '', filtroRol = 'todos') {
    this.busquedaActiva = (busqueda || '').toLowerCase().trim();
    this.filtroRolActivo = (filtroRol || 'todos').toLowerCase();

    return this.store.usuarios.filter(u => {
      // Filtro de rol
      let matchRol = true;
      if (this.filtroRolActivo === 'freemium') {
        matchRol = u.rol.codigo === Rol.FREEMIUM;
      } else if (this.filtroRolActivo === 'pro') {
        matchRol = u.rol.codigo === Rol.MECENAS_PRO;
      } else if (this.filtroRolActivo === 'admin') {
        matchRol = u.rol.codigo === Rol.ROOT_ADMIN;
      }

      // Filtro de búsqueda
      let matchBusqueda = true;
      if (this.busquedaActiva) {
        matchBusqueda = u.nombre.toLowerCase().includes(this.busquedaActiva) ||
                        u.correo.toLowerCase().includes(this.busquedaActiva);
      }

      return matchRol && matchBusqueda;
    });
  }

  obtenerTrazasAuditoriaUsuario(idUsuario) {
    const usuario = this.store.usuarios.find(u => u.idUsuario === idUsuario);
    if (!usuario) return null;

    return {
      usuario: {
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol.nombre,
        codigoRol: usuario.rol.codigo,
        estado: usuario.estado,
        openRate: usuario.openRate,
        ultimoBoletin: usuario.ultimoBoletin
      },
      trazas: usuario.trazasAuditoria
    };
  }

  obtenerPreviewEnvioDiferenciado() {
    const n = this.store.newsletterActual;
    const usuarioFreemiumMock = this.store.usuarios.find(u => u.rol.codigo === Rol.FREEMIUM);
    const usuarioProMock = this.store.usuarios.find(u => u.rol.codigo === Rol.MECENAS_PRO);

    const versionFreemium = EnvioNewsletter.generarVersion(n, usuarioFreemiumMock);
    const versionPro = EnvioNewsletter.generarVersion(n, usuarioProMock);

    return {
      newsletter: n,
      versionFreemium,
      versionPro,
      telemetria: {
        pesoHtmlFreemiumKb: versionFreemium.estimacionPesoKb, // 54 KB (RNF-01 < 60 KB)
        pesoHtmlProKb: versionPro.estimacionPesoKb,
        latenciaRenderSeg: versionFreemium.latenciaRenderSeg, // 0.84s (RNF-01 < 1.2s)
        totalDestinatarios: this.store.metricas.totalSuscriptores,
        colaFreemium: this.store.metricas.audienciaFreemium,
        colaPro: this.store.metricas.mecenasProActivos
      }
    };
  }

  /**
   * Ejecuta el proceso de envío masivo siguiendo el DIAGRAMA DE ACTIVIDADES (RF-04)
   */
  async ejecutarEnvioMasivo(onProgress) {
    const n = this.store.newsletterActual;
    const listaUsuarios = this.store.usuarios;

    const resultado = await EnvioNewsletter.simularLoteEnvioMasivo(n, listaUsuarios, onProgress);
    this.store.registrarEnvioMasivo(resultado);

    return {
      exito: true,
      resultado,
      mensaje: `Despacho masivo finalizado con éxito: ${resultado.destinatariosFreemium} ediciones Freemium y ${resultado.destinatariosPro} ediciones Mecenas PRO entregadas.`
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminController;
}
