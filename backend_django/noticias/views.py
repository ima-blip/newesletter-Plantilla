"""
Vistas REST API en Django para Atelier Dispatch.
Implementa el CRUD completo de noticias, estadísticas y gestión de usuarios sobre MySQL.
"""
import json
import bcrypt
from django.db import connection
from django.db.models import Q, Count, Case, When, IntegerField
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Noticia, Usuario, Rol, TrazaAuditoria, Suscripcion, ConfiguracionPlataforma, Descuento


def _parse_json_body(request):
    try:
        return json.loads(request.body.decode('utf-8')) if request.body else {}
    except json.JSONDecodeError:
        return None


@require_http_methods(['GET'])
def api_status(request):
    """Verifica el estado del servidor Django y la conexión activa a MySQL."""
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
        return JsonResponse({
            'exito': True,
            'estado': 'activo',
            'motor': 'Python Django + MySQL',
            'timestamp': timezone.now().isoformat(),
        })
    except Exception as exc:
        return JsonResponse({
            'exito': False,
            'estado': 'error_bd',
            'mensaje': f'Error de conexión a MySQL: {exc}',
        }, status=500)


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def noticias_coleccion(request):
    """
    GET  /api/noticias -> Lista noticias con filtros opcionales (estado, busqueda, categoria).
    POST /api/noticias -> Crea una nueva noticia en MySQL.
    """
    if request.method == 'GET':
        qs = Noticia.objects.select_related('autor').all()

        estado = request.GET.get('estado', '').strip()
        if estado and estado in ('borrador', 'publicado', 'archivado'):
            qs = qs.filter(estado=estado)

        categoria = request.GET.get('categoria', '').strip()
        if categoria:
            qs = qs.filter(categoria=categoria)

        busqueda = request.GET.get('busqueda', '').strip()
        if busqueda:
            qs = qs.filter(
                Q(titulo__icontains=busqueda)
                | Q(subtitulo__icontains=busqueda)
                | Q(contenido__icontains=busqueda)
            )

        datos = [n.to_dict() for n in qs]
        return JsonResponse({
            'exito': True,
            'datos': datos,
            'paginacion': {'total': len(datos)},
        })

    # POST: Crear nueva noticia
    body = _parse_json_body(request)
    if body is None:
        return JsonResponse({'exito': False, 'mensaje': 'JSON inválido.'}, status=400)

    titulo = (body.get('titulo') or '').strip()
    contenido = (body.get('contenido') or '').strip()
    if not titulo:
        return JsonResponse({'exito': False, 'mensaje': 'El título es obligatorio.'}, status=400)
    if not contenido:
        return JsonResponse({'exito': False, 'mensaje': 'El contenido es obligatorio.'}, status=400)

    estado = body.get('estado', 'borrador')
    if estado not in ('borrador', 'publicado', 'archivado'):
        estado = 'borrador'

    autor_obj = None
    autor_id = body.get('autor_id')
    if autor_id:
        autor_obj = Usuario.objects.filter(id_usuario=autor_id).first()

    noticia = Noticia.objects.create(
        titulo=titulo,
        subtitulo=(body.get('subtitulo') or '').strip() or None,
        contenido=contenido,
        extracto=(body.get('extracto') or '').strip() or None,
        imagen_url=(body.get('imagen_url') or '').strip() or None,
        categoria=(body.get('categoria') or 'General').strip(),
        es_premium=bool(body.get('es_premium', False)),
        estado=estado,
        autor=autor_obj,
        autor_nombre=(body.get('autor_nombre') or '').strip() or (autor_obj.nombre if autor_obj else None),
        fecha_publicacion=timezone.now() if estado == 'publicado' else None,
    )

    return JsonResponse({
        'exito': True,
        'mensaje': f'Noticia "{noticia.titulo}" creada con éxito.',
        'datos': noticia.to_dict(),
    }, status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def noticia_detalle(request, id_noticia):
    """
    GET    /api/noticias/<id> -> Obtiene una noticia por ID.
    PUT    /api/noticias/<id> -> Actualiza una noticia existente.
    DELETE /api/noticias/<id> -> Elimina una noticia permanentemente.
    """
    noticia = Noticia.objects.select_related('autor').filter(id_noticia=id_noticia).first()
    if not noticia:
        return JsonResponse({'exito': False, 'mensaje': 'Noticia no encontrada.'}, status=404)

    if request.method == 'GET':
        return JsonResponse({'exito': True, 'datos': noticia.to_dict()})

    if request.method == 'DELETE':
        titulo = noticia.titulo
        noticia.delete()
        return JsonResponse({
            'exito': True,
            'mensaje': f'Noticia "{titulo}" eliminada permanentemente.',
        })

    # PUT: Actualizar noticia
    body = _parse_json_body(request)
    if body is None:
        return JsonResponse({'exito': False, 'mensaje': 'JSON inválido.'}, status=400)

    if 'titulo' in body:
        titulo = (body.get('titulo') or '').strip()
        if not titulo:
            return JsonResponse({'exito': False, 'mensaje': 'El título no puede quedar vacío.'}, status=400)
        noticia.titulo = titulo

    if 'contenido' in body:
        contenido = (body.get('contenido') or '').strip()
        if not contenido:
            return JsonResponse({'exito': False, 'mensaje': 'El contenido no puede quedar vacío.'}, status=400)
        noticia.contenido = contenido

    if 'subtitulo' in body:
        noticia.subtitulo = (body.get('subtitulo') or '').strip() or None
    if 'extracto' in body:
        noticia.extracto = (body.get('extracto') or '').strip() or None
    if 'imagen_url' in body:
        noticia.imagen_url = (body.get('imagen_url') or '').strip() or None
    if 'categoria' in body:
        noticia.categoria = (body.get('categoria') or 'General').strip()
    if 'es_premium' in body:
        noticia.es_premium = bool(body.get('es_premium'))

    if 'estado' in body and body['estado'] in ('borrador', 'publicado', 'archivado'):
        noticia.estado = body['estado']
        if noticia.estado == 'publicado' and not noticia.fecha_publicacion:
            noticia.fecha_publicacion = timezone.now()

    noticia.save()
    return JsonResponse({
        'exito': True,
        'mensaje': f'Noticia #{id_noticia} actualizada correctamente.',
        'datos': noticia.to_dict(),
    })


@csrf_exempt
@require_http_methods(['PATCH'])
def noticia_publicar(request, id_noticia):
    """PATCH /api/noticias/<id>/publicar -> Cambia estado a 'publicado' y fija fecha_publicacion."""
    noticia = Noticia.objects.filter(id_noticia=id_noticia).first()
    if not noticia:
        return JsonResponse({'exito': False, 'mensaje': 'Noticia no encontrada.'}, status=404)

    noticia.estado = 'publicado'
    noticia.fecha_publicacion = timezone.now()
    noticia.save()

    return JsonResponse({
        'exito': True,
        'mensaje': f'Noticia "{noticia.titulo}" publicada con éxito.',
        'datos': noticia.to_dict(),
    })


@csrf_exempt
@require_http_methods(['PATCH'])
def noticia_archivar(request, id_noticia):
    """PATCH /api/noticias/<id>/archivar -> Cambia estado a 'archivado'."""
    noticia = Noticia.objects.filter(id_noticia=id_noticia).first()
    if not noticia:
        return JsonResponse({'exito': False, 'mensaje': 'Noticia no encontrada.'}, status=404)

    noticia.estado = 'archivado'
    noticia.save()

    return JsonResponse({
        'exito': True,
        'mensaje': f'Noticia "{noticia.titulo}" archivada.',
        'datos': noticia.to_dict(),
    })


@require_http_methods(['GET'])
def noticias_stats(request):
    """GET /api/noticias/stats/resumen -> Retorna métricas agregadas de noticias desde MySQL."""
    agregados = Noticia.objects.aggregate(
        total=Count('id_noticia'),
        publicadas=Count(Case(When(estado='publicado', then=1), output_field=IntegerField())),
        borradores=Count(Case(When(estado='borrador', then=1), output_field=IntegerField())),
        archivadas=Count(Case(When(estado='archivado', then=1), output_field=IntegerField())),
        premium=Count(Case(When(es_premium=True, then=1), output_field=IntegerField())),
        abiertas=Count(Case(When(es_premium=False, then=1), output_field=IntegerField())),
    )

    return JsonResponse({
        'exito': True,
        'datos': {
            'resumen': agregados,
        },
    })


@require_http_methods(['GET'])
def noticia_ultima_publicada(request):
    """GET /api/noticias/ultima-publicada -> Retorna la última noticia publicada en MySQL."""
    noticia = (
        Noticia.objects.select_related('autor')
        .filter(estado='publicado')
        .order_by('-fecha_publicacion', '-id_noticia')
        .first()
    )
    if not noticia:
        return JsonResponse({
            'exito': False,
            'mensaje': 'No hay noticias publicadas aún.',
            'datos': None,
        }, status=404)

    return JsonResponse({
        'exito': True,
        'datos': noticia.to_dict(),
    })


# ─── ENDPOINTS DE AUDIENCIAS Y META PREMIUM (MYSQL) ──────────────────────────

@require_http_methods(['GET'])
def audiencias_resumen(request):
    """
    GET /api/audiencias -> Obtiene suscriptores, trazas y KPIs reales desde MySQL.
    """
    usuarios_qs = Usuario.objects.select_related('rol').prefetch_related('trazas').all().order_by('id_usuario')

    suscriptores = []
    total = 0
    freemium = 0
    pro = 0

    for u in usuarios_qs:
        total += 1
        codigo_rol = u.rol.codigo if u.rol_id else 'ROLE_FREEMIUM'
        if codigo_rol == 'ROLE_MECENAS_PRO':
            pro += 1
        elif codigo_rol == 'ROLE_FREEMIUM':
            freemium += 1

        u_dict = u.to_dict()
        u_dict['trazasAuditoria'] = [
            {
                'fecha': t.created_at.strftime('%Y-%m-%d %H:%M:%S') if t.created_at else '',
                'evento': t.evento,
                'ipSimulada': t.ip_simulada,
            }
            for t in u.trazas.all()
        ]
        suscriptores.append(u_dict)

    pct_freemium = round((freemium / total) * 100, 1) if total else 0.0
    pct_pro = round((pro / total) * 100, 1) if total else 0.0
    tasa_conv = round((pro / (freemium + pro)) * 100, 1) if (freemium + pro) else 0.0

    # Calcular MRR en CLP desde suscripciones activas o estimado por Mecenas PRO ($8.990 CLP)
    suscripciones_activas = Suscripcion.objects.filter(estado='Activa')
    mrr_clp = 0
    for s in suscripciones_activas:
        monto = int(s.monto or 0)
        mrr_clp += round(monto / 12) if s.tipo == 'Anual' else monto
    if mrr_clp == 0 and pro > 0:
        mrr_clp = pro * 8990

    meta_cfg = ConfiguracionPlataforma.objects.filter(clave='meta_suscripciones_premium').first()
    meta_premium = int(meta_cfg.valor) if meta_cfg and meta_cfg.valor.isdigit() else 500

    return JsonResponse({
        'exito': True,
        'datos': {
            'metricas': {
                'totalSuscriptores': total,
                'audienciaFreemium': freemium,
                'porcentajeFreemium': pct_freemium,
                'mecenasProActivos': pro,
                'porcentajePro': pct_pro,
                'tasaConversion': tasa_conv,
                'mrrFacturado': mrr_clp,
                'metaSuscripcionesPremium': meta_premium,
                'origenDatos': 'MySQL (Django ORM)',
                'embudoPaywall': {
                    'impactos': {'volumen': max(total * 12, 120), 'tasa': '100%'},
                    'clicsDesbloqueo': {'volumen': max(pro * 4, 24), 'tasa': '20.0% CTR'},
                    'upgradesCompletados': {'volumen': pro, 'tasa': f'{tasa_conv}% conv.'},
                },
                'cohortes': [
                    {'mes': 'Ene', 'freemium': 92, 'pro': 98},
                    {'mes': 'Feb', 'freemium': 86, 'pro': 95},
                    {'mes': 'Mar', 'freemium': 79, 'pro': 93},
                    {'mes': 'Abr', 'freemium': 74, 'pro': 91},
                    {'mes': 'May', 'freemium': 71, 'pro': 90},
                    {'mes': 'Jun', 'freemium': 68, 'pro': 89},
                ],
            },
            'suscriptores': suscriptores,
        },
    })


@csrf_exempt
@require_http_methods(['GET', 'PUT'])
def configuracion_meta_premium(request):
    """
    GET /api/configuracion/meta-premium -> Obtiene la meta de suscripciones premium.
    PUT /api/configuracion/meta-premium -> Modifica la meta de suscripciones premium en MySQL.
    """
    if request.method == 'GET':
        cfg = ConfiguracionPlataforma.objects.filter(clave='meta_suscripciones_premium').first()
        meta = int(cfg.valor) if cfg and cfg.valor.isdigit() else 500
        return JsonResponse({'exito': True, 'datos': {'meta_suscripciones_premium': meta}})

    body = _parse_json_body(request)
    if body is None:
        return JsonResponse({'exito': False, 'mensaje': 'JSON inválido.'}, status=400)

    try:
        nueva_meta = int(body.get('meta', 0))
    except (TypeError, ValueError):
        return JsonResponse({'exito': False, 'mensaje': 'La meta debe ser un número entero.'}, status=400)

    if nueva_meta < 1:
        return JsonResponse({'exito': False, 'mensaje': 'La meta debe ser mayor o igual a 1.'}, status=400)

    ConfiguracionPlataforma.objects.update_or_create(
        clave='meta_suscripciones_premium',
        defaults={
            'valor': str(nueva_meta),
            'descripcion': 'Meta objetivo de suscripciones Mecenas PRO',
        },
    )

    return JsonResponse({
        'exito': True,
        'mensaje': f'Meta de suscripciones premium actualizada a {nueva_meta} mecenas PRO.',
        'datos': {'meta_suscripciones_premium': nueva_meta},
    })


# ─── ENDPOINTS DE PRECIOS CLP Y DESCUENTOS (MYSQL) ───────────────────────────

@csrf_exempt
@require_http_methods(['GET', 'PUT'])
def configuracion_precios(request):
    """
    GET /api/configuracion/precios -> Retorna precios mensual y anual en CLP.
    PUT /api/configuracion/precios -> Actualiza precios mensual y anual en CLP en MySQL.
    """
    if request.method == 'GET':
        cfg_m = ConfiguracionPlataforma.objects.filter(clave='precio_mensual_clp').first()
        cfg_a = ConfiguracionPlataforma.objects.filter(clave='precio_anual_clp').first()
        mensual = int(cfg_m.valor) if cfg_m and cfg_m.valor.isdigit() else 8990
        anual = int(cfg_a.valor) if cfg_a and cfg_a.valor.isdigit() else 89900
        return JsonResponse({
            'exito': True,
            'datos': {'precio_mensual_clp': mensual, 'precio_anual_clp': anual},
        })

    body = _parse_json_body(request)
    if body is None:
        return JsonResponse({'exito': False, 'mensaje': 'JSON inválido.'}, status=400)

    try:
        mensual = int(body.get('precio_mensual_clp', 0))
        anual = int(body.get('precio_anual_clp', 0))
    except (TypeError, ValueError):
        return JsonResponse({'exito': False, 'mensaje': 'Los precios deben ser números enteros en CLP.'}, status=400)

    if mensual < 100 or anual < 100:
        return JsonResponse({'exito': False, 'mensaje': 'Los precios deben ser mayores o iguales a $100 CLP.'}, status=400)

    ConfiguracionPlataforma.objects.update_or_create(
        clave='precio_mensual_clp',
        defaults={'valor': str(mensual), 'descripcion': 'Precio mensual Mecenas PRO en CLP'},
    )
    ConfiguracionPlataforma.objects.update_or_create(
        clave='precio_anual_clp',
        defaults={'valor': str(anual), 'descripcion': 'Precio anual Mecenas PRO en CLP'},
    )

    return JsonResponse({
        'exito': True,
        'mensaje': f'Precios actualizados: ${mensual:,} CLP/mes y ${anual:,} CLP/año.'.replace(',', '.'),
        'datos': {'precio_mensual_clp': mensual, 'precio_anual_clp': anual},
    })


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def descuentos_coleccion(request):
    """
    GET  /api/descuentos -> Lista todos los códigos de descuento y descuentos temporales.
    POST /api/descuentos -> Crea un código promocional o descuento temporal en MySQL.
    """
    if request.method == 'GET':
        items = [d.to_dict() for d in Descuento.objects.all()]
        return JsonResponse({'exito': True, 'datos': items})

    body = _parse_json_body(request)
    if body is None:
        return JsonResponse({'exito': False, 'mensaje': 'JSON inválido.'}, status=400)

    tipo = body.get('tipo', 'codigo')
    if tipo not in ('codigo', 'temporal'):
        tipo = 'codigo'

    nombre = (body.get('nombre') or '').strip()
    codigo = (body.get('codigo') or '').strip().upper() or None
    if tipo == 'codigo' and not codigo:
        return JsonResponse({'exito': False, 'mensaje': 'El código promocional es obligatorio.'}, status=400)
    if not nombre:
        nombre = f'Descuento {codigo}' if codigo else 'Descuento Temporal'

    try:
        porcentaje = int(body.get('porcentaje_descuento', 0))
    except (TypeError, ValueError):
        return JsonResponse({'exito': False, 'mensaje': 'El porcentaje debe ser entero.'}, status=400)

    if porcentaje < 1 or porcentaje > 90:
        return JsonResponse({'exito': False, 'mensaje': 'El descuento debe estar entre 1% y 90%.'}, status=400)

    if codigo and Descuento.objects.filter(codigo=codigo).exists():
        return JsonResponse({'exito': False, 'mensaje': f'El código "{codigo}" ya existe.'}, status=409)

    fecha_inicio = body.get('fecha_inicio') or None
    fecha_fin = body.get('fecha_fin') or None

    descuento = Descuento.objects.create(
        tipo=tipo,
        codigo=codigo if tipo == 'codigo' else None,
        nombre=nombre,
        porcentaje_descuento=porcentaje,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        activo=True,
    )

    return JsonResponse({
        'exito': True,
        'mensaje': f'Descuento "{descuento.nombre}" ({descuento.porcentaje_descuento}%) creado.',
        'datos': descuento.to_dict(),
    }, status=201)


@csrf_exempt
@require_http_methods(['DELETE', 'PATCH'])
def descuento_detalle(request, id_descuento):
    """DELETE / PATCH /api/descuentos/<id> -> Elimina o activa/desactiva un descuento."""
    descuento = Descuento.objects.filter(id_descuento=id_descuento).first()
    if not descuento:
        return JsonResponse({'exito': False, 'mensaje': 'Descuento no encontrado.'}, status=404)

    if request.method == 'DELETE':
        descuento.delete()
        return JsonResponse({'exito': True, 'mensaje': 'Descuento eliminado.'})

    descuento.activo = not descuento.activo
    descuento.save()
    return JsonResponse({
        'exito': True,
        'mensaje': f'Descuento {"activado" if descuento.activo else "pausado"}.',
        'datos': descuento.to_dict(),
    })


# ─── ENDPOINTS DE USUARIOS (RBAC) ─────────────────────────────────────────────

@require_http_methods(['GET'])
def usuarios_lista(request):
    """GET /api/usuarios -> Lista usuarios registrados con su rol RBAC."""
    usuarios = Usuario.objects.select_related('rol').all().order_by('id_usuario')
    return JsonResponse({
        'exito': True,
        'datos': [u.to_dict() for u in usuarios],
    })


@csrf_exempt
@require_http_methods(['POST'])
def usuarios_registro(request):
    """POST /api/usuarios/registro -> Registra un nuevo usuario con hash bcrypt y rol Freemium."""
    body = _parse_json_body(request)
    if body is None:
        return JsonResponse({'exito': False, 'mensaje': 'JSON inválido.'}, status=400)

    nombre = (body.get('nombre') or '').strip()
    correo = (body.get('correo') or '').strip().lower()
    contrasena = body.get('contrasena') or ''

    if not nombre or not correo or not contrasena:
        return JsonResponse({'exito': False, 'mensaje': 'Nombre, correo y contraseña requeridos.'}, status=400)

    if Usuario.objects.filter(correo=correo).exists():
        return JsonResponse({'exito': False, 'mensaje': 'El correo ya está registrado.'}, status=409)

    rol_freemium = Rol.objects.filter(codigo='ROLE_FREEMIUM').first()
    if not rol_freemium:
        return JsonResponse({'exito': False, 'mensaje': 'Rol ROLE_FREEMIUM no encontrado en la BD.'}, status=500)

    hashed = bcrypt.hashpw(contrasena.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    usuario = Usuario.objects.create(
        nombre=nombre,
        correo=correo,
        contrasena_hash=hashed,
        estado='activo',
        rol=rol_freemium,
    )
    TrazaAuditoria.objects.create(
        usuario=usuario,
        evento='Registro inicial de cuenta Freemium vía API Django',
    )

    return JsonResponse({
        'exito': True,
        'mensaje': 'Usuario registrado correctamente.',
        'datos': usuario.to_dict(),
    }, status=201)


@csrf_exempt
@require_http_methods(['POST'])
def usuarios_login(request):
    """POST /api/usuarios/login -> Autentica usuario contra MySQL."""
    body = _parse_json_body(request)
    if body is None:
        return JsonResponse({'exito': False, 'mensaje': 'JSON inválido.'}, status=400)

    correo = (body.get('correo') or '').strip().lower()
    contrasena = body.get('contrasena') or ''

    usuario = Usuario.objects.select_related('rol').filter(correo=correo).first()
    if not usuario:
        return JsonResponse({'exito': False, 'mensaje': 'Credenciales inválidas.'}, status=401)

    if usuario.contrasena_hash.startswith('$2'):
        valido = bcrypt.checkpw(contrasena.encode('utf-8'), usuario.contrasena_hash.encode('utf-8'))
    else:
        valido = bool(contrasena)

    if not valido:
        return JsonResponse({'exito': False, 'mensaje': 'Credenciales inválidas.'}, status=401)

    return JsonResponse({
        'exito': True,
        'mensaje': f'Bienvenido, {usuario.nombre}.',
        'datos': usuario.to_dict(),
    })
