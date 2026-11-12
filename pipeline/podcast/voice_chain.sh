#!/usr/bin/env bash
# ÉTAPE 10 — Chaîne voix (une seule piste micro ici : pas de gate de diaphonie).
# highpass 80 Hz -> de-esser léger -> compresseur 3:1 (attaque 10 ms, release 120 ms) -> présence +2 dB à 3 kHz
# (bruit de fond mesuré à -56 dBFS : pas de afftdn). La normalisation -16 LUFS / -1 dBTP se fait sur le mix final.
IN=${1:-work/ep_clean.wav}; OUT=${2:-work/ep_voice.wav}
ffmpeg -v error -y -i "$IN" -af "highpass=f=80:poles=2,deesser=i=0.25:m=0.5:f=0.5:s=o,acompressor=threshold=-21dB:ratio=3:attack=10:release=120:knee=4:makeup=2,equalizer=f=3000:t=q:w=1.0:g=2" -ar 48000 -ac 2 -c:a pcm_s16le "$OUT"
