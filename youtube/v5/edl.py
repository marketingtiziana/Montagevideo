"""Edit decision list for video 5 — all times in local seconds (t=0 <=> video 1:00:10)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
START, END = 58.20, 887.75
# retakes / false starts removed (each: (from, to), reason)
DROPS = [
    (153.62, 154.42, "faux départ « ton act… » (V3)"),
    (156.92, 158.78, "faux départ « Chaque euro de »"),
    (172.30, 175.08, "« la… la préservation » (V3)"),
    (197.40, 203.95, "prises hésitantes « la coût de la vie » + silence (V3)"),
    (205.05, 206.56, "faux départ « pour… pour un bénéfice »"),
    (360.05, 361.65, "« Mais il existe » ×2 (V3)"),
    (279.36, 284.52, "répétition « Sur Instagram, c'est le même mode de vie »"),
    (307.38, 310.78, "reprise « accumulent en un passif fiscal et accumule… »"),
    (431.20, 434.18, "faux départ « Trois, tu restes… »"),
    (477.38, 482.78, "« Donc en général, on s'organise » ×2"),
    (661.05, 663.62, "hésitation « dans le… même pays » (à réécouter)"),
    (709.05, 711.62, "hésitation « des… des supports » (à réécouter)"),
    (725.40, 726.98, "reprise après « efficaces » (à réécouter)"),
    (798.36, 801.18, "lapsus « Un, clarifie ta phrase »"),
    (815.60, 817.85, "« C'est le cœur du » ×2 (V3)"),
    (842.50, 847.98, "1re prise « Si tu es prêt à passer de l'envie au projet »"),
    (850.25, 851.28, "« réserve un » ×2 (V3)"),
    (854.75, 859.72, "1re prise « On fait le point de ta situation… »"),
]
# V2 : on ne raccourcit que les vrais silences, et différemment selon qu'on est entre deux phrases ou au milieu
GAP_SENT, KEEP_SENT = 0.45, 0.28      # entre deux phrases : > 0,70 s -> 0,40 s
GAP_MID, KEEP_MID = 0.50, 0.30        # au milieu d'une phrase : > 1,0 s -> 0,55 s
MIN_SEG = 0.7                          # pas de plan plus court que 1,5 s
def silences():
    out=[]
    for l in open(os.path.join(HERE,'silences.txt')):
        a,b=map(float,l.split()); out.append((a,b))
    return out
def words():
    return json.load(open(os.path.join(HERE,'words_flat.json')))
def sentence_end_before(t, W):
    prev=[w for w in W if w['e']<=t+0.05]
    return bool(prev) and prev[-1]['w'].strip()[-1:] in '.?!'
def subtract(segs, a, b):
    n=[]
    for s,e in segs:
        if b<=s or a>=e: n.append((s,e)); continue
        if s<a: n.append((s,a))
        if b<e: n.append((b,e))
    return n
def build():
    W=words()
    segs=[(START,END)]
    for a,b,_ in DROPS: segs=subtract(segs,a,b)
    for a,b in silences():
        sent=sentence_end_before(a,W)
        gap,keep=(GAP_SENT,KEEP_SENT) if sent else (GAP_MID,KEEP_MID)
        if b-a<=gap: continue
        tail=keep*0.45; head=keep-tail
        ca,cb=a+tail,b-head
        if cb-ca<0.12: continue
        trial=subtract(segs,ca,cb)
        # refuser une coupe qui créerait un plan trop court
        if any(e-s<MIN_SEG for s,e in trial if not any(abs(s-x)<1e-6 and abs(e-y)<1e-6 for x,y in segs)): continue
        segs=trial
    return [(round(s,3),round(e,3)) for s,e in segs if e-s>0.25]
if __name__=='__main__':
    segs=build()
    tot=sum(e-s for s,e in segs)
    os.makedirs(os.path.join(HERE,'build'),exist_ok=True); json.dump(segs,open(os.path.join(HERE,'build','edl.json'),'w'))
    print(len(segs),'segments, durée',f"{tot//60:.0f}:{tot%60:04.1f}")
    import statistics; print('médiane seg',statistics.median(e-s for s,e in segs))
