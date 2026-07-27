import json, sys
from pywhispercpp.model import Model

m = Model('models/ggml-base.bin', print_realtime=False, print_progress=False,
          language='fr', translate=False)

# Word-level: token_timestamps + max_len=1 + split_on_word => ~one word per segment
segs = m.transcribe('audio16.wav',
                    token_timestamps=True,
                    max_len=1,
                    split_on_word=True,
                    no_speech_thold=0.6)

words = []
for s in segs:
    txt = (s.text or '').strip()
    if not txt:
        continue
    words.append({'t0': s.t0/100.0, 't1': s.t1/100.0, 'w': txt})

with open('words.json', 'w') as f:
    json.dump(words, f, ensure_ascii=False, indent=1)

# Also build a readable transcript
line = ' '.join(w['w'] for w in words)
with open('transcript.txt', 'w') as f:
    f.write(line)

print("WORDS:", len(words))
print("FIRST 40 WORDS:")
print(' '.join(w['w'] for w in words[:40]))
