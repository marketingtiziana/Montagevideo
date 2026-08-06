/**
 * Étape 7 — Sous-titres (données de timing pour Remotion).
 * Mécanique exacte relevée sur la référence :
 *  - mots un par un, cumulativement, au timestamp WhisperX ;
 *  - bloc de 2 lignes max ; ligne 1 (graisse 400), ligne 2 (graisse 700, la
 *    partie la plus récente) ;
 *  - passage ligne 2 dès que la ligne 1 atteint 4 mots OU 20 caractères ;
 *  - effacement + redémarrage dès que la ligne 2 atteint 4 mots, OU sur une
 *    frontière de phrase, OU après 400 ms sans nouveau mot ;
 *  - ponctuation retirée à l'affichage sauf apostrophes, ? et !.
 * → work/captions.json. Rendu visuel : remotion/components/Captions.tsx.
 */

import type { Step } from '../pipeline.ts';
import { FILES, CAPTIONS, OUTPUT } from '../config.ts';
import type { Transcript, Word, CaptionBlock, CaptionWord, CaptionsData } from '../types.ts';
import { readJson, writeJson, exists } from '../util/fs.ts';
import { log } from '../util/log.ts';

/** Nettoyage d'affichage : garde apostrophes, ? et ! ; retire le reste. */
export function cleanCaptionText(raw: string): string {
  return raw.replace(/[.,;:…"«»()\[\]{}\-–—]/g, '').trim();
}

function endsSentence(raw: string): boolean {
  return /[.!?…]$/.test(raw.trim());
}

/** Construit les blocs de sous-titres à partir des mots datés. */
export function buildCaptionBlocks(
  words: Word[],
  fps: number,
  surfaceAt: (timeS: number) => 'dark' | 'paper' = () => 'dark',
): CaptionBlock[] {
  const timed = words.filter((w) => w.start != null && w.end != null);
  const blocks: CaptionBlock[] = [];
  let cur: CaptionWord[] = [];
  let curStartS = 0;
  let line1Count = 0;
  let line1Chars = 0;
  let line2Count = 0;

  const flush = (endS: number) => {
    if (cur.length === 0) return;
    blocks.push({
      index: blocks.length,
      startFrame: Math.round(curStartS * fps),
      endFrame: Math.round(endS * fps),
      words: cur,
      surface: surfaceAt(curStartS),
    });
    cur = [];
    line1Count = line1Chars = line2Count = 0;
  };

  for (let k = 0; k < timed.length; k++) {
    const w = timed[k]!;
    const prev = timed[k - 1];
    const disp = cleanCaptionText(w.text);
    if (!disp) continue;

    // Effacement AVANT ce mot : silence > 400 ms depuis le mot précédent.
    if (prev && w.start! - prev.end! > CAPTIONS.clearAfterIdleMs / 1000 && cur.length > 0) {
      flush(prev.end! + CAPTIONS.clearAfterIdleMs / 1000);
    }

    if (cur.length === 0) curStartS = w.start!;

    // Choix de la ligne : ligne 1 jusqu'à 4 mots OU 20 caractères, puis ligne 2.
    const wouldChars = line1Chars + (line1Count > 0 ? 1 : 0) + disp.length;
    const toLine2 = line1Count >= CAPTIONS.wrapAtWords || wouldChars > CAPTIONS.wrapAtChars;
    const line: 1 | 2 = toLine2 ? 2 : 1;
    if (line === 1) {
      line1Count++;
      line1Chars = wouldChars;
    } else {
      line2Count++;
    }
    cur.push({ text: disp, appearFrame: Math.round(w.start! * fps), line });

    // Effacement APRÈS ce mot : ligne 2 pleine (4 mots) ou frontière de phrase.
    if (line2Count >= CAPTIONS.clearAtLine2Words || endsSentence(w.text)) {
      flush(w.end! + CAPTIONS.clearAfterIdleMs / 1000);
    }
  }
  // Dernier bloc.
  if (cur.length > 0) {
    const last = timed[timed.length - 1]!;
    flush(last.end! + CAPTIONS.clearAfterIdleMs / 1000);
  }
  // Un bloc ne survit jamais au démarrage du suivant (pas de chevauchement) :
  // la tenue de 400 ms ne s'applique que s'il n'y a pas de bloc suivant proche.
  for (let i = 0; i < blocks.length - 1; i++) {
    blocks[i]!.endFrame = Math.min(blocks[i]!.endFrame, blocks[i + 1]!.startFrame);
  }
  return blocks;
}

export const step07: Step = {
  id: '07',
  name: 'Sous-titres — blocs cumulatifs (données Remotion)',
  version: 2,
  inputs: () => [FILES.transcript],
  outputs: () => [FILES.captions],
  async run() {
    if (!exists(FILES.transcript)) throw new Error(`transcript.json absent : ${FILES.transcript}`);
    const t = readJson<Transcript>(FILES.transcript);
    const blocks = buildCaptionBlocks(t.words, OUTPUT.fps);
    const data: CaptionsData = { fps: OUTPUT.fps, blocks };
    writeJson(FILES.captions, data);
    const lines2 = blocks.filter((b) => b.words.some((w) => w.line === 2)).length;
    log.ok(`${blocks.length} blocs de sous-titres (${lines2} à 2 lignes).`);
  },
};
