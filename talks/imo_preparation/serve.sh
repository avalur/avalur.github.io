#!/usr/bin/env bash
# Local server for the talk. ES modules need HTTP, file:// will not do.
#
#   ./serve.sh          → http://localhost:8123/
#   ./serve.sh 9000     → http://localhost:9000/
#
# Отдаёт всё с Cache-Control: no-store. Иначе Chrome держит ES-модули в кеше, и
# после правки кода вкладка продолжает выполнять старую версию — ловушка, на
# которую легко потратить полчаса.
set -euo pipefail

PORT="${1:-8123}"
cd "$(dirname "$0")"
echo "→ http://localhost:$PORT/          (показ)"
echo "→ http://localhost:$PORT/?dev      (свободная камера, отладка)"

exec python3 - "$PORT" <<'PY'
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()


ThreadingHTTPServer(('', int(sys.argv[1])), NoCacheHandler).serve_forever()
PY
