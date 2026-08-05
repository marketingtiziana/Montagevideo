/**
 * Minimal Claude API client (no SDK dependency; uses fetch). Handles retry
 * with exponential backoff and strict JSON extraction. The editorial step
 * asks for raw JSON (no preamble, no backticks) and validates it with Zod.
 */
import { warn } from './log.js';

const API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = process.env.CLAUDE_MODEL ?? 'claude-sonnet-5';
const VERSION = '2023-06-01';

export interface ClaudeCallOpts {
  system: string;
  user: string;
  maxTokens?: number;
  model?: string;
  temperature?: number;
}

interface AnthropicResponse {
  content: Array<{ type: string; text?: string }>;
}

/** Strip accidental ```json fences / preamble and return the JSON substring. */
export function extractJson(raw: string): string {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first >= 0 && last > first) s = s.slice(first, last + 1);
  return s;
}

async function callOnce(opts: ClaudeCallOpts): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Export it before running the analyze step ' +
        '(or run with --dry-run-edl on cached analysis).',
    );
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': VERSION,
    },
    body: JSON.stringify({
      model: opts.model ?? DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? 4096,
      temperature: opts.temperature ?? 0,
      system: opts.system,
      messages: [{ role: 'user', content: opts.user }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude API ${res.status}: ${body.slice(0, 500)}`);
  }
  const data = (await res.json()) as AnthropicResponse;
  return data.content
    .filter((c) => c.type === 'text')
    .map((c) => c.text ?? '')
    .join('');
}

/** Call Claude, parse+validate with `validate`, retry up to `retries` times. */
export async function callClaudeJson<T>(
  opts: ClaudeCallOpts,
  validate: (json: unknown) => T,
  retries = 3,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const raw = await callOnce(opts);
      const json = JSON.parse(extractJson(raw));
      return validate(json);
    } catch (e) {
      lastErr = e;
      const backoff = Math.min(16000, 2000 * 2 ** attempt);
      warn('claude', `attempt ${attempt + 1} failed: ${(e as Error).message}. retry in ${backoff}ms`);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw new Error(`Claude call failed after ${retries + 1} attempts: ${(lastErr as Error)?.message}`);
}
