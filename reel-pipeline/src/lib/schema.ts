/**
 * Zod schemas that validate everything Claude returns. Claude output is never
 * trusted raw: it is parsed against these, and a failure retries the call.
 */
import { z } from 'zod';

export const CutReasonSchema = z.enum([
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
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
  reason: CutReasonSchema,
  confidence: z.number().min(0).max(1),
  text: z.string().optional(),
}).refine((c) => c.end > c.start, { message: 'end must be > start' });

export const KeepOverrideSchema = z.object({
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
  reason: z.string(),
});

export const BeatSchema = z.object({
  t: z.number().nonnegative(),
  type: z.enum(['hook_end', 'punchline', 'chapter', 'topic_change']),
});

export const InsertTypeSchema = z.enum([
  'StatCard',
  'ComparisonBar',
  'LowerThird',
  'KeywordPop',
  'QuoteBlock',
  'ChecklistReveal',
  'TimelineBar',
  'Shape3D',
]);

export const InsertSchema = z.object({
  start: z.number().nonnegative(),
  duration: z.number().min(2).max(5),
  type: InsertTypeSchema,
  props: z.record(z.unknown()),
  anchor: z.enum(['top', 'bottom', 'left', 'right']),
  justification: z.string().min(1),
});

export const AnalysisSchema = z.object({
  cuts: z.array(CutSchema).default([]),
  keep_overrides: z.array(KeepOverrideSchema).default([]),
  beats: z.array(BeatSchema).default([]),
  inserts: z.array(InsertSchema).default([]),
});

export type AnalysisParsed = z.infer<typeof AnalysisSchema>;
