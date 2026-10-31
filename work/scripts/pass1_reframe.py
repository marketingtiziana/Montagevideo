# Passe 1 : lecture du montage 1920x1080 30 fps, recadrage 9:16 centré visage (yeux dans le tiers supérieur),
# échelle par plan + micro-zoom continu, étalonnage léger, sortie base.mp4 1080x1920.
import subprocess, json, os, sys, numpy as np, cv2
sys.path.insert(0, os.path.dirname(__file__)); from edl import quantize, FPS; from shots_v3 import SHOTS, SHAKES, WHIPS
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
# shakes / whips : table par frame -> (dx, blur)
import random; random.seed(7)
fx_frames={}
for (ts,nf,amp) in SHAKES:
    f0=next((int(round(s["dst_in"]*FPS))+int((ts-s["src_in"])*FPS) for s in segs if s["src_in"]<=ts<=s["src_out"]),None)
    if f0 is None: continue
    for k in range(nf): fx_frames[f0+k]=(random.choice([-1,1])*amp*(1-k/nf), random.choice([-1,1])*amp*0.6*(1-k/nf), 0)
for w in WHIPS:
    s=next(x for x in segs if x["label"]==w["at_label"]); fc=int(round(s["dst_in"]*FPS))
    for k in range(1,w["frames_before"]+1): u=k/w["frames_before"]; fx_frames[fc-k]=(w["dir"]*-260*(1-u+0.2), 0, int(30+60*(1-u)))
    for k in range(w["frames_after"]): u=k/max(1,w["frames_after"]); fx_frames[fc+k]=(w["dir"]*260*(1-u), 0, int(70*(1-u)))
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
        dx,dy,bl=fx_frames[i]
        out=cv2.warpAffine(out,np.array([[1,0,dx],[0,1,dy]],np.float32),(OW,OH),borderMode=cv2.BORDER_REPLICATE)
        if bl>0: out=cv2.blur(out,(bl,1))   # flou de mouvement horizontal (whip)
    enc.stdin.write(out.tobytes()); i+=1
enc.stdin.close(); enc.wait(); dec.wait()
print("frames",i,"expected",N)
