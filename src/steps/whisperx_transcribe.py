#!/usr/bin/env python3
"""
whisperx_transcribe.py — Étape 2. Transcription mot à mot via WhisperX.

WhisperX large-v3, langue fr, alignement forcé (wav2vec2). Sortie JSON avec un
objet par mot : { i, text, start, end, score }.

Invoqué par src/steps/02_transcribe.ts dans le venv (.venv).

Réseau / modèles :
  Les poids WhisperX (faster-whisper large-v3 + align wav2vec2 fr) viennent de
  HuggingFace. Le cache HF est fixé sur models/hf-cache (persistant, hors git)
  pour survivre aux reprises `--from`. Si HF est injoignable, on peut pointer
  des modèles LOCAUX déjà téléchargés :
    WHISPER_MODEL_DIR   dossier CT2 faster-whisper local (sinon nom du modèle)
    WHISPER_ALIGN_MODEL id HF ou chemin local du modèle d'alignement fr
  Autres réglages (exécution CPU) :
    WHISPER_MODEL   (défaut large-v3)   WHISPER_DEVICE  (défaut cpu)
    WHISPER_COMPUTE (défaut int8 cpu / float16 cuda)
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
    ap.add_argument("--cache-dir", default=None, help="cache HF persistant")
    args = ap.parse_args()

    # Cache HF persistant (les modèles restent d'un run à l'autre).
    if args.cache_dir:
        os.makedirs(args.cache_dir, exist_ok=True)
        os.environ.setdefault("HF_HOME", args.cache_dir)
        os.environ.setdefault("HF_HUB_CACHE", os.path.join(args.cache_dir, "hub"))

    device = os.environ.get("WHISPER_DEVICE", "cpu")
    compute = os.environ.get("WHISPER_COMPUTE", "int8" if device == "cpu" else "float16")
    # Modèle ASR : dossier local prioritaire, sinon nom (téléchargé depuis HF).
    model_name = os.environ.get("WHISPER_MODEL_DIR") or os.environ.get("WHISPER_MODEL", "large-v3")
    align_override = os.environ.get("WHISPER_ALIGN_MODEL")  # id HF ou chemin local

    import whisperx  # import tardif : messages d'install plus clairs

    eprint(f"[whisperx] load_model {model_name} device={device} compute={compute} lang={args.lang}")
    try:
        model = whisperx.load_model(model_name, device=device, compute_type=compute, language=args.lang)
    except Exception as e:  # message actionnable si HF est bloqué
        eprint(
            "[whisperx] ÉCHEC chargement du modèle. Si l'accès HuggingFace est bloqué,\n"
            "            fournissez un modèle local via WHISPER_MODEL_DIR (dossier CT2\n"
            "            faster-whisper) ou exécutez dans une session où HF est autorisé.\n"
            f"            Cause: {e}"
        )
        return 2

    eprint("[whisperx] load_audio")
    audio = whisperx.load_audio(args.input)

    eprint("[whisperx] transcribe")
    result = model.transcribe(audio, batch_size=8, language=args.lang)

    eprint("[whisperx] load_align_model + align (alignement forcé mot à mot)")
    align_kwargs = {"language_code": args.lang, "device": device}
    if align_override:
        align_kwargs["model_name"] = align_override
    align_model, metadata = whisperx.load_align_model(**align_kwargs)
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
                    # (nombres, symboles) : laissés null, l'EDL les gère.
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
