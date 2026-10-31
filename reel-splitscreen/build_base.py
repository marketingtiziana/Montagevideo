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
 (9.36, 18.20, "Hook prise 2 : Tu savais qu'une société étrangère... se font avoir."),
 (20.30, 22.50, "Parce que ce n'est pas simplement parce"),
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
    lead = 0.30 if k==0 else 0.18
    s=max(0.0, on-lead)
    e=we+TWO_FRAMES if k<len(raw)-1 else min(118.40, we+0.25)
    zoom = 1.0 if k%2==0 else 1.12
    segs.append(dict(idx=k, src_in=round(s,3), src_out=round(e,3), onset=round(on,3), dur=round(e-s,3), out_in=round(t,3), zoom=zoom, label=label))
    t+=e-s
json.dump(segs, open('work/segments.json','w'), indent=1, ensure_ascii=False)
for s in segs: print(f"{s['idx']:2d} src {s['src_in']:7.3f}-{s['src_out']:7.3f} (onset {s['onset']:7.3f}) dur {s['dur']:6.3f} -> out {s['out_in']:7.3f} zoom {s['zoom']}")
print("TOTAL", round(t,3))
# ---- ffmpeg filter graph
# base crop (zoom 1.0): 1000x796 @ (480,40) ; eye anchor (980,300) at 33% height
def crop_for(z):
    w=1000/z; h=796/z; x=980-w/2; y=300-0.33*h
    return f"crop={w:.0f}:{h:.0f}:{x:.0f}:{y:.0f}"
vf=[]; af=[]
for s in segs:
    vf.append(f"[0:v]trim=start={s['src_in']}:end={s['src_out']},setpts=PTS-STARTPTS,{crop_for(s['zoom'])},scale=1080:860:flags=lanczos,setsar=1,fps={FPS},format=yuv420p[v{s['idx']}]")
    af.append(f"[1:a]atrim=start={s['src_in']}:end={s['src_out']},asetpts=PTS-STARTPTS[a{s['idx']}]")
n=len(segs)
graph=";".join(vf+af)+";"+"".join(f"[v{i}]" for i in range(n))+f"concat=n={n}:v=1:a=0,eq=contrast=1.05:saturation=1.03[vout];"+"".join(f"[a{i}]" for i in range(n))+f"concat=n={n}:v=0:a=1[aout]"
open('work/base_graph.txt','w').write(graph)
cmd=f"ffmpeg -y -v error -stats -i /input/Reel_16M.mp4 -i work/audio_full.wav -filter_complex_script work/base_graph.txt -map [vout] -map [aout] -c:v libx264 -preset fast -crf 14 -r {FPS} -c:a pcm_s24le work/base.mov"
print(cmd); subprocess.run(shlex.split(cmd), check=True)
subprocess.run(shlex.split("ffmpeg -y -v error -i work/base.mov -vn -ac 2 -ar 48000 -c:a pcm_s24le work/base_audio.wav"), check=True)
subprocess.run(shlex.split("ffmpeg -y -v error -i work/base.mov -vn -ac 1 -ar 16000 -c:a pcm_s16le work/base_audio16k.wav"), check=True)
print(subprocess.run(shlex.split("ffprobe -v error -show_entries format=duration -of csv=p=0 work/base.mov"),capture_output=True,text=True).stdout)
