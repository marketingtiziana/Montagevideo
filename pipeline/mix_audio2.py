# -*- coding: utf-8 -*-
# Mixage SFX LEGER par-dessus le lit voix RØDE (qui reste la star).
# whoosh doux sur les entrees/sorties de B-roll, pop discret sur les inserts.
import subprocess, json, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
ev = json.load(open('audio_events.json'))

events = []
for j, b in enumerate(ev.get('broll', [])):
    events.append(('sfx/whoosh_soft.wav', max(0, b - 0.08), 0.34))   # entree cutaway
for b in ev.get('broll_end', []):
    events.append(('sfx/whoosh_soft.wav', max(0, b - 0.10), 0.24))   # retour visage
for b in ev.get('appear', []):
    events.append(('sfx/pop.wav', b, 0.26))                          # apparition insert

inputs = ['-i', 'finalv.mp4']
fc = []
labels = ['0:a']
for i, (f, b, v) in enumerate(events, start=1):
    inputs += ['-i', f]
    ms = max(0, int(b*1000))
    fc.append(f"[{i}:a]aformat=channel_layouts=stereo:sample_rates=48000,adelay={ms}|{ms},volume={v}[e{i}]")
    labels.append(f"e{i}")

mix = ("".join(f"[{l}]" for l in labels) +
       f"amix=inputs={len(labels)}:normalize=0:dropout_transition=0,"
       f"loudnorm=I=-14:TP=-1.3:LRA=10,alimiter=limit=0.96[aout]")
fc.append(mix)
cmd = [FF, '-y'] + inputs + ['-filter_complex', ";".join(fc),
       '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
       'REEL_regle3_final.mp4']
print(f"events: {len(ev.get('broll',[]))} broll, {len(ev.get('appear',[]))} inserts")
r = subprocess.run(cmd, capture_output=True, text=True)
print('rc:', r.returncode)
if r.returncode:
    print(r.stderr[-1500:])
else:
    meas = subprocess.run([FF, '-i', 'REEL_regle3_final.mp4', '-af',
        'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    import re
    for k in ['max_volume', 'mean_volume']:
        m = re.search(rf'{k}.*', meas)
        if m: print(m.group(0).strip())
