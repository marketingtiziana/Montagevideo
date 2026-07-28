#!/usr/bin/env python3
# Compile data/edit.json + data/transcript.json -> data/timeline.json
# Sous-titres : TEXTE CORRIGE de edit.json (pas l'ASR brut), aligne sur les timings mots ASR.
# AUCUN timecode en dur cote TSX.
import json, re

FPS = 30
edit = json.load(open("data/edit.json"))
tr = json.load(open("data/transcript.json"))
WORDS = [(w["start"], w["end"], w["w"]) for w in tr["words"]]

ACCENT_RE = re.compile(
    r"(\d|%|€|France|Poker|poker|moiti|décision|faux|dorment|règle|imposable|"
    r"requalifie|milliers|gains|profil|expatri|détail)", re.I)

def words_in(a, b):
    return [(s, e, w) for (s, e, w) in WORDS if s >= a - 0.02 and s < b - 0.02]

def tokenize(text):
    # fusionne la ponctuation FR isolee (espace avant ? ! : » ; et « ouvrant) avec le mot voisin
    raw = [t for t in text.split() if t.strip()]
    out, pend = [], ""
    for t in raw:
        if t == "«":
            pend = t; continue
        if t in ("?", "!", ":", ";", "»", ".", ","):
            if out:
                sep = " " if t in ("?", "!", ":", ";", "»") else ""
                out[-1] = out[-1] + sep + t
            continue
        if pend:
            t = pend + " " + t; pend = ""
        out.append(t)
    return out

def build_caps(seg, out_start, out_end):
    sin, sout = seg["src_in"], seg["src_out"]
    asr = words_in(sin, sout)
    disp = tokenize(seg["text"])
    M, N = len(asr), len(disp)
    if N == 0:
        return []
    timed = []
    for i, word in enumerate(disp):
        if M > 0:
            j = min(M - 1, round(i * M / N))
            at = asr[j][0]
        else:
            at = sin + (i / N) * (sout - sin)
        at_f = round((at - sin) * FPS) + out_start
        at_f = max(out_start, min(out_end - 1, at_f))
        timed.append({"w": word, "accent": bool(ACCENT_RE.search(word)), "at_f": at_f})
    # monotonie stricte
    for i in range(1, len(timed)):
        if timed[i]["at_f"] < timed[i - 1]["at_f"]:
            timed[i]["at_f"] = timed[i - 1]["at_f"]
    # chunks : max 3 mots ET max ~15 caracteres (lisibilite, pas de debordement), coupe sur ponctuation
    caps = []
    cur = []
    def chars(lst):
        return sum(len(x["w"]) for x in lst) + max(0, len(lst) - 1)
    for t in timed:
        if cur and (len(cur) >= 3 or chars(cur) + 1 + len(t["w"]) > 15):
            caps.append(cur); cur = []
        cur.append(t)
        if re.search(r"[.?!:»]$", t["w"]):
            caps.append(cur); cur = []
    if cur:
        caps.append(cur)
    out = []
    for k, ch in enumerate(caps):
        in_f = ch[0]["at_f"]
        nxt = caps[k + 1][0]["at_f"] if k + 1 < len(caps) else out_end
        out_f = max(in_f + 8, min(nxt, ch[-1]["at_f"] + round(0.7 * FPS)))
        out.append({"in_f": in_f, "out_f": out_f,
                    "words": [{"w": x["w"], "accent": x["accent"], "at_f": x["at_f"]} for x in ch]})
    return out

segments = []
cursor = 0
for i, seg in enumerate(edit["segments"]):
    dur_f = round((seg["src_out"] - seg["src_in"]) * FPS)
    trans = seg["transition_in"]
    # base_cut = coupes franches frame-lockees ; transitions rendues cote Remotion.
    out_start = cursor
    out_end = out_start + dur_f
    cursor = out_end
    gl = []
    if seg.get("graphic"):
        gl.append(seg["graphic"])
    gl += seg.get("graphics", [])
    segments.append({
        "id": seg["id"], "act": seg["act"], "why": seg.get("why", ""),
        "src_in": seg["src_in"], "src_out": seg["src_out"], "dur_f": dur_f,
        "out_start": out_start, "out_end": out_end,
        "transition_in": trans, "audio_lead": seg.get("audio_lead", 0.0),
        "camera": seg.get("camera", {"type": "static"}),
        "graphics": gl,
        "captions": build_caps(seg, out_start, out_end),
    })

total = max(s["out_end"] for s in segments)
out = {"meta": {**edit["meta"], "fps": FPS, "total_frames": total,
                "total_seconds": round(total / FPS, 2)}, "segments": segments}
json.dump(out, open("data/timeline.json", "w"), ensure_ascii=False, indent=2)
print(f"timeline.json : {len(segments)} segments, {total} frames = {total/FPS:.1f}s")
for s in segments:
    txt = " ".join(w["w"] for ch in s["captions"] for w in ch["words"])
    print(f"  {s['id']:4} {len(s['captions'])} chunks : {txt[:70]}")
