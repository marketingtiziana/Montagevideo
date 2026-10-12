#!/usr/bin/env python3
"""SFX synthétisés (licence : production interne) — 48 kHz mono WAV.
tick, tick_soft, impact_sub, whoosh, ping_radar, ding, tictac_loop (8 s), rise (1 s), flash_hit.
"""
import numpy as np, soundfile as sf, os, sys
SR = 48000
out = sys.argv[1] if len(sys.argv) > 1 else 'sfx'
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(7)

def env(n, a, d, curve=3.0):
    t = np.linspace(0, 1, n)
    e = np.minimum(t / max(a, 1e-6), 1.0) * np.exp(-curve * np.maximum(t - a, 0) / max(d, 1e-6))
    return e

def save(name, y, gain_db=-6):
    y = y / (np.max(np.abs(y)) + 1e-9) * (10 ** (gain_db / 20))
    sf.write(os.path.join(out, name + '.wav'), y.astype(np.float32), SR)
    print(name, round(len(y) / SR, 3), 's')

def t_(sec): return np.arange(int(SR * sec)) / SR

# tick : clic bois court (mots qui apparaissent)
t = t_(0.06); y = np.sin(2*np.pi*2400*t) * env(len(t), 0.002, 0.03, 6) + 0.4*rng.standard_normal(len(t)) * env(len(t), 0.001, 0.01, 8)
save('tick', y, -14)
# tick doux (acte 2)
t = t_(0.08); y = np.sin(2*np.pi*1500*t) * env(len(t), 0.004, 0.05, 5)
save('tick_soft', y, -16)
# impact sub : sinus descendant 70→38 Hz + transitoire
t = t_(0.9); f = 70 * np.exp(-2.2 * t) + 38
y = np.sin(2*np.pi*np.cumsum(f)/SR) * env(len(t), 0.004, 0.55, 2.2) + 0.25*rng.standard_normal(len(t)) * env(len(t), 0.001, 0.02, 10)
save('impact_sub', y, -3)
# whoosh : bruit filtré balayé 0.3 s
t = t_(0.32); n = rng.standard_normal(len(t))
# filtre passe-bande simple par FFT avec balayage
spec = np.fft.rfft(n); fr = np.fft.rfftfreq(len(t), 1/SR)
w = np.exp(-((fr - 1800) / 900) ** 2); y = np.fft.irfft(spec * w, len(t)) * env(len(t), 0.4, 0.5, 3)
save('whoosh', y, -12)
# ping radar : sinus 1200 Hz avec queue de réverb synthétique
t = t_(0.7); y = np.sin(2*np.pi*1200*t) * env(len(t), 0.003, 0.35, 4) + 0.3*np.sin(2*np.pi*2400*t) * env(len(t), 0.003, 0.2, 5)
save('ping_radar', y, -16)
# ding doux : cloche (partiels inharmoniques)
t = t_(1.2); y = sum(a*np.sin(2*np.pi*f*t)*env(len(t), 0.002, dd, 3) for a, f, dd in [(1, 880, 0.9), (0.5, 1760, 0.5), (0.3, 2637, 0.3), (0.2, 3520, 0.2)])
save('ding', y, -14)
# tic-tac discret : 8 s à 90 BPM (1 tic / 0.667 s) alternance tic/tac
sec = 8.0; y = np.zeros(int(SR*sec)); step = 60/90
for i, st in enumerate(np.arange(0, sec, step)):
    k = int(st*SR); tt = t_(0.05); f0 = 1900 if i % 2 == 0 else 1500
    c = np.sin(2*np.pi*f0*tt) * env(len(tt), 0.001, 0.02, 8) + 0.5*rng.standard_normal(len(tt))*env(len(tt), 0.0005, 0.006, 12)
    y[k:k+len(c)] += c[:len(y)-k]
save('tictac_loop', y, -22)
# rise : bruit + sinus montant 1 s (avant le drop)
t = t_(1.0); f = 200 + 1400 * t**2
y = (np.sin(2*np.pi*np.cumsum(f)/SR) * 0.6 + 0.6*rng.standard_normal(len(t))) * (t**1.5)
save('rise', y, -10)
# flash hit : impact court + souffle (noir + flash « ta structure »)
t = t_(0.5); y = np.sin(2*np.pi*(90*np.exp(-6*t)+45)*t) * env(len(t), 0.002, 0.25, 3) + 0.5*rng.standard_normal(len(t))*env(len(t), 0.001, 0.08, 6)
save('flash_hit', y, -3)
