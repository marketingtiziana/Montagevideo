#!/usr/bin/env bash
# Chaine complete : still.jpg -> final_broll.mp4 (10 s, 1080x1920, musique seule).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== 1/4  dependances =="
python3 -c "import cv2, numpy, PIL, imageio_ffmpeg" 2>/dev/null \
  || pip install -q opencv-python-headless numpy pillow imageio-ffmpeg

echo "== 2/4  image animee (Ken Burns + etalonnage) =="
python3 reel_broll/build_video.py

echo "== 3/4  hook + son =="
python3 reel_broll/gen_hook.py
# AUDIO = False : aucune piste son, on saute la synthese
if python3 -c "import sys; sys.path.insert(0,'reel_broll'); from config import AUDIO; sys.exit(0 if AUDIO else 1)"; then
  python3 reel_broll/build_audio.py
else
  echo "-> aucune piste son demandee (AUDIO = False)"
fi

echo "== 4/4  composition =="
python3 reel_broll/compose.py
python3 reel_broll/check.py
