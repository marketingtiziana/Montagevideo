"""Sous-titres FR : corrige la transcription, la cale sur la timeline montée, écrit .srt et .ass."""
import json, os, re
from timeline import G, FPS, COLD_OPEN, HERE
from plan import build_clips

CLIPS, TOTAL_F = build_clips()

# Corrections relues à partir de l'audio (transcription automatique -> texte exact).
# ⚠ = passage à réécouter (voir VERIFICATIONS.md)
FIX = [
    (r"un gaufre, et ce gaufre,?", "un gouffre. Et ce gouffre,"),
    (r"personne ne t'explique, comment le transférer\.", "personne ne t'explique comment le traverser."),
    (r"Aujourd'hui on le traverse", "Aujourd'hui, on le traverse"),
    (r"ta designation", "ta destination"),
    (r"90 ?%", "90 %"),
    (r"et qui runir tout le reste", "et qui peut ruiner tout le reste"),          # ⚠
    (r"proprement\. Parce que oui, on peut", "proprement. Parce que oui, on peut"),
    (r"tout le monde sautent", "tout le monde saute"),
    (r"question quel pays \?", "question « quel pays ? »"),
    (r"dépend enterrement de ta phrase", "dépend entièrement de ta phase"),
    (r"Dans cette phrase,", "Dans cette phase,"),
    (r"la sécurité\. là tu cherches la stabilité juridique monétaire institutionnelle", "la sécurité. Là, tu cherches la stabilité juridique, monétaire, institutionnelle"),
    (r"Phase 1, la croissance", "Phase 1 : la croissance"),
    (r"Phase 2, la préservation", "Phase 2 : la préservation"),
    (r"plus-values sur titre ", "plus-values sur titres "),
    (r"dans vidéo", "dans cette vidéo"),
    (r"énorme que voie passer", "énorme que je vois passer"),
    (r"tu es ou pas\.", "tu es imposable sur tous tes revenus, rapatriés ou pas."),   # ⚠ mots manquants dans la transcription
    (r"La Thaïlande elle fonctionne", "La Thaïlande, elle, fonctionne"),
    (r"ce que tu ne fais pas entre en Thaïlande", "ce que tu ne fais pas entrer en Thaïlande"),
    (r"Côté budget compte environ 3000 euros", "Côté budget, compte environ 3 000 euros"),
    (r"Dubaï et le Singapour", "Dubaï et Singapour"),
    (r"Dubaï, tu connais 0 impôts", "Dubaï, tu connais : 0 impôt"),
    (r"9 ?%", "9 %"),
    (r"Singapore", "Singapour"),
    (r"sur classe", "surclasse"),
    (r"dont on vous a parlé", "dont on a parlé"),                                 # ⚠
    (r"Je te doute une méthode", "Je te donne une méthode"),
    (r"La règle 10-3-5\. 10,", "La règle 10-3-5. Dix :"),
    (r"en mot touriste", "en mode touriste"),
    (r"Trois, tu testes", "Trois : tu testes"),
    (r"Et cinq, tu fais", "Et cinq : tu fais"),
    (r"quartier des exploites", "quartier des expats"),
    (r"marché\. c'est le test", "marché. C'est le test"),
    (r"brûlisses agricoles", "brûlis agricoles"),
    (r"Dans d'autres obs", "Dans d'autres hubs"),
    (r"permanente et sur-disant ça devient", "permanente, et là, ça devient"),       # ⚠
    (r"la valise Pendant", "la valise unique. Pendant"),
    (r"ce qui te tient dans", "ce qui tient dans"),
    (r"transfert réellement", "transférer réellement"),
    (r"anticiper les exactaxes si tu détiens des parts de participation importantes", "anticiper l'exit tax si tu détiens des participations importantes"),
    (r"tous en boîte", "tout s'emboîte"),
    (r"tes traitements fiscals de tes revenus spécifiques dividendes", "le traitement fiscal de tes revenus spécifiques : dividendes"),
    (r"revenus de sources étrangères", "revenus de source étrangère"),
    (r"ne remplacera jamais", "ne remplaceront jamais"),
    (r"Etage 5", "Étape 5."),
    (r"qui souffre", "qui s'ouvre"),
    (r"parce qu'elle mérite l'erreur", "parce qu'elle évite l'erreur"),           # ⚠
    (r"pièges à étranger \?", "pièges à étrangers ?"),
    (r"Loup observe, apprend,", "Loue, observe, apprends."),
    (r"la pierre locale, c'est", "La pierre locale, c'est"),
    (r"placements spécial expatriés", "placements « spécial expatriés »"),
    (r"mirabolant", "mirobolant"),
    (r"valie sur le terrain", "valide sur le terrain"),
    (r"la règle 10, 3 et 5", "la règle 10-3-5"),
    (r"C'est le cœur du réacteur 5,", "C'est le cœur du réacteur. Cinq,"),
    (r"nouveau cal,", "nouveau cadre,"),                                         # ⚠
    (r"ce n'est pas fouir", "ce n'est pas fuir"),
    (r"ce qui improvise le pays", "Ceux qui improvisent le paient"),
    (r"ce qui structure en récolte", "ceux qui structurent en récoltent"),
    (r"avec ton équipe", "avec mon équipe"),
    (r"la feuille route", "la feuille de route"),
    (r"Ciao!", "Ciao !"),
    (r"\bUn, clarifie ta phase", "Un : clarifie ta phase"),
    (r"Deux, choisis", "Deux : choisis"), (r"Trois, valide", "Trois : valide"), (r"Quatre, sors", "Quatre : sors"),
    (r"Cinq, reconstruis", "Cinq : reconstruis"),
    (r"tu fais rien", "tu ne fais rien"),
    (r"accumulent un passif fiscal", "accumulent en réalité un passif fiscal"),
    (r"^quitter la France physiquement", "Quitter la France physiquement"),
    (r"tu compars", "tu compares"),
    (r"Tu y penses peut-être depuis des mois, peut-être depuis des années, quitter la France, et",
     "Tu y penses peut-être depuis des mois, peut-être depuis des années : quitter la France. Et"),
]
HIGHLIGHT = [r"\b\d[\d  ]*(?: ?%| ?€| euros| jours| km| ans)?", r"10-3-5", r"exit tax", r"résidence fiscale",
             r"fiscalement", r"centre de vie"]
PAPER = {'SPLIT', 'chapter', 'recap'}    # fonds ivoire -> texte encre

def load_words():
    return json.load(open(os.path.join(HERE, 'words_flat.json')))

def stream(words, t0, t1, mapper):
    """Caractères (c, ts, te) des mots dont le milieu est gardé, en temps de sortie."""
    out = []
    for w in words:
        mid = (w['s'] + w['e']) / 2
        if not (t0 <= mid < t1): continue
        # point gardé le plus proche du milieu du mot (un mot « étiré » peut chevaucher une coupe de silence)
        o = None
        for k in range(0, 41):
            for sg in (1, -1):
                tt = mid + sg * k * (w['e'] - w['s']) / 80
                if w['s'] <= tt <= w['e'] and mapper(tt) is not None: o = mapper(tt); mid = tt; break
            if o is not None: break
        if o is None: continue
        ds = o - mid
        ts, te = w['s'] + ds, w['e'] + ds
        raw = w['w'] if (w['w'].startswith(' ') or w['w'][:1] in "'-,.?!") else ' ' + w['w']
        if not out: raw = raw.lstrip()
        n = len(raw)
        for i, ch in enumerate(raw): out.append([ch, ts + (te - ts) * i / n, ts + (te - ts) * (i + 1) / n])
    return out

def apply_fixes(chars):
    for pat, rep in FIX:
        while True:
            txt = ''.join(c[0] for c in chars)
            m = re.search(pat, txt)
            if not m or txt[m.start():m.end()] == rep: break
            i, j = m.start(), m.end()
            ts, te = chars[i][1], chars[j - 1][2]
            new = [[ch, ts + (te - ts) * k / len(rep), ts + (te - ts) * (k + 1) / len(rep)] for k, ch in enumerate(rep)]
            chars = chars[:i] + new + chars[j:]
            if rep.find(re.sub(r'\\.', '', pat)) >= 0: break
    return chars

def words_of(chars):
    ws, cur = [], []
    for c in chars:
        if c[0] == ' ':
            if cur: ws.append(cur); cur = []
        else: cur.append(c)
    if cur: ws.append(cur)
    return [dict(t=''.join(c[0] for c in w), s=w[0][1], e=w[-1][2]) for w in ws]

def make_cues(ws, maxlen=76):
    cues, cur = [], []
    def flush():
        if cur: cues.append(dict(text=' '.join(w['t'] for w in cur), s=cur[0]['s'], e=cur[-1]['e']))
    for i, w in enumerate(ws):
        rest = 0
        for x in ws[i:]:
            rest += len(x['t']) + 1
            if x['t'][-1] in '.?!': break
        cur_len = len(' '.join(x['t'] for x in cur))
        too_long = cur_len + len(w['t']) + 1 > maxlen and not (cur_len + rest <= 90)
        if cur and (w['s'] - cur[-1]['e'] > 0.9 or too_long):
            # couper de préférence après une virgule
            txt = [x['t'] for x in cur]
            k = max([j for j, t in enumerate(txt[:-1]) if t.endswith(',')] or [-1])
            if k >= 2 and len(' '.join(txt[k+1:] + [w['t']])) < maxlen:
                keep, cur = cur[:k+1], cur[k+1:]
                cues.append(dict(text=' '.join(x['t'] for x in keep), s=keep[0]['s'], e=keep[-1]['e']))
            else:
                flush(); cur = []
        cur.append(w)
        if w['t'][-1] in '.?!' and not w['t'].endswith('...'):
            if len(' '.join(x['t'] for x in cur)) >= 12 or (i + 1 < len(ws) and ws[i+1]['s'] - w['e'] > 0.5):
                flush(); cur = []
    flush()
    # durées : min 1,0 s, fin = fin du dernier mot + 0,25 s, sans chevauchement
    for i, c in enumerate(cues):
        nxt = cues[i+1]['s'] if i + 1 < len(cues) else c['e'] + 2
        c['e'] = min(max(c['e'] + 0.25, c['s'] + 1.0), nxt - 0.04)
    return cues

def two_lines(t, maxl=40):
    if len(t) <= maxl: return [t]
    sp = [i for i, ch in enumerate(t) if ch == ' ']
    weak = {'de', 'la', 'le', 'les', 'à', 'et', 'un', 'une', 'des', 'du', 'ta', 'ton', 'tes', 'en', 'au', 'sur', 'pas', 'ne', 'que', 'qui', 'pour', 'avec', 'dans', "l'", "d'"}
    def score(i):
        prev = t[:i].split(' ')[-1].lower()
        return abs(i - len(t) / 2) - (14 if t[i-1] in ',:;.?!' else 0) + (12 if prev in weak else 0)
    best = min(sp, key=score)
    return [t[:best], t[best+1:]]

def nbsp(t):
    t = re.sub(r" ([:;?!»%€])", " \\1", t); t = t.replace("« ", "« ")
    return t

def build():
    words = load_words()
    cold = [c for c in CLIPS if c.get('cold')][0]
    cmap = lambda t: (cold['o_f'] + t * FPS - cold['s_f']) / FPS if cold['s_f'] <= t * FPS < cold['e_f'] else None
    from plan import src2out
    ch = apply_fixes(stream(words, *COLD_OPEN, cmap))
    body = apply_fixes(stream(words, 58.0, 900, lambda t: src2out(t, CLIPS)))
    cues = make_cues(words_of(ch)) + make_cues(words_of(body))
    for c in cues: c['text'] = nbsp(c['text'])
    return cues

def ts_srt(t):
    ms = int(round(t * 1000)); return f"{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}"
def ts_ass(t):
    cs = int(round(t * 100)); return f"{cs//360000}:{cs//6000%60:02d}:{cs//100%60:02d}.{cs%100:02d}"

def bg_at(t, man):
    for g in man:
        if g['start'] <= t < g['end']:
            tpl = next(x['tpl'] for x in G if x['id'] == g['id'])
            if g['kind'] == 'SPLIT' or tpl in PAPER: return 'Paper'
    return 'Main'

def write(cues):
    man = json.load(open(os.path.join(HERE, 'build', 'gfx_manifest.json')))
    with open(os.path.join(HERE, 'build', 'sous-titres_FR.srt'), 'w') as f:
        for i, c in enumerate(cues, 1):
            f.write(f"{i}\n{ts_srt(c['s'])} --> {ts_srt(c['e'])}\n" + '\n'.join(two_lines(c['text'])) + "\n\n")
    hl = re.compile('|'.join(f'(?:{h})' for h in HIGHLIGHT))
    head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Main,Inter SemiBold,50,&H00F5F5F5,&H00FFFFFF,&H50101820,&H78000000,0,0,0,0,100,100,0.3,0,1,2.4,1.2,2,200,200,62,1
Style: Paper,Inter SemiBold,50,&H002B1A0E,&H00FFFFFF,&H00E8EEF5,&H00000000,0,0,0,0,100,100,0.3,0,1,0,0,2,200,200,62,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    gold = {'Main': r'{\c&H8CBFD9&}', 'Paper': r'{\c&H5A95B8&}'}
    with open(os.path.join(HERE, 'build', 'subs.ass'), 'w') as f:
        f.write(head)
        for c in cues:
            st = bg_at((c['s'] + c['e']) / 2, man)
            lines = two_lines(c['text'])
            txt = r'\N'.join(hl.sub(lambda m: gold[st] + m.group(0) + r'{\r}', l) if m_ok(l) else l for l in lines)
            f.write(f"Dialogue: 0,{ts_ass(c['s'])},{ts_ass(c['e'])},{st},,0,0,0,,{{\\fad(90,90)}}{txt}\n")
    return len(cues)

def m_ok(l): return True

if __name__ == '__main__':
    cues = build()
    n = write(cues)
    print(n, 'sous-titres')
    for c in cues[:12] + cues[100:108]: print(f"{c['s']:7.2f}-{c['e']:7.2f} {c['text']}")
