# Plan v3 : éléments DEVANT (toutes les 3-5 s) + 8 moments DERRIÈRE (mots géants, montant, b-rolls), temps SOURCE -> timeline finale
import json, os, sys; sys.path.insert(0, os.path.dirname(__file__)); from timemap import s2d, SEGS
NB=" "
L,R=24,1056
CARDS=[
 dict(type="pill", color="violet", text="LLC américaine", anchor="right", x=R, y=250, start=7.45, end=9.4),
 dict(type="pill", color="yellow", html=f'<span class="mono">0{NB}$</span> de chiffre d’affaires', text="0 $ de CA", anchor="right", x=R, y=250, start=11.55, end=13.9),
 dict(type="pill", color="coral", text="Pas des millions", anchor="left", x=L, y=250, start=14.6, end=16.6),
 dict(type="pill", color="coral", text="Aucune vente", anchor="right", x=R, y=250, start=19.4, end=21.4),
 dict(type="title", color="blue", label="États-Unis", text="Obligations déclaratives", anchor="left", x=L, y=250, start=22.1, end=25.3),
 dict(type="list", color="violet", label="Selon", rows=[dict(text="La structure",t=26.5),dict(text="Les propriétaires",t=27.9),dict(text="La situation",t=29.5)], anchor="left", x=30, y=1060, start=26.3, end=31.6),
 dict(type="pill", color="coral", text="Le piège", anchor="right", x=R, y=250, start=36.3, end=38.3),
 dict(type="pill", color="violet", text="Entrepreneurs francophones", anchor="left", x=L, y=250, start=38.6, end=41.6),
 dict(type="list", color="green", label="Le parcours classique", rows=[dict(text="Création de la LLC",t=45.0),dict(text="Compte bancaire",t=47.4),dict(text="Activité lancée",t=48.6)], anchor="left", x=30, y=1060, start=44.85, end=51.2),
 dict(type="pill", color="yellow", html=f'<span class="mono">0</span> chiffre', text="0 chiffre", anchor="right", x=R, y=250, start=52.4, end=53.6),
 dict(type="pill", color="coral", text="Rien à déclarer ?", anchor="left", x=L, y=250, start=53.75, end=54.85),
 dict(type="title", color="green", label="Même sans revenu", text="Déclarations obligatoires", anchor="right", x=R, y=250, start=63.8, end=66.85),
 dict(type="amount", color="yellow", label="Défaut de déclaration", value=f"25{NB}000{NB}$", sub="de pénalité possible", anchor="left", x=L, y=250, start=68.0, end=72.5),
 dict(type="ring", color="coral", x=30, y=240, w=230, h=200, start=68.9, end=70.6),
 dict(type="pill", color="coral", text="Le problème", anchor="right", x=R, y=250, start=75.1, end=77.0),
 dict(type="pill", color="blue", text="Es-tu concerné ?", anchor="left", x=L, y=250, start=78.0, end=80.2),
 dict(type="list", color="blue", label="Ça dépend de", numbered=True, rows=[dict(text="Type de LLC",t=80.7),dict(text="Associés",t=82.1),dict(text="Résidence fiscale",t=83.3),dict(text="Structure",t=85.5)], anchor="left", x=30, y=1035, start=80.5, end=87.1),
 dict(type="pill", color="violet", text="LLC qui dort", anchor="right", x=R, y=250, start=90.9, end=93.5),
 dict(type="pill", color="green", text="Vérifie tes obligations", anchor="left", x=L, y=250, start=94.6, end=96.25),
 dict(type="arrow", color="yellow", x=420, y=250, dir="left", start=94.75, end=96.25),
 dict(type="pill", color="green", text="Vidéo complète en DM", anchor="right", x=R, y=250, start=99.9, end=103.2),
 dict(type="pill", color="coral", text="Pénalité", anchor="left", x=L, y=250, start=103.6, end=105.0),
 dict(type="pill", color="blue", text="Concerné ?", anchor="right", x=R, y=250, start=107.35, end=108.8),
 dict(type="pill", color="yellow", text="À vérifier", anchor="left", x=L, y=250, start=112.6, end=114.9),
 dict(type="pill", color="blue", html='En <span class="mono">DM</span>', text="En DM", anchor="right", x=R, y=250, start=116.3, end=117.6),
 dict(type="pill", color="blue", html='Commente <span class="mono">LLC</span>', text="Commente LLC", anchor="left", x=30, y=1080, start=117.7, end=120.5),
]
BEHIND=[
 dict(kind="broll", file="office-tower", start=7.3, end=9.35),
 dict(kind="mono", color="yellow", text=f"25{NB}000{NB}$", y=190, size=330, x0=160, x1=-520, start=9.55, end=12.75),
 dict(kind="broll", file="euro-banknotes", start=15.3, end=16.7),
 dict(kind="broll", file="signing-document", start=22.0, end=24.6),
 dict(kind="broll", file="world-map", start=38.3, end=41.3),
 dict(kind="outline", color="coral", text="ERREUR", y=150, size=400, x0=120, x1=-1320, start=57.35, end=59.45),
 dict(kind="broll", file="airplane-clouds", start=83.0, end=85.5),
 dict(kind="outline", color="blue", text="LLC", y=60, size=560, x0=60, x1=-100, scale=[0.9,1.08], start=118.45, end=120.5),
]
def conv(items):
    out=[]
    for it in items:
        d=dict(it); a=s2d(it["start"]); b=s2d(it["end"])
        if b is None:
            for sg in SEGS:
                if sg["src_in"]<=it["end"]<=sg["src_out"]+0.05: b=sg["dst_out"]
        assert a is not None and b is not None, ("hors plage conservée", it)
        d["start"]=round(a,3); d["end"]=round(b,3)
        if "rows" in d: d["rows"]=[dict(r, t=round(s2d(r["t"]),3)) for r in d["rows"]]
        out.append(d)
    return out
if __name__=="__main__":
    data={"duration":SEGS[-1]["dst_out"],"cards":conv(CARDS),"behind":conv(BEHIND)}
    json.dump(data,open("cut/fx.json","w"),ensure_ascii=False,indent=1)
    ev=sorted([c["start"] for c in data["cards"]]+[b["start"] for b in data["behind"]])
    gaps=[round(b-a,2) for a,b in zip(ev,ev[1:])]
    print("éléments",len(ev),"écart max entre apparitions (s)",max(gaps), "premier", ev[0], "dernier", ev[-1], "fin", data["duration"])
    for b in data["behind"]: print("behind",b.get("file",b.get("text")),b["start"],b["end"])
