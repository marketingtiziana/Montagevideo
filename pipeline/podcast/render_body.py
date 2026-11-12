"""Rendu du corps de l'épisode à partir de l'EDL (multicam simulé par recadrage du plan large 4K).
  * chaque plan est découpé en « unités » = intersection plan × segment gardé (étape 1) × état de zoom (étape 3)
  * recadrage : L = image entière ; H / I = 16:9 natif 1920x1080 dans le 4K (pas d'upscale) placé sur le visage
    (médiane des positions YuNet sur le plan -> position lissée, fixe pendant le plan) ;
    punch-in 112 % = recadrage 1714x964 sur le même centre, agrandi en lanczos ; jamais de mouvement de caméra
  * étalonnage (étape 9) : filtre de config.json « etalonnage » appliqué après le recadrage
  * chaque unité dure un nombre entier d'images ; concat sans ré-encodage ; l'audio est posé ensuite (synchro exacte)
Usage : render_body.py [--preview] [--from S] [--to S] [--out fichier] [--labels]
Entrées : work/edl.json, work/keep.json, work/visual.json, work/punchins.json (optionnel)"""
import argparse, json, os, subprocess, concurrent.futures as cf
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('--preview', action='store_true', help='720p ultrafast (contrôle)')
ap.add_argument('--from', dest='t_from', type=float, default=0)
ap.add_argument('--to', dest='t_to', type=float, default=1e9)
ap.add_argument('--out', default='work/body.mp4')
ap.add_argument('--labels', action='store_true', help='incruste n° de plan / caméra (contrôle EDL)')
ap.add_argument('--jobs', type=int, default=2)
a = ap.parse_args()

FPS_N, FPS_D = 30000, 1001
FPS = FPS_N / FPS_D
SW, SH = 3840, 2160
cfg = json.load(open('pipeline/podcast/config.json'))
EDL = json.load(open('work/edl.json'))['shots']
SEG = json.load(open('work/keep.json'))['segments']
V = json.load(open('work/visual.json'))
PI = json.load(open('work/punchins.json'))['punchins'] if os.path.exists('work/punchins.json') else []
GRADE = cfg.get('etalonnage', '')
side = {'H': cfg.get('cote_hote', 'droite')}; side['I'] = 'gauche' if side['H'] == 'droite' else 'droite'
FACES = {k: np.array(V['faces'][k]) for k in ('gauche', 'droite')}
# composition : la personne regarde vers le centre -> visage décalé du côté opposé (espace de regard)
COMPO = {'droite': 0.60, 'gauche': 0.40}
VERT = 0.36                                  # hauteur des yeux ~ 1/3 haut

def face_center(cam, intervals):
    F = FACES[side[cam]]
    m = np.zeros(len(F), bool)
    for s0, s1 in intervals: m |= (F[:, 0] >= s0 - 1) & (F[:, 0] <= s1 + 1)
    sel = F[m] if m.sum() >= 2 else F
    return float(np.median(sel[:, 1])) * SW, float(np.median(sel[:, 2])) * SH

def crop_rect(cam, zoom, intervals):
    if cam == 'L':
        if zoom <= 1.0: return 0, 0, SW, SH
        w, h = int(SW / zoom) // 2 * 2, int(SH / zoom) // 2 * 2
        return (SW - w) // 2, (SH - h) // 3, w, h
    w, h = int(1920 / zoom) // 2 * 2, int(1080 / zoom) // 2 * 2
    cx, cy = face_center(cam, intervals)
    x = cx - COMPO[side[cam]] * w; y = cy - VERT * h
    x = int(min(max(x, 0), SW - w)) // 2 * 2; y = int(min(max(y, 0), SH - h)) // 2 * 2
    return x, y, w, h

def zoom_at(f):
    for p in PI:
        if p['f0'] <= f < p['f1']: return p['zoom']
    return 1.0

# ---- unités
units = []
for s in EDL:
    if s['f1'] / FPS <= a.t_from or s['f0'] / FPS >= a.t_to: continue
    pieces = []
    for g in SEG:
        f0, f1 = max(s['f0'], g['ep0']), min(s['f1'], g['ep1'])
        if f1 > f0: pieces.append((f0, f1, g))
    intervals = [(g['src0'] + (f0 - g['ep0']) / FPS, g['src0'] + (f1 - g['ep0']) / FPS) for f0, f1, g in pieces]
    for f0, f1, g in pieces:
        bps = sorted({f0, f1} | {p[k] for p in PI for k in ('f0', 'f1') if f0 < p[k] < f1})
        for b0, b1 in zip(bps, bps[1:]):
            z = zoom_at(b0) if s['cam'] != 'L' else 1.0
            units.append({'shot': s['i'], 'cam': s['cam'], 'kind': s['kind'], 'zoom': z, 'ep0': b0, 'nfr': b1 - b0,
                          'src0': g['src0'] + (b0 - g['ep0']) / FPS, 'rect': crop_rect(s['cam'], z, intervals)})
units = [u for u in units if a.t_from <= u['ep0'] / FPS < a.t_to]
OW, OH = (1280, 720) if a.preview else (1920, 1080)
os.makedirs('work/units', exist_ok=True)
NAME = {'H': 'HOTE', 'I': 'INVITEE', 'L': 'LARGE'}

def render(k_u):
    k, u = k_u
    x, y, w, h = u['rect']
    vf = [f'fps={FPS_N}/{FPS_D}', f'crop={w}:{h}:{x}:{y}', f'scale={OW}:{OH}:flags=lanczos']
    if GRADE: vf.append(GRADE)
    if a.labels:
        lab = f"#{u['shot']} {NAME[u['cam']]} {u['kind']}" + (f" x{u['zoom']:.2f}" if u['zoom'] > 1 else '')
        vf.append(f"drawtext=fontfile=fonts/Archivo-Black.ttf:text='{lab}':x=24:y=h-60:fontsize=30:fontcolor=white:borderw=3")
    vf.append('format=yuv420p')
    out = f"work/units/u{k:04d}{'p' if a.preview else ''}.mp4"
    enc = ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23'] if a.preview else \
          ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '12', '-x264-params', 'keyint=60']
    cmd = ['ffmpeg', '-v', 'error', '-y', '-ss', f"{u['src0']:.4f}", '-i', 'source.mp4', '-an', '-vf', ','.join(vf),
           '-frames:v', str(u['nfr']), '-r', f'{FPS_N}/{FPS_D}', *enc, out]
    subprocess.run(cmd, check=True)
    n = int(subprocess.check_output(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v', '-show_entries',
                                     'stream=nb_read_packets', '-of', 'csv=p=0', out]).strip())
    if n != u['nfr']: raise RuntimeError(f'unité {k}: {n} images au lieu de {u["nfr"]}')
    return out

with cf.ThreadPoolExecutor(a.jobs) as ex:
    outs = list(ex.map(render, enumerate(units)))
with open('work/units/list.txt', 'w') as f:
    for o in outs: f.write(f"file '{os.path.basename(o)}'\n")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'work/units/list.txt', '-c', 'copy', a.out], check=True)
json.dump(units, open(a.out.replace('.mp4', '_units.json'), 'w'), indent=0)
print('unités', len(units), 'images', sum(u['nfr'] for u in units), '->', a.out)
