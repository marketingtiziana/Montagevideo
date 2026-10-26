# -*- coding: utf-8 -*-
"""INPUT.mp4 -> short_final.mp4 : montage doux, sous-titres et callouts animes.

Trois etapes, pour que le texte soit relu avant d'etre incruste :
  python make_short.py transcribe   -> transcript.json
  python make_short.py music        -> MUSIC.mp3 (seulement s'il manque)
  python make_short.py render       -> short_final.mp4 (un seul encodage video)
L'etape render applique corrections.json (meme nombre de mots) si le fichier
existe : seul le texte change, jamais les horodatages.
"""
import json, os, re, shutil, subprocess, sys


def _ffmpeg():
    """Le binaire du systeme s'il existe, sinon celui livre par imageio-ffmpeg."""
    return shutil.which("ffmpeg") or __import__("imageio_ffmpeg").get_ffmpeg_exe()


FF = _ffmpeg()
SRC, MUSIC, OUT = "INPUT.mp4", "MUSIC.mp3", "short_final.mp4"
W, H, FPS = 1080, 1920, 30

SIL_DB = -34            # seuil au-dela duquel on considere qu'elle ne parle plus
SIL_MIN = 0.45          # en-deca c'est une respiration : on la garde
LEAD = 0.20             # on reprend AVANT l'attaque du mot, jamais dessus
TAIL = 0.10             # on laisse la derniere syllabe finir
HOLE = 0.12             # silence restant minimal : sous ce gain, pas de coupe
XF = 0.12               # chaque raccord est un fondu, jamais un cut sec

ZOOM = 0.05             # micro-zoom lent, avec ease-in/ease-out
BR_XF = 0.30            # entree/sortie des B-roll et habillages
ANIM_LAG = 0.8          # l'habillage arrive en echo, apres le mot prononce
BR_WIPES = ["fade", "smoothup", "circleopen", "dissolve"]
BROLL_MIN, BROLL_MAX = 1.5, 2.5

# Accroche du debut : texte noir sur bandeau blanc, visible des la premiere frame
HOOK = ["SI JE DEVAIS APPRENDRE", "UNE SEULE COMPÉTENCE",
        "FINANCIÈRE AVANT 2027"]
HOOK_END = 4.4          # duree d'affichage, en secondes de sortie
HOOK_MUTE = 3.6         # tant que l'accroche redit les mots, pas de sous-titre
HOOK_FS = 74
HOOK_Y = 1080           # sous le visage, au-dessus des sous-titres

MUSIC_LUFS = -44.0      # voix a -16 LUFS : la musique reste 28 dB dessous
VOICE_LUFS = -16.0
MIN_RATIO = 12.0        # ecart voix/musique minimal exige

SENT = re.compile(r"[.!?\u2026:;]$")
PAD_DROP = 0.03         # au bord d'un passage retire, pas de marge : elle le reinviterait
DROPPED = []            # (debut, fin) des passages retires : faux departs, scories
FILLERS = {"euh", "heu", "hein", "hum", "bah", "ben", "bon"}
# mots qui ne peuvent pas terminer un groupe de sous-titres : ils appellent
# le mot suivant (determinant, preposition, sujet, relatif)
GLUE = {"le", "la", "les", "un", "une", "des", "de", "du", "au", "aux", "en",
        "dans", "sur", "pour", "par", "que", "qui", "ce", "cet", "cette", "ces",
        "se", "sa", "son", "ses", "mon", "ma", "mes", "ton", "ta", "tes", "leur",
        "leurs", "notre", "nos", "votre", "vos", "je", "tu", "il", "elle", "on",
        "nous", "vous", "ils", "elles", "ne", "n", "l", "d", "j", "m", "t", "s",
        "c", "qu", "et", "ou", "mais", "a", "à", "plus", "tres", "très", "sans",
        "sous", "avec", "tout", "tous", "toute", "toutes", "quelque", "pas"}
UNITS = {"milliards", "milliard", "millions", "million", "euros", "euro",
         "dollars", "dollar", "ans", "an", "mois", "jours", "pourcent",
         "minutes", "minute", "heures", "heure", "semaines", "semaine"}
LEADIN = {"directive", "loi", "article", "reglement", "règlement", "taux",
          "impot", "impôt", "amende", "seuil", "texte"}
STRUCT = {"llc", "ltd", "holding", "sci", "sarl", "sas", "sasu", "trust",
          "fondation", "offshore"}
PLACES = {"dubai", "dubaï", "singapour", "suisse", "monaco", "portugal",
          "malte", "chypre", "andorre", "panama", "emirats", "émirats",
          "etats-unis", "états-unis", "paraguay", "thailande", "thaïlande",
          "bulgarie", "estonie", "maroc", "canada", "france", "espagne",
          "bali", "europe", "asie", "indonesie", "vietnam", "qatar", "londres",
          "miami", "italie", "grece", "israel", "mexique", "bresil"}
KEY = {"expatriation", "immobilier", "statistiques", "fiscalite", "fiscal",
       "residence", "patrimoine", "imposition", "indivision", "loyer",
       "revente", "transmettre", "donation", "succession", "impot"}
# un nombre ecrit en toutes lettres merite le meme traitement qu'un chiffre
NUMWORDS = {"deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
            "dix"}


def norm(w):
    w = w.lower().replace("\u2019", "'")
    for a, b in (("é", "e"), ("è", "e"), ("ê", "e"), ("ë", "e"), ("à", "a"),
                 ("â", "a"), ("î", "i"), ("ï", "i"), ("ô", "o"), ("ö", "o"),
                 ("û", "u"), ("ù", "u"), ("ü", "u"), ("ç", "c")):
        w = w.replace(a, b)
    return re.sub(r"[^\w'/-]", "", w)


# ---------------------------------------------------------------- transcription
ELIDE = {"d": "de", "l": "le", "n": "ne", "qu": "que", "j": "je", "m": "me",
         "t": "te", "s": "se", "c": "ce"}


def cle(w):
    n = norm(w["w"]).replace("'", "")
    return ELIDE.get(n, n)


def recaler(words, debut, c2a, c2b, retime):
    """Pose les mots de la prise abandonnee sur les horodatages de la bonne.

    Whisper n'ecrit la phrase qu'une fois : ses mots pointent sur la prise
    qu'on retire. Sans ce recalage, couper l'audio ferait disparaitre le
    sous-titre correspondant.
    """
    vise = [i for i, w in enumerate(words)
            if w["b"] > debut and w["a"] < c2b]
    if not vise or c2b <= c2a:
        return
    pas = (c2b - c2a) / len(vise)
    for k, i in enumerate(vise):
        retime[str(i)] = [round(c2a + k * pas, 3),
                          round(c2a + (k + 1) * pas, 3)]


def reprises_cachees(model, words):
    """Repetitions qu'un seul jeton a avalees.

    Quand elle se reprend, whisper etire souvent un mot sur toute la reprise
    ("SCI," tenu 2,7 s pour "a ta SCI, a ta SCI,"). On retranscrit ces jetons
    anormalement longs pour voir ce qu'ils cachent.
    """
    import difflib
    pareil = lambda x, y: (x == y or
                           difflib.SequenceMatcher(None, x, y).ratio() >= .75)
    spans, retime = [], {}
    for w in words:
        if w["b"] - w["a"] < 1.1:
            continue
        # deux fenetres : serree sur le jeton etire, puis large en amont, car
        # le faux depart le precede parfois et whisper redecoupe autrement
        for marge in (0.5, 3.5):
          a, b = max(0.0, w["a"] - marge), w["b"] + 0.8
          segs, _ = model.transcribe(SRC, language="fr", word_timestamps=True,
                                     vad_filter=False, clip_timestamps=[a, b])
          mots = [x for s in segs for x in (s.words or []) if x.word.strip()]
          k = [cle({"w": x.word.strip()}) for x in mots]
          fin = lambda x: re.sub(r"[\w'\u2019-]", "", x.word.strip()).strip()
          # whisper n'ecrit pas toujours un sigle pareil d'une fois sur l'autre
          # ("SEI," puis "SCI,") : la comparaison tolere ces ecarts de lettres
          import difflib
          pareil = lambda x, y: (x == y or
                                 difflib.SequenceMatcher(None, x, y).ratio() >= .75)
          for i in range(len(mots)):
              for size in range(10, 1, -1):
                  j = i + size
                  if j + size > len(mots):
                      continue
                  if (all(pareil(k[i + t], k[j + t]) for t in range(size))
                          and fin(mots[j - 1]) == fin(mots[j + size - 1])):
                      spans.append([round(float(mots[i].start), 2),
                                    round(float(mots[j].start), 2)])
                      break
              else:
                  continue
              break
    # second cas : le jeton etire contient la reprise de ce qui le precede,
    # elle recommence sa phrase et whisper n'ecrit que la premiere version
    for idx, w in enumerate(words):
        if w["b"] - w["a"] < 1.1 or idx < 4:
            continue
        a, b = max(0.0, w["a"] - 0.1), w["b"] + 0.4
        segs, _ = model.transcribe(SRC, language="fr", word_timestamps=True,
                                   vad_filter=False, clip_timestamps=[a, b])
        inner = [x for s in segs for x in (s.words or []) if x.word.strip()]
        trouve = False
        for saut in range(0, 4):              # elle amorce parfois un autre mot
            for k in range(10, 3, -1):
                if len(inner) < saut + k or idx + 1 < k:
                    continue
                avant = words[idx + 1 - k:idx + 1]
                if all(pareil(cle(x), cle({"w": y.word.strip()}))
                       for x, y in zip(avant, inner[saut:saut + k])):
                    j = idx + 1 - k
                    # le mot juste avant la coupe est parfois deja celui par
                    # lequel elle recommence : il part avec
                    while j > 0 and pareil(cle(words[j - 1]),
                                           cle({"w": inner[saut].word.strip()})):
                        j -= 1
                    spans.append([round(float(words[j]["a"]), 2),
                                  round(float(inner[saut].start), 2)])
                    recaler(words, float(words[j]["a"]),
                            float(inner[saut].start),
                            float(inner[saut + k - 1].end), retime)
                    trouve = True
                    break
            if trouve:
                break

    spans.sort()
    fusion = []                               # deux fenetres voient la meme reprise
    for a, b in spans:
        if fusion and a <= fusion[-1][1]:
            fusion[-1][1] = max(fusion[-1][1], b)
        else:
            fusion.append([a, b])
    with open("retime.json", "w") as f:
        json.dump(retime, f)
    return fusion


def transcribe():
    from faster_whisper import WhisperModel
    m = WhisperModel("medium", device="cpu", compute_type="int8", cpu_threads=4)
    segs, _ = m.transcribe(SRC, language="fr", word_timestamps=True,
                           vad_filter=False)
    words = [{"w": w.word.strip(), "a": float(w.start), "b": float(w.end)}
             for s in segs for w in (s.words or []) if w.word.strip()]
    with open("transcript.json", "w") as f:
        json.dump(words, f, ensure_ascii=False)
    with open("cuts_auto.json", "w") as f:
        json.dump(reprises_cachees(m, words), f)
    return words


def load_words():
    """Transcript + corrections, puis recollage des elisions (l' + accès)."""
    with open("transcript.json") as f:
        words = json.load(f)
    if os.path.exists("retime.json"):         # mots recales sur la bonne prise
        with open("retime.json") as f:
            for i, (a, b) in json.load(f).items():
                words[int(i)]["a"], words[int(i)]["b"] = a, b
    if os.path.exists("corrections.json"):
        with open("corrections.json") as f:
            fix = json.load(f)
        if len(fix) != len(words):
            sys.exit("corrections.json : %d mots pour %d" % (len(fix), len(words)))
        for w, t in zip(words, fix):
            w["w"] = t
    DROPPED.clear()
    for fichier in ("cuts.json", "cuts_auto.json"):   # a la main, puis detectes
        if not os.path.exists(fichier):
            continue
        with open(fichier) as f:
            for a, b in json.load(f):
                DROPPED.append((float(a), float(b)))
                words = [x for x in words
                         if not (a <= (x["a"] + x["b"]) / 2 <= b)]
    out = []
    for w in words:
        t = w["w"].strip()
        if t == "-":
            continue                          # retire du texte seul, son intact
        if not t:
            DROPPED.append((w["a"], w["b"]))  # vide par corrections.json : a couper
            continue
        if out and re.match(r"^[.,]\d", t):
            out[-1]["w"] += "," + t[1:]       # 2 + .5 -> 2,5
            out[-1]["b"] = w["b"]
            continue
        if out and not re.search(r"\w", t):
            out[-1]["w"] += " " + t           # le "?" isole de whisper
            out[-1]["b"] = w["b"]
            continue
        if out and (t.startswith("'") or t.startswith("\u2019")
                    or t.startswith("-")):
            out[-1]["w"] += t                 # l + 'accès -> l'accès, toi + -même
            out[-1]["b"] = w["b"]
            continue
        out.append(dict(w, w=t))
    return doublons(out)


def doublons(words):
    """Phrase redite a l'identique : on ne garde que la seconde prise.

    Seules les repetitions mot pour mot sont retirees. Une anaphore voulue
    ("Tu ne peux pas le cacher. Tu ne peux pas le deplacer.") n'est pas une
    reprise : ses suites different, et elle doit rester.
    """
    keys = [norm(w["w"]) for w in words]
    out, i, n = [], 0, len(words)
    while i < n:
        hit = 0
        for size in range(14, 1, -1):
            j = i + size
            if j + size > n:
                continue
            end = lambda x: re.sub(r"[\w'\u2019-]", "", x["w"]).strip()
            if (keys[i:j] == keys[j:j + size]
                    and end(words[j - 1]) == end(words[j + size - 1])
                    and words[j]["a"] - words[j - 1]["b"] < 2.5):
                hit = j
                break
        if hit:
            DROPPED.append((words[i]["a"], words[hit]["a"]))
            i = hit
            continue
        out.append(words[i])
        i += 1
    return out


# -------------------------------------------------------------- coupes douces
def silences(path):
    """Les vrais silences de la bande son, pas les ecarts entre mots.

    Whisper etire parfois un mot sur la pause qui le suit ("le..." tenu 2,7 s) :
    un decoupage fonde sur ses horodatages laisse donc passer de longs blancs.
    """
    r = subprocess.run([FF, "-hide_banner", "-nostats", "-i", path,
                        "-af", "silencedetect=n=%ddB:d=%.2f" % (SIL_DB, SIL_MIN),
                        "-f", "null", "-"], capture_output=True, text=True)
    out, start = [], None
    for m in re.finditer(r"silence_(start|end): (-?\d+\.?\d*)", r.stderr):
        if m.group(1) == "start":
            start = float(m.group(2))
        elif start is not None:
            out.append((start, float(m.group(2))))
            start = None
    if start is not None:
        out.append((start, duree(path)))
    return out


def duree(path):
    r = subprocess.run([FF, "-hide_banner", "-i", path], capture_output=True,
                       text=True)
    m = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", r.stderr)
    h, mn, sec = m.groups()
    return int(h) * 3600 + int(mn) * 60 + float(sec)


def segments(words):
    """Garde ce qui est parle, resserre les blancs, retire les passages coupes."""
    total = duree(SRC)
    sil = silences(SRC)
    reprises = [e for _, e in sil]            # instants ou la parole repart
    coupes = [(a + TAIL, b - LEAD) for a, b in sil]
    coupes = [(a, b) for a, b in coupes if b - a > HOLE]
    # un passage retire s'arrete 80 ms avant le mot suivant : whisper horodate
    # parfois un mot sur une duree nulle, et la coupe avalait son attaque
    for a, b in DROPPED:
        if b - a > 0.2:
            # la coupe s'arrete a la reprise de parole la plus proche, sinon
            # elle mord sur l'attaque du mot suivant
            proches = [e for e in reprises if b - 0.5 <= e <= b]
            fin = (min(proches) - 0.18) if proches else b - 0.08
            coupes.append((a + 0.02, max(a + 0.1, fin)))
        else:
            coupes.append((a, b))
    coupes.sort()

    fusion = []                               # deux coupes qui se touchent n'en font qu'une
    for a, b in coupes:
        if fusion and a <= fusion[-1][1]:
            fusion[-1][1] = max(fusion[-1][1], b)
        else:
            fusion.append([a, b])

    gardes, t = [], 0.0
    for a, b in fusion:
        if a > t:
            gardes.append([t, a])
        t = max(t, b)
    if t < total:
        gardes.append([t, total])

    segs = [{"a": a, "b": b, "words": []} for a, b in gardes if b - a >= 0.25]
    # chaque mot va au segment qu'il recouvre le plus : whisper fait souvent
    # deborder le dernier mot d'une phrase sur le silence qui suit
    for w in words:
        best, score = None, 0.0
        for seg in segs:
            ov = min(w["b"], seg["b"]) - max(w["a"], seg["a"])
            if ov > score:
                best, score = seg, ov
        if best is None:
            best = min(segs, key=lambda s: min(abs(s["b"] - w["a"]),
                                               abs(s["a"] - w["b"])))
        best["words"].append(w)
    return [s for s in segs if s["words"]]    # sans parole : respiration ou bruit


def timeline(segs):
    """Horloge de sortie : chaque raccord mange XF secondes de recouvrement."""
    t = 0.0
    for i, s in enumerate(segs):
        s["off"] = t - s["a"]
        s["out"] = t
        t += s["b"] - s["a"]
        if i < len(segs) - 1:
            t -= XF
    return t


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


_FONT = {}


def pil_font(size):
    """Meme fonte que libass, pour mesurer les lignes avant de les incruster."""
    if size not in _FONT:
        from PIL import ImageFont
        path = _FONT.get("path")
        if path is None:
            try:
                path = subprocess.run(
                    ["fc-match", "-f", "%{file}", font_name() + ":bold"],
                    capture_output=True, text=True).stdout.strip()
            except FileNotFoundError:
                path = ""
            if not path:
                path = ("/usr/share/fonts/truetype/liberation/"
                        "LiberationSans-Bold.ttf")
            _FONT["path"] = path
        _FONT[size] = ImageFont.truetype(path, size)
    return _FONT[size]


SUB_FS, SUB_SAFE = 88, 940


def line_w(txt, fs):
    return pil_font(fs).getlength(txt)


def card_fs(txt):
    """Taille nominale, reduite seulement si la ligne depasse la zone sure."""
    w = line_w(txt, SUB_FS)
    if w <= SUB_SAFE:
        return SUB_FS
    return max(60, int(SUB_FS * SUB_SAFE / w))


def cards(words):
    """Groupes de 2 a 4 mots decoupes aux respirations de la phrase."""
    out, i, n = [], 0, len(words)
    while i < n:
        g = []
        while i < n and len(g) < 4:
            g.append(words[i])
            i += 1
            if SENT.search(g[-1]["w"]) and (
                    len(g) >= 2 or i >= n
                    or line_w(" ".join(x["w"] for x in g + [words[i]]).upper(),
                              SUB_FS) > SUB_SAFE):
                break
            if len(g) >= 3 and norm(g[-1]["w"]) not in GLUE:
                break
        while len(g) < 4 and i < n and norm(g[-1]["w"]) in GLUE:
            g.append(words[i])                # un groupe ne finit pas sur un mot-outil
            i += 1
        # jamais moins de deux mots : une ligne trop large est juste composee
        # un peu plus petite
        while (len(g) > 2
               and line_w(" ".join(x["w"] for x in g).upper(), SUB_FS) > SUB_SAFE):
            i -= 1
            g.pop()
            while len(g) > 2 and norm(g[-1]["w"]) in GLUE:
                i -= 1
                g.pop()
        if len(g) == 4 and norm(g[-1]["w"]) in GLUE and i < n:
            i -= 1
            g.pop()                           # on renvoie le mot-outil au groupe suivant
        out.append(g)

    k = 1
    while k < len(out):                       # un mot reste seul : il rejoint
        if (len(out[k]) == 1 and len(out[k - 1]) <= 3   # le groupe precedent,
                and line_w(" ".join(x["w"] for x in out[k - 1] + out[k]).upper(),
                           SUB_FS) <= SUB_SAFE):         # si la ligne tient
            out[k - 1] += out.pop(k)
            continue
        k += 1
    return out


def ts(t):
    cs = int(round(max(0.0, t) * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return "%d:%02d:%02d.%02d" % (h, m, s, cs)


# -------------------------------------------------------------- illustrations
def animations(segs, total):
    """Illustrations tirees du transcript : chiffres, lieux, mots-sujets."""
    flat = [(w, s) for s in segs for w in s["words"]]

    def base(w):
        return norm(w["w"]).split("'")[-1]

    found, taken = [], set()

    # une enumeration de lieux devient une liste a puces
    i = 0
    while i < len(flat):
        if base(flat[i][0]) in PLACES:
            j, items = i, []
            while j < len(flat) and j - i < 8:
                ww, ss = flat[j]
                if (base(ww) in PLACES and len(items) < 3
                        and base(ww) not in [base({"w": t}) for t, _, _ in items]):
                    items.append((re.sub(r"[,.;:?!]", "", ww["w"]).upper(),
                                  ww["a"] + ss["off"], id(ww)))
                j += 1
            if len(items) >= 2:
                taken.update(it[2] for it in items)
                found.append({"kind": "list", "t": items[0][1], "prio": 1,
                              "items": [(t, u) for t, u, _ in items]})
                i = j
                continue
        i += 1

    i = 0
    while i < len(flat):
        w, s = flat[i]
        t = w["a"] + s["off"]
        if re.search(r"\d", w["w"]):
            j, parts = i, [w["w"]]
            while j + 1 < len(flat):
                nx = flat[j + 1][0]
                nn = norm(nx["w"])
                if (re.search(r"\d", nx["w"]) or nn in UNITS or nn == "/"
                        or nx["w"].strip() in ("%", "€", "$")):
                    parts.append(nx["w"])
                    j += 1
                elif (j + 2 < len(flat) and re.search(r"\d", flat[j + 2][0]["w"])
                      and (len(nn) > 1 or nn in ("a", "e", "o"))):
                    parts.append(nx["w"])     # "11 janvier 2027"
                    j += 1
                else:
                    break
            if i and norm(flat[i - 1][0]["w"]) in LEADIN:
                parts.insert(0, flat[i - 1][0]["w"])
            txt = re.sub(r"\s*/\s*", "/", " ".join(parts))
            found.append({"kind": "callout", "t": t, "prio": 0,
                          "txt": re.sub(r"[,.;:?!]", "", txt).strip().upper()})
            i = j + 1
            continue
        b = base(w)
        if b in NUMWORDS and i + 1 < len(flat):
            nx = base(flat[i + 1][0])
            if nx not in GLUE and len(nx) > 3 and nx.endswith("s"):
                found.append({"kind": "callout", "t": t, "prio": 0,
                              "txt": re.sub(r"[,.;:?!]", "", w["w"] + " "
                                            + flat[i + 1][0]["w"]).upper()})
                i += 2
                continue
        if id(w) not in taken and (b in STRUCT or b in KEY
                                   or b in PLACES):
            found.append({"kind": "callout", "t": t,
                          "prio": 1 if b in STRUCT else 2 if b in KEY else 4,
                          "txt": re.sub(r"^[a-zA-Z]['\u2019]", "",
                                        re.sub(r"[,.;:?!]", "",
                                               w["w"]).strip()).upper()})
        i += 1

    # comparaison explicite "A vs B"
    for k in range(len(flat) - 1):
        if norm(flat[k][0]["w"]) in ("vs", "versus"):
            found.append({"kind": "vs", "prio": 1,
                          "t": flat[k][0]["a"] + flat[k][1]["off"],
                          "a": flat[k - 1][0]["w"].upper() if k else "",
                          "b": re.sub(r"[,.;:?!]", "",
                                      flat[k + 1][0]["w"]).upper()})

    keep, seen = [], set()
    for d in sorted(found, key=lambda d: (d.get("prio", 3), d["t"])):
        label = d.get("txt") or d["kind"]
        label = norm(label)[:4] or label      # meme famille : un seul habillage
        debut = HOOK_END + 0.4 if HOOK else 1.0   # pas pendant l'accroche
        if d["t"] > total - 3.6 or d["t"] < debut or label in seen:
            continue                          # jamais deux fois le meme mot
        if any(abs(d["t"] - k["t"]) < 4.0 for k in keep):
            continue                          # on laisse respirer entre deux
        seen.add(label)
        keep.append(d)
        if len(keep) == 5:
            break
    return sorted(keep, key=lambda d: d["t"])


def anim_events(anims):
    """Chaque illustration : pop + leger glissement, tiers haut de l'image."""
    ev = []
    for d in anims:
        a = d["t"] + ANIM_LAG
        if d["kind"] == "callout":
            txt = d["txt"]
            fs = max(70, min(132, int(1000 / (0.55 * max(1, len(txt))))))
            ev.append("Dialogue: 1,%s,%s,C,,0,0,0,,{\\an5\\fs%d\\fscx88\\fscy88"
                      "\\t(0,140,\\fscx106\\fscy106)\\t(140,280,\\fscx100"
                      "\\fscy100)\\move(540,500,540,440,0,340)\\fad(130,260)}%s"
                      % (ts(a), ts(a + 1.9), fs, txt))
        elif d["kind"] == "list":
            for k, (it, t0) in enumerate(d["items"]):
                y = 380 + 104 * k
                s0 = max(a, t0 - 0.15)
                ev.append("Dialogue: 1,%s,%s,C,,0,0,0,,{\\an4\\fs74"
                          "\\move(250,%d,290,%d,0,300)\\fad(140,280)}\\h\u2022\\h %s"
                          % (ts(s0), ts(a + 2.3), y + 26, y, it))
        else:
            ev.append("Dialogue: 1,%s,%s,C,,0,0,0,,{\\an5\\fs86"
                      "\\move(-320,430,300,430,0,420)\\fad(0,240)}%s"
                      % (ts(a), ts(a + 1.9), d["a"]))
            ev.append("Dialogue: 1,%s,%s,C,,0,0,0,,{\\an5\\fs86"
                      "\\move(1400,560,780,560,0,420)\\fad(0,240)}%s"
                      % (ts(a), ts(a + 1.9), d["b"]))
    return ev


def ass(segs, anims, path):
    fn = font_name()
    L = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: %d" % W,
         "PlayResY: %d" % H, "WrapStyle: 2", "ScaledBorderAndShadow: yes", "",
         "[V4+ Styles]",
         "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, "
         "OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, "
         "ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, "
         "MarginL, MarginR, MarginV, Encoding",
         "Style: S,%s,88,&H00FFFFFF,&H00FFFFFF,&H00000000,&H60000000,-1,0,0,0,"
         "100,100,0,0,1,3,1.5,2,70,70,420,1" % fn,
         "Style: C,%s,110,&H00FFFFFF,&H00FFFFFF,&H00000000,&H78000000,-1,0,0,0,"
         "100,100,1,0,1,5,3,5,60,60,60,1" % fn,
         # BorderStyle 3 : le contour devient un bandeau plein, blanc, sous un
         # texte noir ; Outline sert alors de marge interieure
         "Style: H,%s,%d,&H00141414,&H00141414,&H00FFFFFF,&H00FFFFFF,-1,0,0,0,"
         "100,100,0,0,3,16,0,5,60,60,60,1" % (fn, HOOK_FS), "",
         "[Events]",
         "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, "
         "Effect, Text"]

    # un callout reprend les mots prononces : on retire la carte de sous-titres
    # qui dirait exactement la meme chose au meme instant
    doubles = [(d["t"] + ANIM_LAG, d["t"] + ANIM_LAG + 1.9,
                set(norm(x) for x in d["txt"].split()))
               for d in anims if d["kind"] == "callout"]

    def double(a, b, words):
        w = set(norm(x["w"]) for x in words)
        return any(a < t1 and b > t0 and w and w <= got for t0, t1, got in doubles)

    for s in segs:
        cs = cards(s["words"])
        for j, c in enumerate(cs):
            a = max(c[0]["a"], s["a"]) + s["off"]
            b = (max(cs[j + 1][0]["a"], s["a"]) + s["off"]) if j + 1 < len(cs) \
                else min(c[-1]["b"] + 0.25, s["b"]) + s["off"]
            if double(a, b, c) or (HOOK and a < HOOK_MUTE):
                continue
            txt = " ".join(w["w"] for w in c).upper().replace("\u2014", "-")
            txt = re.sub(r"\s+", " ", txt).strip()
            L.append("Dialogue: 0,%s,%s,S,,0,0,0,,{\\fs%d\\fscx90\\fscy90"
                     "\\t(0,100,\\fscx100\\fscy100)\\fad(60,60)}%s"
                     % (ts(a), ts(b), card_fs(txt), txt))
    if HOOK:
        L.append("Dialogue: 2,%s,%s,H,,0,0,0,,{\\pos(%d,%d)\\fscx92\\fscy92"
                 "\\t(0,150,\\fscx100\\fscy100)\\fad(0,280)}%s"
                 % (ts(0), ts(HOOK_END), W // 2, HOOK_Y, "\\N".join(HOOK)))
    L += anim_events(anims)
    with open(path, "w") as f:
        f.write("\n".join(L) + "\n")


# ----------------------------------------------------------------------- b-roll
def fetch_broll(segs, n=3):
    key = os.environ.get("PEXELS_API_KEY")
    if not key:
        return []
    import requests
    os.makedirs("assets_short", exist_ok=True)
    cand = []
    for i, s in enumerate(segs[1:-1], 1):
        pick = [norm(w["w"]) for w in s["words"]
                if norm(w["w"]) not in GLUE and len(norm(w["w"])) >= 6]
        if pick:
            cand.append((len(pick), i, max(pick, key=len)))
    cand.sort(reverse=True)
    got = []
    for _, i, kw in cand:
        if len(got) >= n or any(abs(i - g["after"]) < 2 for g in got):
            continue
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
    return sorted(got, key=lambda g: g["after"])


# ------------------------------------------------------------------- musique
def gen_music(dur):
    """Nappe d'ambiance : accords tenus, arpege lent, aucune percussion."""
    import numpy as np
    sr = 48000
    n = int(sr * dur)
    t = np.arange(n) / sr
    out = np.zeros(n)
    bar = 4.0
    prog = [(220.00, 261.63, 329.63, 392.00),        # Am7
            (174.61, 220.00, 261.63, 349.23),        # Fmaj7
            (196.00, 246.94, 293.66, 392.00),        # G
            (174.61, 220.00, 261.63, 329.63)]        # Fmaj7/A
    for k in range(int(dur / bar) + 1):
        t0 = k * bar
        ch = prog[k % len(prog)]
        i0 = int(t0 * sr)
        i1 = min(n, i0 + int(bar * 1.15 * sr))
        if i0 >= n:
            break
        lt = np.arange(i1 - i0) / sr
        env = np.minimum(lt / 1.2, 1.0) * np.exp(-lt / 3.2)
        for f in ch[:3]:                      # nappe : fondamentale + octave douce
            out[i0:i1] += 0.055 * env * (np.sin(2 * np.pi * f * lt)
                                         + 0.25 * np.sin(4 * np.pi * f * lt))
        for j, f in enumerate(ch):            # arpege a la blanche, longue traine
            s0 = i0 + int((j * bar / 4) * sr)
            s1 = min(n, s0 + int(2.4 * sr))
            if s0 >= n:
                break
            at = np.arange(s1 - s0) / sr
            e = np.minimum(at / 0.02, 1.0) * np.exp(-at / 1.1)
            out[s0:s1] += 0.05 * e * (np.sin(4 * np.pi * f * at)
                                      + 0.2 * np.sin(8 * np.pi * f * at))
    out += 0.02 * np.sin(2 * np.pi * 55.0 * t) * np.minimum(t / 2.0, 1.0)
    out /= max(1e-9, np.abs(out).max()) / 0.9
    pcm = (out * 32767).astype("<i2").tobytes()
    subprocess.run([FF, "-y", "-hide_banner", "-loglevel", "error",
                    "-f", "s16le", "-ar", str(sr), "-ac", "1", "-i", "-",
                    "-c:a", "libmp3lame", "-b:a", "192k", MUSIC],
                   input=pcm, check=True)


def lufs(args):
    """Loudness integree d'une chaine audio, sans rien encoder."""
    r = subprocess.run([FF, "-hide_banner", "-nostats", "-i", SRC] + args
                       + ["-f", "null", "-"], capture_output=True, text=True)
    m = re.findall(r"I:\s*(-?\d+\.\d+) LUFS", r.stderr)
    return float(m[-1]) if m else None


# ------------------------------------------------------------------ rendu final
def render(segs, brolls, anims, total):
    """Un seul encodage. Chaque segment est une ENTREE a part (-ss/-t) et non
    une branche trim du meme flux : un decodeur unique devait sinon garder en
    memoire tout ce que les branches suivantes n'avaient pas encore consomme,
    ce qui faisait tuer ffmpeg par le systeme sur une source longue en 1080p60.
    """
    bw, bh = int(W * (1 + ZOOM)) // 2 * 2, int(H * (1 + ZOOM)) // 2 * 2
    cmd = [FF, "-y", "-hide_banner", "-loglevel", "error"]
    for s in segs:
        cmd += ["-ss", "%.3f" % s["a"], "-t", "%.3f" % (s["b"] - s["a"]), "-i", SRC]
    for b in brolls:
        cmd += ["-i", b["path"]]
    has_music = os.path.exists(MUSIC)
    if has_music:
        cmd += ["-i", MUSIC]

    chain = []
    for i, s in enumerate(segs):
        chain.append("[%d:v]setpts=PTS-STARTPTS,fps=%d,format=yuv420p,setsar=1[v%d]"
                     % (i, FPS, i))
        chain.append("[%d:a]asetpts=PTS-STARTPTS,aresample=48000[a%d]" % (i, i))

    # raccords en fondu : la coupe se fait pendant le silence et ne se voit pas
    vprev, aprev, acc = "v0", "a0", segs[0]["b"] - segs[0]["a"]
    for i in range(1, len(segs)):
        d = segs[i]["b"] - segs[i]["a"]
        chain.append("[%s][v%d]xfade=transition=fade:duration=%.2f:offset=%.3f"
                     "[vx%d]" % (vprev, i, XF, acc - XF, i))
        chain.append("[%s][a%d]acrossfade=d=%.2f:c1=tri:c2=tri[ax%d]"
                     % (aprev, i, XF, i))
        vprev, aprev = "vx%d" % i, "ax%d" % i
        acc += d - XF

    # micro-zoom avec ease-in/ease-out : crop ne reevalue pas sa taille, donc
    # c'est scale=eval=frame qui porte le mouvement
    p = "(t/%.3f)" % max(0.1, acc)
    z = "(1+%.4f*(%s*%s*(3-2*%s)))" % (ZOOM, p, p, p)
    chain.append("[%s]scale=%d:%d:force_original_aspect_ratio=increase,"
                 "crop=%d:%d,setsar=1[base]" % (vprev, bw, bh, bw, bh))
    chain.append("[base]scale=w=trunc(%d*%s/2)*2:h=trunc(%d*%s/2)*2:eval=frame:"
                 "flags=bicubic,crop=%d:%d,setsar=1[tv]" % (W, z, H, z, W, H))
    vlast = "tv"

    nseg = len(segs)
    for k, b in enumerate(brolls):
        zb = "(1+0.08*(t/%.3f))" % b["dur"]
        chain.append("[%d:v]trim=0:%.3f,setpts=PTS-STARTPTS,fps=%d,"
                     "scale=%d:%d:force_original_aspect_ratio=increase,"
                     "crop=%d:%d,scale=w=trunc(%d*%s/2)*2:h=trunc(%d*%s/2)*2:"
                     "eval=frame:flags=bicubic,crop=%d:%d,setsar=1,"
                     "format=yuv420p[b%d]"
                     % (nseg + k, b["dur"], FPS, bw, bh, bw, bh, W, zb, H, zb,
                        W, H, k))
    off = 0.0
    for k, b in enumerate(brolls):
        at = segs[b["after"]]["out"] + (segs[b["after"]]["b"]
                                       - segs[b["after"]]["a"]) + off
        at = max(BR_XF + 0.1, min(at, acc + off - b["dur"] - BR_XF))
        chain.append("[%s]split=2[p%d][q%d]" % (vlast, k, k))
        chain.append("[p%d]trim=0:%.3f,setpts=PTS-STARTPTS[h%d]" % (k, at, k))
        chain.append("[q%d]trim=%.3f,setpts=PTS-STARTPTS[r%d]"
                     % (k, max(0.0, at - BR_XF), k))
        chain.append("[h%d][b%d]xfade=transition=%s:duration=%.2f:offset=%.3f"
                     "[m%d]" % (k, k, BR_WIPES[k % len(BR_WIPES)], BR_XF,
                                max(0.0, at - BR_XF), k))
        chain.append("[m%d][r%d]xfade=transition=%s:duration=%.2f:offset=%.3f"
                     "[n%d]" % (k, k, BR_WIPES[(k + 1) % len(BR_WIPES)], BR_XF,
                                max(0.0, at + b["dur"] - BR_XF), k))
        vlast = "n%d" % k
        off += b["dur"] - BR_XF

    chain.append("[%s]ass=subs_short.ass[vo]" % vlast)

    dur_out = acc + off
    voice = "[%s]loudnorm=I=%.0f:TP=-1.5:LRA=11,aresample=48000" % (aprev,
                                                                    VOICE_LUFS)
    if has_music:
        mi = nseg + len(brolls)
        chain.append(voice + ",asplit=2[vx][key]")
        chain.append("[%d:a]aloop=loop=-1:size=2000000000,atrim=0:%.3f,"
                     "loudnorm=I=%.0f:TP=-9:LRA=7,"
                     "afade=t=in:st=0:d=0.5,afade=t=out:st=%.3f:d=1.5,"
                     "aresample=48000[mus]"
                     % (mi, dur_out, MUSIC_LUFS, max(0.0, dur_out - 1.5)))
        # ducking : la voix pilote la compression de la nappe
        chain.append("[mus][key]sidechaincompress=threshold=0.05:ratio=6:"
                     "attack=5:release=400[duck]")
        chain.append("[vx][duck]amix=inputs=2:duration=first:weights=1 1:"
                     "normalize=0,alimiter=limit=0.95[ao]")
    else:
        chain.append(voice + "[ao]")

    with open("fc.txt", "w") as f:            # depasse la limite d'arguments
        f.write(";".join(chain))
    cmd += ["-filter_complex_script", "fc.txt", "-map", "[vo]", "-map", "[ao]",
            "-c:v", "libx264", "-preset", "medium", "-crf", "20",
            "-pix_fmt", "yuv420p", "-r", str(FPS),
            "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
            "-movflags", "+faststart", OUT]
    subprocess.run(cmd, check=True)
    return has_music, dur_out


def dur(path):
    import cv2
    c = cv2.VideoCapture(path)
    d = c.get(cv2.CAP_PROP_FRAME_COUNT) / (c.get(cv2.CAP_PROP_FPS) or FPS)
    c.release()
    return d


if __name__ == "__main__":
    stage = sys.argv[1] if len(sys.argv) > 1 else "all"
    if stage in ("transcribe", "all") and not os.path.exists("transcript.json"):
        transcribe()
    segs = segments(load_words())
    total = timeline(segs)
    if stage in ("music", "all") and not os.path.exists(MUSIC):
        gen_music(total + 2.0)
    if stage in ("render", "all"):
        anims = animations(segs, total)
        ass(segs, anims, "subs_short.ass")
        brolls = fetch_broll(segs)
        music, out_dur = render(segs, brolls, anims, total)
        print(json.dumps({"avant": round(dur(SRC), 2),
                          "apres": round(out_dur, 2),
                          "coupes": len(segs) - 1, "anims": len(anims),
                          "broll": len(brolls), "musique": music, "out": OUT}))
