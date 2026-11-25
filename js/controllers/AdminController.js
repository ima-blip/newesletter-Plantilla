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
    this.audienciasRemotas = null; // Datos obtenidos desde MySQL vía Django
    this.metaPremium = store.metricas.metaSuscripcionesPremium || 500;
    this.preciosConfig = { precio_mensual_clp: 8990, precio_anual_clp: 89900 };
    this.descuentos = [];
  }

  async cargarPreciosYDescuentos() {
    if (typeof window !== 'undefined' && window.apiService) {
      const [resP, resD] = await Promise.all([
        window.apiService.obtenerPreciosConfig(),
        window.apiService.listarDescuentos()
      ]);
      if (resP && resP.exito && resP.datos) this.preciosConfig = resP.datos;
      if (resD && resD.exito && Array.isArray(resD.datos)) this.descuentos = resD.datos;
    }
    return { precios: this.preciosConfig, descuentos: this.descuentos };
  }

  async guardarPrecios(mensual, anual) {
    if (typeof window !== 'undefined' && window.apiService) {
      const res = await window.apiService.actualizarPreciosConfig(mensual, anual);
      if (res && res.exito && res.datos) {
        this.preciosConfig = res.datos;
      }
      return res;
    }
    return { exito: false, mensaje: 'Servicio API no disponible.' };
  }

  async crearDescuento(datos) {
    if (typeof window !== 'undefined' && window.apiService) {
      return await window.apiService.crearDescuento(datos);
    }
    return { exito: false, mensaje: 'Servicio API no disponible.' };
  }

  async toggleDescuento(id) {
    if (typeof window !== 'undefined' && window.apiService) {
      return await window.apiService.toggleDescuento(id);
    }
    return { exito: false, mensaje: 'Servicio API no disponible.' };
  }

  async eliminarDescuento(id) {
    if (typeof window !== 'undefined' && window.apiService) {
      return await window.apiService.eliminarDescuento(id);
    }
    return { exito: false, mensaje: 'Servicio API no disponible.' };
  }

  async cargarAudienciasDesdeBD() {
    if (typeof window !== 'undefined' && window.apiService) {
      const res = await window.apiService.obtenerAudiencias();
      if (res && res.exito && res.datos) {
        this.audienciasRemotas = res.datos;
        if (res.datos.metricas && res.datos.metricas.metaSuscripcionesPremium) {
          this.metaPremium = res.datos.metricas.metaSuscripcionesPremium;
        }
        return this.audienciasRemotas;
      }
    }
    this.audienciasRemotas = null;
    return null;
  }

  async cargarMetaPremium() {
    if (typeof window !== 'undefined' && window.apiService) {
      const res = await window.apiService.obtenerMetaPremium();
      if (res && res.exito && res.datos) {
        this.metaPremium = res.datos.meta_suscripciones_premium || 500;
        this.store.metricas.metaSuscripcionesPremium = this.metaPremium;
      }
    }
    return this.metaPremium;
  }

  async guardarMetaPremium(nuevaMeta) {
    if (typeof window !== 'undefined' && window.apiService) {
      const res = await window.apiService.actualizarMetaPremium(nuevaMeta);
      if (res && res.exito) {
        this.metaPremium = res.datos.meta_suscripciones_premium;
        this.store.metricas.metaSuscripcionesPremium = this.metaPremium;
        this.store.guardarEnStorage();
      }
      return res;
    }
    return { exito: false, mensaje: 'Servicio API no disponible.' };
  }

  obtenerMetricas() {
    if (this.audienciasRemotas && this.audienciasRemotas.metricas) {
      return {
        ...this.audienciasRemotas.metricas,
        metaSuscripcionesPremium: this.metaPremium,
        newsletterActual: this.store.newsletterActual
      };
    }
    return {
      ...this.store.metricas,
      metaSuscripcionesPremium: this.metaPremium,
      origenDatos: 'LocalStorage (Offline)',
      newsletterActual: this.store.newsletterActual
    };
  }

  obtenerSuscriptoresFiltrados(busqueda = '', filtroRol = 'todos') {
    this.busquedaActiva = (busqueda || '').toLowerCase().trim();
    this.filtroRolActivo = (filtroRol || 'todos').toLowerCase();

    const fuente = (this.audienciasRemotas && Array.isArray(this.audienciasRemotas.suscriptores))
      ? this.audienciasRemotas.suscriptores.map(u => ({
          idUsuario: u.id_usuario,
          nombre: u.nombre,
          correo: u.correo,
          estado: u.estado,
          openRate: u.open_rate,
          ultimoBoletin: u.ultimo_boletin,
          trazasAuditoria: u.trazasAuditoria || [],
          rol: {
            codigo: u.rol_codigo || 'ROLE_FREEMIUM',
            nombre: u.rol_nombre || 'Suscriptor Freemium'
          }
        }))
      : this.store.usuarios;

    return fuente.filter(u => {
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
    const fuente = (this.audienciasRemotas && Array.isArray(this.audienciasRemotas.suscriptores))
      ? this.audienciasRemotas.suscriptores.map(u => ({
          idUsuario: u.id_usuario,
          nombre: u.nombre,
          correo: u.correo,
          estado: u.estado,
          openRate: u.open_rate,
          ultimoBoletin: u.ultimo_boletin,
          trazasAuditoria: u.trazasAuditoria || [],
          rol: {
            codigo: u.rol_codigo || 'ROLE_FREEMIUM',
            nombre: u.rol_nombre || 'Suscriptor Freemium'
          }
        }))
      : this.store.usuarios;

    const usuario = fuente.find(u => u.idUsuario === idUsuario);
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
