#!/usr/bin/env python3
# Mix son -> data/audio_final.wav (48k stereo, duree = video).
# Voix: HPF80 + de-esser + compression douce. Musique: -20dB, duck -9dB (sidechain).
# SFX motives: impact sur le pivot, riser avant la revelation 50%, clicks discrets sur cartes.
# Master -14 LUFS / -1 dBTP. Fondu musique sur 10 dernieres frames.
import json, subprocess, os

FPS = 30
tl = json.load(open("data/timeline.json"))
DUR = tl["meta"]["total_frames"] / FPS
segs = {s["id"]: s for s in tl["segments"]}

def t_of(seg_id, off_frames=6):
    return (segs[seg_id]["out_start"] + off_frames) / FPS

VOICE = "data/voice_cut.wav"
BED = "public/assets/music/bed.wav"
IMPACT = "public/assets/sfx/impact_deep.wav"
RISER = "public/assets/sfx/riser_1s.wav"
CLICK = "public/assets/sfx/click.wav"

# Cues SFX (secondes)
sig = next((s for s in tl["segments"] if s["transition_in"] == "SIGNATURE"), None)
t_impact = (sig["out_start"] - 4) / FPS if sig else 34.0
t_riser = t_of("s10", 6) - 1.0            # riser 1s finit sur la revelation 50%
clicks = [t_of("s03"), t_of("s08"), t_of("s11"), t_of("s15")]  # FAUX, ComparisonBar, PIEGE, CTA

def ms(x): return int(max(0, x) * 1000)

# --- Filtergraph ---
# 0: voix  1: bed  2: impact  3: riser  4..: clicks (meme fichier click, adelay differents)
inputs = ["-i", VOICE, "-i", BED, "-i", IMPACT, "-i", RISER]
for _ in clicks:
    inputs += ["-i", CLICK]

fc = []
# voix : nettoyage
fc.append(
    "[0:a]highpass=f=80,deesser,"
    "acompressor=threshold=-20dB:ratio=3:attack=6:release=120:makeup=3dB,"
    "alimiter=limit=0.95,aformat=channel_layouts=stereo,apad=whole_dur={dur},atrim=0:{dur}[voice]".format(dur=DUR)
)
# copie de la voix pour la sidechain
fc.append("[voice]asplit=2[vmix][vkey]")
# musique : boucle -> longueur, gain -20dB, duck sous la voix, fade out final
fade_start = DUR - 10 / FPS
fc.append(
    "[1:a]aloop=loop=-1:size=2e9,atrim=0:{dur},volume=-20dB,"
    "aformat=channel_layouts=stereo[bed]".format(dur=DUR)
)
fc.append(
    "[bed][vkey]sidechaincompress=threshold=0.03:ratio=8:attack=5:release=250:makeup=0[bedduck]"
)
fc.append("[bedduck]afade=t=out:st={fs}:d={fd}[music]".format(fs=fade_start, fd=10 / FPS))
# SFX
fc.append(f"[2:a]adelay={ms(t_impact)}|{ms(t_impact)},volume=-9dB[impact]")
fc.append(f"[3:a]adelay={ms(t_riser)}|{ms(t_riser)},volume=-13dB[riser]")
click_labels = []
for i, ct in enumerate(clicks):
    lab = f"clk{i}"
    fc.append(f"[{4+i}:a]adelay={ms(ct)}|{ms(ct)},volume=-16dB[{lab}]")
    click_labels.append(f"[{lab}]")
# mix final
mix_ins = "[vmix][music][impact][riser]" + "".join(click_labels)
n = 4 + len(click_labels)
fc.append(f"{mix_ins}amix=inputs={n}:normalize=0:duration=first[mixed]")
# master -14 LUFS / -1 dBTP
fc.append("[mixed]loudnorm=I=-14:TP=-1:LRA=11,aformat=channel_layouts=stereo:sample_rates=48000[out]")

cmd = ["ffmpeg", "-nostdin", "-y"] + inputs + [
    "-filter_complex", ";".join(fc), "-map", "[out]", "-t", f"{DUR:.3f}",
    "data/audio_final.wav",
]
print("cues: impact=%.2f riser=%.2f clicks=%s" % (t_impact, t_riser, [round(c, 1) for c in clicks]))
subprocess.run(cmd, check=True)
d = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1","data/audio_final.wav"],capture_output=True,text=True).stdout.strip()
print("audio_final.wav:", d, "s (cible", round(DUR,2), "s)")
