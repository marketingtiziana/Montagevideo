# Vérification : aucun sous-titre / card sur les yeux-bouche (boîte visage projetée dans le cadre final)
import json, os, sys, numpy as np, cv2
sys.path.insert(0, os.path.dirname(__file__)); from timemap import d2s
FPS=30; SW,SH=1920,1080; OW,OH=1080,1920
face=json.load(open("src/face.json")); plan=json.load(open("cut/reframe_plan.json"))
ft=np.array([f["t"] for f in face])
def facebox(f):
    ts=d2s(f/FPS); i=int(np.argmin(np.abs(ft-ts))); fc=face[i]; p=plan[f]; sc=OH/p["h"]
    # boîte "yeux-bouche" : de 15 % au-dessus des yeux jusqu'à 12 % sous la bouche, largeur du visage
    x0=(fc["cx"]-fc["w"]/2)*SW; x1=(fc["cx"]+fc["w"]/2)*SW
    y0=fc["ey"]*SH-0.15*fc["h"]*SH; y1=fc["mouth_y"]*SH+0.12*fc["h"]*SH
    return [int((x0-p["x0"])*sc), int((y0-p["y0"])*sc), int((x1-p["x0"])*sc), int((y1-p["y0"])*sc)]
N=len(plan); bad=[]; maxcov=0; chk=0
for f in range(0,N,3):
    p=f"cut/front/f{f:05d}.png"
    if not os.path.exists(p): continue
    im=cv2.imread(p,cv2.IMREAD_UNCHANGED); a=im[...,3]
    x0,y0,x1,y1=facebox(f); x0,y0=max(0,x0),max(0,y0); x1,y1=min(OW,x1),min(OH,y1)
    cov=(a[y0:y1,x0:x1]>40).mean() if (y1>y0 and x1>x0) else 0; chk+=1
    maxcov=max(maxcov,cov)
    if cov>0.002: bad.append((f,round(f/FPS,2),round(float(cov),4)))
print("frames vérifiées",chk,"couverture max du visage par l'overlay",round(float(maxcov),4))
print("frames problématiques",bad[:20])
