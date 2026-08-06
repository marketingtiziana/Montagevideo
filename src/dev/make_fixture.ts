/**
 * make_fixture.ts — génère un transcript.json synthétique + un WAV cohérent,
 * pour VALIDER les étapes 3 et 4 sans WhisperX ni API Claude.
 *
 * Usage : tsx src/dev/make_fixture.ts <transcript.json> <source.wav>
 * Le WAV contient un ton pendant chaque mot et un plancher de bruit pendant les
 * silences, aux mêmes horodatages que le transcript (détection acoustique réelle).
 */

import fs from 'node:fs';
import path from 'node:path';
import type { Word } from '../types.ts';

// Monologue FR synthétique. Cas couverts : "euh" isolé, "en fait" répété,
// "voilà" en fin, un faux départ, des mots collés, et une pause interne 500 ms.
const script: Array<[string, number, number]> = [
  ['euh', 0.30, 0.55], // filler isolé (pause avant/après)
  ['alors', 1.00, 1.35],
  ['aujourd’hui', 1.38, 1.95],
  ['je', 1.98, 2.08],
  ['vais', 2.10, 2.30],
  ['vous', 2.32, 2.48],
  ['parler', 2.50, 2.90],
  ['en', 2.95, 3.08], // "en fait" #1 (répété plus bas)
  ['fait', 3.10, 3.35],
  ['de', 3.40, 3.52],
  ['la', 3.54, 3.66],
  ['fiscalité', 3.70, 4.40],
  // longue pause volontaire/silence 0.5 s ici (4.40 -> 4.90) -> clamp à 220 ms
  ['c’est', 4.90, 5.15],
  ['un', 5.17, 5.30],
  ['sujet', 5.33, 5.75],
  ['en', 6.20, 6.33], // "en fait" #2 (répété -> retiré)
  ['fait', 6.35, 6.60],
  ['important', 6.65, 7.30],
  ['je', 7.60, 7.72], // faux départ court
  ['je', 7.85, 8.30], // répétition immédiate du même mot
  ['veux', 8.33, 8.55],
  ['dire', 8.58, 8.85],
  ['voilà', 9.30, 9.90], // "voilà" en fin de proposition
];

function buildWords(): Word[] {
  return script.map(([text, start, end], i) => ({ i, text, start, end, score: 0.9 }));
}

function writeWav(wavPath: string, words: Word[]): void {
  const sr = 48000;
  const total = Math.max(...words.map((w) => w.end!)) + 0.3;
  const n = Math.floor(total * sr);
  const int = new Int32Array(n); // valeurs 24 bits signées
  const amp = 0.3;
  const noise = 0.0005; // ~ -66 dBFS
  for (let s = 0; s < n; s++) {
    const t = s / sr;
    const inWord = words.some((w) => t >= w.start! && t < w.end!);
    let v = inWord ? amp * Math.sin(2 * Math.PI * 220 * t) : (Math.random() * 2 - 1) * noise;
    int[s] = Math.max(-1, Math.min(1, v)) * (2 ** 23 - 1);
  }
  // En-tête WAV PCM s24le mono.
  const bytesPerSample = 3;
  const dataLen = n * bytesPerSample;
  const buf = Buffer.alloc(44 + dataLen);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + dataLen, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(sr * bytesPerSample, 28); buf.writeUInt16LE(bytesPerSample, 32);
  buf.writeUInt16LE(24, 34);
  buf.write('data', 36); buf.writeUInt32LE(dataLen, 40);
  let off = 44;
  for (let s = 0; s < n; s++) {
    const v = int[s]! & 0xffffff;
    buf[off++] = v & 0xff; buf[off++] = (v >> 8) & 0xff; buf[off++] = (v >> 16) & 0xff;
  }
  fs.mkdirSync(path.dirname(wavPath), { recursive: true });
  fs.writeFileSync(wavPath, buf);
}

const [, , transcriptOut, wavOut] = process.argv;
if (!transcriptOut || !wavOut) {
  console.error('Usage: tsx src/dev/make_fixture.ts <transcript.json> <source.wav>');
  process.exit(1);
}
const words = buildWords();
fs.mkdirSync(path.dirname(transcriptOut), { recursive: true });
fs.writeFileSync(
  transcriptOut,
  JSON.stringify(
    { language: 'fr', model: 'synthetic-fixture', aligned: true, words, segments: [] },
    null,
    2,
  ) + '\n',
);
writeWav(wavOut, words);
console.log(`Fixture écrite : ${transcriptOut} (${words.length} mots) + ${wavOut}`);
