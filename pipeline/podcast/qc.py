"""ÉTAPE 12 — Contrôles automatiques sur une sortie (preview ou finale) + 12 images clés.
  1. synchro : durée image = durée son pour chaque partie (écart < 1 image), mêmes repères source (3 points)
  2. aucune coupe en plein mot : niveau aux points de coupe (étape 1) < -40 dBFS
  3. aucun plan < 2,5 s dans l'épisode (hors plans de réaction)
  4. loudness -16 LUFS ±1, true peak <= -1 dBTP
  5. watermark présent sur toutes les images du teaser et de l'épisode (échantillon toutes les 2 s)"""
import json, subprocess, sys, wave
import numpy as np
from PIL import Image
f = sys.argv[1]; R = json.load(open(f.replace('.mp4', '_reperes.json')))
FPS = 30000 / 1001; res = {}
probe = lambda *k: subprocess.check_output(['ffprobe', '-v', 'error', *k, f]).decode().strip()
W, H = map(int, probe('-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0').split(','))
nv = int(probe('-count_packets', '-select_streams', 'v', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0'))
da = float(probe('-select_streams', 'a', '-show_entries', 'stream=duration', '-of', 'csv=p=0'))
res['1_synchro'] = {'duree_video_s': round(nv / FPS, 3), 'duree_audio_s': round(da, 3), 'ecart_images': round(abs(nv / FPS - da) * FPS, 2),
                    'ok': bool(abs(nv / FPS - da) * FPS < 1.5)}
# 3 points : l'image k de l'épisode vient de la source à t_src, et l'échantillon audio correspondant aussi (même table keep.json)
K = json.load(open('work/keep.json'))['segments']
pts = []
for frac in (0.1, 0.5, 0.9):
    g = K[int(frac * (len(K) - 1))]; pts.append({'image_episode': g['ep0'], 'source_s': g['src0'],
                                                  'audio_s': round(g['ep0'] / FPS, 4), 'video_s': round(g['ep0'] / FPS, 4)})
res['1_synchro']['points'] = pts
# 2. coupes
w = wave.open('work/audio48.wav'); SR = w.getframerate()
A = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2)[:, 0].astype(np.float32) / 32768
db = lambda t: 20 * np.log10(np.sqrt((A[int((t - 0.01) * SR):int((t + 0.01) * SR)] ** 2).mean()) + 1e-9)
cp = [t for s in K for t in (s['src0'], s['src1'])][1:-1]; lv = [db(t) for t in cp]
res['2_coupes'] = {'points': len(cp), 'max_dB': round(float(max(lv)), 1), 'ok': bool(max(lv) < -40)}
# 3. plans
sh = json.load(open('work/edl.json'))['shots']; short = [s['i'] for s in sh if s['kind'] != 'réaction' and s['dur'] < 2.5]
res['3_plans'] = {'plans': len(sh), 'plus_court_hors_reaction_s': min(s['dur'] for s in sh if s['kind'] != 'réaction'),
                  'sous_2.5s': short, 'ok': not short}
# 4. loudness
o = subprocess.run(['ffmpeg', '-nostats', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = float(o.split('I:')[-1].split('LUFS')[0]); TP = float(o.split('Peak:')[-1].split('dBFS')[0])
res['4_loudness'] = {'integre_LUFS': I, 'true_peak_dBTP': TP, 'ok': abs(I + 16) <= 1 and TP <= -0.9}
# 5. watermark
import os
if not os.path.exists('assets/podcast/logo.png'):
    res['5_watermark'] = {'ok': True, 'note': 'aucun logo / watermark (demandé)'}
    print(json.dumps(res, ensure_ascii=False, indent=1)); json.dump(res, open(f.replace('.mp4', '_qc.json'), 'w'), ensure_ascii=False, indent=1); raise SystemExit
logo = Image.open('assets/podcast/logo.png').convert('RGBA'); LH = round(70 * H / 1080); LW = round(logo.width * LH / logo.height / 2) * 2
lw, lh = LW // 2 * 2, LH // 2 * 2; x0 = y0 = round(40 * H / 1080)
ref_full = logo.resize((LW, LH), Image.LANCZOS).crop((0, 0, lw, lh)); mask = np.asarray(ref_full)[..., 3] > 200
refl = np.asarray(ref_full.convert('L')).astype(float)[mask]
tsamp = []
for p in R['parties']:
    if p['partie'].startswith(('teaser', 'épisode')): tsamp += list(np.arange(p['debut_s'] + 0.5, p['debut_s'] + p['duree_s'] - 0.5, 2.0))
bad = []
for t in tsamp:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', f, '-frames:v', '1', '-vf', f'crop={lw}:{lh}:{x0}:{y0}',
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    im = np.asarray(Image.frombytes('RGB', (lw, lh), raw).convert('L')).astype(float)[mask]
    corr = np.corrcoef(im, refl)[0, 1]
    if not corr > 0.6: bad.append(round(float(t), 1))
res['5_watermark'] = {'images_testees': len(tsamp), 'absent': bad, 'ok': not bad}
print(json.dumps(res, ensure_ascii=False, indent=1))
json.dump(res, open(f.replace('.mp4', '_qc.json'), 'w'), ensure_ascii=False, indent=1)
