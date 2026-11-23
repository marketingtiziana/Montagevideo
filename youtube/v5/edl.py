"""Edit decision list for video 5 — all times in local seconds (t=0 <=> video 1:00:10)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
START, END = 58.20, 887.75
# retakes / false starts removed (each: (from, to), reason)
DROPS = [
    (156.92, 158.78, "faux départ « Chaque euro de »"),
    (197.40, 202.74, "1re prise « la coût de la vie », hésitante"),
    (279.36, 284.52, "répétition « Sur Instagram, c'est le même mode de vie »"),
    (477.38, 482.78, "« Donc en général, on s'organise » ×2"),
    (798.36, 801.18, "lapsus « Un, clarifie ta phrase »"),
    (842.50, 847.98, "1re prise « Si tu es prêt à passer de l'envie au projet »"),
]
MAX_GAP = 0.42     # longest pause kept inside the edit
HEAD, TAIL = 0.14, 0.20
def silences():
    out=[]
    for l in open(os.path.join(HERE,'silences.txt')):
        a,b=map(float,l.split()); out.append((a,b))
    return out
def build():
    # start with [START,END] minus drops
    segs=[(START,END)]
    for a,b,_ in DROPS:
        n=[]
        for s,e in segs:
            if b<=s or a>=e: n.append((s,e)); continue
            if s<a: n.append((s,a))
            if b<e: n.append((b,e))
        segs=n
    # compress long silences
    for a,b in silences():
        if b-a<=MAX_GAP: continue
        ca, cb = a+TAIL, b-HEAD           # cut region inside the silence
        if cb-ca < 0.12: continue
        n=[]
        for s,e in segs:
            if cb<=s or ca>=e: n.append((s,e)); continue
            if s<ca: n.append((s,ca))
            if cb<e: n.append((cb,e))
        segs=n
    segs=[(round(s,3),round(e,3)) for s,e in segs if e-s>0.25]
    return segs
if __name__=='__main__':
    segs=build()
    tot=sum(e-s for s,e in segs)
    os.makedirs(os.path.join(HERE,'build'),exist_ok=True); json.dump(segs,open(os.path.join(HERE,'build','edl.json'),'w'))
    print(len(segs),'segments, durée',f"{tot//60:.0f}:{tot%60:04.1f}")
    import statistics; print('médiane seg',statistics.median(e-s for s,e in segs))
