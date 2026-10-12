#!/usr/bin/env python3
"""CONTRÔLE DES MARGES (bloquant) — mesure la boîte réelle de la couche texte seule (PNG alpha, ombre comprise).

Usage : python3 -I tools/margins_qa.py <dir_png> <layout.json> <MARGINS.md>
Chaque PNG = couche texte seule d'un écran (fond transparent), nommé <id>.png, rendu au milieu de l'écran.
Règles : gauche ≥ 120, droite ≥ 120, haut ≥ 520, bas ≥ 520, centre horizontal à ±8 px de 540.
Sortie : MARGINS.md + code retour 1 si un écran échoue.
"""
import sys, os, json
import numpy as np
from PIL import Image

W, H = 1080, 1920
RULES = dict(left=120, right=120, top=520, bottom=520, center_tol=8)

def measure(png):
    im = Image.open(png).convert('RGBA')
    a = np.array(im)[:, :, 3]
    ys, xs = np.where(a > 2)
    if len(xs) == 0:
        return None
    x0, x1, y0, y1 = int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())
    return dict(left=x0, right=W - 1 - x1, top=y0, bottom=H - 1 - y1, cx=(x0 + x1) / 2, bbox=[x0, y0, x1, y1])

def main(d, layout_path, out):
    lay = json.load(open(layout_path))['screens']
    rows, fails = [], 0
    for sid in sorted(lay):
        png = os.path.join(d, f'{sid}.png')
        if not os.path.exists(png):
            rows.append((sid, None, 'PNG manquant')); fails += 1; continue
        m = measure(png)
        if m is None:
            rows.append((sid, None, 'couche vide')); fails += 1; continue
        errs = []
        if m['left'] < RULES['left']: errs.append(f"gauche {m['left']}")
        if m['right'] < RULES['right']: errs.append(f"droite {m['right']}")
        if m['top'] < RULES['top']: errs.append(f"haut {m['top']}")
        if m['bottom'] < RULES['bottom']: errs.append(f"bas {m['bottom']}")
        if abs(m['cx'] - 540) > RULES['center_tol']: errs.append(f"centre {m['cx']:.1f}")
        if errs: fails += 1
        rows.append((sid, m, 'OK' if not errs else 'ÉCHEC : ' + ', '.join(errs)))
    with open(out, 'w') as f:
        f.write('# MARGINS.md — contrôle mécanique des marges de la couche texte (ombre comprise)\n\n')
        f.write('Règle : gauche ≥ 120 px, droite ≥ 120 px, haut ≥ 520 px, bas ≥ 520 px, centre horizontal 540 ± 8 px. Mesure sur PNG alpha de la couche texte seule, à mi-écran.\n\n')
        f.write('| Écran | Gauche | Droite | Haut | Bas | Centre X | Boîte (x0,y0,x1,y1) | Verdict |\n|---|---|---|---|---|---|---|---|\n')
        for sid, m, v in rows:
            if m: f.write(f"| {sid} | {m['left']} | {m['right']} | {m['top']} | {m['bottom']} | {m['cx']:.1f} | {m['bbox']} | {v} |\n")
            else: f.write(f'| {sid} | – | – | – | – | – | – | {v} |\n')
        f.write(f"\n**Résultat : {len(rows) - fails}/{len(rows)} écrans conformes.**\n")
    print(open(out).read())
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3])
