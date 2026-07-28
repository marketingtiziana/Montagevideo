// Phase 0 — installe whisper.cpp + télécharge le(s) modèle(s)
import { installWhisperCpp, downloadWhisperModel } from '@remotion/install-whisper-cpp';
import path from 'node:path';

const to = path.join(process.cwd(), 'whisper-cpp');
const version = '1.5.5';

console.log('[whisper] install whisper.cpp ->', to);
await installWhisperCpp({ to, version });

const models = process.argv.slice(2);
const list = models.length ? models : ['large-v3'];
for (const model of list) {
  console.log('[whisper] download model:', model);
  await downloadWhisperModel({ model, folder: to });
}
console.log('[whisper] done');
