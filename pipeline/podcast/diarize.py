"""ÉTAPE 0.4 — Diarisation (une seule piste micro ; prérequis : embed.py, analyze_video.py).
  1. Empreintes vocales WeSpeaker (work/emb.npz) sur la parole -> k-means à 2 clusters (+ 3 itérations de
     ré-estimation des centroïdes sur les fenêtres les plus sûres).
  2. Le mouvement des bouches (work/visual.json) nomme les clusters : hôte = côté 'cote_hote' de config.json.
  3. Score par mot = cosinus(hôte) - cosinus(invité) (fenêtres qui recouvrent le mot) + 0,02 × visuel.
  4. Hystérésis 400 ms : un changement d'orateur doit durer >= 0,4 s, sinon il est absorbé.
Si config.audio_hote / audio_invite sont des fichiers : RMS par fenêtres de 100 ms (hystérésis 400 ms).
Sorties : work/words_spk.json (mots + 'spk' + 'conf'), work/speakers.json (tours de parole)."""
import json, numpy as np, os, wave
from sklearn.cluster import KMeans
cfg = json.load(open('pipeline/podcast/config.json'))
W = json.load(open('work/words.json'))
cote_h = cfg.get('cote_hote', 'droite'); cote_i = 'gauche' if cote_h == 'droite' else 'droite'

def rms_tracks():
    def env(p):
        os.system(f"ffmpeg -v error -y -i '{p}' -ac 1 -ar 16000 work/_trk.wav")
        w = wave.open('work/_trk.wav'); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)
        n = len(x) // 1600; return 20 * np.log10(np.sqrt((x[:n * 1600].reshape(n, 1600) ** 2).mean(1)) + 1e-3)
    h, i = env(cfg['audio_hote']), env(cfg['audio_invite']); n = min(len(h), len(i))
    return np.arange(n) * 0.1 + 0.05, (h[:n] - i[:n]) / 6.0          # >0 : hôte plus fort

if os.path.isfile(str(cfg.get('audio_hote'))) and os.path.isfile(str(cfg.get('audio_invite'))):
    t, sc = rms_tracks(); sp = np.ones(len(t), bool)
else:
    d = np.load('work/emb.npz'); t, E = d['t'], d['e']
    wc = np.array([(w['t0'] + w['t1']) / 2 for w in W])
    sp = np.array([np.min(np.abs(wc - x)) < 0.4 for x in t])
    km = KMeans(2, n_init=10, random_state=0).fit(E[sp]); c = km.cluster_centers_.copy()
    for _ in range(3):
        s = E @ c[0] - E @ c[1]
        for k, m in enumerate([s > np.percentile(s[sp], 60), s < np.percentile(s[sp], 40)]):
            c[k] = E[m & sp].mean(0)
    s = E @ c[0] - E @ c[1]
    # nommer : le cluster 0 est-il l'hôte ? (corrélation avec la différence de mouvement des bouches)
    V = json.load(open('work/visual.json')); f = V['fps']
    mh, mi = np.array(V['mouth'][cote_h]), np.array(V['mouth'][cote_i])
    rel = lambda a: np.log((a + 1e-3) / (np.median(a) + 1e-3))
    vis = rel(mh) - rel(mi)
    vt = np.array([vis[int((x - 0.75) * f):int((x + 0.75) * f)].mean() for x in t])
    sign = 1 if np.corrcoef(s[sp], vt[sp])[0, 1] > 0 else -1
    sc = sign * s + 0.02 * vt
    print('corrélation voix/bouches', round(float(np.corrcoef(s[sp], vt[sp])[0, 1]), 3), '-> cluster 0 =', 'hote' if sign > 0 else 'invite')

for w in W:
    m = (t >= w['t0'] - 0.5) & (t <= w['t1'] + 0.5) & sp
    v = float(sc[m].mean()) if m.any() else 0.0
    w['score'] = round(v, 4)
# lissage : moyenne glissante sur 3 mots puis hystérésis 0,4 s
raw = np.array([w['score'] for w in W])
lab = np.where(raw > 0, 1, 0)
i = 0
runs = []
while i < len(W):
    j = i
    while j + 1 < len(W) and lab[j + 1] == lab[i]: j += 1
    runs.append([i, j]); i = j + 1
changed = True
while changed:
    changed = False
    for k in range(1, len(runs) - 1):
        a, b = runs[k]
        if W[b]['t1'] - W[a]['t0'] < 0.4 and np.abs(raw[a:b + 1]).mean() < 0.15:
            lab[a:b + 1] = lab[runs[k - 1][0]]; changed = True
    if changed:
        i, runs = 0, []
        while i < len(W):
            j = i
            while j + 1 < len(W) and lab[j + 1] == lab[i]: j += 1
            runs.append([i, j]); i = j + 1
for w, l in zip(W, lab):
    w['spk'] = 'hote' if l else 'invite'; w['conf'] = round(min(abs(w.pop('score')) / 0.3, 1), 2)
turns = []
for w in W:
    if turns and turns[-1]['spk'] == w['spk']:
        turns[-1]['t1'] = w['t1']; turns[-1]['n'] += 1; turns[-1]['text'] += ' ' + w['w']
    else:
        turns.append({'t0': w['t0'], 't1': w['t1'], 'spk': w['spk'], 'n': 1, 'text': w['w']})
json.dump(W, open('work/words_spk.json', 'w'), ensure_ascii=False, indent=0)
json.dump(turns, open('work/speakers.json', 'w'), ensure_ascii=False, indent=0)
tot = {k: round(sum(x['t1'] - x['t0'] for x in turns if x['spk'] == k)) for k in ('hote', 'invite')}
print('tours', len(turns), 'temps de parole (s)', tot)
if os.path.exists('pipeline/podcast/controle_diarisation.json'):
    gt = json.load(open('pipeline/podcast/controle_diarisation.json')); ok = n = 0
    for w in W:
        g = next((s for a, b, s in gt if a <= (w['t0'] + w['t1']) / 2 <= b), None)
        if g: n += 1; ok += (w['spk'] == g)
    print(f'contrôle sur {n} mots annotés à la main : {ok / n:.1%}')
