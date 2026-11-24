#!/bin/bash
# Rend les 7 shorts (2 en parallèle). usage : bash render_all_shorts.sh [--final]
cd "$(dirname "$0")"
MODE=${1:-}
echo short_01 short_02 short_03 short_04 short_05 short_06 short_07 | tr ' ' '\n' | xargs -P 2 -I{} bash -c "python3 engine.py {} $MODE > build/{}.log 2>&1 && echo DONE {} || echo FAILED {}"
echo ALLDONE
