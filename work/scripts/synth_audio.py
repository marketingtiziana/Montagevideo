# Lit musical minimal (boucle électronique discrète) + SFX synthétiques
import numpy as np, soundfile as sf, os
sr=48000; os.makedirs("sfx",exist_ok=True)
def env(n, a, r):
    e=np.ones(n); A=int(a*sr); R=int(r*sr); e[:A]=np.linspace(0,1,A); e[-R:]*=np.linspace(1,0,R); return e
def lowpass(x, fc):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, fc/(sr/2), 'low', output='sos'), x)
def highpass(x, fc):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, fc/(sr/2), 'high', output='sos'), x)
# ---------- musique : 100 BPM, progression Am - F - C - G (2 mesures chacune), pad + basse + pulse léger
bpm=100; beat=60/bpm; bar=4*beat; dur=96.0
t=np.arange(int(dur*sr))/sr
chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]  # A3 C4 E4 / F3 A3 C4 / C3 E3 G3 / G3 B3 D4
f=lambda m: 440*2**((m-69)/12)
pad=np.zeros_like(t); bass=np.zeros_like(t)
for i in range(int(dur/(2*bar))+1):
    s0=i*2*bar; ch=chords[i%4]; n0=int(s0*sr); n1=min(int((s0+2*bar)*sr),len(t))
    if n0>=len(t): break
    tt=t[n0:n1]-s0; seg=np.zeros(n1-n0)
    for m in ch:
        for h,g in [(1,1.0),(2,0.35),(3,0.12)]:
            seg += g*np.sin(2*np.pi*f(m)*h*tt + 0.3*np.sin(2*np.pi*0.15*tt))  # léger chorus/vibrato
    seg *= 0.5+0.5*np.sin(2*np.pi*0.25*tt-np.pi/2)*0.3 + 0.35  # respiration lente
    e=np.ones(n1-n0); A=int(0.8*sr); e[:A]=np.linspace(0,1,A); e[-A:]*=np.linspace(1,0,A)
    pad[n0:n1]+=seg*e
    b=np.sin(2*np.pi*f(ch[0]-12)*tt)*(1+0.3*np.sin(2*np.pi*f(ch[0]-12)*2*tt)); bass[n0:n1]+=b*e
pad=lowpass(pad,1800)*0.12; bass=lowpass(bass,220)*0.18
# pulse : tick feutré sur chaque croche (hi-hat très filtré), accent sur les temps 2 et 4
pulse=np.zeros_like(t); rng=np.random.default_rng(1)
for k in range(int(dur/(beat/2))):
    n0=int(k*beat/2*sr); L=int(0.06*sr)
    if n0+L>len(t): break
    g=0.6 if k%2==0 else 0.3
    if k%8 in (2,6): g=1.0
    noise=rng.standard_normal(L)*np.exp(-np.arange(L)/(0.012*sr)); pulse[n0:n0+L]+=g*noise
pulse=highpass(pulse,6000)*0.05
# kick doux sur temps 1 et 3
kick=np.zeros_like(t)
for k in range(int(dur/beat)):
    if k%2: continue
    n0=int(k*beat*sr); L=int(0.25*sr)
    if n0+L>len(t): break
    tt=np.arange(L)/sr; kick[n0:n0+L]+=np.sin(2*np.pi*(55+90*np.exp(-tt*25))*tt)*np.exp(-tt*9)
kick*=0.35
music=pad+bass+pulse+kick
music=np.tanh(music*1.5)/1.5
music/=np.abs(music).max()*1.05
sf.write("sfx/music_bed.wav", music.astype(np.float32), sr); print("music ok")
# ---------- SFX
# whoosh : bruit filtré avec sweep de fréquence (0.35 s)
L=int(0.35*sr); tt=np.arange(L)/sr; n=rng.standard_normal(L)
from scipy.signal import sosfilt, butter
w=np.zeros(L); step=int(0.01*sr)
for i in range(0,L,step):
    fc=400+5000*(np.sin(np.pi*i/L))**1.5
    w[i:i+step]=sosfilt(butter(2,[fc*0.6/(sr/2),min(fc*1.6,20000)/(sr/2)],'band',output='sos'), n)[i:i+step]
w*=env(L,0.08,0.18); w/=np.abs(w).max(); sf.write("sfx/whoosh.wav",(w*0.5).astype(np.float32),sr)
# pop : blip court (60 ms) sinus glissant + clic
L=int(0.09*sr); tt=np.arange(L)/sr
p=np.sin(2*np.pi*(900-500*tt/0.09)*tt)*np.exp(-tt*45)+0.2*rng.standard_normal(L)*np.exp(-tt*400)
p/=np.abs(p).max(); sf.write("sfx/pop.wav",(p*0.5).astype(np.float32),sr)
# impact doux (pour le mot géant derrière) : sub + bruit filtré
L=int(0.5*sr); tt=np.arange(L)/sr
imp=np.sin(2*np.pi*(70+60*np.exp(-tt*20))*tt)*np.exp(-tt*6)+0.3*lowpass(rng.standard_normal(L),900)*np.exp(-tt*18)
imp/=np.abs(imp).max(); sf.write("sfx/impact.wav",(imp*0.6).astype(np.float32),sr)
print("sfx ok")
