#!/bin/bash
# Chaîne complète après modification de l'EDL
set -e; cd /home/user/Montagevideo/work
echo "== cut"; python3 scripts/cut.py
echo "== report"; python3 scripts/report.py
ffmpeg -v error -y -i cut/cut_audio.wav -ac 1 -ar 16000 cut/cut16k.wav
echo "== pass1 + transcribe (parallèle)"
python3 scripts/pass1_reframe.py > pass1.log 2>&1 &
P1=$!
python3 scripts/transcribe_novad.py cut/cut16k.wav cut/words_cut.json > transcribe3.log 2>&1
echo "== align"; python3 scripts/align.py > align.log 2>&1; grep -E "ALIGN|groups " align.log
echo "== fx"; python3 scripts/plan_fx.py > fx.log 2>&1
python3 -c "
import json
groups=json.load(open('cut/groups.json')); fx=json.load(open('cut/fx.json'))
json.dump({'duration':fx['duration'],'groups':groups,'cards':fx['cards']},open('cut/front.json','w'),ensure_ascii=False)
json.dump({'duration':fx['duration'],'behind':fx['behind']},open('cut/behind.json','w'),ensure_ascii=False)"
echo "== audio mix"; python3 scripts/audio_mix.py > mix.log 2>&1; tail -n2 mix.log
echo "== overlays"; rm -rf cut/front cut/behind
node scripts/render_overlay.js cut/front.json front cut/front > render_front.log 2>&1
node scripts/render_overlay.js cut/behind.json behind cut/behind > render_behind.log 2>&1
tail -n1 render_front.log render_behind.log
wait $P1; echo "== pass1:"; tail -n1 pass1.log
echo "== layout check"; python3 scripts/check_layout.py
echo "== masks (long)"; rm -rf cut/masks; python3 -u scripts/masks.py > masks.log 2>&1
echo "== ALL DONE"
