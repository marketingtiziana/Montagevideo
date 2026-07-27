import subprocess, json, imageio_ffmpeg, os
FF = imageio_ffmpeg.get_ffmpeg_exe()
ev = json.load(open('audio_events.json'))

# subtitle blips: throttle so rapid consecutive cards don't machine-gun
blips = []
if os.path.exists('subs_meta.json'):
    last = -9
    for m in json.load(open('subs_meta.json')):
        gap = m['t'] - last
        # blip on key (yellow) words, or when a fresh phrase starts after a pause
        if m['accent'] or gap > 0.9:
            blips.append((m['t'], 0.22 if m['accent'] else 0.14))
            last = m['t']

# build (file, time, volume) event list
events = []
for j, b in enumerate(ev.get('whoosh', [])):
    events.append(('sfx/whoosh_soft.wav' if j % 2 == 0 else 'sfx/riser.wav', b, 0.7))
for b in ev.get('appear', []):
    events.append(('sfx/pop.wav', b, 0.5))          # incrustation appears
for b in ev.get('tick', []):
    events.append(('sfx/cut.wav', b, 0.28))         # jump-cut
for (b, v) in blips:
    events.append(('sfx/blip.wav', b, v))           # text appears

inputs = ['-i', 'finalv.mp4']
fc = []
labels = ['0:a']
for i, (f, b, v) in enumerate(events, start=1):
    inputs += ['-i', f]
    ms = max(0, int(b*1000))
    fc.append(f"[{i}:a]aformat=channel_layouts=stereo:sample_rates=44100,adelay={ms}|{ms},volume={v}[e{i}]")
    labels.append(f"e{i}")

mix = "".join(f"[{l}]" for l in labels) + f"amix=inputs={len(labels)}:normalize=0:dropout_transition=0,alimiter=limit=0.97[aout]"
fc.append(mix)
cmd = [FF, '-y'] + inputs + ['-filter_complex', ";".join(fc),
       '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
       'REEL3_TVA_final.mp4']
print(f"events: {len(ev.get('whoosh',[]))} whoosh, {len(ev.get('appear',[]))} appear, {len(ev.get('tick',[]))} cut, {len(blips)} text-blip")
r = subprocess.run(cmd, capture_output=True, text=True)
print('rc:', r.returncode)
if r.returncode: print(r.stderr[-1500:])
