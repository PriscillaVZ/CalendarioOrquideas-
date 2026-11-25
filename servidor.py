"""Sirve el frontend en http://localhost:8080 sin caché.

`python3 -m http.server` no manda Cache-Control: el navegador guarda las
páginas y los scripts por su cuenta y, tras un `git pull`, puede mezclar
un index.html nuevo con un calendario.js viejo. Este servidor pide no
guardar nada, así cada recarga trae los archivos actuales.

Uso, desde esta carpeta:  python3 servidor.py
"""

import http.server


class SinCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    print("Frontend en http://localhost:8080/login.html (Ctrl+C para detener)")
    http.server.ThreadingHTTPServer(("127.0.0.1", 8080), SinCache).serve_forever()
