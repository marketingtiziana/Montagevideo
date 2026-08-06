/** Tests — algèbre d'intervalles. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeIntervals, invert, subtract, overlaps, totalDuration } from './intervals.ts';

test('mergeIntervals fusionne les chevauchements et le gap', () => {
  assert.deepEqual(mergeIntervals([{ start: 0, end: 1 }, { start: 0.9, end: 2 }]), [{ start: 0, end: 2 }]);
  // Espacés de 0.1 : fusionnés seulement si gap >= 0.1.
  assert.equal(mergeIntervals([{ start: 0, end: 1 }, { start: 1.1, end: 2 }], 0.1).length, 1);
  assert.equal(mergeIntervals([{ start: 0, end: 1 }, { start: 1.2, end: 2 }], 0.1).length, 2);
});

test('overlaps est strict aux bornes', () => {
  assert.equal(overlaps({ start: 0, end: 1 }, { start: 1, end: 2 }), false);
  assert.equal(overlaps({ start: 0, end: 1 }, { start: 0.5, end: 2 }), true);
});

test('invert renvoie le complément dans [0,total]', () => {
  const keep = invert([{ start: 1, end: 2 }], 5);
  assert.deepEqual(keep, [{ start: 0, end: 1 }, { start: 2, end: 5 }]);
  assert.deepEqual(invert([], 3), [{ start: 0, end: 3 }]);
});

test('subtract retire les trous et scinde les segments', () => {
  const out = subtract([{ start: 0, end: 10 }], [{ start: 3, end: 4 }, { start: 6, end: 7 }]);
  assert.deepEqual(out, [{ start: 0, end: 3 }, { start: 4, end: 6 }, { start: 7, end: 10 }]);
});

test('totalDuration additionne les longueurs', () => {
  assert.equal(totalDuration([{ start: 0, end: 2 }, { start: 5, end: 6 }]), 3);
});
