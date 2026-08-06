/** Tests — construction des blocs de sous-titres. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCaptionBlocks, cleanCaptionText } from './07_captions.ts';
import type { Word } from '../types.ts';

function w(i: number, text: string, start: number, end: number): Word {
  return { i, text, start, end, score: 0.9 };
}

test('ponctuation retirée sauf apostrophes/?/!', () => {
  assert.equal(cleanCaptionText('fiscalité.'), 'fiscalité');
  assert.equal(cleanCaptionText("aujourd'hui"), "aujourd'hui");
  assert.equal(cleanCaptionText('important!'), 'important!');
  assert.equal(cleanCaptionText('quoi ?'), 'quoi ?');
});

test('passage ligne 2 à 4 mots ligne 1', () => {
  const words = [0, 1, 2, 3, 4].map((i) => w(i, `mot${i}`, i * 0.3, i * 0.3 + 0.2));
  const blocks = buildCaptionBlocks(words, 30);
  const b = blocks[0]!;
  assert.equal(b.words.filter((x) => x.line === 1).length, 4);
  assert.ok(b.words.some((x) => x.line === 2));
});

test('jamais plus de 2 lignes ni chevauchement de blocs', () => {
  const words = Array.from({ length: 20 }, (_, i) => w(i, `m${i}`, i * 0.25, i * 0.25 + 0.15));
  const blocks = buildCaptionBlocks(words, 30);
  for (const b of blocks) {
    const l1 = b.words.filter((x) => x.line === 1).length;
    const l2 = b.words.filter((x) => x.line === 2).length;
    assert.ok((l1 > 0 ? 1 : 0) + (l2 > 0 ? 1 : 0) <= 2);
    assert.ok(l1 <= 4 && l2 <= 4);
  }
  for (let i = 1; i < blocks.length; i++) {
    assert.ok(blocks[i]!.startFrame >= blocks[i - 1]!.endFrame, 'blocs non chevauchants');
  }
});

test('frontière de phrase referme le bloc', () => {
  const words = [w(0, 'un', 0, 0.2), w(1, 'sujet.', 0.22, 0.5), w(2, 'ensuite', 0.55, 0.9)];
  const blocks = buildCaptionBlocks(words, 30);
  assert.ok(blocks.length >= 2);
});
