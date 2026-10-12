# -*- coding: utf-8 -*-
"""INPUT.mp4 -> short_final.mp4 : coupes serrees, punch-in, sous-titres pop-in.

Deux etapes, pour que le texte soit relu avant d'etre incruste :
  python make_short.py transcribe   -> transcript.json
  python make_short.py render       -> short_final.mp4 (un seul encodage)
L'etape render applique corrections.json (meme nombre de mots) si le fichier
existe : seuls les mots changent, jamais les horodatages.
"""
import json, math, os, re, subprocess, sys

import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
SRC, MUSIC, OUT = "INPUT.mp4", "MUSIC.mp3", "short_final.mp4"
W, H = 1080, 1920
FPS = 30

MAX_GAP = 0.35          # au-dela, c'est un silence : on coupe
PAD = 0.08              # marge gardee de chaque cote d'un segment
MIN_SEG = 0.25          # plus court qu'un souffle : rien a garder

ZOOM_DRIFT = 0.04       # micro-zoom lent sur toute la duree
PUNCH = 0.06            # amplitude du punch-in sur un jump cut
PUNCH_UP, PUNCH_DOWN = 0.12, 0.18   # montee / retour du punch
ZMAX = 1.0 + ZOOM_DRIFT + PUNCH     # sur-echantillonnage avant recadrage

BROLL_MIN, BROLL_MAX = 1.5, 2.5
XFADE = 0.2
WIPES = ["fade", "slideup", "wipeleft"]

MUSIC_DB = -24.0

FILLERS = {"euh", "heu", "hein", "hum", "bah", "ben", "bon", "voila", "donc",
           "enfin", "genre", "quoi", "alors"}
STOP = {"le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "a", "au",
        "aux", "en", "dans", "sur", "pour", "par", "que", "qui", "quoi", "ce",
        "cet", "cette", "ces", "se", "sa", "son", "ses", "tu", "te", "ton", "ta",
        "tes", "je", "me", "mon", "ma", "mes", "il", "elle", "on", "nous", "vous",
        "ils", "elles", "est", "sont", "etait", "ete", "etre", "avoir", "fait",
        "faire", "plus", "moins", "pas", "ne", "si", "mais", "donc", "avec",
        "sans", "tout", "tous", "toute", "comme", "aussi", "meme", "deja", "tres",
        "bien", "peut", "va", "vais", "veux", "leur", "cela", "ca", "y", "d", "l",
        "n", "s", "c", "j", "m", "t", "qu"}


def norm(w):
    w = w.lower().replace("’", "'")
    w = (w.replace("é", "e").replace("è", "e").replace("ê", "e").replace("ë", "e")
          .replace("à", "a").replace("â", "a").replace("î", "i").replace("ï", "i")
          .replace("ô", "o").replace("ö", "o").replace("û", "u").replace("ù", "u")
          .replace("ü", "u").replace("ç", "c"))
    return re.sub(r"[^\w']", "", w)


# ---------------------------------------------------------------- transcription
def transcribe():
    from faster_whisper import WhisperModel
    m = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=4)
    segs, _ = m.transcribe(SRC, language="fr", word_timestamps=True,
                           vad_filter=False)
    words = [{"w": w.word.strip(), "a": float(w.start), "b": float(w.end)}
             for s in segs for w in (s.words or []) if w.word.strip()]
    with open("transcript.json", "w") as f:
        json.dump(words, f, ensure_ascii=False)
    return words


def load_words():
    with open("transcript.json") as f:
        words = json.load(f)
    if os.path.exists("corrections.json"):
        with open("corrections.json") as f:
            fix = json.load(f)
        if len(fix) != len(words):
            sys.exit("corrections.json : %d mots pour %d" % (len(fix), len(words)))
        for w, t in zip(words, fix):          # le texte change, pas le timing
            w["w"] = t
    return words


# ------------------------------------------------------------------- decoupage
def clean(words):
    out = []
    for w in words:
        n = norm(w["w"])
        if not n:
            continue
        if n in FILLERS and len(n) <= 5:
            continue
        if out and norm(out[-1]["w"]) == n and w["a"] - out[-1]["b"] < 0.6:
            out[-1] = w                       # repetition : on garde la seconde
            continue
        out.append(w)
    return out


def segments(words):
    if not words:
        return []
    groups, cur = [], [words[0]]
    for p, w in zip(words, words[1:]):
        if w["a"] - p["b"] > MAX_GAP:
            groups.append(cur)
            cur = [w]
        else:
            cur.append(w)
    groups.append(cur)

    segs = [{"a": max(0.0, g[0]["a"] - PAD), "b": g[-1]["b"] + PAD, "words": g}
            for g in groups]
    for p, n in zip(segs, segs[1:]):          # la marge ne mord pas sur le voisin
        if p["b"] > n["a"]:
            mid = (p["b"] + n["a"]) / 2
            p["b"], n["a"] = mid, mid
    return [s for s in segs if s["b"] - s["a"] >= MIN_SEG]


# ------------------------------------------------------------------ typographie
def font_name():
    try:
        have = subprocess.run(["fc-list", ":", "family"], capture_output=True,
                              text=True).stdout.lower()
    except FileNotFoundError:
        have = ""
    for f in ("inter", "montserrat"):
        if f in have:
            return f.capitalize()
    return "Liberation Sans"                  # clone metrique d'Arial


def keyword(words):
    """Le mot le plus porteur de la phrase : on le passe en capitales."""
    best, score = None, 0
    for w in words:
        n = norm(w["w"])
        if n in STOP or len(n) < 4:
            continue
        s = len(n) + (6 if re.search(r"[\d%€$]", w["w"]) else 0)
        if s > score:
            best, score = id(w), s
    return best


def ass(segs, path):
    def ts(t):
        cs = int(round(max(0.0, t) * 100))
        h, cs = divmod(cs, 360000)
        m, cs = divmod(cs, 6000)
        s, cs = divmod(cs, 100)
        return "%d:%02d:%02d.%02d" % (h, m, s, cs)

    L = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: %d" % W,
         "PlayResY: %d" % H, "WrapStyle: 2", "ScaledBorderAndShadow: yes", "",
         "[V4+ Styles]",
         "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, "
         "OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, "
         "ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, "
         "MarginL, MarginR, MarginV, Encoding",
         "Style: S,%s,92,&H00FFFFFF,&H00FFFFFF,&H00000000,&H50000000,-1,0,0,0,"
         "100,100,0,0,1,3,2,2,70,70,420,1" % font_name(), "",
         "[Events]",
         "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, "
         "Effect, Text"]

    t = 0.0
    for s in segs:
        off = t - s["a"]
        key = keyword(s["words"])
        cards = [s["words"][i:i + 2] for i in range(0, len(s["words"]), 2)]
        for j, c in enumerate(cards):
            a = c[0]["a"] + off
            b = (cards[j + 1][0]["a"] + off) if j + 1 < len(cards) else (
                s["b"] + off)
            txt = " ".join(
                (w["w"].upper() if id(w) == key else w["w"]).replace("—", "-")
                for w in c)
            L.append("Dialogue: 0,%s,%s,S,,0,0,0,,"
                     "{\\fscx85\\fscy85\\t(0,80,\\fscx100\\fscy100)}%s"
                     % (ts(a), ts(b), txt))
        t += s["b"] - s["a"]

    with open(path, "w") as f:
        f.write("\n".join(L) + "\n")


# ----------------------------------------------------------------------- b-roll
def broll_keywords(segs, n):
    """Mots-cles des passages les plus denses en mots concrets."""
    cand = []
    for i, s in enumerate(segs[1:-1], 1):
        words = [norm(w["w"]) for w in s["words"]]
        pick = [w for w in words if w not in STOP and len(w) >= 5]
        if pick:
            cand.append((len(pick), i, max(pick, key=len)))
    cand.sort(reverse=True)
    out, used = [], set()
    for _, i, kw in cand:
        if len(out) >= n or any(abs(i - j) < 3 for j, _ in out):
            continue
        if kw in used:
            continue
        used.add(kw)
        out.append((i, kw))
    return sorted(out)


def fetch_broll(segs, n=3):
    key = os.environ.get("PEXELS_API_KEY")
    if not key:
        return []
    import requests
    os.makedirs("assets_short", exist_ok=True)
    got = []
    for i, kw in broll_keywords(segs, n):
        try:
            r = requests.get("https://api.pexels.com/videos/search",
                             params={"query": kw, "orientation": "portrait",
                                     "size": "medium", "per_page": 1},
                             headers={"Authorization": key}, timeout=30)
            vids = r.json().get("videos") or []
            if not vids:
                continue
            files = sorted(vids[0]["video_files"],
                           key=lambda f: -(f.get("height") or 0))
            url = next((f["link"] for f in files
                        if (f.get("height") or 0) >= 1280), files[0]["link"])
            p = "assets_short/broll%d.mp4" % len(got)
            with requests.get(url, stream=True, timeout=120) as d:
                with open(p, "wb") as f:
                    for ch in d.iter_content(1 << 16):
                        f.write(ch)
            got.append({"path": p, "after": i,
                        "dur": BROLL_MIN + 0.5 * (len(got) % 3)})
        except Exception:
            continue
    return got


# ------------------------------------------------------------------- rendu final
def zoom_expr(segs):
    """z(t) : derive lente + punch-in alterne au debut d'un segment sur deux."""
    terms = ["(1+%.4f*t/%%.4f)" % ZOOM_DRIFT]
    t = 0.0
    starts = []
    for i, s in enumerate(segs):
        if i and i % 2:
            starts.append(t)
        t += s["b"] - s["a"]
    total = t
    for s0 in starts:
        terms.append(
            "+%.3f*if(between(t\\,%.3f\\,%.3f)\\,(t-%.3f)/%.3f\\,"
            "if(between(t\\,%.3f\\,%.3f)\\,(%.3f-t)/%.3f\\,0))"
            % (PUNCH, s0, s0 + PUNCH_UP, s0, PUNCH_UP,
               s0 + PUNCH_UP, s0 + PUNCH_UP + PUNCH_DOWN,
               s0 + PUNCH_UP + PUNCH_DOWN, PUNCH_DOWN))
    return ("".join(terms) % total), total


def render(segs, brolls):
    bw, bh = int(W * ZMAX) // 2 * 2, int(H * ZMAX) // 2 * 2
    parts = []
    for i, s in enumerate(segs):
        parts.append("[0:v]trim=%.3f:%.3f,setpts=PTS-STARTPTS[v%d]"
                     % (s["a"], s["b"], i))
        parts.append("[0:a]atrim=%.3f:%.3f,asetpts=PTS-STARTPTS[a%d]"
                     % (s["a"], s["b"], i))
    cat = ("".join("[v%d][a%d]" % (i, i) for i in range(len(segs)))
           + "concat=n=%d:v=1:a=1[vc][ac]" % len(segs))

    z, total = zoom_expr(segs)
    # couverture large, puis fenetre mobile recadree : jamais de bande noire
    head = ("[vc]scale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d,"
            "setsar=1[base]" % (bw, bh, bw, bh))
    # crop ne reevalue pas sa taille : on pilote le zoom par scale=eval=frame,
    # puis on rogne au centre a dimensions fixes pour l'encodeur
    zoom = ("[base]scale=w=trunc(%d*(%s)/2)*2:h=trunc(%d*(%s)/2)*2:eval=frame:flags=bicubic,crop=%d:%d,setsar=1[tv]"
            % (W, z, H, z, W, H))

    chain = parts + [cat, head, zoom]
    vlast = "tv"
    if brolls:
        # chaque B-roll entre et sort en xfade : plein ecran, zoom 1.0 -> 1.08
        for k, b in enumerate(brolls):
            tr = WIPES[k % len(WIPES)]
            chain.append(
                "[%d:v]scale=%d:%d:force_original_aspect_ratio=increase,"
                "crop=%d:%d,trim=0:%.3f,setpts=PTS-STARTPTS,"
                "scale=w=trunc(%d*(1+0.08*t/%.3f)/2)*2:"
                "h=trunc(%d*(1+0.08*t/%.3f)/2)*2:eval=frame:flags=bicubic,"
                "crop=%d:%d,fps=%d,setsar=1,format=yuv420p[b%d]"
                % (k + 1, bw, bh, bw, bh, b["dur"], W, b["dur"], H, b["dur"],
                   W, H, FPS, k))
        cuts = []
        t = 0.0
        for i, s in enumerate(segs):
            t += s["b"] - s["a"]
            for b in brolls:
                if b["after"] == i:
                    cuts.append((t, b))
        prev, off, idx = vlast, 0.0, 0
        for (at, b) in cuts:
            at += off
            chain.append("[%s]split=2[p%d][q%d]" % (prev, idx, idx))
            chain.append("[p%d]trim=0:%.3f,setpts=PTS-STARTPTS[h%d]"
                         % (idx, at, idx))
            chain.append("[q%d]trim=%.3f,setpts=PTS-STARTPTS[r%d]"
                         % (idx, max(0.0, at - XFADE), idx))
            bi = brolls.index(b)
            chain.append("[h%d][b%d]xfade=transition=%s:duration=%.2f:"
                         "offset=%.3f[m%d]"
                         % (idx, bi, WIPES[bi % len(WIPES)], XFADE,
                            max(0.0, at - XFADE), idx))
            chain.append("[m%d][r%d]xfade=transition=%s:duration=%.2f:"
                         "offset=%.3f[n%d]"
                         % (idx, idx, WIPES[(bi + 1) % len(WIPES)], XFADE,
                            max(0.0, at + b["dur"] - XFADE), idx))
            prev = "n%d" % idx
            off += b["dur"] - XFADE
            idx += 1
        vlast = prev
        total += off

    chain.append("[%s]ass=subs_short.ass[vo]" % vlast)

    has_music = os.path.exists(MUSIC)
    if has_music:
        mi = 1 + len(brolls)
        chain.append("[%d:a]aloop=loop=-1:size=2e9,atrim=0:%.3f,"
                     "volume=%.1fdB,afade=t=in:st=0:d=0.5,"
                     "afade=t=out:st=%.3f:d=1,aresample=48000[mus]"
                     % (mi, total, MUSIC_DB, max(0.0, total - 1.0)))
        chain.append("[ac]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,"
                     "asplit=2[vx][key]")
        # ducking : la voix pilote la compression de la musique
        chain.append("[mus][key]sidechaincompress=threshold=0.03:ratio=8:"
                     "attack=5:release=300[duck]")
        chain.append("[vx][duck]amix=inputs=2:duration=first:"
                     "weights=1 1:normalize=0,alimiter=limit=0.95[ao]")
    else:
        chain.append("[ac]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[ao]")

    with open("fc.txt", "w") as f:            # depasse la limite d'arguments
        f.write(";".join(chain))
    cmd = [FF, "-y", "-hide_banner", "-loglevel", "error", "-i", SRC]
    for b in brolls:
        cmd += ["-i", b["path"]]
    if has_music:
        cmd += ["-i", MUSIC]
    cmd += ["-filter_complex_script", "fc.txt", "-map", "[vo]", "-map", "[ao]",
            "-c:v", "libx264", "-preset", "medium", "-crf", "20",
            "-pix_fmt", "yuv420p", "-r", str(FPS),
            "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
            "-movflags", "+faststart", OUT]
    subprocess.run(cmd, check=True)
    return has_music, total


def dur(path):
    import cv2
    c = cv2.VideoCapture(path)
    d = c.get(cv2.CAP_PROP_FRAME_COUNT) / (c.get(cv2.CAP_PROP_FPS) or FPS)
    c.release()
    return d


if __name__ == "__main__":
    stage = sys.argv[1] if len(sys.argv) > 1 else "all"
    if stage in ("transcribe", "all"):
        transcribe()
    if stage in ("render", "all"):
        segs = segments(clean(load_words()))
        ass(segs, "subs_short.ass")
        brolls = fetch_broll(segs)
        music, total = render(segs, brolls)
        print(json.dumps({"avant": round(dur(SRC), 2), "apres": round(total, 2),
                          "coupes": max(0, len(segs) - 1),
                          "broll": len(brolls), "musique": music, "out": OUT}))
