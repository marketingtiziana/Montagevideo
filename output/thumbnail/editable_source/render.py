# -*- coding: utf-8 -*-
"""Render pipeline: node render.js (Chromium, x2 supersampling) -> Lanczos downscale to 1280x720 PNG
+ 320x180 mobile previews.   Usage: python3 render.py [A B C final]
"""
import os, sys, subprocess
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
PREV = os.path.join(HERE, 'previews'); os.makedirs(PREV, exist_ok=True)
names = sys.argv[1:] or ['A', 'B', 'C']
subprocess.run(['node', os.path.join(HERE, 'render.js'), *names], check=True, cwd='/tmp')
for c in names:
    tmp = os.path.join(PREV, f'_hi_{c}.png')
    im = Image.open(tmp).convert('RGB')
    final = im.resize((1280, 720), Image.LANCZOS)
    name = 'fynovates_thumbnail_final.png' if c == 'final' else f'fynovates_concept_{c}.png'
    final.save(os.path.join(OUT, name), optimize=True)
    final.resize((320, 180), Image.LANCZOS).save(os.path.join(PREV, f'{c}_320x180.png'))
    os.remove(tmp)
    print('saved', name, final.size)
