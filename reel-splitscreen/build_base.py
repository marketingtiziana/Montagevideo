import soundfile as sf, numpy as np, json
a,sr=sf.read('work/audio16k.wav',dtype='float32')
FPS=30; TWO_FRAMES=2/FPS
def rms_db(t,win=0.02):
    i=int(t*sr); seg=a[i:i+int(win*sr)]; return 20*np.log10(np.sqrt(np.mean(seg**2))+1e-9)
def onset(approx, thr_db=-38, look=0.4):
    for t in np.arange(approx-look, approx+0.6, 0.01):
        if rms_db(t) > thr_db: return round(float(t),3)
    return approx
def snap_end(word_end, thr_db=-45, max_ext=0.6):
    """extend the out-point until the voice really stops (last 20 ms window above thr within max_ext)"""
    last=word_end
    for t in np.arange(word_end, word_end+max_ext, 0.01):
        if rms_db(t) > thr_db: last=t
        elif t-last>0.08: break
    return round(float(last),3)
# (approx resume, word-end, label, hard_in or None)
raw=[
 (0.60, 4.93, "Hook prise 1 (a) : Tu savais qu'une société étrangère ne suffit pas à déplacer ta fiscalité ?", None),
 (5.45, 8.30, "Hook prise 1 (b) : Et c'est précisément là que beaucoup se font avoir.", None),
 (21.02, 22.50, "ce n'est pas simplement parce", 20.95),
 (24.20, 31.48, "que tu crées une société à Dubaï... payer tes impôts dans ce pays.", None),
 (40.21, 51.20, "ce qui compte, c'est notamment où tu es résident fiscal... ça devient intéressant.", 40.12),
 (52.66, 63.92, "Parce que oui, dans certaines situations... plus adaptée à ton business.", None),
 (67.10, 76.80, "Mais dans d'autres situations... obligations fiscales dans ton pays de résidence.", None),
 (79.60, 84.60, "Donc, avant de choisir un pays juste parce qu'on t'a promis du 0%,", None),
 (86.75, 91.24, "il faut d'abord regarder ta situation personnelle et ton business dans son ensemble.", None),
 (92.30, 113.76, "Et c'est exactement ce que je fais... commente urgence sous cette vidéo.", None),
 (115.60, 117.94, "Je t'enverrai les renseignements en DM.", None),
]
segs=[]; t=0.0
for k,row in enumerate(raw):
    ap,we,label,hard=row[:4]; hard_out=row[4] if len(row)>4 else None
    on=onset(ap, look=0.12 if hard else 0.4)
    lead = 0.30 if k==0 else 0.18
    s = hard if hard is not None else max(0.0, on-lead)
    e_voice = snap_end(we)
    e = e_voice+TWO_FRAMES if k<len(raw)-1 else min(118.40, e_voice+0.30)
    if hard_out is not None: e=hard_out; e_voice=hard_out
    zoom = 1.0 if k%2==0 else 1.08
    segs.append(dict(idx=k, src_in=round(s,3), src_out=round(e,3), onset=round(on,3), voice_end=e_voice, dur=round(e-s,3), out_in=round(t,3), zoom=zoom, label=label))
    t+=e-s
json.dump(segs, open('work/segments.json','w'), indent=1, ensure_ascii=False)
for s in segs: print(f"{s['idx']:2d} src {s['src_in']:7.3f}-{s['src_out']:7.3f} (onset {s['onset']:7.3f}, voice end {s['voice_end']:7.3f}) dur {s['dur']:6.3f} -> out {s['out_in']:7.3f} zoom {s['zoom']}")
print("TOTAL", round(t,3))
