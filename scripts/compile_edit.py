#!/usr/bin/env python3
# Compile data/edit.json + data/transcript.json -> data/timeline.json
# Sous-titres : TEXTE CORRIGE de edit.json (pas l'ASR brut), aligne sur les timings mots ASR.
# AUCUN timecode en dur cote TSX.
import json, re

import os
FPS = 30
edit = json.load(open("data/edit.json"))
tr = json.load(open("data/transcript.json"))
WORDS = [(w["start"], w["end"], w["w"]) for w in tr["words"]]
# keeps.json : ranges de speech conservees par segment (silences retires). Re-time tout.
KEEPS = json.load(open("data/keeps.json")) if os.path.exists("data/keeps.json") else {}

def seg_dur_f(seg):
    ks = KEEPS.get(seg["id"])
    if ks:
        return round(sum(b - a for a, b in ks) * FPS)
    return round((seg["src_out"] - seg["src_in"]) * FPS)

def map_time(seg, out_start, t):
    # temps source t -> frame de sortie, a travers les ranges conservees
    ks = KEEPS.get(seg["id"])
    if not ks:
        return round((t - seg["src_in"]) * FPS) + out_start
    off = 0.0
    for (a, b) in ks:
        if t < a:
            break
        if t <= b:
            return round((off + (t - a)) * FPS) + out_start
        off += (b - a)
    return round(off * FPS) + out_start

# Mots JAUNES (#FFD84D) — 4 maximum sur tout le short, mots de rupture/enjeu.
# mots jaunes sur des sous-titres VISIBLES (pas sous une carte plein cadre) — 4 max
YELLOW = [("s01", "coûter"), ("s05", "faux"), ("s13", "dorment")]
STRIP = "«».,:;…\""  # ponctuation retiree (apostrophes/traits d'union gardes ; le '?' est conserve)

def words_in(a, b):
    return [(s, e, w) for (s, e, w) in WORDS if s >= a - 0.02 and s < b - 0.02]

def tokenize(text):
    # retire la ponctuation (STRIP) ; conserve le '?' (rattache au mot precedent). Apostrophes gardees.
    raw = [t for t in text.split() if t.strip()]
    out = []
    for t in raw:
        q = "?" in t
        cleaned = "".join(c for c in t if c not in STRIP and c != "?").strip()
        if not cleaned:
            if q and out:
                out[-1] = out[-1] + " ?"
            continue
        if q:
            cleaned = cleaned + " ?"
        out.append(cleaned)
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
        at_f = map_time(seg, out_start, at)
        at_f = max(out_start, min(out_end - 1, at_f))
        key = any(sid == seg["id"] and sub in word.lower() for sid, sub in YELLOW)
        timed.append({"w": word, "key": key, "at_f": at_f})
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
        if t["w"].endswith("?"):
            caps.append(cur); cur = []
    if cur:
        caps.append(cur)
    out = []
    for k, ch in enumerate(caps):
        in_f = ch[0]["at_f"]
        nxt = caps[k + 1][0]["at_f"] if k + 1 < len(caps) else out_end
        out_f = max(in_f + 8, min(nxt, ch[-1]["at_f"] + round(0.7 * FPS)))
        out.append({"in_f": in_f, "out_f": out_f,
                    "words": [{"w": x["w"], "key": x["key"], "at_f": x["at_f"]} for x in ch]})
    return out

segments = []
cursor = 0
for i, seg in enumerate(edit["segments"]):
    dur_f = seg_dur_f(seg)
    trans = seg["transition_in"]
    # base_cut = coupes franches frame-lockees ; transitions rendues cote Remotion.
    out_start = cursor
    out_end = out_start + dur_f
    cursor = out_end
    gl = []
    if seg.get("graphic"):
        gl.append(seg["graphic"])
    gl += seg.get("graphics", [])
    # b-rolls : inserts video (la voix continue par-dessus). timing sur on_word.
    caps_tmp = build_caps(seg, out_start, out_end)
    brolls = []
    for br in seg.get("broll", []):
        bf = out_start + 6
        ow = br.get("on_word")
        if ow:
            k = ow.lower()
            for ch in caps_tmp:
                for w in ch["words"]:
                    if k in w["w"].lower():
                        bf = w["at_f"]; break
                else: continue
                break
        dur_f = round(br.get("dur_s", 1.2) * FPS)
        bf = min(bf, out_end - dur_f)
        brolls.append({"scene": br.get("scene"), "in_f": max(out_start, bf), "out_f": min(out_end, bf + dur_f),
                       "label": br.get("label")})
    segments.append({
        "id": seg["id"], "act": seg["act"], "why": seg.get("why", ""),
        "src_in": seg["src_in"], "src_out": seg["src_out"], "dur_f": dur_f,
        "out_start": out_start, "out_end": out_end,
        "transition_in": trans, "audio_lead": seg.get("audio_lead", 0.0),
        "camera": seg.get("camera", {"type": "static"}),
        "graphics": gl,
        "broll": brolls,
        "captions": caps_tmp,
    })

total = max(s["out_end"] for s in segments)
out = {"meta": {**edit["meta"], "fps": FPS, "total_frames": total,
                "total_seconds": round(total / FPS, 2)}, "segments": segments}
json.dump(out, open("data/timeline.json", "w"), ensure_ascii=False, indent=2)
print(f"timeline.json : {len(segments)} segments, {total} frames = {total/FPS:.1f}s")
for s in segments:
    txt = " ".join(w["w"] for ch in s["captions"] for w in ch["words"])
    print(f"  {s['id']:4} {len(s['captions'])} chunks : {txt[:70]}")
