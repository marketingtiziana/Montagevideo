# -*- coding: utf-8 -*-
# Mix audio du reel HOLDING : voix (au-dessus) + musique DUCKEE sous la voix
# (sidechaincompress ~ -12 dB) + SFX (whoosh sur transitions, pop sur apparitions,
# riser avant le CTA). Loudnorm final -14 LUFS.
import subprocess, json, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
ev = json.load(open('audio_events_h.json'))
TOTAL = ev['total']; CTA = ev['cta_start']

# construit la liste des SFX (fichier, temps, volume)
sfx = []
for t in ev['cut_in'] + ev['cut_out'] + [CTA]:
    sfx.append(('sfx/whoosh_soft.wav', max(0, t-0.06), 0.5))
sfx.append(('sfx/riser.wav', max(0, CTA-0.55), 0.6))          # riser avant CTA
for t in ev['big_caps'] + [ev['poche']]:
    sfx.append(('sfx/pop.wav', t, 0.26))

inputs = ['-i', 'finalv_h.mp4', '-i', 'voice_h.wav', '-i', 'music_h.wav']
base = 3
for (f, t, v) in sfx:
    inputs += ['-i', f]

fc = []
# voix : pad a la duree totale + split (bed + cle sidechain)
fc.append(f"[1:a]apad=pad_dur={CTA},atrim=0:{TOTAL},asetpts=N/SR/TB,asplit=2[vbed][vkey]")
# musique duckee par la voix
fc.append(f"[2:a]atrim=0:{TOTAL},asetpts=N/SR/TB[mus]")
fc.append(f"[mus][vkey]sidechaincompress=threshold=0.05:ratio=9:attack=5:release=300:makeup=1[mduck]")
# sfx
labels = ['vbed', 'mduck']
for i, (f, t, v) in enumerate(sfx):
    src = base + i
    ms = max(0, int(t*1000))
    fc.append(f"[{src}:a]aformat=channel_layouts=stereo:sample_rates=48000,adelay={ms}|{ms},volume={v}[s{i}]")
    labels.append(f's{i}')
mix = "".join(f"[{l}]" for l in labels) + \
      f"amix=inputs={len(labels)}:normalize=0:dropout_transition=0,loudnorm=I=-14:TP=-1.3:LRA=11,alimiter=limit=0.97[aout]"
fc.append(mix)

cmd = [FF, '-y'] + inputs + ['-filter_complex', ";".join(fc),
       '-map', '0:v', '-map', '[aout]', '-t', f'{TOTAL}',
       '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', 'output/reel_holding_final.mp4']
import os; os.makedirs('output', exist_ok=True)
print(f"sfx events: {len(sfx)} | total {TOTAL}s")
r = subprocess.run(cmd, capture_output=True, text=True)
print('rc:', r.returncode)
if r.returncode: print(r.stderr[-2000:])
else:
    import re
    meas = subprocess.run([FF, '-i', 'output/reel_holding_final.mp4', '-af',
        'loudnorm=I=-14:TP=-1.3:print_format=summary,volumedetect', '-f', 'null', '-'],
        capture_output=True, text=True).stderr
    for k in ['Input Integrated', 'Input True Peak', 'max_volume']:
        m = re.search(rf'{re.escape(k)}.*', meas)
        if m: print(m.group(0).strip())
