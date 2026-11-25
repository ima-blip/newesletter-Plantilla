"""
Inicialización del paquete principal de Django.
Registra PyMySQL como reemplazo compatible de MySQLdb para evitar
problemas de compilación en Windows.
"""
import pymysql

pymysql.install_as_MySQLdb()
