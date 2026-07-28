#!/usr/bin/env python3
import json
e = json.load(open('data/edit.json'))
segs = e['segments']
parts = []
vlab = []
alab = []
for i, s in enumerate(segs):
    a = s['src_in']
    b = s['src_out']
    parts.append(
        f"[0:v]trim=start={a}:end={b},setpts=PTS-STARTPTS,fps=30,"
        f"scale=1080:1920:force_original_aspect_ratio=increase,"
        f"crop=1080:1920,setsar=1[v{i}];"
    )
    parts.append(f"[0:a]atrim=start={a}:end={b},asetpts=PTS-STARTPTS[a{i}];")
    vlab.append(f"[v{i}]")
    alab.append(f"[a{i}]")
concat = "".join(f"{vlab[i]}{alab[i]}" for i in range(len(segs)))
concat += f"concat=n={len(segs)}:v=1:a=1[v][a]"
fc = "".join(parts) + concat
with open('data/_basecut_filter.txt', 'w') as f:
    f.write(fc)
print("segments:", len(segs), "| filter chars:", len(fc))
