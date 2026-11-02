import numpy as np, soundfile as sf
SR=48000
def env(n, a, d, curve=3.0):
    t=np.arange(n)/SR; e=np.ones(n)
    ia=int(a*SR); e[:ia]=np.linspace(0,1,ia) if ia>0 else 1
    e*= np.exp(-t*curve/d)
    return e
def tick():
    n=int(0.06*SR); t=np.arange(n)/SR
    s=np.sin(2*np.pi*2400*t)*env(n,0.001,0.02,4)+0.4*np.sin(2*np.pi*4800*t)*env(n,0.001,0.012,4)
    return s*0.5
def whoosh():
    n=int(0.55*SR); t=np.arange(n)/SR
    rng=np.random.default_rng(1); noise=rng.standard_normal(n)
    # band-pass sweep via simple resonant filter (biquad) with sweeping center
    from scipy.signal import butter, sosfilt
    out=np.zeros(n); chunk=1024
    for i in range(0,n,chunk):
        f=300+3500*(i/n)**1.6; sos=butter(2,[f*0.7,min(f*1.4,20000)],btype='band',fs=SR,output='sos')
        out[i:i+chunk]=sosfilt(sos,noise[i:i+chunk])
    e=np.sin(np.pi*np.clip(t/0.55,0,1))**1.5
    return out*e/ (np.abs(out*e).max()+1e-9)*0.5
def impact():
    n=int(0.5*SR); t=np.arange(n)/SR
    f=np.linspace(140,55,n); ph=np.cumsum(2*np.pi*f/SR)
    s=np.sin(ph)*env(n,0.002,0.25,3)+0.3*np.sin(2*np.pi*880*t)*env(n,0.001,0.03,4)
    return s*0.8
def pop():
    n=int(0.12*SR); t=np.arange(n)/SR
    f=np.linspace(900,500,n); ph=np.cumsum(2*np.pi*f/SR)
    return np.sin(ph)*env(n,0.002,0.05,4)*0.6
def glitch():
    n=int(0.14*SR); rng=np.random.default_rng(7)
    s=np.sign(rng.standard_normal(n))*(rng.random(n)>0.5)
    gate=(np.sin(2*np.pi*60*np.arange(n)/SR)>0).astype(float)
    return s*gate*env(n,0.001,0.08,3)*0.35
for name,fn in [('tick',tick),('whoosh',whoosh),('impact',impact),('pop',pop),('glitch',glitch)]:
    sf.write(f'sfx/{name}.wav', fn().astype(np.float32), SR)
# discreet electronic loop: 100 BPM, 8 bars, soft pad + subtle pulse, no melody hook
bpm=100; beat=60/bpm; bars=8; n=int(bars*4*beat*SR); t=np.arange(n)/SR
def pad(freq, det=0.003):
    s=np.zeros(n)
    for d in (-det,0,det): s+=np.sin(2*np.pi*freq*(1+d)*t)+0.3*np.sin(2*np.pi*freq*2*(1+d)*t)
    return s/3
chords=[(110,164.81,196),(98,146.83,174.61),(87.31,130.81,164.81),(98,146.83,196)]  # Am, G, F, G-ish
mix=np.zeros(n); barlen=int(2*4*beat*SR)
for i,ch in enumerate(chords):
    seg=slice(i*barlen,(i+1)*barlen); tt=np.arange(barlen)/SR
    e=np.minimum(1,tt/0.8)*np.minimum(1,(barlen/SR-tt)/0.8)
    for f in ch: mix[seg]+=pad(f)[seg]*e*0.12
# subtle pulse (sidestick-like) on offbeats + soft hat
from scipy.signal import butter, sosfilt
rng=np.random.default_rng(3)
for b in range(bars*4*2):
    st=int(b*beat/2*SR)
    if b%2==1:
        hn=int(0.05*SR); h=sosfilt(butter(2,[6000,12000],btype='band',fs=SR,output='sos'),rng.standard_normal(hn))*env(hn,0.001,0.02,4)*0.06
        mix[st:st+hn]+=h
    if b%8==4:
        kn=int(0.25*SR); f=np.linspace(120,50,kn); ph=np.cumsum(2*np.pi*f/SR); mix[st:st+kn]+=np.sin(ph)*env(kn,0.002,0.12,3)*0.18
mix=sosfilt(butter(2,5000,btype='low',fs=SR,output='sos'),mix)
mix/= (np.abs(mix).max()+1e-9); mix*=0.7
sf.write('sfx/music_loop.wav', np.stack([mix,mix],1).astype(np.float32), SR)
print('sfx ok', n/SR, 's loop')
