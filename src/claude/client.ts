/**
 * client.ts — client API Claude pour les décisions éditoriales (étape 3).
 *
 * Le prompt système et les schémas Zod (coupes éditoriales + plan d'inserts)
 * sont branchés au jalon 3. Ici : construction paresseuse du client + garde
 * sur la clé API.
 */

import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getClaude(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY absent. Les décisions éditoriales (étape 3) requièrent l'API Claude.",
    );
  }
  client = new Anthropic({ apiKey });
  return client;
}

/** Modèle par défaut pour le travail éditorial. */
export const EDITORIAL_MODEL = 'claude-sonnet-5';
