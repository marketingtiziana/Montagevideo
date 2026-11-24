# -*- coding: utf-8 -*-
"""FYNOVATES thumbnail — asset preparation.

Builds, from the untouched originals in src_inputs/:
  assets/portrait_cutout.png   portrait with clean alpha (BiRefNet-portrait mask + colour decontamination)
  assets/logo_symbol_navy.png  official symbol (navy square, white F) cropped tight from the supplied file
  assets/logo_symbol_white.png official symbol (white square, navy F) cropped tight from the supplied file
  assets/logo_wordmark_white.png official wordmark, white letters keyed out of the supplied navy file
  assets/geo.json              SVG paths for France / Europe land (Natural Earth via world-atlas)

The logos are never redrawn: pixels come straight from the supplied files (crop / luminance key only).
To swap the portrait: put a new photo + mask in src_inputs and re-run (mask: `rembg -m birefnet-portrait`).
"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src_inputs')
OUT = os.path.join(HERE, 'assets')
os.makedirs(OUT, exist_ok=True)


# ---------------------------------------------------------------- portrait
def portrait():
    from pymatting import estimate_foreground_ml
    img = Image.open(os.path.join(SRC, 'portrait_original.jpg')).convert('RGB')
    m = Image.open(os.path.join(SRC, 'portrait_mask_birefnet.png')).convert('L')
    a = np.asarray(m).astype(np.float64) / 255.0
    # slight choke to drop the grey studio fringe, keep hair softness
    a = np.clip((a - 0.06) / 0.94, 0, 1) ** 1.15
    rgb = np.asarray(img).astype(np.float64) / 255.0
    # colour decontamination: recover true hair colour in semi-transparent pixels
    fg = estimate_foreground_ml(rgb, a)
    fg = np.clip(fg, 0, 1)
    # natural grade: gentle S-curve contrast, tiny warmth on skin, no smoothing
    x = fg
    x = x + 0.06 * (x - 0.5) * (1 - np.abs(2 * x - 1))       # soft contrast
    x = np.clip(x, 0, 1)
    x[..., 0] *= 1.01; x[..., 2] *= 0.99
    x = np.clip(x, 0, 1)
    out = np.dstack([x, a]) * 255
    Image.fromarray(out.astype(np.uint8), 'RGBA').save(os.path.join(OUT, 'portrait_cutout.png'))
    print('portrait ok', img.size)


# ---------------------------------------------------------------- logos
def bbox_where(mask):
    ys, xs = np.where(mask)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def logos():
    sym = Image.open(os.path.join(SRC, 'logo_symbol_variations.png')).convert('RGB')
    s = np.asarray(sym).astype(int)
    # panel 1 (white bg): navy square with white F -> crop tight on the navy square
    p1 = s[:, :415]
    x0, y0, x1, y1 = bbox_where((np.abs(p1 - [13, 8, 45]).sum(-1) < 30))
    sym.crop((x0, y0, x1, y1)).save(os.path.join(OUT, 'logo_symbol_navy.png'))
    # panel 3 (navy bg): white square with navy F -> crop tight on the white square
    p3 = s[:, 950:]
    x0, y0, x1, y1 = bbox_where(p3.min(-1) > 240)
    sym.crop((950 + x0, y0, 950 + x1, y1)).save(os.path.join(OUT, 'logo_symbol_white.png'))
    # wordmark: luminance key of white letters on the supplied navy file
    wm = np.asarray(Image.open(os.path.join(SRC, 'logo_wordmark_navy.png')).convert('RGB')).astype(float)
    bg = np.array([13, 8, 46], float)
    alpha = np.clip(((wm - bg) / (255 - bg)).mean(-1), 0, 1)
    rgba = np.zeros(wm.shape[:2] + (4,), np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = (alpha * 255).astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    im = im.crop(im.getbbox())
    im.save(os.path.join(OUT, 'logo_wordmark_white.png'))
    print('logos ok', im.size)


# ---------------------------------------------------------------- geography
def geo():
    js = r"""
const topo=require('/tmp/npmgeo/node_modules/world-atlas/countries-50m.json');
const tc=require('/tmp/npmgeo/node_modules/topojson-client');
const fc=tc.feature(topo, topo.objects.countries);
console.log(JSON.stringify(fc.features.map(f=>({id:f.id,name:f.properties.name,g:f.geometry}))));
"""
    feats = json.loads(subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True).stdout)
    K = np.cos(np.radians(46.5))

    def polys(g):
        if g is None: return []
        return g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]

    def proj(lon, lat, box, W, H):
        lo0, lo1, la0, la1 = box
        return ((lon - lo0) / (lo1 - lo0) * W, (la1 - lat) / (la1 - la0) * H)

    def path(rings, box, W, H, minpts=4):
        d = []
        for ring in rings:
            pts = [proj(x, y, box, W, H) for x, y in ring]
            if len(pts) < minpts: continue
            d.append('M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + 'Z')
        return ''.join(d)

    fr = next(f for f in feats if f['name'] == 'France')
    # metropolitan France + Corsica only (lon -6..10, lat 41..52)
    metro = [p for p in polys(fr['g']) if -6 < p[0][0][0] < 10 and 41 < p[0][0][1] < 52]
    # 1) France alone, tight box, aspect corrected
    box = (-5.3, 9.7, 41.2, 51.2)
    H = 1000; W = H * (box[1] - box[0]) * K / (box[3] - box[2])
    fr_d = path([r for p in metro for r in p[:1]], box, W, H)
    paris = proj(2.35, 48.86, box, W, H)
    out = {'france': {'w': round(W, 1), 'h': H, 'd': fr_d, 'paris': [round(paris[0], 1), round(paris[1], 1)]}}
    # 2) Western Europe land, France highlighted
    box = (-14.0, 34.0, 33.0, 62.0)
    H = 1000; W = H * (box[1] - box[0]) * K / (box[3] - box[2])
    land = []
    for f in feats:
        if f['name'] == 'France':
            continue
        for p in polys(f['g']):
            xs = [c[0] for c in p[0]]; ys = [c[1] for c in p[0]]
            if max(xs) < box[0] - 5 or min(xs) > box[1] + 5 or max(ys) < box[2] - 5 or min(ys) > box[3] + 5: continue
            land.append(p[0])
    out['europe'] = {'w': round(W, 1), 'h': H, 'land': path(land, box, W, H, 6),
                     'france': path([p[0] for p in metro], box, W, H),
                     'paris': [round(v, 1) for v in proj(2.35, 48.86, box, W, H)]}
    open(os.path.join(OUT, 'geo.js'), 'w').write('window.GEO=' + json.dumps(out) + ';')
    print('geo ok', {k: (v['w'], v['h']) for k, v in out.items()})


if __name__ == '__main__':
    which = sys.argv[1:] or ['portrait', 'logos', 'geo']
    for w in which:
        globals()[w]()
