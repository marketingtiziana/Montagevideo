import soundfile as sf, numpy as np, json
a,sr=sf.read('work/audio16k.wav',dtype='float32')
hop=int(0.05*sr)
rms=np.array([np.sqrt(np.mean(a[i:i+hop]**2)) for i in range(0,len(a)-hop,hop)])
db=20*np.log10(rms+1e-9)
def prof(t0,t1):
    print(f"--- energy {t0}-{t1}s (dBFS per 0.25s)")
    line=[]
    for t in np.arange(t0,t1,0.25):
        i=int(t/0.05); v=db[i:i+5].max() if i<len(db) else -99
        line.append(f"{t:6.2f}:{v:5.0f}")
        if len(line)==8: print("  ".join(line)); line=[]
    if line: print("  ".join(line))
prof(7.5,20.5); prof(31,34.5); prof(37.5,39.5); prof(63.5,67.5); prof(76.5,80); prof(84,92.5); prof(113,119)
from faster_whisper import WhisperModel
m=WhisperModel('large-v3', device='cpu', compute_type='int8', cpu_threads=4)
for (t0,t1) in [(8.0,20.0),(84.0,92.5),(113.5,118.4)]:
    seg=a[int(t0*sr):int(t1*sr)]
    segs,_=m.transcribe(seg, language='fr', word_timestamps=True, beam_size=5, condition_on_previous_text=False, vad_filter=True, vad_parameters=dict(min_silence_duration_ms=300))
    print(f"=== retranscribe {t0}-{t1}")
    for s in segs:
        print(f"  [{s.start+t0:6.2f}-{s.end+t0:6.2f}] {s.text}")
        for w in s.words or []: print(f"      {w.start+t0:6.2f} {w.end+t0:6.2f} {w.probability:.2f} {w.word}")
