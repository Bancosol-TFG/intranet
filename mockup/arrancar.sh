#!/usr/bin/env bash
# Arranca el prototipo en un servidor local con recarga automática.
#
# Uso:
#   ./arrancar.sh [puerto]     (por defecto 8080)
#
# Después abre http://localhost:<puerto> en el navegador.

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${1:-8080}"

if ! [[ "$PORT" =~ ^[0-9]+$ ]] || (( PORT < 1 || PORT > 65535 )); then
  echo "Puerto no válido: $PORT" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Hace falta python3 instalado." >&2
  exit 1
fi

cd "$DIR"
exec python3 "$DIR/dev-server.py" "$PORT"
