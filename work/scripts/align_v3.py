# v3 : sous-titres 1-2 mots, mots forts seuls (plein écran), couleur par sens.
import json, re, difflib, unicodedata, sys, os, math
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
# classes de couleur par sens (sur forme normalisée)
MONEY={"25000$":"yellow","zero":"green","millions":"yellow","dollars":"yellow","chiffre":"green","chiffres":"green","revenu":"green","daffaires":"green","bancaire":"green","compte":"green"}
DANGER={"non","pas","aucune","rien","erreur","penalite","defaut","surprendre","probleme","dormir","piege"}
PLACE={"americaine","americaines","francophones","residence","etatsunis"}
def norm(w):
    w=unicodedata.normalize("NFD",w.lower()); w="".join(c for c in w if unicodedata.category(c)!="Mn")
    return re.sub(r"[^a-z0-9$]","",w)
def color_of(n):
    if n in MONEY: return MONEY[n]
    if n in DANGER: return "coral"
    if n in PLACE: return "violet"
    return "blue"
toks=[]
for raw in re.split(r"[ \n]+", SCRIPT.replace("25 000 $","25 000 $").strip()):
    key="*" in raw; txt=raw.replace("*",""); n=norm(txt)
    toks.append({"w":txt,"key":key,"n":n,"color":color_of(n)})
wj=json.load(open("cut/words_cut.json"))["words"]
ww=[]
for w in wj:
    t=w["w"]
    if ww and (t.startswith("'") or t.startswith("’")):
        ww[-1]["w"]+=t; ww[-1]["e"]=w["e"]; ww[-1]["n"]=norm(ww[-1]["w"]); continue
    ww.append({"w":t,"s":w["s"],"e":w["e"],"n":norm(t)})
A=[t["n"] for t in toks]; B=[w["n"] for w in ww]
sm=difflib.SequenceMatcher(a=A,b=B,autojunk=False)
aligned=[None]*len(toks)
for tag,i1,i2,j1,j2 in sm.get_opcodes():
    if tag=="equal":
        for k in range(i2-i1): aligned[i1+k]=(ww[j1+k]["s"],ww[j1+k]["e"])
    elif tag=="replace":
        s0=ww[j1]["s"]; e0=ww[j2-1]["e"]; n=i2-i1
        for k in range(n): aligned[i1+k]=(s0+(e0-s0)*k/n, s0+(e0-s0)*(k+1)/n)
for i,t in enumerate(toks):
    if aligned[i] is None:
        p=next((aligned[j] for j in range(i-1,-1,-1) if aligned[j]),(0,0)); q=next((aligned[j] for j in range(i+1,len(toks)) if aligned[j]),(p[1],p[1]+0.3))
        aligned[i]=(p[1],max(p[1]+0.05,q[0]))
for i,t in enumerate(toks): t["s"],t["e"]=round(aligned[i][0],3),round(aligned[i][1],3)
for i in range(1,len(toks)):
    if toks[i]["s"]<toks[i-1]["s"]: toks[i]["s"]=toks[i-1]["e"]
    if toks[i]["e"]<=toks[i]["s"]: toks[i]["e"]=toks[i]["s"]+0.08
# ---- groupes : mot fort seul (solo) ; sinon paires (2 mots) sans franchir une ponctuation forte ni une pause > 0.45 s
groups=[]; i=0
while i<len(toks):
    t=toks[i]
    if t["key"]: groups.append({"solo":True,"words":[t]}); i+=1; continue
    nxt=toks[i+1] if i+1<len(toks) else None
    endp=re.search(r"[.?!,:;]$",t["w"]) is not None
    if nxt and not nxt["key"] and not endp and (nxt["s"]-t["e"])<0.45:
        groups.append({"solo":False,"words":[t,nxt]}); i+=2
    else:
        groups.append({"solo":False,"words":[t]}); i+=1
out=[]
for gi,g in enumerate(groups):
    ws=g["words"]; start=max(0,ws[0]["s"]-0.05)
    nxt=groups[gi+1]["words"][0]["s"]-0.05 if gi+1<len(groups) else ws[-1]["e"]+0.4
    end=min(ws[-1]["e"]+0.30, nxt) if nxt>start+0.15 else nxt
    out.append({"start":round(start,3),"end":round(end,3),"solo":g["solo"],"words":[{"w":w["w"],"s":w["s"],"e":w["e"],"key":w["key"],"color":w["color"]} for w in ws]})
json.dump(out,open("cut/groups.json","w"),ensure_ascii=False,indent=1)
print("groupes",len(out),"solo",sum(1 for g in out if g["solo"]))
print(" | ".join(("["+g["words"][0]["w"]+"]") if g["solo"] else " ".join(w["w"] for w in g["words"]) for g in out)[:1500])
