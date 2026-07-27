#!/usr/bin/env python3
# Compile data/edit.json + data/transcript.json -> data/timeline.json
# Timeline de sortie (30 fps) : positions out_start/out_end, sous-titres karaoke re-times,
# fenetre audio par segment (J-cut / L-cut via audio_lead). AUCUN timecode en dur cote TSX.
import json, re, math

FPS = 30
edit = json.load(open("data/edit.json"))
tr = json.load(open("data/transcript.json"))
WORDS = [(w["start"], w["end"], w["w"]) for w in tr["words"]]

# --- corrections d'affichage de l'ASR base (sync = timestamps ASR, texte = corrige) ---
FIX = {
    "habite,": "habiter,", "habité,": "habiter,", "ou": "où", "gagne": "gagnes",
    "vies,": "vis,", "vies": "vis", "l'aisses": "laisses", "fils": "fisc",
    "imposable.": "imposable.", "intelligentement": "intelligemment",
    "fiscle": "fisc", "qualifi.": "requalifie.", "d'année": "l'année",
    "tes": "tu es", "comment": "commente", "bons,": "valises,",
}
ACCENT_RE = re.compile(r"(\d|%|€|France|Poker|poker|moiti|décision|decision|faux|Faux|dorment|règle|regle|imposable|requalifie)", re.I)

def words_in(a, b):
    return [(s, e, w) for (s, e, w) in WORDS if s >= a - 0.02 and s < b - 0.02]

def clean(w):
    return FIX.get(w, w)

segments = []
cursor = 0  # frame de sortie courant
DISSOLVE = 8

for i, seg in enumerate(edit["segments"]):
    sin, sout = seg["src_in"], seg["src_out"]
    dur_f = round((sout - sin) * FPS)
    trans = seg["transition_in"]
    # overlap du cross-dissolve : le segment demarre 8f avant la fin du precedent
    start = cursor
    if trans == "cross_dissolve_8f" and segments:
        start = cursor - DISSOLVE
    out_start = start
    out_end = out_start + dur_f
    cursor = out_end

    # sous-titres : mots ASR de la fenetre, re-times sur la sortie, chunks de 2-3
    ws = words_in(sin, sout)
    chunks = []
    cur = []
    for (s, e, w) in ws:
        disp = clean(w).strip()
        if not disp or disp in "«».,?":
            # ponctuation seule : rattache au mot precedent si possible
            if cur:
                cur[-1]["w"] += "" if disp in "«»" else disp
            continue
        accent = bool(ACCENT_RE.search(disp))
        cur.append({"w": disp, "start": s, "end": e, "accent": accent})
        # coupe le chunk sur ponctuation forte ou a 3 mots
        if re.search(r"[.?!:]$", disp) or len(cur) >= 3:
            chunks.append(cur); cur = []
    if cur:
        chunks.append(cur)

    caps = []
    for ch in chunks:
        c0 = ch[0]["start"]; c1 = ch[-1]["end"]
        caps.append({
            "in_f": round((c0 - sin) * FPS) + out_start,
            "out_f": round((c1 - sin) * FPS) + out_start,
            "words": [{"w": x["w"], "accent": x["accent"],
                       "at_f": round((x["start"] - sin) * FPS) + out_start} for x in ch],
        })

    segments.append({
        "id": seg["id"], "act": seg["act"], "why": seg.get("why", ""),
        "src_in": sin, "src_out": sout, "dur_f": dur_f,
        "out_start": out_start, "out_end": out_end,
        "transition_in": trans,
        "audio_lead": seg.get("audio_lead", 0.0),
        "camera": seg.get("camera", {"type": "static"}),
        "graphic": seg.get("graphic"),
        "captions": caps,
    })

total = max(s["out_end"] for s in segments)
out = {
    "meta": {**edit["meta"], "fps": FPS, "total_frames": total,
             "total_seconds": round(total / FPS, 2)},
    "segments": segments,
}
json.dump(out, open("data/timeline.json", "w"), ensure_ascii=False, indent=2)
print(f"timeline.json : {len(segments)} segments, {total} frames = {total/FPS:.1f}s")
for s in segments:
    print(f"  {s['id']:4} out {s['out_start']:4}->{s['out_end']:4}  {len(s['captions'])} chunks  {s['transition_in']}")
