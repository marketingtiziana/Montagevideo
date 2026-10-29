# -*- coding: utf-8 -*-
"""Voice clean-up: noise reduction, low-cut, de-essing, gentle compression, normalisation.
base.mp4 (raw voice) -> voice.wav (48 kHz stereo, ~-16 LUFS, no clipping)."""
import subprocess, os, json, re
from config import WORK

src = os.path.join(WORK, 'base.mp4')
out = os.path.join(WORK, 'voice.wav')

CHAIN = (
    "highpass=f=80:poles=2,"
    "afftdn=nf=-30:nr=10:tn=1,"                       # broadband noise reduction (room/hiss)
    "deesser=i=0.35:m=0.5:f=0.5:s=o,"                 # tame sibilance
    "equalizer=f=3200:t=q:w=1.2:g=1.5,"               # presence
    "equalizer=f=250:t=q:w=1.0:g=-1.0,"               # slight mud cut
    "acompressor=threshold=-21dB:ratio=2.6:attack=6:release=150:makeup=3:knee=4"
)
# pass 1: measure for linear loudnorm
m = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', src, '-af',
                    CHAIN + ",loudnorm=I=-16:TP=-2:LRA=8:print_format=json", '-f', 'null', '-'],
                   capture_output=True, text=True).stderr
j = json.loads(m[m.rfind('{'):m.rfind('}') + 1])
ln = (f"loudnorm=I=-16:TP=-2:LRA=8:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
      f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
r = subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', src, '-vn', '-af',
                    CHAIN + "," + ln + ",aresample=48000", '-ac', '2', '-c:a', 'pcm_s24le', out],
                   capture_output=True, text=True)
print('voice rc:', r.returncode, r.stderr[-800:] if r.returncode else '')
s = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', out, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                   capture_output=True, text=True).stderr
print(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(0), '|', re.search(r'Peak:\s+(-?[\d.]+) dBFS', s).group(0))
