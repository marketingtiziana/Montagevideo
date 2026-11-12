"""Rendu du corps de l'épisode à partir de l'EDL (étape 2) et des punch-ins (étape 3), étalonné (étape 9).
Chaque plan est découpé en unités = plan x segment gardé (étape 1) x état de zoom ; recadrage fixe par plan.
Usage : render_body.py [--preview] [--from S] [--to S] [--out fichier] [--labels] [--jobs N]
Sortie : vidéo seule (l'audio est posé à l'assemblage, à l'image près)."""
import argparse, json, os
from units import FPS, CAMNAME, pieces, crop_rect, render_units

ap = argparse.ArgumentParser()
ap.add_argument('--preview', action='store_true')
ap.add_argument('--from', dest='t_from', type=float, default=0)
ap.add_argument('--to', dest='t_to', type=float, default=1e9)
ap.add_argument('--out', default='work/body.mp4')
ap.add_argument('--labels', action='store_true')
ap.add_argument('--jobs', type=int, default=2)
a = ap.parse_args()

EDL = json.load(open('work/edl.json'))['shots']
PI = json.load(open('work/punchins.json'))['punchins'] if os.path.exists('work/punchins.json') else []
F0, F1 = round(a.t_from * FPS), round(min(a.t_to, 1e7) * FPS)

units = []
for s in EDL:
    f0, f1 = max(s['f0'], F0), min(s['f1'], F1)
    if f1 <= f0: continue
    full = pieces(s['f0'], s['f1'])
    intervals = [(src, src + (b - a_) / FPS) for a_, b, src in full]
    for p0, p1, src in pieces(f0, f1):
        cuts = sorted({p0, p1} | {p[k] for p in PI for k in ('f0', 'f1') if p0 < p[k] < p1})
        for b0, b1 in zip(cuts, cuts[1:]):
            z = next((p['zoom'] for p in PI if p['f0'] <= b0 < p['f1']), 1.0) if s['cam'] != 'L' else 1.0
            units.append({'shot': s['i'], 'cam': s['cam'], 'zoom': z, 'ep0': b0, 'nfr': b1 - b0,
                          'src0': src + (b0 - p0) / FPS, 'rect': crop_rect(s['cam'], z, intervals),
                          'label': f"#{s['i']} {CAMNAME[s['cam']]} {s['kind']}" + (f" x{z:.2f}" if z > 1 else '')})
n = render_units(units, a.out, preview=a.preview, labels=a.labels, jobs=a.jobs, tag='b')
json.dump(units, open(a.out.replace('.mp4', '_units.json'), 'w'), indent=0)
print('unités', len(units), 'images', n, '->', a.out)
