#!/usr/bin/env bash
#
# setup.sh — installe toute la stack et vérifie ffmpeg.
#   - dépendances Node (npm ci / npm install)
#   - ffmpeg + ffprobe (apt si dispo, sinon wheel PyPI imageio-ffmpeg en repli)
#   - venv Python 3.11 + WhisperX (large-v3) pour la transcription
#
# Idempotent : réexécutable sans casse.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

log() { printf '\033[36m[setup]\033[0m %s\n' "$*"; }
warn() { printf '\033[33m[setup] ⚠\033[0m %s\n' "$*"; }
die() { printf '\033[31m[setup] ✗\033[0m %s\n' "$*" >&2; exit 1; }

# --- Node ---------------------------------------------------------------
command -v node >/dev/null 2>&1 || die "Node introuvable. Node 20+ requis."
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 20 ] || die "Node 20+ requis (détecté : $(node -v))."
log "Node $(node -v)"

log "Installation des dépendances Node…"
if [ -f package-lock.json ]; then npm ci; else npm install; fi

# --- ffmpeg -------------------------------------------------------------
ensure_ffmpeg() {
  if command -v ffmpeg >/dev/null 2>&1 && command -v ffprobe >/dev/null 2>&1; then
    log "ffmpeg présent : $(ffmpeg -version | head -1)"
    return 0
  fi
  warn "ffmpeg absent — tentative d'installation."
  if command -v apt-get >/dev/null 2>&1; then
    log "Installation via apt-get…"
    (sudo apt-get update -y && sudo apt-get install -y ffmpeg) \
      || apt-get update -y && apt-get install -y ffmpeg \
      || warn "apt-get a échoué, repli sur imageio-ffmpeg."
  fi
  if ! command -v ffmpeg >/dev/null 2>&1; then
    warn "Repli PyPI : imageio-ffmpeg (fournit un binaire ffmpeg statique)."
    python3 -m pip install --quiet imageio-ffmpeg || die "Échec installation imageio-ffmpeg."
    FF="$(python3 -c 'import imageio_ffmpeg,sys; sys.stdout.write(imageio_ffmpeg.get_ffmpeg_exe())')"
    mkdir -p "$ROOT/.bin"
    ln -sf "$FF" "$ROOT/.bin/ffmpeg"
    warn "ffmpeg lié dans $ROOT/.bin — ajoutez-le au PATH : export PATH=\"$ROOT/.bin:\$PATH\""
    warn "Note : imageio-ffmpeg ne fournit pas ffprobe. Préférez l'install système pour ffprobe."
  fi
}
ensure_ffmpeg

command -v ffprobe >/dev/null 2>&1 || warn "ffprobe absent : l'étape 1 (probe) en a besoin. Installez ffmpeg complet."

# --- Python / WhisperX --------------------------------------------------
VENV="$ROOT/.venv"
if [ ! -d "$VENV" ]; then
  log "Création du venv Python 3.11…"
  python3 -m venv "$VENV"
fi
# shellcheck disable=SC1091
source "$VENV/bin/activate"
python -m pip install --quiet --upgrade pip

log "Installation de WhisperX (large-v3)…"
python -m pip install --quiet whisperx || warn "Échec install WhisperX (réseau ?). Réessayez : source .venv/bin/activate && pip install whisperx"

# --- Préchargement des modèles WhisperX (si HuggingFace est joignable) --
# Les poids (faster-whisper large-v3 + align wav2vec2 fr) viennent de HF. Si la
# politique réseau bloque HF, ce préchargement est ignoré : fournir alors un
# modèle local via WHISPER_MODEL_DIR (voir README).
HF_CACHE="$ROOT/models/hf-cache"
if curl -sS -o /dev/null --max-time 15 https://huggingface.co 2>/dev/null; then
  log "HuggingFace joignable — préchargement large-v3 + align fr dans models/hf-cache…"
  HF_HOME="$HF_CACHE" python - <<'PY' || warn "Préchargement modèle échoué (poursuite)."
import whisperx
whisperx.load_model("large-v3", device="cpu", compute_type="int8", language="fr")
whisperx.load_align_model(language_code="fr", device="cpu")
print("modèles WhisperX en cache")
PY
else
  warn "HuggingFace injoignable (politique réseau). La transcription (étape 2)"
  warn "nécessitera une session où HF est autorisé, ou un modèle local"
  warn "(export WHISPER_MODEL_DIR=/chemin/faster-whisper-large-v3)."
fi

log "Setup terminé."
log "Vérifs : node -v ; ffmpeg -version ; source .venv/bin/activate && python -c 'import whisperx'"
