# Reel 6 — jump cuts (source seconds, snapped to 60 fps) + remap source -> cut timeline + words on the cut timeline.
# Silences: ffmpeg silencedetect -30 dB, >= 0.35 s (silences.txt); 100 ms of breath kept each side.
# DROP: sentences removed to land under 60 s (listed in ILLUSTRATIONS.md, validated with it).
import json, os
FPS, PAD, END = 60, 0.10, 87.78
DROP = [
    (7.30, 8.30),     # « Tu démarres. »
    (13.04, 15.40),   # « et tu te dis, c'est mon argent, je l'ai gagné. »
    (20.62, 22.98),   # « C'est de l'argent qui vient de l'étranger. »
    (26.22, 29.40),   # « Et la plateforme garde une trace de tout ce qu'elle te verse. »
    (31.40, 32.98),   # « que ça passe sous le radar, »
    (33.36, 34.56),   # silence held after « non, » (no -30 dB dip, room tone)
    (44.90, 48.86),   # « Et là, arrive le truc que personne ne te dit. »
    (53.88, 56.30),   # « Une activité indépendante en France » (sentence starts at « entre l'impôt et les charges »)
    (60.98, 65.46),   # « Le problème, personne ne met de côté. Tu gagnes 20 000, tu vis avec 20 000. »
    (76.50, 78.90),   # « Et c'est là qu'il faut réfléchir intelligemment. »
]
fr = lambda t: round(t * FPS) / FPS
S = [tuple(map(float, l.split()[:2])) for l in open("silences.txt") if "N/A" not in l]
rm = sorted([(a + PAD, b - PAD) for a, b in S if b - a > 2 * PAD] + DROP)
merged = []
for a, b in rm:
    if merged and a <= merged[-1][1]: merged[-1] = (merged[-1][0], max(b, merged[-1][1]))
    else: merged.append((a, b))
keep, t = [], 0.0
for a, b in merged:
    if a > t: keep.append((fr(t), fr(a)))
    t = max(t, b)
keep.append((fr(t), fr(END)))
def remap(x):
    acc = 0.0
    for s, e in keep:
        if x < s: return round(acc, 3)          # inside a removed gap -> start of next segment
        if x <= e: return round(acc + x - s, 3)
        acc += e - s
    return round(acc, 3)
dropped = lambda x: any(a <= x < b for a, b in DROP)
DUR = round(sum(e - s for s, e in keep), 3)
if __name__ == "__main__":
    T = json.load(open("transcript.json"))
    words = []
    for sg in T["segments"]:
        for w in sg["words"]:
            if dropped(w["s"] + 0.02): continue
            txt = w["w"]
            if words and (txt[:1] in "'-%" or txt in "?!"):   # whisper splits « t'explique », « Royaume-Uni », « 100 % »
                words[-1]["w"] += ("" if txt[:1] in "'-" else " ") + txt; words[-1]["e"] = remap(w["e"]); continue
            words.append({"w": txt, "s": remap(w["s"]), "e": remap(w["e"]), "src": w["s"]})
    json.dump({"fps": FPS, "keep": keep, "duration": DUR}, open("cuts.json", "w"), indent=1)
    json.dump(words, open("words_cut.json", "w"), ensure_ascii=False, indent=0)
    print("segments", len(keep), "speech", DUR, "s")
