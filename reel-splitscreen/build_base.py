import soundfile as sf, numpy as np, json, subprocess, shlex
a,sr=sf.read('work/audio16k.wav',dtype='float32')
FPS=30; TWO_FRAMES=2/FPS
def onset(approx, thr_db=-38, look=0.4):
    i0=int((approx-look)*sr)
    for i in range(i0, int((approx+0.6)*sr), int(0.01*sr)):
        seg=a[i:i+int(0.01*sr)]
        if 20*np.log10(np.sqrt(np.mean(seg**2))+1e-9) > thr_db: return i/sr
    return approx
# (approx resume, word-end) in source seconds, label
raw=[
 (0.60, 4.93, "Hook prise 1 (a) : Tu savais qu'une société étrangère ne suffit pas à déplacer ta fiscalité ?"),
 (5.45, 8.30, "Hook prise 1 (b) : Et c'est précisément là que beaucoup se font avoir."),
 (20.56, 22.50, "ce n'est pas simplement parce"),
 (24.20, 31.48, "que tu crées une société à Dubaï... payer tes impôts dans ce pays."),
 (39.30, 51.20, "Ce qui compte... résident fiscal, dirigée, exercée... ça devient intéressant."),
 (52.66, 63.92, "Parce que oui, dans certaines situations... plus adaptée à ton business."),
 (67.10, 76.80, "Mais dans d'autres situations... obligations fiscales dans ton pays de résidence."),
 (79.60, 84.66, "Donc, avant de choisir un pays juste parce qu'on t'a promis du 0%,"),
 (86.75, 91.24, "il faut d'abord regarder ta situation personnelle et ton business dans son ensemble."),
 (92.30, 113.80, "Et c'est exactement ce que je fais... commente urgence sous cette vidéo."),
 (115.60, 118.10, "Je t'enverrai les renseignements en DM."),
]
segs=[]; t=0.0
for k,(ap,we,label) in enumerate(raw):
    on=onset(ap)
    lead = 0.30 if k==0 else (0.10 if k==1 else 0.18)
    s=max(0.0, on-lead)
    if k==2: s=20.57  # hard in-point on 'ce' (drop the duplicated 'Parce que')
    e=we+TWO_FRAMES if k<len(raw)-1 else min(118.40, we+0.25)
    zoom = 1.0 if k%2==0 else 1.12
    segs.append(dict(idx=k, src_in=round(s,3), src_out=round(e,3), onset=round(on,3), dur=round(e-s,3), out_in=round(t,3), zoom=zoom, label=label))
    t+=e-s
json.dump(segs, open('work/segments.json','w'), indent=1, ensure_ascii=False)
for s in segs: print(f"{s['idx']:2d} src {s['src_in']:7.3f}-{s['src_out']:7.3f} (onset {s['onset']:7.3f}) dur {s['dur']:6.3f} -> out {s['out_in']:7.3f} zoom {s['zoom']}")
print("TOTAL", round(t,3))
