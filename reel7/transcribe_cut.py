# Re-transcription of the EDITED voice (large-v3) -> transcript_cut.json (output timeline; used for captions and triggers)
import json, sys
from faster_whisper import WhisperModel
m = WhisperModel("large-v3", device="cpu", compute_type="int8")
segs, _ = m.transcribe(sys.argv[1] if len(sys.argv) > 1 else "scratch/cut16.wav", language="fr", word_timestamps=True,
                       beam_size=5, vad_filter=False, condition_on_previous_text=False)
out = [{"start": s.start, "end": s.end, "text": s.text.strip(),
        "words": [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 3)} for w in s.words]} for s in segs]
json.dump(out, open("transcript_cut.json", "w"), ensure_ascii=False, indent=1)
for s in out: print(" ".join(f"{w['w']}[{w['s']:.2f}]" for w in s["words"]))
