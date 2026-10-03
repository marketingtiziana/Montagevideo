# faster-whisper word timestamps -> transcript.json
import json, sys
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[1] if len(sys.argv) > 1 else "medium", device="cpu", compute_type="int8")
segs, info = m.transcribe("a16.wav", language="fr", word_timestamps=True, beam_size=5, vad_filter=False)
out = []
for s in segs:
    out.append({"start": s.start, "end": s.end, "text": s.text.strip(),
                "words": [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 3)} for w in s.words]})
json.dump({"language": info.language, "duration": info.duration, "segments": out}, open("transcript.json", "w"), ensure_ascii=False, indent=1)
print("\n".join(f"{s['start']:6.2f}-{s['end']:6.2f} {s['text']}" for s in out))
