#!/usr/bin/env bash
# Pipeline podcast 16:9 — dépendances et ressources (en plus de pipeline/setup.sh).
set -e
cd "$(dirname "$0")/../.."
bash pipeline/setup.sh
pip3 install --quiet faster-whisper librosa scikit-learn scipy "opencv-python-headless<5" huggingface_hub onnxruntime kaldi-native-fbank
# Empreintes vocales WeSpeaker ResNet34 (ONNX) pour la diarisation
[ -f models/wespeaker/voxceleb_resnet34_LM.onnx ] || python3 -c "
from huggingface_hub import hf_hub_download as d
d('Wespeaker/wespeaker-voxceleb-resnet34-LM', 'voxceleb_resnet34_LM.onnx', local_dir='models/wespeaker')"
# Modèle Whisper large-v3-turbo (CTranslate2) ; repli automatique sur ggml-base si indisponible
[ -f models/fw-large-v3-turbo/model.bin ] || python3 -c "
from huggingface_hub import snapshot_download
snapshot_download('mobiuslabsgmbh/faster-whisper-large-v3-turbo', local_dir='models/fw-large-v3-turbo')" || true
# Polices (google/fonts) : Montserrat (variable, axe wght) en italique + Archivo Black de repli
mkdir -p fonts
G=https://raw.githubusercontent.com/google/fonts/main/ofl
[ -f fonts/Montserrat-Italic.ttf ] || curl -sSL -o fonts/Montserrat-Italic.ttf "$G/montserrat/Montserrat-Italic%5Bwght%5D.ttf"
[ -f fonts/Montserrat.ttf ] || curl -sSL -o fonts/Montserrat.ttf "$G/montserrat/Montserrat%5Bwght%5D.ttf"
[ -f fonts/Bungee-Regular.ttf ] || curl -sSL -o fonts/Bungee-Regular.ttf "$G/bungee/Bungee-Regular.ttf"
mkdir -p work
[ -f work/audio16.wav ] || ffmpeg -v error -y -i source.mp4 -vn -ac 1 -ar 16000 work/audio16.wav
[ -f work/audio48.wav ] || ffmpeg -v error -y -i source.mp4 -vn -c:a pcm_s16le -ar 48000 work/audio48.wav
# Instance statique Montserrat ExtraBold Italic (wght 800) pour libass
pip3 install --quiet fonttools
[ -f fonts/Montserrat-ExtraBoldItalic.ttf ] || python3 pipeline/podcast/make_font.py
# Détecteur de visages YuNet (opencv_zoo, CDN GitHub)
mkdir -p models/yunet
[ -s models/yunet/yunet.onnx ] || curl -sSL -o models/yunet/yunet.onnx "https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
echo OK
