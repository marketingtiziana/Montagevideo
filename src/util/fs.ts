/** fs.ts — helpers de système de fichiers et de hachage. */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function exists(p: string): boolean {
  return fs.existsSync(p);
}

export function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, 'utf8')) as T;
}

export function writeJson(p: string, data: unknown): void {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}

/** Hash SHA-256 (16 hex) du contenu d'un fichier. */
export function hashFile(p: string): string {
  const buf = fs.readFileSync(p);
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);
}

/** Hash SHA-256 (16 hex) d'une valeur sérialisable. */
export function hashValue(v: unknown): string {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
}
