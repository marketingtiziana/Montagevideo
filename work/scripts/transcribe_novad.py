import json, sys
from faster_whisper import WhisperModel
import soundfile as sf, numpy as np
src, out = sys.argv[1], sys.argv[2]
model = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=4)
audio,sr = sf.read(src, dtype="float32"); assert sr==16000
segments, info = model.transcribe(audio, language="fr", word_timestamps=True, beam_size=5,
    vad_filter=False, vad_parameters=dict(min_silence_duration_ms=300),
    condition_on_previous_text=True,
    initial_prompt="Tiziana, Madame Caci, Fynovates. Fiscalité, impôts, TVA, expatriation, Dubaï, Émirats, Portugal, Suisse, Belgique, France, chiffres et montants en euros.")
words=[]; segs=[]
for s in segments:
    segs.append({"start":s.start,"end":s.end,"text":s.text})
    for w in (s.words or []):
        words.append({"w":w.word.strip(),"s":round(w.start,3),"e":round(w.end,3),"p":round(w.probability,3)})
json.dump({"segments":segs,"words":words}, open(out,"w"), ensure_ascii=False, indent=1)
print("segments",len(segs),"words",len(words))
