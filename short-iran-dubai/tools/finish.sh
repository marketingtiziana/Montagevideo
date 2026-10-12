#!/bin/bash
# Chaîne de finition exécutée dans le sandbox Higgsfield (après interpolation 60 fps des plans) :
# 1) lier les plans interpolés 2) build + render master 60 fps H.264 12M 3) projet 30 fps 10M 4) mux audio -14 LUFS
# 5) contact sheets 6) QA frames 7) PUT des livrables (URLs presignées fournies via uploads_final.tsv)
set -e
cd /home/user/proj
for f in /home/user/clips/i_k*.mp4; do b=$(basename $f); ln -sf $f clips/${b#i_}; done
ln -sf /home/user/clips/i_a380_taxi_916.mp4 clips/a380_taxi_916.mp4; ln -sf /home/user/clips/i_a380_aerial_916.mp4 clips/a380_aerial_916.mp4
ln -sf /home/user/clips/c_k20_slow.mp4 clips/k20_slow.mp4
HE_MODE=none higgsedit build edit.jsx
higgsedit render . --out renders/master60.mp4 --bitrate 12M --workers 3 --quality final
echo RENDER60_DONE
