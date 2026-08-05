#!/usr/bin/env python3
"""
whisperx_transcribe.py — Étape 2. Transcription mot à mot via WhisperX.

WhisperX large-v3, langue fr, alignement forcé (wav2vec2). Sortie JSON avec un
objet par mot : { i, text, start, end, score }.

Invoqué par src/steps/02_transcribe.ts dans le venv (.venv). Paramètres via env
pour permettre l'exécution CPU :
  WHISPER_MODEL   (défaut large-v3)
  WHISPER_DEVICE  (défaut cpu)
  WHISPER_COMPUTE (défaut int8 sur cpu, float16 sur cuda)
"""

import argparse
import json
import os
import sys


def eprint(*a):
    print(*a, file=sys.stderr, flush=True)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="WAV 48k/24b mono")
    ap.add_argument("--lang", default="fr")
    ap.add_argument("--out", required=True, help="chemin transcript.json")
    args = ap.parse_args()

    device = os.environ.get("WHISPER_DEVICE", "cpu")
    model_name = os.environ.get("WHISPER_MODEL", "large-v3")
    compute = os.environ.get("WHISPER_COMPUTE", "int8" if device == "cpu" else "float16")

    import whisperx  # import tardif : messages d'install plus clairs

    eprint(f"[whisperx] load_model {model_name} device={device} compute={compute} lang={args.lang}")
    model = whisperx.load_model(model_name, device=device, compute_type=compute, language=args.lang)

    eprint("[whisperx] load_audio")
    audio = whisperx.load_audio(args.input)

    eprint("[whisperx] transcribe")
    result = model.transcribe(audio, batch_size=8, language=args.lang)

    eprint("[whisperx] load_align_model + align (alignement forcé mot à mot)")
    align_model, metadata = whisperx.load_align_model(language_code=args.lang, device=device)
    aligned = whisperx.align(
        result["segments"], align_model, metadata, audio, device, return_char_alignments=False
    )

    words = []
    i = 0
    for seg in aligned.get("segments", []):
        for w in seg.get("words", []):
            text = w.get("word", "")
            if not str(text).strip():
                continue
            words.append(
                {
                    "i": i,
                    "text": text,
                    # start/end/score peuvent manquer pour un mot non aligné
                    # (nombres, symboles) : on les laisse null, l'EDL les gère.
                    "start": w.get("start"),
                    "end": w.get("end"),
                    "score": w.get("score"),
                }
            )
            i += 1

    payload = {
        "language": args.lang,
        "model": model_name,
        "aligned": True,
        "words": words,
        "segments": [
            {"start": s.get("start"), "end": s.get("end"), "text": s.get("text", "")}
            for s in result.get("segments", [])
        ],
    }
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    eprint(f"[whisperx] {len(words)} mots -> {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
