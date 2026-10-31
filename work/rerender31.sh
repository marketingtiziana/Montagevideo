#!/bin/bash
set -e; cd /home/user/Montagevideo/work
rm -rf cut/front cut/behind
RESET=120 node scripts/render_overlay.js cut/behind.json behind cut/behind > render_behind.log 2>&1
RESET=120 node scripts/render_overlay.js cut/front.json front cut/front > render_front.log 2>&1
python3 scripts/check_layout.py > layout.log 2>&1
python3 -u scripts/pass3_composite.py final ../output/reel-final.mp4 > pass3.log 2>&1
python3 scripts/pass3_composite.py preview ../output/preview-frames sous-titre-1-mot=1395 card-devant=343 mot-geant-derriere=1196 b-roll-derriere=40 > preview.log 2>&1
echo RERENDER DONE
