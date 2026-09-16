#!/usr/bin/env bash
# Récupère Inter (Google Fonts) et régénère inter.css avec les woff2 embarqués en base64.
# inter.css est versionné : les stories se rendent hors-ligne, sans requête externe.
set -euo pipefail
cd "$(dirname "$0")"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
curl -sS -A "$UA" "https://fonts.googleapis.com/css2?family=Inter:wght@300..900&display=swap" -o inter-src.css
LATIN=$(grep -A6 '/\* latin \*/' inter-src.css | grep -o 'https://[^)]*\.woff2')
LATIN_EXT=$(grep -A6 '/\* latin-ext \*/' inter-src.css | grep -o 'https://[^)]*\.woff2')
curl -sS -o inter-latin.woff2 "$LATIN"
curl -sS -o inter-latin-ext.woff2 "$LATIN_EXT"
python3 build-inter-css.py
