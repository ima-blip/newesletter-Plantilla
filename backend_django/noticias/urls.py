from django.urls import path
from . import views

urlpatterns = [
    path('status', views.api_status, name='api_status'),
    path('noticias', views.noticias_coleccion, name='noticias_coleccion'),
    path('noticias/ultima-publicada', views.noticia_ultima_publicada, name='noticia_ultima_publicada'),
    path('noticias/stats/resumen', views.noticias_stats, name='noticias_stats'),
    path('noticias/<int:id_noticia>', views.noticia_detalle, name='noticia_detalle'),
    path('noticias/<int:id_noticia>/publicar', views.noticia_publicar, name='noticia_publicar'),
    path('noticias/<int:id_noticia>/archivar', views.noticia_archivar, name='noticia_archivar'),
    path('audiencias', views.audiencias_resumen, name='audiencias_resumen'),
    path('configuracion/meta-premium', views.configuracion_meta_premium, name='configuracion_meta_premium'),
    path('configuracion/precios', views.configuracion_precios, name='configuracion_precios'),
    path('descuentos', views.descuentos_coleccion, name='descuentos_coleccion'),
    path('descuentos/<int:id_descuento>', views.descuento_detalle, name='descuento_detalle'),
    path('usuarios', views.usuarios_lista, name='usuarios_lista'),
    path('usuarios/registro', views.usuarios_registro, name='usuarios_registro'),
    path('usuarios/login', views.usuarios_login, name='usuarios_login'),
]
