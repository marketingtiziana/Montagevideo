/** Tests — détection lexicale des fillers. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectLexicalCuts } from './lexical.ts';
import type { Word } from '../types.ts';

function w(i: number, text: string, start: number, end: number): Word {
  return { i, text, start, end, score: 0.9 };
}

test('retire un "euh" isolé', () => {
  const words = [w(0, 'euh', 0.3, 0.55), w(1, 'alors', 1.0, 1.4)];
  const cuts = detectLexicalCuts(words);
  assert.equal(cuts.length, 1);
  assert.equal(cuts[0]!.reason, 'filler');
});

test('retire "en fait" répété (deux occurrences)', () => {
  const words = [
    w(0, 'parler', 0.0, 0.4),
    w(1, 'en', 0.45, 0.55), w(2, 'fait', 0.56, 0.8),
    w(3, 'important', 0.85, 1.2),
    w(4, 'en', 1.25, 1.35), w(5, 'fait', 1.36, 1.6),
    w(6, 'utile', 1.65, 2.0),
  ];
  const cuts = detectLexicalCuts(words);
  // Les deux "en fait" sont répétés → retirés (2 coupes).
  assert.equal(cuts.filter((c) => c.reason === 'repetition').length, 2);
});

test('garde "en fait" unique dans une phrase construite (pas isolé)', () => {
  const words = [
    w(0, 'parler', 0.0, 0.4),
    w(1, 'en', 0.42, 0.52), w(2, 'fait', 0.53, 0.75),
    w(3, 'important', 0.77, 1.2),
  ];
  const cuts = detectLexicalCuts(words);
  assert.equal(cuts.length, 0);
});

test('retire "voilà" en fin de proposition', () => {
  const words = [w(0, 'important', 0.0, 0.5), w(1, 'voilà', 1.0, 1.6)];
  const cuts = detectLexicalCuts(words);
  assert.equal(cuts.length, 1);
});
