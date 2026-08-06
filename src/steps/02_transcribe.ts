/**
 * Étape 2 — Transcription mot à mot.
 * WhisperX large-v3, fr, alignement forcé → work/transcript.json.
 * Un objet par mot : { i, text, start, end, score }.
 *
 * L'inférence tourne dans le venv Python (.venv) via whisperx_transcribe.py.
 * Les modèles (faster-whisper large-v3 + align wav2vec2 fr) sont téléchargés
 * depuis HuggingFace au premier appel, puis mis en cache dans models/hf-cache.
 * Si HF est bloqué, fournir un modèle local via WHISPER_MODEL_DIR (voir README).
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Step } from '../pipeline.ts';
import { FILES, DIRS, TRANSCRIBE } from '../config.ts';
import { run } from '../util/exec.ts';
import { exists, readJson } from '../util/fs.ts';
import { log } from '../util/log.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PY_SCRIPT = path.join(__dirname, 'whisperx_transcribe.py');
const VENV_PY = path.join(DIRS.root, '.venv', 'bin', 'python');
const HF_CACHE = path.join(DIRS.root, 'models', 'hf-cache');

export const step02: Step = {
  id: '02',
  name: `Transcription WhisperX (${TRANSCRIBE.model}, fr, alignement forcé)`,
  version: 2,
  inputs: () => [FILES.sourceWav],
  outputs: () => [FILES.transcript],
  async run(ctx) {
    if (!exists(VENV_PY)) {
      throw new Error(
        `venv Python introuvable (${VENV_PY}). Lancez d'abord : bash scripts/setup.sh`,
      );
    }
    log.info('Transcription en cours (télécharge les modèles au 1er appel, puis cache)…');
    const res = await run(
      VENV_PY,
      [
        PY_SCRIPT,
        '--input', FILES.sourceWav,
        '--lang', ctx.opts.lang,
        '--out', FILES.transcript,
        '--cache-dir', HF_CACHE,
      ],
      { allowFail: true, quiet: false },
    );

    if (res.code === 2) {
      throw new Error(
        'Modèle WhisperX indisponible (accès HuggingFace bloqué ?). Options :\n' +
          "  • exécuter dans une session où huggingface.co est autorisé, ou\n" +
          '  • fournir un modèle local : export WHISPER_MODEL_DIR=/chemin/faster-whisper-large-v3',
      );
    }
    if (res.code !== 0) throw new Error(`Transcription échouée (code ${res.code}).`);

    // Sanity check : au moins un mot, part alignée.
    const t = readJson<{ words: Array<{ start: number | null }> }>(FILES.transcript);
    if (!t.words?.length) throw new Error('Transcription vide.');
    const timed = t.words.filter((w) => typeof w.start === 'number');
    log.ok(`${t.words.length} mots (${timed.length} alignés temporellement).`);
  },
};
