#!/usr/bin/env bash
# Prépare le rendu du carrousel : dépendances + polices (non versionnées).
set -euo pipefail
cd "$(dirname "$0")"

echo ">> Dépendances (Playwright)"
npm install --no-audit --no-fund

echo ">> Polices (miroir google/fonts)"
mkdir -p fonts
[ -f fonts/Inter.ttf ] || curl -sSL -o fonts/Inter.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf"
[ -f fonts/SpaceGrotesk.ttf ] || curl -sSL -o fonts/SpaceGrotesk.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf"
[ -f fonts/IBMPlexMono-Regular.ttf ] || curl -sSL -o fonts/IBMPlexMono-Regular.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/IBMPlexMono-Regular.ttf"
[ -f fonts/IBMPlexMono-Bold.ttf ] || curl -sSL -o fonts/IBMPlexMono-Bold.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/IBMPlexMono-Bold.ttf"

echo ">> Prêt : node src/render.js [numéros de slides]"
