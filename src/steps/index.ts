/** steps/index.ts — registre ordonné des étapes du pipeline. */

import type { Step } from '../pipeline.ts';
import { step01 } from './01_normalize.ts';
import { step02 } from './02_transcribe.ts';
import { step03 } from './03_clean.ts';
import { step04 } from './04_edl.ts';
import { step05 } from './05_cut.ts';
import { step06 } from './06_master_audio.ts';
import { step07 } from './07_captions.ts';
import { step08 } from './08_shots.ts';
import { step09 } from './09_render.ts';

export const STEPS: Step[] = [
  step01, step02, step03, step04, step05, step06, step07, step08, step09,
];
