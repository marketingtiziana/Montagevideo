# -*- coding: utf-8 -*-
"""FYNOVATES — ART DIRECTION 01 · THE PRIVATE DEPARTURE

Builds the thumbnail as SVG (the master, editable), then renders the PNG from that SVG.
  python3 build.py            -> grades plates, writes both SVGs, renders PNG + 320x180 preview

Outputs (in output/private_departure/):
  thumbnail_private_departure.png             1280x720 final
  thumbnail_private_departure_editable.svg    self-contained SVG (images + fonts embedded, live text)
  thumbnail_private_departure_source/thumbnail_private_departure.svg   same SVG with linked assets
"""
import base64, os, subprocess, json
import numpy as np
from PIL import Image, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
A = lambda p: os.path.join(HERE, 'assets', p)

# ------------------------------------------------------------------ brand
NAVY, INK, WHITE = '#0D082D', '#0F0A13', '#FFFFFF'

# ------------------------------------------------------------------ editable parameters
HEADLINE = ['QUITTER', 'LA FRANCE ?']   # narrow no-break space before "?"
SUBLINE = 'AVANT DE PRENDRE VOTRE DÉCISION'
HEAD_X, HEAD_TOP, HEAD_WIDTH, HEAD_TRACK = 62, 150, 590, -0.022   # tracking in em
PORTRAIT = dict(x=604, y=22, h=1000)        # her cutout, aspect ratio locked
PASSPORT = dict(x=40, y=496, w=410, rot=-6)
PLATE = dict(x=-70, y=-40, w=1420)          # zoom/position of the terminal plate (height follows 16:9)


# ------------------------------------------------------------------ grading
def ramp(L, stops):
    out = np.zeros(L.shape + (3,))
    xs = [s[0] for s in stops]
    for c in range(3):
        out[..., c] = np.interp(L, xs, [s[1][c] for s in stops])
    return out


def grade_plate():
    """Flip (jet + runway move to the left, under the headline), then pull every warm material
    (timber ceiling, brass lamps) into the FYNOVATES navy scale while keeping texture."""
    im = Image.open(A('plate_private_terminal.jpg')).convert('RGB').transpose(Image.FLIP_LEFT_RIGHT)
    a = np.asarray(im).astype(float) / 255
    # 1) neutralise warm materials (timber, brass): desaturate warm hues, cool the rest slightly
    hsv = np.asarray(im.convert('HSV')).astype(float) / 255
    h, s = hsv[..., 0] * 360, hsv[..., 1]
    warm = ((h < 70) | (h > 320)).astype(float)
    L = a @ [0.2126, 0.7152, 0.0722]
    grey = np.repeat(L[..., None], 3, -1)
    keep = (1 - warm) * 0.85 + warm * 0.08          # saturation kept per pixel
    cool = grey + (a - grey) * keep[..., None]
    cool = cool * [0.96, 0.97, 1.06]                # gentle blue-hour bias
    # 2) anchor shadows and mids on the FYNOVATES navy ramp (35 %) without flattening the photo
    Lc = np.clip((L - 0.01) / 0.96, 0, 1) ** 1.1
    stops = [(0, (7, 5, 20)), (0.22, (13, 8, 45)), (0.55, (60, 62, 130)), (0.85, (190, 192, 228)), (1, (255, 255, 255))]
    mapped = ramp(Lc, stops) / 255
    g = 0.62 * cool + 0.38 * mapped
    Image.fromarray((np.clip(g, 0, 1) * 255).astype(np.uint8)).save(A('plate_private_terminal_graded.jpg'), quality=94)


def grade_passport():
    im = Image.open(A('passport_luxe_cutout.png')).convert('RGBA')
    a = np.asarray(im).astype(float)
    rgb, al = a[..., :3] / 255, a[..., 3:]
    L = rgb @ [0.2126, 0.7152, 0.0722]
    stops = [(0, (6, 4, 18)), (0.25, (16, 11, 52)), (0.55, (70, 64, 128)), (0.85, (168, 166, 198)), (1, (214, 213, 228))]
    g = 0.75 * ramp(L, stops) / 255 + 0.25 * rgb
    out = np.dstack([np.clip(g, 0, 1) * 255, al]).astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(A('passport_luxe_graded.png'))


# ------------------------------------------------------------------ typography metrics
def fit_size(text, font_file, width, track_em):
    f = ImageFont.truetype(os.path.join(HERE, 'fonts', font_file), 100)
    w100 = f.getlength(text) + track_em * 100 * (len(text) - 1)
    return width / w100 * 100


# ------------------------------------------------------------------ svg
def b64(path, mime):
    return f'data:{mime};base64,' + base64.b64encode(open(path, 'rb').read()).decode()


def svg(embed):
    def src(p, mime='image/png'):
        full = A(p)
        return b64(full, mime) if embed else 'assets/' + p

    def font(f):
        full = os.path.join(HERE, 'fonts', f)
        return b64(full, 'font/otf') if embed else 'fonts/' + f

    pimg = Image.open(A('portrait_cutout.png'))
    pw = PORTRAIT['h'] * pimg.width / pimg.height
    ppimg = Image.open(A('passport_luxe_graded.png'))
    pph = PASSPORT['w'] * ppimg.height / ppimg.width
    ph = PLATE['w'] * 9 / 16
    s1 = fit_size(HEADLINE[0], 'InterDisplay-ExtraBold.otf', HEAD_WIDTH, HEAD_TRACK)
    s2 = fit_size(HEADLINE[1], 'InterDisplay-ExtraBold.otf', HEAD_WIDTH, HEAD_TRACK)
    size = min(s1, s2)                       # same cap height on both lines
    cap = size * 0.727                       # Inter cap-height ratio
    y1 = HEAD_TOP + cap
    y2 = y1 + size * 0.98
    sub_y = y2 + 58
    sym = Image.open(A('logo_symbol_white.png')); wm = Image.open(A('logo_wordmark_white.png'))
    sym_h = 40; wm_h = 15; wm_w = wm_h * wm.width / wm.height
    px, py, ph_ = PORTRAIT['x'], PORTRAIT['y'], PORTRAIT['h']
    cx = PASSPORT['x'] + PASSPORT['w'] / 2; cy = PASSPORT['y'] + pph / 2

    return f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1280" height="720" viewBox="0 0 1280 720">
  <title>FYNOVATES — Quitter la France ? — The Private Departure</title>
  <defs>
    <style>
      @font-face {{ font-family: "FYN Display"; font-weight: 800; src: url("{font('InterDisplay-ExtraBold.otf')}"); }}
      @font-face {{ font-family: "FYN Display"; font-weight: 500; src: url("{font('InterDisplay-Medium.otf')}"); }}
      .head {{ font-family: "FYN Display", "Inter Display", Inter, "Helvetica Neue", sans-serif; font-weight: 800; fill: {WHITE}; }}
      .sub  {{ font-family: "FYN Display", "Inter Display", Inter, "Helvetica Neue", sans-serif; font-weight: 500; fill: {WHITE}; }}
    </style>
    <!-- readability: left side falls into navy, floor falls into near-black -->
    <linearGradient id="gLeft" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="{NAVY}" stop-opacity=".8"/>
      <stop offset=".34" stop-color="{NAVY}" stop-opacity=".45"/>
      <stop offset=".58" stop-color="{NAVY}" stop-opacity=".06"/>
      <stop offset=".7" stop-color="{NAVY}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="gFloor" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="{INK}" stop-opacity=".9"/>
      <stop offset=".3" stop-color="{INK}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="gTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{INK}" stop-opacity=".45"/>
      <stop offset=".2" stop-color="{INK}" stop-opacity="0"/>
    </linearGradient>
    <!-- blue-hour window light falling on her from the glass (left) -->
    <radialGradient id="gKey" cx="{px + pw*0.47}" cy="{py + ph_*0.24}" r="230" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity=".09"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset=".42" stop-color="{INK}" stop-opacity="0"/><stop offset=".74" stop-color="{INK}" stop-opacity=".55"/>
    </linearGradient>
    <linearGradient id="gSide" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="{NAVY}" stop-opacity=".34"/><stop offset=".45" stop-color="{NAVY}" stop-opacity="0"/>
    </linearGradient>
    <mask id="mSubject" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="{px}" y="{py}" width="{pw:.1f}" height="{ph_}">
      <image href="{src('portrait_cutout.png')}" x="{px}" y="{py}" width="{pw:.1f}" height="{ph_}"/>
    </mask>
    <filter id="fSubject" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="-26" dy="14" stdDeviation="22" flood-color="#030210" flood-opacity=".7"/>
    </filter>
    <filter id="fProp" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#030210" flood-opacity=".75"/>
    </filter>
    <filter id="fHead" x="-10%" y="-30%" width="120%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="14" flood-color="#05031a" flood-opacity=".45"/>
    </filter>
  </defs>

  <!-- 1 · BACKGROUND — private terminal at blue hour (generated plate, brand-graded) -->
  <g id="background">
    <rect width="1280" height="720" fill="{NAVY}"/>
    <image id="plate" href="{src('plate_private_terminal_graded.jpg', 'image/jpeg')}" x="{PLATE['x']}" y="{PLATE['y']}" width="{PLATE['w']}" height="{ph:.1f}" preserveAspectRatio="xMidYMid slice"/>
    <rect width="1280" height="720" fill="url(#gLeft)"/>
    <rect width="1280" height="720" fill="url(#gTop)"/>
    <rect width="1280" height="720" fill="url(#gFloor)"/>
  </g>

  <!-- 2 · SUBJECT — original photograph, cutout, aspect ratio locked -->
  <g id="portrait">
    <image href="{src('portrait_cutout.png')}" x="{px}" y="{py}" width="{pw:.1f}" height="{ph_}" filter="url(#fSubject)"/>
    <g mask="url(#mSubject)">
      <rect x="{px}" y="{py}" width="{pw:.1f}" height="{ph_}" fill="url(#gSide)"/>
      <rect x="{px}" y="{py}" width="{pw:.1f}" height="{ph_}" fill="url(#gBody)"/>
      <rect x="{px}" y="{py}" width="{pw:.1f}" height="{ph_}" fill="url(#gKey)" style="mix-blend-mode:screen"/>
    </g>
  </g>

  <!-- 3 · FOREGROUND — passport on the stone floor (generated, generic, no emblem / data) -->
  <g id="passport" filter="url(#fProp)">
    <image href="{src('passport_luxe_graded.png')}" x="{PASSPORT['x']}" y="{PASSPORT['y']}" width="{PASSPORT['w']}" height="{pph:.1f}" transform="rotate({PASSPORT['rot']} {cx:.1f} {cy:.1f})"/>
  </g>
  <rect y="600" width="560" height="120" fill="url(#gFloor)" opacity=".7"/>

  <!-- 4 · TYPOGRAPHY — live text -->
  <g id="headline" filter="url(#fHead)">
    <text class="head" x="{HEAD_X}" y="{y1:.1f}" font-size="{size:.2f}" letter-spacing="{HEAD_TRACK*size:.2f}">{HEADLINE[0]}</text>
    <text class="head" x="{HEAD_X}" y="{y2:.1f}" font-size="{size:.2f}" letter-spacing="{HEAD_TRACK*size:.2f}">{HEADLINE[1]}</text>
  </g>
  <g id="subline">
    <rect x="{HEAD_X+4}" y="{sub_y-24:.1f}" width="44" height="2" fill="{WHITE}"/>
    <text class="sub" x="{HEAD_X+4}" y="{sub_y+6:.1f}" font-size="16.5" letter-spacing="4.4" fill-opacity=".9">{SUBLINE}</text>
  </g>

  <!-- 5 · BRAND — original FYNOVATES symbol + wordmark (pixels from the supplied files) -->
  <g id="logo">
    <image href="{src('logo_symbol_white.png')}" x="62" y="42" width="{sym_h}" height="{sym_h}"/>
    <image href="{src('logo_wordmark_white.png')}" x="{62+sym_h+14}" y="{42+(sym_h-wm_h)/2:.1f}" width="{wm_w:.1f}" height="{wm_h}"/>
  </g>
</svg>
'''


def render(svg_path, png_path, preview_path):
    js = f"""
const {{ chromium }} = require('playwright');
(async () => {{
  const b = await chromium.launch();
  const p = await b.newPage({{ viewport: {{ width: 1280, height: 720 }}, deviceScaleFactor: 2 }});
  await p.goto('file://{svg_path}');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  await p.screenshot({{ path: '{png_path}.hi.png', clip: {{ x: 0, y: 0, width: 1280, height: 720 }} }});
  await b.close();
}})();"""
    subprocess.run(['node', '-e', js], check=True, cwd='/tmp')
    im = Image.open(png_path + '.hi.png').convert('RGB')
    os.remove(png_path + '.hi.png')
    final = im.resize((1280, 720), Image.LANCZOS)
    final.save(png_path, optimize=True)
    final.resize((320, 180), Image.LANCZOS).save(preview_path)


if __name__ == '__main__':
    grade_plate(); grade_passport()
    linked = os.path.join(HERE, 'thumbnail_private_departure.svg')
    embedded = os.path.join(OUT, 'thumbnail_private_departure_editable.svg')
    open(linked, 'w').write(svg(False))
    open(embedded, 'w').write(svg(True))
    render(embedded, os.path.join(OUT, 'thumbnail_private_departure.png'),
           os.path.join(HERE, 'previews', 'thumbnail_private_departure_320x180.png'))
    print('done', os.path.getsize(embedded) // 1024, 'KB svg')
