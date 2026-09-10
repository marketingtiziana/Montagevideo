# -*- coding: utf-8 -*-
# Beat "corporate sombre" synthetise (aucun fichier fourni). Am, ~80 BPM :
# thump sub, drone grave, nappe mineure, pluck de tension, texture de bruit.
# Volume global bas (loudnorm -24) pour rester SOUS la voix ; ducking gere au mix.
import subprocess, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
DUR = 24

kick   = "aevalsrc=0.75*sin(2*PI*50*t)*exp(-7*mod(t\\,0.75)):d=%d:s=48000" % DUR
drone  = "aevalsrc=0.10*sin(2*PI*55*t)+0.08*sin(2*PI*73.42*t):d=%d:s=48000" % DUR
pad    = "aevalsrc=0.055*sin(2*PI*220*t)+0.045*sin(2*PI*261.63*t)+0.045*sin(2*PI*329.63*t):d=%d:s=48000" % DUR
pluck  = "aevalsrc=0.11*sin(2*PI*659.25*t)*exp(-11*mod(t\\,0.375)):d=%d:s=48000" % DUR
noise  = "anoisesrc=c=pink:a=0.10:d=%d" % DUR

fc = (
    "[4:a]highpass=f=6500,lowpass=f=12000,volume=0.5[hats];"
    "[0:a][1:a][2:a][3:a][hats]amix=inputs=5:normalize=0:dropout_transition=0[mixraw];"
    "[mixraw]highpass=f=32,lowpass=f=11500,aecho=0.8:0.7:60:0.22,"
    "loudnorm=I=-24:TP=-3:LRA=11,alimiter=limit=0.9[out]"
)
cmd = [FF, '-y',
       '-f', 'lavfi', '-i', kick,
       '-f', 'lavfi', '-i', drone,
       '-f', 'lavfi', '-i', pad,
       '-f', 'lavfi', '-i', pluck,
       '-f', 'lavfi', '-i', noise,
       '-filter_complex', fc, '-map', '[out]',
       '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', 'music_h.wav']
r = subprocess.run(cmd, capture_output=True, text=True)
print('rc:', r.returncode)
if r.returncode: print(r.stderr[-1500:])
else:
    import re
    meas = subprocess.run([FF, '-i', 'music_h.wav', '-af', 'volumedetect', '-f', 'null', '-'],
                          capture_output=True, text=True).stderr
    for k in ['max_volume', 'mean_volume']:
        m = re.search(rf'{k}.*', meas)
        if m: print(m.group(0).strip())
    print('-> music_h.wav')
