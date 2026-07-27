#!/usr/bin/env python3
"""Génère out/short_captions.srt depuis edit.json (timeline de sortie, texte corrigé)."""
import json

e = json.load(open('data/edit.json'))
fps = e['meta']['fps']
segs = e['segments']

acc = 0
starts = []
for s in segs:
    starts.append(acc / fps)
    acc += round(s['dur'] * fps)


def fmt(t):
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    sec = int(t % 60)
    ms = int(round((t - int(t)) * 1000))
    if ms == 1000:
        ms = 0
        sec += 1
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"


def clean(w):
    return w.replace("«", "").replace("»", "").strip()


lines = []
idx = 0
for i, s in enumerate(segs):
    base = starts[i]
    words = s['caption_words']
    for j in range(0, len(words), 3):
        grp = words[j:j + 3]
        st = base + grp[0]['start']
        en = base + grp[-1]['end']
        txt = " ".join(clean(w['w']) for w in grp).strip()
        if not txt:
            continue
        idx += 1
        lines.append(f"{idx}\n{fmt(st)} --> {fmt(en)}\n{txt}\n")

open('out/short_captions.srt', 'w', encoding='utf-8').write("\n".join(lines) + "\n")
print("SRT:", idx, "sous-titres ->", "out/short_captions.srt")
