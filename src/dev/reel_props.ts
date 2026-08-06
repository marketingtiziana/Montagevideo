/**
 * reel_props.ts — assemble le fichier de props Remotion pour la composition Reel
 * (démo jalon 8). Construit un plan de plans (step 08) avec 2 inserts de démo
 * (un par univers) et charge les sous-titres depuis le transcript.
 * Usage : tsx src/dev/reel_props.ts <out_props.json>
 */
import { FILES, OUTPUT } from '../config.ts';
import { readJson, writeJson, exists } from '../util/fs.ts';
import { buildShots } from '../steps/08_shots.ts';
import { buildCaptionBlocks } from '../steps/07_captions.ts';
import type { Transcript } from '../types.ts';

const [, , out] = process.argv;
if (!out) {
  console.error('Usage: tsx src/dev/reel_props.ts <out_props.json>');
  process.exit(1);
}

const DURATION_S = 15;
const durationFrames = DURATION_S * OUTPUT.fps;

// Inserts de démo (temps de SORTIE), un par univers — ~40 % de plein écran.
const inserts = [
  {
    start: 4.0,
    end: 7.0,
    universe: 'paper' as const,
    template: 'EditorialType',
    props: { line1: 'ce que tu es', line2: 'aujourd’hui', line3: 'et qui tu deviens' },
    justification: 'démo — matérialise l’opposition présent/futur du propos',
  },
  {
    start: 10.0,
    end: 12.5,
    universe: 'dark' as const,
    template: 'NotebookList',
    props: {
      columns: [
        ['qui tu es', '1. revenu', '2. habitudes', '3. quotidien'],
        ['qui tu deviens'],
      ],
    },
    justification: 'démo — l’exercice à deux colonnes décrit oralement',
  },
];

const shots = buildShots(durationFrames, inserts);

const transcript: Transcript = exists(FILES.transcript)
  ? readJson<Transcript>(FILES.transcript)
  : { language: 'fr', model: 'none', aligned: false, words: [], segments: [] };
const captions = buildCaptionBlocks(transcript.words, OUTPUT.fps);

writeJson(out, {
  facecam: 'facecam_graded.mp4',
  audio: 'audio15.wav',
  shots: shots.spans,
  captions,
});
console.log(`props Reel : ${out} — ${shots.spans.length} spans, ${(shots.stats.graphicShare * 100).toFixed(0)}% graphique, ${captions.length} blocs sous-titres.`);
for (const w of shots.stats.warnings) console.log('  ⚠ ' + w);
