# Reel 3 — original score + sound design, synthesised from scratch (no samples, no third-party audio).
# 150 BPM (beat 0.4 s, bar 1.6 s). Dark drone 0–16 s, silence gap, DROP at 16.0 s, bright groove, CTA impacts.
# Cut times come from edit_times.json (written by gen_edit.py) so every hit lands on its cut.
import json, numpy as np, pyloudnorm as pyln
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
T = json.load(open("../edit_times.json"))
DUR = T["dur"]
N = int(DUR * SR)
rng = np.random.default_rng(7)
t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)

def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR); sig = sig[: max(0, N - i)]
    L[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 + pan))

def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def env(n, a, d, curve=4.0):
    k = np.arange(n) / SR
    return np.minimum(1, k / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, k - a) / max(d, 1e-4))
def noise(sec): return rng.standard_normal(int(sec * SR))
def hz(midi): return 440 * 2 ** ((midi - 69) / 12)
def saw(f, sec, det=0.0):
    k = np.arange(int(sec * SR)) / SR
    return sum(2 * ((k * f * (1 + d) + ph) % 1) - 1 for d, ph in ((0, 0), (det, .31), (-det, .67))) / 3

DROP = T["drop"]
# ---------------- dark section: drone + breath + heartbeat -----------------
seg = DROP - 0.25
k = np.arange(int(seg * SR)) / SR
drone = (np.sin(2 * np.pi * hz(26) * k) * 0.6 + lp(saw(hz(38), seg, 0.004), 420) * 0.5)
drone *= np.minimum(1, k / 1.5) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.13 * k))
drone *= np.minimum(1, (seg - k) / 0.08)
add(drone, 0, 0.55)
air = bp(noise(seg), 300, 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.25 * k - 1.5)) ** 2
add(air * np.minimum(1, (seg - k) / 0.08), 0, 0.05, 0.3)

def boom(sec=1.2, f0=55, f1=32, g=1.0):
    k = np.arange(int(sec * SR)) / SR
    f = f1 + (f0 - f1) * np.exp(-k * 6)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(k), 0.004, sec * 0.35) * g
def click(g=1.0, f=3000):
    return bp(noise(0.03), f * 0.7, f * 1.3) * env(int(0.03 * SR), 0.0005, 0.008) * g
def whoosh(sec=0.6, up=True):
    n = int(sec * SR); x = noise(sec); k = np.arange(n) / n
    sh = np.sin(np.pi * k) ** 2
    lo = hp(x, 400) * sh
    return lp(lo, 6000) * (k if up else 1 - k) ** 0.5
def riser(sec):
    n = int(sec * SR); k = np.arange(n) / SR
    f = 200 * (8 ** (k / sec))
    tone = saw(1, sec) * 0
    sweep = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    return (hp(noise(sec), 800) * 0.6 + sweep) * (k / sec) ** 2

# per-screen SFX in the dark part
for s in T["screens"]:
    a = s["t0"]; sfx = s["sfx"]
    if sfx == "tick":
        for j in range(5): add(click(1, 2500), a + j * 0.4, 0.35, 0.4)
    elif sfx == "scratch":
        n = int(0.9 * SR); x = bp(noise(0.9), 1500, 5000) * (0.4 + 0.6 * np.abs(np.sin(np.arange(n) / SR * 2 * np.pi * 9)))
        add(x * env(n, 0.05, 0.9, 1.5), a + 0.15, 0.12, -0.3)
    elif sfx == "pop":
        add(boom(0.5, 90, 45), a - 0.05, 0.5)
    elif sfx == "whoosh":
        add(whoosh(0.7), a - 0.35, 0.22)
    elif sfx == "riser_short":
        add(riser(1.6), a + 0.3, 0.12)
    elif sfx == "heartbeat":
        for j in range(3):
            add(boom(0.35, 70, 40), a + j * 0.8, 0.55); add(boom(0.3, 65, 40), a + j * 0.8 + 0.22, 0.35)
    elif sfx == "breath":
        add(lp(noise(1.6), 900) * np.sin(np.linspace(0, np.pi, int(1.6 * SR))) ** 2, a + 0.1, 0.12)
# big riser into the drop, then 0.25 s of silence
add(riser(DROP - T["screens"][7]["t0"] - 0.25), T["screens"][7]["t0"], 0.22)

# ---------------- bright section -----------------
B = 0.4
end_groove = T["cta_hit"]
# chords (Bm - G - D - A), 2 bars each
prog = [(47, 50, 54, 59), (43, 50, 55, 59), (50, 54, 57, 62), (45, 52, 57, 61)]
bar = 4 * B
nb = int(np.ceil((DUR - DROP) / bar))
for b in range(nb):
    ch = prog[(b // 2) % 4]; at = DROP + b * bar
    sec = min(bar * 1.02, DUR - at)
    if sec <= 0.05: break
    k = np.arange(int(sec * SR)) / SR
    pad = sum(lp(saw(hz(m), sec, 0.006), 1800) for m in ch) / 4
    pad *= np.minimum(1, k / 0.02) * np.minimum(1, (sec - k) / 0.03)
    add(pad, at, 0.20, -0.2 if b % 2 else 0.2)
    bass = np.sin(2 * np.pi * hz(ch[0] - 12) * k) + 0.3 * np.sin(4 * np.pi * hz(ch[0] - 12) * k)
    for j in range(4):
        i0 = int(j * B * SR); seg_n = min(int(B * SR), len(k) - i0)
        if seg_n > 0: bass[i0:i0 + seg_n] *= env(seg_n, 0.005, 0.25, 2.5)
    add(bass, at, 0.32)
    # pluck arpeggio 8ths
    for j in range(8):
        m = ch[(j * 3) % 4] + 12
        pl = lp(saw(hz(m), 0.25), 3500) * env(int(0.25 * SR), 0.002, 0.08)
        add(pl, at + j * B / 2, 0.10, 0.5 if j % 2 else -0.5)
# drums
nbeats = int((DUR - DROP) / B)
for j in range(nbeats):
    at = DROP + j * B
    if at > DUR - 1.8: break
    add(boom(0.35, 110, 48), at, 0.75)                        # kick
    add(hp(noise(0.05), 7000) * env(int(0.05 * SR), 0.001, 0.015), at + B / 2, 0.16, 0.3)   # off-beat hat
    if j % 2 == 1:
        sn = bp(noise(0.2), 900, 6000) * env(int(0.2 * SR), 0.001, 0.07)
        add(sn, at, 0.22, -0.1)

def impact(at, g=1.0):
    add(boom(1.6, 70, 30), at, 0.9 * g)
    add(lp(noise(1.2), 2500) * env(int(1.2 * SR), 0.002, 0.3), at, 0.35 * g)
    add(hp(noise(0.4), 3000) * env(int(0.4 * SR), 0.001, 0.08), at, 0.2 * g)
impact(DROP, 1.2)
# light hit on each fact cut
for s in T["screens"]:
    if s["t0"] > DROP + 0.1 and s["sfx"] in ("hit", "ding", "hit_low", "pad", "ski", "water", "car", "riser"):
        a = s["t0"]
        if s["sfx"] == "hit": add(boom(0.5, 120, 60), a, 0.35); add(click(1, 5000), a, 0.2)
        if s["sfx"] == "hit_low": add(boom(0.9, 70, 35), a, 0.55)
        if s["sfx"] == "ding":
            k = np.arange(int(1.0 * SR)) / SR
            add((np.sin(2 * np.pi * 2093 * k) + 0.5 * np.sin(2 * np.pi * 3136 * k)) * env(len(k), 0.001, 0.35), a + 0.05, 0.09, 0.3)
        if s["sfx"] in ("ski", "car"): add(whoosh(0.8), a - 0.4, 0.2, -0.4)
        if s["sfx"] == "water":
            for j in range(14):
                f = rng.uniform(600, 1600); k = np.arange(int(0.06 * SR)) / SR
                add(np.sin(2 * np.pi * f * (1 + 3 * k) * k) * env(len(k), 0.002, 0.02), a + 0.1 + j * 0.14 + rng.uniform(0, .08), 0.05, rng.uniform(-.6, .6))
        if s["sfx"] == "riser": add(riser(3.0), a + 0.4, 0.14)
impact(T["cta_hit"], 1.0)
# final resonance on the handle card
k = np.arange(int((DUR - T["end"]) * SR)) / SR
res = sum(np.sin(2 * np.pi * hz(m) * k) for m in (38, 50, 57, 62)) / 4
add(res * env(len(k), 0.01, 1.2, 1.2), T["end"], 0.35)

mix = np.stack([L, R], 1)
fade = int(0.35 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix[: int((DROP - 0.25) * SR)] *= 0.55                    # the mystery section sits ~5 dB under the groove, so the drop lands
meter = pyln.Meter(SR)
def soft(x, k=0.66, top=0.80):
    a = np.abs(x); over = a > k
    y = x.copy(); y[over] = np.sign(x[over]) * (k + (top - k) * np.tanh((a[over] - k) / (top - k)))
    return y
for _ in range(5):                                         # normalise -> soft-knee limit, until it converges on -14 LUFS
    mix = soft(pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0))
print("LUFS", round(meter.integrated_loudness(mix), 2), "peak dBFS", round(20 * np.log10(np.abs(mix).max()), 2))
wavfile.write("score.wav", SR, (mix * 32767).astype(np.int16))
