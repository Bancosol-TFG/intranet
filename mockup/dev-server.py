#!/usr/bin/env python3
"""Servidor local con recarga automática para el prototipo (sin dependencias).

Uso:
    python3 dev-server.py [puerto]

Sirve esta carpeta en http://localhost:8080 (o el puerto indicado) y, cuando
cambia un .html, .css o .js, recarga la pestaña abierta. Solo escucha en
127.0.0.1 y no cachea nada en el navegador.
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
WATCH_EXTS = (".html", ".css", ".js")

# Script que se inyecta en cada página: consulta /__version y recarga si cambia.
LIVE_RELOAD = """<script>
(() => {
  let last = null;
  setInterval(async () => {
    try {
      const v = await (await fetch('/__version', { cache: 'no-store' })).text();
      if (last !== null && v !== last) location.reload();
      last = v;
    } catch (e) { /* servidor parado: no hacer nada */ }
  }, 800);
})();
</script>"""


def latest_mtime():
    """Fecha de modificación más reciente de los archivos vigilados."""
    newest = 0.0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if not d.startswith(".")]
        for name in filenames:
            if name.endswith(WATCH_EXTS):
                newest = max(newest, os.path.getmtime(os.path.join(dirpath, name)))
    return repr(newest)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        route = self.path.split("?", 1)[0]
        if route == "/__version":
            body = latest_mtime().encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        path = self.translate_path(self.path)
        if os.path.isdir(path):
            path = os.path.join(path, "index.html")
        if path.endswith(".html") and os.path.isfile(path):
            with open(path, "rb") as f:
                html = f.read().decode("utf-8")
            html = html.replace("</body>", LIVE_RELOAD + "\n</body>")
            body = html.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        super().do_GET()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"Servidor en http://localhost:{PORT} (recarga automática activa). Ctrl+C para parar.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nParado.")
