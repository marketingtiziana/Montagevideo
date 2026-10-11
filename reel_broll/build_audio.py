# -*- coding: utf-8 -*-
"""Piste son : musique synthetisee, aucune voix.

Sortie : a_broll.wav (48 kHz stereo, exactement la duree du reel).

Boucle minimale et chaude a 96 BPM (4 mesures de 2,5 s = 10 s pile) :
basse sub, arpege doux, nappe filtree, et un charley tres discret pour le
groove. Volontairement sobre : la musique porte le plan, elle ne le couvre pas.
"""
import subprocess, sys, wave
import numpy as np
import imageio_ffmpeg

sys.path.insert(0, "reel_broll")
from srcinfo import TOTAL
from config import (MUSIC, MUSIC_STYLE, MUSIC_BARS, MUSIC_BPM, MUSIC_GAIN, MUSIC_HAT,
                    WHOOSH_AT, WHOOSH_GAIN, TARGET_LUFS)

FF = imageio_ffmpeg.get_ffmpeg_exe()
SR = 48000
OUT = "a_broll.wav"
N = int(round(TOTAL * SR))
t = np.arange(N) / SR

# MUSIC_BPM = 0 : on cale 4 mesures sur la duree du reel, sinon la boucle se
# fait couper au milieu d'une mesure.
BPM = MUSIC_BPM if MUSIC_BPM > 0 else MUSIC_BARS * 4 * 60.0 / TOTAL
BEAT = 60.0 / BPM
BAR = 4 * BEAT


def note(freq, start, dur, amp, decay, harm=(1.0, 0.35, 0.12), attack=0.004):
    """Note pincee : quelques harmoniques + enveloppe percussive."""
    i0 = int(start * SR)
    n = int(dur * SR)
    if i0 >= N:
        return
    n = min(n, N - i0)
    if n <= 0:
        return
    lt = np.arange(n) / SR
    env = np.exp(-lt * decay)
    env *= np.minimum(lt / attack, 1.0)          # anti-clic
    sig = np.zeros(n, dtype=np.float32)
    for k, h in enumerate(harm, start=1):
        sig += np.sin(2 * np.pi * freq * k * lt).astype(np.float32) * h
    buf[i0:i0 + n] += sig * env * amp


def sub(freq, start, dur, amp=0.55):
    i0 = int(start * SR)
    n = min(int(dur * SR), N - i0)
    if n <= 0:
        return
    lt = np.arange(n) / SR
    env = np.minimum(lt / 0.02, 1.0) * np.minimum((dur - lt) / 0.25, 1.0)
    env = np.clip(env, 0, 1) * np.exp(-lt * 0.9)
    buf[i0:i0 + n] += (np.sin(2 * np.pi * freq * lt) * env * amp).astype(np.float32)


def hat(start, amp=0.05):
    i0 = int(start * SR)
    n = min(int(0.05 * SR), N - i0)
    if n <= 0:
        return
    lt = np.arange(n) / SR
    rng = np.random.RandomState(int(start * 1000) % 9973)
    x = rng.randn(n).astype(np.float32) * np.exp(-lt * 160)
    x = x - np.convolve(x, np.ones(5) / 5, mode="same")     # passe-haut grossier
    buf[i0:i0 + n] += x * amp


def pad(freqs, start, dur, amp=0.10):
    i0 = int(start * SR)
    n = min(int(dur * SR), N - i0)
    if n <= 0:
        return
    lt = np.arange(n) / SR
    env = np.clip(np.minimum(lt / 0.5, 1.0) * np.minimum((dur - lt) / 0.6, 1.0), 0, 1)
    acc = np.zeros(n, dtype=np.float32)
    for f in freqs:
        acc += np.sin(2 * np.pi * f * lt).astype(np.float32)
        acc += np.sin(2 * np.pi * f * 1.003 * lt).astype(np.float32) * 0.5   # leger detune
    acc = np.convolve(acc, np.ones(55) / 55, mode="same")   # passe-bas : la nappe reste derriere
    buf[i0:i0 + n] += acc / len(freqs) * env * amp


def whoosh(start, amp):
    dur = 0.45
    i0 = max(0, int((start - dur * 0.55) * SR))
    n = min(int(dur * SR), N - i0)
    if n <= 0:
        return
    lt = np.arange(n) / SR
    rng = np.random.RandomState(11)
    nz = rng.randn(n).astype(np.float32)
    env = np.exp(-((lt - dur * 0.55) ** 2) / (2 * (dur * 0.17) ** 2))
    sweep = np.sin(2 * np.pi * (200 + 1100 * lt / dur) * lt).astype(np.float32) * 0.3
    x = (nz * 0.5 + sweep) * env
    x = np.convolve(x, np.ones(9) / 9, mode="same")
    buf[i0:i0 + n] += x / (np.abs(x).max() + 1e-9) * amp


def tick(start, amp=0.05, f0=1250.0):
    """Petit clic sec facon horloge : marque le temps sans faire de rythme."""
    i0 = int(start * SR)
    n = min(int(0.05 * SR), N - i0)
    if n <= 0:
        return
    lt = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f0 * lt) * np.exp(-lt * 150)
         + np.sin(2 * np.pi * f0 * 1.7 * lt) * np.exp(-lt * 200) * 0.4)
    buf[i0:i0 + n] += x.astype(np.float32) * amp


def thud(start, amp=0.30, f0=70.0):
    """Battement sourd : la pulsation du suspense, une frappe grave qui tombe."""
    i0 = int(start * SR)
    n = min(int(0.55 * SR), N - i0)
    if n <= 0:
        return
    lt = np.arange(n) / SR
    f = f0 * np.exp(-lt * 9) + f0 * 0.55
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 7.5)
    x *= np.minimum(lt / 0.004, 1.0)                     # anti-clic
    buf[i0:i0 + n] += x.astype(np.float32) * amp


def riser(dur, amp=0.09):
    """Montee continue sur toute la duree : c'est elle qui cree l'attente.

    Elle doit rester SOMBRE. Un bruit qui s'ouvre vers l'aigu donne un sifflement
    de bouilloire, pas de la tension : ici le bruit reste filtre et c'est le
    glissando, qui monte de 110 a 330 Hz, qui porte la montee.
    """
    n = min(int(dur * SR), N)
    lt = np.arange(n) / SR
    u = lt / max(dur, 1e-6)
    rng = np.random.RandomState(23)
    nz = np.convolve(rng.randn(n).astype(np.float32), np.ones(90) / 90, mode="same")
    gliss = np.sin(2 * np.pi * np.cumsum(120 + 320 * u ** 1.6) / SR).astype(np.float32)
    x = (nz * 0.30 + gliss * 0.70) * (u ** 1.8)
    buf[:n] += x * amp


def drone(freqs, dur, amp=0.16):
    """Nappe tenue, legerement desaccordee : le battement entretient le malaise."""
    n = min(int(dur * SR), N)
    lt = np.arange(n) / SR
    env = np.clip(np.minimum(lt / 0.8, 1.0) * np.minimum((dur - lt) / 0.5, 1.0), 0, 1)
    acc = np.zeros(n, dtype=np.float32)
    for f in freqs:
        acc += np.sin(2 * np.pi * f * lt).astype(np.float32)
        acc += np.sin(2 * np.pi * f * 1.007 * lt).astype(np.float32) * 0.7
    acc = np.convolve(acc, np.ones(25) / 25, mode="same")
    buf[:n] += acc / len(freqs) * env * amp


buf = np.zeros(N, dtype=np.float32)

if MUSIC and MUSIC_STYLE == "suspense":
    # Pas d'harmonie qui avance : une tenue grave, une pulsation lente et une
    # montee. Le suspense vient de ce qui ne se resout pas.
    ROOT = 73.42                                   # Re1
    drone([ROOT, ROOT * 1.5, ROOT * 3], TOTAL, amp=0.15)  # quinte + octave-quinte
    drone([ROOT * 4 * 1.0595], TOTAL * 0.92, amp=0.028)   # seconde mineure, tres bas
    riser(TOTAL, amp=0.085)

    PULSE = 60.0 / 58.0                            # ~58 BPM : un pouls, pas un tempo
    k = 0
    while k * PULSE < TOTAL - 0.15:
        u = (k * PULSE) / TOTAL
        thud(k * PULSE, amp=0.18 + 0.30 * u)       # la frappe se rapproche
        if k % 2 == 1:
            tick(k * PULSE + PULSE / 2, amp=0.045 + 0.045 * u)
        k += 1

    # La montee doit s'ENTENDRE : sans cette rampe globale, tout joue au meme
    # niveau du debut a la fin et la tension ne va nulle part.
    ramp = np.linspace(0.30, 1.0, N, dtype=np.float32) ** 1.5
    buf *= ramp

    # fondu de sortie court : on laisse la tension ouverte
    tail = int(0.35 * SR)
    buf[-tail:] *= np.linspace(1, 0, tail, dtype=np.float32)
    buf[:int(0.08 * SR)] *= np.linspace(0, 1, int(0.08 * SR), dtype=np.float32)
    buf *= MUSIC_GAIN

elif MUSIC:
    # Deux accords lents, septiemes ouvertes : c'est l'harmonie qui pose le
    # morceau, pas le tempo. Une suite de quatre accords sur 5 s se bouscule.
    PROG = [
        (55.00, [220.00, 261.63, 329.63, 392.00]),    # Am7
        (43.65, [174.61, 261.63, 329.63, 440.00]),    # Fmaj7
    ]
    for b in range(MUSIC_BARS):
        root, chord = PROG[b % len(PROG)]
        t0 = b * BAR
        sub(root, t0, BAR * 0.98, amp=0.24)
        pad(chord[:3], t0, BAR * 1.04, amp=0.11)
        # arpege a la noire, longue traine : les notes se recouvrent et
        # sonnent comme une harpe au lieu d'un motif rythmique
        for k, idx in enumerate([0, 2, 1, 3]):
            # une octave au-dessus : sans cette presence le morceau n'est qu'un
            # bourdon grave, feutre au point d'etre pateux
            note(chord[idx] * 2, t0 + k * BEAT, BEAT * 2.6, 0.155, decay=2.0,
                 harm=(1.0, 0.30, 0.10))
        if MUSIC_HAT:
            for k in range(4):
                hat(t0 + k * BEAT + BEAT / 2, amp=0.03)

    # fondu de sortie : la boucle se referme au lieu d'etre coupee
    tail = int(1.1 * SR)
    buf[-tail:] *= np.linspace(1, 0, tail, dtype=np.float32) ** 1.5
    buf[:int(0.12 * SR)] *= np.linspace(0, 1, int(0.12 * SR), dtype=np.float32)
    buf *= MUSIC_GAIN

if WHOOSH_AT:
    whoosh(WHOOSH_AT, WHOOSH_GAIN)

peak = np.abs(buf).max()
if peak > 0.99:
    buf *= 0.99 / peak

with wave.open("_music_raw.wav", "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(buf, -1, 1) * 32767).astype("<i2").tobytes())

subprocess.run(
    [FF, "-y", "-hide_banner", "-loglevel", "error", "-i", "_music_raw.wav",
     "-af", f"highpass=f=32,alimiter=limit=0.95,"
            f"loudnorm=I={TARGET_LUFS}:TP=-1.5:LRA=11,"
            f"aformat=channel_layouts=stereo,aresample={SR}",
     "-c:a", "pcm_s16le", OUT], check=True)

print(f"-> {OUT}  {TOTAL:.2f}s  ({BPM:.1f} BPM, {MUSIC_BARS} mesures de {BAR:.2f}s, "
      f"musique seule)")
