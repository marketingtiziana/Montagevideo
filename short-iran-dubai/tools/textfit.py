#!/usr/bin/env python3
"""Auto-fit des écrans : Montserrat mesuré avec PIL (même police que le rendu).
Boîte de sécurité : largeur 840 px (x 120→960), hauteur 880 px (y 520→1400). Max 3 lignes, interligne 1,1.
Taille de départ 96 px titres / 56 px précisions ; pas de 4 px ; jamais couper un mot.
Sortie : JSON {screen: {size, lines[], width_px, height_px}}.
"""
import json, sys
from PIL import ImageFont

FONT_DIR = sys.argv[1]
BOX_W, BOX_H, MAXL, LH = 790, 880, 3, 1.1  # 840 px moins 2 x 24 px de flou d ombre

def font(weight, size):
    return ImageFont.truetype(f'{FONT_DIR}/Montserrat-{weight}.ttf', size)

def width(f, s):
    l, t, r, b = f.getbbox(s)
    return r - l

def wrap(f, words, maxw):
    lines, cur = [], []
    for w in words:
        trial = ' '.join(cur + [w])
        if cur and width(f, trial) > maxw:
            lines.append(' '.join(cur)); cur = [w]
        else:
            cur.append(w)
    if cur: lines.append(' '.join(cur))
    return lines

def fit(text, weight='ExtraBold', start=96, floor=40, maxlines=MAXL, maxw=BOX_W):
    words = text.split(' ')
    size = start
    while size >= floor:
        f = font(weight, size)
        if all(width(f, w) <= maxw for w in words):
            lines = wrap(f, words, maxw)
            if len(lines) <= maxlines:
                return {'size': size, 'lines': lines, 'width_px': max(width(f, l) for l in lines),
                        'height_px': round(len(lines) * size * LH)}
        size -= 4
    return None

if __name__ == '__main__':
    screens = json.load(open(sys.argv[2]))
    out = {}
    for s in screens:
        r = fit(s['text'], s.get('weight', 'ExtraBold'), s.get('start', 96))
        sub = fit(s['sub'], 'SemiBold', 28, 20, 2) if s.get('sub') else None
        out[s['id']] = {'title': r, 'sub': sub}
        print(s['id'], r['size'], r['lines'], r['width_px'], 'x', r['height_px'], '| sub', sub and sub['lines'])
    json.dump(out, open(sys.argv[3], 'w'), indent=1, ensure_ascii=False)
