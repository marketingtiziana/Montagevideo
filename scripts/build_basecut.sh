#!/usr/bin/env bash
# Construit out/base_cut.mp4 (VIDÉO seule, frames exactes) + data/voice.wav (voix montée).
set -e
cd "$(dirname "$0")/.."
SRC=source/reel5.mp4
TMP=data/_segs
mkdir -p "$TMP"
rm -f "$TMP"/seg_*.mp4 "$TMP"/av_*.wav "$TMP"/vlist.txt "$TMP"/alist.txt

python3 - > "$TMP/segs.txt" <<'PY'
import json
e=json.load(open('data/edit.json')); fps=e['meta']['fps']
for i,s in enumerate(e['segments']):
    n=round(s['dur']*fps)
    print(i, f"{s['src_in']:.3f}", n)
PY

while read idx si n; do
  vout="$TMP/seg_${idx}.mp4"
  # VIDÉO : exactement n frames, aucun audio, pas de -shortest
  ffmpeg -nostdin -y -ss "$si" -i "$SRC" -frames:v "$n" -an \
    -vf "fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" \
    -c:v libx264 -preset veryfast -g 15 -pix_fmt yuv420p -crf 18 "$vout" >/dev/null 2>&1
  # AUDIO voix : durée = n/30, PCM pour concat propre
  adur=$(python3 -c "print(f'{$n/30:.4f}')")
  aout="$TMP/av_${idx}.wav"
  ffmpeg -nostdin -y -ss "$si" -i "$SRC" -t "$adur" -vn -ar 48000 -ac 1 -c:a pcm_s16le "$aout" >/dev/null 2>&1
  echo "file '$(basename "$vout")'" >> "$TMP/vlist.txt"
  echo "file '$(basename "$aout")'" >> "$TMP/alist.txt"
  nf=$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of default=nw=1:nk=1 "$vout")
  echo "seg $idx: si=$si want=$n got=$nf"
done < "$TMP/segs.txt"

ffmpeg -nostdin -y -f concat -safe 0 -i "$TMP/vlist.txt" -c copy out/base_cut.mp4 >/dev/null 2>&1
ffmpeg -nostdin -y -f concat -safe 0 -i "$TMP/alist.txt" -c copy data/voice.wav >/dev/null 2>&1

echo "=== base_cut.mp4 (video) ==="
ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames,r_frame_rate -of default=nw=1 out/base_cut.mp4
echo "=== voice.wav ==="
ffprobe -v error -show_entries format=duration -of default=nw=1 data/voice.wav
