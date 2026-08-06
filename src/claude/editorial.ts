/**
 * editorial.ts — décisions éditoriales de Claude (étape 3).
 *
 * Envoie le transcript horodaté à l'API Claude et récupère un JSON strict
 * (validé par Zod) : coupes éditoriales, keep_overrides, chapitres, et le plan
 * des inserts (§10). Chaque insert doit porter une `justification` liée au
 * transcript.
 *
 * Sans ANTHROPIC_API_KEY, renvoie null : le pipeline se rabat sur les
 * détections acoustique + lexicale (dégradé, mais fonctionnel).
 */

import path from 'node:path';
import { getClaude, EDITORIAL_MODEL } from './client.ts';
import { EditorialSchema, type Editorial } from './schemas.ts';
import type { Transcript } from '../types.ts';
import { CLEAN, DIRS } from '../config.ts';
import { readJson, exists } from '../util/fs.ts';
import { log } from '../util/log.ts';

/**
 * Override manuel des décisions éditoriales : un JSON (même schéma que la sortie
 * Claude) que l'on fournit à la main. Permet de faire tourner l'étape 3 SANS
 * clé API — Claude (l'agent) rédige ce fichier depuis le transcript.
 * Chemin par défaut : work/editorial_manual.json (ou env EDITORIAL_MANUAL).
 */
function manualPath(): string {
  return process.env.EDITORIAL_MANUAL ?? path.join(DIRS.work, 'editorial_manual.json');
}

function loadManual(): Editorial | null {
  const p = manualPath();
  if (!exists(p)) return null;
  const parsed = EditorialSchema.safeParse(readJson(p));
  if (!parsed.success) {
    log.error(`editorial_manual.json invalide : ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}`);
    throw new Error('Override éditorial manuel invalide (Zod).');
  }
  log.ok(`Décisions éditoriales manuelles : ${parsed.data.cuts.length} coupes, ${parsed.data.inserts.length} inserts (${p}).`);
  return parsed.data;
}

const SYSTEM_PROMPT = [
  'Tu es un monteur de podcast professionnel.',
  'Objectif : un rythme serré, sans dénaturer la parole.',
  'Tu repères les faux départs, répétitions, bafouillages, phrases abandonnées,',
  'silences morts, bruits parasites, hors-sujet et fillers isolés.',
  'Tu signales les pauses volontaires (respiration, effet) dans keep_overrides,',
  'pour qu\'elles ne soient PAS coupées.',
  'Tu proposes aussi un plan d\'inserts plein écran (jamais superposés au visage),',
  'sobres et achromatiques, chacun JUSTIFIÉ par le propos du transcript.',
  `Valeurs de reason autorisées : ${CLEAN.reasons.join(', ')}.`,
  'Réponds UNIQUEMENT par un objet JSON valide, sans texte autour.',
].join(' ');

function buildUserPrompt(t: Transcript): string {
  const words = t.words
    .map((w) => `${w.i}:${w.start?.toFixed(2) ?? '?'}-${w.end?.toFixed(2) ?? '?'} ${w.text}`)
    .join('\n');
  return [
    'Transcript mot à mot (index:start-end texte), en secondes :',
    words,
    '',
    'Rends un JSON avec ces clés :',
    '- cuts: [{start,end,reason,confidence}]  (segments à retirer)',
    '- keep_overrides: [{start,end,reason}]   (pauses volontaires à garder)',
    '- chapters: [{start,end,label}]',
    '- inserts: [{start,end,universe:"paper"|"dark",template,assets?,text?,columns?,justification}]',
    'Templates: CollageSubject, CollageScene, EditorialType, NotebookList, ObjectReveal.',
    'Chaque insert DOIT avoir une justification liée au transcript.',
  ].join('\n');
}

/** Extrait le premier bloc JSON d'une réponse texte. */
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1]! : text;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('Aucun JSON dans la réponse Claude.');
  return JSON.parse(raw.slice(start, end + 1));
}

export async function getEditorialDecisions(t: Transcript): Promise<Editorial | null> {
  // 1) Override manuel prioritaire (fonctionne sans clé API).
  const manual = loadManual();
  if (manual) return manual;

  // 2) Sinon appel API si une clé est disponible.
  if (!process.env.ANTHROPIC_API_KEY) {
    log.warn('Ni editorial_manual.json ni ANTHROPIC_API_KEY : étape éditoriale ignorée (dégradé acoustique+lexical).');
    return null;
  }
  const client = getClaude();
  log.info(`Décisions éditoriales via ${EDITORIAL_MODEL}…`);
  const msg = await client.messages.create({
    model: EDITORIAL_MODEL,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(t) }],
  });
  const textPart = msg.content.find((c) => c.type === 'text');
  const text = textPart && 'text' in textPart ? textPart.text : '';
  const parsed = extractJson(text);
  const result = EditorialSchema.safeParse(parsed);
  if (!result.success) {
    log.error(`Réponse éditoriale invalide : ${result.error.issues.map((i) => i.path.join('.')).join(', ')}`);
    throw new Error('Validation Zod de la réponse éditoriale échouée.');
  }
  log.ok(`Claude : ${result.data.cuts.length} coupes, ${result.data.inserts.length} inserts.`);
  return result.data;
}
