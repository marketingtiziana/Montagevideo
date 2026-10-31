# Passe 3 : base (recadrée) + élément DERRIÈRE (entre fond et Tiziana via masque) + overlay DEVANT (subs + cards),
# fondu d'ouverture 8 images, encodage H.264 CRF 18 + AAC 192k.
# Usage : pass3_composite.py final OUT.mp4   |   pass3_composite.py preview OUTDIR f1 f2 f3 ...
import subprocess, json, os, sys, numpy as np, cv2
FPS=30; OW,OH=1080,1920
fx=json.load(open("cut/fx.json"))
ranges=[(int(round(b["start"]*FPS)), int(round(b["end"]*FPS))) for b in fx["behind"]]
def in_behind(f): return any(a<=f<b for a,b in ranges)
# --- b-rolls derrière : lecture séquentielle du clip conformé, enveloppe pop/fade, léger zoom
_br={}
def broll_frame(f):
    """retourne (rgb float32, alpha float) du b-roll actif à la frame f, ou None"""
    for b in fx["behind"]:
        if b.get("kind")!="broll": continue
        a,e=int(round(b["start"]*FPS)),int(round(b["end"]*FPS))
        if not (a<=f<e): continue
        key=b["file"]
        if key not in _br or _br[key][1]!=f-1 and _br[key][1]!=f:
            cap=cv2.VideoCapture(f"../assets/brolls/{key}.mp4"); cap.set(cv2.CAP_PROP_POS_FRAMES,max(0,f-a)); _br[key]=[cap,f-1,None]
        cap,last,img=_br[key]
        if last!=f:
            ok,img=cap.read()
            if not ok: img=_br[key][2] if _br[key][2] is not None else np.zeros((OH,OW,3),np.uint8)
            _br[key][1]=f; _br[key][2]=img
        u=(f-a)/FPS; d=(e-a)/FPS
        alpha=min(1.0,u/0.25)*min(1.0,(d-u)/0.3)          # pop in 0.25 s, fade out 0.3 s
        z=1.06-0.06*min(1.0,u/0.25)+0.02*u/d               # léger zoom d'entrée + dérive
        M=np.array([[z,0,OW/2*(1-z)],[0,z,OH/2*(1-z)]],np.float32)
        img=cv2.warpAffine(img,M,(OW,OH),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
        return img.astype(np.float32), alpha
    return None
# --- flashs blancs (passe 3) : frames et intensité
try:
    sys.path.insert(0,"scripts"); from shots_v3 import FLASHES; from edl import quantize
    _segs=quantize(); flash_frames={}
    for fl in FLASHES:
        s_=next(x for x in _segs if x["label"]==fl["at_label"]); fc=int(round(s_["dst_in"]*FPS))
        for k in range(fl["frames"]): flash_frames[fc+k]=0.85*(1-k/fl["frames"])
except Exception as ex:
    flash_frames={}
_mcache={}
def mask_file(f):
    p=f"cut/masks/m{f:05d}.png"; m=cv2.imread(p,cv2.IMREAD_GRAYSCALE) if os.path.exists(p) else None
    return None if m is None else m.astype(np.float32)/255.0
def mask_raw(f):
    """masque de la frame f ; si absent (frame non calculée), interpolation linéaire entre voisins calculés (±3)"""
    if f in _mcache: return _mcache[f]
    m=mask_file(f)
    if m is None:
        prev=next(((d,mask_file(f-d)) for d in (1,2,3) if os.path.exists(f"cut/masks/m{f-d:05d}.png")),None)
        nxt=next(((d,mask_file(f+d)) for d in (1,2,3) if os.path.exists(f"cut/masks/m{f+d:05d}.png")),None)
        if prev and nxt: m=(prev[1]*nxt[0]+nxt[1]*prev[0])/(prev[0]+nxt[0])
        elif prev: m=prev[1]
        elif nxt: m=nxt[1]
    _mcache[f]=m
    if len(_mcache)>12: _mcache.pop(next(iter(_mcache)))
    return m
def mask(f):
    """masque lissé temporellement (0.25/0.5/0.25) + feather léger ; None si indisponible"""
    m0=mask_raw(f)
    if m0 is None: return None
    acc=m0*0.5; wsum=0.5
    for d,w in ((-1,0.25),(1,0.25)):
        m=mask_raw(f+d)
        if m is not None: acc+=m*w; wsum+=w
    m=acc/wsum
    m=cv2.GaussianBlur(m,(0,0),1.2)
    # ouverture morphologique douce : retire les petites bavures isolées (ex. éclat de fauteuil)
    k=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(9,9)); hard=(m>0.5).astype(np.uint8)
    opened=cv2.morphologyEx(hard,cv2.MORPH_OPEN,k)
    # garder uniquement la plus grande composante (Tiziana + micro), supprimer les îlots
    n,lab,stats,_=cv2.connectedComponentsWithStats(opened,8)
    if n>1:
        big=1+np.argmax(stats[1:,cv2.CC_STAT_AREA]); keep=(lab==big).astype(np.float32)
        keep=cv2.dilate(keep,k,iterations=2)
        m=m*keep
    return m[...,None]
def read_png(p):
    im=cv2.imread(p,cv2.IMREAD_UNCHANGED)
    if im is None or im.shape[2]<4: return None
    a=im[...,3:4].astype(np.float32)/255.0; return im[...,:3].astype(np.float32), a
import time
def wait_masks(f):
    """attend que les masques calculés (grille 1 image/2 à partir du début de plage) encadrant f existent"""
    for a,b in [(int(round(x["start"]*FPS))-2, int(round(x["end"]*FPS))+2) for x in fx["behind"]]:
        if a<=f<b:
            lo=a+((f-a)//2)*2; hi=min(lo+2,b-1)
            for g in (lo,hi):
                while not os.path.exists(f"cut/masks/m{g:05d}.png"):
                    if "masks done" in open("masks.log").read(): return
                    time.sleep(5)
def compose(f, base):
    out=base.astype(np.float32)
    if in_behind(f):
        wait_masks(f)
        m=mask(f); b=read_png(f"cut/behind/f{f:05d}.png"); br=broll_frame(f)
        if m is not None and (b is not None or br is not None):
            comp=out
            if br is not None:
                brgb,balpha=br; comp=comp*(1-balpha)+brgb*balpha   # b-roll sur le fond (voile déjà appliqué au clip)
            if b is not None:
                brgb,ba=b; comp=comp*(1-ba)+brgb*ba              # mot/montant géant derrière
            out=comp*(1-m)+out*m                                  # Tiziana (masque) repasse devant
    fr=read_png(f"cut/front/f{f:05d}.png")
    if fr is not None:
        frgb,fa=fr; out=out*(1-fa)+frgb*fa
    if f in flash_frames: out=out*(1-flash_frames[f])+255.0*flash_frames[f]   # flash blanc (transition)
    if f<8: out*= (f+1)/8.0                               # fondu d'ouverture 8 images
    return np.clip(out,0,255).astype(np.uint8)
def grab(f):
    r=subprocess.run(["ffmpeg","-v","error","-ss",f"{f/FPS:.4f}","-i","cut/base.mp4","-frames:v","1","-f","rawvideo","-pix_fmt","bgr24","-"],capture_output=True)
    return np.frombuffer(r.stdout,np.uint8).reshape(OH,OW,3)
mode=sys.argv[1]
if mode=="preview":
    outdir=sys.argv[2]; os.makedirs(outdir,exist_ok=True)
    for a in sys.argv[3:]:
        name,f=a.split("=") if "=" in a else (a,a); f=int(f)
        cv2.imwrite(os.path.join(outdir,f"{name}.png"),compose(f,grab(f))); print("preview",name,f)
else:
    out=sys.argv[2]
    dec=subprocess.Popen(["ffmpeg","-v","error","-i","cut/base.mp4","-f","rawvideo","-pix_fmt","bgr24","-"],stdout=subprocess.PIPE,bufsize=10**8)
    enc=subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","bgr24","-s",f"{OW}x{OH}","-r",str(FPS),"-i","-","-i","cut/mix_final.wav",
        "-map","0:v","-map","1:a","-c:v","libx264","-preset","slow","-crf","18","-profile:v","high","-pix_fmt","yuv420p","-r",str(FPS),
        "-c:a","aac","-b:a","192k","-movflags","+faststart","-shortest",out],stdin=subprocess.PIPE)
    fsz=OW*OH*3; f=0
    while True:
        buf=dec.stdout.read(fsz)
        if len(buf)<fsz: break
        enc.stdin.write(compose(f,np.frombuffer(buf,np.uint8).reshape(OH,OW,3)).tobytes()); f+=1
        if f%300==0: print("frame",f,flush=True)
    enc.stdin.close(); enc.wait(); dec.wait(); print("done",f)
