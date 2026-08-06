/** loudness.ts — mesure de loudness via ffmpeg loudnorm (analyse JSON). */

import { run } from './exec.ts';

export interface LoudnessMeasure {
  I: number; // LUFS intégré
  LRA: number; // LU
  TP: number; // dBTP
  thresh: number;
}

/** Extrait le bloc JSON imprimé par loudnorm sur stderr. */
function parseLoudnormJson(stderr: string): Record<string, string> {
  const start = stderr.lastIndexOf('{');
  const end = stderr.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('Bloc JSON loudnorm introuvable.');
  return JSON.parse(stderr.slice(start, end + 1));
}

/**
 * Mesure I/LRA/TP d'un fichier via une passe loudnorm en analyse
 * (print_format=json). Renvoie les valeurs `input_*` = mesure du fichier.
 */
export async function measureLoudness(wav: string, preFilter = ''): Promise<LoudnessMeasure> {
  const af = `${preFilter ? preFilter + ',' : ''}loudnorm=I=-14:LRA=4:TP=-1:print_format=json`;
  const { stderr } = await run(
    'ffmpeg',
    ['-hide_banner', '-i', wav, '-af', af, '-f', 'null', '-'],
    { quiet: true, allowFail: true },
  );
  const j = parseLoudnormJson(stderr);
  return {
    I: Number(j.input_i),
    LRA: Number(j.input_lra),
    TP: Number(j.input_tp),
    thresh: Number(j.input_thresh),
  };
}

/** Passe 1 (mesure) pour un loudnorm deux-passes, précédée de la chaîne. */
export async function loudnormMeasure(wav: string, chain: string): Promise<Record<string, string>> {
  const af = `${chain},loudnorm=I=-14:LRA=4:TP=-1:print_format=json`;
  const { stderr } = await run(
    'ffmpeg',
    ['-hide_banner', '-i', wav, '-af', af, '-f', 'null', '-'],
    { quiet: true, allowFail: true },
  );
  return parseLoudnormJson(stderr);
}
