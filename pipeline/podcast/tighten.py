"""ÉTAPE 1 — Nettoyage du rythme.
  * coupes éditoriales : pipeline/podcast/structure.json (pré-roll, faux départs, apartés…)
  * silences : silencedetect -35 dB, d >= 0,35 s -> on garde 0,12 s après le dernier mot et 0,06 s avant
    le suivant (protégé par les horodatages Whisper : on ne coupe jamais dans un mot)
  * chaque point de coupe est recalé sur le minimum d'énergie (±60 ms)
  * durée de chaque segment gardé = nombre entier d'images (30000/1001) -> synchro image/son exacte
  * repère (sans couper) les hésitations probables : trous entre mots > 0,5 s non silencieux, répétitions
Sorties : work/cuts.json (toutes les coupes, à relire), work/keep.json (segments source gardés),
          work/ep_words.json (mots sur la timeline épisode), work/ep_clean.wav (fondus 10 ms à chaque coupe)"""
import json, re, subprocess, numpy as np, wave
FPS = 30000 / 1001
HEAD, TAIL, MIN_CUT = 0.12, 0.06, 0.05
cfg = json.load(open('pipeline/podcast/structure.json'))
W = json.load(open('work/words_spk.json'))
w = wave.open('work/audio48.wav'); SR = w.getframerate()
A = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2).astype(np.float32) / 32768
DUR = len(A) / SR
mono = A.mean(1)
hop = int(SR * 0.005); n = len(mono) // hop
env = np.sqrt((mono[:n * hop].reshape(n, hop) ** 2).mean(1))   # 5 ms

SM = 20 * np.log10(np.convolve(env, np.ones(4) / 4, 'same') + 1e-9)   # 20 ms lissé, dB
def valley(t, lo, hi, prefer='near', thr=-42.0):
    """Point le plus proche de t (ou premier / dernier) dans [lo, hi] dont le niveau lissé < thr."""
    a, b = int(max(lo, 0) / 0.005), int(min(hi, DUR) / 0.005)
    idx = np.where(SM[a:b] < thr)[0] + a
    if not len(idx): return None
    if prefer == 'first': return idx[0] * 0.005 + 0.0025
    if prefer == 'last': return idx[-1] * 0.005 + 0.0025
    return idx[np.argmin(np.abs(idx * 0.005 - t))] * 0.005 + 0.0025
def safe(t):
    """Recale un point de coupe dans un creux (< -42 dB, ±0,25 s) ; sinon minimum local ±60 ms."""
    if SM[min(int(t / 0.005), len(SM) - 1)] < -42: return t, True
    v = valley(t, t - 0.25, t + 0.25)
    return (v, True) if v is not None else (snap(t), False)
def snap(t, win=0.06):
    a, b = int(max(t - win, 0) / 0.005), int(min(t + win, DUR) / 0.005)
    return (a + int(np.argmin(np.convolve(env[a:b], np.ones(4) / 4, 'same')))) * 0.005 + 0.0025 if b > a else t

out = subprocess.run(['ffmpeg', '-nostats', '-i', 'work/audio48.wav', '-af', 'silencedetect=n=-35dB:d=0.35', '-f', 'null', '-'],
                     capture_output=True, text=True).stderr
ss = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
se = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
sil = list(zip(ss, se + [DUR] * (len(ss) - len(se))))

cuts = [dict(c, type='éditorial') for c in cfg['coupes'] + cfg.get('coupes_supplementaires', [])]
for c in cuts: c['t1'] = min(c['t1'], DUR)
# « euh » / « hum » isolés (qualifiés par classify_gaps.py) : même règle que les silences
import os, re as _re
if os.path.exists('work/gaps.json'):
    for g in json.load(open('work/gaps.json')):
        toks = [_re.sub(r'[^a-z]', '', x[2].lower()) for x in g['dans_le_trou']]
        if toks and all(t in ('euh', 'hum', 'ben', '') for t in toks):
            va = valley(0, g['t'] - 0.05, g['t'] + g['d'], 'first'); vb = valley(0, g['t'], g['t'] + g['d'] + 0.05, 'last')
            if va is None or vb is None: continue
            a, b = va + 0.03, vb - 0.03
            if b - a >= 0.15:
                cuts.append({'t0': round(a, 3), 't1': round(b, 3), 'type': 'euh', 'raison': f"hésitation « {' '.join(x[2] for x in g['dans_le_trou'])} » ({g['d']:.2f} s)"})
def in_edit(t): return any(c['t0'] <= t <= c['t1'] for c in cuts if c['type'] == 'éditorial')
starts = np.array([x['t0'] for x in W]); ends = np.array([x['t1'] for x in W])
for s0, s1 in sil:
    if in_edit((s0 + s1) / 2): continue
    prev_end = ends[ends <= s0 + 0.25].max() if (ends <= s0 + 0.25).any() else s0
    nxt = starts[starts >= s1 - 0.25]; next_start = nxt.min() if len(nxt) else s1
    a = max(s0, prev_end) + HEAD; b = min(s1, next_start) - TAIL
    # aucun mot ne doit chevaucher [a, b]
    if ((starts < b) & (ends > a)).any() or b - a < MIN_CUT: continue
    cuts.append({'t0': round(a, 3), 't1': round(b, 3), 'type': 'silence', 'raison': f'silence {s1 - s0:.2f} s -> {s1 - s0 - (b - a):.2f} s'})
cuts.sort(key=lambda c: c['t0'])
# fusion des chevauchements + recalage énergie
merged = []
for c in cuts:
    if merged and c['t0'] <= merged[-1]['t1']:
        merged[-1]['t1'] = max(merged[-1]['t1'], c['t1'])
        if c['type'] in ('éditorial', 'euh'): merged[-1].update(type='éditorial', raison=c['raison'])
    else: merged.append(dict(c))
for c in merged:
    ok = True
    if c['t0'] > 0: t, o = safe(c['t0']); c['t0'] = round(t, 4); ok &= o
    if c['t1'] < DUR: t, o = safe(c['t1']); c['t1'] = round(t, 4); ok &= o
    if not ok: c['attention'] = 'aucun creux < -42 dB près du point de coupe'
merged = [c for c in merged if c['t1'] - c['t0'] >= 0.03]
# segments gardés, quantifiés en images
keep, t = [], 0.0
for c in merged:
    if c['t0'] > t: keep.append([t, c['t0']])
    t = max(t, c['t1'])
if t < DUR: keep.append([t, DUR])
seg = []
for a, b in keep:
    nfr = int(round((b - a) * FPS))
    if nfr >= 2: seg.append({'src0': round(a, 4), 'nfr': nfr, 'src1': round(a + nfr / FPS, 4)})
pos = 0
for s in seg: s['ep0'] = pos; pos += s['nfr']; s['ep1'] = pos
EPDUR = pos / FPS
def src2ep(t):
    for s in seg:
        if s['src0'] - 1e-6 <= t <= s['src1'] + 1e-6: return s['ep0'] / FPS + (t - s['src0'])
    return None
epw = []
for x in W:
    a, b = src2ep(x['t0']), src2ep(x['t1'])
    if a is not None and b is not None and b >= a:
        epw.append(dict(x, src0=x['t0'], src1=x['t1'], t0=round(a, 3), t1=round(b, 3)))
# hésitations probables (non coupées, à relire)
flags = []
for i in range(1, len(W)):
    g0, g1 = W[i - 1]['t1'], W[i]['t0']
    if g1 - g0 > 0.5 and not in_edit(g0) and not any(c['type'] == 'euh' and g0 <= c['t0'] <= g1 for c in cuts):
        silent = sum(max(0, min(g1, s1) - max(g0, s0)) for s0, s1 in sil)
        if silent < 0.5 * (g1 - g0):
            flags.append({'t': round(g0, 2), 'duree': round(g1 - g0, 2), 'type': 'son non transcrit (euh / rire ?)',
                          'contexte': ' '.join(x['w'] for x in W[max(0, i - 4):i + 4])})
    a = [re.sub(r'\W', '', x['w'].lower()) for x in W[max(0, i - 2):i + 1]]
    if i >= 1 and a[-1] and len(a) >= 2 and a[-1] == a[-2] and len(a[-1]) > 1 and not in_edit(W[i]['t0']):
        flags.append({'t': round(W[i - 1]['t0'], 2), 'type': 'répétition', 'contexte': ' '.join(x['w'] for x in W[max(0, i - 4):i + 4])})
# audio nettoyé avec fondus 10 ms
fade = int(0.010 * SR); parts = []
for s in seg:
    a = int(round(s['src0'] * SR)); nn = int(round(s['nfr'] / FPS * SR)); p = A[a:a + nn].copy()
    if len(p) < nn: p = np.vstack([p, np.zeros((nn - len(p), 2), np.float32)])
    r = np.linspace(0, 1, fade)[:, None]; p[:fade] *= r; p[-fade:] *= r[::-1]; parts.append(p)
ep = np.concatenate(parts)
o = wave.open('work/ep_clean.wav', 'wb'); o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR)
o.writeframes((np.clip(ep, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
json.dump({'fps': '30000/1001', 'segments': seg, 'duree_episode': round(EPDUR, 3)}, open('work/keep.json', 'w'), indent=0)
json.dump(epw, open('work/ep_words.json', 'w'), ensure_ascii=False, indent=0)
gain_sil = sum(c['t1'] - c['t0'] for c in merged if c['type'] == 'silence')
gain_euh = sum(c['t1'] - c['t0'] for c in merged if c['type'] == 'euh')
gain_ed = sum(c['t1'] - c['t0'] for c in merged if c['type'] == 'éditorial')
json.dump({'resume': {'duree_source': round(DUR, 2), 'duree_episode': round(EPDUR, 2), 'coupes_editoriales_s': round(gain_ed, 2),
                      'silences_raccourcis': sum(c['type'] == 'silence' for c in merged), 'gain_silences_s': round(gain_sil, 2), 'euh_coupes': sum(c['type'] == 'euh' for c in merged), 'gain_euh_s': round(gain_euh, 2)},
           'coupes': merged, 'a_relire': flags}, open('work/cuts.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps(json.load(open('work/cuts.json'))['resume'], ensure_ascii=False), '| segments', len(seg), '| à relire', len(flags))
