# Reel 3 « Andorre, le petit pays mystérieux » — builds edit.jsx (Higgsedit) + edit_times.json (for audio/music.py).
# Timing grid: 150 BPM (0.4 s beat). SCRIPT.md times, CTA snapped to the grid (49.5 -> 49.6, 52.5 -> 52.4).
import json

ACCENT = "#FFC23D"   # warm amber: readable on the dark mystery grade and on the bright reveal grade
# id, t0, t1, lines (each line: list of (text, accent?)), shot, sfx, fact
S = [
    (1, 0.0, 2.0, [[("Il existe un ", 0), ("pays", 1)], [("entre la France", 0)], [("et l'Espagne…", 0)]], "c27", "breath", "G1"),
    (2, 2.0, 4.0, [[("…dont presque", 0)], [("personne", 1)], [("ne parle.", 0)]], "t102", "tick", ""),
    (3, 4.0, 6.0, [[("468 km²", 1)], [("Coincé entre", 0)], [("deux géants.", 0)]], "map", "scratch", "G1"),
    (4, 6.0, 8.0, [[("Moins de", 0)], [("90 000", 1)], [("habitants.", 0)]], "c28", "pop", "G2"),
    (5, 8.0, 10.0, [[("Pas d'", 0), ("aéroport", 1), (".", 0)], [("Pas de train.", 0)]], "px34368610a", "whoosh", "G5 G6"),
    (6, 10.0, 12.0, [[("Et sa population", 0)], [("n'arrête pas", 0)], [("de ", 0), ("grimper", 1), (".", 0)]], "t106", "riser_short", "G2"),
    (7, 12.0, 14.0, [[("Mais les places", 0)], [("sont ", 0), ("comptées", 1), (".", 0)]], "c22", "heartbeat", "R1"),
    (8, 14.0, 16.0, [[("Permis de résidence :", 0)], [("quotas en ", 0), ("baisse", 1), (".", 0)]], "c05", "none", "R1"),
    (9, 16.0, 18.0, [[("ANDORRE", 1)]], "px35009532", "drop", ""),
    (10, 18.0, 20.8, [[("Impôt sur le revenu :", 0)], [("10 %", 1)], [("maximum.", 0)]], "px34368610b", "hit", "F1"),
    (11, 20.8, 23.6, [[("0 %", 1)], [("jusqu'à 24 000 €", 0)], [("de revenus.", 0)]], "c14", "hit", "F1"),
    (12, 23.6, 26.4, [[("Impôt sur", 0)], [("les sociétés :", 0)], [("10 %", 1)]], "c01", "hit", "F2"),
    (13, 26.4, 29.2, [[("TVA :", 0)], [("4,5 %", 1)]], "c12", "ding", "F3"),
    (14, 29.2, 32.0, [[("Impôt sur la fortune :", 0)], [("zéro", 1), (".", 0)]], "c35", "hit_low", "F4"),
    (15, 32.0, 34.8, [[("Droits de succession :", 0)], [("zéro", 1), (".", 0)]], "c31", "hit_low", "F5"),
    (16, 34.8, 37.6, [[("Un des pays", 0)], [("les plus ", 0), ("sûrs", 1), (".", 0)]], "px38238599", "pad", "Q4"),
    (17, 37.6, 40.4, [[("215 km", 1), (" de pistes.", 0)], [("Le plus grand domaine", 0)], [("des Pyrénées.", 0)]], "c18", "ski", "Q1"),
    (18, 40.4, 43.2, [[("Le plus grand ", 0), ("spa", 1)], [("thermal du sud", 0)], [("de l'Europe.", 0)]], "c00", "water", "Q2"),
    (19, 43.2, 46.0, [[("À moins de ", 0), ("3 h", 1)], [("de Toulouse.", 0)]], "c34", "car", "G7"),
    (20, 46.0, 49.6, [[("On a compilé", 0)], [("LA LISTE", 1)], [("tout pour s'installer", 0)], [("en Andorre.", 0)]], "t121", "riser", ""),
    (21, 49.6, 52.4, [[("Commente", 0)], [("LISTE", 1)]], "t121", "cta", ""),
    (22, 52.4, 54.0, [[("Commente", 0)], [("LISTE", 1)]], "t121", "end", ""),
]
DUR = 54.0
screens = [{"n": n, "t0": a, "t1": b, "lines": [[{"t": t, "acc": bool(c)} for t, c in ln] for ln in lines], "shot": shot, "sfx": sfx, "fact": fact}
           for n, a, b, lines, shot, sfx, fact in S]
json.dump({"dur": DUR, "drop": 16.0, "cta_hit": 49.6, "end": 52.4, "screens": screens}, open("edit_times.json", "w"), ensure_ascii=False, indent=1)

# shot table: file under MEDIA, source in-point (s), push-in direction; photos animated by Higgsfield are 5 s long
SHOTS = json.load(open("shots.json"))
data = {"DUR": DUR, "ACC": ACCENT, "screens": screens, "shots": SHOTS, "map": json.load(open("data/map.json")),
        "sheet": [1.0, 3.0, 5.2, 7.0, 9.0, 11.0, 13.0, 15.0, 16.6, 19.4, 22.2, 25.0, 27.8, 30.6, 33.4, 36.2, 39.0, 41.8, 44.6, 47.8, 51.0, 53.2]}
tpl = open("edit.template.jsx").read()
open("edit.jsx", "w").write(tpl.replace("/*__DATA__*/null", json.dumps(data, ensure_ascii=False, separators=(",", ":"))))
print("screens", len(screens), "dur", DUR)
