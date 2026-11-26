/**
 * SERVICIO: ApiService
 * Capa de abstracción para comunicación con el backend REST API + MySQL.
 * Se encarga de las operaciones CRUD de noticias y la conexión con el servidor.
 * Si el servidor no está disponible, opera en modo offline (localStorage).
 */

class ApiService {
  constructor(baseUrl = 'http://localhost:8000/api') {
    this.baseUrl = baseUrl;
    this.modoOffline = false;
    this.storageKeyNoticias = 'atelier_dispatch_noticias_offline_v1';
    this.storageKeyMeta = 'atelier_dispatch_meta_premium_v1';
    this.storageKeyPrecios = 'atelier_dispatch_precios_v1';
    this.storageKeyDescuentos = 'atelier_dispatch_descuentos_v1';
    this.verificarConexion();
  }

  // ─── VERIFICACIÓN DE CONEXIÓN ───────────────────────────────────────────────

  async verificarConexion() {
    try {
      const response = await fetch(`${this.baseUrl}/status`, { method: 'GET' });
      if (response.ok) {
        this.modoOffline = false;
        console.log('🟢 ApiService: Conectado al servidor backend (MySQL activo).');
        return true;
      }
    } catch (e) {
      // Servidor no disponible
    }
    this.modoOffline = true;
    console.warn('🟡 ApiService: Servidor no disponible. Operando en modo offline (localStorage).');
    return false;
  }

  // ─── HELPERS ────────────────────────────────────────────────────────────────

  async _fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: { 'Content-Type': 'application/json' },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.mensaje || `Error ${response.status}`);
      }
      return data;
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        this.modoOffline = true;
        throw new Error('Servidor no disponible. Operando en modo offline.');
      }
      throw error;
    }
  }

  // ─── ALMACENAMIENTO OFFLINE (localStorage) ──────────────────────────────────

  _getNoticiasOffline() {
    try {
      const data = localStorage.getItem(this.storageKeyNoticias);
      if (data) return JSON.parse(data);
    } catch (e) {}

    // Semillas iniciales (fechas escalonadas para garantizar orden consistente)
    const ahora = Date.now();
    const semillas = [
      {
        id_noticia: 1,
        titulo: 'La economía de la atención y el retorno al texto',
        subtitulo: 'Tendencias de IA Generativa & Estrategia Digital',
        contenido: 'Hemos aceptado con una docilidad alarmante que el pensamiento debe sincronizarse con los impulsos nerviosos de un feed algorítmico. Durante la última década, las interfaces no han sido diseñadas para expandir la comprensión del sujeto contemporáneo, sino para drenar metódicamente su capacidad de sostener una sola idea compleja durante más de cuatro minutos seguidos.\n\nEl diseño de la persuasión —heredero bastardo del conductismo skinneriano y afinado en los laboratorios de Silicon Valley— no busca informar ni suscitar deleite intelectual; su único vector de optimización es la permanencia desasosegada.',
        extracto: 'Las tensiones estructurales de cómputo, liquidez y mercantilización del clic frente a la resistencia del texto reposado.',
        imagen_url: '',
        categoria: 'Crítica Cultural',
        es_premium: false,
        estado: 'publicado',
        autor_id: 3,
        autor_nombre: 'Carlos Domínguez',
        fecha_publicacion: new Date(ahora - 7200000).toISOString(),
        created_at: new Date(ahora - 7200000).toISOString()
      },
      {
        id_noticia: 2,
        titulo: 'El coste computacional real de los modelos fundacionales',
        subtitulo: 'Desglose técnico de clusters de GPU e inferencia',
        contenido: 'Hemos aceptado con una docilidad alarmante que la escala bruta de parámetros resolvería por sí sola los límites semánticos de la comprensión máquina. Sin embargo, los balances operativos de los últimos trimestres revelan una fractura silenciosa en la economía unitaria de los modelos fundacionales.\n\nEl diseño de la persuasión tecnológica suele ocultar la factura energética y de memoria que exige sostener una ventana de contexto masiva en producción. Cada consulta encadenada multiplica la latencia de cola y presiona los márgenes de infraestructura.\n\nEn contraposición, las arquitecturas modulares y los sistemas híbridos demuestran que una audiencia técnica crítica exige transparencia sobre latencia, costo marginal por mil tokens y sostenibilidad real de cómputo.\n\nEn los datos internos del informe de audiencia de septiembre (Cuadro 4.2), se percibe una correlación directa entre la adopción de modelos especializados de mezcla de expertos (MoE) y la reducción del 67% en latencia de inferencia frente a transformers densos de 70B parámetros.\n\nLa desintermediación algorítmica exige un pacto directo de mecenazgo cultural y técnico: solo una comunidad de suscriptores independiente puede financiar auditorías reproducibles sin compromisos con proveedores de nube.',
        extracto: 'Un desglose pormenorizado del gasto en clusters de aceleración.',
        imagen_url: '',
        categoria: 'Análisis Técnico',
        es_premium: true,
        estado: 'publicado',
        autor_id: 3,
        autor_nombre: 'Carlos Domínguez',
        fecha_publicacion: new Date(ahora - 3600000).toISOString(),
        created_at: new Date(ahora - 3600000).toISOString()
      },
      {
        id_noticia: 3,
        titulo: 'Toolkit de Auditoría de Modelos v2.4: Inferencia y Latencia PRO',
        subtitulo: 'Material confidencial y benchmarks reproducibles para miembros mecenas',
        contenido: 'Durante los últimos seis meses hemos auditado más de 45 millones de tokens ejecutados sobre clusters heterogéneos para medir con precisión el costo marginal real de la inferencia en producción.\n\nA diferencia de los reportes comerciales optimizados para presentaciones corporativas, este dossier expone las curvas reales de degradación de latencia bajo concurrencia sostenida y el impacto financiero del ancho de banda de memoria HBM.\n\nLos resultados desmienten la premisa de la economía de escala ilimitada: superado el umbral de los 70 mil millones de parámetros activos, el rendimiento por dólar invertido cae de forma pronunciada en cargas conversacionales.\n\nEn la sección confidencial para Mecenas PRO incluimos el script de benchmark reproducible en PyTorch, el cuaderno de Jupyter con los pesos crudos y la matriz SQLite completa para validar cada métrica en tu propio entorno.\n\nAdemás, adjuntamos el análisis comparativo por proveedor y las recomendaciones de cuantización INT4/FP8 sin pérdida perceptible de precisión semántica.',
        extracto: 'Scripts, notebooks y datasets descargables para mecenas PRO.',
        imagen_url: '',
        categoria: 'Recursos PRO',
        es_premium: true,
        estado: 'publicado',
        autor_id: 3,
        autor_nombre: 'Carlos Domínguez',
        fecha_publicacion: new Date(ahora).toISOString(),
        created_at: new Date(ahora).toISOString()
      }
    ];
    this._saveNoticiasOffline(semillas);
    return semillas;
  }

  _saveNoticiasOffline(noticias) {
    try {
      localStorage.setItem(this.storageKeyNoticias, JSON.stringify(noticias));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage:', e);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CRUD DE NOTICIAS
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── LISTAR NOTICIAS ────────────────────────────────────────────────────────

  async listarNoticias(filtros = {}) {
    if (this.modoOffline) {
      let noticias = this._getNoticiasOffline();
      if (filtros.estado) noticias = noticias.filter(n => n.estado === filtros.estado);
      if (filtros.busqueda) {
        const term = filtros.busqueda.toLowerCase();
        noticias = noticias.filter(n =>
          n.titulo.toLowerCase().includes(term) ||
          n.contenido.toLowerCase().includes(term)
        );
      }
      return { exito: true, datos: noticias, paginacion: { total: noticias.length } };
    }

    let query = '';
    if (filtros.estado) query += `estado=${filtros.estado}&`;
    if (filtros.busqueda) query += `busqueda=${encodeURIComponent(filtros.busqueda)}&`;
    if (filtros.categoria) query += `categoria=${encodeURIComponent(filtros.categoria)}&`;
    return this._fetch(`/noticias?${query}`);
  }

  // ─── OBTENER UNA NOTICIA ────────────────────────────────────────────────────

  async obtenerNoticia(id) {
    if (this.modoOffline) {
      const noticias = this._getNoticiasOffline();
      const noticia = noticias.find(n => n.id_noticia === id);
      return noticia
        ? { exito: true, datos: noticia }
        : { exito: false, mensaje: 'Noticia no encontrada.' };
    }
    return this._fetch(`/noticias/${id}`);
  }

  // ─── CREAR NOTICIA ──────────────────────────────────────────────────────────

  async crearNoticia(datos) {
    if (this.modoOffline) {
      const noticias = this._getNoticiasOffline();
      const nueva = {
        id_noticia: Date.now(),
        titulo: datos.titulo || '',
        subtitulo: datos.subtitulo || '',
        contenido: datos.contenido || '',
        extracto: datos.extracto || '',
        imagen_url: datos.imagen_url || '',
        categoria: datos.categoria || 'General',
        es_premium: Boolean(datos.es_premium),
        estado: datos.estado || 'borrador',
        autor_id: datos.autor_id || null,
        autor_nombre: datos.autor_nombre || '',
        fecha_publicacion: datos.estado === 'publicado' ? new Date().toISOString() : null,
        created_at: new Date().toISOString()
      };
      noticias.unshift(nueva);
      this._saveNoticiasOffline(noticias);
      return { exito: true, mensaje: `Noticia "${nueva.titulo}" creada con éxito.`, datos: nueva };
    }

    return this._fetch('/noticias', {
      method: 'POST',
      body: JSON.stringify(datos)
    });
  }

  // ─── ACTUALIZAR NOTICIA ─────────────────────────────────────────────────────

  async actualizarNoticia(id, datos) {
    if (this.modoOffline) {
      const noticias = this._getNoticiasOffline();
      const idx = noticias.findIndex(n => n.id_noticia === id);
      if (idx === -1) return { exito: false, mensaje: 'Noticia no encontrada.' };

      Object.assign(noticias[idx], datos);
      if (datos.estado === 'publicado' && !noticias[idx].fecha_publicacion) {
        noticias[idx].fecha_publicacion = new Date().toISOString();
      }
      this._saveNoticiasOffline(noticias);
      return { exito: true, mensaje: `Noticia #${id} actualizada.`, datos: noticias[idx] };
    }

    return this._fetch(`/noticias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos)
    });
  }

  // ─── PUBLICAR NOTICIA ───────────────────────────────────────────────────────

  async publicarNoticia(id) {
    if (this.modoOffline) {
      const noticias = this._getNoticiasOffline();
      const idx = noticias.findIndex(n => n.id_noticia === id);
      if (idx === -1) return { exito: false, mensaje: 'Noticia no encontrada.' };
      noticias[idx].estado = 'publicado';
      noticias[idx].fecha_publicacion = new Date().toISOString();
      this._saveNoticiasOffline(noticias);
      return { exito: true, mensaje: `Noticia publicada con éxito.`, datos: noticias[idx] };
    }

    return this._fetch(`/noticias/${id}/publicar`, { method: 'PATCH' });
  }

  // ─── ARCHIVAR NOTICIA ───────────────────────────────────────────────────────

  async archivarNoticia(id) {
    if (this.modoOffline) {
      const noticias = this._getNoticiasOffline();
      const idx = noticias.findIndex(n => n.id_noticia === id);
      if (idx === -1) return { exito: false, mensaje: 'Noticia no encontrada.' };
      noticias[idx].estado = 'archivado';
      this._saveNoticiasOffline(noticias);
      return { exito: true, mensaje: 'Noticia archivada.' };
    }

    return this._fetch(`/noticias/${id}/archivar`, { method: 'PATCH' });
  }

  // ─── ELIMINAR NOTICIA ───────────────────────────────────────────────────────

  async eliminarNoticia(id) {
    if (this.modoOffline) {
      let noticias = this._getNoticiasOffline();
      noticias = noticias.filter(n => n.id_noticia !== id);
      this._saveNoticiasOffline(noticias);
      return { exito: true, mensaje: 'Noticia eliminada permanentemente.' };
    }

    return this._fetch(`/noticias/${id}`, { method: 'DELETE' });
  }

  // ─── ESTADÍSTICAS ───────────────────────────────────────────────────────────

  async obtenerEstadisticas() {
    if (this.modoOffline) {
      const noticias = this._getNoticiasOffline();
      return {
        exito: true,
        datos: {
          resumen: {
            total: noticias.length,
            publicadas: noticias.filter(n => n.estado === 'publicado').length,
            borradores: noticias.filter(n => n.estado === 'borrador').length,
            archivadas: noticias.filter(n => n.estado === 'archivado').length,
            premium: noticias.filter(n => n.es_premium).length,
            abiertas: noticias.filter(n => !n.es_premium).length
          }
        }
      };
    }

    return this._fetch('/noticias/stats/resumen');
  }

  // ─── ÚLTIMA NOTICIA PUBLICADA (PARA ENSAYO & LECTURA) ──────────────────────

  async obtenerUltimaNoticiaPublicada() {
    if (this.modoOffline) {
      const publicadas = this._getNoticiasOffline()
        .filter(n => n.estado === 'publicado')
        .sort((a, b) =>
          (new Date(b.fecha_publicacion || b.created_at) - new Date(a.fecha_publicacion || a.created_at)) ||
          ((b.id_noticia || 0) - (a.id_noticia || 0))
        );
      return publicadas.length
        ? { exito: true, datos: publicadas[0] }
        : { exito: false, datos: null, mensaje: 'No hay noticias publicadas.' };
    }

    try {
      return await this._fetch('/noticias/ultima-publicada');
    } catch (e) {
      return { exito: false, datos: null, mensaje: e.message };
    }
  }

  // ─── AUDIENCIAS DESDE BASE DE DATOS MYSQL ──────────────────────────────────

  async obtenerAudiencias() {
    await this.verificarConexion();
    if (this.modoOffline) {
      return { exito: false, offline: true };
    }
    try {
      return await this._fetch('/audiencias');
    } catch (e) {
      return { exito: false, offline: true, mensaje: e.message };
    }
  }

  // ─── META DE SUSCRIPCIONES PREMIUM (CONFIGURACIÓN) ─────────────────────────

  async obtenerMetaPremium() {
    if (this.modoOffline) {
      const saved = localStorage.getItem(this.storageKeyMeta);
      const meta = saved ? parseInt(saved, 10) : 500;
      return { exito: true, datos: { meta_suscripciones_premium: isNaN(meta) ? 500 : meta } };
    }
    try {
      return await this._fetch('/configuracion/meta-premium');
    } catch (e) {
      const saved = localStorage.getItem(this.storageKeyMeta);
      return { exito: true, datos: { meta_suscripciones_premium: saved ? parseInt(saved, 10) : 500 } };
    }
  }

  async actualizarMetaPremium(meta) {
    const valor = parseInt(meta, 10);
    if (isNaN(valor) || valor < 1) {
      return { exito: false, mensaje: 'La meta debe ser un número mayor a 0.' };
    }
    localStorage.setItem(this.storageKeyMeta, String(valor));

    if (this.modoOffline) {
      return {
        exito: true,
        mensaje: `Meta de suscripciones premium actualizada a ${valor} mecenas PRO (modo offline).`,
        datos: { meta_suscripciones_premium: valor }
      };
    }

    return this._fetch('/configuracion/meta-premium', {
      method: 'PUT',
      body: JSON.stringify({ meta: valor })
    });
  }

  // ─── PRECIOS CLP CONFIGURABLES ──────────────────────────────────────────────

  async obtenerPreciosConfig() {
    if (this.modoOffline) {
      try {
        const saved = localStorage.getItem(this.storageKeyPrecios);
        if (saved) return { exito: true, datos: JSON.parse(saved) };
      } catch (e) {}
      return { exito: true, datos: { precio_mensual_clp: 8990, precio_anual_clp: 89900 } };
    }
    try {
      return await this._fetch('/configuracion/precios');
    } catch (e) {
      return { exito: true, datos: { precio_mensual_clp: 8990, precio_anual_clp: 89900 } };
    }
  }

  async actualizarPreciosConfig(mensual, anual) {
    const pMensual = parseInt(mensual, 10);
    const pAnual = parseInt(anual, 10);
    if (isNaN(pMensual) || isNaN(pAnual) || pMensual < 100 || pAnual < 100) {
      return { exito: false, mensaje: 'Los precios deben ser mayores o iguales a $100 CLP.' };
    }
    const payload = { precio_mensual_clp: pMensual, precio_anual_clp: pAnual };
    localStorage.setItem(this.storageKeyPrecios, JSON.stringify(payload));

    if (this.modoOffline) {
      return {
        exito: true,
        mensaje: `Precios actualizados a $${pMensual.toLocaleString('es-CL')} CLP/mes y $${pAnual.toLocaleString('es-CL')} CLP/año.`,
        datos: payload
      };
    }
    return this._fetch('/configuracion/precios', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // ─── CÓDIGOS DE DESCUENTO Y DESCUENTOS TEMPORALES ───────────────────────────

  _getDescuentosOffline() {
    try {
      const data = localStorage.getItem(this.storageKeyDescuentos);
      if (data) return JSON.parse(data);
    } catch (e) {}
    const semilla = [
      {
        id_descuento: 1,
        tipo: 'codigo',
        codigo: 'ATELIER20',
        nombre: 'Bienvenida Mecenas 20%',
        porcentaje_descuento: 20,
        fecha_inicio: new Date().toISOString(),
        fecha_fin: null,
        activo: true
      }
    ];
    localStorage.setItem(this.storageKeyDescuentos, JSON.stringify(semilla));
    return semilla;
  }

  async listarDescuentos() {
    if (this.modoOffline) {
      return { exito: true, datos: this._getDescuentosOffline() };
    }
    try {
      return await this._fetch('/descuentos');
    } catch (e) {
      return { exito: true, datos: this._getDescuentosOffline() };
    }
  }

  async crearDescuento(datos) {
    if (this.modoOffline) {
      const lista = this._getDescuentosOffline();
      const codigo = datos.tipo === 'codigo' ? (datos.codigo || '').trim().toUpperCase() : '';
      if (datos.tipo === 'codigo' && !codigo) {
        return { exito: false, mensaje: 'El código promocional es obligatorio.' };
      }
      if (codigo && lista.some(d => d.codigo === codigo)) {
        return { exito: false, mensaje: `El código "${codigo}" ya existe.` };
      }
      const nuevo = {
        id_descuento: Date.now(),
        tipo: datos.tipo || 'codigo',
        codigo,
        nombre: datos.nombre || (codigo ? `Descuento ${codigo}` : 'Descuento Temporal'),
        porcentaje_descuento: parseInt(datos.porcentaje_descuento, 10) || 10,
        fecha_inicio: datos.fecha_inicio || null,
        fecha_fin: datos.fecha_fin || null,
        activo: true
      };
      lista.unshift(nuevo);
      localStorage.setItem(this.storageKeyDescuentos, JSON.stringify(lista));
      return { exito: true, mensaje: `Descuento "${nuevo.nombre}" (${nuevo.porcentaje_descuento}%) creado.`, datos: nuevo };
    }
    return this._fetch('/descuentos', {
      method: 'POST',
      body: JSON.stringify(datos)
    });
  }

  async toggleDescuento(id) {
    if (this.modoOffline) {
      const lista = this._getDescuentosOffline();
      const item = lista.find(d => d.id_descuento === id);
      if (!item) return { exito: false, mensaje: 'Descuento no encontrado.' };
      item.activo = !item.activo;
      localStorage.setItem(this.storageKeyDescuentos, JSON.stringify(lista));
      return { exito: true, mensaje: `Descuento ${item.activo ? 'activado' : 'pausado'}.`, datos: item };
    }
    return this._fetch(`/descuentos/${id}`, { method: 'PATCH' });
  }

  async eliminarDescuento(id) {
    if (this.modoOffline) {
      const lista = this._getDescuentosOffline().filter(d => d.id_descuento !== id);
      localStorage.setItem(this.storageKeyDescuentos, JSON.stringify(lista));
      return { exito: true, mensaje: 'Descuento eliminado.' };
    }
    return this._fetch(`/descuentos/${id}`, { method: 'DELETE' });
  }
}

// Instancia singleton global
if (typeof window !== 'undefined') {
  window.apiService = new ApiService();
}
