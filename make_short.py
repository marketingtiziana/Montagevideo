# -*- coding: utf-8 -*-
"""INPUT.mp4 -> short_final.mp4 : coupes serrees, sous-titres .ass, un seul encodage.

Pipeline : transcription (faster-whisper, horodatage par mot) -> suppression des
silences et des scories a partir des ecarts entre mots -> .ass genere sur la
timeline de SORTIE -> un unique ffmpeg qui coupe, concatene, incruste, recadre
en 9:16 et normalise.
"""
import json, os, re, subprocess, sys

import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
SRC, OUT = "INPUT.mp4", "short_final.mp4"
W, H = 1080, 1920

MAX_GAP = 0.35          # au-dela, c'est un silence : on coupe
PAD = 0.08              # marge gardee de chaque cote d'un segment
MIN_SEG = 0.25          # un segment plus court qu'un souffle n'apporte rien

# Scories retirees : hesitations, et faux departs d'un seul mot isole.
FILLERS = {"euh", "heu", "hein", "hum", "bah", "ben", "bon", "voila", "donc",
           "enfin", "genre", "quoi", "alors"}
# Les mots-outils ne portent jamais l'accroche : on ne les met pas en capitales.
STOP = {"le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "a", "au",
        "aux", "en", "dans", "sur", "pour", "par", "que", "qui", "quoi", "ce",
        "cette", "ces", "se", "sa", "son", "ses", "tu", "te", "ton", "ta", "tes",
        "je", "me", "mon", "ma", "mes", "il", "elle", "on", "nous", "vous", "ils",
        "est", "sont", "ete", "etre", "avoir", "fait", "faire", "plus", "moins",
        "pas", "ne", "si", "mais", "donc", "avec", "sans", "tout", "tous"}
PUNCH = {"impot", "impots", "fiscal", "fiscale", "fisc", "argent", "jamais",
         "attention", "erreur", "piege", "interdit", "illegal", "legal",
         "gratuit", "secret", "risque", "amende", "sanction", "urgent"}


def norm(w):
    return re.sub(r"[^\w]", "", w.lower().replace("’", "'"))


def transcribe():
    from faster_whisper import WhisperModel
    model = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=4)
    segs, _ = model.transcribe(SRC, language="fr", word_timestamps=True,
                               vad_filter=False)
    words = []
    for s in segs:
        for w in (s.words or []):
            if w.word.strip():
                words.append({"w": w.word.strip(), "a": float(w.start),
                              "b": float(w.end)})
    with open("transcript.json", "w") as f:
        json.dump(words, f, ensure_ascii=False)
    return words


def clean(words):
    """Retire hesitations et repetitions immediates, sans jamais couper un mot."""
    out = []
    for w in words:
        n = norm(w["w"])
        if not n:
            continue
        if n in FILLERS and len(n) <= 5:
            continue
        # repetition immediate ("je je", "de de") : on garde la seconde occurrence,
        # qui porte la suite de la phrase
        if out and norm(out[-1]["w"]) == n and w["a"] - out[-1]["b"] < 0.6:
            out[-1] = w
            continue
        out.append(w)
    return out


def segments(words):
    """Groupes de mots separes par un silence > MAX_GAP, avec marge."""
    if not words:
        return []
    groups, cur = [], [words[0]]
    for prev, w in zip(words, words[1:]):
        if w["a"] - prev["b"] > MAX_GAP:
            groups.append(cur)
            cur = [w]
        else:
            cur.append(w)
    groups.append(cur)

    segs = []
    for g in groups:
        a, b = g[0]["a"] - PAD, g[-1]["b"] + PAD
        segs.append({"a": max(0.0, a), "b": b, "words": g})
    # la marge ne doit pas mordre sur le segment voisin : on partage l'ecart
    for p, n in zip(segs, segs[1:]):
        if p["b"] > n["a"]:
            mid = (p["b"] + n["a"]) / 2
            p["b"], n["a"] = mid, mid
    return [s for s in segs if s["b"] - s["a"] >= MIN_SEG]


def font_name():
    """Inter Bold, sinon Montserrat Bold, sinon un equivalent metrique d'Arial."""
    try:
        have = subprocess.run(["fc-list", ":", "family"], capture_output=True,
                              text=True).stdout.lower()
    except FileNotFoundError:
        have = ""
    for f in ("inter", "montserrat"):
        if f in have:
            return f.capitalize()
    return "Liberation Sans"          # clone metrique d'Arial


def ass(segs, path):
    """Sous-titres cales sur la timeline de SORTIE (apres coupes)."""
    def ts(t):
        cs = int(round(t * 100))
        h, cs = divmod(cs, 360000)
        m, cs = divmod(cs, 6000)
        s, cs = divmod(cs, 100)
        return f"{h}:{m:02d}:{s:02d}.{cs:02d}"

    lines = [
        "[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}",
        "WrapStyle: 2", "ScaledBorderAndShadow: yes", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, "
        "OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, "
        "ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, "
        "MarginL, MarginR, MarginV, Encoding",
        f"Style: S,{font_name()},78,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,"
        "-1,0,0,0,100,100,0,0,1,3,2,2,80,80,420,1", "",
        "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, "
        "MarginV, Effect, Text",
    ]

    t = 0.0
    for s in segs:
        off = t - s["a"]                      # decalage source -> sortie
        chunk = []
        for w in s["words"]:
            chunk.append(w)
            if len(chunk) == 4:
                lines.append(_evt(chunk, off, ts))
                chunk = []
        if chunk:
            # un reliquat de 1-2 mots se rattache a la carte precedente plutot
            # que de clignoter seul a l'ecran
            if len(chunk) <= 2 and len(lines) > 12:
                prev = lines[-1].split(",", 9)
                prev[2] = ts(chunk[-1]["b"] + off)
                prev[9] = prev[9] + " " + " ".join(_disp(w) for w in chunk)
                lines[-1] = ",".join(prev)
            else:
                lines.append(_evt(chunk, off, ts))
        t += s["b"] - s["a"]

    with open(path, "w") as f:
        f.write("\n".join(lines) + "\n")


def _disp(w):
    """Capitales reservees aux mots d'accroche : chiffres, montants, mots forts."""
    raw = w["w"].replace("—", "-")
    n = norm(raw)
    if re.search(r"\d", raw) or "%" in raw or "€" in raw or "$" in raw:
        return raw.upper()
    if n in PUNCH and n not in STOP:
        return raw.upper()
    return raw


def _evt(chunk, off, ts):
    txt = " ".join(_disp(w) for w in chunk)
    return (f"Dialogue: 0,{ts(chunk[0]['a'] + off)},{ts(chunk[-1]['b'] + off)},"
            f"S,,0,0,0,,{txt}")


def render(segs):
    """Un seul encodage : trim + concat + .ass + recadrage 9:16 + loudnorm."""
    n = len(segs)
    parts = []
    for i, s in enumerate(segs):
        parts.append(f"[0:v]trim={s['a']:.3f}:{s['b']:.3f},setpts=PTS-STARTPTS[v{i}]")
        parts.append(f"[0:a]atrim={s['a']:.3f}:{s['b']:.3f},asetpts=PTS-STARTPTS[a{i}]")
    cat = "".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[vc][ac]"
    # recadrage : on couvre le cadre puis on rogne au centre, jamais de bande noire
    post = (f"[vc]scale={W}:{H}:force_original_aspect_ratio=increase,"
            f"crop={W}:{H},setsar=1,ass=subs_short.ass[vo];"
            f"[ac]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[ao]")
    fc = ";".join(parts + [cat, post])

    with open("fc.txt", "w") as f:        # la chaine depasse la limite d'arguments
        f.write(fc)
    subprocess.run(
        [FF, "-y", "-hide_banner", "-loglevel", "error", "-i", SRC,
         "-filter_complex_script", "fc.txt", "-map", "[vo]", "-map", "[ao]",
         "-c:v", "libx264", "-preset", "medium", "-crf", "20",
         "-pix_fmt", "yuv420p", "-r", "30",
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
         "-movflags", "+faststart", OUT], check=True)


def dur(path):
    import cv2
    c = cv2.VideoCapture(path)
    d = c.get(cv2.CAP_PROP_FRAME_COUNT) / (c.get(cv2.CAP_PROP_FPS) or 30)
    c.release()
    return d


words = transcribe()
segs = segments(clean(words))
ass(segs, "subs_short.ass")
render(segs)

before = dur(SRC)
after = sum(s["b"] - s["a"] for s in segs)
broll = 0 if not os.environ.get("PEXELS_API_KEY") else 0
print(json.dumps({"avant": round(before, 2), "apres": round(after, 2),
                  "coupes": max(0, len(segs) - 1), "broll": broll,
                  "out": OUT}))
