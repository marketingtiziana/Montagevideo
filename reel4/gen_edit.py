# Reel 4 « Les 5 meilleurs pays pour créer ta société en 2026 » — builds edit.jsx (Higgsedit, 60 fps) + edit_times.json (audio, QA).
# Grid: 120 BPM, beat 0.5 s, bars start on odd seconds (1, 3, 5 …) so the drop at 27.0 s is a downbeat. Every cut is on a beat.
import json

ACC, ACC2, OK = "#E8B04A", "#FF4D4D", "#3DDC84"
DUR, DROP = 57.0, 27.0
# Transitions into each screen (<= 0.4 s, never the same twice in a row; planned in SCENES.md):
#   open = light flash from black · zoom = zoom-through · whip = whip pan + chromatic aberration · luma = luma wipe
#   push = vertical push with motion blur · iris = shape match (accent ring iris) · black = 4 black frames + white flash (n°1 only)
#   blur = blur dissolve + single glitch · none = same shot continues
SCORES = {  # NOTRE NOTE /10 (editorial, SCRIPT.md): impôts, rapidité, banque, crédibilité
    "ee": [7, 9, 5, 5], "ae": [7, 7, 6, 8], "us": [8, 9, 6, 7], "sg": [6, 9, 9, 10], "hk": [10, 10, 8, 10]}

S = [  # n, t0, t1, kind, shot, transition-in, content, fact
    (1, 0.0, 2.0, "text", "s01", "open", {"lines": [[("Les ", 0), ("5", 1), (" meilleurs pays", 0)], [("pour ta société", 0)], [("en 2026.", 0)]]}, ""),
    (2, 2.0, 4.0, "text", "s02a", "zoom", {"lines": [[("Le ", 0), ("n°1", 1), (" n'est ni Dubaï…", 0)], [("ni les USA.", 0)]],
                                           "split": {"at": 1.0, "shot": "s02b", "tr": "whip"}}, ""),
    (3, 4.0, 7.0, "criteria", "s03", "luma", {"lines": [[("On a noté sur ", 0), ("4", 1), (" critères.", 0)]],
                                               "items": [("receipt", "Impôts"), ("zap", "Rapidité"), ("landmark", "Banque"), ("badge-check", "Crédibilité")]}, ""),
    (4, 7.0, 9.5, "cd_title", "s04", "zoom", {"num": "5", "name": "ESTONIE", "flag": "ee"}, ""),
    (5, 9.5, 12.0, "cd_pros", "s05", "push", {"num": "5", "name": "ESTONIE", "flag": "ee",
        "pro": [("0 %", 1), (" sur les bénéfices gardés", 0)], "con": "22 % sur les dividendes"}, "E1 E2"),
    (6, 12.0, 14.5, "cd_title", "s06", "iris", {"num": "4", "name": "DUBAÏ", "flag": "ae"}, ""),
    (7, 14.5, 17.0, "cd_pros", "s07", "whip", {"num": "4", "name": "DUBAÏ", "flag": "ae",
        "pro": [("0 %", 1), (" d'impôt perso", 0)], "con": "9 % d'IS depuis 2023"}, "D1 D2"),
    (8, 17.0, 19.5, "cd_title", "s08", "zoom", {"num": "3", "name": "USA (LLC)", "flag": "us"}, ""),
    (9, 19.5, 22.0, "cd_pros", "s09", "push", {"num": "3", "name": "USA (LLC)", "flag": "us",
        "pro": [("0 %", 1), (" fédéral hors activité US", 0)], "con": "Oubli 5472 : 25 000 $"}, "U2 U4"),
    (10, 22.0, 24.5, "cd_title", "s10", "luma", {"num": "2", "name": "SINGAPOUR", "flag": "sg"}, ""),
    (11, 24.5, 27.0, "cd_pros", "s11", "whip", {"num": "2", "name": "SINGAPOUR", "flag": "sg",
        "pro": [("Hub", 1), (" financier majeur d'Asie", 0)], "con": "Directeur résident obligatoire"}, "S2 S4"),
    (12, 27.0, 29.0, "reveal", "s12", "black", {"flag": "hk"}, ""),
    (13, 29.0, 32.0, "hk", "s13", "zoom", {"icon": "globe", "label": "IMPÔT TERRITORIAL", "big": "0 %",
        "lines": [[("sur tes profits offshore…", 0)]], "note": "…si tu le prouves (offshore claim)."}, "H1 H2"),
    (14, 32.0, 35.0, "hk", "s14", "whip", {"icon": "percent", "label": "IMPÔT SUR LES SOCIÉTÉS", "big": "8,25 %",
        "lines": [[("sur les premiers 2 M HK$", 0)]], "note": "puis 16,5 % au-delà."}, "H3"),
    (15, 35.0, 37.5, "hk3", "s15", "iris", {"cards": [("0 %", "TVA", ""), ("0 %", "DIVIDENDES", ""), ("0 %", "PLUS-VALUES", "en capital")]}, "H4 H5 H6"),
    (16, 37.5, 40.5, "hk", "s16", "luma", {"icon": "clock", "label": "CRÉÉE EN", "big": "24 h", "counter": [1, 24, " h"],
        "lines": [[("100 % étrangère.", 0)], [("0 capital minimum.", 0)]]}, "H7 H8"),
    (17, 40.5, 43.0, "hk", "s17", "zoom", {"icon": "ship", "label": "", "big": "PORT FRANC", "bigsize": 124,
        "lines": [[("0 droit de douane.", 0)]]}, "H11"),
    (18, 43.0, 46.0, "hk", "s18", "whip", {"icon": "scale", "label": "MONNAIE · DROIT",
        "lines": [[("HKD indexé sur l'", 0), ("USD", 1), (".", 0)], [("Droit : common law.", 0)]]}, "H12 H13"),
    (19, 46.0, 48.5, "hk", "s19", "iris", {"icon": "route", "label": "CEPA", "big": "0 %", "bigwhite": True,
        "lines": [[("Vers la ", 0), ("Chine", 1), (" : 0 % de droits.", 0)]]}, "H14"),
    (20, 48.5, 51.0, "trap", "s20", "blur", {"icon": "triangle-alert", "lines": [[("Le ", 0), ("piège", 1), (" :", 0)],
        [("banque, audit, secrétaire.", 0)], [("Seul, tu te plantes.", 0)]]}, "H15 H16 H10"),
    (21, 51.0, 53.0, "cta_book", "s21", "luma", {"lines": [[("Tout le process est dans", 0)], [("LE ", 0), ("CODEX", 1), (" HONG KONG", 0)]]}, ""),
    (22, 53.0, 55.0, "cta_chips", "s21", "none", {"chips": [("Création", 0), ("Banque", 0), ("Offshore claim", 0), ("Erreurs", 1)], "tail": "à éviter"}, ""),
    (23, 55.0, 57.0, "cta_end", "s21", "none", {"lines": [[("Commente ", 0), ("CODEX", 1)]]}, ""),
]

# Sound events (time, kind) shared by audio/music.py and tests/qa4.py. Impacts sit on strong beats (1 and 3).
EV = []
for n, t0, t1, kind, shot, tr, c, fact in S:
    if tr in ("zoom", "whip", "push", "luma", "iris", "blur"): EV.append((t0 - 0.2, "whoosh"))
    if kind == "text": EV.append((t0, "tick"))
    if kind == "criteria": EV += [(t0 + 0.5 + 0.5 * i, "tick") for i in range(4)]
    if kind == "cd_title": EV += [(t0, "impact"), (t0 + 0.9, "tick")]
    if kind == "cd_pros": EV += [(t0 + 0.05, "ding"), (t0 + 1.0, "cross")]
    if kind == "hk": EV += [(t0, "impact" if c.get("big", "").startswith(("0", "8", "2")) else "tick")]
    if kind == "hk3": EV += [(t0 + 0.5 * i, "impact") for i in range(3)]
    if kind == "trap": EV += [(t0, "glitch_soft")]
    if kind == "cta_book": EV += [(t0, "page")]
    if kind == "cta_chips": EV += [(t0 + 0.25 * i, "tick") for i in range(4)]
    if kind == "cta_end": EV += [(t0, "impact_soft")]
    if c.get("split"): EV.append((t0 + c["split"]["at"] - 0.2, "whoosh"))
EV += [(25.0, "riser"), (27.0, "drop"), (27.0, "glitch"), (27.067, "impact"), (28.0, "impact")]
EV.sort()

screens = [{"n": n, "t0": t0, "t1": t1, "kind": kind, "shot": shot, "tr": tr, "c": c, "fact": fact} for n, t0, t1, kind, shot, tr, c, fact in S]
for s in screens:   # JSON-friendly lines
    for k in ("lines", "pro"):
        if k in s["c"]:
            v = s["c"][k]
            s["c"][k] = [[{"t": t, "acc": bool(a)} for t, a in ln] for ln in v] if k == "lines" else [{"t": t, "acc": bool(a)} for t, a in v]
json.dump({"dur": DUR, "drop": DROP, "bpm": 120, "screens": [{k: s[k] for k in ("n", "t0", "t1", "kind", "shot", "tr", "fact")} for s in screens],
           "events": EV}, open("edit_times.json", "w"), ensure_ascii=False, indent=1)

data = {"book": "book/codex_book.mov", "mattes": {"s02a": "u/matte_s02a.mp4"}, "mattes_word": {"s02a": "DUBAÏ"}, "DUR": DUR, "DROP": DROP, "ACC": ACC, "ACC2": ACC2, "OK": OK, "screens": screens, "scores": SCORES,
        "shots": json.load(open("shots.json")), "hk": json.load(open("data/hk_outline.json")),
        "sheet": [1.0, 2.5, 3.5, 5.6, 8.2, 11.0, 13.2, 16.0, 18.2, 21.0, 23.2, 26.0, 27.5, 28.5, 30.6, 33.6, 36.3, 39.0, 41.8, 44.6, 47.3, 49.8, 52.0, 54.0, 56.3]}
tpl = open("edit.template.jsx").read()
open("edit.jsx", "w").write(tpl.replace("/*__DATA__*/null", json.dumps(data, ensure_ascii=False, separators=(",", ":"))))
print("screens", len(screens), "events", len(EV), "dur", DUR)
