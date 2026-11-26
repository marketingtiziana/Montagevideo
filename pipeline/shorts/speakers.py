"""SHORTS — Étape 2 : identification fine de Tiziana (femme aux cheveux longs, à GAUCHE de l'image).
Par « phrase » (mots séparés par des pauses >= 0,15 s) :
  * audio  : empreinte WeSpeaker calculée exactement sur la phrase, comparée aux centroïdes des deux voix
             (centroïdes appris sur les mots très sûrs de la diarisation globale work/words_spk.json)
  * visuel : mouvement des lèvres (YuNet, work/visual.json) côté gauche vs côté droit, z-score robuste
  * décision : invitée si audio et visuel concordent ; « à vérifier » s'ils se contredisent ou si l'audio hésite
Sorties : work/shorts/phrases.json, work/shorts/words_tiz.json (mots + spk2, conf2)"""
import json, os, wave, numpy as np, onnxruntime as ort, kaldi_native_fbank as knf
os.makedirs('work/shorts', exist_ok=True)
W = json.load(open('work/words_spk.json'))
w_ = wave.open('work/audio16.wav'); Y = np.frombuffer(w_.readframes(w_.getnframes()), np.int16).astype(np.float32)
sess = ort.InferenceSession('models/wespeaker/voxceleb_resnet34_LM.onnx', providers=['CPUExecutionProvider'])
def emb(a, b):
    a, b = max(0, a - 0.12), b + 0.12
    if b - a < 0.6: c = (a + b) / 2; a, b = c - 0.3, c + 0.3
    o = knf.FbankOptions(); o.frame_opts.dither = 0; o.mel_opts.num_bins = 80
    fb = knf.OnlineFbank(o); fb.accept_waveform(16000, Y[int(a * 16000):int(b * 16000)].tolist()); fb.input_finished()
    F = np.array([fb.get_frame(i) for i in range(fb.num_frames_ready)], np.float32); F -= F.mean(0)
    e = sess.run(None, {'feats': F[None]})[0][0]; return e / np.linalg.norm(e)
# phrases
P, cur = [], [0]
for i in range(1, len(W)):
    if W[i]['t0'] - W[i - 1]['t1'] >= 0.15 or W[i - 1]['w'][-1:] in '.?!' or W[i]['w'] in ('?', '!'):
        P.append(cur); cur = []
    cur.append(i)
P.append(cur)
# la ponctuation isolée (« ? ») rejoint la phrase précédente
P2 = []
for p in P:
    if P2 and all(W[j]['w'] in ('?', '!', '.', ',') for j in p): P2[-1] += p
    else: P2.append(p)
P = P2
# point de rupture dans les phrases où deux voix s'enchaînent sans pause
def wscore(j, cI_, cH_):
    e = emb(W[j]['t0'] - 0.25, W[j]['t1'] + 0.25); return float(e @ cI_ - e @ cH_)
E0 = [emb(W[p[0]]['t0'], W[p[-1]]['t1']) for p in P]
lab_ = [max(('hote', 'invite'), key=lambda s_: sum(W[j]['t1'] - W[j]['t0'] for j in p if W[j]['spk'] == s_)) for p in P]
cf_ = [np.mean([W[j]['conf'] for j in p]) for p in P]; du_ = [W[p[-1]]['t1'] - W[p[0]]['t0'] for p in P]
cI0 = np.mean([E0[k] for k in range(len(P)) if lab_[k] == 'invite' and cf_[k] > 0.9 and du_[k] > 1.5], 0)
cH0 = np.mean([E0[k] for k in range(len(P)) if lab_[k] == 'hote' and cf_[k] > 0.9 and du_[k] > 1.5], 0)
P2, nsplit = [], 0
for p in P:
    if len(p) >= 5 and W[p[-1]]['t1'] - W[p[0]]['t0'] > 1.8:
        sc = np.array([wscore(j, cI0, cH0) for j in p]); sc = np.convolve(sc, np.ones(3) / 3, 'same')
        best, bk = 0, None
        for k in range(2, len(p) - 1):
            l, r = sc[:k].mean(), sc[k:].mean()
            if np.sign(l) != np.sign(r) and min(abs(l), abs(r)) > 0.06 and abs(l - r) > best: best, bk = abs(l - r), k
        if bk:   # affinage ±2 mots sur les scores bruts : la frontière qui sépare au mieux les deux signes
            raw = np.array([wscore(j, cI0, cH0) for j in p]); sg = np.sign(sc[:bk].mean())
            cands = [k for k in range(max(1, bk - 2), min(len(p) - 1, bk + 3))]
            bk = max(cands, key=lambda k: sg * (raw[:k].sum() - raw[k:].sum()))
            P2 += [p[:bk], p[bk:]]; nsplit += 1; continue
    P2.append(p)
P = P2; print('phrases scindées (changement de voix sans pause) :', nsplit)
E = [emb(W[p[0]]['t0'], W[p[-1]]['t1']) for p in P]
lab0 = [max(('hote', 'invite'), key=lambda s: sum(W[j]['t1'] - W[j]['t0'] for j in p if W[j]['spk'] == s)) for p in P]
conf0 = [np.mean([W[j]['conf'] for j in p]) for p in P]
dur = [W[p[-1]]['t1'] - W[p[0]]['t0'] for p in P]
sure = lambda s: [E[k] for k in range(len(P)) if lab0[k] == s and conf0[k] > 0.9 and dur[k] > 1.5]
cH, cI = np.mean(sure('hote'), 0), np.mean(sure('invite'), 0)
V = json.load(open('work/visual.json')); fv = V['fps']
def z(a):
    a = np.convolve(np.array(a, float), np.ones(3) / 3, 'same'); m = np.median(a); s = np.median(np.abs(a - m)) * 1.4826 + 1e-6
    return (a - m) / s
zL, zR = z(V['mouth']['gauche']), z(V['mouth']['droite'])
out = []
for k, p in enumerate(P):
    a, b = W[p[0]]['t0'], W[p[-1]]['t1']
    au = float(E[k] @ cI - E[k] @ cH)                       # > 0 : voix de Tiziana
    i0, i1 = int(a * fv), max(int(b * fv), int(a * fv) + 2)
    vi = float(zL[i0:i1].mean() - zR[i0:i1].mean())        # > 0 : lèvres de gauche (Tiziana) qui bougent
    s = au / 0.12 + 0.25 * np.clip(vi, -3, 3)
    flag = (abs(au) < 0.05) or (np.sign(au) != np.sign(vi) and abs(vi) > 1.0 and abs(au) < 0.15)
    spk = ('invite' if s > 0 else 'hote') if not flag else lab0[k]     # doute : on garde la diarisation globale
    conf = float(min(1, abs(s) / 2.5)) * (0.5 if flag else 1)
    out.append({'t0': round(a, 3), 't1': round(b, 3), 'texte': ' '.join(W[j]['w'] for j in p), 'spk': spk,
                'audio': round(au, 3), 'levres': round(vi, 2), 'conf': round(conf, 2), 'a_verifier': bool(flag), 'diar_globale': lab0[k]})
    for j in p: W[j]['spk2'] = spk; W[j]['conf2'] = round(conf, 2); W[j]['verif'] = bool(flag)
json.dump(out, open('work/shorts/phrases.json', 'w'), ensure_ascii=False, indent=0)
json.dump(W, open('work/shorts/words_tiz.json', 'w'), ensure_ascii=False, indent=0)
ch = [o for o in out if o['spk'] != o['diar_globale']]
print('phrases', len(out), '| changées vs diarisation globale :', len(ch), '| à vérifier :', sum(o['a_verifier'] for o in out))
for o in ch[:60]: print(f"  {o['t0']:7.1f} {o['diar_globale']:6s}->{o['spk']:6s} au={o['audio']:+.2f} lv={o['levres']:+.1f} {o['texte'][:70]}")
