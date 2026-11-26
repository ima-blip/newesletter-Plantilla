"""
Suite E2E en Navegador Real (Microsoft Edge Headless + Python stdlib)
Valida Controladores, Vistas, Reglas RBAC y Bloqueo por Difuminado (RF-01 a RF-05).

Ejecutar desde la raíz del proyecto:
    python test_e2e_browser.py -v
"""

import base64
import functools
import hashlib
import http.server
import json
import os
import shutil
import socket
import socketserver
import struct
import subprocess
import tempfile
import threading
import time
import unittest
import urllib.parse
import urllib.request


EDGE_PATHS = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]


def _find_edge():
    for path in EDGE_PATHS:
        if os.path.exists(path):
            return path
    raise FileNotFoundError("No se encontró Microsoft Edge instalado para las pruebas E2E.")


def _free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


class _SimpleCDPClient:
    """Cliente WebSocket minimalista (RFC 6455) usando solo librería estándar de Python."""

    def __init__(self, ws_url):
        parsed = urllib.parse.urlparse(ws_url)
        host = parsed.hostname
        port = parsed.port
        path = parsed.path or "/"

        self.sock = socket.create_connection((host, port), timeout=10)
        key = base64.b64encode(os.urandom(16)).decode("ascii")
        handshake = (
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {host}:{port}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(handshake.encode("ascii"))

        buf = b""
        while b"\r\n\r\n" not in buf:
            chunk = self.sock.recv(4096)
            if not chunk:
                raise RuntimeError("Conexión CDP cerrada durante el handshake.")
            buf += chunk

        expected = base64.b64encode(
            hashlib.sha1((key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").encode("ascii")).digest()
        ).decode("ascii")
        if expected.encode("ascii") not in buf:
            raise RuntimeError("Handshake WebSocket CDP inválido.")

        self._msg_id = 0

    def _recv_exact(self, n):
        data = bytearray()
        while len(data) < n:
            chunk = self.sock.recv(n - len(data))
            if not chunk:
                raise RuntimeError("Socket CDP cerrado inesperadamente.")
            data.extend(chunk)
        return bytes(data)

    def _send_text(self, text):
        payload = text.encode("utf-8")
        mask = os.urandom(4)
        header = bytearray([0x81])
        length = len(payload)
        if length < 126:
            header.append(0x80 | length)
        elif length < 65536:
            header.append(0x80 | 126)
            header.extend(struct.pack("!H", length))
        else:
            header.append(0x80 | 127)
            header.extend(struct.pack("!Q", length))
        header.extend(mask)
        masked = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))
        self.sock.sendall(bytes(header) + masked)

    def _recv_frame(self):
        while True:
            b1, b2 = self._recv_exact(2)
            opcode = b1 & 0x0F
            masked = bool(b2 & 0x80)
            length = b2 & 0x7F
            if length == 126:
                length = struct.unpack("!H", self._recv_exact(2))[0]
            elif length == 127:
                length = struct.unpack("!Q", self._recv_exact(8))[0]
            mask_key = self._recv_exact(4) if masked else b""
            payload = self._recv_exact(length)
            if masked:
                payload = bytes(b ^ mask_key[i % 4] for i, b in enumerate(payload))
            if opcode == 0x8:
                raise RuntimeError("WebSocket CDP cerrado por el navegador.")
            if opcode in (0x9, 0xA):
                continue
            return payload.decode("utf-8")

    def call(self, method, params=None):
        self._msg_id += 1
        req_id = self._msg_id
        self._send_text(json.dumps({"id": req_id, "method": method, "params": params or {}}))
        while True:
            msg = json.loads(self._recv_frame())
            if msg.get("id") == req_id:
                if "error" in msg:
                    raise RuntimeError(f"Error CDP en {method}: {msg['error']}")
                return msg.get("result", {})

    def eval_js(self, expression):
        res = self.call(
            "Runtime.evaluate",
            {
                "expression": expression,
                "awaitPromise": True,
                "returnByValue": True,
            },
        )
        if "exceptionDetails" in res:
            raise AssertionError(f"Excepción JS en navegador: {res['exceptionDetails']}")
        return res.get("result", {}).get("value")

    def close(self):
        try:
            self.sock.close()
        except Exception:
            pass


class TestAtelierDispatchE2E(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root_dir = os.path.dirname(os.path.abspath(__file__))
        handler = functools.partial(_QuietHandler, directory=cls.root_dir)
        cls.http_port = _free_port()
        cls.httpd = socketserver.TCPServer(("127.0.0.1", cls.http_port), handler)
        cls.http_thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.http_thread.start()

        cls.cdp_port = _free_port()
        cls.user_data_dir = tempfile.mkdtemp(prefix="atelier_edge_e2e_")
        edge_bin = _find_edge()
        cls.edge_proc = subprocess.Popen(
            [
                edge_bin,
                "--headless=new",
                "--disable-gpu",
                "--no-first-run",
                "--no-default-browser-check",
                f"--user-data-dir={cls.user_data_dir}",
                f"--remote-debugging-port={cls.cdp_port}",
                "about:blank",
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        # Esperar a que CDP responda
        ws_url = None
        for _ in range(30):
            try:
                raw = urllib.request.urlopen(f"http://127.0.0.1:{cls.cdp_port}/json/list", timeout=1).read()
                targets = json.loads(raw.decode("utf-8"))
                for t in targets:
                    if t.get("type") == "page" and t.get("webSocketDebuggerUrl"):
                        ws_url = t["webSocketDebuggerUrl"]
                        break
                if ws_url:
                    break
            except Exception:
                time.sleep(0.25)

        if not ws_url:
            raise RuntimeError("No se pudo conectar al endpoint CDP de Edge headless.")

        cls.cdp = _SimpleCDPClient(ws_url)
        cls.cdp.call("Page.enable")
        cls.cdp.call("Runtime.enable")
        cls.base_url = f"http://127.0.0.1:{cls.http_port}/index.html"

    @classmethod
    def tearDownClass(cls):
        if hasattr(cls, "cdp"):
            cls.cdp.close()
        if hasattr(cls, "edge_proc"):
            cls.edge_proc.terminate()
            try:
                cls.edge_proc.wait(timeout=5)
            except Exception:
                cls.edge_proc.kill()
        if hasattr(cls, "httpd"):
            cls.httpd.shutdown()
            cls.httpd.server_close()
        if hasattr(cls, "user_data_dir") and os.path.exists(cls.user_data_dir):
            shutil.rmtree(cls.user_data_dir, ignore_errors=True)

    def _open_clean(self, hash_route="portada-noticias"):
        self.cdp.call("Page.navigate", {"url": f"{self.base_url}#{hash_route}"})
        self._wait_until("() => Boolean(window.app && window.app.store && document.getElementById('app-main-content'))")
        self.cdp.eval_js("localStorage.clear(); window.app.store.cargarSemillasIniciales();")
        self.cdp.eval_js(f"window.app.navegarA('{hash_route}');")
        time.sleep(0.35)

    def _wait_until(self, js_predicate, timeout=6.0):
        deadline = time.time() + timeout
        while time.time() < deadline:
            try:
                if self.cdp.eval_js(f"({js_predicate})()"):
                    return
            except Exception:
                pass
            time.sleep(0.15)
        raise AssertionError(f"Tiempo agotado esperando condición en navegador: {js_predicate}")

    def test_01_visitante_bloqueado_con_difuminado_real_en_noticia(self):
        self._open_clean("noticia")
        self._wait_until("() => Boolean(document.getElementById('freemium-paywall-gate'))")

        info = self.cdp.eval_js(
            """(() => {
                const gate = document.getElementById('freemium-paywall-gate');
                const blurEl = gate.querySelector('.paywall-blur-layer-1');
                const container = gate.querySelector('.paywall-blur-container');
                const styleBlur = blurEl ? getComputedStyle(blurEl) : null;
                const styleCont = container ? getComputedStyle(container) : null;
                const mainText = document.getElementById('app-main-content').textContent;
                return {
                    hasGate: Boolean(gate),
                    filter: styleBlur ? styleBlur.filter : '',
                    userSelect: styleCont ? styleCont.userSelect : '',
                    hasTeaserCard: mainText.includes('Este ensayo continúa para la comunidad de mecenas'),
                    hasAgoraLock: mainText.includes('Debate Exclusivo Comunidad PRO'),
                    hasZonaPro: mainText.includes('Zona PRO Desbloqueada')
                };
            })()"""
        )

        self.assertTrue(info["hasGate"])
        self.assertIn("blur(", info["filter"])
        self.assertEqual(info["userSelect"], "none")
        self.assertTrue(info["hasTeaserCard"])
        self.assertTrue(info["hasAgoraLock"])
        self.assertFalse(info["hasZonaPro"])

    def test_02_articulo_abierto_no_expone_zona_pro_a_freemium(self):
        self._open_clean("portada-noticias")
        self._wait_until("() => document.body.textContent.includes('La economía de la atención')")

        self.cdp.eval_js(
            """(() => {
                const cards = Array.from(document.querySelectorAll('article'));
                const openCard = cards.find(c => c.textContent.includes('La economía de la atención'));
                const target = openCard.hasAttribute('onclick') ? openCard : openCard.querySelector('[onclick]');
                target.click();
            })()"""
        )
        self._wait_until("() => document.body.textContent.includes('ARTÍCULO COMPLETO • ACCESO ABIERTO')")

        estado = self.cdp.eval_js(
            """(() => ({
                hasGate: Boolean(document.getElementById('freemium-paywall-gate')),
                hasZonaPro: document.body.textContent.includes('Zona PRO Desbloqueada'),
                hasAgoraInput: Boolean(document.getElementById('agora-comment-input')),
                hasAgoraLock: document.body.textContent.includes('Debate Exclusivo Comunidad PRO'),
                hasFullBody: document.body.textContent.includes('conductismo skinneriano')
            }))()"""
        )

        self.assertFalse(estado["hasGate"])
        self.assertFalse(estado["hasZonaPro"])
        self.assertFalse(estado["hasAgoraInput"])
        self.assertTrue(estado["hasAgoraLock"])
        self.assertTrue(estado["hasFullBody"])

    def test_03_registro_freemium_validacion_y_acceso_restringido_403(self):
        self._open_clean("iniciar-sesion")
        self._wait_until("() => Boolean(document.getElementById('form-register-user'))")

        # 1) Contraseñas discordantes -> bloqueado
        self.cdp.eval_js(
            """(() => {
                document.getElementById('reg-name').value = 'Prueba Lector';
                document.getElementById('reg-email').value = 'lector.e2e@atelier.test';
                document.getElementById('reg-password').value = 'ClaveSegura2026!';
                document.getElementById('reg-password-confirm').value = 'OtraClave2026!';
                document.getElementById('form-register-user').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            })()"""
        )
        err_visible = self.cdp.eval_js(
            "(() => !document.getElementById('reg-password-error').classList.contains('hidden'))()"
        )
        self.assertTrue(err_visible)

        # 2) Registro válido -> asigna ROLE_FREEMIUM
        self.cdp.eval_js(
            """(() => {
                document.getElementById('reg-password-confirm').value = 'ClaveSegura2026!';
                document.getElementById('form-register-user').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            })()"""
        )
        self._wait_until("() => document.getElementById('navbar-user-role-badge')?.textContent.includes('Suscriptor Freemium')")

        # 3) Guardia RBAC 403 en ruta administrativa
        self.cdp.eval_js("window.app.navegarA('consola-audiencias');")
        self._wait_until("() => document.body.textContent.includes('403')")
        blocked_403 = self.cdp.eval_js(
            "document.getElementById('app-main-content').textContent.includes('Acceso Denegado') || document.getElementById('app-main-content').textContent.includes('403')"
        )
        self.assertTrue(blocked_403)

    def test_04_pasarela_pago_402_vs_200_desbloquea_articulo(self):
        self._open_clean("portal-suscripcion")
        self.cdp.eval_js("window.app.store.iniciarSesion({ correo: 'mateo.berardi@politecnico.it', password: 'MateoAlpha2026!' });")
        self._wait_until("() => Boolean(document.getElementById('form-checkout'))")

        # Aplicar código ATELIER20
        self.cdp.eval_js(
            """(() => {
                document.getElementById('input-coupon-code').value = 'ATELIER20';
                document.getElementById('btn-apply-coupon').click();
            })()"""
        )
        time.sleep(0.2)

        # Tarjeta declinada (4000...0002)
        self.cdp.eval_js(
            """(() => {
                document.getElementById('cardholder-name').value = 'Mateo Berardi';
                document.getElementById('checkout-email').value = 'mateo.berardi@politecnico.it';
                document.getElementById('card-number').value = '4000 0000 0000 0002';
                document.getElementById('card-expiry').value = '12/28';
                document.getElementById('card-cvc').value = '123';
                document.getElementById('form-checkout').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            })()"""
        )
        self._wait_until("() => document.getElementById('payment-feedback-banner')?.innerText.includes('fondos insuficientes')")
        rol_tras_rechazo = self.cdp.eval_js("window.app.store.usuarioActual.rol.codigo")
        self.assertEqual(rol_tras_rechazo, "ROLE_FREEMIUM")

        # Tarjeta aprobada (4242...)
        self.cdp.eval_js(
            """(() => {
                document.getElementById('card-number').value = '4242 4242 4242 4242';
                document.getElementById('form-checkout').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            })()"""
        )
        self._wait_until("() => window.app.store.usuarioActual.rol.codigo === 'ROLE_MECENAS_PRO'")

        # Verificar desbloqueo completo en #noticia
        self.cdp.eval_js("window.app.navegarA('noticia');")
        self._wait_until("() => document.body.textContent.includes('Zona PRO Desbloqueada')")
        unlocked = self.cdp.eval_js(
            """(() => ({
                hasGate: Boolean(document.getElementById('freemium-paywall-gate')),
                hasZonaPro: document.body.textContent.includes('Zona PRO Desbloqueada'),
                hasAgoraInput: Boolean(document.getElementById('agora-comment-input'))
            }))()"""
        )
        self.assertFalse(unlocked["hasGate"])
        self.assertTrue(unlocked["hasZonaPro"])
        self.assertTrue(unlocked["hasAgoraInput"])

    def test_05_sandbox_y_editor_corte_seco_y_articulo_corto(self):
        self._open_clean("iniciar-sesion")
        self._wait_until("() => Boolean(document.getElementById('form-login-user'))")

        self.cdp.eval_js(
            """(() => {
                document.getElementById('tab-login-btn').click();
                document.getElementById('login-email').value = 'sandboxadmin@evaluacion.ipvg';
                document.getElementById('login-pass').value = 'Evaluacion3';
                document.getElementById('form-login-user').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            })()"""
        )
        self._wait_until("() => window.app.store.esSandboxActivo()")

        # Conmutar a corte_seco y cargar artículo premium de 1 solo párrafo
        self.cdp.eval_js(
            """(() => {
                window.app.editorController.configurarPaywall({ umbral: 'p3', estilo: 'corte_seco' });
                window.app.articleController.setReaderMode('freemium');
                window.app.articleController.ultimaNoticiaPublicada = {
                    id_noticia: 777,
                    titulo: 'Artículo Corto E2E',
                    contenido: 'Primera oración visible para lector gratuito. Segunda oración restringida que no debe mostrarse completa.',
                    es_premium: true,
                    estado: 'publicado'
                };
                window.app.articleController._noticiaEspecifica = true;
                window.app.navegarA('noticia');
            })()"""
        )
        self._wait_until("() => document.getElementById('freemium-paywall-gate')?.getAttribute('data-estilo') === 'corte_seco'")

        corte_info = self.cdp.eval_js(
            """(() => ({
                estilo: document.getElementById('freemium-paywall-gate').getAttribute('data-estilo'),
                blurCount: document.querySelectorAll('.paywall-blur-layer-1').length,
                hasFirstSentence: document.body.innerText.includes('Primera oración visible'),
                hasSecondSentence: document.body.innerText.includes('Segunda oración restringida')
            }))()"""
        )
        self.assertEqual(corte_info["estilo"], "corte_seco")
        self.assertEqual(corte_info["blurCount"], 0)
        self.assertTrue(corte_info["hasFirstSentence"])
        self.assertFalse(corte_info["hasSecondSentence"])


if __name__ == "__main__":
    unittest.main()
