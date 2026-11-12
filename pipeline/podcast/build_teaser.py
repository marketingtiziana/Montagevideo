"""ÉTAPES 4 + 7 — Cold open / teaser (~30 s) avec sous-titres animés.
  * extraits : punchlines validées, dans l'ordre de config.json « teaser » (mini-arc : tension (invité)
    -> contre-point (hôte) -> réponse / conseil (invité)) ; silences déjà resserrés (timeline épisode)
  * dans chaque extrait : plans de 1,5 à 2,5 s coupés entre les mots : rapproché -> large -> rapproché 112 %
    (punch-in sec sur les mots forts)
  * entre deux extraits : whip-zoom de 7 images (4 en sortie 100 -> 130 % + flou directionnel croissant,
    3 en arrivée 120 -> 100 % net) + whoosh calé sur la coupe
  * musique synth-pop à -14 LUFS, ducking sous la voix (sidechaincompress ratio 4), mini-riser puis coupe sèche
  * sous-titres ASS : Montserrat ExtraBold Italic 78 px, blanc, contour 3 px, ombre 4 px à 60 %, 1-3 mots,
    pop 80 -> 108 -> 100 % en 120 ms, mots-clés en jaune
Sorties : work/teaser_v.mp4 (vidéo étalonnée), work/teaser.ass, work/teaser_audio.wav, work/teaser.json"""
import argparse, json, re, subprocess, unicodedata, wave
import numpy as np
from units import FPS, pieces, crop_rect, render_units, SEG

ap = argparse.ArgumentParser(); ap.add_argument('--preview', action='store_true'); ap.add_argument('--jobs', type=int, default=3)
a = ap.parse_args()
cfg = json.load(open('pipeline/podcast/config.json'))
ORDER = cfg.get('teaser', ['P2', 'P3', 'P1', 'P9'])
P = {p['id']: p for p in json.load(open('pipeline/podcast/punchlines.json'))}
W = json.load(open('work/ep_words.json'))
fr = lambda t: int(round(t * FPS))
CLOSE = {'hote': 'H', 'invite': 'I'}
norm = lambda s: unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode()
STRONG = re.compile(r"^(\d+|zero|evasion|fiscale|taxes|ou|ton|moment|dubai|france|salaire|jamais|impots?|couillonner|personne)$")

def src2ep(t):
    for g in SEG:
        if g['src0'] - 1e-3 <= t <= g['src1'] + 1e-3: return g['ep0'] / FPS + (t - g['src0'])
    # point dans une coupe : on prend le début du segment suivant
    nxt = [g for g in SEG if g['src0'] > t]; return nxt[0]['ep0'] / FPS if nxt else None

# ---------- 1. extraits -> plans
plan, clips = [], []
for pid in ORDER:
    p = dict(P[pid], **cfg.get('teaser_plages', {}).get(pid, {})); e0, e1 = src2ep(p['t0']), src2ep(p['t1'])
    ws = [w for w in W if e0 - 0.05 <= w['t0'] and w['t1'] <= e1 + 0.1]
    f0 = fr(ws[0]['t0']) - 3; f1 = fr(ws[-1]['t1']) + 6
    spk = max(('hote', 'invite'), key=lambda s: sum(w['t1'] - w['t0'] for w in ws if w['spk'] == s))
    # points de coupe : entre deux mots, plans de 1,5 à 2,5 s
    bounds = [f0]; gaps = [fr((x['t1'] + y['t0']) / 2) for x, y in zip(ws, ws[1:])]
    while (f1 - bounds[-1]) / FPS > 2.6:
        ok = [g for g in gaps if 1.5 <= (g - bounds[-1]) / FPS <= 2.5]
        bounds.append(min(ok, key=lambda g: abs((g - bounds[-1]) / FPS - 2.0)) if ok else bounds[-1] + fr(2.0))
    if (f1 - bounds[-1]) / FPS < 1.2 and len(bounds) > 1: bounds.pop()
    bounds.append(f1)
    cyc = ['C', 'L', 'Z']
    for k, (b0, b1) in enumerate(zip(bounds, bounds[1:])):
        inside = [w for w in ws if b0 <= fr(w['t0']) < b1]
        strong = any(STRONG.match(norm(w['w']).strip(" ,.?!'-%")) or '%' in w['w'] for w in inside)
        kind = cyc[k % 3]
        if strong and kind == 'L': kind = 'Z'
        spk_k = max(('hote', 'invite'), key=lambda s: sum(w['t1'] - w['t0'] for w in inside if w['spk'] == s)) if inside else spk
        cam = 'L' if kind == 'L' else CLOSE[spk_k]
        plan.append({'clip': pid, 'f0': b0, 'f1': b1, 'cam': cam, 'zoom': 1.12 if kind == 'Z' else 1.0})
    clips.append({'id': pid, 'f0': f0, 'f1': f1, 'spk': spk, 'words': ws})

# ---------- 2. unités vidéo (+ whip-zooms)
WHIP_OUT = [(1.06, 4), (1.13, 10), (1.21, 18), (1.30, 28)]
WHIP_IN = [(1.20, 18), (1.09, 8), (1.0, 0)]
units = []; t_cursor = 0; cut_times = []
for ci, c in enumerate(clips):
    shots = [s for s in plan if s['clip'] == c['id']]
    for si, s in enumerate(shots):
        full = pieces(s['f0'], s['f1']); iv = [(src, src + (b - a_) / FPS) for a_, b, src in full]
        whip_out = ci < len(clips) - 1 and si == len(shots) - 1
        whip_in = ci > 0 and si == 0
        for p0, p1, src in full:
            n = p1 - p0; start = 0; end = n
            if whip_in and p0 == full[0][0]:
                for k, (z, bl) in enumerate(WHIP_IN):
                    units.append({'src0': src + k / FPS, 'nfr': 1, 'rect': crop_rect(s['cam'], z * s['zoom'], iv), 'blur': bl}); start = len(WHIP_IN)
            tail = len(WHIP_OUT) if (whip_out and p1 == full[-1][1]) else 0
            if end - tail > start:
                units.append({'src0': src + start / FPS, 'nfr': end - tail - start, 'rect': crop_rect(s['cam'], s['zoom'], iv)})
            for k, (z, bl) in enumerate(WHIP_OUT if tail else []):
                units.append({'src0': src + (end - tail + k) / FPS, 'nfr': 1, 'rect': crop_rect(s['cam'], z * s['zoom'], iv), 'blur': bl})
    t_cursor += c['f1'] - c['f0']; cut_times.append(t_cursor)
N = render_units(units, 'work/teaser_v.mp4', preview=a.preview, jobs=a.jobs, tag='t')
DUR = N / FPS

# ---------- 3. audio : voix (fondus 10 ms) + musique (-14 LUFS, ducking) + whoosh + riser
def rd(p):
    w = wave.open(p); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, w.getnchannels()).astype(np.float32) / 32768
    return (x if x.shape[1] == 2 else np.repeat(x, 2, 1)), w.getframerate()
def wr(p, x, sr=48000):
    w = wave.open(p, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
V, SR = rd('work/ep_voice.wav'); fade = int(0.01 * SR); parts = []
for c in clips:
    seg = V[int(c['f0'] / FPS * SR):int(c['f0'] / FPS * SR) + int(round((c['f1'] - c['f0']) / FPS * SR))].copy()
    r = np.linspace(0, 1, fade)[:, None]; seg[:fade] *= r; seg[-fade:] *= r[::-1]; parts.append(seg)
voice = np.concatenate(parts); n = int(round(DUR * SR)); voice = np.pad(voice, ((0, max(0, n - len(voice))), (0, 0)))[:n]
wr('work/_t_voice.wav', voice)
fx = np.zeros((n, 2), np.float32)
wh, _ = rd('sfx/whoosh.wav'); ri, _ = rd('sfx/riser.wav')
for ct in cut_times[:-1]:
    i = int(ct / FPS * SR - 0.22 * SR); fx[i:i + len(wh)] += wh[:max(0, min(len(wh), n - i))] * 0.55
i = n - len(ri); fx[i:] += ri[:n - i] * 0.45
wr('work/_t_fx.wav', fx)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'assets/podcast/musique_teaser.wav', '-t', f'{DUR:.4f}',
                '-af', f"loudnorm=I={cfg.get('musique_teaser_lufs', -14)}:TP=-1.5:LRA=7", '-ar', '48000', '-ac', '2', 'work/_t_music.wav'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'work/_t_music.wav', '-i', 'work/_t_voice.wav', '-i', 'work/_t_fx.wav', '-filter_complex',
                '[1:a]asplit=2[v][sc];[0:a][sc]sidechaincompress=threshold=0.03:ratio=' + str(cfg.get('ducking_ratio', 4)) + ':attack=30:release=400:makeup=1[m];'
                '[m]volume=' + str(cfg.get('musique_teaser_gain_db', -5)) + 'dB[m2];[v][m2][2:a]amix=inputs=3:normalize=0:duration=first[o]',
                '-map', '[o]', '-ar', '48000', '-c:a', 'pcm_s16le', 'work/teaser_audio.wav'], check=True)

# ---------- 4. sous-titres ASS
FIX = {'exploitation': 'expatriation', 'ton': 'TON'}
toks = []
for ci, c in enumerate(clips):
    off = sum(x['f1'] - x['f0'] for x in clips[:ci]) - c['f0']
    for w in c['words']:
        t0, t1 = (fr(w['t0']) + off) / FPS, (fr(w['t1']) + off) / FPS
        s = w['w']
        if toks and (s.startswith("'") or s.startswith('-') or s in ('%', '?', '!', ',', '.')):
            toks[-1]['w'] += s if s not in ('%', '?', '!') else (' ' + s if s != '%' else ' %'); toks[-1]['t1'] = t1; continue
        toks.append({'w': s, 't0': t0, 't1': t1, 'clip': ci, 'spk': w['spk']})
for t in toks:
    core = re.sub(r"^[a-z]'", '', norm(t['w'])).strip(" ,.?!…")
    for k, v in FIX.items():
        if core == k: t['w'] = re.sub(k, v, t['w'], flags=re.I)
KEY = re.compile(r"(\d|%|zero|dubai|france|evasion|fiscale|taxes|salaire|ton|moment|francais|clients)")
WEAK = re.compile(r"^(de|d|a|au|aux|et|ou|que|qu|des|du|un|une|le|la|les|l|mes|mon|ma|ses|si|tu|je|il|elle|on|n'y|ce|c'est|en|dans|pour|par|avec|mais|parce|y)$")
cards, cur = [], []
for t in toks:
    cur.append(t)
    txt = ' '.join(x['w'] for x in cur)
    last = t is toks[-1] or toks[toks.index(t) + 1]['clip'] != t['clip']
    nxt0 = None if last else toks[toks.index(t) + 1]['t0']
    long_enough = last or nxt0 - cur[0]['t0'] >= 0.42
    if last or (long_enough and (len(cur) == 3 or len(txt) > 16 or t['w'][-1:] in ',.?!…')) or len(cur) == 4:
        carry = []
        isweak = lambda x: bool(WEAK.match(norm(x['w']).strip(" ,")) or re.fullmatch(r'\d+', x['w']))
        while (not last and len(cur) > 1 and isweak(cur[-1]) and cur[-1]['w'][-1:] not in ',.?!'
               and any(not isweak(x) for x in cur[:-1])):
            carry.insert(0, cur.pop())
        cards.append(cur); cur = carry
if cur: cards.append(cur)
def ts(x): return f"{int(x // 3600)}:{int(x % 3600 // 60):02d}:{x % 60:05.2f}"
L = ['[Script Info]', 'ScriptType: v4.00+', 'PlayResX: 1920', 'PlayResY: 1080', 'WrapStyle: 2', 'ScaledBorderAndShadow: yes', '',
     '[V4+ Styles]',
     'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
     'Style: Sub,Montserrat ExtraBold,78,&H00FFFFFF,&H00FFFFFF,&H00000000,&H66000000,0,-1,0,0,100,100,0,0,1,3,4,2,80,80,120,1', '',
     '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text']
# plans du teaser sur sa propre timeline -> caméra à l'instant de chaque carte
TSH = []
for ci, c in enumerate(clips):
    off = sum(x['f1'] - x['f0'] for x in clips[:ci]) - c['f0']
    TSH += [((p_['f0'] + off) / FPS, (p_['f1'] + off) / FPS, p_['cam']) for p_ in plan if p_['clip'] == c['id']]
# position horizontale : sous la personne qui parle (gauche = invitée, droite = hôte, cf. cadrages)
XPOS = {(c_, 'invite'): 0.32 for c_ in 'LIH'} | {(c_, 'hote'): 0.68 for c_ in 'LIH'}
if cfg.get('cote_hote', 'droite') == 'gauche': XPOS = {(c_, s_): 1 - x_ for (c_, s_), x_ in XPOS.items()}
for k, cd in enumerate(cards):
    t0 = cd[0]['t0']; t1 = cards[k + 1][0]['t0'] if k + 1 < len(cards) and cards[k + 1][0]['clip'] == cd[0]['clip'] else cd[-1]['t1'] + 0.15
    spk = max(('hote', 'invite'), key=lambda s_: sum(x['t1'] - x['t0'] for x in cd if x['spk'] == s_))
    cam = next((c_ for a_, b_, c_ in TSH if a_ <= t0 + 0.02 < b_), 'L')
    X = int(XPOS.get((cam, spk), 0.5) * 1920)
    words = []
    for x in cd:                       # mots révélés au rythme de la parole, mots-clés jaunes avec rebond
        core = norm(x['w']).strip(" ,.?!…")
        w = x['w'].replace('{', '').replace('}', '')
        dt = max(0, int((x['t0'] - t0) * 1000))
        rev = f'{{\\alpha&HFF&\\t({dt},{dt + 50},\\alpha&H00&)}}' if dt > 30 else ''
        if KEY.search(re.sub(r"^[a-z]'", '', core)):
            words.append(rev + f'{{\\c&H00CCFF&\\fscx135\\fscy135\\t({dt},{dt + 140},\\fscx100\\fscy100)}}' + w + '{\\c&HFFFFFF&\\fscx100\\fscy100}')
        else:
            words.append(rev + w)
    anim = (f'{{\\an2\\pos({X},960)\\fscx45\\fscy45\\frz-7\\t(0,90,\\fscx116\\fscy116\\frz2)'
            f'\\t(90,170,\\fscx100\\fscy100\\frz0)\\fad(0,60)}}')
    txt = anim + ' '.join(words)
    if not (k + 1 < len(cards) and cards[k + 1][0]['clip'] == cd[0]['clip']): t1 = max(t1, t0 + 0.25)
    L.append(f"Dialogue: 0,{ts(t0)},{ts(t1)},Sub,,0,0,0,,{txt}")
open('work/teaser.ass', 'w').write('\n'.join(L) + '\n')
json.dump({'duree_s': DUR, 'images': N, 'extraits': [{'id': c['id'], 'images': c['f1'] - c['f0']} for c in clips],
           'plans': plan, 'cartes': len(cards)}, open('work/teaser.json', 'w'), indent=1, ensure_ascii=False)
print(f'teaser {DUR:.2f} s, {len(plan)} plans, {len(cards)} cartes de sous-titres, coupes {[round(c / FPS, 2) for c in cut_times]}')
