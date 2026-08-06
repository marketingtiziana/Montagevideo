/** Tests — utilitaires audio (RMS adaptatif, zero-crossing). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rmsSilenceWindows, nearestZeroCrossing } from './audio.ts';

test('rmsSilenceWindows détecte les fenêtres silencieuses (seuil adaptatif)', () => {
  const sr = 48000;
  const n = sr; // 1 s
  const s = new Float32Array(n);
  // Moitié 1 = ton fort, moitié 2 = quasi silence.
  for (let i = 0; i < n; i++) {
    s[i] = i < n / 2 ? 0.3 * Math.sin((2 * Math.PI * 220 * i) / sr) : 0.0005 * (i % 2 ? 1 : -1);
  }
  const { intervals, noiseFloorDb, thresholdDb } = rmsSilenceWindows(s, sr, 20, 8);
  assert.ok(noiseFloorDb < -50, `plancher de bruit estimé bas (${noiseFloorDb})`);
  assert.ok(thresholdDb < -40);
  // Il doit exister un intervalle de silence dans la 2e moitié.
  assert.ok(intervals.some((iv) => iv.start >= 0.5), 'silence détecté dans la 2e moitié');
});

test('nearestZeroCrossing ramène sur un passage par zéro', () => {
  const sr = 48000;
  const n = 2000;
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = Math.sin((2 * Math.PI * 100 * i) / sr); // ~zéro tous les 240 échantillons
  const t = 500 / sr;
  const zc = nearestZeroCrossing(s, sr, t, 8);
  const idx = Math.round(zc * sr);
  // Au point trouvé, le signe change entre idx-1 et idx.
  assert.ok(s[idx - 1]! === 0 || s[idx]! === 0 || Math.sign(s[idx - 1]!) !== Math.sign(s[idx]!));
});
