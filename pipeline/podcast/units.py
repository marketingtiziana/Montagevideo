"""Rendu d'« unités » : un intervalle source (nombre entier d'images) + un recadrage (caméra, zoom) + flou optionnel.
Partagé par render_body.py (corps de l'épisode) et build_teaser.py (teaser, whip-zooms).
Caméras simulées dans le 4K : L = image entière ; H / I = 16:9 natif 1920x1080 placé sur le visage (YuNet),
fixe pendant un plan (médiane des positions) ; zoom z = recadrage 1920/z x 1080/z sur le même centre (lanczos)."""
import json, os, subprocess, concurrent.futures as cf
import numpy as np

FPS_N, FPS_D = 30000, 1001
FPS = FPS_N / FPS_D
SW, SH = 3840, 2160
cfg = json.load(open('pipeline/podcast/config.json'))
SEG = json.load(open('work/keep.json'))['segments']
_V = json.load(open('work/visual.json'))
SIDE = {'H': cfg.get('cote_hote', 'droite')}; SIDE['I'] = 'gauche' if SIDE['H'] == 'droite' else 'droite'
FACES = {k: np.array(_V['faces'][k]) for k in ('gauche', 'droite')}
COMPO = {'droite': 0.60, 'gauche': 0.40}      # espace de regard vers le centre
VERT = 0.36
GRADE = cfg.get('etalonnage', '')
CAMNAME = {'H': 'HOTE', 'I': 'INVITEE', 'L': 'LARGE'}

def ep2src(f):
    for g in SEG:
        if g['ep0'] <= f < g['ep1']: return g, g['src0'] + (f - g['ep0']) / FPS
    raise ValueError(f)

def pieces(f0, f1):
    """Intersection [f0, f1) (images épisode) x segments gardés -> [(f0, f1, src0)]"""
    out = []
    for g in SEG:
        a, b = max(f0, g['ep0']), min(f1, g['ep1'])
        if b > a: out.append((a, b, g['src0'] + (a - g['ep0']) / FPS))
    return out

def face_center(cam, intervals):
    F = FACES[SIDE[cam]]; m = np.zeros(len(F), bool)
    for s0, s1 in intervals: m |= (F[:, 0] >= s0 - 1) & (F[:, 0] <= s1 + 1)
    sel = F[m] if m.sum() >= 2 else F
    return float(np.median(sel[:, 1])) * SW, float(np.median(sel[:, 2])) * SH

def crop_rect(cam, zoom, intervals):
    if cam == 'L':
        if zoom <= 1.0: return 0, 0, SW, SH
        w, h = int(SW / zoom) // 2 * 2, int(SH / zoom) // 2 * 2
        return (SW - w) // 2, (SH - h) // 3 // 2 * 2, w, h
    w, h = int(1920 / zoom) // 2 * 2, int(1080 / zoom) // 2 * 2
    cx, cy = face_center(cam, intervals)
    x = cx - COMPO[SIDE[cam]] * w; y = cy - VERT * h
    return int(min(max(x, 0), SW - w)) // 2 * 2, int(min(max(y, 0), SH - h)) // 2 * 2, w, h

def render_units(units, out, preview=False, labels=False, jobs=2, tag='u'):
    """units : [{src0, nfr, rect, blur?, label?}] -> out (concat sans ré-encodage)."""
    OW, OH = (1280, 720) if preview else (1920, 1080)
    os.makedirs('work/units', exist_ok=True)
    def one(k_u):
        k, u = k_u
        x, y, w, h = u['rect']
        vf = [f'fps={FPS_N}/{FPS_D}', f'crop={w}:{h}:{x}:{y}', f'scale={OW}:{OH}:flags=lanczos']
        if u.get('blur'): vf.append(f"gblur=sigma={u['blur']}:sigmaV={u['blur'] * 0.15:.2f}")
        if GRADE: vf.append(GRADE)
        if labels and u.get('label'):
            vf.append(f"drawtext=fontfile=fonts/Archivo-Black.ttf:text='{u['label']}':x=24:y=h-60:fontsize=30:fontcolor=white:borderw=3")
        vf.append('format=yuv420p')
        import hashlib
        key = hashlib.md5(json.dumps([u['src0'], u['nfr'], u['rect'], u.get('blur'), GRADE, preview,
                                      u.get('label') if labels else None]).encode()).hexdigest()[:12]
        o = f"work/units/{tag}{k:04d}_{key}.mp4"
        if os.path.exists(o):
            try:
                n = int(subprocess.check_output(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v', '-show_entries',
                                                 'stream=nb_read_packets', '-of', 'csv=p=0', o]).strip())
                if n == u['nfr']: return o
            except Exception: pass
        enc = ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '20'] if preview else \
              ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '12', '-x264-params', 'keyint=60']
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f"{u['src0']:.4f}", '-i', 'source.mp4', '-an', '-vf', ','.join(vf),
                        '-frames:v', str(u['nfr']), '-r', f'{FPS_N}/{FPS_D}', *enc, o], check=True)
        n = int(subprocess.check_output(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v', '-show_entries',
                                         'stream=nb_read_packets', '-of', 'csv=p=0', o]).strip())
        if n != u['nfr']: raise RuntimeError(f'unité {k}: {n} images au lieu de {u["nfr"]}')
        return o
    with cf.ThreadPoolExecutor(jobs) as ex:
        outs = list(ex.map(one, enumerate(units)))
    lst = f'work/units/{tag}_list.txt'
    with open(lst, 'w') as f:
        for o in outs: f.write(f"file '{os.path.basename(o)}'\n")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', out], check=True)
    return sum(u['nfr'] for u in units)
