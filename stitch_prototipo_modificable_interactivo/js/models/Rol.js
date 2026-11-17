/**
 * MODELO: Rol
 * Representa el rol de control de acceso basado en roles (RBAC) en Atelier Dispatch.
 * Según el Diagrama de Clases:
 * - idRol: int
 * - nombre: String
 * - codigo: String
 * - obtenerPermisos(): Array
 */

class Rol {
  constructor(idRol, nombre, codigo, permisos = []) {
    this.idRol = idRol;
    this.nombre = nombre;
    this.codigo = codigo; // ROLE_FREEMIUM, ROLE_MECENAS_PRO, ROLE_ROOT_ADMIN
    this.permisos = permisos;
  }

  obtenerPermisos() {
    return [...this.permisos];
  }

  tienePermiso(permiso) {
    return this.permisos.includes('*') || this.permisos.includes(permiso);
  }

  esPremium() {
    return this.codigo === Rol.MECENAS_PRO || this.codigo === Rol.ROOT_ADMIN;
  }

  esAdmin() {
    return this.codigo === Rol.ROOT_ADMIN;
  }

  // Constantes estáticas de roles del sistema
  static FREEMIUM = 'ROLE_FREEMIUM';
  static MECENAS_PRO = 'ROLE_MECENAS_PRO';
  static ROOT_ADMIN = 'ROLE_ROOT_ADMIN';

  static crearFreemium() {
    return new Rol(1, 'Suscriptor Freemium', Rol.FREEMIUM, [
      'leer_articulos_abiertos',
      'recibir_boletin_parcial',
      'acceso_sandbox_qa'
    ]);
  }

  static crearMecenasPro() {
    return new Rol(2, 'Mecenas PRO', Rol.MECENAS_PRO, [
      'leer_articulos_abiertos',
      'leer_articulos_pro',
      'descargar_datasets',
      'participar_agora_comentarios',
      'recibir_boletin_completo',
      'feed_rss_privado'
    ]);
  }

  static crearRootAdmin() {
    return new Rol(3, 'Administrador Editorial', Rol.ROOT_ADMIN, [
      '*',
      'gestionar_boletines',
      'crear_bloques',
      'marcar_bloques_premium',
      'configurar_paywall',
      'consultar_estadisticas',
      'auditar_usuarios',
      'enviar_boletin_masivo'
    ]);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Rol;
}
