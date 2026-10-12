#!/usr/bin/env python3
"""Génère edit.jsx (Higgsedit, 1080x1920, 60 fps) à partir de build/screens.json, des mesures Montserrat (PIL)
et de build/map_paths.json. Toutes les positions de texte sont calculées ici (boîte de sécurité x 120→960, y 520→1400).

Usage : python3 -I tools/build_edit.py <fonts_dir> <out edit.jsx> [--fps 60] [--handle @x] [--cta "Commente PLAN B"]
"""
import json, sys, argparse, math
from PIL import ImageFont

ap = argparse.ArgumentParser()
ap.add_argument('fonts'); ap.add_argument('out')
ap.add_argument('--fps', type=int, default=60)
ap.add_argument('--handle', default='@fynovates')
ap.add_argument('--cta', default='Commente PLAN B')
ap.add_argument('--screens', default='build/screens.json')
ap.add_argument('--map', default='build/map_paths.json')
ap.add_argument('--layout-out', default='build/layout.json')
A = ap.parse_args()

W, H = 1080, 1920
BOX = dict(x0=120, x1=960, y0=520, y1=1400)
CX, CY = 540, 960
SHADOW_PAD = 24          # flou d'ombre 24 px : la boîte utile du texte est réduite d'autant
MAXW = BOX['x1'] - BOX['x0'] - 2 * SHADOW_PAD   # 792 px
LH = 1.1
ACC_T = '#D9822B'        # accent tension (ambre)
ACC_S = '#3EC1A8'        # accent solution (vert-bleu)
WHITE = '#FFFFFF'
BEAT = 60 / 90           # musique synthétisée à 90 BPM exactement
EASE = [0.2, 0.8, 0.2, 1]
ACT2_START = 28.0

screens = json.load(open(A.screens))
mapd = json.load(open(A.map))

# ---------- police / mesures ----------
_fc = {}
def font(weight, size):
    k = (weight, size)
    if k not in _fc: _fc[k] = ImageFont.truetype(f'{A.fonts}/Montserrat-{weight}.ttf', size)
    return _fc[k]
def adv(f, s): return f.getlength(s)
def ink(f, s):
    l, t, r, b = f.getbbox(s); return r - l

def wrap(f, words, maxw):
    lines, cur = [], []
    for w in words:
        trial = ' '.join(cur + [w])
        if cur and adv(f, trial) > maxw: lines.append(cur); cur = [w]
        else: cur.append(w)
    if cur: lines.append(cur)
    return lines

def fit(text, weight, start, floor=40, maxlines=3, maxw=MAXW):
    words = text.split(' '); size = start
    while size >= floor:
        f = font(weight, size)
        if all(adv(f, w) <= maxw for w in words):
            lines = wrap(f, words, maxw)
            if len(lines) <= maxlines: return size, lines
        size -= 4
    raise SystemExit(f'texte trop long, raccourcir : {text}')

def snap(t):
    """cale un temps sur la grille des demi-temps (0,333 s) si l'écart est ≤ 0,17 s"""
    g = BEAT / 2; q = round(t / g) * g
    return round(q, 3) if abs(q - t) <= 0.17 else round(t, 3)

# ---------- plans (B-roll) ----------
# clé -> (fichier, trimStart) ; durée utile = écran
PLAN = {
 's01': ('clips/k01.mp4', 0.0), 's02': ('clips/k02.mp4', 0.0), 's03': ('clips/k03.mp4', 0.0),
 's04': ('clips/a380_taxi_916.mp4', 1.0), 's05': ('clips/k33.mp4', 0.0), 's06': ('clips/k05.mp4', 0.0),
 's07': ('clips/k06.mp4', 0.0), 's08': ('clips/k07.mp4', 0.0), 's09': ('clips/k08.mp4', 0.0),
 's10': ('clips/k09.mp4', 0.0), 's11': ('clips/a380_aerial_916.mp4', 2.0), 's12': ('clips/k11.mp4', 0.0),
 's13': ('clips/k12.mp4', 0.0), 's14': ('clips/k13.mp4', 0.0), 's15': ('clips/k14.mp4', 0.0),
 's16': ('clips/k15.mp4', 0.0), 's17': ('clips/k16.mp4', 0.0), 's18': ('clips/k17.mp4', 0.0),
 's19': ('clips/k26.mp4', 0.0), 's20': ('clips/k19.mp4', 0.0), 's21': ('clips/k20_slow.mp4', 0.0),
}
AMBIANCE = {'fog': 'clips/k31.mp4', 'clouds': 'clips/k32.mp4'}
MOCK = {'board': 'mockups/board_black.mp4', 'hud': 'mockups/hud_black.mp4', 'alert': 'mockups/alert_black.mp4'}
ICONS = {'s12': 'globe', 's13': 'building', 's14': 'landmark', 's15': 'shield', 's16': 'calendar'}
SOLUTION_NUM = {'s12': 1, 's13': 2, 's14': 3, 's15': 4, 's16': 5}
COUNTERS = {'s02': dict(prefix='', to=150, suffix=' km'), 's07': dict(prefix='–', to=31, suffix=' %'),
            's10': dict(prefix='–', to=38, suffix=' %')}

GLSL = r"""vec4 pixel(vec2 uv){
  vec2 px = 1.0 / u_resolution;
  vec4 c = texture(u_src, uv);
  float r = texture(u_src, uv + vec2(u_ca * px.x, 0.0)).r;
  float b = texture(u_src, uv - vec2(u_ca * px.x, 0.0)).b;
  vec3 col = vec3(r, c.g, b);
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l), col, u_sat);
  col *= mix(vec3(1.0), vec3(0.88, 0.95, 1.08), u_cold * (1.0 - l));
  vec3 acc = vec3(u_accr, u_accg, u_accb);
  col = mix(col, col * acc * 1.15, u_tint * smoothstep(0.55, 1.0, l));
  col *= mix(vec3(1.0), vec3(1.06, 1.0, 0.94), u_warm);
  vec2 d = (uv - 0.5) * vec2(1.0, u_resolution.y / u_resolution.x);
  float rad = length(d) / 0.95;
  float vig = smoothstep(0.0, 1.0, rad) * u_vig;
  col *= (1.0 - u_dark) * (1.0 - vig);
  float n = fract(sin(dot(floor(uv * u_resolution) + vec2(u_time * 37.0, u_time * 91.0), vec2(12.9898, 78.233))) * 43758.5453);
  col += (n - 0.5) * u_grain;
  return vec4(clamp(col, 0.0, 1.0) * c.a, c.a);
}"""

def hex2rgb(h): return tuple(int(h[i:i+2], 16) / 255 for i in (1, 3, 5))

def grade_params(act2):
    ar, ag, ab = hex2rgb(ACC_S if act2 else ACC_T)
    return dict(sat=1.0 if act2 else 0.7, cold=0.0 if act2 else 0.35, vig=0.55, dark=0.35,
                warm=0.15 if act2 else 0.0, tint=0.18, grain=0.035, ca=0.0, accr=ar, accg=ag, accb=ab)

def js(v):
    return json.dumps(v, ensure_ascii=False)

# ---------- timeline ----------
S = []
for i, sc in enumerate(screens):
    t0 = snap(sc['in']); t1 = snap(sc['out'])
    S.append(dict(sc, t0=t0, t1=t1, dur=round(t1 - t0, 3), act2=t0 >= ACT2_START - 1e-6, idx=i))
TOTAL = S[-1]['t1']
IMPACTS = [0.0, 10.0, 12.0, 25.333, 28.0, 31.667, 35.333, 38.667, 42.333, 50.333]  # sub + vibration (acte 1 seulement)

out = []
P = out.append
P('// edit.jsx — généré par tools/build_edit.py (ne pas éditer à la main : relancer le générateur)')
P('export default async ({ project, icon }) => {')
P(f'  const p = await project({{ dir: ".", size: "1080x1920", fps: {A.fps}, background: "#0A0A0A" }});')
P('  const EB = await p.add("fonts/Montserrat-ExtraBold.ttf");')
P('  const SB = await p.add("fonts/Montserrat-SemiBold.ttf");')
files = sorted(set([v[0] for v in PLAN.values()] + list(AMBIANCE.values()) + list(MOCK.values())))
P('  const F = {};')
for f in files: P(f'  F[{js(f)}] = await p.add({js(f)});')
P(f'  const GLSL = {js(GLSL)};')
P('  const grade = (g) => [{ kind: "shader", params: Object.assign({ glsl: GLSL }, g) }];')
P('  const tryIcon = (name, o) => { try { return icon ? icon(name, o) : null; } catch (e) { return null; } };')
P(f'  const TOTAL = {TOTAL};')

layout = {}

# ---- plans : un compose par écran (média plein cadre + push-in 100→106 % + grade + transition) ----
for s in S:
    f, trim = PLAN[s['id']]
    d = s['dur']; whip = (s['idx'] % 3 == 2) and s['idx'] < len(S) - 1
    g = grade_params(s['act2'])
    kf = [dict(at=0, value=1.0), dict(at=round(d - 0.1, 3), value=1.06)]
    if whip:
        kf = [dict(at=0, value=1.0, easing='linear'), dict(at=round(d - 5 / A.fps - 0.001, 3), value=1.06, easing='ease-in'),
              dict(at=round(d - 1 / A.fps - 0.001, 3), value=1.32)]
    ca_track = ''
    imp = [t for t in IMPACTS if s['t0'] - 1e-6 <= t < s['t1'] - 0.2]
    if imp and not s['act2']:
        keys = [dict(at=0, value=0.0)]
        for t in imp:
            lt = round(t - s['t0'], 3)
            if lt > 0.02: keys.append(dict(at=round(lt - 0.01, 3), value=0.0))
            keys.append(dict(at=round(lt + 0.001, 3), value=1.5)); keys.append(dict(at=round(lt + 0.1, 3), value=0.0))
        keys = sorted({k['at']: k for k in keys}.values(), key=lambda k: k['at'])
        ca_track = f', {{ property: "effectParam", effectIndex: 0, effectParam: "ca", keyframes: {js(keys)} }}'
    P(f'  // plan {s["id"]} : {f}')
    P(f'  p.compose(<frame name="plan_{s["id"]}" layout="none" width={{1080}} height={{1920}} origin="center" '
      f'{"motionBlur={{ samples: 8, shutter: 0.6 }} " if whip else ""}'
      f'animate={{[{{ property: "scale", keyframes: {js(kf)} }}]}}>'
      f'<media file={{F[{js(f)}]}} x={{0}} y={{0}} width={{1080}} height={{1920}} fit="cover" trimStart={{{trim}}} '
      f'effects={{grade({js(g)})}}{(" animate={[" + ca_track[2:] + "]}") if ca_track else ""} /></frame>, '
      f'{{ at: {s["t0"]}, dur: {d}, name: "plan_{s["id"]}" }});')

# noir 4 frames + flash 2 frames sur « C'est ta structure. » (12,0 s)
P(f'  p.compose(<rect width={{1080}} height={{1920}} fill="#000000" />, {{ at: 12.0, dur: {round(4 / A.fps, 4)}, name: "black_12" }});')
P(f'  p.compose(<rect width={{1080}} height={{1920}} fill="#FFFFFF" animate={{[{{ property: "opacity", from: 0.9, to: 0.0, duration: {round(2 / A.fps, 4)} }}]}} />, {{ at: {round(12.0 + 4 / A.fps, 4)}, dur: {round(2 / A.fps, 4)}, name: "flash_12" }});')

# ---- VFX acte tension ----
# carte du Golfe (s02) : contours réels tracés 1,2 s, pin Dubaï qui pulse, ligne Dubaï ↔ côte, grille HUD en parallaxe
s02 = S[1]
dx, dy = mapd['dubai_px']; ix, iy = mapd['iran_coast_px']
P(f'  p.compose(<frame layout="none" width={{1080}} height={{1920}} motion={{{{ exit: {{ to: {{ opacity: 0 }}, duration: 0.2, anchor: "end" }} }}}}>')
P(f'    <media file={{F[{js(MOCK["hud"])}]}} x={{0}} y={{0}} width={{1080}} height={{1920}} fit="cover" blendMode="screen" opacity={{0.35}} animate={{[{{ property: "offsetY", from: 10, to: -10, duration: {s02["dur"]}, easing: "linear" }}]}} />')
for name, dpath in mapd['paths'].items():
    main = name in ('Iran', 'United Arab Emirates')
    P(f'    <frame layout="none" x={{0}} y={{0}} width={{1080}} height={{1920}} clip reveal={{{{ from: "left", at: 0.05, duration: 1.2, easing: "ease-out" }}}}>'
      f'<path d={js(dpath)} x={{0}} y={{0}} width={{1080}} height={{1920}} stroke={{{{ color: "#FFFFFF", width: {3 if main else 1.5}, cap: "round" }}}} opacity={{{1.0 if main else 0.45}}} shadow={{{{ x: 0, y: 8, blur: 32, color: "#00000073" }}}} /></frame>')
# ligne Dubaï -> côte iranienne (tracée 0,5 s après la carte)
P(f'    <frame layout="none" x={{0}} y={{0}} width={{1080}} height={{1920}} clip reveal={{{{ from: "bottom", at: 1.25, duration: 0.5, easing: "ease-out" }}}}>'
  f'<path d="M{dx} {dy} L{ix} {iy}" x={{0}} y={{0}} width={{1080}} height={{1920}} stroke={{{{ color: "{ACC_T}", width: 4, cap: "round" }}}} dash={{[14, 10]}} /></frame>')
# pin Dubaï : cercle (4 courbes de Bézier) qui pulse
def circle_path(cx, cy, r):
    k = 0.5523 * r
    return (f'M{cx + r} {cy} C{cx + r} {cy + k} {cx + k} {cy + r} {cx} {cy + r} C{cx - k} {cy + r} {cx - r} {cy + k} {cx - r} {cy} '
            f'C{cx - r} {cy - k} {cx - k} {cy - r} {cx} {cy - r} C{cx + k} {cy - r} {cx + r} {cy - k} {cx + r} {cy} Z')
P(f'    <frame layout="none" x={{{dx - 30}}} y={{{dy - 30}}} width={{60}} height={{60}} origin="center" at={{1.1}} '
  f'animate={{[{{ property: "scale", keyframes: [{{ at: 0, value: 0.6 }}, {{ at: 0.35, value: 1.25 }}, {{ at: 0.7, value: 0.9 }}, {{ at: 1.05, value: 1.2 }}, {{ at: 1.4, value: 1.0 }}] }}]}}>'
  f'<path d={js(circle_path(30, 30, 11))} x={{0}} y={{0}} width={{60}} height={{60}} fill="{ACC_T}" />'
  f'<path d={js(circle_path(30, 30, 24))} x={{0}} y={{0}} width={{60}} height={{60}} stroke={{{{ color: "{ACC_T}", width: 2 }}}} opacity={{0.6}} /></frame>')
P(f'  </frame>, {{ at: {s02["t0"]}, dur: {s02["dur"]}, name: "vfx_map" }});')

# balayage radar 1 fois + tableau des départs (s03) + bandeau d'alerte (s03-s04)
s03 = S[2]; s04 = S[3]
P(f'  p.compose(<frame layout="none" width={{1080}} height={{1920}} motion={{{{ enter: {{ from: {{ opacity: 0 }}, duration: 0.25 }}, exit: {{ to: {{ opacity: 0 }}, duration: 0.2, anchor: "end" }} }}}}>'
  f'<media file={{F[{js(MOCK["board"])}]}} x={{0}} y={{0}} width={{1080}} height={{1920}} fit="cover" blendMode="screen" opacity={{0.32}} effects={{[{{ kind: "layer-blur", params: {{ radius: 2 }} }}]}} />'
  f'</frame>, {{ at: {s03["t0"]}, dur: {s03["dur"]}, name: "vfx_board" }});')
P(f'  p.compose(<media file={{F[{js(MOCK["hud"])}]}} x={{0}} y={{0}} width={{1080}} height={{1920}} fit="cover" blendMode="screen" opacity={{0.22}} trimStart={{1.0}} />, {{ at: {s04["t0"]}, dur: {min(2.0, s04["dur"])}, name: "vfx_radar" }});')
P(f'  p.compose(<media file={{F[{js(MOCK["alert"])}]}} x={{0}} y={{0}} width={{1080}} height={{1920}} fit="cover" blendMode="screen" opacity={{0.9}} />, {{ at: {s03["t0"]}, dur: {round(s04["t1"] - s03["t0"], 3)}, name: "vfx_alert" }});')
# light leak froid 1 fois (s05)
s05 = S[4]
P(f'  p.compose(<rect width={{1400}} height={{1400}} x={{-700}} y={{200}} fill={{{{ kind: "radial", stops: [{{ offset: 0, color: "#9FC9FF", opacity: 0.45 }}, {{ offset: 0.6, color: "#9FC9FF", opacity: 0.0 }}] }}}} blendMode="screen" '
  f'animate={{[{{ property: "offsetX", from: 0, to: 1500, duration: {s05["dur"]}, easing: "linear" }}, {{ property: "opacity", keyframes: [{{ at: 0, value: 0 }}, {{ at: 0.4, value: 0.8 }}, {{ at: {round(s05["dur"] - 0.3, 3)}, value: 0.8 }}, {{ at: {round(s05["dur"] - 0.02, 3)}, value: 0 }}] }}]}} />, '
  f'{{ at: {s05["t0"]}, dur: {s05["dur"]}, name: "vfx_leak" }});')
# nuages abstraits en surimpression (s11, question fiscale) + brume (s01 hook) — ambiance Higgsfield abstraite
s01 = S[0]; s11 = S[10]
P(f'  p.compose(<media file={{F[{js(AMBIANCE["fog"])}]}} x={{0}} y={{0}} width={{1080}} height={{1920}} fit="cover" blendMode="screen" opacity={{0.22}} />, {{ at: {s01["t0"]}, dur: {s01["dur"]}, name: "amb_fog" }});')
P(f'  p.compose(<media file={{F[{js(AMBIANCE["clouds"])}]}} x={{0}} y={{0}} width={{1080}} height={{1920}} fit="cover" blendMode="screen" opacity={{0.18}} />, {{ at: {s11["t0"]}, dur: {s11["dur"]}, name: "amb_clouds" }});')
# ---- VFX acte solution : particules lentes 20 %, light sweep chaud 1 fois (s12)
s12 = S[11]
P(f'  p.compose(<frame layout="none" width={{1080}} height={{1920}} opacity={{0.2}}>')
import random
rnd = random.Random(12)
for k in range(14):
    x = rnd.randint(140, 940); y = rnd.randint(300, 1700); r = rnd.choice([3, 4, 5, 6]); dur = rnd.uniform(8, 14)
    P(f'    <path d={js(circle_path(r, r, r))} x={{{x}}} y={{{y}}} width={{{2*r}}} height={{{2*r}}} fill="#FFFFFF" animate={{[{{ property: "offsetY", from: 0, to: {-rnd.randint(120, 260)}, duration: {round(dur,2)}, easing: "linear", repeat: 3 }}, {{ property: "offsetX", from: 0, to: {rnd.randint(-40, 40)}, duration: {round(dur,2)}, easing: "linear", repeat: 3 }}]}} />')
P(f'  </frame>, {{ at: {ACT2_START}, dur: {round(TOTAL - ACT2_START, 3)}, name: "vfx_particles" }});')
P(f'  p.compose(<rect width={{520}} height={{2400}} x={{-600}} y={{-240}} fill={{{{ kind: "linear", angle: 90, stops: [{{ offset: 0, color: "#FFE2B0", opacity: 0 }}, {{ offset: 0.5, color: "#FFE2B0", opacity: 0.35 }}, {{ offset: 1, color: "#FFE2B0", opacity: 0 }}] }}}} blendMode="screen" rotation={{18}} '
  f'animate={{[{{ property: "offsetX", from: 0, to: 2200, duration: {s12["dur"]}, easing: "ease-in-out" }}]}} />, {{ at: {s12["t0"]}, dur: {s12["dur"]}, name: "vfx_sweep" }});')

# ---- barre de progression 4 px (haut) ----
P(f'  p.compose(<frame layout="none" x={{0}} y={{0}} width={{1}} height={{4}} background="#FFFFFF" opacity={{0.6}} animate={{[{{ property: "width", from: 1, to: 1080, duration: {TOTAL}, easing: "linear" }}]}} />, {{ at: 0, dur: {TOTAL}, name: "progress" }});')

# ---------- texte cinétique ----------
def text_node(txt, x, y, w, h, size, weight, color, extra=''):
    face = 'EB' if weight == 'ExtraBold' else 'SB'
    return (f'<text x={{{x}}} y={{{y}}} width={{{w}}} height={{{h}}} fontSize={{{size}}} lineHeight={{1.0}} color="{color}" align="left" '
            f'typography={{{{ fontAssetId: {face}.id }}}} shadow={{{{ x: 0, y: 6, blur: 24, color: "#00000066" }}}} {extra}>{txt}</text>')

for s in S:
    sid = s['id']; d = s['dur']; acc = ACC_S if s['act2'] else ACC_T
    weight = 'ExtraBold'
    size, lines = fit(s['text'], weight, s.get('start', 96))
    f = font(weight, size)
    # géométrie du bloc
    line_h = round(size * LH)
    sub = s.get('sub')
    if sid == 's21': sub = A.cta
    sub_h = (28 + 12) if sub else 0
    num = SOLUTION_NUM.get(sid)
    head_h = (120 + 14 + 176 + 12) if num else 0
    cta_extra = (44 + 16 + 40 + 16) if sid == 's21' else 0   # handle + flèche
    block_h = head_h + len(lines) * line_h + (12 + sub_h if sub else 0) + cta_extra
    top = CY - block_h / 2
    assert BOX['y0'] + SHADOW_PAD <= top and top + block_h <= BOX['y1'] - SHADOW_PAD, f'{sid} hors boîte verticale ({block_h}px)'
    words_out = []
    P(f'  // écran {sid} : {s["text"]}')
    root_anim = ''
    vib = [t for t in IMPACTS if s['t0'] - 1e-6 <= t < s['t1'] - 0.3] if not s['act2'] else []
    tracks = []
    if vib:
        keys = [dict(at=0, value=0)]
        for t in vib:
            lt = round(t - s['t0'], 3)
            for k in range(7):
                keys.append(dict(at=round(lt + k / A.fps + 0.0005, 4), value=(1 if k % 2 == 0 else -1) if k < 6 else 0))
        keys = sorted({k['at']: k for k in keys}.values(), key=lambda k: k['at'])
        tracks.append(f'{{ property: "offsetX", keyframes: {js(keys)} }}')
    if sid == 's01':  # scintillement d'opacité sur le hook
        tracks.append('{ property: "opacity", keyframes: [{ at: 0.35, value: 1 }, { at: 0.42, value: 0.82 }, { at: 0.47, value: 1 }, { at: 0.9, value: 1 }, { at: 0.95, value: 0.88 }, { at: 1.0, value: 1 }] }')
    if tracks: root_anim = f' animate={{[{", ".join(tracks)}]}}'
    P(f'  p.compose(<frame name="txt_{sid}" layout="none" width={{1080}} height={{1920}} motion={{{{ exit: {{ to: {{ opacity: 0 }}, duration: 0.2, anchor: "end" }} }}}}{root_anim}>')
    y = top
    # carte « verre » (solutions) et carte CTA
    if num:
        P(f'    <frame layout="none" x={{{BOX["x0"]}}} y={{{round(top - 40)}}} width={{840}} height={{{round(block_h + 80)}}} background="#FFFFFF14" radius={{32}} origin="center" '
          f'motion={{{{ enter: {{ from: {{ y: 60, opacity: 0, scale: 0.96 }}, duration: 0.5, easing: {{ kind: "spring", stiffness: 300, damping: 22 }} }} }}}} shadow={{{{ x: 0, y: 8, blur: 32, color: "#00000073" }}}} />')
        ic = ICONS[sid]
        P(f'    <frame layout="none" x={{{CX - 60}}} y={{{round(y)}}} width={{120}} height={{120}} origin="center" motion={{{{ enter: {{ from: {{ scale: 0.6, opacity: 0 }}, duration: 0.45, easing: {{ kind: "spring", stiffness: 300, damping: 22 }} }} }}}}>'
          f'{{tryIcon("{ic}", {{ size: 120, color: "{acc}", strokeWidth: 1.5 }})}}</frame>')
        y += 120 + 14
        nf = font('ExtraBold', 160); nw = adv(nf, str(num)) + 8
        P(f'    <frame layout="none" x={{{round(CX - 100)}}} y={{{round(y - 12)}}} width={{200}} height={{200}} origin="center" clip reveal={{{{ from: "left", at: 0.1, duration: 0.3 }}}}>'
          f'<path d={js(circle_path(100, 100, 92))} x={{0}} y={{0}} width={{200}} height={{200}} stroke={{{{ color: "{acc}", width: 4 }}}} /></frame>')
        P(f'    <frame layout="none" x={{{round(CX - nw/2)}}} y={{{round(y)}}} width={{{round(nw)}}} height={{176}} origin="center" motion={{{{ enter: {{ from: {{ scale: 1.3, opacity: 0 }}, duration: 0.3, easing: {{ kind: "spring", stiffness: 300, damping: 22 }} }} }}}}>'
          + text_node(str(num), 0, 0, round(nw), 176, 160, 'ExtraBold', acc) + '</frame>')
        P(f'    <frame layout="none" x={{{CX + 76}}} y={{{round(y + 8)}}} width={{64}} height={{64}} origin="center" at={{{round(d - 0.45, 3)}}} motion={{{{ enter: {{ from: {{ scale: 0.4, opacity: 0 }}, duration: 0.25, easing: {{ kind: "spring", stiffness: 300, damping: 22 }} }} }}}}>'
          f'{{tryIcon("check", {{ size: 64, color: "{acc}", strokeWidth: 3 }})}}</frame>')
        y += 176 + 12
    if sid == 's21':
        P(f'    <frame layout="none" x={{0}} y={{{round(top - 120)}}} width={{1080}} height={{{round(block_h + 240)}}} background="{ACC_S}" opacity={{0.92}} '
          f'motion={{{{ enter: {{ from: {{ y: 900, opacity: 0 }}, duration: 0.6, easing: {{ kind: "spring", stiffness: 300, damping: 22 }} }} }}}} />')
    # mots
    wi = 0
    stagger = BEAT / 4 if d >= 2.6 else 0.1
    for li, lw in enumerate(lines):
        space = adv(f, ' ')
        widths = [adv(f, w) for w in lw]
        line_w = sum(widths) + space * (len(lw) - 1)
        x = CX - line_w / 2
        for wj, w in enumerate(lw):
            ww = widths[wj]; is_acc = (w.strip('.,?!') in s['accent'] and s['accent'] != '') or (s['accent'] and w in s['accent'].split(' ') and len(s['accent'].split(' ')) > 1 and w in s['accent'])
            delay = round(min(wi * stagger, max(d - 0.6, 0.3)), 3)
            color = acc if is_acc else WHITE
            bw = round(ww + 14); bh = round(size * 1.25)
            inner = text_node(w, 0, 0, bw, bh, size, weight, color)
            cnt = COUNTERS.get(sid)
            if is_acc and cnt and sid in COUNTERS and w == lw[-1] and li == len(lines) - 1 and False:
                pass
            # entrée mot par mot sur beat : scale 1.3→1 + opacité (0,2 s), easing cubic-bezier(0.2,0.8,0.2,1)
            P(f'    <frame name="w_{sid}_{wi}" layout="none" x={{{round(x, 1)}}} y={{{round(y)}}} width={{{bw}}} height={{{bh}}} origin="center" at={{{delay}}} '
              f'motion={{{{ enter: {{ from: {{ scale: 1.3, opacity: 0 }}, duration: 0.2, easing: {js(EASE)} }} }}}}>{inner}</frame>')
            if is_acc:
                # soulignement qui se trace 0,25 s
                P(f'    <frame layout="none" x={{{round(x, 1)}}} y={{{round(y + size * 1.06)}}} width={{{round(ww)}}} height={{6}} clip reveal={{{{ from: "left", at: {round(delay + 0.15, 3)}, duration: 0.25 }}}}>'
                  f'<rect width={{{round(ww)}}} height={{6}} fill="{acc}" radius={{3}} /></frame>')
            words_out.append(dict(word=w, x=round(x, 1), y=round(y), w=bw, h=bh, accent=is_acc, delay=delay))
            x += ww + space; wi += 1
        y += line_h
    # compteur (150 km / –31 % / –38 %) : le mot accent est remplacé par un compteur 0,6 s puis claque 1,08→1
    cnt = COUNTERS.get(sid)
    if cnt:
        tgt = [wo for wo in words_out if wo['accent']]
        if tgt:
            # on masque les mots accent statiques en les faisant entrer après 0,6 s et on superpose le compteur avant
            pass
    # sous-titre (28 px SemiBold) centré sous le titre
    if sub:
        y += 12
        sf_ = font('SemiBold', 28); sw = adv(sf_, sub) + 20
        assert sw <= MAXW, f'sous-titre trop long {sid}'
        P(f'    <frame layout="none" x={{{round(CX - sw/2)}}} y={{{round(y)}}} width={{{round(sw)}}} height={{40}} at={{{round(min(0.5, d/3), 3)}}} motion={{{{ enter: {{ from: {{ y: 10, opacity: 0 }}, duration: 0.3, easing: {js(EASE)} }} }}}}>'
          + text_node(sub, 0, 0, round(sw), 40, 28, 'SemiBold', '#E6E6E6' if sid != 's21' else '#0A0A0A',
                      extra='animate={[{ property: "opacity", keyframes: [{ at: 0, value: 1 }, { at: 0.5, value: 0.55 }, { at: 1.0, value: 1 }, { at: 1.5, value: 0.55 }, { at: 2.0, value: 1 }] }]}' if sid == 's21' else '') + '</frame>')
        words_out.append(dict(word=sub, x=round(CX - sw/2), y=round(y), w=round(sw), h=40, accent=False, delay=0.5, sub=True))
        y += sub_h
    if sid == 's21':
        y += 16
        hf_ = font('SemiBold', 36); hw = adv(hf_, A.handle) + 20
        P(f'    <frame layout="none" x={{{round(CX - hw/2)}}} y={{{round(y)}}} width={{{round(hw)}}} height={{44}} at={{0.6}} motion={{{{ enter: {{ from: {{ y: 10, opacity: 0 }}, duration: 0.3 }} }}}}>'
          + text_node(A.handle, 0, 0, round(hw), 44, 36, 'SemiBold', '#0A0A0A') + '</frame>')
        words_out.append(dict(word=A.handle, x=round(CX - hw/2), y=round(y), w=round(hw), h=44, accent=False, delay=0.6, sub=True))
        y += 44 + 16
        P(f'    <frame layout="none" x={{{CX - 20}}} y={{{round(y)}}} width={{40}} height={{40}} origin="center" at={{0.8}} animate={{[{{ property: "offsetY", keyframes: [{{ at: 0, value: 0 }}, {{ at: 0.4, value: 8 }}, {{ at: 0.8, value: 0 }}], repeat: 3 }}]}}>'
          f'{{tryIcon("arrow-down", {{ size: 40, color: "#0A0A0A", strokeWidth: 3 }})}}</frame>')
    P(f'  </frame>, {{ at: {s["t0"]}, dur: {d}, name: "txt_{sid}" }});')
    layout[sid] = dict(size=size, lines=[' '.join(l) for l in lines], words=words_out, t0=s['t0'], t1=s['t1'], block_h=round(block_h), top=round(top))

# ---- compteurs (superposés) ----
for sid, cnt in COUNTERS.items():
    s = next(x for x in S if x['id'] == sid); lay = layout[sid]
    tgt = [w for w in lay['words'] if w['accent'] and not w.get('sub')]
    if not tgt: continue
    acc = ACC_S if s['act2'] else ACC_T
    x0 = min(w['x'] for w in tgt); x1 = max(w['x'] + w['w'] for w in tgt); y0 = tgt[0]['y']; h = tgt[0]['h']
    delay = tgt[0]['delay']; size = lay['size']
    # le compteur occupe exactement la place des mots accent pendant 0,6 s puis claque ; les mots accent entrent ensuite
    P(f'  p.compose(<frame layout="none" width={{1080}} height={{1920}}>'
      f'<frame name="cnt_{sid}" layout="none" x={{{x0}}} y={{{y0}}} width={{{round(x1 - x0)}}} height={{{h}}} origin="center" at={{{delay}}} duration={{{round(0.62, 3)}}} '
      f'motion={{{{ timeline: {{ duration: 0.6, easing: "linear", targets: [{{ target: "cv_{sid}", counter: {{ from: 0, to: {cnt["to"]}, decimals: 0, prefix: {js(cnt["prefix"])}, suffix: {js(cnt["suffix"])} }} }}] }} }}}}>'
      f'<frame name="cv_{sid}" layout="none" x={{0}} y={{0}} width={{{round(x1 - x0)}}} height={{{h}}}>'
      + text_node(cnt['prefix'] + str(cnt['to']) + cnt['suffix'], 0, 0, round(x1 - x0), h, size, 'ExtraBold', acc) +
      f'</frame></frame></frame>, {{ at: {s["t0"]}, dur: {round(delay + 0.62, 3)}, name: "cnt_{sid}" }});')
    layout[sid]['counter'] = dict(x=x0, y=y0, w=round(x1 - x0), h=h, delay=delay)

P('  const MODE = (globalThis.process && process.env && process.env.HE_MODE) || "none";')
P('  if (MODE === "draft") await p.render("renders/draft.mp4", { draft: true });')
P(f'  if (MODE === "master") await p.render("renders/master{A.fps}.mp4", {{ bitrate: {12_000_000 if A.fps == 60 else 10_000_000} }});')
P('};')

open(A.out, 'w').write('\n'.join(out) + '\n')
json.dump(dict(screens=layout, total=TOTAL, fps=A.fps, box=BOX, handle=A.handle, cta=A.cta), open(A.layout_out, 'w'), indent=1, ensure_ascii=False)
print('edit.jsx écrit :', A.out, '| durée', TOTAL, 's |', len(S), 'écrans')
for sid, l in layout.items():
    print(sid, l['size'], 'px', l['lines'], 'bloc', l['block_h'], 'px top', l['top'])
