import m1 from '../../../output/mindmaps/01-quitter-la-france/mindmap.json'
import m2 from '../../../output/mindmaps/02-residence-fiscale/mindmap.json'
import type { MindMap } from './types'

/** Original versions (structured JSON, the source of truth shipped with the app). */
export const SEED_MAPS: MindMap[] = [m1 as MindMap, m2 as MindMap]
export const seedMap = (id: string) => SEED_MAPS.find((m) => m.id === id)
