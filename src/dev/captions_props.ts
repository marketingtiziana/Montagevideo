/**
 * captions_props.ts — construit le fichier de props Remotion pour CaptionsPreview
 * à partir d'un transcript (work/transcript.json). Écrit { facecam, blocks }.
 * Usage : tsx src/dev/captions_props.ts <out_props.json> [facecamFile]
 */
import { FILES, OUTPUT } from '../config.ts';
import { readJson, writeJson, exists } from '../util/fs.ts';
import { buildCaptionBlocks } from '../steps/07_captions.ts';
import type { Transcript } from '../types.ts';

const [, , out, facecam = 'facecam15.mp4'] = process.argv;
if (!out) {
  console.error('Usage: tsx src/dev/captions_props.ts <out_props.json> [facecamFile]');
  process.exit(1);
}
if (!exists(FILES.transcript)) {
  console.error(`transcript absent : ${FILES.transcript}`);
  process.exit(1);
}
const t = readJson<Transcript>(FILES.transcript);
const blocks = buildCaptionBlocks(t.words, OUTPUT.fps);
writeJson(out, { facecam, blocks });
console.log(`props écrites : ${out} (${blocks.length} blocs)`);
