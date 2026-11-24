"""Son : voix traitée coupée comme l'image + fond musical (généré, provisoire) + bruitages discrets -> mix final.

Voix : build/media/voice_proc.wav (traitée depuis T001 : déclippage, passe-haut, débruitage, EQ, de-esser, compression).
Sorties : build/media/voice_edit.wav, music.wav, sfx.wav, mix.wav (-14 LUFS intégrés, crête -1 dBTP)
"""
import json, os, subprocess, numpy as np, wave
from timeline import FPS, HERE
from plan import build_clips
SR = 48000
MED = os.path.join(HERE, 'build', 'media')
VOICE = os.environ.get('V5_VOICE', os.path.join(MED, 'voice_proc.wav'))   # t=0 <=> 1:00:10

def read_wav(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def write_wav(p, x):
    x = np.clip(x, -1, 1); y = (x * 32767).astype(np.int16)
    with wave.open(p, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())

def voice_edit(clips, total_f):
    v = read_wav(VOICE)
    out = np.zeros(int(total_f / FPS * SR) + SR, np.float32)
    fade = int(0.008 * SR); ramp = np.linspace(0, 1, fade, dtype=np.float32)
    for c in clips:
        if c['kind'] != 'src': continue
        a, b = int(c['s_f'] / FPS * SR), int(c['e_f'] / FPS * SR)
        seg = v[a:b].copy()
        seg[:fade] *= ramp; seg[-fade:] *= ramp[::-1]
        o = int(c['o_f'] / FPS * SR); out[o:o + len(seg)] += seg
    return out[:int(total_f / FPS * SR)]

# ---------------------------------------------------------------- musique d'ambiance (originale, générée)
def music(n, seed=7):
    rng = np.random.default_rng(seed); t = np.arange(n) / SR
    # progression lente (8 s par accord) : Dmaj9 - Bm9 - Gmaj9 - Asus
    chords = [[50, 57, 64, 66, 69], [47, 54, 61, 62, 66], [43, 50, 57, 59, 62], [45, 52, 57, 59, 64]]
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    out = np.zeros(n, np.float32); L = 8 * SR
    env_len = L + 2 * SR
    env = np.sin(np.linspace(0, np.pi, env_len)) ** 1.5
    for k in range(0, n, L):
        ch = chords[(k // L) % 4]; m = min(env_len, n - k); tt = t[:m]
        for j, note in enumerate(ch):
            f = hz(note); amp = 0.05 / (1 + 0.35 * j)
            sig = (np.sin(2 * np.pi * f * tt) + 0.6 * np.sin(2 * np.pi * f * 1.003 * tt + 1.1)
                   + 0.25 * np.sin(2 * np.pi * 2 * f * tt + .3))
            out[k:k + m] += (amp * sig * env[:m]).astype(np.float32)
        # basse douce
        f = hz(ch[0] - 12); out[k:k + m] += (0.06 * np.sin(2 * np.pi * f * tt) * env[:m]).astype(np.float32)
    # « air » : bruit très filtré
    noise = rng.standard_normal(n).astype(np.float32)
    k = np.ones(400, np.float32) / 400; noise = np.convolve(noise, k, 'same') * 0.08
    out += noise * 0.25
    # réverbe simple (réponse impulsionnelle bruit décroissant)
    ir_n = int(2.2 * SR); ir = rng.standard_normal(ir_n).astype(np.float32) * np.exp(-np.linspace(0, 6, ir_n)).astype(np.float32)
    ir /= np.abs(ir).sum() / 6
    wet = np.fft.irfft(np.fft.rfft(out, 2 ** int(np.ceil(np.log2(n + ir_n)))) * np.fft.rfft(ir, 2 ** int(np.ceil(np.log2(n + ir_n)))))[:n]
    return (0.55 * out + 0.45 * wet).astype(np.float32)

def whoosh(dur=0.45, seed=0):
    rng = np.random.default_rng(seed); n = int(dur * SR)
    x = rng.standard_normal(n).astype(np.float32)
    env = np.sin(np.linspace(0, np.pi, n)) ** 2
    # filtre passe-bande glissant (moyennes mobiles de longueur variable)
    y = np.zeros(n, np.float32); acc = np.cumsum(np.concatenate([[0], x]))
    for i in range(n):
        w = int(60 - 50 * i / n) + 4; a = max(0, i - w); y[i] = (acc[i] - acc[a]) / max(1, i - a)
    return (y * env * 0.5).astype(np.float32)

def tick(dur=0.6):
    n = int(dur * SR); t = np.arange(n) / SR
    return (0.18 * np.sin(2 * np.pi * 880 * t) * np.exp(-t * 9) + 0.12 * np.sin(2 * np.pi * 1320 * t) * np.exp(-t * 12)).astype(np.float32)

def swell(dur=3.0):
    n = int(dur * SR); t = np.arange(n) / SR
    env = np.minimum(1, t / 1.2) * np.exp(-np.maximum(0, t - 1.4) * 2.2)
    f = [146.83, 220.0, 293.66, 369.99]
    return (sum(0.07 * np.sin(2 * np.pi * x * t) for x in f) * env).astype(np.float32)


# ---------------------------------------------------------------- V2 : bed rythmé (original, généré) 100 BPM
def music_v2(n, bpm=100, seed=3):
    rng = np.random.default_rng(seed); out = np.zeros(n + SR * 2, np.float32)
    beat = 60 / bpm; step = beat / 4
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    prog = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]]   # D - Bm - G - A
    bar = beat * 4
    def kick():
        L = int(.32 * SR); t = np.arange(L) / SR
        f = 48 + 70 * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
        return (np.sin(ph) * np.exp(-t * 9) * .55).astype(np.float32)
    def hat(open_=False):
        L = int((.12 if open_ else .035) * SR); x = rng.standard_normal(L).astype(np.float32)
        x = np.diff(np.concatenate([[0], x])); return (x * np.exp(-np.arange(L) / SR * (25 if open_ else 90)) * .05).astype(np.float32)
    def pluck(f, L=.5):
        L = int(L * SR); t = np.arange(L) / SR
        y = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.6 for k in range(1, 6)) * np.exp(-t * 7)
        return (y * .09).astype(np.float32)
    def pad(chord, L):
        L = int(L * SR); t = np.arange(L) / SR; env = np.minimum(1, t / .6) * np.minimum(1, (L / SR - t) / .6)
        return (sum(np.sin(2 * np.pi * hz(m) * t) + .5 * np.sin(2 * np.pi * hz(m) * 1.004 * t) for m in chord) * env * .022).astype(np.float32)
    def add(x, t):
        i = int(t * SR); out[i:i + len(x)] += x[:max(0, len(out) - i)]
    K, Hc, Ho = kick(), hat(), hat(True)
    total = n / SR; b = 0; t = 0.0
    arp = [0, 2, 1, 3, 2, 1, 3, 2]
    while t < total:
        ch = prog[b % 4]
        add(pad(ch, bar + .3), t)
        add((pluck(hz(ch[0] - 12), 1.2) * 1.6).astype(np.float32), t)
        for q in range(16):
            tq = t + q * step
            if q in (0, 8): add(K, tq)
            if q % 2 == 0: add(Hc, tq + .005)
            if q in (6, 14): add(Ho, tq)
            if q % 2 == 0: add(pluck(hz(ch[arp[(q // 2) % 8]] + 12), .35), tq)
        b += 1; t += bar
    out = out[:n]
    # légère compression / saturation douce
    return np.tanh(out * 1.4).astype(np.float32) * .7

def blip(f=1700, dur=.09, g=.12):
    L = int(dur * SR); t = np.arange(L) / SR
    return (g * np.sin(2 * np.pi * f * t) * np.exp(-t * 55)).astype(np.float32)

def boom(dur=1.2):
    L = int(dur * SR); t = np.arange(L) / SR
    f = 42 + 30 * np.exp(-t * 6)
    return (.35 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)).astype(np.float32)

# ---------------------------------------------------------------- V5 : ambiance calme et professionnelle (originale, générée)
def music_calm(n, seed=11):
    """Nappe douce + notes de piano feutré espacées, sans percussions. Accords lents (10 s) : Dmaj9, Bm11, Gmaj9, Aadd9."""
    rng = np.random.default_rng(seed); out = np.zeros(n + 4 * SR, np.float32)
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    prog = [[50, 57, 61, 64, 66], [47, 54, 57, 61, 64], [43, 50, 54, 57, 62], [45, 52, 57, 59, 64]]
    L = 10.0
    def pad(chord, dur):
        k = int(dur * SR); t = np.arange(k) / SR
        env = np.minimum(1, t / 2.5) * np.minimum(1, (dur - t) / 2.5)
        y = np.zeros(k, np.float32)
        for j, m in enumerate(chord):
            f = hz(m); a = .016 / (1 + .4 * j)
            y += (a * (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 1.0025 * t + 1.3) + .12 * np.sin(4 * np.pi * f * t))).astype(np.float32)
        y += (.018 * np.sin(2 * np.pi * hz(chord[0] - 12) * t)).astype(np.float32)
        return y * env
    def keys(f, dur=3.2, g=.05):            # piano feutré : attaque douce, harmoniques faibles, longue décroissance
        k = int(dur * SR); t = np.arange(k) / SR
        env = (1 - np.exp(-t * 60)) * np.exp(-t * 1.4)
        y = (np.sin(2 * np.pi * f * t) + .25 * np.sin(4 * np.pi * f * t) * np.exp(-t * 3) + .08 * np.sin(6 * np.pi * f * t) * np.exp(-t * 5))
        return (g * y * env).astype(np.float32)
    def add(x, t):
        i = int(t * SR); out[i:i + len(x)] += x[:max(0, len(out) - i)]
    t, b = 0.0, 0
    while t < n / SR:
        ch = prog[b % 4]; add(pad(ch, L + 3), t)
        for q, off in enumerate([0.6, 3.1, 5.4, 7.9]):          # 4 notes par accord, espacées et un peu aléatoires
            m = ch[rng.integers(2, len(ch))] + 12
            add(keys(hz(m), g=.035 + .01 * rng.random()), t + off + .2 * rng.random())
        t += L; b += 1
    out = out[:n]
    # réverbe douce
    ir_n = int(3.0 * SR); ir = rng.standard_normal(ir_n).astype(np.float32) * np.exp(-np.linspace(0, 5, ir_n)).astype(np.float32)
    ir /= np.abs(ir).sum() / 5
    N2 = 2 ** int(np.ceil(np.log2(n + ir_n)))
    wet = np.fft.irfft(np.fft.rfft(out, N2) * np.fft.rfft(ir, N2))[:n]
    y = .6 * out + .4 * wet
    # passe-bas doux (moyenne mobile) pour un son feutré
    k = np.ones(6, np.float32) / 6
    return (3.5 * np.convolve(y, k, 'same')).astype(np.float32)

def main():
    clips, total_f = build_clips()
    n = int(total_f / FPS * SR)
    v = voice_edit(clips, total_f); write_wav(os.path.join(MED, 'voice_edit.wav'), v)
    man = json.load(open(os.path.join(HERE, 'build', 'gfx_manifest.json')))
    sfx = np.zeros(n + SR, np.float32)
    def put(x, t, g=1.0):
        i = int(t * SR); sfx[i:i + len(x)] += x[:max(0, len(sfx) - i)] * g
    for k, g in enumerate(man):
        if g['id'] == 'title': put(swell(), g['start'] - 0.2, 1.0); put(whoosh(.5, seed=k), g['start'] - .25, .5); continue
        if g['tpl'] == 'chapter':
            put(whoosh(.5, seed=k), g['start'] - 0.22, 0.55); put(boom(), g['start'] + .02, .9); put(tick(), g['start'] + .35, .6)
            put(whoosh(.4, seed=k + 50), g['end'] - .42, .35); continue
        if g['kind'] in ('FULL', 'SPLIT') and not g['prev_split']: put(whoosh(seed=k), g['start'] - 0.15, 0.4)
        if g['kind'] == 'SPLIT' and not g['next_split']: put(whoosh(.35, seed=k + 9), g['end'] - .5, .22)
        if g['kind'] in ('CARD', 'LT'): put(whoosh(0.35, seed=k), g['start'] - 0.05, 0.3)
        for j, bt in enumerate(g.get('beats', [])):
            put(blip(1500 + 220 * (j % 3)), g['start'] + bt + .02, .55)
    write_wav(os.path.join(MED, 'sfx.wav'), sfx[:n])
    m = music_calm(n)
    # musique : plus présente sur le titre et l'écran de fin, très basse sous la voix (ducking)
    title = [c for c in clips if c['kind'] == 'title'][0]; end = [c for c in clips if c['kind'] == 'end'][0]
    gain = np.full(n, 0.30, np.float32)
    for c, g in ((title, 0.75), (end, 0.75)):
        a = int(c['o_f'] / FPS * SR); b = int((c['o_f'] + c['n_f']) / FPS * SR)
        gain[max(0, a - SR):a] = np.linspace(0.30, g, min(SR, a)); gain[a:b] = g
    fin = int(1.5 * SR); gain[-fin:] *= np.linspace(1, 0, fin)
    gain[:int(0.5*SR)] *= np.linspace(0, 1, int(0.5*SR))
    write_wav(os.path.join(MED, 'music.wav'), m * gain)
    # mix : musique duckée par la voix, puis normalisation YouTube (-14 LUFS, -1 dBTP)
    fc = ("[1:a]volume=1.0[m];[0:a]asplit=2[v][vk];[m][vk]sidechaincompress=threshold=0.015:ratio=5:attack=30:release=450[md];"
          "[2:a]volume=0.8[s];[v][md][s]amix=inputs=3:normalize=0:duration=first,"
          "loudnorm=I=-14:TP=-1.0:LRA=9")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(MED, 'voice_edit.wav'), '-i', os.path.join(MED, 'music.wav'),
                    '-i', os.path.join(MED, 'sfx.wav'), '-filter_complex', fc, '-ar', str(SR), '-c:a', 'pcm_s16le',
                    os.path.join(MED, 'mix.wav')], check=True)
    print('mix ok', n / SR, 's')

if __name__ == '__main__': main()
