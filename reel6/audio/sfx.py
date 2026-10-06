# Original sound design, synthesised here (no third-party samples): pop, click, whoosh, tick, impact — 48 kHz mono WAV.
import numpy as np, soundfile as sf, os
SR = 48000
rng = np.random.default_rng(6)
env = lambda n, a, d: np.minimum(np.arange(n) / max(1, int(a * SR)), 1) * np.exp(-np.arange(n) / (d * SR))
def lp(x, fc):                                    # one-pole low-pass
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y
def bp(x, lo, hi): return lp(x, hi) - lp(x, lo)
def norm(x, peak_db=-1.0): return x / (np.abs(x).max() + 1e-9) * 10 ** (peak_db / 20)

def pop():      # soft bubble pop: falling sine 900 -> 380 Hz, 90 ms
    n = int(0.09 * SR); t = np.arange(n) / SR; f = 380 + 520 * np.exp(-t / 0.018)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.03))
def click():    # short mechanical click: filtered noise burst + 2.4 kHz ping, 35 ms
    n = int(0.035 * SR); t = np.arange(n) / SR
    return norm(bp(rng.standard_normal(n), 1500, 6000) * env(n, 0.0005, 0.004) + 0.5 * np.sin(2 * np.pi * 2400 * t) * env(n, 0.0005, 0.008))
def whoosh():   # 260 ms band-passed noise sweep, swelling then fading
    n = int(0.26 * SR); x = rng.standard_normal(n); t = np.arange(n) / n
    lo = bp(x, 300, 1200); hi = bp(x, 1200, 5000); m = np.clip(t * 1.6, 0, 1)
    shape = np.sin(np.pi * t) ** 1.5
    return norm((lo * (1 - m) + hi * m) * shape)
def tick():     # crisp UI tick, 20 ms
    n = int(0.02 * SR); t = np.arange(n) / SR
    return norm(np.sin(2 * np.pi * 3200 * t) * env(n, 0.0003, 0.003) + 0.3 * bp(rng.standard_normal(n), 3000, 9000) * env(n, 0.0002, 0.002))
def impact():   # light impact: 70 Hz body with pitch drop + noise transient, 380 ms
    n = int(0.38 * SR); t = np.arange(n) / SR; f = 55 + 70 * np.exp(-t / 0.05)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.12)
    return norm(body + 0.35 * lp(rng.standard_normal(n), 2500) * env(n, 0.0005, 0.015))

os.makedirs(os.path.join(os.path.dirname(__file__), "sfx"), exist_ok=True)
for name, fn in {"pop": pop, "click": click, "whoosh": whoosh, "tick": tick, "impact": impact}.items():
    sf.write(os.path.join(os.path.dirname(__file__), "sfx", f"{name}.wav"), fn().astype(np.float32), SR, subtype="PCM_24")
    print(name)
