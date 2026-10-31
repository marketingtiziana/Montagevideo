# Plan des cards (devant) et des effets derrière, en temps SOURCE ; exporté en temps final.
import json, os, sys; sys.path.insert(0, os.path.dirname(__file__)); from timemap import s2d, SEGS
NBSP=" "
CARDS=[  # start/end en temps source
 dict(type="pill", text="0 $ de chiffre d'affaires", html=f'<span class="mono">0{NBSP}$</span> de chiffre d’affaires', anchor="right", x=1056, y=250, start=11.55, end=13.9),
 dict(type="title", label="États-Unis", text="Obligations déclaratives", anchor="left", x=24, y=250, start=22.1, end=26.4),
 dict(type="list", label="Le parcours classique", rows=[dict(text="Création de la LLC",t=45.0),dict(text="Compte bancaire",t=47.4),dict(text="Activité lancée",t=48.6)], anchor="left", x=30, y=1060, start=44.85, end=51.2),
 dict(type="pill", text="Rien à déclarer ?", anchor="right", x=1056, y=250, start=53.75, end=54.85),
 dict(type="title", label="Même sans revenu", text="Déclarations obligatoires", anchor="right", x=1056, y=250, start=63.8, end=66.85),
 dict(type="amount", label="Défaut de déclaration", value=f"25{NBSP}000{NBSP}$", sub="de pénalité possible", anchor="left", x=24, y=250, start=68.0, end=72.55),
 dict(type="list", label="Ça dépend de", numbered=True, rows=[dict(text="Type de LLC",t=80.7),dict(text="Associés",t=82.1),dict(text="Résidence fiscale",t=83.3),dict(text="Structure",t=85.5)], anchor="left", x=30, y=1035, start=80.5, end=87.15),
 dict(type="pill", text="Vérifie tes obligations", anchor="left", x=24, y=250, start=94.6, end=96.25),
 dict(type="pill", text="Vidéo complète en DM", anchor="right", x=1056, y=250, start=99.9, end=103.2),
 dict(type="pill", text="Commente « LLC »", html='Commente <span class="mono">LLC</span>', anchor="left", x=24, y=250, start=117.7, end=120.5),
]
BEHIND=[
 dict(kind="mono", text=f"25{NBSP}000{NBSP}$", y=190, size=330, x0=160, x1=-520, start=9.55, end=12.75, sfx="impact"),
 dict(kind="outline", text="ERREUR", y=150, size=400, x0=120, x1=-1320, start=57.35, end=59.45, sfx="impact"),
 dict(kind="outline", text="LLC", y=200, size=520, x0=90, x1=-110, scale=[0.9,1.08], start=118.45, end=120.5, sfx="impact"),
]
def conv(items):
    out=[]
    for it in items:
        d=dict(it); a=s2d(it["start"]); b=s2d(it["end"])
        if b is None:  # fin légèrement au-delà de la plage quantifiée : on cale sur la fin du segment
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
    for c in data["cards"]: print("card",c["type"],c["start"],c["end"],c.get("text",c.get("value")))
    for b in data["behind"]: print("behind",b["text"],b["start"],b["end"])
