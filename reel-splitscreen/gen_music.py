# Dynamic suspense bed: pulsing sub bass, ticking hats, heartbeat kick, dark drone, risers. D minor, 112 BPM, 16 bars loop.
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR=48000; BPM=112; beat=60/BPM; BARS=16; N=int(BARS*4*beat*SR); t=np.arange(N)/SR
rng=np.random.default_rng(42)
def env(n,a,d,curve=3.0):
    tt=np.arange(n)/SR; e=np.ones(n); ia=max(1,int(a*SR)); e[:ia]=np.linspace(0,1,ia); return e*np.exp(-tt*curve/d)
def lp(x,f,o=2): return sosfilt(butter(o,f,btype='low',fs=SR,output='sos'),x)
def hp(x,f,o=2): return sosfilt(butter(o,f,btype='high',fs=SR,output='sos'),x)
def bp(x,lo,hi,o=2): return sosfilt(butter(o,[lo,hi],btype='band',fs=SR,output='sos'),x)
mix=np.zeros(N)
# chord roots per bar (Dm | Dm | Bb | Bb | F | F | A | A ...) -> minor, tense
roots=[73.42,73.42,58.27,58.27,87.31,87.31,55.0,55.0]*2
# 1. pulsing sub bass: staccato 8th notes
for b in range(BARS):
    f=roots[b]
    for e8 in range(8):
        st=int((b*4+e8*0.5)*beat*SR); n=int(0.22*SR); tt=np.arange(n)/SR
        acc = 1.0 if e8 in (0,3,6) else 0.72
        s=(np.sin(2*np.pi*f*tt)+0.35*np.sin(2*np.pi*f*2*tt)+0.12*np.sign(np.sin(2*np.pi*f*tt)))*env(n,0.004,0.16,3)*acc
        mix[st:st+n]+=lp(s,260)*0.55
# 2. dark drone pad (detuned saws, slow filter LFO)
def saw(f,tt): return (2*((f*tt)%1)-1)
drone=np.zeros(N)
for b in range(BARS):
    f=roots[b]*2; st=int(b*4*beat*SR); n=int(4*beat*SR)+int(0.4*SR); n=min(n,N-st); tt=np.arange(n)/SR
    e=np.minimum(1,tt/0.9)*np.minimum(1,(n/SR-tt)/0.9)
    s=sum(saw(f*(1+d),tt)+0.5*saw(f*1.5*(1+d),tt) for d in (-0.006,0,0.006))/3
    drone[st:st+n]+=s*e
lfo=0.5+0.5*np.sin(2*np.pi*t/(8*beat))
out=np.zeros(N); chunk=2048
for i in range(0,N,chunk):
    fc=350+900*lfo[i]; out[i:i+chunk]=lp(drone[i:i+chunk],fc,2)
mix+=out*0.11
# 3. ticking hats (16ths, accent on 8ths) + shaker-like noise
for s16 in range(BARS*16):
    st=int(s16*beat/4*SR); n=int(0.045*SR)
    acc=0.9 if s16%4==0 else (0.55 if s16%2==0 else 0.3)
    h=bp(rng.standard_normal(n),6000,13000,2)*env(n,0.001,0.02,4)*acc*0.09
    mix[st:st+n]+=h
# 4. heartbeat kick (two hits per bar: beat 1 and the 'and' of 1) + soft snare-rim on beat 3
for b in range(BARS):
    for off,g in ((0,1.0),(0.5,0.6)):
        st=int((b*4+off)*beat*SR); n=int(0.35*SR); tt=np.arange(n)/SR; f=np.linspace(110,42,n); ph=np.cumsum(2*np.pi*f/SR)
        mix[st:st+n]+=np.sin(ph)*env(n,0.002,0.18,3)*0.5*g
    st=int((b*4+2)*beat*SR); n=int(0.12*SR)
    mix[st:st+n]+=bp(rng.standard_normal(n),1500,5000,2)*env(n,0.001,0.05,4)*0.12
# 5. risers every 4 bars (noise sweep up) ending on a muted impact; tension stabs
for b in range(0,BARS,4):
    st=int(b*4*beat*SR); n=int(3.6*beat*SR); x=rng.standard_normal(n); sw=np.zeros(n)
    for i in range(0,n,2048):
        f=200+6000*(i/n)**2; sw[i:i+2048]=bp(x[i:i+2048],f*0.6,min(f*1.5,20000),2)
    mix[st:st+n]+=sw*np.linspace(0,1,n)**2*0.16
    st2=int((b+4)*4*beat*SR)%N; n2=int(0.5*SR); tt=np.arange(n2)/SR; f=np.linspace(90,40,n2); ph=np.cumsum(2*np.pi*f/SR)
    mix[st2:st2+n2]+=np.sin(ph)*env(n2,0.002,0.3,3)*0.6
    # stab: short minor chord hit on bar+2, beat 4.5
    st3=int(((b+2)*4+3.5)*beat*SR); n3=int(0.3*SR); tt=np.arange(n3)/SR; f0=roots[b]*4
    stab=sum(np.sin(2*np.pi*f0*r*tt) for r in (1,1.189,1.498))*env(n3,0.002,0.12,4)
    mix[st3:st3+n3]+=lp(stab,2500)*0.14
# 6. quarter-note pumping (sidechain feel)
pump=1-0.35*np.clip(1-((t%beat)/(0.18)),0,1)
mix*=pump
mix=hp(mix,35); mix=lp(mix,9000)
# soft clip + normalise
mix=np.tanh(mix*1.6)/1.6; mix/=np.abs(mix).max()+1e-9; mix*=0.8
sf.write('sfx/music_loop.wav', np.stack([mix,mix],1).astype(np.float32), SR)
print('suspense bed', round(N/SR,2),'s')
