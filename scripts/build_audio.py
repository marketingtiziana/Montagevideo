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

import re
def norm(s): return re.sub(r"[^a-z0-9]", "", s.lower())
ENTER, EXITF = 14, 9
def appear_frame(seg, g):
    a = seg["out_start"] + 6
    ow = g.get("on_word")
    if ow:
        k = norm(ow)
        for ch in seg["captions"]:
            for w in ch["words"]:
                if k in norm(w["w"]) or norm(w["w"]) in k:
                    a = max(seg["out_start"] + 2, w["at_f"] - 4); break
            else: continue
            break
    MINTOTAL = ENTER + 42 + EXITF
    if a + MINTOTAL > seg["out_end"]:
        a = max(seg["out_start"], seg["out_end"] - MINTOTAL)
    return a

# --- cues (secondes, cales frame) ---
# whoosh UNIQUEMENT sur les zoom-through (mouvement) — jamais sur une coupe franche
whooshs = [t_start(s["id"]) for s in tl["segments"] if s["transition_in"] == "zoom_through"]
# impact sur les 2 snap zooms (punchlines) : "decision" (s09), "dorment" (s13)
def word_t(sid, key):
    s = next(x for x in tl["segments"] if x["id"] == sid)
    for ch in s["captions"]:
        for w in ch["words"]:
            if key in w["w"].lower():
                return w["at_f"] / FPS
    return s["out_start"] / FPS
impacts = [word_t("s09", "décision"), word_t("s13", "dorment")]
riser_t = t_start("s10") - 1.0                     # riser finit sur la revelation 50%
# POP sur CHAQUE apparition d'incrustation (cartes ET tags) — bien audible
clicks = []
for s in tl["segments"]:
    for g in s.get("graphics", []):
        if g:
            clicks.append(appear_frame(s, g) / FPS)
# whoosh doux sur l'entree de chaque b-roll (cut-away)
broll_wh = []
for s in tl["segments"]:
    for b in s.get("broll", []):
        broll_wh.append(b["in_f"] / FPS)

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
def add_sfx(path, t, vol, lead=0.0, pre=""):
    global idx
    inputs.extend(["-i", path])
    lab = f"s{idx}"
    chain = f"[{idx}:a]"
    if pre:
        chain += pre + ","
    chain += f"adelay={ms(t - lead)}|{ms(t - lead)},volume={vol}[{lab}]"
    fc.append(chain)
    sfx_labels.append(f"[{lab}]"); idx += 1

# whoosh : pic sur la frame de coupe, 0,3 s de montee avant
for t in whooshs: add_sfx(WHOOSH, t, "-11dB", lead=0.30)
# b-roll cut-away : whoosh + impact (bien marque)
for t in broll_wh:
    add_sfx(WHOOSH, t, "-13dB", lead=0.22)
    add_sfx(IMPACT, t, "-13dB")
# impact snap zoom : -9dB
for t in impacts: add_sfx(IMPACT, t, "-9dB")
# risers : avant la revelation 50% (s10) et avant la punchline (s13)
add_sfx(RISER, riser_t, "-13dB")
add_sfx(RISER, t_start("s13") - 1.0, "-15dB")
# POP incrustation : bien audible, passe-haut leger 800Hz
for t in clicks: add_sfx(CLICK, t, "-13dB", pre="highpass=f=800")

mix_ins = "[vmix][music]" + "".join(sfx_labels)
n = 2 + len(sfx_labels)
fc.append(f"{mix_ins}amix=inputs={n}:normalize=0:duration=first[mix]")
fc.append("[mix]loudnorm=I=-14:TP=-1:LRA=11,aformat=channel_layouts=stereo:sample_rates=48000[out]")

cmd = ["ffmpeg", "-nostdin", "-y"] + inputs + ["-filter_complex", ";".join(fc),
       "-map", "[out]", "-t", f"{DUR:.3f}", "data/audio_final.wav"]
print(f"DUR={DUR:.3f}s | whooshs={len(whooshs)} impacts={len(impacts)} clicks={len(clicks)} riser@{riser_t:.1f}")
subprocess.run(cmd, check=True)
d = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1","data/audio_final.wav"],capture_output=True,text=True).stdout.strip()
print("audio_final.wav:", d, "s")
