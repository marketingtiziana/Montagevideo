"""Usine à Shorts 9:16 (1080x1920) : moitié haute = intervenante (vidéo + son d'origine synchronisés),
moitié basse = motion design piloté par le manifeste, sous-titres FR, son traité + fond musical discret.

usage : python3 engine.py short_01 [--preview] [--stage panel|presenter|audio|subs|compose|all]
"""
import json, os, sys, subprocess, numpy as np, cv2, wave
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)
from manifest import SHORTS
import devices
TOP_H, PAN_H = 760, 1160
CTA_F = int(round(devices.CTA_DUR * 25))      # images ajoutées après la dernière phrase pour l'appel à l'action
FPS = 25
MEZZ = os.environ.get('V5_MEZZ')                     # rush extrait (t=0 <=> 1:00:10)
VOICE = os.path.join(ROOT, 'build', 'media', 'voice_proc.wav')
BUILD = os.path.join(HERE, 'build'); OUT = os.path.join(HERE, 'output')
GRADE = ("curves=master='0/0.015 0.2/0.19 0.5/0.505 0.8/0.81 0.93/0.905 1/0.94',"
         "colorbalance=rs=-0.01:bs=0.01:rh=-0.012:bh=0.008,eq=saturation=1.03:contrast=1.02")
# cadrages verticaux (recadrage du 16:9 vers 1080x960, visage centré) : (largeur, x, y)
VFRAMES = {'V': (1535, 113, 0), 'VC': (1290, 235, 24)}

def segments(a, b):
    """Plans gardés dans [a, b] (mêmes coupes d'hésitations et de silences que le montage YouTube)."""
    edl = json.load(open(os.path.join(ROOT, 'build', 'edl.json')))
    out = []
    for s, e in edl:
        s2, e2 = max(s, a), min(e, b)
        if e2 - s2 > 0.2: out.append((round(s2 * FPS), round(e2 * FPS)))
    return out

def picture_segments(segs, min_len=2.2):
    import subs as SB
    W = SB.load_words(); cuts = []
    for w in W:
        if w['w'].strip()[-1:] in '.?!': cuts.append(round((w['e'] + 0.12) * FPS))
    out = []
    for s, e in segs:
        a = s
        for c in cuts:
            if a + min_len * FPS < c < e - min_len * FPS: out.append((a, c)); a = c
        out.append((a, e))
    # plans encore trop longs (> 8 s) : coupe image supplémentaire sur une virgule proche du milieu
    commas = [round((w['e'] + 0.08) * FPS) for w in W if w['w'].strip()[-1:] == ',']
    res = []
    for a, e in out:
        while (e - a) > 8 * FPS:
            mid = (a + e) / 2; cand = [c for c in commas if a + min_len * FPS < c < e - min_len * FPS]
            if not cand: break
            c = min(cand, key=lambda c: abs(c - mid)); res.append((a, c)); a = c
        res.append((a, e))
    return res

def mapper(segs):
    starts, acc = [], 0
    for s, e in segs: starts.append(acc); acc += e - s
    def o(t):
        f = t * FPS
        for (s, e), st in zip(segs, starts):
            if f < s: return st / FPS
            if f < e: return (st + f - s) / FPS
        return acc / FPS
    return o, acc

def stage_presenter(sh, segs):
    d = os.path.join(BUILD, sh['id']); os.makedirs(d, exist_ok=True)
    parts = []
    for i, (s, e) in enumerate(segs):
        fr = 'V' if i % 2 == 0 else 'VC'
        w, x, y = VFRAMES[fr]; h = round(w * TOP_H / 1080)
        out = os.path.join(d, f'p{i:02d}.mp4'); parts.append(out)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{s/FPS:.4f}', '-i', MEZZ, '-frames:v', str(e - s), '-an',
                        '-vf', f'crop={w}:{h}:{x}:{y},scale=1080:760:flags=lanczos,{GRADE},format=yuv420p',
                        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-r', str(FPS), out], check=True)
    lst = os.path.join(d, 'list.txt'); open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', os.path.join(d, 'top.mp4')], check=True)

def stage_panel(sh, o, total):
    d = os.path.join(BUILD, sh['id'], 'panel'); os.makedirs(d, exist_ok=True)
    page = os.path.join(d, 'index.html'); open(page, 'w').write(devices.build(sh, o, total / FPS))
    env = dict(os.environ, VW='1080', VH='1160')
    subprocess.run(['node', os.path.join(ROOT, 'assets', 'render.js'), page, d, f'{total / FPS:.3f}', str(FPS)], check=True, env=env)

def read_wav(p, sr=48000):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', str(sr), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def write_wav(p, x, sr=48000):
    y = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(p, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(y.tobytes())

def stage_audio(sh, segs, o, total):
    import mix as M
    SR = 48000; d = os.path.join(BUILD, sh['id'])
    v = read_wav(VOICE); n = int((total + CTA_F) / FPS * SR); out = np.zeros(n + SR, np.float32)
    fade = int(.008 * SR); ramp = np.linspace(0, 1, fade, dtype=np.float32); pos = 0
    for s, e in segs:      # même découpe image/son : synchronisation conservée à l'échantillon près
        seg = v[int(s / FPS * SR):int(e / FPS * SR)].copy(); seg[:fade] *= ramp; seg[-fade:] *= ramp[::-1]
        out[pos:pos + len(seg)] += seg; pos += len(seg)
    write_wav(os.path.join(d, 'voice.wav'), out[:n])
    mus = M.music_calm(n) * 0.35
    mus[:SR // 2] *= np.linspace(0, 1, SR // 2); mus[-SR:] *= np.linspace(1, 0, SR)
    sfx = np.zeros(n + SR, np.float32)
    for i, s in enumerate(sh['scenes']):
        t = o(s['t0']); k = int(max(0, t - .15) * SR); w = M.whoosh(.4, seed=i) * .45; sfx[k:k + len(w)] += w[:len(sfx) - k]
    write_wav(os.path.join(d, 'music.wav'), mus); write_wav(os.path.join(d, 'sfx.wav'), sfx[:n])
    fc = ("[0:a]asplit=2[v][vk];[1:a][vk]sidechaincompress=threshold=0.015:ratio=5:attack=30:release=450[md];"
          "[v][md][2:a]amix=inputs=3:normalize=0:duration=first,loudnorm=I=-14:TP=-1.0:LRA=9")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(d, 'voice.wav'), '-i', os.path.join(d, 'music.wav'), '-i', os.path.join(d, 'sfx.wav'),
                    '-filter_complex', fc, '-ar', str(SR), os.path.join(d, 'mix.wav')], check=True)

def stage_subs(sh, segs, o, total):
    import subs as SB
    words = SB.load_words()
    seg_s = [(s / FPS, e / FPS) for s, e in segs]
    def mp(t):
        for s, e in seg_s:
            if s <= t < e: return o(t)
        return None
    cues = SB.make_cues(SB.words_of(SB.apply_fixes(SB.stream(words, sh['src'][0], sh['src'][1], mp))), maxlen=58)
    for i, c in enumerate(cues):
        c['text'] = SB.nbsp(c['text'])
        if i == 0 or cues[i-1]['text'].rstrip()[-1:] in '.?!': c['text'] = c['text'][:1].upper() + c['text'][1:]
    os.makedirs(os.path.join(OUT, 'subtitles'), exist_ok=True)
    with open(os.path.join(OUT, 'subtitles', f"{sh['id']}.srt"), 'w') as f:
        for i, c in enumerate(cues, 1):
            f.write(f"{i}\n{SB.ts_srt(c['s'])} --> {SB.ts_srt(c['e'])}\n" + '\n'.join(SB.two_lines(c['text'], 30)) + "\n\n")
    import re
    hl = re.compile('|'.join(f'(?:{h})' for h in SB.HIGHLIGHT))
    head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: S,Inter SemiBold,52,&H00FFFFFF,&H00FFFFFF,&H50100820,&H96000000,0,0,0,0,100,100,0.2,0,1,3,1.8,2,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    with open(os.path.join(BUILD, sh['id'], 'subs.ass'), 'w') as f:
        f.write(head)
        for c in cues:
            lines = SB.two_lines(c['text'], 30)
            txt = r'\N'.join(lines)   # même style que la vidéo YouTube : sans bandeau ni surlignage
            f.write(f"Dialogue: 0,{SB.ts_ass(c['s'])},{SB.ts_ass(min(c['e'], total / FPS - 0.04))},S,,0,0,0,,{{\\pos(540,736)\\fad(80,80)}}{txt}\n")

CTA_DIR = os.path.join(BUILD, 'cta_full')   # carton CTA 1080x1920 (logo YouTube), rendu une fois

def stage_compose(sh, segs, total, preview=False):
    d = os.path.join(BUILD, sh['id'])
    starts, acc = [], 0
    for s, e in segs: starts.append(acc / FPS); acc += e - s
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', os.path.join(d, 'top.mp4'), '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], stdout=subprocess.PIPE)
    outf = os.path.join(OUT, 'previews' if preview else 'shorts', f"{sh['id']}{'_preview' if preview else ''}.mp4")
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', '1080x1920', '-r', str(FPS), '-i', '-',
                            '-i', os.path.join(d, 'mix.wav'), '-vf', f"ass='{os.path.join(d, 'subs.ass')}'", '-map', '0:v', '-map', '1:a',
                            '-c:v', 'libx264', '-preset', 'faster' if preview else 'medium', '-crf', '23' if preview else '18', '-pix_fmt', 'yuv420p',
                            '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', outf], stdin=subprocess.PIPE)
    pdir = os.path.join(d, 'panel')
    total_ext = total + CTA_F
    last = None
    for f in range(total_ext):
        if f < total:
            buf = dec.stdout.read(1080 * TOP_H * 3)
            if len(buf) < 1080 * TOP_H * 3: buf = None
        else: buf = None
        if buf is None and last is None: break
        top = np.frombuffer(buf, np.uint8).reshape(TOP_H, 1080, 3) if buf is not None else last   # fin : dernière image figée sous l'appel à l'action
        last = top
        t = min(f, total - 1) / FPS
        k = max(i for i, st in enumerate(starts) if st <= t + 1e-6)
        seg_end = (starts[k + 1] if k + 1 < len(starts) else total / FPS)
        u = (t - starts[k]) / max(.5, seg_end - starts[k])
        z = 1.0 + 0.04 * (u if k % 2 == 0 else 1 - u)            # poussée lente, sens alterné
        M = np.float32([[z, 0, 540 * (1 - z)], [0, z, 300 * (1 - z)]])
        top = cv2.warpAffine(top, M, (1080, TOP_H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        pan = cv2.imread(os.path.join(pdir, f'f{min(f, total_ext - 1):04d}.png'), cv2.IMREAD_COLOR)
        frame = np.vstack([top, pan])
        cv2.line(frame, (0, TOP_H), (1080, TOP_H), (255, 75, 91), 4)                       # filet d'accent entre les deux moitiés
        cv2.rectangle(frame, (0, 0), (int(1080 * min(1, (f + 1) / total)), 8), (255, 75, 91), -1)  # barre de progression
        if f >= total:                                             # appel à l'action plein écran : recouvre la présentatrice
            cta = cv2.imread(os.path.join(CTA_DIR, f'f{min(f - total, CTA_F - 1):04d}.png'), cv2.IMREAD_UNCHANGED)
            if cta.shape[2] == 3: frame = cta                      # image entièrement opaque
            else:
                a = cta[:, :, 3:4].astype(np.float32) / 255.0
                frame = (cta[:, :, :3].astype(np.float32) * a + frame.astype(np.float32) * (1 - a)).astype(np.uint8)
        enc.stdin.write(frame.tobytes())
    enc.stdin.close(); enc.wait(); dec.wait()
    return outf

def run(sid, stages, preview):
    sh = next(s for s in SHORTS if s['id'] == sid)
    segs = segments(*sh['src']); o, total = mapper(segs)
    print(sid, f'{total / FPS:.1f}s', len(segs), 'plans', flush=True)
    psegs = picture_segments(segs)
    if 'presenter' in stages: stage_presenter(sh, psegs)
    if 'panel' in stages: stage_panel(sh, o, total + CTA_F)
    if 'audio' in stages: stage_audio(sh, segs, o, total)
    if 'subs' in stages: stage_subs(sh, segs, o, total)
    if 'compose' in stages: print('OK', stage_compose(sh, psegs, total, preview))

if __name__ == '__main__':
    a = sys.argv[1:]; sid = a[0]; preview = '--preview' in a
    st = a[a.index('--stage') + 1] if '--stage' in a else 'all'
    run(sid, ['presenter', 'panel', 'audio', 'subs', 'compose'] if st == 'all' else st.split(','), preview)
