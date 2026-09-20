# -*- coding: utf-8 -*-
"""Piste audio finale : voix coupee/nettoyee + bruitages + nappe discrete.

Sortie : v_audio.wav (48 kHz stereo), exactement synchrone avec v_cam.mp4.
La voix reste toujours prioritaire : les bruitages sont places sous elle et la
nappe est a la limite du perceptible.
"""
import subprocess, sys, math, wave, struct
import numpy as np
import imageio_ffmpeg

sys.path.insert(0, "reel")
from config import (SRC, SEGMENTS, SFX, SFX_GAIN, MUSIC, MUSIC_GAIN,
                    VOICE_LUFS, FREEZE_DUR)
from timeline import (map_time, TOTAL, FREEZE_POS, SEG_FRAMES,
                      FREEZE_FRAMES, TOTAL_FRAMES)
from config import FPS

FF = imageio_ffmpeg.get_ffmpeg_exe()
SR = 48000
OUT = "v_audio.wav"

# --- 1. voix : decoupage a l'echantillon, cale sur le decoupage image -------
# On extrait l'audio complet UNE fois puis on tranche en numpy : ffmpeg -ss/-t
# se recale sur les paquets et donnerait des longueurs approximatives.
full = subprocess.run(
    [FF, "-hide_banner", "-loglevel", "error", "-i", SRC, "-vn",
     "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
    capture_output=True, check=True).stdout
full = np.frombuffer(full, dtype=np.int16).astype(np.float32) / 32768.0

# fondu de 12 ms a chaque jonction : supprime les clics sans s'entendre
XF = int(0.012 * SR)
ramp = np.linspace(0, 1, XF, dtype=np.float32)

parts = []
for i, (s_, e_, *_r) in enumerate(SEGMENTS):
    n = int(round(SEG_FRAMES[i] * SR / FPS))     # meme duree que la video
    a = int(round(s_ * SR))
    seg = full[a:a + n]
    if len(seg) < n:
        seg = np.pad(seg, (0, n - len(seg)))
    seg = seg.copy()
    seg[:XF] *= ramp
    seg[-XF:] *= ramp[::-1]
    parts.append(seg)

voice = np.concatenate(parts)

# --- 2. arret sur image : la video gele, l'audio tient le silence -----------
if FREEZE_POS is not None:
    cut = int(round(FREEZE_POS * SR))
    hold = np.zeros(int(round(FREEZE_FRAMES * SR / FPS)), dtype=np.float32)
    voice = np.concatenate([voice[:cut], hold, voice[cut:]])

n_total = int(round(TOTAL_FRAMES * SR / FPS))
if len(voice) < n_total:
    voice = np.pad(voice, (0, n_total - len(voice)))
voice = voice[:n_total]

# --- 3. bruitages synthetises -----------------------------------------------
def whoosh(dur=0.42):
    t = np.arange(int(dur * SR)) / SR
    n = np.random.RandomState(7).randn(len(t)).astype(np.float32)
    # balayage passe-bande grossier : bruit module + enveloppe rapide
    env = np.exp(-((t - dur * 0.32) ** 2) / (2 * (dur * 0.20) ** 2))
    sweep = np.sin(2 * np.pi * (180 + 900 * t / dur) * t) * 0.25
    x = (n * 0.5 + sweep) * env
    # adoucissement (moyenne glissante = passe-bas)
    k = 9
    x = np.convolve(x, np.ones(k) / k, mode="same")
    return x / (np.abs(x).max() + 1e-9)


def tick(dur=0.09):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * 1850 * t) * np.exp(-t * 90)
    x += np.sin(2 * np.pi * 3100 * t) * np.exp(-t * 130) * 0.4
    return x / (np.abs(x).max() + 1e-9)


def impact(dur=0.55):
    t = np.arange(int(dur * SR)) / SR
    f = 110 * np.exp(-t * 7) + 44
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    return x / (np.abs(x).max() + 1e-9)


BANK = {"whoosh": whoosh(), "tick": tick(), "impact": impact()}

sfx_bus = np.zeros(n_total, dtype=np.float32)
for (t_src, kind) in SFX:
    pos = int(map_time(t_src) * SR)
    snd = BANK[kind] * SFX_GAIN[kind]
    end = min(n_total, pos + len(snd))
    if pos < n_total:
        sfx_bus[pos:end] += snd[:end - pos]

# --- 4. nappe d'ambiance : accords doux, tres filtres, tres bas --------------
def pad(n):
    t = np.arange(n) / SR
    out = np.zeros(n, dtype=np.float32)
    # La mineur -> Fa : deux accords lents, sans percussion, sans melodie
    chords = [(0.0, TOTAL * 0.52, [110.0, 164.81, 261.63]),      # Am
              (TOTAL * 0.48, TOTAL, [87.31, 174.61, 261.63])]    # F
    for (cs, ce, notes) in chords:
        i0, i1 = int(cs * SR), min(n, int(ce * SR))
        if i1 <= i0:
            continue
        seg = t[i0:i1] - cs
        dur = (i1 - i0) / SR
        env = np.minimum(seg / 2.5, 1.0) * np.minimum((dur - seg) / 2.5, 1.0)
        env = np.clip(env, 0, 1)
        acc = np.zeros(i1 - i0, dtype=np.float32)
        for f in notes:
            # leger detune : evite le son "sinus de test"
            acc += np.sin(2 * np.pi * f * seg)
            acc += np.sin(2 * np.pi * f * 1.004 * seg) * 0.6
            acc += np.sin(2 * np.pi * f * 2 * seg) * 0.12
        out[i0:i1] += acc / len(notes) * env
    # passe-bas doux : la nappe se place sous la voix, jamais devant
    k = 45
    out = np.convolve(out, np.ones(k) / k, mode="same")
    return out / (np.abs(out).max() + 1e-9)


music = pad(n_total) * MUSIC_GAIN if MUSIC else np.zeros(n_total, dtype=np.float32)

# --- 5. ecriture du pre-mix, puis traitement voix dans ffmpeg ----------------
def write_wav(path, mono):
    x = np.clip(mono, -1, 1)
    with wave.open(path, "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())


write_wav("_voice_raw.wav", voice)
write_wav("_beds.wav", sfx_bus + music)

# Chaine voix : coupe des infra-graves et du vent, de-esseur leger, compression
# douce, puis normalisation loudness aux normes plateformes.
VOICE_CHAIN = (
    "highpass=f=95,"
    "equalizer=f=220:t=q:w=1.1:g=-1.6,"          # degonfle le bas-medium (proximite)
    "equalizer=f=3000:t=q:w=1.6:g=1.5,"          # presence / intelligibilite
    "deesser=i=0.35,"
    "acompressor=threshold=-19dB:ratio=2.6:attack=6:release=180:makeup=2,"
    "alimiter=limit=0.95"
)

subprocess.run(
    [FF, "-y", "-hide_banner", "-loglevel", "error",
     "-i", "_voice_raw.wav", "-i", "_beds.wav",
     "-filter_complex",
     f"[0:a]{VOICE_CHAIN}[v];"
     f"[v][1:a]amix=inputs=2:duration=first:normalize=0[m];"
     f"[m]loudnorm=I={VOICE_LUFS}:TP=-1.5:LRA=11,aformat=channel_layouts=stereo,"
     f"aresample={SR}[out]",
     "-map", "[out]", "-c:a", "pcm_s16le", OUT], check=True)

print(f"-> {OUT}  {TOTAL:.2f}s  (voix {len(parts)} segments, {len(SFX)} bruitages, "
      f"musique={'oui' if MUSIC else 'non'})")
