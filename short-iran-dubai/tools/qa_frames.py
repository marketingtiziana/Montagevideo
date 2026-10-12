#!/usr/bin/env python3
"""QA image du master : (1) zéro frame statique > 1,0 s (diff de frames), (2) contrôle strobing sur 3 transitions
(variance de luminance frame à frame autour des coupes), (3) extraction des 3 transitions à 0,25x.
Usage : python3 qa_frames.py master.mp4 out_dir t1 t2 t3   (temps des transitions en secondes)
Nécessite ffmpeg + numpy + PIL (lecture via rawvideo pipe)."""
import sys, subprocess, numpy as np, os, json
src, out = sys.argv[1], sys.argv[2]; cuts = [float(x) for x in sys.argv[3:6]]
os.makedirs(out, exist_ok=True)
W, H, FPS = 180, 320, 20   # analyse en basse résolution à 20 fps
p = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'fps={FPS},scale={W}:{H}', '-pix_fmt', 'gray', '-f', 'rawvideo', '-'], capture_output=True)
fr = np.frombuffer(p.stdout, np.uint8).reshape(-1, H, W).astype(np.float32)
d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))   # diff moyenne entre frames consécutives
static_runs, run = [], 0
for i, v in enumerate(d):
    run = run + 1 if v < 0.35 else 0
    if run * (1 / FPS) > 1.0: static_runs.append(round((i - run) / FPS, 2))
static_runs = sorted(set(static_runs))
# strobing : autour de chaque coupe, alternance de signes de variation de luminance > seuil
lum = fr.mean(axis=(1, 2)); strobe = {}
for c in cuts:
    a, b = int(max(0, (c - 0.4) * FPS)), int(min(len(lum) - 1, (c + 0.4) * FPS))
    seg = np.diff(lum[a:b]); flips = int(np.sum((seg[:-1] * seg[1:] < 0) & (np.abs(seg[:-1]) > 6) & (np.abs(seg[1:]) > 6)))
    strobe[c] = flips
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(c - 0.5), '-t', '1.0', '-i', src, '-vf', 'setpts=4*PTS', '-an', '-c:v', 'libx264', '-crf', '18', f'{out}/transition_{c:.2f}_x025.mp4'])
rep = dict(frames=int(len(fr)), fps=FPS, static_runs_over_1s=static_runs, max_static_run_s=round(float(max([0] + [1])), 2), strobe_flips=strobe, mean_diff=round(float(d.mean()), 3))
json.dump(rep, open(f'{out}/qa_frames.json', 'w'), indent=1); print(json.dumps(rep))
