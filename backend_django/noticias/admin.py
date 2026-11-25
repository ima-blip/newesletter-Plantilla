from django.contrib import admin
from .models import Rol, Usuario, Noticia, TrazaAuditoria


@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ('id_rol', 'nombre', 'codigo')
    search_fields = ('nombre', 'codigo')


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('id_usuario', 'nombre', 'correo', 'rol', 'estado', 'open_rate')
    list_filter = ('estado', 'rol')
    search_fields = ('nombre', 'correo')


@admin.register(Noticia)
class NoticiaAdmin(admin.ModelAdmin):
    list_display = ('id_noticia', 'titulo', 'categoria', 'estado', 'es_premium', 'autor_nombre', 'fecha_publicacion')
    list_filter = ('estado', 'es_premium', 'categoria')
    search_fields = ('titulo', 'subtitulo', 'contenido')


@admin.register(TrazaAuditoria)
class TrazaAuditoriaAdmin(admin.ModelAdmin):
    list_display = ('id_traza', 'usuario', 'evento', 'ip_simulada', 'created_at')
    search_fields = ('evento', 'usuario__nombre')
