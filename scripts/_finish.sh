#!/bin/bash
set -e
# mux boosted audio into full-res silent render
ffmpeg -nostdin -y -i out/short_full_silent.mp4 -i data/audio_final.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/short_final.mp4
# web-compressed preview (smaller, for quick viewing/sending)
ffmpeg -nostdin -y -i out/short_final.mp4 -vf scale=608:1080 \
  -c:v libx264 -preset veryfast -crf 26 -pix_fmt yuv420p -c:a aac -b:a 128k out/short_apercu.mp4
echo "== durations =="
for f in out/short_full_silent.mp4 out/short_final.mp4 out/short_apercu.mp4; do
  d=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$f")
  echo "$f : $d s"
done
