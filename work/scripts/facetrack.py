import cv2, json, sys, numpy as np
src, out = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS); W=int(cap.get(3)); H=int(cap.get(4))
det = cv2.FaceDetectorYN.create("/home/user/Montagevideo/work/models/yunet.onnx","",(W,H),0.6,0.3,5000)
res=[]; step=int(round(fps/4)); i=0
while True:
    ok, fr = cap.read()
    if not ok: break
    if i % step == 0:
        _, faces = det.detect(fr)
        if faces is not None and len(faces):
            f = max(faces, key=lambda f: f[-1])
            x,y,w,h = f[:4]; rex,rey,lex,ley = f[4:8]; mx,my = (f[10]+f[12])/2,(f[11]+f[13])/2
            res.append({"t":round(i/fps,3),"cx":round(float((x+w/2)/W),4),"cy":round(float((y+h/2)/H),4),"w":round(float(w/W),4),"h":round(float(h/H),4),"ex":round(float((rex+lex)/2/W),4),"ey":round(float((rey+ley)/2/H),4),"mouth_y":round(float(my/H),4),"mouth_x":round(float(mx/W),4)})
    i+=1
json.dump(res, open(out,"w"))
a=np.array([[r["cx"],r["cy"],r["w"],r["h"],r["ex"],r["ey"],r["mouth_y"]] for r in res])
print("samples",len(res),"mean cx,cy,w,h,ex,ey,mouth",a.mean(0).round(3),"\nmin",a.min(0).round(3),"\nmax",a.max(0).round(3))
