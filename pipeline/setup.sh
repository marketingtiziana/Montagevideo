#!/usr/bin/env bash
# Installe les dépendances et télécharge les ressources (modèle Whisper, polices, bruitages).
# Pensé pour un environnement où seuls PyPI et le CDN GitHub sont accessibles.
set -e
cd "$(dirname "$0")/.."

echo ">> Dépendances Python"
pip3 install --quiet imageio-ffmpeg faster-whisper pywhispercpp Pillow

echo ">> Modèle Whisper (base multilingue, miroir GitHub)"
mkdir -p models
[ -f models/ggml-base.bin ] || curl -sSL -o models/ggml-base.bin \
  "https://github.com/aethersdr/AetherSDR/releases/download/asr-models-v1/ggml-base.bin"

echo ">> Polices grasses/compactes (miroir google/fonts)"
mkdir -p fonts
declare -A F=(
  [Anton-Regular.ttf]="ofl/anton/Anton-Regular.ttf"
  [Archivo-Black.ttf]="ofl/archivoblack/ArchivoBlack-Regular.ttf"
  [BebasNeue-Regular.ttf]="ofl/bebasneue/BebasNeue-Regular.ttf"
)
for name in "${!F[@]}"; do
  [ -f "fonts/$name" ] || curl -sSL -o "fonts/$name" "https://raw.githubusercontent.com/google/fonts/main/${F[$name]}"
done

echo ">> Bruitages de transition (générés avec ffmpeg)"
mkdir -p sfx
FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
"$FF" -y -f lavfi -i "anoisesrc=d=0.5:c=pink:a=0.4" -af "highpass=f=200,lowpass=f=8000,afade=t=in:d=0.05,afade=t=out:st=0.25:d=0.25,volume=1.2" -ar 44100 sfx/whoosh1.wav 2>/dev/null
"$FF" -y -f lavfi -i "sine=frequency=200:duration=0.35" -af "aeval=val(0)*sin(2*PI*t*(300+t*1200)):c=same,afade=t=out:st=0.15:d=0.2,volume=0.6" -ar 44100 sfx/whoosh2.wav 2>/dev/null
"$FF" -y -f lavfi -i "sine=frequency=900:duration=0.08" -af "afade=t=out:st=0.02:d=0.06,volume=0.5" -ar 44100 sfx/pop.wav 2>/dev/null

echo ">> OK. Place la vidéo source sous le nom source.mp4 à la racine, puis suis le README."
