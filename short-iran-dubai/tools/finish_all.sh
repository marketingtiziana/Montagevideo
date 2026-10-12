#!/bin/bash
# Finition dans le sandbox : masters 60/30 fps, mux audio, contact sheets, QA frames, PUT livrables.
set -e
B=/home/user/bundle23/bundle23
cd /home/user/proj
for f in /home/user/clips/i_k*.mp4; do b=$(basename $f); ln -sf $f clips/${b#i_}; done
ln -sf /home/user/clips/i_a380_taxi_916.mp4 clips/a380_taxi_916.mp4; ln -sf /home/user/clips/i_a380_aerial_916.mp4 clips/a380_aerial_916.mp4
ln -sf /home/user/clips/c_k20_slow.mp4 clips/k20_slow.mp4
cp $B/edit.jsx .; HE_MODE=none higgsedit build edit.jsx
higgsedit render . --out renders/master60.mp4 --bitrate 12M --workers 4 --quality final; echo RENDER60_DONE $(date +%T)
# contact sheets : écrans (mi-écran) + transitions (±2 frames autour des coupes)
higgsedit sheet . --times 1.5,4.3,6.8,9,11,13,15.3,18.2,21,23.8,26.6,29.8,33.4,37,40.6,44.2,47.2,49.4,51.2,53.2,56.4 --cols 7 --out renders/contact_sheet_screens.png
higgsedit sheet . --times 2.97,3.03,5.64,5.70,7.97,8.03,9.97,10.03,11.97,12.07,12.1,13.97,14.03,16.64,16.70,19.64,19.70,22.30,22.37,25.30,25.37,27.97,28.03,31.64,31.70,35.30,35.37,38.64,38.70,42.30,42.37,45.97,46.03,48.30,48.37,50.30,50.37,51.97,52.03,54.64,54.70 --cols 8 --out renders/contact_sheet_transitions.png
# projet 30 fps
mkdir -p /home/user/proj30/renders && cd /home/user/proj30 && rm -rf clips fonts mockups && cp -r /home/user/proj/clips /home/user/proj/fonts /home/user/proj/mockups . && cp $B/fps30/edit.jsx . && HE_MODE=none higgsedit build edit.jsx
higgsedit render . --out renders/master30.mp4 --bitrate 10M --workers 4 --quality final; echo RENDER30_DONE $(date +%T)
# mux audio (mix déjà normalisé -14 LUFS / TP -1)
cd /home/user/proj
for v in 60 30; do src=/home/user/proj/renders/master60.mp4; [ $v = 30 ] && src=/home/user/proj30/renders/master30.mp4
  ffmpeg -v error -y -i $src -i $B/audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart renders/final$v.mp4
  ffmpeg -hide_banner -nostats -i renders/final$v.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E '^\s+I:|Peak:' | tail -2
done
# contact sheet des plans (brand safety) : 1 frame par plan source
cd /home/user/clips && ffmpeg -v error -y $(for n in k01 k02 k03 k05 k06 k07 k08 k09 k10 k11 k12 k13 k14 k15 k16 k17 k19 k26 k31 k32 k33 a380_taxi_916 a380_aerial_916; do printf -- "-ss 2 -i i_$n.mp4 "; done) -filter_complex "$(for i in $(seq 0 22); do printf "[%d:v]scale=180:320[v%d];" $i $i; done)$(for i in $(seq 0 22); do printf "[v%d]" $i; done)xstack=inputs=23:layout=$(python3 -c "print('|'.join(f'{(i%8)*180}_{(i//8)*320}' for i in range(23)))"):fill=black" -frames:v 1 /home/user/proj/renders/contact_sheet_plans.png
# QA frames (statique > 1 s, strobing, 0,25x)
cd /home/user/proj && python3 $B/tools/qa_frames.py renders/final60.mp4 renders/qa 8.0 14.0 31.667 | tee renders/qa_frames.txt
# PUT livrables
P=$B/puts_final.sh; chmod +x $P
$P final60.mp4 renders/final60.mp4; $P final30.mp4 renders/final30.mp4
$P contact_sheet_screens.png renders/contact_sheet_screens.png; $P contact_sheet_transitions.png renders/contact_sheet_transitions.png; $P contact_sheet_plans.png renders/contact_sheet_plans.png
$P board.mov /home/user/bundle/mockups/out/board.mov; $P hud.mov /home/user/bundle/mockups/out/hud.mov; $P alert.mov /home/user/bundle/mockups/out/alert.mov
cd /home/user/proj/renders && zip -q -r livraison.zip contact_sheet_*.png qa final60.mp4 final30.mp4 && $P livraison.zip livraison.zip
echo FINISH_ALL_DONE $(date +%T)
