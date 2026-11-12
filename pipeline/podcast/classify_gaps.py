"""ÉTAPE 1 (aide) — Qualifie les trous non silencieux repérés par tighten.py : re-transcription avec une
consigne qui fait écrire les hésitations (euh, hum) + voisement (pyin). Sortie : work/gaps.json.
Usage : tighten.py -> classify_gaps.py -> tighten.py (coupe alors les « euh » isolés)."""
import json,wave,numpy as np,librosa
from faster_whisper import WhisperModel
C=json.load(open('work/cuts.json')); W=json.load(open('work/words.json'))
w=wave.open('work/audio16.wav'); y=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
m=WhisperModel('models/fw-large-v3-turbo',device='cpu',compute_type='int8',cpu_threads=4)
res=[]
for f in C['a_relire']:
    if 'duree' not in f: continue
    g0=f['t']; g1=g0+f['duree']
    seg=y[int(g0*16000):int(g1*16000)]
    f0,vf,vp=librosa.pyin(seg,fmin=90,fmax=400,sr=16000,frame_length=1024)
    vr=float(np.mean(vf)); st=float(np.nanstd(np.log(f0[vf]))) if vf.sum()>3 else 9
    ctx=y[int((g0-0.8)*16000):int((g1+0.8)*16000)]
    s,_=m.transcribe(ctx,language='fr',initial_prompt="Euh, alors, euh... hum, bon, euh, ben, (rires) ha ha.",word_timestamps=True,condition_on_previous_text=False)
    words=[(round(x.start+g0-0.8,2),round(x.end+g0-0.8,2),x.word.strip()) for z in s for x in z.words]
    inside=[x for x in words if x[1]>g0+0.05 and x[0]<g1-0.05]
    res.append({'t':g0,'d':f['duree'],'voise':round(vr,2),'pitch_std':round(st,3),'dans_le_trou':inside,'ctx':f['contexte']})
    print(f"{int(g0//60)}:{g0%60:05.2f} d={f['duree']} voisé={vr:.2f} std={st:.2f} | {inside}",flush=True)
json.dump(res,open('work/gaps.json','w'),ensure_ascii=False,indent=0)
