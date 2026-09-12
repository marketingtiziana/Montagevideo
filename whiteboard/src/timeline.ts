import {SCENE1_FRAMES} from './scenes/Scene1';
import {SCENE2_FRAMES} from './scenes/Scene2';
import {SCENE3_FRAMES} from './scenes/Scene3';
import {SCENE4_FRAMES} from './scenes/Scene4';
import {SCENE5_FRAMES} from './scenes/Scene5';

export const SCENE_FRAMES = [
  SCENE1_FRAMES,
  SCENE2_FRAMES,
  SCENE3_FRAMES,
  SCENE4_FRAMES,
  SCENE5_FRAMES,
] as const;

export const SCENE_OFFSETS = SCENE_FRAMES.reduce<number[]>((acc, d, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENE_FRAMES[i - 1]);
  return acc;
}, []);

export const TOTAL_FRAMES = SCENE_FRAMES.reduce((a, b) => a + b, 0);

const at = (scene: number, local: number) => SCENE_OFFSETS[scene] + local;

/**
 * Fenetres ou quelque chose est en train de se tracer ou de s'ecrire.
 * Sert a piloter le volume du bruit de crayon. A garder synchronise avec
 * les composants de scene.
 */
export const DRAW_WINDOWS: [number, number][] = [
  [at(0, 0), at(0, 128)],
  [at(1, 0), at(1, 176)],
  [at(2, 0), at(2, 292)],
  [at(3, 0), at(3, 296)],
  [at(4, 0), at(4, 272)],
];

/** Debut de chaque balayage de gomme. */
export const ERASE_FRAMES = [
  at(0, SCENE1_FRAMES - 9),
  at(1, SCENE2_FRAMES - 9),
  at(2, SCENE3_FRAMES - 9),
  at(3, SCENE4_FRAMES - 9),
];

/** Petit "tak" de craie a la fin des mots importants. */
export const TAK_FRAMES = [
  at(0, 18), at(0, 32), at(0, 90),
  at(1, 54), at(1, 93), at(1, 122),
  at(2, 36), at(2, 185), at(2, 208), at(2, 242), at(2, 275),
  at(3, 138), at(3, 162), at(3, 228), at(3, 253),
  at(4, 32), at(4, 54), at(4, 78), at(4, 179), at(4, 202),
];
