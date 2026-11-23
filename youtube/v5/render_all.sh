#!/bin/bash
# Rend tous les graphismes (3 en parallèle). usage : bash render_all.sh [id ...]
cd "$(dirname "$0")"
ids="$@"; [ -z "$ids" ] && ids=$(python3 -c "import json;print(' '.join(x['id'] for x in json.load(open('build/gfx_manifest.json'))))")
for id in $ids; do echo $id; done | xargs -P 3 -I{} bash -c '
 dur=$(python3 -c "import json;m={x[\"id\"]:x for x in json.load(open(\"build/gfx_manifest.json\"))};print(m[\"{}\"][\"end\"]-m[\"{}\"][\"start\"])")
 rm -f build/gfx/{}/f*.png; node assets/render.js build/gfx/{}/index.html build/gfx/{} $dur 25 && echo "rendered {} $(ls build/gfx/{}/f*.png | wc -l)" || echo "FAILED {}"'
echo ALLDONE
