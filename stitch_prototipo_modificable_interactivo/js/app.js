/**
 * ARCHIVO PRINCIPAL DE APLICACIÓN: app.js
 * Inicializa la arquitectura Modelo-Vista-Controlador (MVC).
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializa el Modelo (AppStore)
  const store = window.appStore || new AppStore();

  // 2. Inicializa el Controlador Maestro (AppController) y ciclo de vida
  const app = new AppController(store);
  window.app = app;
  app.iniciar();

  console.log('Atelier Dispatch: Plataforma Editorial Modular MVC inicializada con éxito.');
});
