import subprocess, json, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
ev = json.load(open('audio_events.json'))
whoosh, pops = ev['whoosh'], ev['pop']

inputs = ['-i', 'finalv.mp4']
fc = []
labels = ['0:a']
idx = 1
for j, b in enumerate(whoosh):
    src = 'sfx/whoosh1.wav' if j % 2 == 0 else 'sfx/whoosh2.wav'
    inputs += ['-i', src]
    ms = int(b*1000)
    fc.append(f"[{idx}:a]aformat=channel_layouts=stereo:sample_rates=44100,adelay={ms}|{ms},volume=0.8[w{j}]")
    labels.append(f"w{j}"); idx += 1
for j, b in enumerate(pops):
    inputs += ['-i', 'sfx/pop.wav']
    ms = int(b*1000)
    fc.append(f"[{idx}:a]aformat=channel_layouts=stereo:sample_rates=44100,adelay={ms}|{ms},volume=0.55[p{j}]")
    labels.append(f"p{j}"); idx += 1
for j, b in enumerate(ev.get('tick', [])):
    inputs += ['-i', 'sfx/tick.wav']
    ms = int(b*1000)
    fc.append(f"[{idx}:a]aformat=channel_layouts=stereo:sample_rates=44100,adelay={ms}|{ms},volume=0.33[t{j}]")
    labels.append(f"t{j}"); idx += 1

mix = "".join(f"[{l}]" for l in labels) + f"amix=inputs={len(labels)}:normalize=0:dropout_transition=0,alimiter=limit=0.95[aout]"
fc.append(mix)
cmd = [FF, '-y'] + inputs + ['-filter_complex', ";".join(fc),
       '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
       'REEL3_TVA_final.mp4']
print(f"whooshes:{len(whoosh)} pops:{len(pops)}")
r = subprocess.run(cmd, capture_output=True, text=True)
print('rc:', r.returncode)
if r.returncode: print(r.stderr[-1500:])
