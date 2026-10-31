# Aligne le script corrigé (texte final des sous-titres) sur les mots Whisper de la timeline finale,
# puis découpe en groupes de 2-4 mots (karaoké). Mots-clés marqués *ainsi* dans le script.
import json, re, difflib, unicodedata, sys, os
FPS=30
SCRIPT = """Tu savais qu'une *LLC* américaine peut te coûter *25 000 $* alors que tu payes *zéro* de chiffre d'affaires ?
Et *non*, je ne te parle *pas* d'une LLC qui génère des *millions* de dollars.
Même si ta LLC n'a réalisé *aucune* vente, certaines *obligations* déclaratives américaines peuvent quand même s'appliquer,
selon la structure, les propriétaires et la situation de l'entreprise.
Et c'est précisément là que *beaucoup* d'entrepreneurs francophones se font *surprendre*.
Ils créent leur *LLC*, ouvrent leur compte *bancaire*, commencent leur *activité*,
puis pensent que, comme ils n'ont *pas* encore fait de chiffre, ils n'ont *rien* à déclarer.
*Erreur*, *erreur*.
Certaines *déclarations* doivent être déposées même lorsqu'il n'y a *pas* de revenu.
Et une *pénalité* peut s'appliquer en cas de *défaut* de déclaration.
Le *problème*, c'est que savoir si tu es *concerné* dépend de plusieurs éléments.
Le *type* de LLC, tes *associés*, leur *résidence* fiscale et la manière dont la société est *structurée*.
Donc avant de laisser ta LLC *dormir* pendant que tout va bien, *vérifie* tes *obligations*.
J'ai justement préparé une *vidéo* qui t'explique quelles obligations peuvent déclencher cette *pénalité*,
qui est *concerné* et ce qui doit être *vérifié* pour ta LLC.
Si tu veux recevoir la vidéo directement en *DM*, commente simplement *LLC* sous cette vidéo."""
def norm(w):
    w=unicodedata.normalize("NFD",w.lower()); w="".join(c for c in w if unicodedata.category(c)!="Mn")
    return re.sub(r"[^a-z0-9]","",w)
# tokens du script : on sépare sur espaces ; "25 000 $" est un seul token (espace insécable)
toks=[]
for raw in re.split(r"[ \n]+", SCRIPT.replace("25 000 $","25 000 $").strip()):
    key=raw.startswith("*") or raw.endswith("*") or "*" in raw
    txt=raw.replace("*","")
    toks.append({"w":txt,"key":key,"n":norm(txt)})
# tokens whisper : fusion des apostrophes ("qu" + "'une" -> "qu'une"), split des nombres si besoin
wj=json.load(open("cut/words_cut.json"))["words"]
ww=[]
for w in wj:
    t=w["w"]
    if ww and (t.startswith("'") or t.startswith("’")):
        ww[-1]["w"]+=t; ww[-1]["e"]=w["e"]; ww[-1]["n"]=norm(ww[-1]["w"]); continue
    ww.append({"w":t,"s":w["s"],"e":w["e"],"n":norm(t)})
# sous-normalisation pour l'alignement : "25" "000" "dollars" ~ "25000$"
A=[t["n"] for t in toks]; B=[w["n"] for w in ww]
sm=difflib.SequenceMatcher(a=A,b=B,autojunk=False)
aligned=[None]*len(toks)
for tag,i1,i2,j1,j2 in sm.get_opcodes():
    if tag!="equal": print("ALIGN",tag,[t["w"] for t in toks[i1:i2]],[w["w"] for w in ww[j1:j2]])
    if tag=="equal":
        for k in range(i2-i1): aligned[i1+k]=(ww[j1+k]["s"],ww[j1+k]["e"])
    elif tag in ("replace",):
        # répartition proportionnelle des mots whisper remplacés sur les tokens du script
        s0=ww[j1]["s"]; e0=ww[j2-1]["e"]; n=i2-i1
        for k in range(n): aligned[i1+k]=(s0+(e0-s0)*k/n, s0+(e0-s0)*(k+1)/n)
    elif tag=="delete":  # tokens script sans mot whisper : on les intercale entre voisins
        pass
    elif tag=="insert": pass
# combler les trous : interpoler entre voisins alignés
for i,t in enumerate(toks):
    if aligned[i] is None:
        p=next((aligned[j] for j in range(i-1,-1,-1) if aligned[j]),(0,0)); q=next((aligned[j] for j in range(i+1,len(toks)) if aligned[j]),(p[1],p[1]+0.3))
        aligned[i]=(p[1],max(p[1]+0.05,q[0]))
for i,t in enumerate(toks): t["s"],t["e"]=round(aligned[i][0],3),round(aligned[i][1],3)
# vérification monotone
for i in range(1,len(toks)):
    if toks[i]["s"]<toks[i-1]["s"]: toks[i]["s"]=toks[i-1]["e"]
    if toks[i]["e"]<=toks[i]["s"]: toks[i]["e"]=toks[i]["s"]+0.08
# ---- groupes de 2-4 mots : phrases (ponctuation / pause > 0.5 s), puis paquets qui tiennent sur <= 2 lignes de 960 px
import math
from PIL import ImageFont
_font=ImageFont.truetype("fonts/Inter-Variable.ttf",72)
try: _font.set_variation_by_axes([800])
except Exception: pass
GAP=36; MAXW=960
def wwidth(t): return _font.getlength(t["w"])*(1.12 if t["key"] else 1.0)+14  # +stroke
def nlines(ws):
    lines=1; cur=0
    for t in ws:
        w=wwidth(t)
        if cur==0: cur=w
        elif cur+GAP+w<=MAXW: cur+=GAP+w
        else: lines+=1; cur=w
    return lines
phrases=[]; cur=[]
for i,t in enumerate(toks):
    cur.append(t)
    nxt=toks[i+1] if i+1<len(toks) else None
    endp=re.search(r"[.?!,:;]$",t["w"]) is not None
    gap=(nxt["s"]-t["e"]) if nxt else 9
    if endp or gap>0.5 or nxt is None: phrases.append(cur); cur=[]
ph=[]
for p_ in phrases:
    if len(p_)==1 and ph and not re.search(r"[.?!]$",ph[-1][-1]["w"]) and (p_[0]["s"]-ph[-1][-1]["e"])<0.5: ph[-1].extend(p_)
    else: ph.append(p_)
def split_phrase(p_):
    # nombre minimal de paquets k tel qu'un découpage équilibré tienne (<=4 mots, <=2 lignes)
    n=len(p_)
    for k in range(math.ceil(n/4), n+1):
        base=n//k; extra=n%k; i=0; parts=[]
        for c in range(k):
            sz=base+(1 if c<extra else 0); parts.append(p_[i:i+sz]); i+=sz
        if all(nlines(g)<=2 for g in parts): return parts
    return [[t] for t in p_]
groups=[]
for p_ in ph: groups.extend(split_phrase(p_))
# fusion des orphelins (1 mot) avec le voisin précédent si ça tient
merged=[]
for g in groups:
    if len(g)==1 and merged and len(merged[-1])<4 and nlines(merged[-1]+g)<=2 and not re.search(r"[.?!]$",merged[-1][-1]["w"]): merged[-1].extend(g)
    else: merged.append(g)
groups=merged
out=[]
for gi,g in enumerate(groups):
    start=max(0,g[0]["s"]-0.06)
    nxt=groups[gi+1][0]["s"]-0.06 if gi+1<len(groups) else g[-1]["e"]+0.4
    end=min(g[-1]["e"]+0.35, nxt) if nxt>start+0.2 else nxt
    # strip ponctuation faible affichée ? on garde la ponctuation (lisibilité)
    out.append({"start":round(start,3),"end":round(end,3),"words":[{"w":w["w"],"s":w["s"],"e":w["e"],"key":w["key"]} for w in g]})
json.dump(out,open("cut/groups.json","w"),ensure_ascii=False,indent=1)
for g in out: print(f"{g['start']:7.2f}-{g['end']:7.2f} ", " ".join(("*"+w['w']+"*") if w['key'] else w['w'] for w in g['words']))
print("groups",len(out),"max words",max(len(g["words"]) for g in out))
