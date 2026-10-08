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
from config import (DURATION, MUSIC, MUSIC_BPM, MUSIC_GAIN, MUSIC_HAT,
                    WHOOSH_AT, WHOOSH_GAIN, TARGET_LUFS)

FF = imageio_ffmpeg.get_ffmpeg_exe()
SR = 48000
OUT = "a_broll.wav"
N = int(round(DURATION * SR))
t = np.arange(N) / SR

# MUSIC_BPM = 0 : on cale 4 mesures sur la duree du reel, sinon la boucle se
# fait couper au milieu d'une mesure.
BPM = MUSIC_BPM if MUSIC_BPM > 0 else 4 * 4 * 60.0 / DURATION
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


buf = np.zeros(N, dtype=np.float32)

if MUSIC:
    # Am -> Fmaj7 -> Cmaj7 -> G : quatre mesures, chaud et ouvert
    PROG = [
        (55.00,  [220.00, 261.63, 329.63, 440.00]),   # Am
        (43.65,  [174.61, 261.63, 329.63, 440.00]),   # Fmaj7
        (65.41,  [261.63, 329.63, 392.00, 493.88]),   # Cmaj7
        (49.00,  [196.00, 246.94, 293.66, 392.00]),   # G
    ]
    for b, (root, chord) in enumerate(PROG):
        t0 = b * BAR
        sub(root, t0, BAR * 0.95)
        pad([f / 2 for f in chord[:3]], t0, BAR * 1.02, amp=0.125)
        # arpege en croches : monte puis redescend, legerement swingue
        order = [0, 1, 2, 3, 2, 1, 2, 3]
        for k, idx in enumerate(order):
            swing = 0.012 if k % 2 else 0.0
            note(chord[idx], t0 + k * BEAT / 2 + swing, 0.60, 0.115, decay=5.5)
        if MUSIC_HAT:
            for k in range(8):
                if k % 2:
                    hat(t0 + k * BEAT / 2, amp=0.035)

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

print(f"-> {OUT}  {DURATION:.2f}s  ({BPM:.1f} BPM, 4 mesures de {BAR:.2f}s, musique seule)")
