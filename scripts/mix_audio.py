#!/usr/bin/env python3
"""Phase 5 — mixe voix + musique (ducking sidechain) + SFX, master -14 LUFS / -1 dBTP.
Sortie: data/audio_master.wav (48k stéréo)."""
import json
import subprocess

e = json.load(open('data/edit.json'))
fps = e['meta']['fps']
segs = e['segments']

# out_start sur la grille de frames (aligné à la vidéo)
acc = 0
starts = []
for s in segs:
    starts.append(acc / fps)
    acc += round(s['dur'] * fps)
total = acc / fps

# SFX : (type, temps) ; riser 1s AVANT la révélation
SFXFILE = {
    "impact_deep": "assets/sfx/impact_deep.wav",
    "whoosh_short": "assets/sfx/whoosh_short.wav",
    "click": "assets/sfx/click.wav",
    "riser_1s": "assets/sfx/riser_1s.wav",
}
SFXVOL = {"impact_deep": 0.85, "whoosh_short": 0.5, "click": 0.42, "riser_1s": 0.55}

events = []  # (type, t)
for i, s in enumerate(segs):
    t0 = starts[i]
    for fx in s['sfx']:
        if fx == "riser_1s":
            events.append((fx, max(0.0, t0 - 1.0)))
        else:
            events.append((fx, t0))

# inputs ffmpeg : 0 voice, 1 bed, puis un input par event SFX
inputs = ["-i", "data/voice.wav", "-i", "assets/music/bed.wav"]
for fx, t in events:
    inputs += ["-i", SFXFILE[fx]]

fc = []
# voix : HPF 80, deesser, compression douce
fc.append("[0:a]highpass=f=80,deesser=i=0.35,"
          "acompressor=threshold=-18dB:ratio=3:attack=5:release=120:makeup=2dB,"
          "aresample=48000,asplit=2[vmix][vkey]")
# musique : -20 dB, trim, fade out sur ~8 frames, puis ducking sidechain via la voix
fadest = max(0.0, total - 8 / fps)
fc.append(f"[1:a]atrim=0:{total:.3f},asetpts=PTS-STARTPTS,volume=-20dB,"
          f"afade=t=out:st={fadest:.3f}:d={8/fps:.3f},aresample=48000[mbed]")
fc.append("[mbed][vkey]sidechaincompress=threshold=0.04:ratio=6:attack=5:release=260:makeup=1[mduck]")
# SFX : chaque event retardé + volume
sfxlabels = []
for idx, (fx, t) in enumerate(events):
    inp = 2 + idx
    d = round(t * 1000)
    lab = f"sfx{idx}"
    fc.append(f"[{inp}:a]adelay={d}:all=1,volume={SFXVOL[fx]}[{lab}]")
    sfxlabels.append(f"[{lab}]")
# bus SFX
if sfxlabels:
    fc.append("".join(sfxlabels) + f"amix=inputs={len(sfxlabels)}:normalize=0:dropout_transition=0[sfxbus]")
    mixins = "[vmix][mduck][sfxbus]"
    nmix = 3
else:
    mixins = "[vmix][mduck]"
    nmix = 2
# mix final + master -14 LUFS / -1 dBTP + stéréo
fc.append(f"{mixins}amix=inputs={nmix}:normalize=0:dropout_transition=0[mixed]")
fc.append("[mixed]loudnorm=I=-14:TP=-1:LRA=11,aresample=48000,pan=stereo|c0=c0|c1=c0[out]")

filtergraph = ";".join(fc)
open('data/_mix_filter.txt', 'w').write(filtergraph)

cmd = ["ffmpeg", "-nostdin", "-y"] + inputs + [
    "-filter_complex_script", "data/_mix_filter.txt",
    "-map", "[out]", "-t", f"{total:.3f}",
    "-c:a", "pcm_s16le", "data/audio_master.wav",
]
print("events:", [(fx, round(t, 2)) for fx, t in events])
print("total:", round(total, 3), "s")
r = subprocess.run(cmd, capture_output=True, text=True)
print("ffmpeg exit:", r.returncode)
if r.returncode != 0:
    print(r.stderr[-1500:])
