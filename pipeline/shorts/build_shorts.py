"""SHORTS TIZIANA — étapes 4 à 9 : sélection, nettoyage des silences, recadrage 9:16, sous-titres, rendu, contrôle.
Prérequis : pipeline/podcast (transcription, diarisation, visages YuNet) puis pipeline/shorts/speakers.py.
  * contenu : uniquement les mots attribués à Tiziana (spk2 = invite) entre les ancres de shorts.json ;
    les relances de l'hôte au milieu sont retirées ; les coupes éditoriales du podcast (pôle France…) aussi
  * silences : pause > 0,8 s -> ~0,4 s (0,2 s gardé après le dernier mot, 0,2 s avant le suivant), points de
    coupe recalés dans un creux d'énergie, fondus de 8 ms ; voix ni accélérée ni modifiée
  * image : recadrage fixe 9:16 centré sur le visage de Tiziana (médiane YuNet sur le Short), 1080x1920 lanczos
  * son : audio original, gain seul (loudnorm linéaire -14 LUFS, -1 dBTP), aucun effet, aucune musique
  * sous-titres : blancs, centrés, Montserrat ExtraBold, contour noir fin + ombre légère, 2 lignes max, zone
    centrale sous le visage (ne couvre ni les yeux ni la bouche), aucune animation, aucune couleur
Sortie : output/tiziana_shorts/short_XX/{short_XX.mp4, subtitles.srt} + manifest, rapports, planche contact."""
import argparse, csv, json, os, re, subprocess, unicodedata, wave, concurrent.futures as cf
import numpy as np

ap = argparse.ArgumentParser(); ap.add_argument('--only', type=int, nargs='*'); ap.add_argument('--jobs', type=int, default=3)
ap.add_argument('--plan', action='store_true', help='calcule seulement les découpes (sans rendu)')
ap.add_argument('--subs-only', action='store_true', help='refait seulement sous-titres + mixage final (image et son réutilisés)')
a = ap.parse_args()
FPS_N, FPS_D = 30000, 1001; FPS = FPS_N / FPS_D
SW, SH, OW, OH = 3840, 2160, 1080, 1920
OUT = 'output/tiziana_shorts'; TMP = 'work/shorts'; os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)
CFG = json.load(open('pipeline/shorts/shorts.json'))
W = json.load(open('work/shorts/words_tiz.json'))
PH = json.load(open('work/shorts/phrases.json'))
ST = json.load(open('pipeline/podcast/structure.json'))
EDITO = [c for c in ST['coupes'] + ST.get('coupes_supplementaires', []) if c['t0'] > 1]
V = json.load(open('work/visual.json')); FACE = np.array(V['faces']['gauche'])    # Tiziana = à GAUCHE
w_ = wave.open('work/audio48.wav'); SR = w_.getframerate()
A = np.frombuffer(w_.readframes(w_.getnframes()), np.int16).reshape(-1, 2).astype(np.float32) / 32768
MONO = A.mean(1); HOP = int(0.005 * SR); NE = len(MONO) // HOP
ENV = 20 * np.log10(np.convolve(np.sqrt((MONO[:NE * HOP].reshape(NE, HOP) ** 2).mean(1)), np.ones(4) / 4, 'same') + 1e-9)
nz = lambda s: re.sub(r"[^a-z0-9%]", '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
TOK = [nz(w['w']) for w in W]
BACK = re.compile(r"^(tresbien|tresclair|daccord|ok|ahouais|ouais|ouicestvrai|ouioui|cestvrai|exactement|oui)$")
def phrase_of(w):
    return next((p for p in PH if p['t0'] - 0.01 <= w['t0'] and w['t1'] <= p['t1'] + 0.01), None)
def relance_hote(w):
    p = phrase_of(w)
    return bool(p and BACK.match(nz(p['texte'])) and (p['a_verifier'] or p['audio'] < 0.12) and p['levres'] <= 0.6)
in_edito = lambda t: any(c['t0'] <= t <= c['t1'] for c in EDITO)

def find(phrase, start, end_after=None):
    tgt = nz(phrase)
    for i in range(len(W)):
        if W[i]['t0'] < start: continue
        acc, j = '', i
        while j < len(W) and len(acc) < len(tgt): acc += TOK[j]; j += 1
        if acc.startswith(tgt) and acc.startswith(TOK[i]): return i, j - 1
    raise SystemExit(f'ancre introuvable : « {phrase} » après {start}')

def valley(lo, hi, prefer):
    """point le plus calme de [lo, hi] (5 ms), biaisé vers 'prefer'"""
    i0, i1 = int(max(lo, 0) / 0.005), int(hi / 0.005)
    if i1 <= i0: return prefer
    seg = ENV[i0:i1] + 0.02 * np.abs(np.arange(i0, i1) * 0.005 - prefer) / 0.005
    return (i0 + int(np.argmin(seg))) * 0.005

def plan_short(s):
    idx = []
    for d, f in s['garder']:
        i0, _ = find(d, s['apres']); _, i1 = find(f, W[i0]['t0'])
        idx += list(range(i0, i1 + 1))
    words = [W[i] for i in idx]
    # bords de Short : 1-2 mots attribués à l'hôte, collés sans pause à la parole de Tiziana -> gardés, « à vérifier »
    edge = set()
    for seq in (words, words[::-1]):
        k = 0
        while k < 2 and k < len(seq) - 1 and seq[k]['spk2'] != 'invite' and seq[k + 1]['spk2'] == 'invite' \
                and abs(seq[k + 1]['t0'] - seq[k]['t1']) < 0.12 and abs(seq[k + 1]['t1'] - seq[k]['t0']) > 0: edge.add(id(seq[k])); k += 1
        if k == 0 and len(seq) > 2 and seq[0]['spk2'] != 'invite' and seq[1]['spk2'] != 'invite' and seq[2]['spk2'] == 'invite' \
                and seq[2]['t0'] - seq[1]['t1'] < 0.12 and seq[1]['t0'] - seq[0]['t1'] < 0.12: edge |= {id(seq[0]), id(seq[1])}
    kept, removed = [], []
    for w in words:
        if w['w'].strip() in ('?', '!', '.', ','):
            if kept and not removed or kept: kept.append(w) if kept and kept[-1]['t1'] >= w['t0'] - 0.3 else None
            continue
        if in_edito((w['t0'] + w['t1']) / 2): removed.append(('éditorial', w)); continue
        if w['spk2'] != 'invite' and id(w) not in edge: removed.append(('hôte', w)); continue
        if relance_hote(w): removed.append(('hôte (relance)', w)); continue
        if id(w) in edge: w = dict(w, verif=True, bord=True)
        kept.append(w)
    # runs : coupure si un mot retiré s'intercale ou si pause > 0,8 s
    rid = {id(w) for _, w in removed}; order = {id(w): k for k, w in enumerate(words)}
    runs, cur = [], [kept[0]]
    for p, q in zip(kept, kept[1:]):
        between = any(order[id(p)] < order[id(x)] < order[id(q)] for _, x in removed)
        if between or q['t0'] - p['t1'] > 0.8: runs.append((cur, 'hôte/éditorial' if between else 'pause')); cur = []
        cur.append(q)
    runs.append((cur, 'fin'))
    ivs = []
    for k, (r, why) in enumerate(runs):
        first, last = r[0], r[-1]
        gi0, gi1 = W.index(next(x for x in W if x['t0'] == first['t0'] and x['w'] == first['w'])), \
                   W.index(next(x for x in W if x['t0'] == last['t0'] and x['w'] == last['w']))
        before = [x['t1'] for x in W[max(0, gi0 - 3):gi0] if x['w'].strip() not in ('?', '!', '.', ',')]
        after = [x['t0'] for x in W[gi1 + 1:gi1 + 4] if x['w'].strip() not in ('?', '!', '.', ',')]
        prev_end = max([x['t1'] for _, x in removed if x['t1'] <= first['t0'] + 0.05] + before[-1:] + [first['t0'] - 0.35])
        nxt = [x['t0'] for _, x in removed if x['t0'] >= last['t1'] - 0.05] + after[:1] + [last['t1'] + 0.45]
        lo = max(prev_end + 0.02, first['t0'] - (0.22 if k else 0.15)); hi0 = first['t0'] + 0.01
        s0 = valley(lo, hi0, first['t0'] - 0.06) if lo < hi0 else max(prev_end + 0.01, first['t0'] - 0.01)
        cap = min(nxt) - 0.02                                    # jamais au-delà du début d'un mot retiré
        hi = min(cap, last['t1'] + (0.30 if k == len(runs) - 1 else 0.22)); lo1 = min(last['t1'] + 0.04, cap)
        s1 = valley(lo1, hi, last['t1'] + 0.15) if lo1 < hi else min(cap, last['t1'] + 0.02)
        nfr = max(2, int(np.floor((s1 - s0) * FPS)))                # arrondi vers le bas : la coupe reste avant s1
        ivs.append({'src0': round(s0, 4), 'nfr': nfr, 'src1': round(s0 + nfr / FPS, 4), 'raison_coupe_apres': why})
    if s.get('debut_source'):                       # début imposé (vérifié à l'écoute / reconnaissance vocale)
        iv = ivs[0]; iv['src0'] = s['debut_source']; iv['nfr'] = max(2, int(np.floor((iv['src1'] - iv['src0']) * FPS)))
        iv['src1'] = round(iv['src0'] + iv['nfr'] / FPS, 4)
    return {'words': kept, 'removed': removed, 'ivs': ivs}

_ASR = {}
PROMPT = ("Podcast. Tiziana, fondatrice de FYNOVATES, cabinet fiscal et d'expatriation : Dubaï, Bali, Espagne, Thaïlande, "
          "digital nomade, TVA, B2B, B2C, établissement stable, 182 jours, burn-out, entrepreneuriat.")
def aligned_tokens(wav, ref_words, tmap):
    """texte = transcription d'origine (contexte complet, meilleure qualité) ; horodatages = mots réellement
    entendus dans le son du Short, alignés mot à mot (difflib) ; mots non retrouvés : interpolés entre voisins"""
    import difflib
    orig = [tk for tk in tokens(ref_words, tmap) if tk['t0'] is not None]
    heard = heard_tokens(wav, None)
    a = [nz(x['w']) for x in orig]; b = [nz(x['w']) for x in heard]
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    got = [None] * len(orig)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size): got[blk.a + k] = heard[blk.b + k]
    PUN = ',.?!…'
    for i, h in enumerate(got):
        if h:
            orig[i]['t0'], orig[i]['t1'] = h['t0'], h['t1']
            # ponctuation : on reprend celle entendue quand le texte d'origine n'en a pas
            if orig[i]['w'][-1:] not in PUN and h['w'][-1:] in PUN:
                orig[i]['w'] += (' ' if h['w'][-1] in '?!' else '') + h['w'][-1]
            if i + 1 < len(orig) and h['w'][-1:] in '.?!' and orig[i + 1]['w'][:1].islower() and orig[i]['w'][-1:] in '.?!':
                orig[i + 1]['w'] = orig[i + 1]['w'][:1].upper() + orig[i + 1]['w'][1:]
    if orig and orig[-1]['w'][-1:] not in '.?!…': orig[-1]['w'] = orig[-1]['w'].rstrip(',') + '.'
    # interpolation des mots non alignés entre les voisins alignés (bornée par l'ordre)
    idx = [i for i, h in enumerate(got) if h]
    for i in range(len(orig)):
        if got[i]: continue
        lo = max([j for j in idx if j < i], default=None); hi = min([j for j in idx if j > i], default=None)
        if lo is not None and hi is not None:
            n = hi - lo; t0, t1 = orig[lo]['t1'], orig[hi]['t0']
            orig[i]['t0'] = t0 + (t1 - t0) * (i - lo) / n; orig[i]['t1'] = t0 + (t1 - t0) * (i - lo + 1) / n
    print(f"  alignement : {len(idx)}/{len(orig)} mots retrouvés dans le son")
    return orig
def heard_tokens(wav, ref_words):
    """mots + horodatages réellement entendus dans le son du Short (faster-whisper, contexte = texte d'origine)"""
    if 'm' not in _ASR:
        from faster_whisper import WhisperModel
        _ASR['m'] = WhisperModel('models/fw-large-v3-turbo', device='cpu', compute_type='int8')
    import librosa
    y, _ = librosa.load(wav, sr=16000, mono=True)
    sg, _ = _ASR['m'].transcribe(y, language='fr', word_timestamps=True, condition_on_previous_text=False,
                                 initial_prompt=PROMPT, vad_filter=False)
    ws = [{'w': x.word.strip(), 't0': x.start, 't1': x.end} for z in sg for x in z.words if x.word.strip()]
    return tokens(ws, lambda tt: tt)
_w16 = wave.open('work/audio16.wav'); Y16 = np.frombuffer(_w16.readframes(_w16.getnframes()), np.int16).astype(np.float32) / 32768
def first_heard(t):
    if 'm' not in _ASR:
        from faster_whisper import WhisperModel
        _ASR['m'] = WhisperModel('models/fw-large-v3-turbo', device='cpu', compute_type='int8')
    seg = Y16[int(t * 16000):int((t + 3.0) * 16000)].copy(); f = int(0.008 * 16000); seg[:f] *= np.linspace(0, 1, f)
    sg, _ = _ASR['m'].transcribe(seg, language='fr', condition_on_previous_text=False, word_timestamps=True)
    ws = [x.word for z in sg for x in z.words]
    return nz(ws[0]) if ws else ''

# ------------------------------------------------------------------ recadrage 9:16 sur Tiziana
def crop_for(ivs):
    m = np.zeros(len(FACE), bool)
    for iv in ivs: m |= (FACE[:, 0] >= iv['src0'] - 1) & (FACE[:, 0] <= iv['src1'] + 1)
    F = FACE[m] if m.sum() >= 3 else FACE
    cx, cy, fh = np.median(F[:, 1]) * SW, np.median(F[:, 2]) * SH, np.median(F[:, 4]) * SH
    hc = int(np.clip(fh * 5.0, 1300, SH)) // 4 * 4; wc = int(hc * 9 / 16) // 2 * 2
    x = int(np.clip(cx - wc / 2, 0, SW - wc)) // 2 * 2; y = int(np.clip(cy - 0.28 * hc, 0, SH - hc)) // 2 * 2
    return x, y, wc, hc, {'cx': round(cx), 'cy': round(cy), 'visage_h_px': round(fh)}

# ------------------------------------------------------------------ sous-titres
WEAK = re.compile(r"^(de|d|a|à|au|aux|et|ou|que|qu|des|du|un|une|le|la|les|l|mes|mon|ma|ses|si|tu|je|il|elle|on|ce|en|dans|pour|par|avec|mais|parce|y|n|ne|pas)$")
def tokens(words, tmap):
    toks = []
    for w in words:
        s = w['w'].strip()
        t0, t1 = tmap(w['t0']), tmap(w['t1'])
        if toks and (s.startswith("'") or s.startswith('-') or s in ('%', '?', '!', ',', '.', '…')):
            toks[-1]['w'] += ('' if s[0] in "'-" else (' ' if s in ('?', '!', '%') else '')) + s; toks[-1]['t1'] = t1; continue
        toks.append({'w': s, 't0': t0, 't1': t1})
    return toks
def fix(txt):
    for k, v in CFG['corrections_sous_titres'].items(): txt = re.sub(re.escape(k), v, txt, flags=re.I)
    txt = re.sub(r"\s+([,.])", r"\1", txt); txt = re.sub(r"\s*([?!])", r" \1", txt).replace("  ", " ")
    return txt.strip()
def cards(toks, dur):
    out, cur = [], []
    for k, t in enumerate(toks):
        cur.append(t); txt = ' '.join(x['w'] for x in cur)
        nxt = toks[k + 1] if k + 1 < len(toks) else None
        end = nxt is None or (nxt['t0'] - t['t1'] > 0.55) or (t['w'][-1] in '.?!' and len(txt) >= 10) or len(txt) >= 38
        if end and nxt is not None and len(cur) > 1 and WEAK.match(nz(cur[-1]['w'])) and t['w'][-1] not in ',.?!':
            carry = cur.pop(); out.append(cur); cur = [carry]; continue
        if end: out.append(cur); cur = []
    if cur: out.append(cur)
    res = []
    for k, c in enumerate(out):
        txt = fix(' '.join(x['w'] for x in c))
        if k == 0 or (res and res[-1]['txt'][-1:] in '.?!'): txt = txt[:1].upper() + txt[1:]
        t0 = c[0]['t0']; t1 = out[k + 1][0]['t0'] if k + 1 < len(out) else min(dur, c[-1]['t1'] + 0.5)
        t1 = min(t1, c[-1]['t1'] + 0.9) if k + 1 < len(out) else t1
        res.append({'t0': max(0, t0 - 0.05), 't1': max(t1, t0 + 0.7), 'txt': txt})
    for p, q in zip(res, res[1:]): p['t1'] = min(p['t1'], q['t0'])
    return res
def two_lines(txt):
    if len(txt) <= 22: return txt
    ws = txt.split(' '); best, bi = 1e9, 1
    for i in range(1, len(ws)):
        l1, l2 = ' '.join(ws[:i]), ' '.join(ws[i:]); sc = abs(len(l1) - len(l2)) + (8 if WEAK.match(nz(ws[i - 1])) else 0)
        if sc < best: best, bi = sc, i
    return ' '.join(ws[:bi]) + '\\N' + ' '.join(ws[bi:])
SUB_Y = 1180
def write_subs(cs, ass, srt):
    ts = lambda x: f"{int(x // 3600)}:{int(x % 3600 // 60):02d}:{x % 60:05.2f}"
    L = ['[Script Info]', 'ScriptType: v4.00+', f'PlayResX: {OW}', f'PlayResY: {OH}', 'WrapStyle: 2', 'ScaledBorderAndShadow: yes', '',
         '[V4+ Styles]', 'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
         'Style: S,Montserrat XB,68,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,3,2,5,70,70,0,1', '',
         '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text']
    for c in cs: L.append(f"Dialogue: 0,{ts(c['t0'])},{ts(c['t1'])},S,,0,0,0,,{{\\pos(540,{SUB_Y})}}{two_lines(c['txt'])}")
    open(ass, 'w').write('\n'.join(L) + '\n')
    st = lambda x: f"{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(round((x % 1) * 1000)) % 1000:03d}"
    with open(srt, 'w') as f:
        for k, c in enumerate(cs, 1): f.write(f"{k}\n{st(c['t0'])} --> {st(c['t1'])}\n{two_lines(c['txt']).replace(chr(92) + 'N', chr(10))}\n\n")

# ------------------------------------------------------------------ rendu
def run(cmd): subprocess.run(cmd, check=True)
def nb_frames(p):
    return int(subprocess.check_output(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v', '-show_entries',
                                        'stream=nb_read_packets', '-of', 'csv=p=0', p]).strip())
def render(s, P):
    sid = f"short_{s['id']:02d}"; d = f'{OUT}/{sid}'; os.makedirs(d, exist_ok=True); t = f'{TMP}/{sid}'; os.makedirs(t, exist_ok=True)
    x, y, wc, hc, info = crop_for(P['ivs'])
    parts = []
    reuse = a.subs_only and all(os.path.exists(f'{t}/{f}') for f in ('video.mp4', 'raw.wav', 'audio.wav'))
    for k, iv in enumerate([] if reuse else P['ivs']):
        o = f'{t}/p{k:02d}.mp4'
        run(['ffmpeg', '-v', 'error', '-y', '-ss', f"{iv['src0']:.4f}", '-i', 'source.mp4', '-an', '-vf',
             f'fps={FPS_N}/{FPS_D},crop={wc}:{hc}:{x}:{y},scale={OW}:{OH}:flags=lanczos,format=yuv420p',
             '-frames:v', str(iv['nfr']), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '12', o])
        assert nb_frames(o) == iv['nfr'], (sid, k)
        parts.append(o)
    if not reuse:
        open(f'{t}/list.txt', 'w').write(''.join(f"file '{os.path.basename(p)}'\n" for p in parts))
        run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{t}/list.txt', '-c', 'copy', f'{t}/video.mp4'])
    # audio original + fondus 8 ms
    fade = int(0.008 * SR); seg = []
    for k_, iv in enumerate(P['ivs']):
        i0 = int(round(iv['src0'] * SR)); n = int(round(iv['nfr'] / FPS * SR)); p = A[i0:i0 + n].copy()
        fi = int(0.030 * SR) if k_ == 0 else fade
        p[:fi] *= np.linspace(0, 1, fi)[:, None]; r = np.linspace(0, 1, fade)[:, None]; p[-fade:] *= r[::-1]; seg.append(p)
    au = np.concatenate(seg); ww = wave.open(f'{t}/raw.wav', 'wb'); ww.setnchannels(2); ww.setsampwidth(2); ww.setframerate(SR)
    ww.writeframes((np.clip(au, -1, 1) * 32767).astype(np.int16).tobytes()); ww.close()
    o = subprocess.run(['ffmpeg', '-nostats', '-i', f'{t}/raw.wav', '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    m = json.loads(o[o.rfind('{'):o.rfind('}') + 1])
    ln = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    # limiteur doux de sécurité (crêtes après encodage AAC), transparent sur la voix
    run(['ffmpeg', '-v', 'error', '-y', '-i', f'{t}/raw.wav', '-af', ln + ',alimiter=limit=0.79:attack=1:release=50:level=false,aresample=48000', '-c:a', 'pcm_s16le', f'{t}/audio.wav'])
    # sous-titres (timeline du Short)
    offs, acc = [], 0
    for iv in P['ivs']: offs.append(acc); acc += iv['nfr'] / FPS
    def tmap(tt):
        for iv, of in zip(P['ivs'], offs):
            if iv['src0'] - 0.3 <= tt <= iv['src1'] + 0.3: return max(0.0, of + tt - iv['src0'])
        return None
    toks = aligned_tokens(f'{t}/raw.wav', P['words'], tmap)
    cs = cards(toks, acc); write_subs(cs, f'{t}/subs.ass', f'{d}/subtitles.srt')
    run(['ffmpeg', '-v', 'error', '-y', '-i', f'{t}/video.mp4', '-i', f'{t}/audio.wav', '-vf', f'subtitles={t}/subs.ass:fontsdir=fonts',
         '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
         '-r', f'{FPS_N}/{FPS_D}', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', f'{d}/{sid}.mp4'])
    return {'id': s['id'], 'crop': [x, y, wc, hc], 'visage': info, 'duree': acc, 'cartes': cs, 'loudnorm_mesure': m}

if __name__ == '__main__':
    shorts = [s for s in CFG['shorts'] if not a.only or s['id'] in a.only]
    plans = {s['id']: plan_short(s) for s in shorts}
    for s in shorts:
        P = plans[s['id']]; dur = sum(iv['nfr'] for iv in P['ivs']) / FPS
        raw = P['words'][-1]['t1'] - P['words'][0]['t0']
        print(f"#{s['id']:02d} {dur:5.1f}s (brut {raw:5.1f}s, {len(P['ivs'])} morceaux, retirés : "
              f"{sum(1 for r, _ in P['removed'] if r == 'hôte')} mots hôte, {sum(1 for r, _ in P['removed'] if r != 'hôte')} éditoriaux) {s['titre']}")
        for r, w in P['removed']: print(f"      - {r}: {w['w']} ({w['t0']:.2f})")
    _old = json.load(open(f'{TMP}/plans.json')) if os.path.exists(f'{TMP}/plans.json') else {}
    _old.update({str(k): {'ivs': v['ivs'], 'removed': [[r, w['w'], w['t0']] for r, w in v['removed']],
                        'words': [[w['w'], w['t0'], w['t1'], w.get('conf2'), w.get('verif')] for w in v['words']]} for k, v in plans.items()})
    json.dump(_old, open(f'{TMP}/plans.json', 'w'), ensure_ascii=False, indent=0)
    if a.plan: raise SystemExit
    with cf.ThreadPoolExecutor(a.jobs) as ex:
        res = list(ex.map(lambda s: render(s, plans[s['id']]), shorts))
    old = json.load(open(f'{TMP}/render.json')) if os.path.exists(f'{TMP}/render.json') else {}
    old.update({str(r['id']): r for r in res}); json.dump(old, open(f'{TMP}/render.json', 'w'), ensure_ascii=False, indent=0)
    print('rendu OK :', [r['id'] for r in res])
