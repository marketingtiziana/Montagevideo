import numpy as np, soundfile as sf, subprocess, shlex, json
from scipy.signal import butter, sosfilt
SR=48000
# ---- 1. voice: de-esser (split-band compression 5-9 kHz) + loudness normalisation to -14 LUFS via ffmpeg loudnorm (2-pass)
v,_=sf.read('work/base_audio.wav',dtype='float32')
if v.ndim==2: v=v.mean(1)
sos_hp=butter(2,80,btype='high',fs=SR,output='sos'); v=sosfilt(sos_hp,v)
# de-esser: detect sibilance band, gain-reduce it when above threshold
sos_s=butter(4,[5000,9000],btype='band',fs=SR,output='sos'); sib=sosfilt(sos_s,v)
win=int(0.004*SR); env=np.sqrt(np.convolve(sib**2,np.ones(win)/win,mode='same'))
thr=np.percentile(env,96); ratio=3.0
gain=np.where(env>thr, (thr/np.maximum(env,1e-9))**(1-1/ratio), 1.0)
# smooth gain (attack 1ms / release 40ms)
g=np.empty_like(gain); cur=1.0; a=np.exp(-1/(0.001*SR)); r=np.exp(-1/(0.04*SR))
for i in range(len(gain)):
    tgt=gain[i]; cur = tgt+(cur-tgt)*(a if tgt<cur else r); g[i]=cur
v_des = v - sib*(1-g)
sf.write('work/voice_pre.wav', v_des.astype(np.float32), SR)
# loudnorm two-pass
p1=subprocess.run(shlex.split("ffmpeg -hide_banner -i work/voice_pre.wav -af loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json -f null -"),capture_output=True,text=True).stderr
js=json.loads(p1[p1.rfind('{'):p1.rfind('}')+1])
ln=f"loudnorm=I=-14:TP=-1.5:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true:print_format=summary"
subprocess.run(shlex.split(f"ffmpeg -y -v error -i work/voice_pre.wav -af {ln} -ar 48000 work/voice_norm.wav"),check=True)
voice,_=sf.read('work/voice_norm.wav',dtype='float32'); 
if voice.ndim==2: voice=voice.mean(1)
N=len(voice); dur=N/SR; print('voice', round(dur,3),'s; input', js['input_i'],'LUFS')
# ---- 2. music loop, ducked by sidechain from voice envelope
m,_=sf.read('sfx/music_loop.wav',dtype='float32'); m=m.mean(1)
reps=int(np.ceil(N/len(m)))+1; mus=np.tile(m,reps)[:N]
fade=int(1.5*SR); mus[:fade]*=np.linspace(0,1,fade); mus[-int(2.5*SR):]*=np.linspace(1,0,int(2.5*SR))
# voice envelope for ducking
win=int(0.02*SR); venv=np.sqrt(np.convolve(voice**2,np.ones(win)/win,mode='same'))
venv_db=20*np.log10(venv+1e-9)
duck=np.where(venv_db>-40, 10**(-8/20), 1.0)  # -8 dB extra duck while speaking
d=np.empty_like(duck); cur=1.0; a=np.exp(-1/(0.03*SR)); r=np.exp(-1/(0.5*SR))
for i in range(len(duck)):
    tgt=duck[i]; cur=tgt+(cur-tgt)*(a if tgt<cur else r); d[i]=cur
# music level: -24 dB under voice (voice ~ -14 LUFS => music around -38 LUFS when speaking). Set music RMS ~ -36 dBFS before duck
mus_rms=np.sqrt(np.mean(mus**2)); mus*= (10**(-31/20))/mus_rms
mus*=d
# ---- 3. SFX cues (final timeline seconds)
def load(n): x,_=sf.read(f'sfx/{n}.wav',dtype='float32'); return x if x.ndim==1 else x.mean(1)
S={k:load(k) for k in ['tick','whoosh','impact','pop','glitch']}
cues=[
 (0.05,'whoosh',0.5),(1.0,'pop',0.7),(1.3,'pop',0.7),(2.5,'pop',0.6),(3.3,'whoosh',0.4),(4.1,'pop',0.5),(4.6,'pop',0.6),(5.85,'pop',0.5),(8.08,'glitch',0.8),(8.1,'impact',0.6),
 (8.5,'whoosh',0.6),(9.0,'pop',0.4),(12.8,'pop',0.7),(13.64,'pop',0.7),(14.9,'pop',0.7),(15.6,'tick',0.9),(15.65,'impact',0.4),(16.8,'pop',0.6),(17.2,'whoosh',0.4),
 (18.5,'whoosh',0.6),(21.1,'pop',0.7),(23.6,'pop',0.7),(25.3,'pop',0.7),(26.8,'pop',0.7),(29.5,'whoosh',0.5),(29.9,'tick',0.6),
 (30.4,'whoosh',0.6),(31.3,'tick',0.6),(33.6,'tick',0.6),(38.5,'impact',0.6),(40.75,'tick',0.8),
 (42.06,'glitch',0.7),(42.2,'whoosh',0.5),(44.6,'pop',0.5),(46.9,'whoosh',0.35),(48.3,'pop',0.7),(48.6,'pop',0.7),(49.0,'pop',0.7),(50.2,'impact',0.5),(50.35,'pop',0.6),
 (51.7,'whoosh',0.6),(52.1,'pop',0.5),(55.7,'impact',0.9),(56.2,'glitch',0.8),(56.3,'pop',0.6),
 (56.8,'whoosh',0.6),(58.1,'pop',0.7),(59.3,'pop',0.7),(60.5,'whoosh',0.4),(61.0,'impact',0.8),
 (61.6,'whoosh',0.5),(64.3,'whoosh',0.8),(66.3,'pop',0.7),(66.45,'pop',0.5),(70.5,'tick',0.9),(73.4,'tick',0.9),
 (73.95,'whoosh',0.6),(74.45,'pop',0.7),(80.8,'impact',0.9),(82.0,'whoosh',0.6),(82.7,'impact',0.5),(83.0,'whoosh',0.4),(84.9,'pop',0.8),
]
# counter ticks 53.4 -> 55.7 (expo.in: accelerating)
for i in range(14):
    u=i/13; t=53.4+2.3*(1-(1-u)**0.5)
    cues.append((t,'tick',0.35+0.4*u))
import sys; sys.path.insert(0,'work'); from remap import R
cues=[(R(t),n,g) for t,n,g in cues]
sfx=np.zeros(N)
for t,n,g in cues:
    x=S[n]*g*(10**(-19/20)); i=int(t*SR); j=min(N,i+len(x)); 
    if i<N: sfx[i:j]+=x[:j-i]
# ---- 4. mix + soft limiter
mix=voice+mus+sfx
peak=np.abs(mix).max(); 
if peak>0.97: mix*=0.97/peak
st=np.stack([mix,mix],1).astype(np.float32)
sf.write('work/mix.wav', st, SR)
json.dump(cues, open('work/cues.json','w'))
# report levels
def lufs(path):
    o=subprocess.run(shlex.split(f"ffmpeg -hide_banner -i {path} -af ebur128=peak=true -f null -"),capture_output=True,text=True).stderr
    return o[o.rfind('Integrated loudness'):].split('\n')[1].strip()
print('voice', lufs('work/voice_norm.wav')); print('mix', lufs('work/mix.wav'))
mus_only=np.stack([mus,mus],1).astype(np.float32); sf.write('work/mus_only.wav',mus_only,SR); print('music bed', lufs('work/mus_only.wav'))
