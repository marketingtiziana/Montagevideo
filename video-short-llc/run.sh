#!/usr/bin/env bash
#
# run.sh — Pipeline complet : voix off → clips → sous-titres → montage.
#
#   bash run.sh              # run complet (consomme ElevenLabs + fal.ai)
#   bash run.sh --mock       # run à blanc, entrées factices, zéro crédit
#   bash run.sh --skip-clips # réutilise les clips déjà dans clips/
#   bash run.sh --skip-voice # réutilise voice.mp3 + timestamps.json
#
# La voix et les clips sont générés EN PARALLÈLE : ils sont indépendants,
# et les clips fal.ai sont de loin l'étape la plus lente.

set -euo pipefail
cd "$(dirname "$0")"

MOCK=0
SKIP_VOICE=0
SKIP_CLIPS=0
for arg in "$@"; do
  case "$arg" in
    --mock)       MOCK=1 ;;
    --skip-voice) SKIP_VOICE=1 ;;
    --skip-clips) SKIP_CLIPS=1 ;;
    -h|--help)    sed -n '2,14p' "$0"; exit 0 ;;
    *) echo "Option inconnue : $arg" >&2; exit 2 ;;
  esac
done

bold() { printf '\n\033[1m\033[35m=== %s ===\033[0m\n' "$1"; }

if [ ! -d node_modules ]; then
  bold "Installation des dépendances"
  npm install --silent
fi

# Police des sous-titres (facultative : repli sur une police système sinon).
if [ ! -f assets/fonts/Anton-Regular.ttf ]; then
  bold "Téléchargement de la police Anton"
  mkdir -p assets/fonts
  curl -sSL --max-time 90 -o assets/fonts/Anton-Regular.ttf \
    "https://raw.githubusercontent.com/google/fonts/main/ofl/anton/Anton-Regular.ttf" \
    || echo "  ! Police indisponible — repli sur la police système."
fi

START=$(date +%s)

if [ "$MOCK" = "1" ]; then
  bold "Entrées factices (aucun appel API)"
  node tools/mock_inputs.js
else
  : "${ELEVENLABS_API_KEY:?ELEVENLABS_API_KEY manquante (voir README)}"
  : "${FAL_KEY:?FAL_KEY manquante (voir README)}"

  CLIPS_PID=""
  if [ "$SKIP_CLIPS" = "0" ]; then
    bold "Clips fal.ai (en arrière-plan)"
    node 02_clips.js > work/clips.log 2>&1 &
    CLIPS_PID=$!
    echo "  → journal : work/clips.log (PID $CLIPS_PID)"
  fi

  if [ "$SKIP_VOICE" = "0" ]; then
    bold "Voix off ElevenLabs"
    node 01_voice.js
  fi

  if [ -n "$CLIPS_PID" ]; then
    bold "Attente de la fin des clips"
    if wait "$CLIPS_PID"; then
      tail -n 12 work/clips.log
    else
      echo "  ✗ Génération des clips en échec — journal complet :" >&2
      cat work/clips.log >&2
      exit 1
    fi
  fi
fi

bold "Sous-titres karaoké"
node 03_subs.js

bold "Montage final"
node 04_assemble.js

END=$(date +%s)
bold "Terminé en $((END - START))s"
ls -lh output/final.mp4
