/**
 * neutralityLint.ts — lint de neutralité chromatique (§11.1).
 *
 * Échoue si un composant d'insert contient une valeur de couleur dont les
 * canaux R, G, B diffèrent. Toute la palette des inserts doit être achromatique.
 *
 * Scanne remotion/components/inserts/**. Détecte les hex (#RGB / #RRGGBB) et
 * les rgb()/rgba(). Ignore les commentaires n'introduisant pas de couleur.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { log } from '../util/log.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INSERTS_DIR = path.resolve(__dirname, '..', '..', 'remotion', 'components', 'inserts');

interface Violation {
  file: string;
  line: number;
  value: string;
}

function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function isAchromatic(r: number, g: number, b: number): boolean {
  return r === g && g === b;
}

function scanFile(file: string): Violation[] {
  const out: Violation[] = [];
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const hexRe = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/g;
  const rgbRe = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
  lines.forEach((ln, i) => {
    for (const m of ln.matchAll(hexRe)) {
      const rgb = hexToRgb(m[0]);
      if (rgb && !isAchromatic(...rgb)) out.push({ file, line: i + 1, value: m[0] });
    }
    for (const m of ln.matchAll(rgbRe)) {
      const r = Number(m[1]), g = Number(m[2]), b = Number(m[3]);
      if (!isAchromatic(r, g, b)) out.push({ file, line: i + 1, value: m[0] + ')' });
    }
  });
  return out;
}

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

function main(): void {
  const files = walk(INSERTS_DIR);
  const violations = files.flatMap(scanFile);
  if (violations.length === 0) {
    log.ok(`Neutralité : ${files.length} fichier(s) d'insert, aucune couleur non achromatique.`);
    return;
  }
  for (const v of violations) {
    log.error(`${path.relative(process.cwd(), v.file)}:${v.line} couleur non achromatique : ${v.value}`);
  }
  log.error(`Neutralité : ${violations.length} violation(s).`);
  process.exitCode = 1;
}

main();
