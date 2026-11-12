"""Sons générés (si tes fichiers manquent) — numpy, 48 kHz stéréo.
  sfx/whoosh.wav, sfx/pop.wav, sfx/clic.wav, sfx/riser.wav  (dans l'esprit de pipeline/gen_sfx.py)
  assets/podcast/musique_teaser.wav : synth-pop / électro 120 bpm (kick, clap, charleston, basse, nappe, arpège)
  assets/podcast/musique_end.wav    : boucle douce lo-fi (accords électriques + tremolo)
  assets/podcast/jingle.wav         : accord synthé rétro + « pop » (~1,5 s)
Un fichier fourni dans assets/ (jingle.wav, musique_teaser.wav, …) est utilisé à la place."""
import numpy as np, wave, os, shutil
SR = 48000
os.makedirs('sfx', exist_ok=True); os.makedirs('assets/podcast', exist_ok=True)
rng = np.random.default_rng(7)
t_ = lambda d: np.arange(int(d * SR)) / SR

def save(path, x, stereo_width=0.0):
    x = np.asarray(x, np.float32)
    if x.ndim == 1: x = np.stack([x, x], 1)
    x /= max(1e-9, np.abs(x).max()) / 0.89
    w = wave.open(path, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close(); print(path, f'{len(x) / SR:.2f}s')

def lp(x, fc):                      # passe-bas 1 pôle (répété 2x)
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); z = 0.0
    for _ in range(2):
        for i, v in enumerate(x): z = (1 - a) * v + a * z; y[i] = z
        x = y.copy()
    return y
def lp_fast(x, fc):
    from scipy.signal import butter, lfilter
    b, a = butter(2, fc / (SR / 2)); return lfilter(b, a, x)
def hp_fast(x, fc):
    from scipy.signal import butter, lfilter
    b, a = butter(2, fc / (SR / 2), 'high'); return lfilter(b, a, x)
def env(n, a, d, s=0.0, r=0.0, sl=None):
    sl = n if sl is None else sl
    e = np.ones(n) * s
    A, D = int(a * SR), int(d * SR)
    e[:A] = np.linspace(0, 1, A) if A else e[:A]
    e[A:A + D] = np.linspace(1, s, len(e[A:A + D]))
    return e
saw = lambda f, t: 2 * ((f * t) % 1) - 1
note = lambda m: 440 * 2 ** ((m - 69) / 12)

# ------------------------------------------------------------------ SFX
def sfx():
    t = t_(0.45); n = rng.standard_normal(len(t))
    wh = hp_fast(lp_fast(n, 2500), 250) * np.sin(np.pi * t / 0.45) ** 2
    save('sfx/whoosh.wav', np.stack([wh * np.linspace(1, 0.4, len(t)), wh * np.linspace(0.4, 1, len(t))], 1))
    t = t_(0.16); save('sfx/pop.wav', np.sin(2 * np.pi * (620 - 1200 * t) * t) * np.exp(-t * 28))
    t = t_(0.05); c = (rng.standard_normal(len(t)) * 0.4 + np.sin(2 * np.pi * 2400 * t)) * np.exp(-t * 160)
    save('sfx/clic.wav', hp_fast(c, 1200))
    t = t_(0.6); r = hp_fast(rng.standard_normal(len(t)), 800) * (t / 0.6) ** 2 * 0.6 + 0.4 * saw(220 + 660 * (t / 0.6) ** 2, t) * (t / 0.6) ** 1.5
    save('sfx/riser.wav', lp_fast(r, 6000))

# ------------------------------------------------------------------ musique teaser (synth-pop 120 bpm)
def music_teaser(dur=36.0, bpm=120):
    beat = 60 / bpm; n = int(dur * SR); L = np.zeros(n); R = np.zeros(n)
    def add(sig, at, pan=0.0, g=1.0):
        i = int(at * SR); j = min(n, i + len(sig))
        if i >= n: return
        L[i:j] += sig[:j - i] * g * (1 - pan) ; R[i:j] += sig[:j - i] * g * (1 + pan)
    tk = t_(0.35); kick = np.sin(2 * np.pi * (48 + 110 * np.exp(-tk * 30)) * tk) * np.exp(-tk * 9)
    tc = t_(0.25); clap = hp_fast(rng.standard_normal(len(tc)), 900) * np.exp(-tc * 18)
    th = t_(0.06); hat = hp_fast(rng.standard_normal(len(th)), 7000) * np.exp(-th * 70)
    prog = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [48, 52, 55]), (55, [55, 59, 62])]   # Am F C G
    bars = int(dur / (4 * beat)) + 1
    for b in range(bars):
        root, chord = prog[b % 4]; t0 = b * 4 * beat
        for k in range(4):
            add(kick, t0 + k * beat, g=0.9)
            if k % 2: add(clap, t0 + k * beat, g=0.45)
        for k in range(8): add(hat, t0 + k * beat / 2 + beat / 4 * (k % 2 == 0) * 0, pan=0.3 if k % 2 else -0.3, g=0.22 if k % 2 else 0.12)
        for k in range(8):                       # basse en croches, pompée
            tb = t_(beat / 2); f = note(root - 24 + (12 if k % 4 == 3 else 0))
            add(lp_fast(saw(f, tb), 700) * np.minimum(1, tb / 0.01) * np.exp(-tb * 5), t0 + k * beat / 2, g=0.5)
        tp = t_(4 * beat); pad = sum(saw(note(m) * d, tp) for m in chord for d in (0.997, 1.003))
        pad = lp_fast(pad, 2200) * np.minimum(1, tp / 0.3) * np.minimum(1, (4 * beat - tp) / 0.3)
        pump = 0.45 + 0.55 * np.minimum(1, ((tp % beat) / (beat * 0.6)))      # side-chain « pompe »
        add(pad * pump, t0, pan=-0.15, g=0.11); add(pad * pump, t0 + 0.012, pan=0.15, g=0.11)
        for k in range(16):                      # arpège en doubles croches
            m = chord[k % 3] + 12 * (1 + (k // 3) % 2); ta = t_(beat / 4)
            add(lp_fast(saw(note(m), ta) * 0.5 + np.sign(np.sin(2 * np.pi * note(m) * ta)) * 0.3, 4000) * np.exp(-ta * 14),
                t0 + k * beat / 4, pan=0.4 * np.sin(k), g=0.10)
    fade = np.minimum(1, np.arange(n) / (0.05 * SR))
    save('assets/podcast/musique_teaser.wav', np.stack([L * fade, R * fade], 1))

# ------------------------------------------------------------------ musique teaser calme (lo-fi 84 bpm)
def music_teaser_calme(dur=36.0, bpm=84):
    beat = 60 / bpm; n = int(dur * SR); L = np.zeros(n); R = np.zeros(n)
    def add(sig, at, pan=0.0, g=1.0):
        i = int(at * SR)
        if i >= n: return
        j = min(n, i + len(sig)); L[i:j] += sig[:j - i] * g * (1 - pan); R[i:j] += sig[:j - i] * g * (1 + pan)
    tk = t_(0.3); kick = lp_fast(np.sin(2 * np.pi * (50 + 60 * np.exp(-tk * 25)) * tk) * np.exp(-tk * 10), 300)
    th = t_(0.05); hat = lp_fast(hp_fast(rng.standard_normal(len(th)), 5000), 9000) * np.exp(-th * 80)
    tr = t_(0.2); rim = hp_fast(rng.standard_normal(len(tr)), 1500) * np.exp(-tr * 30)
    chords = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]   # Am7 Fmaj7 Cmaj7 G7
    for b in range(int(dur / (4 * beat)) + 1):
        ch = chords[b % 4]; t0 = b * 4 * beat
        add(kick, t0, g=0.55); add(kick, t0 + 2.5 * beat, g=0.4)
        add(rim, t0 + beat, g=0.12); add(rim, t0 + 3 * beat, g=0.12)
        for k in range(8): add(hat, t0 + k * beat / 2 + (0.03 if k % 2 else 0), pan=0.25, g=0.05 if k % 2 else 0.08)
        tp = t_(4 * beat + 0.6)                       # piano électrique doux (sinus + harmonique, trémolo)
        ep = sum(np.sin(2 * np.pi * note(m) * tp) + 0.25 * np.sin(4 * np.pi * note(m) * tp) for m in ch)
        ep *= np.exp(-tp * 0.9) * (1 + 0.15 * np.sin(2 * np.pi * 4.5 * tp)) * np.minimum(1, tp / 0.01)
        add(ep, t0, pan=-0.1, g=0.09); add(ep, t0 + 2 * beat, pan=0.1, g=0.05)
        tb = t_(2 * beat); bass = lp_fast(np.sin(2 * np.pi * note(ch[0] - 24) * tb), 400) * np.exp(-tb * 1.5)
        add(bass, t0, g=0.35); add(bass, t0 + 2 * beat, g=0.3)
    noise = lp_fast(rng.standard_normal(n), 2500) * 0.004      # souffle vinyle léger
    fade = np.minimum(1, np.arange(n) / (0.4 * SR))
    save('assets/podcast/musique_teaser.wav', np.stack([(L + noise) * fade, (R + noise) * fade], 1))

# ------------------------------------------------------------------ musique douce (end slate)
def music_end(dur=8.5):
    n = int(dur * SR); x = np.zeros((n, 2)); beat = 60 / 84
    chords = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]
    for k, ch in enumerate(chords * 2):
        at = k * 2 * beat; tt = t_(2 * beat + 0.8)
        s = sum(np.sin(2 * np.pi * note(m) * tt) + 0.3 * np.sin(4 * np.pi * note(m) * tt) for m in ch)
        s *= np.exp(-tt * 1.6) * (1 + 0.25 * np.sin(2 * np.pi * 5 * tt))
        i = int(at * SR)
        if i >= n: break
        j = min(n, i + len(s)); x[i:j, 0] += s[:j - i]; x[i:j, 1] += s[:j - i] * 0.92
    noise = lp_fast(rng.standard_normal(n), 3000) * 0.01
    x[:, 0] += noise; x[:, 1] += noise
    save('assets/podcast/musique_end.wav', x)

# ------------------------------------------------------------------ jingle (accord rétro + pop)
def jingle(dur=1.5):
    tt = t_(dur); ch = [60, 64, 67, 72, 76]
    s = sum(saw(note(m) * d, tt) for m in ch for d in (0.996, 1.004)) / 10
    s = lp_fast(s, 3500) * np.exp(-tt * 2.2) * np.minimum(1, tt / 0.005)
    p = np.zeros_like(tt); tp = t_(0.16); i = int(0.07 * SR)
    p[i:i + len(tp)] = np.sin(2 * np.pi * (700 - 1500 * tp) * tp) * np.exp(-tp * 25)
    sp = np.zeros_like(tt)
    for k, m in enumerate([84, 88, 91]):
        ts = t_(0.25); j = int((0.2 + 0.09 * k) * SR); sp[j:j + len(ts)] += np.sin(2 * np.pi * note(m) * ts) * np.exp(-ts * 14) * 0.25
    save('assets/podcast/jingle.wav', np.stack([s + p * 0.8 + sp, s + p * 0.8 + sp * 0.7], 1))

if __name__ == '__main__':
    sfx()
    import json
    style = json.load(open('pipeline/podcast/config.json')).get('musique_teaser_style', 'energique')
    for name, fn in (('musique_teaser.wav', music_teaser_calme if style == 'calme' else music_teaser), ('musique_end.wav', music_end), ('jingle.wav', jingle)):
        if os.path.exists(f'assets/{name}'): shutil.copy(f'assets/{name}', f'assets/podcast/{name}'); print(name, ': fourni')
        else: fn()
