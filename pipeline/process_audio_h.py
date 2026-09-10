# -*- coding: utf-8 -*-
# Voix propre "broadcast" pour le reel HOLDING : dé-rumble, débruitage doux,
# de-esser, EQ chaleur/présence/air, compression, loudnorm -14 LUFS.
# La voix doit rester AU-DESSUS de la musique -> on la normalise fort et propre.
import subprocess, imageio_ffmpeg, re, sys
FF = imageio_ffmpeg.get_ffmpeg_exe()
SRC = 'input/source.mp4'
OUT = 'voice_h.wav'

CHAIN = ",".join([
    "highpass=f=80:poles=2",
    "afftdn=nr=11:nf=-25:tn=1",
    "deesser=i=0.32:m=0.5:f=0.18",
    "equalizer=f=170:t=q:w=1.1:g=2.0",     # chaleur bas-medium
    "equalizer=f=420:t=q:w=1.4:g=-2.0",    # de-boxe
    "equalizer=f=4200:t=q:w=1.3:g=3.0",    # presence
    "highshelf=f=9500:g=2.8",              # air
    "acompressor=threshold=-20dB:ratio=3.2:attack=8:release=140:makeup=3:knee=4",
    "acompressor=threshold=-13dB:ratio=2.0:attack=20:release=250:makeup=1.5:knee=6",
    "loudnorm=I=-14:TP=-1.3:LRA=10",
    "aresample=48000",
    "alimiter=limit=0.96:level=false",
])
r = subprocess.run([FF, '-y', '-i', SRC, '-vn', '-af', CHAIN,
                    '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le', OUT],
                   capture_output=True, text=True)
print('rc:', r.returncode)
if r.returncode:
    print(r.stderr[-1500:]); sys.exit(1)
meas = subprocess.run([FF, '-i', OUT, '-af',
    'loudnorm=I=-14:TP=-1.3:LRA=10:print_format=summary,volumedetect',
    '-f', 'null', '-'], capture_output=True, text=True).stderr
for k in ['Input Integrated', 'Input True Peak', 'max_volume', 'mean_volume']:
    m = re.search(rf'{re.escape(k)}.*', meas)
    if m: print(m.group(0).strip())
print('->', OUT)
