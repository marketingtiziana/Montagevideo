#!/usr/bin/env bash
# Chaine complete : source.mp4 -> final_tiktok.mp4
# Tous les choix de montage se modifient dans reel/config.py.
set -e
cd "$(dirname "$0")/.."

echo ">> 1/6  dependances"
pip3 install --quiet imageio-ffmpeg faster-whisper opencv-python-headless Pillow numpy

echo ">> 2/6  ressources (detecteur de visage + polices)"
mkdir -p models fonts
[ -f models/yunet.onnx ] || curl -sSL -o models/yunet.onnx \
  "https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
[ -f fonts/Anton-Regular.ttf ] || curl -sSL -o fonts/Anton-Regular.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/anton/Anton-Regular.ttf"

echo ">> 3/6  suivi du visage (une seule fois par source)"
[ -f face_track.json ] || python3 reel/track_face.py

echo ">> 4/6  coupes + camera virtuelle + etalonnage"
python3 reel/build_video.py

echo ">> 5/6  sous-titres, incrustations, audio"
python3 reel/gen_captions.py
python3 reel/gen_graphics.py
python3 reel/build_audio.py

echo ">> 6/6  composition finale"
python3 reel/compose.py

echo ">> OK -> final_tiktok.mp4"
