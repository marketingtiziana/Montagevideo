#!/usr/bin/env python3
# Mix son -> data/audio_final.wav (48k stereo, duree = timeline frame-lockee).
# Voix: HPF80 + de-esser + comp. Musique: -20dB, duck -9dB. Fondu 10 dernieres frames.
# SFX synchronises a la frame sur la timeline : whoosh sur whips, impact sur flash/signature,
# riser avant la revelation 50%, clicks sur cartes. Master -14 LUFS / -1 dBTP.
import json, subprocess

FPS = 30
tl = json.load(open("data/timeline.json"))
DUR = tl["meta"]["total_frames"] / FPS
segs = {s["id"]: s for s in tl["segments"]}
def t_start(sid): return segs[sid]["out_start"] / FPS

VOICE = "data/voice_cut.wav"
BED = "public/assets/music/bed.wav"
IMPACT = "public/assets/sfx/impact_deep.wav"
RISER = "public/assets/sfx/riser_1s.wav"
WHOOSH = "public/assets/sfx/whoosh_short.wav"
CLICK = "public/assets/sfx/click.wav"

# --- cues (secondes, cales frame) ---
# transitions : whip -> whoosh ; flash/signature -> impact
whips = [t_start(s["id"]) for s in tl["segments"] if s["transition_in"] == "whip"]
impacts = [t_start(s["id"]) for s in tl["segments"] if s["transition_in"] in ("flash", "SIGNATURE")]
riser_t = t_start("s10") - 1.0                     # riser finit sur la revelation 50%
clicks = [t_start("s04"), t_start("s07"), t_start("s09"), t_start("s12"), t_start("s15")]  # apparitions de cartes

def ms(x): return int(max(0, x) * 1000)

fc = []
# voix
fc.append(
    "[0:a]highpass=f=80,deesser,acompressor=threshold=-20dB:ratio=3:attack=6:release=120,"
    "volume=3dB,alimiter=limit=0.95,aformat=channel_layouts=stereo,apad=whole_dur={d},atrim=0:{d}[voice]".format(d=DUR)
)
fc.append("[voice]asplit=2[vmix][vkey]")
# musique duckee + fondu final
fc.append("[1:a]aloop=loop=-1:size=2e9,atrim=0:{d},volume=-20dB,aformat=channel_layouts=stereo[bed]".format(d=DUR))
fc.append("[bed][vkey]sidechaincompress=threshold=0.03:ratio=8:attack=5:release=250:makeup=1[bd]")
fc.append("[bd]afade=t=out:st={st}:d={fd}[music]".format(st=DUR - 10 / FPS, fd=10 / FPS))

# SFX : chaque input indexe, adelay + volume
inputs = ["-i", VOICE, "-i", BED]
idx = 2
sfx_labels = []
def add_sfx(path, t, vol, whoosh_lead=0.0):
    global idx
    inputs.extend(["-i", path])
    lab = f"s{idx}"
    fc.append(f"[{idx}:a]adelay={ms(t - whoosh_lead)}|{ms(t - whoosh_lead)},volume={vol}[{lab}]")
    sfx_labels.append(f"[{lab}]"); idx += 1

for t in whips: add_sfx(WHOOSH, t, "-13dB", whoosh_lead=0.13)
for t in impacts: add_sfx(IMPACT, t, "-10dB")
add_sfx(RISER, riser_t, "-14dB")
for t in clicks: add_sfx(CLICK, t, "-17dB")

mix_ins = "[vmix][music]" + "".join(sfx_labels)
n = 2 + len(sfx_labels)
fc.append(f"{mix_ins}amix=inputs={n}:normalize=0:duration=first[mix]")
fc.append("[mix]loudnorm=I=-14:TP=-1:LRA=11,aformat=channel_layouts=stereo:sample_rates=48000[out]")

cmd = ["ffmpeg", "-nostdin", "-y"] + inputs + ["-filter_complex", ";".join(fc),
       "-map", "[out]", "-t", f"{DUR:.3f}", "data/audio_final.wav"]
print(f"DUR={DUR:.3f}s | whooshs={len(whips)} impacts={len(impacts)} clicks={len(clicks)} riser@{riser_t:.1f}")
subprocess.run(cmd, check=True)
d = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1","data/audio_final.wav"],capture_output=True,text=True).stdout.strip()
print("audio_final.wav:", d, "s")
