/**
 * Step 3 — editorial analysis. Three sources of truth, never one alone:
 *   5.1 acoustic (silencedetect, no-word-overlap)
 *   5.2 lexical fillers (isolated only)
 *   5.3 Claude editorial pass (faux departs, repetitions, beats, inserts)
 * then 5.4 fusion with priority keep_overrides > claude > lexical > acoustic.
 *
 * Idempotent via analysis.json. When ANTHROPIC_API_KEY is missing the Claude
 * pass is skipped with a warning and only acoustic+lexical are used, so the
 * pipeline still produces an EDL for --dry-run-edl inspection.
 */
import type { RunContext } from '../lib/cache.js';
import { readArtifact, writeArtifact } from '../lib/cache.js';
import type { Analysis, Cut, Probe, Transcript } from '../lib/types.js';
import { detectSilencesAcoustic, acousticCuts, lexicalCuts } from '../lib/detectors.js';
import { callClaudeJson } from '../lib/claude.js';
import { AnalysisSchema } from '../lib/schema.js';
import { mergeIntervals } from '../lib/timecode.js';
import { log, info, ok, warn } from '../lib/log.js';

const TAG = '03-analyze';

const SYSTEM_PROMPT = `Tu es un monteur professionnel de podcast et de reels courts.
Objectif : resserrer le rythme SANS dénaturer la parole. Règles :
- préserver les respirations naturelles courtes ;
- ne JAMAIS couper au milieu d'une idée ;
- signaler les pauses volontaires (effet dramatique) comme keep_overrides ;
- proposer des beats (hook_end, punchline, chapter, topic_change) pour piloter le cadrage ;
- proposer des inserts graphiques UNIQUEMENT quand le propos le justifie (un chiffre cité,
  une comparaison, une citation, une énumération, un nom/rôle), avec une justification liée au transcript.
Tu réponds STRICTEMENT en JSON, sans préambule, sans backticks.`;

function buildUserPrompt(transcript: Transcript, maxDuration: number | null): string {
  const words = transcript.words
    .map((w) => `${w.i}\t${w.start.toFixed(2)}\t${w.end.toFixed(2)}\t${w.text}`)
    .join('\n');
  const durNote = maxDuration
    ? `\nLe reel final doit tenir en ${maxDuration}s max : privilégie les coupes qui gardent le hook et les punchlines.`
    : '';
  return `Transcript mot à mot (index, start, end, texte), langue=${transcript.language} :

${words}

Rends un JSON avec exactement ces clés :
{
  "cuts": [ { "start": s, "end": s, "reason": "filler|faux_depart|repetition|bafouillage|phrase_abandonnee|silence_mort|bruit_parasite|hors_sujet", "confidence": 0..1, "text": "..." } ],
  "keep_overrides": [ { "start": s, "end": s, "reason": "..." } ],
  "beats": [ { "t": s, "type": "hook_end|punchline|chapter|topic_change" } ],
  "inserts": [ { "start": s, "duration": 2..5, "type": "StatCard|ComparisonBar|LowerThird|KeywordPop|QuoteBlock|ChecklistReveal|TimelineBar|Shape3D", "props": {}, "anchor": "top|bottom|left|right", "justification": "..." } ]
}${durNote}`;
}

export async function stepAnalyze(
  ctx: RunContext,
  probe: Probe,
  transcript: Transcript,
): Promise<Analysis> {
  const cached = readArtifact<Analysis>(ctx, 'analysis.json');
  if (cached) {
    info(TAG, 'cache hit, skipping (analysis.json)');
    return cached;
  }

  log(TAG, 'acoustic + lexical detection');
  const silences = await detectSilencesAcoustic(probe.workAudio);
  const acoustic = acousticCuts(silences, transcript.words);
  const lexical = lexicalCuts(transcript.words);
  info(TAG, `acoustic=${acoustic.length} lexical=${lexical.length} silence-spans=${silences.length}`);

  // 5.3 Claude editorial pass
  let claude: Analysis = { version: 1, cuts: [], keep_overrides: [], beats: [], inserts: [] };
  if (process.env.ANTHROPIC_API_KEY) {
    log(TAG, 'Claude editorial pass');
    const parsed = await callClaudeJson(
      { system: SYSTEM_PROMPT, user: buildUserPrompt(transcript, ctx.params.maxDuration) },
      (json) => AnalysisSchema.parse(json),
    );
    claude = {
      version: 1,
      cuts: parsed.cuts.map((c) => ({ ...c, source: 'claude' as const })),
      keep_overrides: parsed.keep_overrides,
      beats: parsed.beats,
      inserts: parsed.inserts,
    };
    info(TAG, `claude cuts=${claude.cuts.length} beats=${claude.beats.length} inserts=${claude.inserts.length}`);
  } else {
    warn(TAG, 'ANTHROPIC_API_KEY unset — skipping Claude pass (acoustic+lexical only)');
  }

  // 5.4 fusion with priority. Higher priority cuts win; keep_overrides veto.
  const fused = fuseCuts([...claude.cuts, ...lexical, ...acoustic], claude.keep_overrides);

  const analysis: Analysis = {
    version: 1,
    cuts: fused,
    keep_overrides: claude.keep_overrides,
    beats: claude.beats,
    inserts: claude.inserts,
  };
  writeArtifact(ctx, 'analysis.json', analysis);
  ok(TAG, `fused ${fused.length} cuts, ${analysis.keep_overrides.length} keep-overrides, ${analysis.inserts.length} inserts`);
  return analysis;
}

/**
 * Priority: keep_overrides > claude > lexical > acoustic. Overlapping/near
 * (<120ms) cuts merge; a cut that intersects a keep_override is dropped.
 */
export function fuseCuts(cuts: Cut[], keepOverrides: Array<{ start: number; end: number }>): Cut[] {
  const rank = { claude: 3, lexical: 2, acoustic: 1 } as const;

  // Drop anything intersecting a protected span.
  const protectedSpans = keepOverrides;
  const survivors = cuts.filter(
    (c) => !protectedSpans.some((k) => c.start < k.end && c.end > k.start),
  );

  // Merge within 120ms, keeping the highest-priority reason/confidence.
  const merged = mergeIntervals(
    survivors.map((c) => ({ ...c })),
    120,
  );

  // mergeIntervals keeps the first element's metadata; re-annotate by scanning
  // all survivors that fall inside each merged span for the strongest source.
  return merged.map((m) => {
    const inside = survivors.filter((c) => c.start < m.end && c.end > m.start);
    const best = inside.sort(
      (a, b) =>
        (rank[b.source ?? 'acoustic'] - rank[a.source ?? 'acoustic']) ||
        b.confidence - a.confidence,
    )[0];
    return {
      start: m.start,
      end: m.end,
      reason: best?.reason ?? 'silence_mort',
      confidence: best?.confidence ?? 0.4,
      text: best?.text,
      source: best?.source,
    };
  });
}
