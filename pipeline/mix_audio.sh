#!/usr/bin/env bash
# Étape finale : mixe les bruitages (whoosh sur transitions, pop sur badges) et scelle le fichier.
# Usage: pipeline/mix_audio.sh finalv.mp4 REEL_final.mp4
set -e
cd "$(dirname "$0")/.."
IN="${1:-finalv.mp4}"
OUT="${2:-REEL_final.mp4}"
FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")

# Temps des beats (timeline finale, en secondes) — À ADAPTER par réel.
"$FF" -y -i "$IN" \
  -i sfx/whoosh1.wav -i sfx/whoosh2.wav -i sfx/whoosh1.wav -i sfx/pop.wav -i sfx/pop.wav \
  -filter_complex "\
[1:a]aformat=channel_layouts=stereo:sample_rates=44100,adelay=19640|19640,volume=0.75[w1];\
[2:a]aformat=channel_layouts=stereo:sample_rates=44100,adelay=52180|52180,volume=0.85[w2];\
[3:a]aformat=channel_layouts=stereo:sample_rates=44100,adelay=67300|67300,volume=0.75[w3];\
[4:a]aformat=channel_layouts=stereo:sample_rates=44100,adelay=42500|42500,volume=0.6[p1];\
[5:a]aformat=channel_layouts=stereo:sample_rates=44100,adelay=74900|74900,volume=0.6[p2];\
[0:a][w1][w2][w3][p1][p2]amix=inputs=6:normalize=0:dropout_transition=0,alimiter=limit=0.95[aout]" \
  -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k "$OUT"
echo "OK -> $OUT"
