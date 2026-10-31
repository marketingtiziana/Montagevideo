# Plan de plans v3 : punch-in/out 1.0 <-> 1.15 à chaque cut (A, E, L conservent le plan v2 : masques déjà calculés sur ces plages)
SHOTS = {
 "A": (1.00, 1.05), "B": (1.15, 1.18), "C": (1.02, 1.06), "D1": (1.15, 1.15), "D2": (1.00, 1.04),
 "E": (1.14, 1.18), "F1": (1.00, 1.04), "F2": (1.15, 1.17), "G1": (1.18, 1.18), "G2": (1.00, 1.05),
 "H1": (1.15, 1.17), "H2": (1.00, 1.04), "I": (1.12, 1.15), "J": (1.18, 1.18), "K": (1.02, 1.05), "L": (1.00, 1.04),
}
# shakes : (temps source du mot, nb images, amplitude px) — hors plages masquées
SHAKES = [(41.14, 4, 12), (68.08, 4, 12), (94.64, 3, 10)]
# whips : temps source du cut (début du segment suivant) ; pan horizontal + flou sur les images précédant/suivant le cut
WHIPS = [{"at_label": "E", "frames_before": 4, "frames_after": 0, "dir": -1},   # avant « Erreur » (plage masquée après : pas d'images après)
         {"at_label": "G1", "frames_before": 4, "frames_after": 3, "dir": 1}]   # avant « Le problème »
FLASHES = [{"at_label": "E", "frames": 3}, {"at_label": "I", "frames": 3}]       # flash blanc (appliqué en passe 3)
