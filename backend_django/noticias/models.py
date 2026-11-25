"""
Modelos ORM de Django mapeados al esquema MySQL definido en database/schema.sql.
Se utiliza managed = False para respetar las tablas e índices creados por schema.sql.
"""
from django.db import models


class Rol(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=50, unique=True)
    permisos = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'roles'
        verbose_name = 'Rol RBAC'
        verbose_name_plural = 'Roles RBAC'

    def __str__(self):
        return f'{self.nombre} ({self.codigo})'


class Usuario(models.Model):
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('suspendido', 'Suspendido'),
    ]

    id_usuario = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=200)
    correo = models.EmailField(max_length=255, unique=True)
    contrasena_hash = models.CharField(max_length=500)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activo')
    rol = models.ForeignKey(
        Rol,
        on_delete=models.RESTRICT,
        db_column='id_rol',
        default=1,
        related_name='usuarios',
    )
    open_rate = models.DecimalField(max_digits=5, decimal_places=2, default=45.00)
    ultimo_boletin = models.CharField(max_length=200, null=True, blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'usuarios'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f'{self.nombre} <{self.correo}>'

    def to_dict(self):
        return {
            'id_usuario': self.id_usuario,
            'nombre': self.nombre,
            'correo': self.correo,
            'estado': self.estado,
            'id_rol': self.rol_id,
            'rol_codigo': self.rol.codigo if self.rol_id else None,
            'rol_nombre': self.rol.nombre if self.rol_id else None,
            'open_rate': float(self.open_rate) if self.open_rate is not None else 0.0,
            'ultimo_boletin': self.ultimo_boletin,
            'fecha_registro': self.fecha_registro.isoformat() if self.fecha_registro else None,
        }


class Noticia(models.Model):
    ESTADO_CHOICES = [
        ('borrador', 'Borrador'),
        ('publicado', 'Publicado'),
        ('archivado', 'Archivado'),
    ]

    id_noticia = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=500)
    subtitulo = models.CharField(max_length=500, null=True, blank=True)
    contenido = models.TextField()
    extracto = models.TextField(null=True, blank=True)
    imagen_url = models.CharField(max_length=1000, null=True, blank=True)
    categoria = models.CharField(max_length=100, default='General')
    es_premium = models.BooleanField(default=False)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='borrador')
    autor = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='autor_id',
        related_name='noticias',
    )
    autor_nombre = models.CharField(max_length=200, null=True, blank=True)
    fecha_publicacion = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'noticias'
        ordering = ['-created_at']
        verbose_name = 'Noticia'
        verbose_name_plural = 'Noticias'

    def __str__(self):
        return f'[{self.estado.upper()}] {self.titulo}'

    def to_dict(self):
        return {
            'id_noticia': self.id_noticia,
            'titulo': self.titulo,
            'subtitulo': self.subtitulo or '',
            'contenido': self.contenido,
            'extracto': self.extracto or '',
            'imagen_url': self.imagen_url or '',
            'categoria': self.categoria or 'General',
            'es_premium': bool(self.es_premium),
            'estado': self.estado,
            'autor_id': self.autor_id,
            'autor_nombre': self.autor_nombre or (self.autor.nombre if self.autor else ''),
            'fecha_publicacion': self.fecha_publicacion.isoformat() if self.fecha_publicacion else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class TrazaAuditoria(models.Model):
    id_traza = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        db_column='id_usuario',
        related_name='trazas',
    )
    evento = models.TextField()
    ip_simulada = models.CharField(max_length=50, default='192.168.1.1')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'trazas_auditoria'
        ordering = ['-created_at']
        verbose_name = 'Traza de Auditoría'
        verbose_name_plural = 'Trazas de Auditoría'


class Suscripcion(models.Model):
    TIPO_CHOICES = [('Mensual', 'Mensual'), ('Anual', 'Anual')]
    ESTADO_CHOICES = [('Activa', 'Activa'), ('Cancelada', 'Cancelada')]

    id_suscripcion = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        db_column='id_usuario',
        related_name='suscripciones',
    )
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='Anual')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='Activa')
    monto = models.DecimalField(max_digits=12, decimal_places=0, default=89900)
    moneda = models.CharField(max_length=10, default='CLP')
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fecha_renovacion = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'suscripciones'
        verbose_name = 'Suscripción'
        verbose_name_plural = 'Suscripciones'


class ConfiguracionPlataforma(models.Model):
    clave = models.CharField(max_length=100, primary_key=True)
    valor = models.CharField(max_length=500)
    descripcion = models.CharField(max_length=500, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'configuracion_plataforma'
        verbose_name = 'Configuración de Plataforma'
        verbose_name_plural = 'Configuración de Plataforma'

    def __str__(self):
        return f'{self.clave} = {self.valor}'


class Descuento(models.Model):
    TIPO_CHOICES = [('codigo', 'Código Promocional'), ('temporal', 'Descuento Temporal')]

    id_descuento = models.AutoField(primary_key=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='codigo')
    codigo = models.CharField(max_length=50, null=True, blank=True, unique=True)
    nombre = models.CharField(max_length=200)
    porcentaje_descuento = models.IntegerField()
    fecha_inicio = models.DateTimeField(null=True, blank=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'descuentos'
        ordering = ['-created_at']
        verbose_name = 'Descuento / Código'
        verbose_name_plural = 'Descuentos y Códigos'

    def to_dict(self):
        return {
            'id_descuento': self.id_descuento,
            'tipo': self.tipo,
            'codigo': self.codigo or '',
            'nombre': self.nombre,
            'porcentaje_descuento': int(self.porcentaje_descuento),
            'fecha_inicio': self.fecha_inicio.isoformat() if self.fecha_inicio else None,
            'fecha_fin': self.fecha_fin.isoformat() if self.fecha_fin else None,
            'activo': bool(self.activo),
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
