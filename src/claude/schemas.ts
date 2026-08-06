/**
 * schemas.ts — schémas Zod validant la sortie éditoriale de Claude (étape 3).
 * Contrat strict imposé par la spec (§5 et §10).
 */

import { z } from 'zod';

export const ReasonEnum = z.enum([
  'filler',
  'faux_depart',
  'repetition',
  'bafouillage',
  'phrase_abandonnee',
  'silence_mort',
  'bruit_parasite',
  'hors_sujet',
]);

export const CutSchema = z.object({
  start: z.number(),
  end: z.number(),
  reason: ReasonEnum,
  confidence: z.number().min(0).max(1),
});

export const KeepOverrideSchema = z.object({
  start: z.number(),
  end: z.number(),
  reason: z.string(),
});

export const ChapterSchema = z.object({
  start: z.number(),
  end: z.number(),
  label: z.string(),
});

export const InsertUniverseEnum = z.enum(['paper', 'dark']);
export const InsertTemplateEnum = z.enum([
  'CollageSubject',
  'CollageScene',
  'EditorialType',
  'NotebookList',
  'ObjectReveal',
]);

export const InsertSchema = z.object({
  start: z.number(),
  end: z.number(),
  universe: InsertUniverseEnum,
  template: InsertTemplateEnum,
  assets: z.array(z.string()).optional(),
  text: z.string().nullable().optional(),
  columns: z.array(z.array(z.string())).optional(),
  // Chaque insert DOIT être justifié par le transcript, sinon refus au QA.
  justification: z.string().min(1),
});

export const EditorialSchema = z.object({
  cuts: z.array(CutSchema),
  keep_overrides: z.array(KeepOverrideSchema),
  chapters: z.array(ChapterSchema),
  inserts: z.array(InsertSchema),
});

export type Editorial = z.infer<typeof EditorialSchema>;
export type Cut = z.infer<typeof CutSchema>;
export type Insert = z.infer<typeof InsertSchema>;
