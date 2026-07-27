#!/usr/bin/env python3
# Genere out/short_captions.srt depuis data/timeline.json (un sous-titre par chunk).
import json, os
FPS = 30
tl = json.load(open("data/timeline.json"))

def tc(fr):
    s = fr / FPS
    h = int(s // 3600); m = int((s % 3600) // 60); sec = int(s % 60); ms = int((s - int(s)) * 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"

lines = []
n = 0
for seg in tl["segments"]:
    for ch in seg["captions"]:
        n += 1
        txt = " ".join(w["w"] for w in ch["words"]).strip()
        lines.append(f"{n}\n{tc(ch['in_f'])} --> {tc(ch['out_f'])}\n{txt}\n")
os.makedirs("out", exist_ok=True)
open("out/short_captions.srt", "w").write("\n".join(lines))
print(f"SRT : {n} sous-titres -> out/short_captions.srt")
