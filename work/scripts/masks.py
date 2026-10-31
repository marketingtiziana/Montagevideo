# Passe 2 : masques BiRefNet sur les plages "derrière" (frames finales), lissage temporel + feather.
import json, os, sys, subprocess, numpy as np, cv2, time
from rembg import remove
from rembg.sessions import sessions_class
import onnxruntime as ort
from PIL import Image
fx=json.load(open("cut/fx.json")); FPS=30
ranges=[(int(round(b["start"]*FPS))-2, int(round(b["end"]*FPS))+2) for b in fx["behind"]]
os.makedirs("cut/masks",exist_ok=True)
so=ort.SessionOptions(); so.enable_cpu_mem_arena=False; so.intra_op_num_threads=4
sess=[c for c in sessions_class if c.name()=="birefnet-portrait"][0]("birefnet-portrait", so, ["CPUExecutionProvider"])
cap=cv2.VideoCapture("cut/base.mp4"); N=int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
order=[1,0,2]
todo=[]
for r in order:
    a,b=ranges[r]; todo+=[f for f in range(max(a,0),min(b,N)) if f not in todo and ((f-a)%2==0 or f==b-1)]
t0=time.time(); done=0
for f in todo:
    out=f"cut/masks/m{f:05d}.png"
    if os.path.exists(out): continue
    cap.set(cv2.CAP_PROP_POS_FRAMES,f); ok,fr=cap.read()
    if not ok: break
    im=Image.fromarray(cv2.cvtColor(fr,cv2.COLOR_BGR2RGB))
    o=remove(im,session=sess,only_mask=True)
    o.save(out); done+=1
    print(f"{done}/{len(todo)} f{f} {(time.time()-t0)/done:.1f}s/frame",flush=True)
print("masks done",done,"total",len(todo),(time.time()-t0)/60,"min")
