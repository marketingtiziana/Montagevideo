# Reel 4 — original score + sound design, synthesised from scratch (no samples, no third-party audio).
# 120 BPM (beat 0.5 s), bars start on odd seconds so 27.0 s is a downbeat. Cold minimal groove 1–25 s, riser 25–27 s,
# DROP at 27.0 s (warm, full), trap 48.5–51 s (filter closes), clean CTA 51–57 s, 1.5 s fade-out.
# Mix: SFX bus sits 10 LU under the music bus, music ducks -4 dB under impacts, -14 LUFS integrated, true peak <= -1 dBTP.
import json, numpy as np, pyloudnorm as pyln
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
from scipy.ndimage import minimum_filter1d, uniform_filter1d

SR = 48000
T = json.load(open("../edit_times.json"))
DUR, DROP = T["dur"], T["drop"]
N = int(DUR * SR)
rng = np.random.default_rng(11)
B = 0.5                      # beat
def bus(): return np.zeros((N, 2))
MUS, SFX = bus(), bus()

def add(dst, sig, at, gain=1.0, pan=0.0):
    i = int(round(at * SR))
    if i < 0: sig, i = sig[-i:], 0
    sig = sig[: max(0, N - i)]
    dst[i:i + len(sig), 0] += sig * gain * np.sqrt(0.5 * (1 - pan))
    dst[i:i + len(sig), 1] += sig * gain * np.sqrt(0.5 * (1 + pan))

def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def env(n, a, d, curve=4.0):
    k = np.arange(n) / SR
    return np.minimum(1, k / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, k - a) / max(d, 1e-4))
def noise(sec): return rng.standard_normal(int(sec * SR))
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def saw(f, sec, det=0.0):
    k = np.arange(int(sec * SR)) / SR
    return sum(2 * ((k * f * (1 + d) + ph) % 1) - 1 for d, ph in ((0, 0), (det, .31), (-det, .67))) / 3
def boom(sec=1.0, f0=60, f1=32):
    k = np.arange(int(sec * SR)) / SR
    f = f1 + (f0 - f1) * np.exp(-k * 7)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(k), 0.003, sec * 0.35)
def hat(g=1.0): return hp(noise(0.05), 7500) * env(int(0.05 * SR), 0.001, 0.012) * g
def clap():
    x = bp(noise(0.25), 900, 5000)
    e = sum(env(len(x), 0.001, 0.01) * (np.arange(len(x)) >= int(d * SR)) for d in (0, 0.012, 0.024)) + env(len(x), 0.03, 0.08)
    return x * e * 0.6

# ---------------- harmony: F#m – D – A – E (2 bars each) ----------------
PROG = [(54, 57, 61, 66), (50, 54, 57, 62), (45, 52, 57, 61), (52, 56, 59, 64)]
def section_cutoff(t):                      # pad/pluck low-pass: cold & closed -> open at the drop -> closed in the trap
    if t < 1: return 500
    if t < 25: return 500 + 1100 * (t - 1) / 24
    if t < DROP: return 1600 + 2400 * (t - 25) / 2
    if t < 48.5: return 5000
    if t < 51: return 900
    return 3500
bar = 4 * B
t = 1.0 - bar / 2                            # half-bar pickup before the first downbeat at 1.0 s
b = 0
while t < DUR - 0.05:
    ch = PROG[(b // 2) % 4]; sec = min(bar, DUR - t)
    if sec <= 0: break
    k = np.arange(int(sec * SR)) / SR
    pad = sum(saw(hz(m), sec, 0.007) for m in ch) / 4
    pad = lp(pad, section_cutoff(t)) * np.minimum(1, k / 0.05) * np.minimum(1, (sec - k) / 0.05)
    add(MUS, pad, t, 0.16 if t < DROP else 0.20, -0.25 if b % 2 else 0.25)
    # bass: 8ths before the drop (pulse), sustained sub + 8th octave after
    root = ch[0] - 24
    for j in range(8):
        at = t + j * B / 2
        if at >= DUR - 0.05: break
        n8 = int(B / 2 * SR); kk = np.arange(n8) / SR
        tone = np.sin(2 * np.pi * hz(root) * kk) + (0.35 * np.sin(2 * np.pi * hz(root + 12) * kk) if (at >= DROP and j % 2) else 0)
        add(MUS, tone * env(n8, 0.004, 0.18, 3.0), at, 0.30 if at >= DROP else 0.20)
    # plucks after the drop (16ths arpeggio), sparse 8ths before
    step = B / 4 if t >= DROP else B / 2
    for j in range(int(bar / step)):
        at = t + j * step
        if at >= DUR - 0.3 or at < 1.0: continue
        if t < DROP and j % 2: continue
        m = ch[(j * 3) % 4] + (24 if t >= DROP else 12)
        pl = lp(saw(hz(m), 0.22), min(section_cutoff(at) * 1.4, 9000)) * env(int(0.22 * SR), 0.002, 0.07)
        add(MUS, pl, at, 0.07 if t >= DROP else 0.05, 0.5 if j % 2 else -0.5)
    t += bar; b += 1

# ---------------- drums ----------------
for j in range(int(DUR / B) + 1):
    at = j * B
    if at < 1.0 or at > DUR - 1.6: continue
    downbeat = abs(((at - 1.0) / B) % 2) < 1e-6          # beats 1 and 3
    if at < 25.0:
        if downbeat: add(MUS, boom(0.35, 110, 45), at, 0.55)
        add(MUS, hat(0.8), at + B / 2, 0.12, 0.3)
    elif at < DROP:                                       # build: kick on every beat + 16th snare roll handled below
        add(MUS, boom(0.3, 110, 45), at, 0.5)
    elif at < 48.5 or at >= 51.0:
        add(MUS, boom(0.35, 120, 45), at, 0.75)           # four on the floor
        add(MUS, hat(1.0), at + B / 2, 0.16, 0.3)
        if not downbeat: add(MUS, clap(), at, 0.32, -0.1)
    else:                                                 # trap: half-time, heavier
        if downbeat: add(MUS, boom(0.6, 80, 34), at, 0.8)
for j in range(16):                                       # snare roll 25 -> 27 s, accelerating density and level
    at = 25.0 + j * 0.125
    add(MUS, clap(), at, 0.08 + 0.18 * j / 15, 0.0)

# ---------------- SFX bus ----------------
def whoosh(sec=0.45):
    n = int(sec * SR); x = noise(sec); k = np.arange(n) / n
    return lp(hp(x, 500), 7000) * np.sin(np.pi * k) ** 2 * k ** 0.6
def riser(sec):
    n = int(sec * SR); k = np.arange(n) / SR
    f = 180 * (10 ** (k / sec))
    return (hp(noise(sec), 900) * 0.6 + 0.3 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * (k / sec) ** 2.2
def tick(): return bp(noise(0.03), 2500, 5000) * env(int(0.03 * SR), 0.0005, 0.006)
def ding():
    k = np.arange(int(0.9 * SR)) / SR
    return (np.sin(2 * np.pi * 1760 * k) + 0.4 * np.sin(2 * np.pi * 2637 * k)) * env(len(k), 0.001, 0.3)
def cross():
    k = np.arange(int(0.22 * SR)) / SR
    return lp(saw(110, 0.22, 0.01), 900) * env(len(k), 0.002, 0.12) + 0.4 * np.sin(2 * np.pi * 70 * k) * env(len(k), 0.002, 0.1)
def glitch(sec=0.13):
    x = bp(noise(sec), 300, 8000); n = len(x)
    gate = np.repeat(rng.integers(0, 2, n // 240 + 1), 240)[:n]
    return x * gate * env(n, 0.001, sec)
def page():
    x = bp(noise(0.5), 1500, 7000); n = len(x); k = np.arange(n) / n
    return x * (np.sin(np.pi * k) ** 3) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * k))
SUB = lambda g=1.0: boom(1.1, 65, 30) * g
IMPACTS = []
for at, kind in T["events"]:
    if kind == "whoosh": add(SFX, whoosh(), at - 0.1, 0.9, 0.3)
    elif kind == "tick": add(SFX, tick(), at, 0.5, 0.2)
    elif kind == "impact": add(SFX, SUB(), at, 1.0); add(SFX, hp(noise(0.25), 3000) * env(int(0.25 * SR), 0.001, 0.05), at, 0.25); IMPACTS.append(at)
    elif kind == "impact_soft": add(SFX, SUB(0.6), at, 1.0); IMPACTS.append(at)
    elif kind == "ding": add(SFX, ding(), at, 0.35, 0.3)
    elif kind == "cross": add(SFX, cross(), at, 0.6, -0.3)
    elif kind == "riser": add(SFX, riser(DROP - 25.0 - 0.02), 25.0, 0.5)
    elif kind == "glitch": add(SFX, glitch(), at, 0.7)
    elif kind == "glitch_soft": add(SFX, glitch(0.09), at, 0.35)
    elif kind == "page": add(SFX, page(), at, 0.5, -0.2)
    elif kind == "drop":   # big drop hit lives in the music bus
        add(MUS, boom(1.8, 70, 28), at, 1.0); add(MUS, lp(noise(1.2), 2500) * env(int(1.2 * SR), 0.002, 0.3), at, 0.3)
        IMPACTS.append(at)

# the cold section sits ~4 dB under the drop, with a 0.15 s breath just before 27.0 s, so the drop lands
MUS[: int(26.85 * SR)] *= 0.62
i0, i1 = int(26.85 * SR), int(DROP * SR)
MUS[i0:i1] *= np.linspace(0.62, 0.15, i1 - i0)[:, None]
meter = pyln.Meter(SR)
# duck the music -4 dB around impacts (10 ms attack, 350 ms release)
g = np.ones(N)
for at in IMPACTS:
    i0 = int(at * SR); a, r = int(0.01 * SR), int(0.35 * SR)
    seg = np.concatenate([np.linspace(1, 0.631, a), np.linspace(0.631, 1, r)])
    j0 = max(0, i0 - a); seg = seg[: N - j0]
    g[j0:j0 + len(seg)] = np.minimum(g[j0:j0 + len(seg)], seg)
MUS *= g[:, None]
# SFX bus 10 LU under the music bus
lm, ls = meter.integrated_loudness(MUS), meter.integrated_loudness(SFX)
SFX *= 10 ** ((lm - 10 - ls) / 20)
mix = MUS + SFX
fade = int(1.5 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5

def limit(x, ceil=0.70, look=0.006):
    """Look-ahead brickwall: per-sample gain, 6 ms min-hold, 6 ms smoothing -> no waveshaping, no AAC overshoot."""
    need = np.minimum(1.0, ceil / np.maximum(np.abs(x).max(1), 1e-9))
    n = int(look * SR)
    gg = uniform_filter1d(minimum_filter1d(need, size=2 * n + 1), size=n)
    return x * np.minimum(gg, 1.0)[:, None]
for _ in range(6):
    mix = limit(pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0))
print("music LUFS", round(lm, 1), "sfx LUFS (before)", round(ls, 1), "-> mix LUFS", round(meter.integrated_loudness(mix), 2),
      "peak dBFS", round(20 * np.log10(np.abs(mix).max()), 2))
wavfile.write("score.wav", SR, (mix * 32767).astype(np.int16))
