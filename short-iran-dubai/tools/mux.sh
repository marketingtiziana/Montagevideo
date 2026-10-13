#!/bin/bash
# Normalisation -14 LUFS / TP -1 dBTP (loudnorm 2 passes) puis mux avec le master vidéo (faststart, AAC 192k)
# Usage : tools/mux.sh audio/mix_pre.wav renders/master60.mp4 renders/final60.mp4
set -e
PRE=$1; VID=$2; OUT=$3
M=$(ffmpeg -hide_banner -nostats -i "$PRE" -af loudnorm=I=-14:TP=-1:LRA=9:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
I=$(echo "$M" | jq -r .input_i); TP=$(echo "$M" | jq -r .input_tp); LRA=$(echo "$M" | jq -r .input_lra); TH=$(echo "$M" | jq -r .input_thresh); OFF=$(echo "$M" | jq -r .target_offset)
ffmpeg -v error -y -i "$PRE" -af "loudnorm=I=-14:TP=-1:LRA=9:measured_I=$I:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:offset=$OFF:linear=true:print_format=summary" -ar 48000 "${PRE%.wav}_norm.wav"
ffmpeg -v error -y -i "$VID" -i "${PRE%.wav}_norm.wav" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E 'I:|Peak:' | tail -2
