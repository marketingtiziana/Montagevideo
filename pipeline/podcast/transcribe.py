"""ÉTAPE 0.3 — Transcription FR mot à mot avec horodatage.
faster-whisper large-v3-turbo (int8, CPU) récupéré sur HuggingFace (repli : whisper.cpp base, miroir GitHub).
Entrée : work/audio16.wav -> work/words.json, work/segments.json, work/transcript.txt"""
import json, os, sys, wave, numpy as np

src = sys.argv[1] if len(sys.argv) > 1 else 'work/audio16.wav'
out = sys.argv[2] if len(sys.argv) > 2 else 'work'
FW = 'models/fw-large-v3-turbo'
w = wave.open(src); audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768

words, segs = [], []
if os.path.exists(FW + '/model.bin'):
    from faster_whisper import WhisperModel
    m = WhisperModel(FW, device='cpu', compute_type='int8', cpu_threads=os.cpu_count())
    it, _ = m.transcribe(audio, language='fr', word_timestamps=True, vad_filter=True,
                         vad_parameters={'min_silence_duration_ms': 300}, condition_on_previous_text=False,
                         initial_prompt="Podcast en français sur la fiscalité, l'expatriation et l'entrepreneuriat.")
    for s in it:
        segs.append({'t0': round(s.start, 2), 't1': round(s.end, 2), 'text': s.text.strip()})
        for x in s.words:
            words.append({'t0': round(x.start, 3), 't1': round(x.end, 3), 'w': x.word.strip(), 'p': round(x.probability, 3)})
        print(f"{s.start:7.1f} {s.text.strip()}", flush=True)
else:
    from pywhispercpp.model import Model
    m = Model('models/ggml-base.bin', print_realtime=False, language='fr', n_threads=os.cpu_count())
    for s in m.transcribe(src, token_timestamps=True, max_len=1, split_on_word=True):
        t = (s.text or '').strip()
        if t: words.append({'t0': s.t0 / 100, 't1': s.t1 / 100, 'w': t, 'p': 1.0})

json.dump(words, open(f'{out}/words.json', 'w'), ensure_ascii=False, indent=0)
json.dump(segs, open(f'{out}/segments.json', 'w'), ensure_ascii=False, indent=0)
fmt = lambda t: f"{int(t // 60):02d}:{t % 60:05.2f}"
open(f'{out}/transcript.txt', 'w').write('\n'.join(f"[{fmt(s['t0'])}] {s['text']}" for s in segs) + '\n')
print('WORDS', len(words), 'SEGMENTS', len(segs))
