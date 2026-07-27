#!/usr/bin/env python3
"""Construit data/edit.json à partir de transcript.json (Phase 2, resserré ~44s)."""
import json, re

W = json.load(open('data/transcript.json'))['words']
MARGIN = 0.08
# corrections texte (modèle base) : index source -> token corrigé
CORR = {358: "l'année", 315: "vis", 337: "fisc", 338: "le", 339: "requalifie.",
        435: "de", 436: "bon.", 430: "où"}
ACCENT = set("""mêmes gains fortunes différentes dorment amateur pro énormément
taxent moitié 50 j'habite là-bas vrai vraiment requalifie retombe bon""".split())


def clean(tok):
    return re.sub(r'[«»?,.!"]', '', tok).strip().lower()


def seg_words(i, j):
    return [{"i": k, "w": CORR.get(k, W[k]['w']),
             "start": W[k]['start'], "end": W[k]['end']} for k in range(i, j + 1)]


# (id, role, i, j, camera, transition_in, sfx, overlay)  — 9 segments, ~44.6s
SEG = [
 ("s01", "hook", 343, 362, {"type": "punch_in", "from": 1.0, "to": 1.10, "easing": "expo_out"},
  "hard_cut", ["impact_deep"], None),
 ("s02", "hook", 368, 374, {"type": "snap_zoom", "from": 1.0, "to": 1.18},
  "hard_cut", ["impact_deep"], None),
 ("s03", "body", 70, 86, {"type": "drift", "px": 12},
  "whip_left", ["whoosh_short"], None),
 ("s04", "body", 157, 169, {"type": "punch_in", "from": 1.0, "to": 1.08, "easing": "expo_out"},
  "hard_cut", ["click"], None),
 ("s05", "body", 170, 180, {"type": "drift", "px": 12},
  "whip_right", ["whoosh_short"], None),
 ("s06", "body", 267, 282, {"type": "punch_in", "from": 1.0, "to": 1.09, "easing": "expo_out"},
  "hard_cut", ["click"],
  {"type": "stat_counter", "value": "50%", "label": "de tes gains, en jeu",
   "in": 0.7, "duration": 2.6, "anchor": "top_third"}),
 ("s07", "body", 291, 306, {"type": "drift", "px": 12},
  "hard_cut", [], None),
 ("s09", "body", 320, 342, {"type": "shake", "px": 4, "on": "tout retombe"},
  "flash", ["riser_1s", "impact_deep"],
  {"type": "lower_third", "value": "Fausse expat", "label": "le fisc requalifie tout",
   "in": 0.4, "duration": 3.4, "anchor": "lower"}),
 ("s10", "cta", 426, 436, {"type": "drift", "px": 12},
  "whip_left", ["whoosh_short"],
  {"type": "lower_third", "value": "Commente POKER", "label": "pour ton pays cible",
   "in": 0.5, "duration": 2.6, "anchor": "center_low"}),
]

fps = 30
segments = []
t = 0.0
for sid, role, i, j, cam, trans, sfx, ov in SEG:
    si = round(W[i]['start'] - MARGIN, 3)
    so = round(W[j]['end'] + MARGIN, 3)
    dur = round(so - si, 3)
    words = seg_words(i, j)
    cw = []
    for w in words:
        ls = round(max(0, w['start'] - si), 3)
        le = round(min(dur, w['end'] - si), 3)
        cw.append({"w": w['w'], "start": ls, "end": le, "accent": clean(w['w']) in ACCENT})
    text = re.sub(r'\s+([,.!?»])', r'\1', " ".join(x['w'] for x in words)).strip()
    text = (text[0].upper() + text[1:]) if text else text
    segments.append({
        "id": sid, "role": role, "src_in": si, "src_out": so,
        "out_start": round(t, 3), "out_end": round(t + dur, 3), "dur": dur,
        "text": text, "camera": cam, "transition_in": trans, "sfx": sfx,
        "overlay": ov, "caption_words": cw})
    t += dur

edit = {
 "meta": {"target_duration": round(t, 2), "fps": fps, "width": 1080, "height": 1920,
          "source": "source/reel5.mp4", "source_fps": 60,
          "whisper_model": "base (multilingue) — texte relu/corrigé"},
 "segments": segments,
 "global_overlays": [{"type": "progress_bar", "anchor": "top", "height_px": 6}],
 "music": {"track": "assets/music/bed.wav", "in": 0.0, "gain_db": -20, "duck_db": -9,
           "status": "généré synthétiquement (ffmpeg)"},
 "sfx_bank": {"impact_deep": "assets/sfx/impact_deep.wav", "whoosh_short": "assets/sfx/whoosh_short.wav",
              "click": "assets/sfx/click.wav", "riser_1s": "assets/sfx/riser_1s.wav", "level_db": -14},
 "captions": {"style": "karaoke_pop", "max_words": 3, "font": "Inter Black 900",
              "size_px": 92, "tracking": "-0.02em", "stroke": "noir 8px + drop shadow",
              "accent_color": "#3BE8FF", "current_word": "scale 1.06 + accent",
              "safe_bottom_px": 280, "min_y_px": 1640},
 "master": {"target_lufs": -14, "true_peak_dbtp": -1},
}
json.dump(edit, open('data/edit.json', 'w'), ensure_ascii=False, indent=2)
print("edit.json:", round(t, 2), "s,", len(segments), "segments")
for s in segments:
    print(f"  {s['id']} {s['out_start']:5.1f}-{s['out_end']:5.1f} ({s['dur']:.1f}s) {s['camera']['type']:9} {s['transition_in']}")
