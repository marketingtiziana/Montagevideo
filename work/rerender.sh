#!/bin/bash
set -e; cd /home/user/Montagevideo/work
node scripts/render_overlay.js cut/front.json front cut/front > render_front.log 2>&1
python3 scripts/check_layout.py > layout.log 2>&1
python3 -u scripts/pass3_composite.py final ../output/reel-final.mp4 > pass3.log 2>&1
python3 scripts/pass3_composite.py preview ../output/preview-frames sous-titre=765 card-devant-montant=1429 card-devant-liste=1831 card-devant-titre=433 effet-derriere-erreur=1196 effet-derriere-25000=112 effet-derriere-llc=2516 > preview.log 2>&1
echo RERENDER DONE
