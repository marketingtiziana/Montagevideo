#!/usr/bin/env python3
"""Musique de secours synthétisée (production interne, libre de droits) — 2 actes, 90 BPM, 48 kHz stéréo.
Acte tension 0–28 s : drone grave, tic-tac, pulsation, rise 9→10 s, drop à 10 s (impact sub), tension soutenue.
Acte solution 28–58,5 s : accords ouverts (Cmaj7 / Fmaj7 / Am7 / G), pads, tempo stable, fade-out 1,5 s.
"""
import numpy as np, soundfile as sf, sys
SR, BPM, DUR = 48000, 90.0, 58.5
beat = 60.0 / BPM
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(3)
mix = np.zeros((N, 2))

def env_ad(n, a, d, k=3.0):
    x = np.linspace(0, 1, n); return np.minimum(x / max(a, 1e-6), 1) * np.exp(-k * np.maximum(x - a, 0) / max(d, 1e-6))
def add(sig, at, gain=1.0, pan=0.0):
    k = int(at * SR); m = min(len(sig), N - k)
    if m <= 0: return
    l, r = (1 - pan) / 2 + 0.5, (1 + pan) / 2 + 0.5
    mix[k:k+m, 0] += sig[:m] * gain * min(1, l); mix[k:k+m, 1] += sig[:m] * gain * min(1, r)
def tone(f, dur, wave='sine', det=0.0):
    tt = np.arange(int(dur * SR)) / SR
    if wave == 'sine': return np.sin(2*np.pi*f*tt)
    if wave == 'saw': return 2*((f*tt) % 1) - 1
    if wave == 'tri': return 2*np.abs(2*((f*tt) % 1) - 1) - 1
def lowpass(x, fc):
    # filtre 1 pôle simple
    a = np.exp(-2*np.pi*fc/SR); y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)):
        acc = a*acc + (1-a)*x[i]; y[i] = acc
    return y

# --- ACTE 1 : drone grave (Ré 36.7 Hz + quinte) 0 → 28 s, léger vibrato
T1 = 28.0; n1 = int(T1*SR); tt = t[:n1]
drone = 0.5*np.sin(2*np.pi*36.71*tt + 0.3*np.sin(2*np.pi*0.2*tt)) + 0.25*np.sin(2*np.pi*55.0*tt) + 0.12*np.sin(2*np.pi*73.4*tt)
dr_env = np.minimum(tt/1.5, 1) * (1 - 0.35*np.clip((tt-27)/1.0, 0, 1))
add(drone*dr_env, 0, 0.55)
# pulsation 90 BPM : basse courte (Ré 73 Hz) sur chaque temps, plus forte sur le temps fort
for i, b in enumerate(np.arange(0, T1, beat)):
    s = tone(73.4, 0.28, 'sine') * env_ad(int(0.28*SR), 0.01, 0.4, 4)
    add(s, b, 0.5 if i % 4 == 0 else 0.3)
# tic-tac (deux clics alternés) — discret
for i, b in enumerate(np.arange(0, T1, beat)):
    f0 = 1900 if i % 2 == 0 else 1500
    c = tone(f0, 0.03) * env_ad(int(0.03*SR), 0.05, 0.3, 8)
    add(c, b, 0.08, pan=0.25 if i % 2 == 0 else -0.25)
# nappe froide en quintes (Ré mineur) : entrée 3 s, stable
pad = np.zeros(n1)
for f, g in [(146.8, .5), (220.0, .35), (293.7, .25), (349.2, .2)]:
    pad += g*np.sin(2*np.pi*f*tt + 0.02*np.sin(2*np.pi*0.13*tt*f/100))
pad = lowpass(pad, 900) * np.minimum(np.maximum(tt-2.5, 0)/3, 1)
add(pad, 0, 0.18)
# piano froid clairsemé (notes isolées sur certains temps)
for b, f in [(1.33, 587.3), (4.0, 440.0), (6.67, 523.3), (14.0, 587.3), (18.0, 440.0), (22.0, 349.2), (24.67, 293.7)]:
    s = (tone(f, 1.6) + 0.3*tone(2*f, 1.6)) * env_ad(int(1.6*SR), 0.004, 0.5, 3.5)
    add(s, b, 0.12, pan=rng.uniform(-0.4, 0.4))
# rise 9 → 10 s : bruit filtré + sinus montant
nr = int(1.0*SR); tr = np.arange(nr)/SR
rise = (0.6*rng.standard_normal(nr)*(tr**2) + 0.5*np.sin(2*np.pi*np.cumsum(200+1200*tr**2)/SR)*(tr**1.5))
add(lowpass(rise, 4000), 9.0, 0.6)
# drop à 10 s : impact sub + silence relatif 0.15 s avant
mix[int(9.85*SR):int(10.0*SR)] *= np.linspace(1, 0.2, int(0.15*SR))[:, None]
imp = np.sin(2*np.pi*np.cumsum(70*np.exp(-2.2*np.arange(int(1.2*SR))/SR)+38)/SR) * env_ad(int(1.2*SR), 0.003, 0.6, 2.2)
add(imp, 10.0, 0.9)
# impacts secondaires (ta structure 12 s, fin d'acte 28 s)
add(imp, 12.0, 0.7); add(imp*0.8, 25.2, 0.5)
# --- ACTE 2 : résolution 28 → 58.5 s : progression Cmaj7 / Fmaj7 / Am7 / G (2 mesures chacun = 5.33 s)
chords = [[261.6, 329.6, 392.0, 493.9], [349.2, 440.0, 523.3, 659.3], [220.0, 261.6, 329.6, 392.0], [196.0, 246.9, 293.7, 392.0]]
start = 28.0; bar = 4*beat; ci = 0; tcur = start
while tcur < DUR:
    ch = chords[ci % 4]; d = 2*bar; n = int(d*SR); tt2 = np.arange(n)/SR
    s = np.zeros(n)
    for j, f in enumerate(ch):
        s += (0.5/(j+1)**0.3) * (np.sin(2*np.pi*f*tt2) + 0.35*np.sin(2*np.pi*f*1.005*tt2) + 0.15*np.sin(2*np.pi*2*f*tt2))
    s = lowpass(s, 1800) * env_ad(n, 0.12, 2.2, 1.2)
    add(s, tcur, 0.22)
    # basse douce sur les temps 1 et 3
    for k in range(4):
        b = tone(ch[0]/2, 0.5) * env_ad(int(0.5*SR), 0.01, 0.6, 3)
        add(b, tcur + k*bar/2, 0.28)
    # arpège lumineux (croche) 
    for k in range(16):
        f = ch[k % 4]*2; a = tone(f, 0.35, 'tri') * env_ad(int(0.35*SR), 0.01, 0.5, 4)
        add(a, tcur + k*beat/2, 0.07, pan=0.3*np.sin(k))
    tcur += d; ci += 1
# ding doux à chaque solution (28, 31.6, 35.2, 38.8, 42.4) intégré à la musique ? non : SFX séparé.
# master : fade-in 0.2 s, fade-out 1.5 s, soft clip
mix[:int(0.2*SR)] *= np.linspace(0, 1, int(0.2*SR))[:, None]
mix[-int(1.5*SR):] *= np.linspace(1, 0, int(1.5*SR))[:, None]
mix = np.tanh(mix * 1.1) * 0.9
sf.write(sys.argv[1] if len(sys.argv) > 1 else 'music_synth.wav', mix.astype(np.float32), SR)
print('ok', DUR, 's', np.max(np.abs(mix)))
