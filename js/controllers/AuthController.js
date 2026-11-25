/**
 * CONTROLADOR: AuthController
 * Gestiona el registro de usuarios, autenticación y conmutación de roles QA.
 * Implementa RF-01, RNF-03 y Escenarios 1.1, 1.2 y 1.3 de Gherkin.
 */

class AuthController {
  constructor(store) {
    this.store = store;
  }

  /**
   * Procesa el formulario de registro (RF-01, Escenario 1.1 y 1.2)
   */
  handleRegistro(formData) {
    const { nombre, correo, password, passwordConfirm, aceptaTerminos } = formData;

    // Validación de coincidencia de contraseñas (Escenario 1.2)
    if (password !== passwordConfirm) {
      return {
        exito: false,
        campoError: 'passwordConfirm',
        mensaje: 'Las contraseñas ingresadas no coinciden. Por favor verifíquelas.'
      };
    }

    if (password.length < 8) {
      return {
        exito: false,
        campoError: 'password',
        mensaje: 'La contraseña debe contener al menos 8 caracteres alfanuméricos.'
      };
    }

    if (!aceptaTerminos) {
      return {
        exito: false,
        campoError: 'terminos',
        mensaje: 'Debes aceptar el Manifiesto Editorial y la Política de Cero Rastreadores.'
      };
    }

    try {
      const nuevoUsuario = this.store.registrarUsuario({
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        password
      });

      return {
        exito: true,
        usuario: nuevoUsuario,
        mensaje: 'Cuenta activada con rol Freemium. ¡Bienvenido a Atelier Dispatch!'
      };
    } catch (err) {
      return {
        exito: false,
        mensaje: err.message
      };
    }
  }

  /**
   * Procesa el inicio de sesión
   */
  handleLogin({ correo, password }) {
    if (!correo || !password) {
      return {
        exito: false,
        mensaje: 'Por favor completa tu correo y contraseña.'
      };
    }

    try {
      const usuario = this.store.iniciarSesion({
        correo: correo.trim().toLowerCase(),
        password
      });

      return {
        exito: true,
        usuario,
        mensaje: `Bienvenido de nuevo, ${usuario.nombre}. Sesión activa con rol: ${usuario.rol.nombre}.`
      };
    } catch (err) {
      return {
        exito: false,
        mensaje: err.message
      };
    }
  }

  handleLogout() {
    this.store.cerrarSesion();
    return {
      exito: true,
      mensaje: 'Sesión cerrada correctamente.'
    };
  }

  /**
   * Inicia sesión instantánea con perfiles preconfigurados del Sandbox QA (Escenario 1.3)
   */
  handleQALogin(codigoRol) {
    if (!this.store.esSandboxActivo()) {
      return {
        exito: false,
        usuario: this.store.usuarioActual,
        mensaje: 'El modo Sandbox solo está disponible para la cuenta de administrador autorizada.'
      };
    }
    const usuario = this.store.conmutarRolQA(codigoRol);
    const nombre = usuario ? usuario.nombre : 'Visitante Anónimo';
    const rolNombre = usuario ? usuario.rol.nombre : 'Sin sesión';
    return {
      exito: true,
      usuario,
      mensaje: `Sandbox QA: Sesión conmutada a ${nombre} (${rolNombre}).`
    };
  }

  evaluarPassword(password) {
    return Usuario.evaluarSeguridadContrasena(password);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthController;
}
