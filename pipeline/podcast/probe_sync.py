"""ÉTAPE 0.1-0.2 — ffprobe des rushs + synchro des caméras par corrélation croisée (16 kHz mono).
Usage : python3 pipeline/podcast/probe_sync.py  (lit pipeline/podcast/config.json)"""
import json, subprocess, numpy as np, wave, os
from scipy.signal import fftconvolve
cfg = json.load(open('pipeline/podcast/config.json'))
cams = {k: v for k, v in cfg['rushs'].items() if v}

def probe(p):
    d = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', p]))
    v = next(s for s in d['streams'] if s['codec_type'] == 'video')
    a = [s for s in d['streams'] if s['codec_type'] == 'audio']
    n, dd = map(int, v['avg_frame_rate'].split('/'))
    return {'duree': float(d['format']['duration']), 'fps': round(n / dd, 3), 'codec': v['codec_name'],
            'resolution': f"{v['width']}x{v['height']}",
            'audio': [{'codec': s['codec_name'], 'sr': int(s['sample_rate']), 'canaux': s['channels']} for s in a]}

def load16(p, dur=600):
    out = f"work/_sync_{os.path.basename(p)}.wav"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-t', str(dur), '-vn', '-ac', '1', '-ar', '16000', out], check=True)
    w = wave.open(out); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)
    return x / (np.abs(x).max() + 1e-9)

info = {k: probe(p) for k, p in cams.items()}
ref = cfg.get('sync_ref', 'cam_large')
uniq = sorted(set(cams.values()))
offsets = {}
if len(uniq) == 1:
    offsets = {k: 0.0 for k in cams}          # un seul fichier : multicam simulé, décalage nul
else:
    r = load16(cams[ref])
    for k, p in cams.items():
        if p == cams[ref]: offsets[k] = 0.0; continue
        x = load16(p)
        c = fftconvolve(r, x[::-1], mode='full')
        offsets[k] = round((np.argmax(c) - (len(x) - 1)) / 16000, 4)   # >0 : la cam démarre après la ref
json.dump({'reference': ref, 'offsets_s': offsets, 'probe': info,
           'multicam_simule': len(uniq) == 1}, open('work/sync.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps(json.load(open('work/sync.json')), indent=1, ensure_ascii=False))
