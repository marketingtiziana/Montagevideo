/** Tests — plan de plans & rythme + mapping source→sortie. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildShots, mapSourceToOutput } from './08_shots.ts';
import type { Edl } from '../types.ts';

test('recadrages facecam alternent sans répétition consécutive', () => {
  const shots = buildShots(15 * 30, []);
  const face = shots.spans.filter((s) => s.kind === 'facecam');
  for (let i = 1; i < face.length; i++) {
    assert.notEqual(face[i]!.scale, face[i - 1]!.scale, 'jamais deux fois la même valeur');
  }
});

test('aucun plan ne dépasse 6 s', () => {
  const shots = buildShots(30 * 30, []);
  for (const s of shots.spans) {
    assert.ok(s.endFrame - s.startFrame <= 6 * 30 + 1, `plan trop long à ${s.startFrame}`);
  }
});

test('les inserts sont placés et la part graphique calculée', () => {
  const inserts = [
    { start: 4, end: 7, universe: 'paper' as const, template: 'EditorialType', justification: 'x' },
    { start: 10, end: 12.5, universe: 'dark' as const, template: 'NotebookList', justification: 'y' },
  ];
  const shots = buildShots(15 * 30, inserts);
  const ins = shots.spans.filter((s) => s.kind === 'insert');
  assert.equal(ins.length, 2);
  // 5.5s / 15s ≈ 0.367.
  assert.ok(Math.abs(shots.stats.graphicShare - 5.5 / 15) < 0.01);
  // Pas de chevauchement insert/facecam.
  const sorted = [...shots.spans].sort((a, b) => a.startFrame - b.startFrame);
  for (let i = 1; i < sorted.length; i++) {
    assert.ok(sorted[i]!.startFrame >= sorted[i - 1]!.endFrame, 'spans non chevauchants');
  }
});

test('mapSourceToOutput respecte les segments de l’EDL', () => {
  const edl = {
    fps: 30, crossfadeMs: 18,
    segments: [
      { srcStart: 0, srcEnd: 2, srcStartFrame: 0, srcEndFrame: 60, outStart: 0, outEnd: 2 },
      { srcStart: 5, srcEnd: 8, srcStartFrame: 150, srcEndFrame: 240, outStart: 2, outEnd: 5 },
    ],
    stats: { sourceDurationS: 8, finalDurationS: 5, compressionRatio: 5 / 8, cutCount: 1, segmentCount: 2, warnings: [] },
  } satisfies Edl;
  assert.equal(mapSourceToOutput(edl, 1), 1); // dans le 1er segment
  assert.equal(mapSourceToOutput(edl, 6), 3); // 5→out2, +1 = 3
  assert.equal(mapSourceToOutput(edl, 3.5), null); // dans une coupe
});
