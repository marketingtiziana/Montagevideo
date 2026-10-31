import json, sys, time
from faster_whisper import WhisperModel
t=time.time()
m=WhisperModel('large-v3', device='cpu', compute_type='int8', cpu_threads=4)
import soundfile as sf, numpy as np
audio,_ = sf.read(sys.argv[1], dtype="float32")
segs, info = m.transcribe(audio, language='fr', word_timestamps=True, beam_size=5,
    vad_filter=False, condition_on_previous_text=True,
    initial_prompt="Tiziana, Madame Caci, Fynovates. Fiscalité, TVA, impôts, expatriation, Dubaï, France, Portugal, Suisse, Belgique, Luxembourg, euros, pourcentage.")
words=[]; segments=[]
for s in segs:
    segments.append({'start':s.start,'end':s.end,'text':s.text})
    for w in (s.words or []):
        words.append({'w':w.word.strip(),'s':round(w.start,3),'e':round(w.end,3),'p':round(w.probability,3)})
json.dump({'words':words,'segments':segments,'lang':info.language,'dur':info.duration}, open(sys.argv[2],'w'), ensure_ascii=False, indent=1)
print('done', len(words),'words in', round(time.time()-t,1),'s')
