# Plan de plans v3.1 : punch-in/out 1.0 <-> 1.15 à chaque cut ; A, E, L conservent le plan v2 (masques calculés sur ces plages)
SHOTS = {
 "A": (1.00, 1.05), "B": (1.15, 1.18), "C": (1.02, 1.06), "D1": (1.15, 1.15), "D2": (1.00, 1.04),
 "E": (1.14, 1.18), "F1": (1.00, 1.04), "F2": (1.15, 1.17), "G1": (1.18, 1.18), "G2": (1.00, 1.05),
 "H1": (1.15, 1.17), "H2": (1.00, 1.04), "I": (1.12, 1.15), "J": (1.18, 1.18), "K": (1.02, 1.05), "L": (1.00, 1.04),
}
# shakes : (temps source du mot, nb images, amplitude px) — hors plages masquées
SHAKES = [(12.86, 3, 10), (41.14, 4, 12), (53.84, 3, 10), (68.08, 4, 12), (94.64, 3, 10)]
# transitions au cut (début du segment) : whip = pan + flou de mouvement ; zoom = zoom-punch ; frames avant / après le cut
TRANSITIONS = [
 {"at_label": "B",  "kind": "zoom", "before": 0, "after": 4},
 {"at_label": "C",  "kind": "whip", "before": 3, "after": 3, "dir": 1},
 {"at_label": "D1", "kind": "zoom", "before": 2, "after": 3},
 {"at_label": "E",  "kind": "whip", "before": 4, "after": 0, "dir": -1},
 {"at_label": "F1", "kind": "zoom", "before": 0, "after": 3},
 {"at_label": "F2", "kind": "whip", "before": 3, "after": 3, "dir": -1},
 {"at_label": "G1", "kind": "whip", "before": 4, "after": 3, "dir": 1},
 {"at_label": "G2", "kind": "zoom", "before": 2, "after": 3},
 {"at_label": "H1", "kind": "whip", "before": 3, "after": 3, "dir": 1},
 {"at_label": "H2", "kind": "zoom", "before": 2, "after": 3},
 {"at_label": "I",  "kind": "zoom", "before": 0, "after": 3},
 {"at_label": "J",  "kind": "whip", "before": 3, "after": 3, "dir": -1},
 {"at_label": "K",  "kind": "zoom", "before": 2, "after": 3},
 {"at_label": "L",  "kind": "zoom", "before": 0, "after": 4},
]
WHIPS = [t for t in TRANSITIONS if t["kind"] == "whip"]
FLASHES = [{"at_label": "D2", "frames": 2}, {"at_label": "E", "frames": 3}, {"at_label": "I", "frames": 3}, {"at_label": "L", "frames": 3}]
