# Passe 1 : lecture du montage 1920x1080 30 fps, recadrage 9:16 centré visage (yeux dans le tiers supérieur),
# échelle par plan + micro-zoom continu, étalonnage léger, sortie base.mp4 1080x1920.
import subprocess, json, os, sys, numpy as np, cv2
sys.path.insert(0, os.path.dirname(__file__)); from edl import quantize, FPS; from shots_v3 import SHOTS, SHAKES, TRANSITIONS
segs=quantize(); face=json.load(open("src/face.json"))
SW,SH=1920,1080; OW,OH=1080,1920
ft=np.array([f["t"] for f in face]); fcx=np.array([f["cx"] for f in face])*SW; fey=np.array([f["ey"] for f in face])*SH
def ease(x): return x*x*(3-2*x)
# centre horizontal et hauteur des yeux : moyenne par plan (caméra fixe, évite le jitter)
for s in segs:
    m=(ft>=s["src_in"])&(ft<=s["src_out"])
    s["cx"]=float(np.median(fcx[m])) if m.any() else SW/2
    s["ey"]=float(np.median(fey[m])) if m.any() else 0.26*SH
    s["z0"],s["z1"]=SHOTS[s["label"]]
N=segs[-1]["frames"]+int(round(segs[-1]["dst_in"]*FPS))
plan=[]  # par frame : (zoom, x0, y0, w, h) crop source
k=0
for s in segs:
    for i in range(s["frames"]):
        u=i/max(1,s["frames"]-1); z=s["z0"]+(s["z1"]-s["z0"])*u  # dérive linéaire (lente)
        h=SH/z; w=h*9/16
        x0=min(max(s["cx"]-w/2,0),SW-w); y0=min(max(s["ey"]-h/3,0),SH-h)
        plan.append((z,x0,y0,w,h)); k+=1
json.dump([{"f":i,"z":round(p[0],4),"x0":round(p[1],2),"y0":round(p[2],2),"w":round(p[3],2),"h":round(p[4],2)} for i,p in enumerate(plan)], open("cut/reframe_plan.json","w"))
dec=subprocess.Popen(["ffmpeg","-v","error","-i","cut/cut_1080p.mp4","-f","rawvideo","-pix_fmt","bgr24","-"],stdout=subprocess.PIPE,bufsize=10**8)
enc=subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","bgr24","-s",f"{OW}x{OH}","-r",str(FPS),"-i","-",
    "-vf","eq=contrast=1.05:saturation=1.04","-c:v","libx264","-preset","medium","-crf","10","-pix_fmt","yuv420p","cut/base.mp4"],stdin=subprocess.PIPE)
# shakes / transitions : table par frame -> (dx, dy, blur, zoom) ; jamais dans une plage détourée (masques calculés sur la base nue)
import random, json as _json; random.seed(7)
_fx=_json.load(open("cut/fx.json")); _beh=[(int(round(b["start"]*FPS))-2, int(round(b["end"]*FPS))+2) for b in _fx["behind"]]
def _masked(f): return any(a<=f<b for a,b in _beh)
fx_frames={}
def _set(f,v):
    if 0<=f<N and not _masked(f): fx_frames[f]=v
for (ts,nf,amp) in SHAKES:
    f0=next((int(round(s["dst_in"]*FPS))+int((ts-s["src_in"])*FPS) for s in segs if s["src_in"]<=ts<=s["src_out"]),None)
    if f0 is None: continue
    for k in range(nf): _set(f0+k,(random.choice([-1,1])*amp*(1-k/nf), random.choice([-1,1])*amp*0.6*(1-k/nf), 0, 1.0))
for t in TRANSITIONS:
    s=next(x for x in segs if x["label"]==t["at_label"]); fc=int(round(s["dst_in"]*FPS))
    if t["kind"]=="whip":
        for k in range(1,t["before"]+1): u=k/t["before"]; _set(fc-k,(t["dir"]*-260*(1-u+0.2), 0, int(30+60*(1-u)), 1.0))
        for k in range(t["after"]): u=k/max(1,t["after"]); _set(fc+k,(t["dir"]*260*(1-u), 0, int(70*(1-u)), 1.0))
    else:  # zoom-punch : zoom avant progressif avant le cut, gros zoom qui se résorbe après
        for k in range(1,t["before"]+1): u=k/t["before"]; _set(fc-k,(0,0,0, 1.0+0.10*(1-u)))
        for k in range(t["after"]): u=k/max(1,t["after"]); _set(fc+k,(0,0, int(6*(1-u)), 1.0+0.22*(1-u)**1.5))
print("fx frames",sorted(fx_frames)[:40])
fsz=SW*SH*3; i=0
while True:
    buf=dec.stdout.read(fsz)
    if len(buf)<fsz: break
    fr=np.frombuffer(buf,np.uint8).reshape(SH,SW,3)
    z,x0,y0,w,h=plan[i]
    # recadrage sous-pixel : warpAffine (translation+échelle) avec Lanczos
    sc=OH/h; M=np.array([[sc,0,-x0*sc],[0,sc,-y0*sc]],np.float32)
    out=cv2.warpAffine(fr,M,(OW,OH),flags=cv2.INTER_LANCZOS4,borderMode=cv2.BORDER_REPLICATE)
    if i in fx_frames:
        dx,dy,bl,zz=fx_frames[i]
        M2=np.array([[zz,0,dx+OW/2*(1-zz)],[0,zz,dy+OH*0.3*(1-zz)]],np.float32)   # zoom centré sur le visage (30 % de hauteur)
        out=cv2.warpAffine(out,M2,(OW,OH),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
        if bl>0: out=cv2.blur(out,(bl,1)) if zz==1.0 else cv2.blur(out,(bl,bl))   # flou horizontal (whip) ou doux (zoom)
    enc.stdin.write(out.tobytes()); i+=1
enc.stdin.close(); enc.wait(); dec.wait()
print("frames",i,"expected",N)
